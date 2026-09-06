import React, { useState, useRef, useEffect } from 'react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { MaterialSymbol } from './MaterialSymbol';
import { ThemeToggle } from './ThemeToggle';

interface AccountMenuProps {
  user: FirebaseUser | null;
  onOpenThreatModel?: () => void;
  className?: string;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ user, onOpenThreatModel, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Journaler');
  const userInitial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        id="account-menu-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Google Account & Settings"
        className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center font-['Google_Sans',sans-serif] font-medium text-sm shadow-xs hover:ring-2 hover:ring-[var(--md-sys-color-primary)]/40 transition-all cursor-pointer select-none overflow-hidden"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{userInitial}</span>
        )}
      </button>

      {/* Google M3 Account Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-72 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[16px] p-3 shadow-lg z-50 text-[var(--md-sys-color-on-surface)] animate-in fade-in zoom-in-95 duration-150"
          style={{ boxShadow: 'var(--md-elevation-3)' }}
        >
          {/* Header with Account Details */}
          <div className="flex items-center gap-3 p-2 border-b border-[var(--md-sys-color-outline-variant)] pb-3">
            <div className="w-11 h-11 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center font-['Google_Sans',sans-serif] font-medium text-base shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-['Google_Sans',sans-serif] font-medium text-sm truncate text-[var(--md-sys-color-on-surface)]">
                {displayName}
              </div>
              <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                {user?.email || 'Anonymous Guest'}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <MaterialSymbol name="verified_user" size={13} />
                <span>UID Isolated</span>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="py-2.5 px-2 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]">
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
              <MaterialSymbol name="palette" size={18} />
              Theme
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Security details quick link */}
          {onOpenThreatModel && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenThreatModel();
              }}
              className="w-full mt-1 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors text-left cursor-pointer"
            >
              <MaterialSymbol name="shield" size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Security & Zero-Trust Audit</span>
            </button>
          )}

          {/* Sign out */}
          <button
            type="button"
            id="account-signout-btn"
            onClick={handleSignOut}
            className="w-full mt-1 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/30 transition-colors text-left cursor-pointer"
          >
            <MaterialSymbol name="logout" size={18} />
            <span>Sign out of Journal</span>
          </button>
        </div>
      )}
    </div>
  );
};
