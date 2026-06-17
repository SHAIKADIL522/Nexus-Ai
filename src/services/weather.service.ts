// Weather service — uses mock data only (no API key required).
export interface LiveWeather {
  city: string; temp: number; condition: string;
  humidity: number; wind: number; icon: string;
  forecast: { day: string; high: number; low: number; icon: string }[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function mockWeather(city: string): LiveWeather {
  const base = Math.round(18 + Math.random() * 15);
  return {
    city, temp: base,
    condition: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Overcast'][Math.floor(Math.random() * 4)],
    humidity: Math.round(45 + Math.random() * 35),
    wind: Math.round(8 + Math.random() * 18),
    icon: '⛅',
    forecast: DAYS.slice(0, 5).map((day) => ({
      day, high: base + Math.round(Math.random() * 5),
      low: base - Math.round(3 + Math.random() * 5),
      icon: ['☀️', '⛅', '🌦', '🌧', '❄️'][Math.floor(Math.random() * 5)],
    })),
  };
}

export async function getWeather(city: string): Promise<LiveWeather> {
  return mockWeather(city);
}
