import { auth } from './firebase';
import { UserSession, JournalMessage, JournalSummary, MoodTrendPoint, ActionItem, WeeklyInsightDigest } from '../types';

async function getAuthHeader(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User is not authenticated');
  }
  const idToken = await currentUser.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };
}

export async function fetchSecurityStatus() {
  const res = await fetch('/api/security-status');
  if (!res.ok) throw new Error('Failed to fetch security status');
  return res.json();
}

export async function createSession(title?: string): Promise<UserSession> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create session');
  }
  return res.json();
}

export async function listSessions(): Promise<UserSession[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/sessions', {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to list sessions');
  }
  return res.json();
}

export async function getSession(id: string): Promise<UserSession> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Session not found');
  }
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete session');
  }
}

export async function updateSessionTitle(id: string, title: string): Promise<UserSession> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update session title');
  }
  return res.json();
}

export async function getSessionMessages(sessionId: string): Promise<JournalMessage[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/messages`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load messages');
  }
  return res.json();
}

export async function sendChatMessage(
  sessionId: string,
  text: string
): Promise<{ userMessage: JournalMessage; modelMessage: JournalMessage; moodTag: string; sentiment: string; actionItems?: ActionItem[] }> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send journal entry');
  }
  return res.json();
}

export async function summarizeSession(sessionId: string): Promise<JournalSummary> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/summarize`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate session summary');
  }
  return res.json();
}

export async function getSessionSummary(sessionId: string): Promise<JournalSummary | null> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/summary`, {
    method: 'GET',
    headers,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load summary');
  }
  return res.json();
}

export async function fetchMoodTrends(): Promise<{ totalReflections: number; trends: MoodTrendPoint[] }> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/insights/trends', {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load mood trends');
  }
  return res.json();
}

export async function exportJournalData(): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/export', {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to export journal');
  }
  return res.json();
}

export async function getActionItems(sessionId: string): Promise<ActionItem[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/actions`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load action items');
  }
  return res.json();
}

export async function addActionItem(sessionId: string, text: string): Promise<ActionItem> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/actions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create action item');
  }
  return res.json();
}

export async function toggleActionItem(sessionId: string, actionId: string): Promise<ActionItem> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/actions/${actionId}/toggle`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update action item');
  }
  return res.json();
}

export async function deleteActionItem(sessionId: string, actionId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/sessions/${sessionId}/actions/${actionId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete action item');
  }
}

export async function getWeeklyInsightDigest(): Promise<WeeklyInsightDigest> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/insights/digest', {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate weekly insight digest');
  }
  return res.json();
}

