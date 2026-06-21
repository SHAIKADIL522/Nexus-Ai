import { complete } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { company, role, highlights } = await req.json() as { company: string; role: string; highlights?: string };
    if (!company?.trim() || !role?.trim()) {
      return new Response(JSON.stringify({ error: 'company and role are required' }), { status: 400 });
    }

    const prompt = `Write a professional, specific cover letter for a "${role}" position at "${company}".
${highlights ? `Key highlights to weave in naturally: ${highlights}` : 'Use generic but credible AI/full-stack engineering achievements.'}

Keep it to 3-4 short paragraphs, no placeholder brackets, ready to send. Do not invent a name — end with "Best regards," and leave the signature line blank.`;

    const { text, provider } = await complete(
      [{ role: 'user', content: prompt }],
      { maxTokens: 500, temperature: 0.7 }
    );

    return new Response(JSON.stringify({ letter: text, provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/career/cover-letter]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Cover letter generation failed',
    }), { status: 503 });
  }
}