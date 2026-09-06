import { UserSession } from '../types';

export interface GroupedSessions {
  today: UserSession[];
  yesterday: UserSession[];
  previous7Days: UserSession[];
  older: UserSession[];
}

export function groupSessionsByDate(sessions: UserSession[]): { label: string; sessions: UserSession[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - oneDayMs;
  const startOfPrevious7Days = startOfToday - 7 * oneDayMs;

  const groups: GroupedSessions = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  };

  // Sort sessions descending by updatedAt
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  for (const session of sorted) {
    const sessionTime = new Date(session.updatedAt || session.createdAt).getTime();

    if (sessionTime >= startOfToday) {
      groups.today.push(session);
    } else if (sessionTime >= startOfYesterday) {
      groups.yesterday.push(session);
    } else if (sessionTime >= startOfPrevious7Days) {
      groups.previous7Days.push(session);
    } else {
      groups.older.push(session);
    }
  }

  const result: { label: string; sessions: UserSession[] }[] = [];

  if (groups.today.length > 0) {
    result.push({ label: 'Today', sessions: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ label: 'Yesterday', sessions: groups.yesterday });
  }
  if (groups.previous7Days.length > 0) {
    result.push({ label: 'Previous 7 days', sessions: groups.previous7Days });
  }
  if (groups.older.length > 0) {
    result.push({ label: 'Older', sessions: groups.older });
  }

  return result;
}
