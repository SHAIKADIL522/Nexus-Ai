import { complete } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json() as { question: string; answer: string };
    if (!question?.trim() || !answer?.trim()) {
      return new Response(JSON.stringify({ error: 'question and answer are required' }), { status: 400 });
    }

    const prompt = `You are a senior technical interviewer at a FAANG company giving feedback on a candidate's interview answer.

Question: "${question}"
Candidate's answer: "${answer}"

Give concise, specific feedback (3-5 sentences): what was strong, what's missing (metrics, trade-offs, structure), and one concrete improvement. Be direct, not generic.`;

    const { text, provider } = await complete(
      [{ role: 'user', content: prompt }],
      { maxTokens: 350, temperature: 0.6 }
    );

    return new Response(JSON.stringify({ feedback: text, provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/career/interview]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Feedback generation failed',
    }), { status: 503 });
  }
}