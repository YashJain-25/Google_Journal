import React, { useEffect, useState } from 'react';
import { WeeklyInsightDigest } from '../types';
import { getWeeklyInsightDigest } from '../lib/api';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

interface WeeklyDigestModalProps {
  onClose: () => void;
}

export const WeeklyDigestModal: React.FC<WeeklyDigestModalProps> = ({ onClose }) => {
  const [digest, setDigest] = useState<WeeklyInsightDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDigest = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getWeeklyInsightDigest();
      setDigest(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate weekly digest');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  const handleCopy = async () => {
    if (!digest) return;
    triggerPixelHaptic(10);
    const text = `Weekly Personal Insight Digest (${digest.period})
Dominant Mood: ${digest.dominantMood}
Theme: ${digest.mindsetTheme}

Emotional Trajectory:
${digest.emotionalTrajectory}

Wins & Breakthroughs:
${digest.winsAndBreakthroughs.map((w) => `• ${w}`).join('\n')}

Gentle Recommendation:
${digest.gentleRecommendation}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)] animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: 'var(--md-elevation-3)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <MaterialSymbol name="auto_awesome" size={22} />
            </div>
            <div>
              <h3 className="text-base font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)]">
                Weekly Personal Insight Digest
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Holistic growth synthesis synthesized by Gemini
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-weekly-digest-btn"
            onClick={onClose}
            aria-label="Close weekly digest"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
          >
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-['Google_Sans',sans-serif] text-[var(--md-sys-color-on-surface-variant)]">
                Gemini is synthesizing your reflections across the past 7 days...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-3">
              <MaterialSymbol name="error" size={20} />
              <span>{error}</span>
            </div>
          ) : digest ? (
            <>
              {/* Period & Stats Banner */}
              <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <MaterialSymbol name="calendar_today" size={16} className="text-[var(--md-sys-color-primary)]" />
                  <span className="font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)]">
                    {digest.period}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                    {digest.dominantMood}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]">
                    {digest.totalEntries} {digest.totalEntries === 1 ? 'reflection' : 'reflections'}
                  </span>
                </div>
              </div>

              {/* Mindset Theme */}
              <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-primary-container)]/40 border border-[var(--md-sys-color-primary)]/20">
                <div className="text-[11px] font-['Google_Sans',sans-serif] font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] mb-1">
                  Weekly Mindset Theme
                </div>
                <div className="text-sm font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)]">
                  "{digest.mindsetTheme}"
                </div>
              </div>

              {/* Emotional Trajectory */}
              <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/60">
                <div className="flex items-center gap-2 text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  <MaterialSymbol name="trending_up" size={16} className="text-[var(--md-sys-color-primary)]" />
                  <span>Emotional Trajectory</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--md-sys-color-on-surface)]">
                  {digest.emotionalTrajectory}
                </p>
              </div>

              {/* Wins & Breakthroughs */}
              <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/60">
                <div className="flex items-center gap-2 text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2.5">
                  <MaterialSymbol name="military_tech" size={18} className="text-amber-500" />
                  <span>Wins & Breakthroughs</span>
                </div>
                <ul className="space-y-2">
                  {digest.winsAndBreakthroughs.map((win, idx) => (
                    <li key={idx} className="text-xs text-[var(--md-sys-color-on-surface)] flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)] mt-1.5 shrink-0" />
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gentle Recommendation for the Week Ahead */}
              <div className="p-4 rounded-2xl bg-[var(--md-sys-color-tertiary-container)]/30 border border-[var(--md-sys-color-tertiary)]/20">
                <div className="flex items-center gap-2 text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-tertiary)] mb-1.5">
                  <MaterialSymbol name="spa" size={16} />
                  <span>Gentle Focus for the Week Ahead</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--md-sys-color-on-surface)]">
                  {digest.gentleRecommendation}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!digest || loading}
              className="px-3.5 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer flex items-center gap-1.5"
            >
              <MaterialSymbol name={copied ? 'check' : 'content_copy'} size={16} />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchDigest(true)}
              disabled={loading || refreshing}
              title="Re-synthesize weekly insights"
              className="px-3.5 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer flex items-center gap-1.5"
            >
              <MaterialSymbol
                name="refresh"
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
