import { complete } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { resumeText, jobRole } = await req.json() as { resumeText: string; jobRole?: string };
    if (!resumeText?.trim()) {
      return new Response(JSON.stringify({ error: 'resumeText is required' }), { status: 400 });
    }

    const prompt = `You are an ATS (Applicant Tracking System) resume analyzer. Analyze this resume${jobRole ? ` for the target role: "${jobRole}"` : ''}.

Resume:
${resumeText.slice(0, 6000)}

Return ONLY valid JSON, no markdown fences, in this exact shape:
{
  "score": <integer 0-100>,
  "breakdown": {
    "keywords": <integer 0-100>,
    "format": <integer 0-100>,
    "experience": <integer 0-100>,
    "skills": <integer 0-100>
  },
  "issues": [
    { "type": "success" | "warning" | "error", "text": "<short specific observation>" }
  ]
}
Include 5-7 issues total, mixing all three types based on what's actually true of this resume.`;

    const { text, provider } = await complete(
      [{ role: 'user', content: prompt }],
      { maxTokens: 800, temperature: 0.4 }
    );

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return new Response(JSON.stringify({ error: 'AI returned invalid format, please retry' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ...parsed, provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/career/resume]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Resume analysis failed',
    }), { status: 503 });
  }
}