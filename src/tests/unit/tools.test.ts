import { describe, it, expect } from 'vitest';
import { mockSeries } from '@/services/stock.service';
import { mockWeather } from '@/services/weather.service';

describe('Mock Services', () => {
  it('generates mock stock data for NVDA', () => {
    const s = mockSeries('NVDA');
    expect(s.symbol).toBe('NVDA');
    expect(s.data).toHaveLength(30);
    expect(s.price).toBeGreaterThan(0);
  });

  it('generates mock stock data for unknown symbol', () => {
    const s = mockSeries('XYZ');
    expect(s.symbol).toBe('XYZ');
    expect(s.data.length).toBeGreaterThan(0);
  });

  it('generates mock weather data', () => {
    const w = mockWeather('Hyderabad');
    expect(w.city).toBe('Hyderabad');
    expect(w.forecast).toHaveLength(5);
    expect(w.temp).toBeGreaterThan(0);
  });
});
