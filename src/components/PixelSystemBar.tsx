import React, { useState, useEffect } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

export const PixelSystemBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 px-4 flex items-center justify-between text-[11px] font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface)] select-none border-b border-[var(--md-sys-color-outline-variant)]/30 shrink-0">
      {/* Left: Pixel Clock */}
      <div className="flex items-center gap-1.5">
        <span>{timeStr || '12:00'}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Zero-Trust Encrypted Vault Online" />
      </div>

      {/* Center: Subtle Pixel Device indicator */}
      <div className="hidden sm:flex items-center gap-1 text-[10px] tracking-wider uppercase opacity-60">
        <span>Pixel Journal</span>
      </div>

      {/* Right: Pixel System Indicators */}
      <div className="flex items-center gap-2">
        <MaterialSymbol name="wifi" size={14} />
        <MaterialSymbol name="signal_cellular_4_bar" size={14} />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <MaterialSymbol name="battery_full" size={14} />
        </div>
      </div>
    </div>
  );
};
