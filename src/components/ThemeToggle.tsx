import React, { useEffect, useState } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

export type ThemeMode = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'icon' }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gemini_journal_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('gemini_journal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-[var(--md-sys-color-surface-container-high)] rounded-full border border-[var(--md-sys-color-outline-variant)] ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
          }`}
          aria-label="Light mode"
        >
          <MaterialSymbol name="light_mode" size={16} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
          }`}
          aria-label="Dark mode"
        >
          <MaterialSymbol name="dark_mode" size={16} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-button"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label={`Current theme is ${theme}. Click to switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode.`}
      className={`relative w-9 h-9 flex items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors duration-200 cursor-pointer ${className}`}
    >
      <MaterialSymbol
        name={theme === 'dark' ? 'light_mode' : 'dark_mode'}
        size={20}
      />
    </button>
  );
};

