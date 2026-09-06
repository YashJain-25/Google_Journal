import React, { useState } from 'react';
import { ActionItem } from '../types';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onToggle: (id: string) => Promise<void>;
  onAdd: (text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  onToggle,
  onAdd,
  onDelete,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const completedCount = actionItems.filter((i) => i.completed).length;
  const totalCount = actionItems.length;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || isSubmitting) return;
    triggerPixelHaptic(12);
    setIsSubmitting(true);
    try {
      await onAdd(newText.trim());
      setNewText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    if (togglingId) return;
    triggerPixelHaptic(10);
    setTogglingId(id);
    try {
      await onToggle(id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    triggerPixelHaptic(15);
    await onDelete(id);
  };

  return (
    <div
      className={`rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] transition-all overflow-hidden ${className}`}
      style={{ boxShadow: 'var(--md-elevation-1)' }}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <MaterialSymbol name="checklist" size={16} />
          </div>
          <span className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface)] tracking-wide">
            Action Items & Commitments
          </span>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface-variant)]">
          <MaterialSymbol
            name={isExpanded ? 'expand_less' : 'expand_more'}
            size={20}
          />
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/40">
          {actionItems.length === 0 ? (
            <div className="py-2.5 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <span>No action items detected yet. Gemini automatically extracts next steps from your reflections.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 py-1">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  role="checkbox"
                  aria-checked={item.completed}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(item.id);
                    }
                  }}
                  className={`group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-outline)]'
                      : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.completed
                          ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                          : 'border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-primary)]'
                      }`}
                    >
                      {item.completed && <MaterialSymbol name="check" size={12} />}
                    </button>
                    <span
                      className={`text-xs font-sans truncate ${
                        item.completed ? 'line-through opacity-70' : 'font-normal'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete action item"
                    aria-label="Delete action item"
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--md-sys-color-outline)] hover:text-red-500 rounded-md transition-opacity"
                  >
                    <MaterialSymbol name="delete" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Form */}
          <form onSubmit={handleAddSubmit} className="mt-2 flex items-center gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]/30">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add next step or commitment..."
              maxLength={200}
              aria-label="New action item text"
              className="flex-1 px-3 py-1.5 text-xs rounded-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <button
              type="submit"
              disabled={!newText.trim() || isSubmitting}
              className="px-3 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
