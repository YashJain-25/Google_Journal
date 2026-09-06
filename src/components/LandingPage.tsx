import React, { useState } from 'react';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Logo } from './Logo';
import { MaterialSymbol } from './MaterialSymbol';

interface LandingPageProps {
  onSuccess?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      // In sandboxed iframes, popup might be blocked or cancelled by user
      if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup')) {
        setError('Popup was blocked by browser. You can use Guest Demo mode below or open in a new tab.');
      } else {
        setError(err.message || 'Google sign-in was canceled or failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Anonymous sign-in error:', err);
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col justify-between select-none">
      {/* Top Navigation Bar */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] sticky top-0 z-20">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-hover)] text-[var(--md-sys-color-on-primary)] font-['Google_Sans',sans-serif] font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <MaterialSymbol name="login" size={18} />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Authentication Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 md:py-16 flex flex-col items-center text-center">
        {/* Google 4-Color Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-['Google_Sans',sans-serif] font-medium mb-6">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
            <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
            <span className="w-2 h-2 rounded-full bg-[#FBBC05]"></span>
            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
          </span>
          <span className="text-[var(--md-sys-color-on-surface-variant)]">
            Powered by Gemini & Cloud Firestore
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-['Google_Sans',sans-serif] font-medium text-4xl sm:text-5xl md:text-6xl text-[var(--md-sys-color-on-surface)] tracking-tight max-w-3xl leading-[1.15]">
          Reflect deeply. Converse with{' '}
          <span className="bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#EA4335] bg-clip-text text-transparent">
            Gemini
          </span>
          .
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-[var(--md-sys-color-on-surface-variant)] max-w-2xl leading-relaxed font-sans">
          A secure personal reflection workspace with zero-trust storage. Write multi-turn reflections, brainstorm ideas, get executive summaries, and keep your history private.
        </p>

        {/* Authentication Card (Prompting User to Sign In) */}
        <div
          className="mt-10 w-full max-w-md p-6 sm:p-8 rounded-[28px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-center transition-all animate-in fade-in zoom-in-95 duration-200"
          style={{ boxShadow: 'var(--md-elevation-2)' }}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mb-3">
              <MaterialSymbol name="lock" size={24} />
            </div>
            <h2 className="font-['Google_Sans',sans-serif] font-medium text-xl text-[var(--md-sys-color-on-surface)]">
              Sign In to Your Private Vault
            </h2>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Zero-trust identity isolation. Passwords are never stored.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2 border border-[var(--md-sys-color-error)]/30 text-left">
              <MaterialSymbol name="error" size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Google Sign-in Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-full bg-[var(--md-sys-color-surface-container-highest)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-sm font-['Google_Sans',sans-serif] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>

          {/* Guest / Demo Access Fallback */}
          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/60">
            <button
              type="button"
              id="demo-signin-btn"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] font-['Google_Sans',sans-serif] font-medium underline underline-offset-2 transition-colors cursor-pointer"
            >
              Or explore instantly with a Demo Guest Account
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Feature 1 */}
          <div className="p-6 rounded-[24px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
            <div className="w-10 h-10 rounded-full bg-[#4285F4]/15 text-[#4285F4] flex items-center justify-center mb-4">
              <MaterialSymbol name="forum" size={20} />
            </div>
            <h3 className="font-['Google_Sans',sans-serif] font-medium text-base text-[var(--md-sys-color-on-surface)]">
              Multi-Turn Reflection & Brainstorming
            </h3>
            <p className="mt-2 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              Engage in rich multi-turn dialogues with Gemini Flash. Brainstorm solutions, process complex decisions, or unpack raw emotions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-[24px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
            <div className="w-10 h-10 rounded-full bg-[#9B72CB]/15 text-[#9B72CB] flex items-center justify-center mb-4">
              <MaterialSymbol name="auto_awesome" size={20} />
            </div>
            <h3 className="font-['Google_Sans',sans-serif] font-medium text-base text-[var(--md-sys-color-on-surface)]">
              Executive Summaries & Insights
            </h3>
            <p className="mt-2 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              One-click executive syntheses capture core themes, actionable takeaways, and emotional tone from long reflections.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-[24px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
            <div className="w-10 h-10 rounded-full bg-[#34A853]/15 text-[#34A853] flex items-center justify-center mb-4">
              <MaterialSymbol name="shield" size={20} />
            </div>
            <h3 className="font-['Google_Sans',sans-serif] font-medium text-base text-[var(--md-sys-color-on-surface)]">
              Strict User-Isolated Firestore
            </h3>
            <p className="mt-2 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              Every entry and interaction is saved under your verified UID partition. Firestore rules enforce absolute tenant privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-[var(--md-sys-color-outline-variant)] text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
        <p>Google Journal · Powered by Gemini Flash and Firebase Authentication · Client-side zero-trust architecture</p>
      </footer>
    </div>
  );
};
