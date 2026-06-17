import { complete } from '@/lib/ai/providers/provider-manager';
import { getCollection } from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { transcript, title } = await req.json();
    if (!transcript?.trim()) return Response.json({ error: 'transcript required' }, { status: 400 });
    const prompt = `Analyze this meeting transcript. Return ONLY JSON: { "summary":string, "tasks":string[], "actionItems":string[], "followUps":string[] }\nTranscript:\n${transcript.slice(0,6000)}\nReturn ONLY valid JSON.`;
    const { text, provider } = await complete([{ role:'user', content:prompt }], { maxTokens:1024, temperature:0.3 });
    let result;
    try { result = JSON.parse(text.replace(/```json|```/g,'').trim()); }
    catch { result = { summary:text, tasks:[], actionItems:[], followUps:[] }; }
    const meetings = await getCollection<any>('meeting_summaries');
    await meetings?.insertOne({ title:title??'Untitled Meeting', ...result, createdAt:new Date() });
    return Response.json({ ...result, provider });
  } catch (err) { return Response.json({ error: 'Meeting API failed' }, { status: 500 }); }
}
