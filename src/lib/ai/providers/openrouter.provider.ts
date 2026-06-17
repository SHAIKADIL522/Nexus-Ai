import { OPENROUTER_MODELS } from './models';
import type { ProviderMessage, CompletionOptions } from './nvidia.provider';

const BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_TIMEOUT_MS = 20000;

// Known-free OpenRouter slugs as of mid-2026. Verify current list at openrouter.ai/models (filter: free).
// Tried in order until one returns 200. Avoids hardcoding a single slug that silently goes paid-only.
const FREE_FALLBACK_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

function normalizeModel(model: string): string {
  let m = model;
  if (m.startsWith('meta/')) m = m.replace('meta/', 'meta-llama/');
  if (m.startsWith('nvidia/')) m = OPENROUTER_MODELS.reasoning;
  return m;
}

async function callOpenRouter(
  model: string,
  messages: ProviderMessage[],
  options: CompletionOptions,
  apiKey: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL ?? 'https://nexus-ai.vercel.app',
        'X-Title': 'Nexus AI',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens:  options.maxTokens  ?? 1024,
        temperature: options.temperature ?? 0.7,
        stream:      options.stream      ?? true,
      }),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function openRouterComplete(
  messages: ProviderMessage[],
  options: CompletionOptions = {}
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requestedModel = normalizeModel(options.model ?? OPENROUTER_MODELS.default);

  // try requested model first, then walk the known-free list if it 404s/429s
  const candidates = [requestedModel, ...FREE_FALLBACK_MODELS.filter(m => m !== requestedModel)];

  async function attemptAll(): Promise<{ res: Response | null; lastErr: string; retryAfterMs: number | null }> {
    let lastErr = '';
    let retryAfterMs: number | null = null;
    for (const model of candidates) {
      let res: Response;
      try {
        res = await callOpenRouter(model, messages, options, apiKey, timeoutMs);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastErr = `OpenRouter timed out after ${timeoutMs}ms (model: ${model})`;
          continue;
        }
        throw err;
      }

      if (res.ok) return { res, lastErr: '', retryAfterMs: null };

      const text = await res.text().catch(() => '');
      lastErr = `OpenRouter error ${res.status}: ${text}`;

      if (res.status === 429) {
        // Parse the server's actual retry hint instead of guessing. Prefer header, fall back to body field.
        const headerVal = Number(res.headers.get('Retry-After'));
        let bodyVal: number | null = null;
        try {
          const parsed = JSON.parse(text);
          bodyVal = Number(parsed?.error?.metadata?.retry_after_seconds);
        } catch { /* not JSON, ignore */ }
        const seconds = !Number.isNaN(headerVal) && headerVal > 0 ? headerVal
          : (bodyVal && !Number.isNaN(bodyVal) ? bodyVal : 10);
        retryAfterMs = Math.max(retryAfterMs ?? 0, seconds * 1000);
      }

      // 404 (paid-only/deprecated slug) or 429 (rate-limited, common on shared free tier)
      // → try next candidate. Any other status (401, 500...) → fail immediately, retrying won't help.
      if (res.status !== 404 && res.status !== 429) {
        throw new Error(lastErr);
      }
    }
    return { res: null, lastErr, retryAfterMs };
  }

  // First pass across all candidates.
  let { res, lastErr, retryAfterMs } = await attemptAll();
  if (res) return res;

  // If the pool was rate-limited, wait exactly as long as the server said, then retry once.
  // Cap the wait so we don't blow past the client's own abort timeout (research page uses 45s).
  if (retryAfterMs !== null) {
    const wait = Math.min(retryAfterMs, 25000);
    await new Promise(r => setTimeout(r, wait));
    ({ res, lastErr } = await attemptAll());
    if (res) return res;
  }

  throw new Error(lastErr || 'All OpenRouter model candidates failed');
}