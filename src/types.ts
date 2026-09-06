export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  moodTag?: 'reflective' | 'calm' | 'inspired' | 'anxious' | 'grateful' | 'neutral' | 'energized';
  messageCount?: number;
  actionItems?: ActionItem[];
}

export interface JournalMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  sentiment?: string;
  sentimentScore?: number; // -1.0 to 1.0
  createdAt: string;
}

export interface JournalSummary {
  summaryText: string;
  keyThemes: string[];
  updatedAt: string;
}

export interface MoodTrendPoint {
  id: string;
  sessionId: string;
  sessionTitle: string;
  date: string;
  sentiment: string;
  sentimentScore: number;
}

export interface UserSecurityProfile {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  tokenIssuedAt?: string;
  authProvider: string;
}

export interface WeeklyInsightDigest {
  period: string;
  totalEntries: number;
  dominantMood: string;
  emotionalTrajectory: string;
  winsAndBreakthroughs: string[];
  gentleRecommendation: string;
  mindsetTheme: string;
  generatedAt: string;
}
