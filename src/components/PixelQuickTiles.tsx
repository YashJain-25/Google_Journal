import React from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

interface PixelQuickTilesProps {
  onNewEntry: () => void;
  onOpenVoice: () => void;
  onOpenTrends: () => void;
  onOpenSecurity: () => void;
  isCreating?: boolean;
}

export const PixelQuickTiles: React.FC<PixelQuickTilesProps> = ({
  onNewEntry,
  onOpenVoice,
  onOpenTrends,
  onOpenSecurity,
  isCreating = false,
}) => {
  const tiles = [
    {
      id: 'new',
      title: 'New Reflection',
      subtitle: isCreating ? 'Opening session...' : 'Write or prompt',
      icon: 'add_circle',
      onClick: onNewEntry,
      primary: true,
    },
    {
      id: 'voice',
      title: 'Voice Note',
      subtitle: 'Speech-to-text',
      icon: 'mic',
      onClick: onOpenVoice,
      primary: false,
    },
    {
      id: 'trends',
      title: 'Mood Trends',
      subtitle: 'Emotional resonance',
      icon: 'insights',
      onClick: onOpenTrends,
      primary: false,
    },
    {
      id: 'security',
      title: 'Pixel Shield',
      subtitle: 'Isolated Firestore',
      icon: 'verified_user',
      onClick: onOpenSecurity,
      primary: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full my-4">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          onClick={() => {
            triggerPixelHaptic(10);
            tile.onClick();
          }}
          className={`flex items-center gap-3 p-3.5 rounded-[22px] text-left transition-all duration-150 cursor-pointer select-none active:scale-97 border ${
            tile.primary
              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent hover:opacity-90'
              : 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/60'
          }`}
          style={{ boxShadow: 'var(--md-elevation-1)' }}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              tile.primary
                ? 'bg-white/40 dark:bg-black/20 text-[var(--md-sys-color-on-primary-container)]'
                : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)]'
            }`}
          >
            <MaterialSymbol name={tile.icon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-['Google_Sans',sans-serif] font-medium text-xs leading-tight truncate">
              {tile.title}
            </div>
            <div className="text-[11px] opacity-75 truncate leading-tight mt-0.5">
              {tile.subtitle}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
