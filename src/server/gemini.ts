import { GoogleGenAI, Type } from '@google/genai';
import { JournalMessage, WeeklyInsightDigest } from '../types';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Detects if an error is a recoverable Google GenAI error, such as:
 * - 503 UNAVAILABLE (Model experiencing high demand)
 * - 429 RESOURCE_EXHAUSTED (Rate limit / Quota spike)
 * - 404 NOT_FOUND (Model version alias unmapped or migrating)
 * - 500 INTERNAL / 504 Gateway / Service timeouts
 */
function isRecoverableError(err: any): boolean {
  if (!err) return false;
  const msg =
    typeof err === 'string'
      ? err
      : `${err?.message || ''} ${err?.status || ''} ${err?.code || ''} ${JSON.stringify(err || '')}`;

  return (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('404') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('500') ||
    msg.includes('INTERNAL') ||
    msg.includes('high demand') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('try again') ||
    msg.includes('temporarily') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNRESET') ||
    msg.includes('socket hang up')
  );
}

/**
 * Resilient Gemini Model Fallback Ladder:
 * - Primary: 'gemini-3.6-flash'
 * - High-Availability Fallback: 'gemini-3.1-flash-lite'
 * - Dynamic Alias: 'gemini-flash-latest'
 * - Deep Reasoning Fallback: 'gemini-3.7-flash'
 * - Stable Fallback: 'gemini-2.5-flash'
 */
export const RESILIENT_MODEL_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
];

/**
 * Reusable helper utility to execute content generation with automated fallback ladder.
 */
export async function generateContentWithFallback<T>(
  callFn: (modelName: string) => Promise<T>,
  description = 'Gemini API call'
): Promise<T> {
  let lastError: any = null;

  for (let i = 0; i < RESILIENT_MODEL_LADDER.length; i++) {
    const model = RESILIENT_MODEL_LADDER[i];
    try {
      const result = await callFn(model);
      return result;
    } catch (err: any) {
      lastError = err;
      const isRecoverable = isRecoverableError(err);
      console.log(
        `[Gemini Resilience] ${description} using ${model} encountered error: ${err?.message || 'issue'}, recoverable: ${isRecoverable}`
      );

      if (isRecoverable) {
        // Apply backoff jitter before attempting the next fallback tier
        const delay = 300 + Math.floor(Math.random() * 300);
        await sleep(delay);
        continue;
      }

      // Non-recoverable error (e.g. invalid API key or bad request)
      throw err;
    }
  }

  throw lastError;
}

const JOURNAL_SYSTEM_INSTRUCTION = `You are an empathetic, insightful, and versatile personal journaling and thinking companion powered by Gemini.
Your goal is to help the user reflect deeply, unpack their thoughts and feelings, brainstorm creative ideas and solutions, and discover positive perspectives or actionable clarity.
- When the user is reflecting or journaling: Keep your tone warm, non-judgmental, grounded, and concise. Validate their experience and ask 1 or 2 gentle, thought-provoking questions.
- When the user asks to brainstorm or explore ideas: Provide thoughtful, structured suggestions, unexpected angles, and creative possibilities.
- When the user asks for reflection or summary: Offer crisp, clear insights, highlighting core patterns and takeaways.
- Always communicate with clarity, empathy, and respect for user privacy.`;

export interface ChatCompletionResult {
  reply: string;
  sentiment: string;
  sentimentScore: number; // between -1.0 (very negative) and 1.0 (very positive)
  moodTag: 'reflective' | 'calm' | 'inspired' | 'anxious' | 'grateful' | 'neutral' | 'energized';
  detectedActionItems?: string[];
}

