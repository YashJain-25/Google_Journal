import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  verifyToken,
  createSession,
  listSessions,
  getSession,
  deleteSession,
  updateSessionTitle,
  getSessionMessages,
  addMessagesToSession,
  saveSessionSummary,
  getSessionSummary,
  getUserMoodTrends,
  exportUserData,
  getActionItems,
  addActionItem,
  toggleActionItem,
  deleteActionItem,
  mergeDetectedActionItems,
  getRecentEntriesForDigest,
  VerifiedUser,
} from './src/server/db.js';
import { generateJournalReply, generateSessionSummary, generateWeeklyInsightDigest } from './src/server/gemini.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Extend express Request to attach verified user
declare global {
  namespace Express {
    interface Request {
      user?: VerifiedUser;
    }
  }
}

// ------------------------------------------------------------
// Rate-Limiting & Anti-Denial-of-Wallet Tracker (Per User Daily)
// ------------------------------------------------------------
const userRateLimits: Record<string, { count: number; resetTime: number }> = {};
const MAX_REQUESTS_PER_DAY = 200;

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const userLimit = userRateLimits[uid];

  if (!userLimit || now > userLimit.resetTime) {
    userRateLimits[uid] = {
      count: 1,
      resetTime: now + 24 * 60 * 60 * 1000, // 24 hours
    };
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_DAY) {
    return false;
  }

  userLimit.count += 1;
  return true;
}

// ------------------------------------------------------------
// Authentication Middleware (Zero-Trust Identity Derivation)
// ------------------------------------------------------------
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const verifiedUser = await verifyToken(token);
    req.user = verifiedUser;
    next();
  } catch (err: any) {
    console.warn('Authentication rejected:', err?.message || 'Invalid token');
    res.status(401).json({ error: 'Unauthorized: Invalid token signature or expired credentials' });
  }
}

// ------------------------------------------------------------
// API Endpoints
// ------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Personal Gemini Journal API',
    time: new Date().toISOString(),
  });
});

// 2. Security status
app.get('/api/security-status', (req: Request, res: Response) => {
  res.json({
    zeroTrustEnabled: true,
    dataIsolation: 'Per-UID Firestore subcollections (/users/{uid}/**)',
    rulesDefaultDeny: true,
    summaryClientWriteLocked: true,
    geminiSecretEncapsulation: 'Server-side runtime only',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 3. Create Session
app.post('/api/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { title } = req.body || {};
    const session = await createSession(uid, title);
    res.status(201).json(session);
  } catch (err) {
    console.error('Failed to create session:', err);
    res.status(500).json({ error: 'Failed to create journal session' });
  }
});

// 4. List Sessions
app.get('/api/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessions = await listSessions(uid);
    res.json(sessions);
  } catch (err) {
    console.error('Failed to list sessions:', err);
    res.status(500).json({ error: 'Failed to retrieve journal sessions' });
  }
});

// 5. Get Session (Strict 404 on ownership mismatch to prevent data leakage)
app.get('/api/sessions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const session = await getSession(uid, sessionId);

    if (!session) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// 6. Delete Session (Strict 404 on ownership mismatch)
app.delete('/api/sessions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const deleted = await deleteSession(uid, sessionId);

    if (!deleted) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    res.json({ success: true, message: 'Session securely purged' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Update Session Title
app.patch('/api/sessions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const { title } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Valid title is required' });
      return;
    }

    const updated = await updateSessionTitle(uid, sessionId, title.trim());
    if (!updated) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session title' });
  }
});

// 7. Get Messages for Session
app.get('/api/sessions/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const messages = await getSessionMessages(uid, sessionId);

    if (messages === null) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session messages' });
  }
});

