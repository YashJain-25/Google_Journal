import React, { useEffect, useState } from 'react';
import { MoodTrendPoint } from '../types';
import { fetchMoodTrends } from '../lib/api';
import { MaterialSymbol } from './MaterialSymbol';

interface MoodTrendsModalProps {
  onClose: () => void;
}

export const MoodTrendsModal: React.FC<MoodTrendsModalProps> = ({ onClose }) => {
  const [trends, setTrends] = useState<MoodTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMoodTrends();
      setTrends(data.trends || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load mood trends');
    } finally {
      setLoading(false);
    }
  };

  // Group by sentiment
  const sentimentCounts: Record<string, number> = {};
  trends.forEach((t) => {
    sentimentCounts[t.sentiment] = (sentimentCounts[t.sentiment] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)] animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: 'var(--md-elevation-3)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <MaterialSymbol name="trending_up" size={20} />
            </div>
            <div>
              <h3 className="text-base font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)]">
                Emotional Resonance & Mood Trends
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Server-side aggregated sentiment trends strictly isolated to your authenticated UID.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-mood-trends-btn"
            onClick={onClose}
            aria-label="Close trends dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
          >
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--md-sys-color-on-surface-variant)]">
              <MaterialSymbol name="refresh" size={24} className="animate-spin text-[var(--md-sys-color-primary)]" />
              <span>Analyzing historical reflections...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-center gap-2 border border-[var(--md-sys-color-error)]/30">
              <MaterialSymbol name="error" size={18} />
              <span>{error}</span>
            </div>
          ) : trends.length === 0 ? (
            <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)] space-y-2">
              <MaterialSymbol name="insights" size={32} className="opacity-40" />
              <p className="font-['Google_Sans',sans-serif] text-sm font-medium">No mood history available yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Write a few journal reflections to let Gemini identify recurring emotional themes and sentiment states.
              </p>
            </div>
          ) : (
            <>
              {/* Sentiment Distribution Pills */}
              <div>
                <h4 className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-3">
                  Sentiment Distribution
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                    <div
                      key={sentiment}
                      className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between"
                    >
                      <span className="font-medium capitalize text-[var(--md-sys-color-on-surface)] text-xs flex items-center gap-1.5">
                        <MaterialSymbol name="mood" size={14} className="text-[var(--md-sys-color-primary)]" />
                        {sentiment}
                      </span>
                      <span className="text-lg font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-primary)] mt-1">
                        {count}{' '}
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-normal">
                          entries
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Table */}
              <div>
                <h4 className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-3">
                  Recent Emotional Points
                </h4>
                <div className="rounded-[16px] border border-[var(--md-sys-color-outline-variant)] overflow-hidden bg-[var(--md-sys-color-surface-container-low)]">
                  <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                    {trends.slice(-10).reverse().map((t, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 flex items-center justify-between text-xs hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                          <span className="capitalize font-medium text-[var(--md-sys-color-on-surface)]">
                            {t.sentiment}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[var(--md-sys-color-on-surface-variant)]">
                          <span className="truncate max-w-[200px] text-right opacity-80">
                            {t.sessionTitle || 'Session'}
                          </span>
                          <span className="font-mono text-[11px]">
                            {new Date(t.date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
            <MaterialSymbol name="verified_user" size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Encrypted zero-trust aggregation</span>
          </div>
          <button
            type="button"
            onClick={loadTrends}
            disabled={loading}
            className="px-4 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] transition cursor-pointer flex items-center gap-1.5"
          >
            <MaterialSymbol name="refresh" size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
