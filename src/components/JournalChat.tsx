import React, { useState, useRef, useEffect } from 'react';
import { UserSession, JournalMessage, JournalSummary, ActionItem } from '../types';
import { MessageBubble } from './MessageBubble';
import { SummaryCard } from './SummaryCard';
import { SuggestionChip } from './SuggestionChip';
import { Composer } from './Composer';
import { AtAGlanceWidget } from './AtAGlanceWidget';
import { PixelQuickTiles } from './PixelQuickTiles';
import { GoogleProductHero } from './GoogleProductHero';
import { ActionItemsList } from './ActionItemsList';
import { MaterialSymbol } from './MaterialSymbol';

interface JournalChatProps {
  session: UserSession;
  messages: JournalMessage[];
  summary: JournalSummary | null;
  actionItems?: ActionItem[];
  onSendMessage: (text: string) => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  onToggleActionItem?: (id: string) => Promise<void>;
  onAddActionItem?: (text: string) => Promise<void>;
  onDeleteActionItem?: (id: string) => Promise<void>;
  sending: boolean;
  summarizing: boolean;
  onOpenTrends?: () => void;
  onOpenSecurity?: () => void;
  onNewSession?: () => void;
}

const SUGGESTIONS = [
  {
    icon: 'lightbulb',
    label: 'Brainstorm ideas & solutions',
    subtitle: 'Explore fresh creative angles and breakthrough perspectives',
    category: 'Creative',
    accentColor: '#1A73E8',
    glowColor: 'rgba(26, 115, 232, 0.35)',
    badgeBg: 'bg-[#d2e3fc] text-[#0b57d0] dark:bg-[#1A73E8]/30 dark:text-[#A8C7FA]',
    gradient: 'from-[#e8f0fe] via-[#f8faff] to-[#ffffff] dark:from-[#1b2b48] dark:via-[#162035] dark:to-[#131314]',
    borderColor: 'border-[#4285F4]/40 dark:border-[#4285F4]/20',
    prompt: 'I want to brainstorm some fresh ideas and creative solutions for:',
  },
  {
    icon: 'emoji_events',
    label: 'Reflect on a win from today',
    subtitle: 'Acknowledge meaningful milestones, small wins, and progress',
    category: 'Celebration',
    accentColor: '#1E8E3E',
    glowColor: 'rgba(30, 142, 62, 0.35)',
    badgeBg: 'bg-[#ceead6] text-[#0d652d] dark:bg-[#34A853]/30 dark:text-[#81C995]',
    gradient: 'from-[#e6f4ea] via-[#f5fbf7] to-[#ffffff] dark:from-[#1a3826] dark:via-[#14291c] dark:to-[#131314]',
    borderColor: 'border-[#34A853]/40 dark:border-[#34A853]/20',
    prompt: 'Today, I want to reflect on an accomplishment or moment that went well and why it mattered to me:',
  },
  {
    icon: 'self_improvement',
    label: 'Process a stressful thought',
    subtitle: 'Untangle lingering tension and restore calm emotional balance',
    category: 'Clarity',
    accentColor: '#D93025',
    glowColor: 'rgba(217, 48, 37, 0.35)',
    badgeBg: 'bg-[#fad2cf] text-[#a50e0e] dark:bg-[#EA4335]/30 dark:text-[#F28B82]',
    gradient: 'from-[#fce8e6] via-[#fef7f6] to-[#ffffff] dark:from-[#3e211f] dark:via-[#2b1817] dark:to-[#131314]',
    borderColor: 'border-[#EA4335]/40 dark:border-[#EA4335]/20',
    prompt: 'I have been carrying some tension about a situation today. Here is what happened and how I am feeling:',
  },
  {
    icon: 'wb_sunny',
    label: 'Set an intention for tomorrow',
    subtitle: 'Choose one purposeful focus area to guide your energy forward',
    category: 'Focus',
    accentColor: '#E37400',
    glowColor: 'rgba(227, 116, 0, 0.35)',
    badgeBg: 'bg-[#feefc3] text-[#8a3800] dark:bg-[#FBBC05]/30 dark:text-[#FDD663]',
    gradient: 'from-[#fef7e0] via-[#fffcf3] to-[#ffffff] dark:from-[#3d2f16] dark:via-[#2b2110] dark:to-[#131314]',
    borderColor: 'border-[#FBBC05]/50 dark:border-[#FBBC05]/20',
    prompt: 'Looking ahead to tomorrow, my primary intention and how I want to show up is:',
  },
  {
    icon: 'favorite',
    label: 'Explore genuine gratitude',
    subtitle: 'Notice the people, quiet comforts, and moments of warmth',
    category: 'Mindfulness',
    accentColor: '#9334E6',
    glowColor: 'rgba(147, 52, 230, 0.35)',
    badgeBg: 'bg-[#ede7f6] text-[#581c87] dark:bg-[#9B72CB]/30 dark:text-[#D7AEFB]',
    gradient: 'from-[#f3e8fd] via-[#faf5ff] to-[#ffffff] dark:from-[#2e1d3e] dark:via-[#221730] dark:to-[#131314]',
    borderColor: 'border-[#9B72CB]/40 dark:border-[#9B72CB]/20',
    prompt: 'Three things or people I felt genuinely grateful for today, and why:',
  },
  {
    icon: 'explore',
    label: 'Weekly perspective & vision',
    subtitle: 'Step back to evaluate alignment with your core principles',
    category: 'Horizon',
    accentColor: '#007B83',
    glowColor: 'rgba(0, 123, 131, 0.35)',
    badgeBg: 'bg-[#b2dfdb] text-[#004d40] dark:bg-[#00796B]/30 dark:text-[#78D9EC]',
    gradient: 'from-[#e0f2f1] via-[#f2faf9] to-[#ffffff] dark:from-[#133033] dark:via-[#0e2124] dark:to-[#131314]',
    borderColor: 'border-[#00796B]/40 dark:border-[#00796B]/20',
    prompt: 'Taking a step back to view the bigger picture this week: what values are guiding my decisions right now?',
  },
];

