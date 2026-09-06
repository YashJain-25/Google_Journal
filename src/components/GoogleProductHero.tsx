import React from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { triggerPixelHaptic } from '../lib/pixelTheme';

interface GoogleProductHeroProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenTrends?: () => void;
  onOpenSecurity?: () => void;
  onNewSession?: () => void;
}

export const GoogleProductHero: React.FC<GoogleProductHeroProps> = ({
  onSelectPrompt,
  onOpenTrends,
  onOpenSecurity,
  onNewSession,
}) => {
  const inputMethods = [
    {
      id: 'text',
      tag: 'text-to-reflection',
      title: 'Conversational Journal',
      desc: 'Natural language dialogue → mindful clarity & thoughtful inquiry',
      gradient: 'from-[#e8f0fe] via-[#f4f7fe] to-[#ffffff] dark:from-[#1b2b48] dark:via-[#162035] dark:to-[#131314]',
      borderColor: 'border-[#4285F4]/50 dark:border-[#4285F4]/30',
      accentColor: '#1A73E8',
      glowColor: 'rgba(26, 115, 232, 0.35)',
      badgeBg: 'bg-[#d2e3fc] text-[#0b57d0] dark:bg-[#1A73E8]/30 dark:text-[#A8C7FA]',
      icon: 'edit_note',
      iconBg: 'bg-[#1A73E8] text-white dark:bg-[#8AB4F8]/20 dark:text-[#8AB4F8]',
      startTextColor: 'text-[#0b57d0] dark:text-[#A8C7FA]',
      prompt: 'Reflecting on today: what went exceptionally well, and what drained my energy?',
    },
    {
      id: 'synthesis',
      tag: 'ai-synthesis',
      title: 'Executive Takeaways',
      desc: 'Deep pattern recognition → emotional resonance & core commitments',
      gradient: 'from-[#e6f4ea] via-[#f3faf5] to-[#ffffff] dark:from-[#143320] dark:via-[#0f2417] dark:to-[#131314]',
      borderColor: 'border-[#34A853]/50 dark:border-[#34A853]/30',
      accentColor: '#1E8E3E',
      glowColor: 'rgba(52, 168, 83, 0.35)',
      badgeBg: 'bg-[#ceead6] text-[#0d652d] dark:bg-[#34A853]/30 dark:text-[#81C995]',
      icon: 'auto_awesome',
      iconBg: 'bg-[#1E8E3E] text-white dark:bg-[#81C995]/20 dark:text-[#81C995]',
      startTextColor: 'text-[#0d652d] dark:text-[#81C995]',
      prompt: 'Help me analyze my thoughts from this week and identify recurring emotional patterns.',
    },
    {
      id: 'voice',
      tag: 'voice-canvas',
      title: 'Voice Canvas',
      desc: 'Real-time speech dictation → instant stream-of-consciousness capture',
      gradient: 'from-[#fce8e6] via-[#fef3f2] to-[#ffffff] dark:from-[#3e211f] dark:via-[#2b1817] dark:to-[#131314]',
      borderColor: 'border-[#EA4335]/50 dark:border-[#EA4335]/30',
      accentColor: '#C5221F',
      glowColor: 'rgba(197, 34, 31, 0.35)',
      badgeBg: 'bg-[#fce8e6] text-[#b31412] dark:bg-[#EA4335]/30 dark:text-[#F28B82]',
      icon: 'mic',
      iconBg: 'bg-[#C5221F] text-white dark:bg-[#F28B82]/20 dark:text-[#F28B82]',
      startTextColor: 'text-[#b31412] dark:text-[#F28B82]',
      prompt: 'I want to do a stream-of-consciousness brain dump about my current challenges and goals.',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center my-2 select-none">
      {/* Google 4-Color Product Emblem & Brand Header */}
      <div className="flex flex-col items-center mb-6">
        {/* Authentic Google 4-Color Product Icon */}
        <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 filter drop-shadow-[0_4px_12px_rgba(66,133,244,0.35)] transition-transform hover:scale-105 duration-200"
            aria-hidden="true"
          >
            {/* Google 4-Color Geometric Ribbon Fold */}
            <path
              d="M8 12C8 9.79086 9.79086 8 12 8H24V28H12C9.79086 28 8 26.2091 8 24V12Z"
              fill="#4285F4"
            />
            <path
              d="M24 8H36C38.2091 8 40 9.79086 40 12V24C40 26.2091 38.2091 28 36 28H24V8Z"
              fill="#EA4335"
            />
            <path
              d="M24 28H36C38.2091 28 40 29.7909 40 32V36C40 38.2091 38.2091 40 36 40H24V28Z"
              fill="#FBBC05"
            />
            <path
              d="M8 24C8 26.2091 9.79086 28 12 28H24V40H12C9.79086 40 8 38.2091 8 36V24Z"
              fill="#34A853"
            />
            {/* Center spine highlight */}
            <rect x="22" y="8" width="4" height="32" rx="2" fill="#FFFFFF" fillOpacity="0.3" />
            {/* Center Gemini Starlight */}
            <path
              d="M24 16C24 20.4183 20.4183 24 16 24C20.4183 24 24 27.5817 24 32C24 27.5817 27.5817 24 32 24C27.5817 24 24 20.4183 24 16Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Google Products Logo Headline */}
        <h1 className="font-['Google_Sans',sans-serif] font-medium text-3xl sm:text-4xl text-[var(--md-sys-color-on-surface)] tracking-tight flex items-center gap-2">
          <span className="flex items-center tracking-normal">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="font-normal text-[var(--md-sys-color-on-surface)]">Journal</span>
        </h1>

        {/* Product Subtitle (modeled after Google Stitch) */}
        <p className="font-['Google_Sans',sans-serif] text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2 max-w-lg leading-relaxed">
          AI-Powered Reflection · Mindful Inquiry · Powered by Gemini
        </p>
      </div>

      {/* Input Methods Section (Inspired by Google Stitch "Input method" Cards) */}
      <div className="w-full text-left mb-6">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="font-['Google_Sans',sans-serif] font-semibold text-xs tracking-wider uppercase text-[#1A73E8] dark:text-[#8AB4F8] flex items-center gap-1.5">
            <MaterialSymbol name="bolt" size={17} className="text-[#1A73E8] dark:text-[#8AB4F8]" />
            Reflection Capabilities
          </span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-medium opacity-80">
            Tap to begin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {inputMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                triggerPixelHaptic(10);
                onSelectPrompt(method.prompt);
              }}
              className={`group flex flex-col justify-between p-4 min-h-[174px] rounded-[22px] bg-gradient-to-br ${method.gradient} border-[1.5px] ${method.borderColor} shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 text-left cursor-pointer hover:-translate-y-0.5`}
              style={{ boxShadow: 'var(--md-elevation-1)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 24px -2px ${method.glowColor}, 0 6px 16px rgba(0,0,0,0.1)`;
                e.currentTarget.style.borderColor = method.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--md-elevation-1)';
                e.currentTarget.style.borderColor = '';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-semibold tracking-wide shadow-2xs ${method.badgeBg}`}>
                    {method.tag}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 ${method.iconBg}`}>
                    <MaterialSymbol name={method.icon} size={19} />
                  </div>
                </div>

                <div className="font-['Google_Sans',sans-serif] font-semibold text-[15px] text-[#1a1c1e] dark:text-[#f2f4f8] group-hover:text-[var(--md-sys-color-primary)] transition-colors leading-snug">
                  {method.title}
                </div>
                <div className="text-[12px] text-[#3c4043] dark:text-[#c4c7c5] mt-1.5 leading-relaxed font-normal line-clamp-2">
                  {method.desc}
                </div>
              </div>

              <div className={`flex items-center gap-1.5 text-[11.5px] font-semibold ${method.startTextColor} mt-3 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}>
                <span>Start reflection</span>
                <MaterialSymbol name="arrow_forward" size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Google Product Pill Actions (HTML/CSS, Figma, AI Studio style in screenshot) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
        <button
          type="button"
          onClick={() => {
            triggerPixelHaptic(8);
            if (onOpenTrends) onOpenTrends();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] border border-[#34a853]/40 dark:bg-[#00796B]/25 dark:hover:bg-[#00796B]/40 dark:text-[#4DB6AC] dark:border-[#00796B]/40 text-xs font-['Google_Sans',sans-serif] font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <MaterialSymbol name="insights" size={16} />
          <span>Mood Trends</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerPixelHaptic(8);
            if (onOpenSecurity) onOpenSecurity();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border border-[#4285f4]/40 dark:bg-[#1A73E8]/25 dark:hover:bg-[#1A73E8]/40 dark:text-[#8AB4F8] dark:border-[#1A73E8]/40 text-xs font-['Google_Sans',sans-serif] font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <MaterialSymbol name="shield" size={16} />
          <span>Zero-Trust Vault</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerPixelHaptic(8);
            if (onNewSession) onNewSession();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f3e8fd] hover:bg-[#e9d5ff] text-[#7b1fa2] border border-[#9b72cb]/40 dark:bg-[#7B1FA2]/25 dark:hover:bg-[#7B1FA2]/40 dark:text-[#D7AEFB] dark:border-[#7B1FA2]/40 text-xs font-['Google_Sans',sans-serif] font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <MaterialSymbol name="auto_awesome" size={16} />
          <span>Gemini 2.5 Flash</span>
        </button>
      </div>

      {/* Google Labs Tagline (modeled after Google Stitch footer) */}
      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70 flex flex-wrap items-center justify-center gap-2 font-['Google_Sans',sans-serif]">
        <span>Free to use</span>
        <span>•</span>
        <span>Zero-trust privacy</span>
        <span>•</span>
        <span>Multi-format export</span>
        <span>•</span>
        <span className="font-medium text-[var(--md-sys-color-on-surface)]">Powered by Google Labs</span>
      </div>
    </div>
  );
};
