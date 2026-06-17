import { complete } from '@/lib/ai/providers/provider-manager';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    if (!transcript) return Response.json({ error: 'transcript required' }, { status: 400 });
    const { text, provider } = await complete([
      { role:'system', content:'You are Nexus AI voice assistant. Respond concisely to voice commands. Keep responses under 2 sentences for voice readback.' },
      { role:'user', content: transcript },
    ], { maxTokens:200, temperature:0.5 });
    return Response.json({ response:text, provider });
  } catch { return Response.json({ error: 'Voice API failed' }, { status:500 }); }
}
