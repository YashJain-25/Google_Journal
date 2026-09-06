import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSession } from '../types';
import { Logo } from './Logo';
import { MaterialSymbol } from './MaterialSymbol';
import { SessionListItem } from './SessionListItem';
import { AccountMenu } from './AccountMenu';
import { groupSessionsByDate } from '../lib/dateGrouping';
import { PixelNavBar, PixelTab } from './PixelNavBar';
import { ThemeToggle } from './ThemeToggle';

interface AppShellProps {
  user: FirebaseUser | null;
  sessions: UserSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession?: (id: string, newTitle: string) => Promise<void> | void;
  isCreatingSession?: boolean;
  onOpenTrends: () => void;
  onOpenExport: () => void;
  onOpenThreatModel: () => void;
  onOpenWeeklyDigest?: () => void;
  children: React.ReactNode;
  activeSessionTitle?: string;
  onSaveActiveSessionTitle?: (newTitle: string) => Promise<void> | void;
  onSummarizeSession?: () => void;
  canSummarize?: boolean;
  isSummarizing?: boolean;
  hasSummary?: boolean;
}

const MOOD_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reflective', label: 'Reflective' },
  { id: 'calm', label: 'Calm' },
  { id: 'grateful', label: 'Grateful' },
  { id: 'inspired', label: 'Inspired' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'energized', label: 'Energized' },
];

