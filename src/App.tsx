import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, testConnection } from './lib/firebase';
import {
  listSessions,
  createSession,
  deleteSession,
  updateSessionTitle,
  getSessionMessages,
  getSessionSummary,
  sendChatMessage,
  summarizeSession,
  getActionItems,
  addActionItem,
  toggleActionItem,
  deleteActionItem,
} from './lib/api';
import { UserSession, JournalMessage, JournalSummary, ActionItem } from './types';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { AppShell } from './components/AppShell';
import { JournalChat } from './components/JournalChat';
import { MoodTrendsModal } from './components/MoodTrendsModal';
import { ExportModal } from './components/ExportModal';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { WeeklyDigestModal } from './components/WeeklyDigestModal';
import { MaterialSymbol } from './components/MaterialSymbol';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [summary, setSummary] = useState<JournalSummary | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // Modals state
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showThreatModelModal, setShowThreatModelModal] = useState(false);
  const [showWeeklyDigestModal, setShowWeeklyDigestModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  // Run testConnection on app boot as required by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load sessions once user is authenticated
  const loadSessionsList = useCallback(async () => {
    if (!user) return;
    setLoadingSessions(true);
    setErrorMessage(null);
    try {
      const list = await listSessions();
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Could not load sessions:', err);
      setErrorMessage(err?.message || 'Unable to connect to journal vault');
    } finally {
      setLoadingSessions(false);
    }
  }, [user, activeSessionId]);

  useEffect(() => {
    if (user) {
      loadSessionsList();
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      setSummary(null);
    }
  }, [user, loadSessionsList]);

  // Load messages, summary, and action items when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId || !user) {
      setMessages([]);
      setSummary(null);
      setActionItems([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    Promise.all([
      getSessionMessages(activeSessionId),
      getSessionSummary(activeSessionId),
      getActionItems(activeSessionId).catch(() => []),
    ])
      .then(([msgs, sum, acts]) => {
        if (isMounted) {
          setMessages(msgs || []);
          setSummary(sum || null);
          setActionItems(acts || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load session details:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSessionId, user]);

  // Create a new session
  const handleCreateSession = async () => {
    if (!user || creatingSession) return;
    setCreatingSession(true);
    setErrorMessage(null);
    try {
      const now = new Date();
      const defaultTitle = `Reflection — ${now.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })} (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

      const newSess = await createSession(defaultTitle);
      setSessions((prev) => [newSess, ...prev]);
      setActiveSessionId(newSess.id);
      setMessages([]);
      setSummary(null);
      setActionItems([]);
    } catch (err: any) {
      setErrorMessage('Failed to create new reflection: ' + (err?.message || 'Unknown error'));
    } finally {
      setCreatingSession(false);
    }
  };

  // Action Items handlers
  const handleToggleActionItem = async (actionId: string) => {
    if (!activeSessionId) return;
    try {
      const updated = await toggleActionItem(activeSessionId, actionId);
      setActionItems((prev) => prev.map((item) => (item.id === actionId ? updated : item)));
    } catch (err: any) {
      setErrorMessage('Failed to update action item: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleAddActionItem = async (text: string) => {
    if (!activeSessionId) return;
    try {
      const newItem = await addActionItem(activeSessionId, text);
      setActionItems((prev) => [...prev, newItem]);
    } catch (err: any) {
      setErrorMessage('Failed to add action item: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDeleteActionItem = async (actionId: string) => {
    if (!activeSessionId) return;
    try {
      await deleteActionItem(activeSessionId, actionId);
      setActionItems((prev) => prev.filter((item) => item.id !== actionId));
    } catch (err: any) {
      setErrorMessage('Failed to delete action item: ' + (err?.message || 'Unknown error'));
    }
  };

  // Delete a session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      setErrorMessage('Failed to delete reflection: ' + (err?.message || 'Unknown error'));
    }
  };

  // Rename a session
  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      const updated = await updateSessionTitle(id, newTitle);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: updated.title, updatedAt: updated.updatedAt } : s))
      );
    } catch (err: any) {
      setErrorMessage('Failed to rename reflection: ' + (err?.message || 'Unknown error'));
    }
  };

  // Save active session title from top bar
  const handleSaveActiveSessionTitle = async (newTitle: string) => {
    if (!activeSessionId) return;
    await handleRenameSession(activeSessionId, newTitle);
  };

  // Send journal chat turn
  const handleSendMessage = async (text: string) => {
    // If no active session, auto-create one first
    let currentId = activeSessionId;
    if (!currentId) {
      setSending(true);
      try {
        const firstLine = text.slice(0, 40).replace(/\n/g, ' ');
        const now = new Date();
        const autoTitle = firstLine ? `Reflection: ${firstLine}...` : `Reflection — ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
        const newSess = await createSession(autoTitle);
        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
        currentId = newSess.id;
      } catch (err: any) {
        setErrorMessage('Failed to start reflection session: ' + err?.message);
        setLastFailedText(text);
        setSending(false);
        throw err;
      }
    }

    if (!currentId || !user || sending) return;
    setSending(true);
    setErrorMessage(null);

    try {
      const result = await sendChatMessage(currentId, text);

      setMessages((prev) => [...prev, result.userMessage, result.modelMessage]);
      setLastFailedText(null);
      if (result.actionItems) {
        setActionItems(result.actionItems);
      }

      // Update session in list
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
                ...s,
                updatedAt: result.modelMessage.createdAt,
                moodTag: (result.moodTag as any) || s.moodTag,
                messageCount: (s.messageCount || 0) + 2,
              }
            : s
        )
      );
    } catch (err: any) {
      const msg = err?.message || 'Error processing reflection. Please try again.';
      setErrorMessage(msg);
      setLastFailedText(text);
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Generate session summary
  const handleGenerateSummary = async () => {
    if (!activeSessionId || !user || summarizing) return;
    setSummarizing(true);
    setErrorMessage(null);
    try {
      const sum = await summarizeSession(activeSessionId);
      setSummary(sum);
    } catch (err: any) {
      setErrorMessage('Failed to generate summary: ' + (err?.message || 'Requires at least 2 chat turns'));
    } finally {
      setSummarizing(false);
    }
  };

  // Render initial loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <MaterialSymbol
            name="progress_activity"
            size={36}
            className="animate-spin text-[var(--md-sys-color-primary)]"
          />
          <span className="font-['Google_Sans',sans-serif] text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
            Opening your personal vault...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in, show Landing Page with Sign In prompt
  if (!user) {
    return <LandingPage />;
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const canSummarize = (messages.length >= 2 || (activeSession?.messageCount || 0) >= 2);

  return (
    <AppShell
      user={user}
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={(id) => setActiveSessionId(id)}
      onCreateSession={handleCreateSession}
      onDeleteSession={handleDeleteSession}
      onRenameSession={handleRenameSession}
      isCreatingSession={creatingSession}
      onOpenTrends={() => setShowTrendsModal(true)}
      onOpenExport={() => setShowExportModal(true)}
      onOpenThreatModel={() => setShowThreatModelModal(true)}
      onOpenWeeklyDigest={() => setShowWeeklyDigestModal(true)}
      activeSessionTitle={activeSession?.title}
      onSaveActiveSessionTitle={handleSaveActiveSessionTitle}
      onSummarizeSession={canSummarize ? handleGenerateSummary : undefined}
      canSummarize={canSummarize}
      isSummarizing={summarizing}
      hasSummary={!!summary}
    >
      {/* Toast / Error Banner if any */}
      {errorMessage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-4">
          <div className="p-3 rounded-2xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center justify-between shadow-md border border-[var(--md-sys-color-error)]/20 gap-3">
            <div className="flex items-center gap-2 truncate">
              <MaterialSymbol name="error" size={16} className="shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lastFailedText && (
                <button
                  type="button"
                  id="retry-save-btn"
                  onClick={async () => {
                    const retryText = lastFailedText;
                    setLastFailedText(null);
                    setErrorMessage(null);
                    try {
                      await handleSendMessage(retryText);
                    } catch {
                      // Handled by handleSendMessage
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-[var(--md-sys-color-error)] text-white font-medium hover:opacity-90 cursor-pointer text-[11px] shadow-xs"
                >
                  Retry Save
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setLastFailedText(null);
                }}
                className="p-1 hover:opacity-75 cursor-pointer"
                aria-label="Dismiss error"
              >
                <MaterialSymbol name="close" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Journal View */}
      {activeSession ? (
        <JournalChat
          session={activeSession}
          messages={messages}
          summary={summary}
          actionItems={actionItems}
          onToggleActionItem={handleToggleActionItem}
          onAddActionItem={handleAddActionItem}
          onDeleteActionItem={handleDeleteActionItem}
          onSendMessage={handleSendMessage}
          onGenerateSummary={handleGenerateSummary}
          sending={sending}
          summarizing={summarizing}
          onOpenTrends={() => setShowTrendsModal(true)}
          onOpenSecurity={() => setShowThreatModelModal(true)}
          onNewSession={handleCreateSession}
        />
      ) : (
        /* Empty Vault state when user has no active session */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--md-sys-color-surface)] my-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-4">
            <MaterialSymbol name="edit_note" size={32} />
          </div>
          <h2 className="font-['Google_Sans',sans-serif] text-xl font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            No reflection selected
          </h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mb-6 leading-relaxed">
            Begin an encrypted reflection or let Gemini prompt you with mindful exploration.
          </p>
          <button
            type="button"
            id="empty-state-new-session-btn"
            onClick={handleCreateSession}
            disabled={creatingSession}
            className="px-6 py-2.5 bg-[var(--md-sys-color-primary)] hover:opacity-90 text-[var(--md-sys-color-on-primary)] rounded-full text-xs font-['Google_Sans',sans-serif] font-medium tracking-wide transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <MaterialSymbol name="add" size={16} />
            <span>{creatingSession ? 'Opening Session...' : 'Start New Reflection'}</span>
          </button>
        </div>
      )}

      {/* Feature Modals */}
      {showTrendsModal && (
        <MoodTrendsModal onClose={() => setShowTrendsModal(false)} />
      )}

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}

      {showThreatModelModal && (
        <SecurityInspectorModal onClose={() => setShowThreatModelModal(false)} />
      )}

      {showWeeklyDigestModal && (
        <WeeklyDigestModal onClose={() => setShowWeeklyDigestModal(false)} />
      )}
    </AppShell>
  );
}
