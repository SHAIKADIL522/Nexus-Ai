export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'only PDF files are supported' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const text = result.text?.trim();
    if (!text) {
      return new Response(JSON.stringify({ error: 'could not extract text — PDF may be scanned/image-based' }), { status: 422 });
    }

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/career/resume/parse-pdf]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'PDF parsing failed',
    }), { status: 503 });
  }
}