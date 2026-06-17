import { complete } from '@/lib/ai/providers/provider-manager';
import { getCollection } from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
const PROMPTS: Record<string,string> = {
  research: 'You are an expert research agent. Research thoroughly, provide findings with structure.',
  career: 'You are a career coach. Provide detailed actionable career advice.',
  document: 'You are a document analyst. Extract key insights, summaries, and action items.',
  productivity: 'You are a productivity expert. Organize tasks, create schedules, optimize workflows.',
};
export async function POST(req: Request) {
  try {
    const { agentId, task, context } = await req.json();
    if (!agentId || !task) return Response.json({ error: 'agentId and task required' }, { status: 400 });
    const { text, provider } = await complete([
      { role:'system', content: PROMPTS[agentId] ?? PROMPTS.research },
      { role:'user', content: context ? `Context: ${context}\n\nTask: ${task}` : task },
    ], { maxTokens:1500, temperature:0.5 });
    const col = await getCollection<any>('agents');
    await col?.insertOne({ agentId, task, output:text, provider, createdAt:new Date() });
    return Response.json({ output:text, provider });
  } catch (err) { return Response.json({ error: 'Agent failed' }, { status:500 }); }
}
