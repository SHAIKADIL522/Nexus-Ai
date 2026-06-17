import { NextResponse } from 'next/server';

const TOOL_RESPONSES: Record<string, object> = {
  kanban: {
    toolName: 'renderKanbanBoard',
    output: {
      boardTitle: 'Engineering Sprint',
      columns: [
        { id: 'backlog', title: 'Backlog', color: '#6366f1', tasks: [
          { id: 't1', title: 'Implement SSE streaming endpoint', priority: 'high', assignee: 'Adil', tag: 'Backend' },
          { id: 't2', title: 'Design widget registry system', priority: 'medium', assignee: 'Team', tag: 'Architecture' },
          { id: 't3', title: 'Add Playwright E2E tests', priority: 'low', assignee: 'QA', tag: 'Testing' },
        ]},
        { id: 'in-progress', title: 'In Progress', color: '#f59e0b', tasks: [
          { id: 't4', title: 'Build Kanban drag & drop', priority: 'high', assignee: 'Adil', tag: 'Frontend' },
          { id: 't5', title: 'Real AI SDK streaming', priority: 'high', assignee: 'Adil', tag: 'AI' },
        ]},
        { id: 'review', title: 'In Review', color: '#8b5cf6', tasks: [
          { id: 't6', title: 'Aurora WebGL background', priority: 'medium', assignee: 'Design', tag: 'UI' },
        ]},
        { id: 'done', title: 'Done', color: '#10b981', tasks: [
          { id: 't7', title: 'Next.js migration', priority: 'high', assignee: 'Adil', tag: 'Setup' },
          { id: 't8', title: 'Zustand store architecture', priority: 'medium', assignee: 'Adil', tag: 'State' },
        ]},
      ],
    },
  },
  stock: {
    toolName: 'renderStockChart',
    output: {
      stocks: ['NVDA', 'TSLA', 'AAPL'].map((sym, si) => {
        const bases = [875, 245, 193];
        const changes = [142.4, -12.7, 18.3];
        const base = bases[si];
        let v = base;
        const now = new Date();
        const data = Array.from({ length: 30 }, (_, i) => {
          v = Math.max(v + (Math.random() - 0.47) * base * 0.025, base * 0.4);
          const d = new Date(now); d.setDate(d.getDate() - (30 - i));
          return { time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseFloat(v.toFixed(2)) };
        });
        const price = data[data.length - 1].value;
        const chg = changes[si];
        return { symbol: sym, price, change: parseFloat((price * chg / 100).toFixed(2)), changePercent: chg, data };
      }),
    },
  },
  analytics: {
    toolName: 'renderAnalytics',
    output: {
      title: 'Performance Dashboard',
      metrics: [
        { label: 'Active Users', value: '12.4K', change: 22.3 },
        { label: 'Sessions', value: '84.2K', change: 15.8 },
        { label: 'Avg Response', value: '0.9s', change: -18.4 },
        { label: 'Uptime', value: '99.97%', change: 0.02 },
      ],
      chart: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map((name) => ({
        name, value: Math.round(20000 + Math.random() * 80000),
      })),
    },
  },
  weather: {
    toolName: 'renderWeather',
    output: {
      city: 'San Francisco', temp: 22, condition: 'Partly Cloudy',
      humidity: 65, wind: 14,
      forecast: ['Mon','Tue','Wed','Thu','Fri'].map((day, i) => ({
        day, high: 20 + i, low: 12 + i, icon: ['☀️','⛅','🌦','🌧','❄️'][i],
      })),
    },
  },
};

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/board|sprint|kanban|task|backlog/.test(t)) return 'kanban';
  if (/stock|chart|price|market|nvda|tsla|aapl/.test(t)) return 'stock';
  if (/analytic|dashboard|kpi|revenue|sales|metric/.test(t)) return 'analytics';
  if (/weather|forecast|temperature/.test(t)) return 'weather';
  return 'kanban';
}

function createStream(messages: {role: string; content: string}[]) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const intent = detectIntent(lastUser?.content ?? '');
  const toolData = TOOL_RESPONSES[intent];
  const textResponse = {
    kanban: "I've created a **Sprint Board** with 4 columns and prioritised tasks. You can drag cards between columns to update status.",
    stock: "Here's the **stock performance chart** showing 30-day price history with daily change and percentage movement.",
    analytics: "Your **analytics dashboard** is live with KPI metrics and 8-month trend chart.",
    weather: "Here's the **weather forecast** showing current conditions and a 5-day outlook.",
  }[intent] ?? "Widget rendered successfully.";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Tool call chunk
      const toolChunk = `2:[${JSON.stringify(toolData)}]\n`;
      controller.enqueue(encoder.encode(toolChunk));
      await new Promise(r => setTimeout(r, 60));

      // Text streaming
      for (let i = 0; i < textResponse.length; i++) {
        const chunk = `0:${JSON.stringify(textResponse[i])}\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise(r => setTimeout(r, 12));
      }

      controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
      controller.close();
    },
  });
  return stream;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const stream = createStream(messages);
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'x-vercel-ai-data-stream': 'v1',
    },
  });
}
