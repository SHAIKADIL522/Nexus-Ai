import { complete } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROMPTS: Record<string, (input: string) => string> = {
  headline: (input) => `Write 3 keyword-rich, recruiter-optimized LinkedIn headlines (under 220 chars each) for someone with this background: "${input}". Return as a numbered list, no extra commentary.`,
  profile: (input) => `Audit this LinkedIn "About" section and give 5 ranked, actionable improvements: "${input}"`,
  connection: (input) => `Write 3 short LinkedIn connection request messages (under 300 chars each) for this context: "${input}". One cold outreach, one follow-up, one networking. Label each.`,
  post: (input) => `Write a LinkedIn post (150-250 words) about: "${input}". Engaging hook, line breaks, no hashtag spam (max 3 hashtags at the end).`,
  jobmatch: (input) => `Compare this job description against the candidate background and list matching strengths + gaps: "${input}"`,
  recommendation: (input) => `Write a professional LinkedIn recommendation template (100-150 words) for: "${input}"`,
};

export async function POST(req: Request) {
  try {
    const { type, input } = await req.json() as { type: string; input: string };
    const builder = PROMPTS[type];
    if (!builder) {
      return new Response(JSON.stringify({ error: 'unknown type' }), { status: 400 });
    }
    if (!input?.trim()) {
      return new Response(JSON.stringify({ error: 'input is required' }), { status: 400 });
    }

    const { text, provider } = await complete(
      [{ role: 'user', content: builder(input) }],
      { maxTokens: 500, temperature: 0.7 }
    );

    return new Response(JSON.stringify({ result: text, provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/career/linkedin]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Generation failed',
    }), { status: 503 });
  }
}