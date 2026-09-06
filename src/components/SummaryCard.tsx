import React, { useState } from 'react';
import { JournalSummary } from '../types';
import { MaterialSymbol } from './MaterialSymbol';

interface SummaryCardProps {
  summary: JournalSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative rounded-[16px] p-5 mb-6 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] transition-all"
      style={{ boxShadow: 'var(--md-elevation-1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <MaterialSymbol name="bookmark" size={18} fill />
          </div>
          <div>
            <h3 className="font-['Google_Sans',sans-serif] font-medium text-[15px] leading-tight text-[var(--md-sys-color-on-surface)]">
              Executive Journal Synthesis
            </h3>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
              <MaterialSymbol name="lock" size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Encrypted Session Summary</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy summary'}
            aria-label="Copy summary to clipboard"
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          >
            <MaterialSymbol name={copied ? 'check' : 'content_copy'} size={18} />
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Regenerate summary"
              aria-label="Regenerate summary"
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <MaterialSymbol
                name="refresh"
                size={18}
                className={isRefreshing ? 'animate-spin text-[var(--md-sys-color-primary)]' : ''}
              />
            </button>
          )}
        </div>
      </div>

      {/* Summary Content */}
      <p className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)] mb-4 font-normal">
        {summary.summaryText}
      </p>

      {/* Identified Themes */}
      {summary.keyThemes && summary.keyThemes.length > 0 && (
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] block mb-2">
            Identified Themes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {summary.keyThemes.map((theme, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-[12px] font-medium bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
