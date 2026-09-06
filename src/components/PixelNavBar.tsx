import React from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

export type PixelTab = 'reflections' | 'at_a_glance' | 'trends' | 'vault';

interface PixelNavBarProps {
  activeTab: PixelTab;
  onSelectTab: (tab: PixelTab) => void;
  unreadCount?: number;
  className?: string;
}

export const PixelNavBar: React.FC<PixelNavBarProps> = ({
  activeTab,
  onSelectTab,
  className = '',
}) => {
  const tabs = [
    {
      id: 'reflections' as PixelTab,
      label: 'Reflections',
      icon: 'chat_bubble',
      activeIcon: 'chat_bubble',
    },
    {
      id: 'at_a_glance' as PixelTab,
      label: 'At a Glance',
      icon: 'auto_awesome',
      activeIcon: 'auto_awesome',
    },
    {
      id: 'trends' as PixelTab,
      label: 'Insights',
      icon: 'insights',
      activeIcon: 'insights',
    },
    {
      id: 'vault' as PixelTab,
      label: 'Pixel Vault',
      icon: 'shield',
      activeIcon: 'shield',
    },
  ];

  return (
    <nav
      aria-label="Pixel Navigation Bar"
      className={`md:hidden shrink-0 border-t border-[var(--md-sys-color-outline-variant)]/60 bg-[var(--md-sys-color-surface-container)] px-2 pt-2 pb-3 flex items-center justify-around z-30 select-none ${className}`}
      style={{ boxShadow: '0 -1px 3px 0 rgba(0,0,0,0.06)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerPixelHaptic(10);
              onSelectTab(tab.id);
            }}
            className="flex flex-col items-center gap-1 min-w-[64px] py-1 cursor-pointer transition-transform active:scale-95"
            aria-label={tab.label}
          >
            {/* Pill Active Highlight Indicator (Material 3) */}
            <div
              className={`w-16 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-xs scale-100'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] scale-90'
              }`}
            >
              <MaterialSymbol
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                fill={isActive}
              />
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-['Google_Sans',sans-serif] tracking-tight transition-colors ${
                isActive
                  ? 'font-medium text-[var(--md-sys-color-on-surface)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
