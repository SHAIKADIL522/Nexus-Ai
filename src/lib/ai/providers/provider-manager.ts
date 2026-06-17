/**
 * Provider Manager — OpenRouter primary, NVIDIA NIM fallback.
 * OpenRouter is faster and more reliable for research synthesis.
 */
import { nvidiaComplete, type ProviderMessage, type CompletionOptions } from './nvidia.provider';

export type { ProviderMessage, CompletionOptions };
export type Provider = 'nvidia' | 'openrouter';

export interface StreamResult {
  stream: ReadableStream<Uint8Array>;
  provider: Provider;
}

export interface CompleteResult {
  text: string;
  provider: Provider;
}

// Free models in priority order — if one fails, next is tried
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

async function openrouterComplete(
  messages: ProviderMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  let lastError = '';

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Nexus AI',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.7,
        }),
        signal: AbortSignal.timeout(30000), // 30s per model attempt
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn(`[openrouter] ${model} failed (${res.status}), trying next...`);
        lastError = `OpenRouter error ${res.status}: ${text}`;
        continue; // try next model
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (content) {
        console.log(`[openrouter] Success with model: ${model}`);
        return content;
      }
    } catch (err) {
      console.warn(`[openrouter] ${model} threw error, trying next:`, err);
      lastError = err instanceof Error ? err.message : 'Unknown error';
      continue;
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError}`);
}

/**
 * Stream a chat completion — OpenRouter first, NIM fallback.
 */
export async function streamCompletion(
  messages: ProviderMessage[],
  options: CompletionOptions = {}
): Promise<StreamResult> {
  // Try OpenRouter first (faster for streaming use cases)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const text = await openrouterComplete(messages, options);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
          controller.enqueue(encoder.encode(chunk));
          controller.close();
        },
      });
      return { stream, provider: 'openrouter' };
    } catch (err) {
      console.warn('[provider] OpenRouter stream failed, falling back to NIM:', err);
    }
  }

  // NIM fallback
  const res = await nvidiaComplete(messages, { ...options, stream: true, timeoutMs: 30000 });
  return { stream: res.body!, provider: 'nvidia' };
}

/**
 * One-shot completion — OpenRouter first, NIM fallback.
 */
export async function complete(
  messages: ProviderMessage[],
  options: CompletionOptions = {}
): Promise<CompleteResult> {
  // Try OpenRouter first
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const text = await openrouterComplete(messages, options);
      return { text, provider: 'openrouter' };
    } catch (err) {
      console.warn('[provider] OpenRouter complete failed, falling back to NIM:', err);
    }
  }

  // NIM fallback
  const res = await nvidiaComplete(messages, { ...options, stream: false, timeoutMs: 30000 });
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? '',
    provider: 'nvidia',
  };
}