import React, { useState, useRef, useEffect } from 'react';
import { UserSession } from '../types';
import { MaterialSymbol } from './MaterialSymbol';

interface SessionListItemProps {
  session: UserSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRename?: (id: string, newTitle: string) => Promise<void> | void;
}

export const SessionListItem: React.FC<SessionListItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(session.title);
  }, [session.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editTitle.trim() || saving) {
      setIsEditing(false);
      return;
    }
    if (editTitle.trim() === session.title) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      if (onRename) {
        await onRename(session.id, editTitle.trim());
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename session:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  const formattedTime = new Date(session.updatedAt || session.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <form
          onSubmit={handleSaveRename}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-primary)]"
        >
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="flex-1 min-w-0 bg-transparent text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none"
            aria-label="Rename reflection session"
          />
          <button
            type="submit"
            disabled={saving}
            aria-label="Save title"
            className="p-1 text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] rounded-full transition-colors cursor-pointer"
          >
            <MaterialSymbol name="check" size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditTitle(session.title);
              setIsEditing(false);
            }}
            disabled={saving}
            aria-label="Cancel renaming"
            className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] rounded-full transition-colors cursor-pointer"
          >
            <MaterialSymbol name="close" size={16} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(session.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(session.id);
        }
      }}
      className={`group relative flex items-center justify-between px-3.5 py-2.5 mx-2 rounded-full cursor-pointer transition-colors duration-150 select-none text-left ${
        isActive
          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium shadow-xs'
          : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
      }`}
      title={`${session.title} (${formattedTime})`}
    >
      {/* Session Title and Meta */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <MaterialSymbol
          name={isActive ? 'chat_bubble' : 'chat'}
          size={18}
          className={`shrink-0 ${
            isActive
              ? 'text-[var(--md-sys-color-on-primary-container)]'
              : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70 group-hover:opacity-100'
          }`}
        />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-tight font-sans">
            {session.title}
          </span>
          <span className="block text-[11px] opacity-60 truncate mt-0.5">
            {formattedTime}
            {session.moodTag && ` • ${session.moodTag}`}
          </span>
        </div>
      </div>

      {/* Hover Actions: Rename & Delete (matches Gemini's chat list hover controls) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          aria-label={`Rename session ${session.title}`}
          title="Rename"
          className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
        >
          <MaterialSymbol name="edit" size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(session.id, e)}
          aria-label={`Delete session ${session.title}`}
          title="Delete"
          className="p-1 rounded-full hover:bg-[var(--md-sys-color-error-container)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] transition-colors cursor-pointer"
        >
          <MaterialSymbol name="delete" size={16} />
        </button>
      </div>
    </div>
  );
};