export async function generateJournalReply(
  history: { role: 'user' | 'model'; text: string }[],
  newEntry: string
): Promise<ChatCompletionResult> {
  const ai = getGeminiClient();

  // Format contents array for Gemini
  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    {
      role: 'user',
      parts: [{ text: newEntry }],
    },
  ];

  let replyText =
    'Thank you for sharing your thoughts. Take a quiet breath—how does your body feel right now?';

  try {
    const response = await generateContentWithFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: JOURNAL_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }, 'Journal Chat Reply');

    if (response?.text) {
      replyText = response.text;
    }
  } catch (err: any) {
    console.warn('Journal reply fallback used after API exhaustion:', err?.message || err);
    replyText =
      'Thank you for sharing your thoughts so openly. It takes real courage to pause and put your feelings into words. Take a gentle breath—what part of this feels most important for you to honor right now?';
  }

  // Baseline heuristic sentiment analysis
  let sentiment = 'Reflective';
  let sentimentScore = 0.2;
  let moodTag: ChatCompletionResult['moodTag'] = 'reflective';
  let detectedActionItems: string[] = [];

  // Heuristic action item detection (regex fallback)
  const actionRegexes = [
    /(?:need to|should|must|will|plan to|want to|have to|going to|intend to)\s+([a-zA-Z0-9\s,'-]{4,60})/gi,
    /(?:don't forget to|remember to|make sure to)\s+([a-zA-Z0-9\s,'-]{4,60})/gi,
  ];
  for (const rx of actionRegexes) {
    let match;
    while ((match = rx.exec(newEntry)) !== null) {
      const phrase = match[1]?.trim().replace(/[.,;:!?]+$/, '');
      if (phrase && phrase.length > 5 && phrase.length < 80 && !detectedActionItems.includes(phrase)) {
        // Capitalize first letter
        const formatted = phrase.charAt(0).toUpperCase() + phrase.slice(1);
        detectedActionItems.push(formatted);
      }
    }
  }

  const lower = newEntry.toLowerCase();
  if (/gratitude|grateful|thankful|blessed|appreciate/.test(lower)) {
    sentiment = 'Grateful';
    sentimentScore = 0.75;
    moodTag = 'grateful';
  } else if (/anxious|anxiety|worried|worry|stress|overwhelm|panic|fear|nervous/.test(lower)) {
    sentiment = 'Anxious';
    sentimentScore = -0.45;
    moodTag = 'anxious';
  } else if (/calm|peace|quiet|relax|breathe|serene|grounded|still/.test(lower)) {
    sentiment = 'Calm';
    sentimentScore = 0.65;
    moodTag = 'calm';
  } else if (/inspired|excited|hopeful|energized|motivat|create|joy|happy/.test(lower)) {
    sentiment = 'Inspired';
    sentimentScore = 0.8;
    moodTag = 'inspired';
  } else if (/tired|exhaust|sad|down|heavy|lonely|hurt|frustrat/.test(lower)) {
    sentiment = 'Processing';
    sentimentScore = -0.3;
    moodTag = 'reflective';
  }

  // Attempt Gemini mood & action item refinement with resilience; falls back gracefully to heuristic
  try {
    const sentimentAnalysis = await generateContentWithFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: `Analyze the mood and extract any concrete next steps or commitments from this reflection: "${newEntry.slice(0, 1000)}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: {
                type: Type.STRING,
                description: 'Primary emotion word e.g. Grateful, Reflective, Anxious, Hopeful, Content, Frustrated',
              },
              score: {
                type: Type.NUMBER,
                description: 'Sentiment positivity from -1.0 (very negative) to 1.0 (very positive)',
              },
              moodTag: {
                type: Type.STRING,
                enum: ['reflective', 'calm', 'inspired', 'anxious', 'grateful', 'neutral', 'energized'],
              },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Concrete intentions, commitments, or next steps mentioned by the user (e.g., "Schedule dentist appointment", "Call Mom", "Go for a walk"). Empty array if none.',
              },
            },
            required: ['sentiment', 'score', 'moodTag'],
          },
        },
      });
    }, 'Sentiment & Action Extraction');

    if (sentimentAnalysis?.text) {
      const parsed = JSON.parse(sentimentAnalysis.text);
      if (parsed.sentiment) sentiment = parsed.sentiment;
      if (typeof parsed.score === 'number') sentimentScore = parsed.score;
      if (parsed.moodTag) moodTag = parsed.moodTag;
      if (Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0) {
        detectedActionItems = parsed.actionItems
          .map((item: string) => String(item).trim())
          .filter((item: string) => item.length > 2 && item.length < 150);
      }
    }
  } catch (err) {
    console.warn('Sentiment & action refinement notice:', err);
  }

  return {
    reply: replyText,
    sentiment,
    sentimentScore,
    moodTag,
    detectedActionItems: detectedActionItems.slice(0, 5),
  };
}

export interface SummaryResult {
  summaryText: string;
  keyThemes: string[];
}

/**
 * Heuristic summary synthesis used when external model endpoints encounter temporary
 * capacity limits or 503 spikes across all models.
 */
function generateHeuristicSummary(
  sessionTitle: string,
  messages: { role: string; text: string }[]
): SummaryResult {
  const userEntries = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.text.trim())
    .filter(Boolean);

  const words = userEntries
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/);

  const commonStopWords = new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'was', 'for', 'on', 'with',
    'as', 'at', 'this', 'but', 'my', 'have', 'had', 'feel', 'feeling', 'like', 'just', 'so',
    'me', 'be', 'are', 'not', 'you', 'about', 'from', 'can', 'will', 'do', 'did', 'all', 'what',
  ]);

  const freq: Record<string, number> = {};
  for (const w of words) {
    if (w.length > 3 && !commonStopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const topWords = Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

  const fallbackThemes =
    topWords.length >= 2
      ? [...topWords, 'Mindfulness']
      : ['Personal Reflection', 'Emotional Balance', 'Self-Discovery', 'Mindfulness'];

  const sampleThought =
    userEntries.length > 0
      ? `You explored themes touching on "${userEntries[0].slice(0, 110)}${userEntries[0].length > 110 ? '...' : ''}"`
      : 'You held space to pause, reflect, and unpack current thoughts.';

  const summaryText = `During this reflection titled "${sessionTitle}", you engaged in mindful introspection. ${sampleThought}

Throughout this conversation, you explored emotional nuance and personal priorities with authenticity. Continuing to return to these reflections provides a grounding anchor for clarity, self-compassion, and purposeful growth.`;

  return {
    summaryText,
    keyThemes: fallbackThemes,
  };
}

export async function generateSessionSummary(
  sessionTitle: string,
  messages: { role: 'user' | 'model'; text: string; createdAt: string }[]
): Promise<SummaryResult> {
  const ai = getGeminiClient();

  const conversationTranscript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join('\n\n');

  const prompt = `Review the following personal journaling session titled "${sessionTitle}".
Synthesize a thoughtful executive reflection that captures key insights, recurring emotional threads, and meaningful personal takeaways.

TRANSCRIPT:
${conversationTranscript}

Provide a structured JSON output with:
1. "summaryText": A 2-3 paragraph reflective synthesis.
2. "keyThemes": An array of 3 to 5 key themes or focal topics.`;

  try {
    const response = await generateContentWithFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryText: {
                type: Type.STRING,
                description: 'Reflective executive synthesis of the journal session',
              },
              keyThemes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Core themes and insights',
              },
            },
            required: ['summaryText', 'keyThemes'],
          },
        },
      });
    }, 'Session Summary');

    if (response?.text) {
      try {
        const parsed = JSON.parse(response.text);
        if (parsed.summaryText) {
          return {
            summaryText: parsed.summaryText,
            keyThemes:
              Array.isArray(parsed.keyThemes) && parsed.keyThemes.length > 0
                ? parsed.keyThemes
                : ['Personal Reflection', 'Self-Discovery', 'Mindfulness'],
          };
        }
      } catch (parseErr) {
        console.warn('JSON parsing notice for summary:', parseErr);
        if (response.text.trim()) {
          return {
            summaryText: response.text.trim(),
            keyThemes: ['Mindfulness', 'Personal Growth', 'Reflection'],
          };
        }
      }
    }
  } catch (err: any) {
    console.log(
      '[Gemini Resilience] Model generation paused; using heuristic synthesis:',
      err?.message || 'high demand'
    );
  }

  // Gracefully generate thoughtful synthesis so the user is never blocked by upstream 503 spikes
  return generateHeuristicSummary(sessionTitle, messages);
}

// ------------------------------------------------------------
// Weekly Personal Insight Digest
// ------------------------------------------------------------

export async function generateWeeklyInsightDigest(
  entries: { sessionTitle: string; messages: JournalMessage[]; createdAt: string }[]
): Promise<WeeklyInsightDigest> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const periodStr = `${weekAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const totalEntries = entries.reduce((acc, e) => acc + e.messages.length, 0);

  if (entries.length === 0 || totalEntries === 0) {
    return {
      period: periodStr,
      totalEntries: 0,
      dominantMood: 'Reflective',
      emotionalTrajectory: 'A fresh canvas waiting for your thoughts.',
      winsAndBreakthroughs: [
        'Opened your personal space for mindful self-expression.',
        'Set the intention to track your feelings with zero-trust privacy.',
      ],
      gentleRecommendation: 'Take 5 minutes today to write down what feels most present in your mind, without judgment.',
      mindsetTheme: 'Beginnings & Gentle Awareness',
      generatedAt: now.toISOString(),
    };
  }

  // Compile user texts for holistic Gemini synthesis
  const compiledCorpus = entries
    .map((e) => {
      const userTurns = e.messages
        .filter((m) => m.role === 'user')
        .map((m) => `- "${m.text.slice(0, 300)}" (${m.sentiment || 'Reflective'})`)
        .join('\n');
      return `Session: "${e.sessionTitle}" (${new Date(e.createdAt).toLocaleDateString()}):\n${userTurns}`;
    })
    .join('\n\n')
    .slice(0, 4000);

  const ai = getGeminiClient();

  try {
    const response = await generateContentWithFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: `You are an empathetic, insightful wellness mentor. Review this week's journal reflections and synthesize a holistic personal growth digest:\n\n${compiledCorpus}`,
        config: {
          systemInstruction:
            'Synthesize the user reflections from the past 7 days. Identify dominant emotional trajectories, celebrate real breakthroughs/wins, and offer a gentle, grounding recommendation for the week ahead.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dominantMood: {
                type: Type.STRING,
                description: 'Dominant emotional state across the week (e.g. Grateful, Resilient, In Transition, Grounded)',
              },
              emotionalTrajectory: {
                type: Type.STRING,
                description: '1-2 sentences describing the emotional curve or shift through the week',
              },
              winsAndBreakthroughs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 bullet points highlighting user accomplishments, insights, or positive moments',
              },
              gentleRecommendation: {
                type: Type.STRING,
                description: 'A thoughtful, encouraging, practical suggestion for the upcoming week',
              },
              mindsetTheme: {
                type: Type.STRING,
                description: 'Short 2-4 word theme phrase e.g. "Cultivating Stillness", "Courage in Action"',
              },
            },
            required: ['dominantMood', 'emotionalTrajectory', 'winsAndBreakthroughs', 'gentleRecommendation', 'mindsetTheme'],
          },
        },
      });
    }, 'Weekly Digest Synthesis');

    if (response?.text) {
      const parsed = JSON.parse(response.text);
      return {
        period: periodStr,
        totalEntries,
        dominantMood: parsed.dominantMood || 'Reflective',
        emotionalTrajectory: parsed.emotionalTrajectory || 'Showed steady engagement with personal thoughts and intentions.',
        winsAndBreakthroughs:
          Array.isArray(parsed.winsAndBreakthroughs) && parsed.winsAndBreakthroughs.length > 0
            ? parsed.winsAndBreakthroughs
            : ['Maintained consistent reflection practice.'],
        gentleRecommendation: parsed.gentleRecommendation || 'Protect a few minutes each morning to notice how you feel before diving into daily demands.',
        mindsetTheme: parsed.mindsetTheme || 'Presence & Self-Kindness',
        generatedAt: now.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Weekly digest Gemini API notice, falling back to heuristic:', err);
  }

  // Heuristic synthesis fallback
  return {
    period: periodStr,
    totalEntries,
    dominantMood: 'Reflective',
    emotionalTrajectory: 'Demonstrated dedicated self-awareness across multiple reflection sessions this past week.',
    winsAndBreakthroughs: [
      `Logged ${totalEntries} reflection moments across ${entries.length} sessions.`,
      'Engaged with challenging thoughts with vulnerability and honesty.',
      'Clarified ongoing intentions for the week ahead.',
    ],
    gentleRecommendation: 'Acknowledge how much ground you covered this week. Celebrate the small victories that often go unnoticed.',
    mindsetTheme: 'Grounded Resilience',
    generatedAt: now.toISOString(),
  };
}

