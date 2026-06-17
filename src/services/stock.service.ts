// Stock service — uses mock data only (no API key required).
export interface StockSeries {
  symbol: string; price: number; change: number; changePercent: number;
  data: { time: string; value: number }[];
}

export function mockSeries(symbol: string): StockSeries {
  const bases: Record<string, number> = { NVDA: 875, TSLA: 245, AAPL: 193, MSFT: 415, GOOG: 178, AMZN: 190 };
  const changes: Record<string, number> = { NVDA: 142.4, TSLA: -12.7, AAPL: 18.3, MSFT: 31.2, GOOG: 22.8, AMZN: 15.4 };
  const base = bases[symbol] ?? (50 + Math.random() * 200);
  let v = base;
  const now = new Date();
  const data = Array.from({ length: 30 }, (_, i) => {
    v = Math.max(v + (Math.random() - 0.47) * base * 0.025, base * 0.4);
    const d = new Date(now); d.setDate(d.getDate() - (30 - i));
    return { time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseFloat(v.toFixed(2)) };
  });
  const price = data[data.length - 1].value;
  const chg = changes[symbol] ?? ((Math.random() - 0.45) * 30);
  return { symbol, price, change: parseFloat((price * chg / 100).toFixed(2)), changePercent: chg, data };
}

export async function getStocks(symbols: string[]): Promise<StockSeries[]> {
  return symbols.slice(0, 3).map(mockSeries);
}