// 8. Chat Turn / Journal Reflection (Gemini processing)
app.post('/api/sessions/:id/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const { text } = req.body || {};

    // Validate input
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Journal entry text is required' });
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      res.status(400).json({ error: 'Journal entry cannot be empty' });
      return;
    }

    if (trimmedText.length > 10000) {
      res.status(400).json({ error: 'Journal entry exceeds maximum permitted length (10,000 characters)' });
      return;
    }

    // Check rate limits
    if (!checkRateLimit(uid)) {
      res.status(429).json({ error: 'Daily journal quota reached. Please return tomorrow.' });
      return;
    }

    // Verify session ownership
    const session = await getSession(uid, sessionId);
    if (!session) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    // Load prior turns for this session
    const priorMessages = (await getSessionMessages(uid, sessionId)) || [];
    const conversationHistory = priorMessages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    // Call Gemini for reflection and sentiment tagging
    const geminiResult = await generateJournalReply(conversationHistory, trimmedText);

    // Persist messages to store and database
    const saved = await addMessagesToSession(
      uid,
      sessionId,
      {
        text: trimmedText,
        sentiment: geminiResult.sentiment,
        sentimentScore: geminiResult.sentimentScore,
      },
      {
        text: geminiResult.reply,
      },
      geminiResult.moodTag
    );

    // Merge any detected concrete commitments/action items into session
    let sessionActionItems = await getActionItems(uid, sessionId);
    if (geminiResult.detectedActionItems && geminiResult.detectedActionItems.length > 0) {
      sessionActionItems = await mergeDetectedActionItems(uid, sessionId, geminiResult.detectedActionItems);
    }

    res.json({
      userMessage: saved.userMessage,
      modelMessage: saved.modelMessage,
      moodTag: geminiResult.moodTag,
      sentiment: geminiResult.sentiment,
      actionItems: sessionActionItems,
    });
  } catch (err: any) {
    console.error('Chat reflection error:', err?.message || err);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your journal reflection. Please try again.',
    });
  }
});

// 9. Summarize Session (Backend writes summary with system authority)
app.post('/api/sessions/:id/summarize', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;

    // Verify session ownership
    const session = await getSession(uid, sessionId);
    if (!session) {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }

    const messages = (await getSessionMessages(uid, sessionId)) || [];
    if (messages.length === 0) {
      res.status(400).json({ error: 'Cannot summarize an empty journal session' });
      return;
    }

    // Call Gemini for structured summary
    const summary = await generateSessionSummary(session.title, messages);

    // Save summary document (locked from client-side writes by Firestore rules)
    const savedSummary = await saveSessionSummary(uid, sessionId, summary);

    res.json(savedSummary);
  } catch (err: any) {
    console.error('Session summarization error:', err?.message || err);
    res.status(500).json({ error: 'Failed to generate session summary' });
  }
});

// 10. Get Summary
app.get('/api/sessions/:id/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const summary = await getSessionSummary(uid, sessionId);

    if (!summary) {
      res.status(404).json({ error: 'Summary not generated yet for this session' });
      return;
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session summary' });
  }
});

// 11. Mood Trends Insight (Aggregated strictly per-UID)
app.get('/api/insights/trends', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const trends = await getUserMoodTrends(uid);
    res.json({
      totalReflections: trends.length,
      trends,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to aggregate mood trends' });
  }
});

// 12. Encrypted / Structured Journal Export
app.get('/api/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const exportedData = await exportUserData(uid);
    res.json(exportedData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export journal archive' });
  }
});

// 13. Action Items: List Session Actions
app.get('/api/sessions/:id/actions', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const items = await getActionItems(uid, sessionId);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve action items' });
  }
});

// 14. Action Items: Add Action Item
app.post('/api/sessions/:id/actions', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const { text } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Action item text is required' });
      return;
    }

    const item = await addActionItem(uid, sessionId, text.trim());
    res.status(201).json(item);
  } catch (err: any) {
    if (err?.message === 'SESSION_NOT_FOUND') {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to create action item' });
  }
});

// 15. Action Items: Toggle Completion
app.patch('/api/sessions/:id/actions/:actionId/toggle', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const actionId = req.params.actionId;

    const item = await toggleActionItem(uid, sessionId, actionId);
    if (!item) {
      res.status(404).json({ error: 'Action item not found' });
      return;
    }

    res.json(item);
  } catch (err: any) {
    if (err?.message === 'SESSION_NOT_FOUND') {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to toggle action item' });
  }
});

// 16. Action Items: Delete Action Item
app.delete('/api/sessions/:id/actions/:actionId', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const sessionId = req.params.id;
    const actionId = req.params.actionId;

    const deleted = await deleteActionItem(uid, sessionId, actionId);
    if (!deleted) {
      res.status(404).json({ error: 'Action item not found' });
      return;
    }

    res.json({ success: true, id: actionId });
  } catch (err: any) {
    if (err?.message === 'SESSION_NOT_FOUND') {
      res.status(404).json({ error: 'Journal session not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

// 17. Weekly Personal Insight Digest (Past 7 Days Holistic Synthesis)
app.get('/api/insights/digest', requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.uid;
    const entries = await getRecentEntriesForDigest(uid, 7);
    const digest = await generateWeeklyInsightDigest(entries);
    res.json(digest);
  } catch (err: any) {
    console.error('Weekly digest generation error:', err?.message || err);
    res.status(500).json({ error: 'Failed to synthesize weekly insight digest' });
  }
});

// ------------------------------------------------------------
// Vite Middleware / Static Serving
// ------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Gemini Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
