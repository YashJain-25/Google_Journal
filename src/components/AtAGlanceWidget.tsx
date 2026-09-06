import React, { useState, useEffect } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';
import {
  WeatherData,
  TemperatureUnit,
  getInitialTemperatureUnit,
  saveTemperatureUnit,
  formatTemperature,
  fetchLiveWeather,
} from '../lib/weather';

interface AtAGlanceWidgetProps {
  onQuickPrompt?: (prompt: string) => void;
  streakCount?: number;
  totalReflections?: number;
  className?: string;
}

export const AtAGlanceWidget: React.FC<AtAGlanceWidgetProps> = ({
  onQuickPrompt,
  streakCount = 3,
  totalReflections = 8,
  className = '',
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(getInitialTemperatureUnit);
  const [weather, setWeather] = useState<WeatherData>({
    temperatureCelsius: 24,
    condition: 'Clear',
    icon: 'clear_night',
    isDay: false,
    loading: true,
  });

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    setCurrentDateStr(formatted);

    // Fetch live weather data
    let isMounted = true;
    fetchLiveWeather().then((data) => {
      if (isMounted) {
        setWeather(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleUnit = () => {
    triggerPixelHaptic(10);
    const nextUnit: TemperatureUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(nextUnit);
    saveTemperatureUnit(nextUnit);
  };

  const handleMindfulClick = () => {
    triggerPixelHaptic(10);
    if (onQuickPrompt) {
      onQuickPrompt('Take a deep breath. Reflecting on right now, what is one thought or feeling asking for your attention?');
    }
  };

  const formattedTemp = formatTemperature(weather.temperatureCelsius, tempUnit);

  return (
    <div
      className={`relative w-full rounded-[28px] p-5 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/60 text-[var(--md-sys-color-on-surface)] transition-all overflow-hidden ${className}`}
      style={{ boxShadow: 'var(--md-elevation-1)' }}
    >
      {/* Background Subtle Gradient Blob (Pixel Ambient) */}
      <div
        className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[var(--md-sys-color-primary-container)] opacity-30 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Pixel Date & Weather */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-['Google_Sans',sans-serif] font-medium text-lg md:text-xl text-[var(--md-sys-color-on-surface)] tracking-tight">
              {currentDateStr || 'Today'}
            </span>
            <span className="text-[var(--md-sys-color-outline-variant)]">•</span>
            {/* Live Weather Pill with °C / °F Quick Toggle */}
            <button
              type="button"
              onClick={toggleUnit}
              title={`Live Weather: ${formattedTemp} ${weather.condition}. Click to switch to °${tempUnit === 'C' ? 'F' : 'C'}.`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-variant)] text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] border border-transparent hover:border-[var(--md-sys-color-outline-variant)] transition-all cursor-pointer select-none group"
            >
              <MaterialSymbol
                name={weather.icon}
                size={16}
                className={weather.isDay ? 'text-amber-500' : 'text-indigo-400 dark:text-[#8AB4F8]'}
              />
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">{formattedTemp}</span>
              <span>{weather.condition}</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 opacity-70 group-hover:opacity-100">
                °{tempUnit}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--md-sys-color-primary)]">
              <MaterialSymbol name="local_fire_department" size={15} />
              <span>{streakCount} day streak</span>
            </span>
            <span>•</span>
            <span>{totalReflections} private reflections</span>
          </div>
        </div>

        {/* Right: Pixel Mindful At a Glance Pill */}
        <button
          type="button"
          onClick={handleMindfulClick}
          title="Start quick mindful check-in"
          className="inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-[var(--md-sys-color-primary-container)] hover:bg-[var(--md-sys-color-primary-hover)]/20 text-[var(--md-sys-color-on-primary-container)] font-['Google_Sans',sans-serif] text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-98 shrink-0 group"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/40 dark:bg-black/20 flex items-center justify-center">
              <MaterialSymbol name="self_improvement" size={14} className="text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <span>Mindful check-in</span>
          </div>
          <MaterialSymbol name="arrow_forward" size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
