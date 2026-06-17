// All AI responses are handled client-side via mock data.
// This route is kept for structure only — it forwards to mock-chat.
export async function POST(req: Request) {
  const body = await req.text();
  return fetch(new URL('/api/mock-chat', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
