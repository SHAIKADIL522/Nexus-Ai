'use client';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer } from 'lucide-react';
import type { WeatherData } from '@/types';

interface Props { city?: string; temp?: number; condition?: string; humidity?: number; wind?: number; forecast?: WeatherData['forecast']; }

const CONDITION_EMOJI: Record<string, string> = {
  Clear: '☀️', Sunny: '☀️', Cloudy: '☁️', 'Partly Cloudy': '⛅', Rain: '🌧️',
  Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Fog: '🌫️', Windy: '💨',
};

export default function WeatherWidget({
  city = 'Unknown', temp = 20, condition = 'Clear', humidity = 55, wind = 12, forecast = []
}: Props) {
  const emoji = CONDITION_EMOJI[condition] ?? '🌤';

  return (
    <div className="flex flex-col gap-4">
      {/* Main temp */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5">{city}</p>
          <div className="flex items-end gap-2">
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl font-bold text-white font-display leading-none"
            >
              {temp}°
            </motion.p>
            <p className="text-white/50 text-sm pb-2">C</p>
          </div>
          <p className="text-white/50 text-sm mt-1">{condition}</p>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl leading-none"
        >
          {emoji}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Droplets className="size-3.5 text-blue-400" />, label: 'Humidity', val: `${humidity}%` },
          { icon: <Wind className="size-3.5 text-cyan-400" />, label: 'Wind', val: `${wind} km/h` },
          { icon: <Thermometer className="size-3.5 text-orange-400" />, label: 'Feels', val: `${Math.round(temp - 2)}°` },
        ].map(s => (
          <div key={s.label}
            className="flex flex-col gap-1.5 p-2.5 rounded-xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-center">{s.icon}</div>
            <p className="text-white font-semibold text-sm">{s.val}</p>
            <p className="text-white/30 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5">
          {forecast.map((f, i) => (
            <motion.div
              key={f.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all hover:bg-white/[0.04] cursor-default"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <p className="text-[10px] text-white/30 font-medium">{f.day}</p>
              <span className="text-lg leading-none">{f.icon}</span>
              <p className="text-xs text-white font-semibold">{f.high}°</p>
              <p className="text-[10px] text-white/25">{f.low}°</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