export const AppShell: React.FC<AppShellProps> = ({
  user,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isCreatingSession = false,
  onOpenTrends,
  onOpenExport,
  onOpenThreatModel,
  onOpenWeeklyDigest,
  children,
  activeSessionTitle,
  onSaveActiveSessionTitle,
  onSummarizeSession,
  canSummarize = false,
  isSummarizing = false,
  hasSummary = false,
}) => {
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PixelTab>('reflections');
  // Desktop rail collapsed state (Gemini style collapsed rail)
  const [railCollapsed, setRailCollapsed] = useState(false);
  // Search and Mood Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  // Inline editing state for active session title in top bar
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(activeSessionTitle || '');

  const handleSelectTab = (tab: PixelTab) => {
    setActiveTab(tab);
    if (tab === 'trends') {
      onOpenTrends();
    } else if (tab === 'vault') {
      onOpenThreatModel();
    } else if (tab === 'at_a_glance') {
      // Toggle session list or start fresh
      onCreateSession();
    }
  };

  useEffect(() => {
    setTitleDraft(activeSessionTitle || '');
    setIsEditingTitle(false);
  }, [activeSessionTitle, activeSessionId]);

  // Close mobile drawer when activeSession changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [activeSessionId]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setIsEditingTitle(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTitleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titleDraft.trim() || titleDraft === activeSessionTitle) {
      setIsEditingTitle(false);
      return;
    }
    if (onSaveActiveSessionTitle) {
      await onSaveActiveSessionTitle(titleDraft.trim());
    }
    setIsEditingTitle(false);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = searchQuery.trim() === '' || s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMoodFilter === 'all' || s.moodTag === selectedMoodFilter;
    return matchesSearch && matchesMood;
  });

  const dateGroups = groupSessionsByDate(filteredSessions);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          role="presentation"
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-200"
        />
      )}

      {/* Left Navigation Rail / Drawer */}
      <aside
        id="app-navigation-rail"
        aria-label="Journal sessions"
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full bg-[var(--md-sys-color-surface-container)] border-r border-[var(--md-sys-color-outline-variant)] transition-all duration-200 ease-in-out select-none ${
          mobileDrawerOpen
            ? 'translate-x-0 w-72 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        } ${railCollapsed ? 'md:w-[68px]' : 'md:w-72'}`}
      >
        {/* Rail Header: Logo + Brand + Collapse/Expand Toggle */}
        {railCollapsed ? (
          <div className="h-16 flex items-center justify-center border-b border-[var(--md-sys-color-outline-variant)]/50 shrink-0 w-full px-2">
            <button
              type="button"
              id="rail-expand-btn"
              onClick={() => setRailCollapsed(false)}
              aria-label="Expand reflections"
              title="Click logo to expand sidebar"
              className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer shadow-xs border border-transparent hover:border-[var(--md-sys-color-outline-variant)]/50 active:scale-95 group"
            >
              <Logo collapsed size="md" className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--md-sys-color-outline-variant)]/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Logo collapsed={false} />
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop toggle collapse */}
              <button
                type="button"
                id="rail-collapse-btn"
                onClick={() => setRailCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
              >
                <MaterialSymbol name="menu_open" size={20} />
              </button>

              {/* Mobile close button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation drawer"
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Primary Action: "New entry" (Pill FAB matching Gemini's "+ New chat") */}
        <div className="p-3 shrink-0">
          <button
            type="button"
            id="rail-new-entry-btn"
            onClick={() => {
              onCreateSession();
              setMobileDrawerOpen(false);
            }}
            disabled={isCreatingSession}
            title="New Journal Reflection"
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-full bg-[var(--md-sys-color-primary-container)] hover:bg-[var(--md-sys-color-primary-hover)]/20 text-[var(--md-sys-color-on-primary-container)] transition-all duration-150 cursor-pointer shadow-xs disabled:opacity-50 font-['Google_Sans',sans-serif] font-medium text-[14px] ${
              railCollapsed ? 'px-0' : 'px-4'
            }`}
            style={{ boxShadow: 'var(--md-elevation-1)' }}
          >
            <MaterialSymbol
              name="add"
              size={20}
              className={isCreatingSession ? 'animate-spin' : ''}
            />
            {!railCollapsed && (
              <span>{isCreatingSession ? 'Opening...' : 'New entry'}</span>
            )}
          </button>
        </div>

        {/* Search bar & Mood Filter (when rail not collapsed) */}
        {!railCollapsed && (
          <div className="px-3 pb-2 shrink-0 space-y-1.5">
            <div className="relative flex items-center">
              <MaterialSymbol
                name="search"
                size={18}
                className="absolute left-3 text-[var(--md-sys-color-on-surface-variant)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections..."
                aria-label="Search reflections"
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[13px] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                >
                  <MaterialSymbol name="close" size={14} />
                </button>
              )}
            </div>

            {/* Mood Tag Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
              {MOOD_FILTERS.map((filter) => {
                const isSelected = selectedMoodFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedMoodFilter(filter.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-['Google_Sans',sans-serif] font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                        : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Active search/filter status hint */}
            {(searchQuery.trim() !== '' || selectedMoodFilter !== 'all') && (
              <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] px-1">
                <span>
                  {filteredSessions.length} {filteredSessions.length === 1 ? 'match' : 'matches'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMoodFilter('all');
                  }}
                  className="text-[var(--md-sys-color-primary)] hover:underline font-medium cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sessions History List (Grouped by Today / Yesterday / Previous 7 days / Older) */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
          {railCollapsed ? (
            /* Icon-only list in collapsed mode */
            <div className="flex flex-col items-center gap-2 py-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  title={session.title}
                  aria-label={session.title}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    activeSessionId === session.id
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <MaterialSymbol name="chat" size={18} />
                </button>
              ))}
            </div>
          ) : dateGroups.length > 0 ? (
            dateGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-4 text-[11px] font-['Google_Sans',sans-serif] font-medium tracking-wider uppercase text-[var(--md-sys-color-on-surface-variant)] opacity-80">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.sessions.map((session) => (
                    <SessionListItem
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      onSelect={(id) => {
                        onSelectSession(id);
                        setMobileDrawerOpen(false);
                      }}
                      onDelete={onDeleteSession}
                      onRename={onRenameSession}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
              {searchQuery ? 'No matching reflections' : 'No reflections yet'}
            </div>
          )}
        </div>

        {/* Bottom Rail Toolbar (Keep/Gemini style utility items) */}
        <div className="p-2 border-t border-[var(--md-sys-color-outline-variant)]/50 shrink-0 space-y-0.5">
          <button
            type="button"
            onClick={onOpenTrends}
            title="Emotional & Sentiment Trends"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer ${
              railCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <MaterialSymbol name="trending_up" size={18} />
            {!railCollapsed && <span>Trends & Analytics</span>}
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            title="Export Encrypted Journal"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer ${
              railCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <MaterialSymbol name="download" size={18} />
            {!railCollapsed && <span>Export Data</span>}
          </button>

          <button
            type="button"
            onClick={onOpenThreatModel}
            title="Zero-Trust Architecture"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer ${
              railCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <MaterialSymbol name="shield" size={18} className="text-emerald-600 dark:text-emerald-400" />
            {!railCollapsed && <span>Security & Rules</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[var(--md-sys-color-surface)] relative">
        {/* Top Bar: Title, Actions, Account & Theme */}
        <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shrink-0 z-10">
          {/* Left: Mobile hamburger (hidden on desktop where rail has its own button) + Editable Session Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <button
              type="button"
              id="top-bar-hamburger-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              title="Open navigation menu"
              className="md:hidden flex w-9 h-9 rounded-full items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer shrink-0"
            >
              <MaterialSymbol name="menu" size={22} />
            </button>

            {/* Mobile Logo Emblem */}
            <div className="md:hidden flex items-center shrink-0 -ml-1">
              <Logo collapsed size="sm" />
            </div>

            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-2 max-w-md w-full">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSubmit}
                  autoFocus
                  className="w-full px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-primary)] text-sm font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)] focus:outline-none"
                  aria-label="Edit reflection title"
                />
                <button
                  type="submit"
                  className="p-1 text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] rounded-full"
                  aria-label="Save title"
                >
                  <MaterialSymbol name="check" size={18} />
                </button>
              </form>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename this reflection"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer py-1 px-2.5 -ml-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] border border-transparent hover:border-[var(--md-sys-color-outline-variant)] transition-all min-w-0"
              >
                <h1 className="font-['Google_Sans',sans-serif] font-medium text-[17px] text-[var(--md-sys-color-on-surface)] truncate tracking-tight">
                  {activeSessionTitle || 'Personal Reflection'}
                </h1>
                <span
                  title="Rename reflection"
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[var(--md-sys-color-on-surface-variant)] opacity-60 group-hover:opacity-100 group-hover:bg-[var(--md-sys-color-surface-container-high)] transition-all shrink-0"
                >
                  <MaterialSymbol name="edit" size={14} />
                </span>
              </div>
            )}
          </div>

          {/* Right Action Icons: Summarize, Insights, Security, Account */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Summarize Action Button (M3 Pill Tonal Button) */}
            {onSummarizeSession && (
              <button
                type="button"
                id="top-bar-summarize-btn"
                onClick={onSummarizeSession}
                disabled={!canSummarize || isSummarizing}
                title={
                  canSummarize
                    ? hasSummary
                      ? 'Regenerate executive summary'
                      : 'Generate Gemini executive summary'
                    : 'Chat at least 2 turns to unlock summary'
                }
                aria-label="Summarize reflection session"
                className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium transition-all ${
                  canSummarize
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:bg-[var(--md-sys-color-primary-hover)]/20 shadow-xs cursor-pointer'
                    : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] opacity-50 cursor-not-allowed'
                }`}
              >
                <MaterialSymbol
                  name={isSummarizing ? 'refresh' : 'auto_awesome'}
                  size={16}
                  className={isSummarizing ? 'animate-spin text-[var(--md-sys-color-primary)]' : ''}
                />
                <span>{isSummarizing ? 'Summarizing...' : hasSummary ? 'Update Summary' : 'Summarize'}</span>
              </button>
            )}

            {/* Weekly Insight Digest Button */}
            {onOpenWeeklyDigest && (
              <button
                type="button"
                id="top-bar-weekly-digest-btn"
                onClick={onOpenWeeklyDigest}
                title="Weekly Insight Digest & Synthesis"
                aria-label="Weekly Insight Digest"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
              >
                <MaterialSymbol name="calendar_view_week" size={20} />
              </button>
            )}

            {/* Quick Analytics Button */}
            <button
              type="button"
              onClick={onOpenTrends}
              title="View Mood Trends"
              aria-label="View Mood Trends"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
            >
              <MaterialSymbol name="insights" size={20} />
            </button>

            {/* Quick Dark/Light Theme Toggle */}
            <ThemeToggle className="shrink-0" />

            {/* Google Account Menu (Avatar with theme toggle and signout) */}
            <AccountMenu user={user} onOpenThreatModel={onOpenThreatModel} />
          </div>
        </header>

        {/* Dynamic Center Pane (Chat & Empty state & Summary) */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {children}
        </div>

        {/* Pixel Navigation Bar (Mobile / Compact Viewports) */}
        <PixelNavBar activeTab={activeTab} onSelectTab={handleSelectTab} />
      </main>
    </div>
  );
};
