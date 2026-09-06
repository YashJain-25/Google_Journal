import React, { useRef, useEffect } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

interface ComposerProps {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  onSend: (text: string) => Promise<void> | void;
  sending: boolean;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  inputText,
  setInputText,
  onSend,
  sending,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~6 lines (approx 160px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const maxHeight = 160;
      textareaRef.current.style.height = `${Math.min(scrollH, maxHeight)}px`;
      textareaRef.current.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputText]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending || disabled) return;
    triggerPixelHaptic(15);
    const text = inputText;
    try {
      await onSend(text);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Buffer preserved on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    triggerPixelHaptic(10);
    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleClear = () => {
    triggerPixelHaptic(8);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSubmit = inputText.trim().length > 0 && !sending && !disabled;

  return (
    <footer className="sticky bottom-0 w-full px-3 sm:px-4 pt-2 pb-4 bg-gradient-to-t from-[var(--md-sys-color-surface)] via-[var(--md-sys-color-surface)]/95 to-transparent z-20">
      <div className="max-w-[760px] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/80 focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20 focus-within:shadow-[0_0_24px_rgba(138,180,248,0.22)] transition-all duration-200 px-3 py-2"
          style={{ boxShadow: 'var(--md-elevation-1)' }}
        >
          {/* Left Gemini Sparkle (Pixel Assistant Icon) */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-center mr-1 text-[var(--md-sys-color-primary)]">
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="composer-gemini-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A73E8" />
                  <stop offset="35%" stopColor="#4285F4" />
                  <stop offset="70%" stopColor="#9B72CB" />
                  <stop offset="100%" stopColor="#D96570" />
                </linearGradient>
              </defs>
              <path
                d="M14 2C14 7.52285 18.4772 12 24 12C18.4772 12 14 16.4772 14 22C14 16.4772 9.52285 12 4 12C9.52285 12 14 7.52285 14 2Z"
                fill="url(#composer-gemini-sparkle)"
              />
            </svg>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            id="composer-input"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || disabled}
            maxLength={10000}
            placeholder="Ask Gemini or reflect freely..."
            aria-label="Journal entry or reflection prompt"
            className="flex-1 max-h-40 min-h-[28px] px-2 py-1.5 bg-transparent text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] resize-none focus:outline-none font-sans"
          />

          {/* Clear text button */}
          {inputText && !sending && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors self-center mr-1 cursor-pointer"
            >
              <MaterialSymbol name="close" size={16} />
            </button>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 pb-0.5 shrink-0">
            {/* Voice Dictation (Pixel Mic Pill) */}
            <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={sending || disabled} />

            {/* Send Button (Pixel Action Pill) */}
            <button
              type="submit"
              id="composer-send-btn"
              disabled={!canSubmit}
              title={canSubmit ? 'Send reflection (Enter)' : 'Type a reflection to send'}
              aria-label="Send reflection"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                canSubmit
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 shadow-xs cursor-pointer scale-100 active:scale-95'
                  : 'text-[var(--md-sys-color-outline)] opacity-40 cursor-not-allowed scale-95'
              }`}
            >
              <MaterialSymbol name="send" size={18} fill={canSubmit} />
            </button>
          </div>
        </form>

        {/* Footer helper & disclaimer */}
        <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] px-4 mt-2 select-none opacity-80">
          <span className="truncate">
            Gemini with zero-trust local isolation.
          </span>
          <span className="hidden sm:inline-block shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[10px]">
              Enter
            </kbd>{' '}
            to send •{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[10px]">
              Shift+Enter
            </kbd>{' '}
            for newline
          </span>
        </div>
      </div>
    </footer>
  );
};

