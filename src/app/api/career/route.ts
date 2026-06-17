import { complete } from '@/lib/ai/providers/provider-manager';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;
    let prompt = '';
    if (type === 'ats') {
      prompt = `Analyze this resume for "${body.jobRole}" role. Return JSON: { score: number, breakdown: { keywords:number, format:number, experience:number, skills:number }, issues: [{ type:'success'|'warning'|'error', text:string }] }. Resume: ${(body.resume??'').slice(0,3000)}. Return ONLY JSON.`;
    } else if (type === 'cover') {
      prompt = `Write a professional cover letter for ${body.role} at ${body.company}. Highlights: ${body.highlights}. 3 paragraphs, no placeholders.`;
    } else if (type === 'interview') {
      prompt = `Generate ${body.count??5} interview questions for ${body.role}. Return ONLY JSON array: [{q:string,category:string,difficulty:string}]`;
    } else if (type === 'feedback') {
      prompt = `Give interview feedback. Question: ${body.question}. Answer: ${body.answer}. 3-4 sentences: what was good, what to improve, how to strengthen for FAANG.`;
    } else { return Response.json({ error: 'Invalid type' }, { status: 400 }); }
    const { text, provider } = await complete([{ role:'user', content:prompt }], { maxTokens:600, temperature:0.6 });
    if (type === 'ats' || type === 'interview') {
      try { return Response.json({ result: JSON.parse(text.replace(/```json|```/g,'').trim()), provider }); }
      catch { return Response.json({ result: text, provider }); }
    }
    return Response.json({ result: text, provider });
  } catch (err) { return Response.json({ error: 'Career API failed' }, { status: 500 }); }
}
