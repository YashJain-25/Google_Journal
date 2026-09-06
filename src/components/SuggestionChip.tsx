import React from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

export interface SuggestionChipProps {
  icon?: string;
  label: string;
  subtitle?: string;
  category?: string;
  accentColor?: string;
  glowColor?: string;
  badgeBg?: string;
  gradient?: string;
  borderColor?: string;
  onClick: () => void;
  className?: string;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  icon = 'auto_awesome',
  label,
  subtitle,
  category,
  accentColor = '#1A73E8',
  glowColor = 'rgba(26, 115, 232, 0.3)',
  badgeBg = 'bg-[#d2e3fc] text-[#0b57d0] dark:bg-[#1A73E8]/30 dark:text-[#A8C7FA]',
  gradient = 'from-[#f8fafd] via-white to-white dark:from-[var(--md-sys-color-surface-container)] dark:to-[var(--md-sys-color-surface-container-high)]',
  borderColor = 'border-[#d0d7de] dark:border-[var(--md-sys-color-outline-variant)]/60',
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => {
        triggerPixelHaptic(10);
        onClick();
      }}
      className={`group relative flex flex-col justify-between p-4 h-full min-h-[120px] text-left rounded-[22px] bg-gradient-to-br ${gradient} border-[1.5px] ${borderColor} shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer select-none overflow-hidden hover:-translate-y-0.5 ${className}`}
      style={{
        boxShadow: 'var(--md-elevation-1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 24px -2px ${glowColor}, 0 6px 16px rgba(0,0,0,0.1)`;
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--md-elevation-1)';
        e.currentTarget.style.borderColor = '';
      }}
    >
      {/* Subtle top luminescent accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top row: Category tag or Icon + Arrow */}
      <div className="flex items-center justify-between w-full mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-xs"
            style={{
              backgroundColor: `${accentColor}18`,
              color: accentColor,
            }}
          >
            <MaterialSymbol name={icon} size={18} />
          </div>
          {category && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide uppercase font-mono shadow-2xs ${badgeBg}`}
            >
              {category}
            </span>
          )}
        </div>

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-[var(--md-sys-color-on-surface-variant)] opacity-60 group-hover:opacity-100 group-hover:translate-x-1"
          style={{ color: accentColor }}
        >
          <MaterialSymbol name="arrow_forward" size={16} />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="mt-auto">
        <div className="font-['Google_Sans',sans-serif] font-semibold text-[14.5px] text-[#1a1c1e] dark:text-[#f2f4f8] group-hover:text-[var(--md-sys-color-primary)] transition-colors leading-snug line-clamp-1">
          {label}
        </div>

        {subtitle && (
          <div className="mt-1.5 text-[12px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed line-clamp-2 font-normal">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
};
