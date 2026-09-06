import React from 'react';
import Markdown from 'react-markdown';
import { JournalMessage } from '../types';
import { MaterialSymbol } from './MaterialSymbol';

interface MessageBubbleProps {
  message: JournalMessage;
  variant: 'user' | 'model';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, variant }) => {
  const isUser = variant === 'user';
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex flex-col items-end my-4 max-w-[85%] sm:max-w-[75%] ml-auto group">
        {/* User Message Bubble */}
        <div
          className="rounded-[20px] rounded-br-[6px] px-5 py-3.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] transition-all"
          style={{ boxShadow: 'var(--md-elevation-1)' }}
        >
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap select-text font-normal font-sans">
            {message.text}
          </div>
        </div>

        {/* User Metadata */}
        <div className="flex items-center gap-2 mt-1.5 px-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-80">
          {message.sentiment && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]">
              <MaterialSymbol name="mood" size={12} />
              {message.sentiment}
            </span>
          )}
          <span>{formattedTime}</span>
        </div>
      </div>
    );
  }

  // Gemini Model Turn (Left-aligned, NO bubble background, matching Gemini web UI)
  return (
    <div className="flex items-start gap-4 my-6 max-w-[95%] sm:max-w-[90%] mr-auto group">
      {/* Gemini Spark Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)]">
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bubble-gemini-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A73E8" />
              <stop offset="50%" stopColor="#9B72CB" />
              <stop offset="100%" stopColor="#D96570" />
            </linearGradient>
          </defs>
          <path
            d="M14 2C14 7.52285 18.4772 12 24 12C18.4772 12 14 16.4772 14 22C14 16.4772 9.52285 12 4 12C9.52285 12 14 7.52285 14 2Z"
            fill="url(#bubble-gemini-sparkle)"
          />
        </svg>
      </div>

      {/* Model Response Content (Clean Typography, No Background Box) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-['Google_Sans',sans-serif] font-medium text-[13px] text-[var(--md-sys-color-on-surface)]">
            Gemini
          </span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
            {formattedTime}
          </span>
        </div>

        <div className="markdown-body text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] select-text">
          <Markdown>{message.text}</Markdown>
        </div>
      </div>
    </div>
  );
};
