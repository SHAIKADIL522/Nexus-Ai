import { getCollection } from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const docs = await getCollection<any>('documents');
    if (!docs) return Response.json({ documents: [] });
    const list = await docs.find({}).sort({ uploadedAt: -1 }).limit(50).toArray();
    return Response.json({ documents: list });
  } catch { return Response.json({ error: 'Failed to fetch documents' }, { status: 500 }); }
}
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });
    const docs = await getCollection<any>('documents');
    const { ObjectId } = await import('mongodb');
    await docs?.deleteOne({ _id: new ObjectId(id) });
    return Response.json({ success: true });
  } catch { return Response.json({ error: 'Failed to delete' }, { status: 500 }); }
}
