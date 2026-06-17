/**
 * AI Chat API Route — NVIDIA NIM streaming with OpenRouter fallback.
 * POST /api/ai-chat
 */
import { streamCompletion } from '@/lib/ai/providers/provider-manager';
import type { ProviderMessage } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Nexus AI, a highly capable personal AI assistant powered by NVIDIA NIM.
You help with research, coding, writing, career advice, document analysis, and general knowledge.
You provide concise, accurate, and thoughtful responses.
You use markdown formatting with code blocks, headers, and lists where appropriate.
Today's date: ${new Date().toDateString()}.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model, temperature, maxTokens } = body as {
      messages: ProviderMessage[];
      model?: string;
      temperature?: number;
      maxTokens?: number;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepend system message if not present
    const fullMessages: ProviderMessage[] = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    const { stream, provider } = await streamCompletion(fullMessages, {
      model,
      temperature,
      maxTokens,
      stream: true,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Provider': provider,
      },
    });
  } catch (error) {
    console.error('[api/ai-chat]', error);
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    return new Response(JSON.stringify({ error: message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
