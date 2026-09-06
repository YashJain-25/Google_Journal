import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { MaterialSymbol } from './MaterialSymbol';
import { Logo } from './Logo';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setError(err.message || 'Google sign-in was canceled or failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Anonymous sign-in error:', err);
      setError(err.message || 'Anonymous sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-[24px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] p-8 text-[var(--md-sys-color-on-surface)] transition-all animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: 'var(--md-elevation-3)' }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo className="mb-2" />
          <h2 className="font-['Google_Sans',sans-serif] font-medium text-xl text-[var(--md-sys-color-on-surface)] mt-2">
            {isSignUp ? 'Create your Journal Vault' : 'Sign in to Gemini Journal'}
          </h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 max-w-xs">
            Zero-trust encrypted personal reflection workspace. Every entry is strictly isolated to your verified identity.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2 border border-[var(--md-sys-color-error)]/30">
            <MaterialSymbol name="error" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Google Sign-in */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-3 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-sm font-['Google_Sans',sans-serif] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-[var(--md-sys-color-outline-variant)]" />
          <span className="absolute px-3 bg-[var(--md-sys-color-surface)] text-[11px] uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            or use email
          </span>
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-sm text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-sm text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-full bg-[var(--md-sys-color-primary)] hover:opacity-90 text-[var(--md-sys-color-on-primary)] text-sm font-['Google_Sans',sans-serif] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Vault Account' : 'Sign In'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Guest access option */}
        <div className="mt-6 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex flex-col items-center">
          <button
            type="button"
            id="anonymous-signin-btn"
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <MaterialSymbol name="lock_open" size={15} />
            <span>Continue as Temporary Guest (Trial UID)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
