import { getCollection } from '@/lib/mongodb';
import { complete } from '@/lib/ai/providers/provider-manager';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const col = await getCollection<any>('knowledge_vault');
    if (!col) return Response.json({ items: [] });
    const filter = q ? { $or: [{ name:{ $regex:q, $options:'i' } }, { tags:{ $in:[q] } }] } : {};
    const items = await col.find(filter).sort({ createdAt:-1 }).limit(50).toArray();
    return Response.json({ items });
  } catch { return Response.json({ error: 'Failed' }, { status: 500 }); }
}
export async function POST(req: Request) {
  try {
    const { name, content, tags, category } = await req.json();
    let summary = '';
    if (content) {
      const { text } = await complete([{ role:'user', content:`Summarize in 2 sentences: ${content.slice(0,2000)}` }], { maxTokens:100, temperature:0.3 });
      summary = text;
    }
    const col = await getCollection<any>('knowledge_vault');
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 });
    const r = await col.insertOne({ name, content, tags:tags??[], category:category??'General', summary, createdAt:new Date() });
    return Response.json({ success:true, id:r.insertedId });
  } catch (err) { return Response.json({ error: 'Failed to save' }, { status: 500 }); }
}