export const JournalChat: React.FC<JournalChatProps> = ({
  session,
  messages,
  summary,
  actionItems = [],
  onSendMessage,
  onGenerateSummary,
  onToggleActionItem,
  onAddActionItem,
  onDeleteActionItem,
  sending,
  summarizing,
  onOpenTrends,
  onOpenSecurity,
  onNewSession,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages or state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    await onSendMessage(text);
  };

  const handleChipClick = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--md-sys-color-surface)]">
      {/* Scrollable Message & Content Stream */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 pb-36 sm:pb-40"
      >
        <div className="max-w-[760px] mx-auto min-h-full flex flex-col">
          {/* Executive Summary Card (if generated) */}
          {summary && (
            <SummaryCard
              summary={summary}
              onRefresh={onGenerateSummary}
              isRefreshing={summarizing}
            />
          )}

          {/* Action Items & Commitments (Extracted by Gemini) */}
          {(actionItems.length > 0 || messages.length > 0) && onToggleActionItem && onAddActionItem && onDeleteActionItem && (
            <div className="mb-4">
              <ActionItemsList
                actionItems={actionItems}
                onToggle={onToggleActionItem}
                onAdd={onAddActionItem}
                onDelete={onDeleteActionItem}
              />
            </div>
          )}

          {/* Empty State: Pixel Homescreen / Gemini Experience */}
          {messages.length === 0 ? (
            <div className="py-4 flex flex-col items-center">
              {/* Pixel At a Glance Widget */}
              <AtAGlanceWidget
                onQuickPrompt={(p) => setInputText(p)}
                streakCount={3}
                totalReflections={session.messageCount || 1}
                className="mb-4"
              />

              {/* Pixel Quick Settings / Quick Tiles */}
              <PixelQuickTiles
                onNewEntry={onNewSession || (() => {})}
                onOpenVoice={() => setInputText('Speech note: ')}
                onOpenTrends={onOpenTrends || (() => {})}
                onOpenSecurity={onOpenSecurity || (() => {})}
              />

              {/* Google Products Logo & Capability Hero (Styled like Google Stitch / Google AI Studio) */}
              <GoogleProductHero
                onSelectPrompt={(prompt) => handleChipClick(prompt)}
                onOpenTrends={onOpenTrends}
                onOpenSecurity={onOpenSecurity}
                onNewSession={onNewSession}
              />

              {/* Quick Thought Starters (Suggestion Chips) - Symmetrical Guided Inquiries */}
              <div className="w-full max-w-[760px] text-left mt-6 mb-8">
                <div className="flex items-center justify-between px-1 mb-3">
                  <div className="flex items-center gap-2">
                    <MaterialSymbol name="psychology_alt" size={18} className="text-[#1A73E8] dark:text-[#8AB4F8]" />
                    <span className="text-[12px] font-['Google_Sans',sans-serif] font-semibold tracking-wider uppercase text-[#1A73E8] dark:text-[#8AB4F8]">
                      Guided Inquiries
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-80 font-mono font-medium">
                    6 Symmetrical Prompts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                  {SUGGESTIONS.map((chip, idx) => (
                    <SuggestionChip
                      key={idx}
                      icon={chip.icon}
                      label={chip.label}
                      subtitle={chip.subtitle}
                      category={chip.category}
                      accentColor={chip.accentColor}
                      glowColor={chip.glowColor}
                      badgeBg={chip.badgeBg}
                      gradient={chip.gradient}
                      borderColor={chip.borderColor}
                      onClick={() => handleChipClick(chip.prompt)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Turns */
            <div className="flex-1 space-y-2 pb-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  variant={msg.role === 'user' ? 'user' : 'model'}
                />
              ))}

              {/* Gemini Reflecting / Typing State */}
              {sending && (
                <div className="flex items-start gap-4 my-6 mr-auto">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)]">
                    <svg
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 animate-pulse"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2C14 7.52285 18.4772 12 24 12C18.4772 12 14 16.4772 14 22C14 16.4772 9.52285 12 4 12C9.52285 12 14 7.52285 14 2Z"
                        fill="#1A73E8"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--md-sys-color-surface-container)] text-xs text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-bounce [animation-delay:300ms]" />
                    <span className="font-['Google_Sans',sans-serif] ml-1 font-medium">
                      Gemini is thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Pixel Pill Composer Pinned to Bottom */}
      <Composer
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
        sending={sending}
      />
    </div>
  );
};

