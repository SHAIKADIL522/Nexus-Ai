/**
 * AI Research API Route
 * POST /api/research
 * Flow: Tavily search → Firecrawl content extraction → AI synthesis
 */
import { complete } from '@/lib/ai/providers/provider-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY is not configured');

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',   // changed: 'advanced' → 'basic' (saves 3-5s)
      include_answer: true,
      max_results: 4,           // changed: 6 → 4
    }),
  });

  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

async function firecrawlExtract(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return '';

  try {
    const res = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
      signal: AbortSignal.timeout(5000), // added: 5s max for firecrawl
    });
    if (!res.ok) return '';
    const data = await res.json();
    return (data.data?.content ?? '').slice(0, 1000); // changed: 2000 → 1000 chars
  } catch {
    return '';
  }
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json() as { query: string };
    if (!query?.trim()) {
      return new Response(JSON.stringify({ error: 'query is required' }), { status: 400 });
    }

    // Step 1: Tavily search
    let sources: TavilyResult[] = [];
    try {
      sources = await tavilySearch(query);
    } catch (err) {
      console.warn('[research] Tavily failed:', err);
    }

    // Step 2: Firecrawl only top 1 source (changed: 2 → 1, saves 3-5s)
    const enriched = await Promise.all(
      sources.slice(0, 1).map(async (s) => ({
        ...s,
        deepContent: await firecrawlExtract(s.url),
      }))
    );

    // Step 3: Build source text (truncate each to 500 chars to keep prompt small)
    const sourceText = [...enriched, ...sources.slice(1)]
      .map((s, i) => {
        const content = 'deepContent' in s && s.deepContent
          ? s.deepContent
          : s.content.slice(0, 500);
        return `[${i + 1}] ${s.title}\nURL: ${s.url}\n${content}`;
      })
      .join('\n\n---\n\n');

    // Step 4: Run synthesis and follow-ups in PARALLEL (biggest speed win)
    const prompt = `You are a research analyst. Synthesize these sources into a research report about: "${query}"

Sources:
${sourceText}

Write a concise report with:
- Executive Summary (2-3 sentences)
- Key Findings (bullet points with citations [1], [2], etc.)
- Conclusion (1-2 sentences)

Use markdown formatting. Be factual and cite sources.`;

    const followUpPrompt = `Generate 4 concise follow-up research questions for: "${query}". Return ONLY a JSON array of strings, no markdown, no explanation.`;

    // Run both AI calls in parallel instead of sequentially
    const [{ text, provider }, { text: followUpText }] = await Promise.all([
      complete(
        [{ role: 'user', content: prompt }],
        { maxTokens: 800, temperature: 0.3 }  // changed: 2048 → 800
      ),
      complete(
        [{ role: 'user', content: followUpPrompt }],
        { maxTokens: 100, temperature: 0.7 }  // changed: 256 → 100
      ),
    ]);

    let followUps: string[] = [];
    try {
      followUps = JSON.parse(followUpText.replace(/```json|```/g, '').trim());
    } catch {
      followUps = [
        `What are the latest developments in ${query}?`,
        `How does ${query} compare to alternatives?`,
        `What are the main challenges with ${query}?`,
        `What is the future of ${query}?`,
      ];
    }

    return new Response(JSON.stringify({
      report: text,
      sources: sources.map(s => ({ title: s.title, url: s.url, snippet: s.content.slice(0, 200) })),
      followUps,
      provider,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[api/research]', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Research failed',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}