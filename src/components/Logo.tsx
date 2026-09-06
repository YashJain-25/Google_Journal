import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-[17px]',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Authentic Google 4-Color Product Icon (Folded Ribbon Journal with Gemini Sparkle) */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(66,133,244,0.3)] transition-transform duration-200 hover:scale-105"
          aria-hidden="true"
        >
          {/* Outer Rounded Container with subtle border */}
          <rect width="48" height="48" rx="12" fill="transparent" />

          {/* Google Product 4-Color Folded Ribbon Geometry */}
          {/* Blue Spine & Top-Left (Google Blue: #4285F4) */}
          <path
            d="M8 12C8 9.79086 9.79086 8 12 8H24V28H12C9.79086 28 8 26.2091 8 24V12Z"
            fill="#4285F4"
          />

          {/* Red Top-Right Fold & Header (Google Red: #EA4335) */}
          <path
            d="M24 8H36C38.2091 8 40 9.79086 40 12V24C40 26.2091 38.2091 28 36 28H24V8Z"
            fill="#EA4335"
          />

          {/* Yellow Bottom-Right Sheet & Bookmark (Google Yellow: #FBBC05) */}
          <path
            d="M24 28H36C38.2091 28 40 29.7909 40 32V36C40 38.2091 38.2091 40 36 40H24V28Z"
            fill="#FBBC05"
          />

          {/* Green Bottom-Left Spine & Foundation (Google Green: #34A853) */}
          <path
            d="M8 24C8 26.2091 9.79086 28 12 28H24V40H12C9.79086 40 8 38.2091 8 36V24Z"
            fill="#34A853"
          />

          {/* Central Fold Highlight Accent */}
          <rect x="22" y="8" width="4" height="32" rx="2" fill="#FFFFFF" fillOpacity="0.3" />

          {/* Google Gemini 4-Pointed Sparkle Star in Center Fold */}
          <path
            d="M24 16C24 20.4183 20.4183 24 16 24C20.4183 24 24 27.5817 24 32C24 27.5817 27.5817 24 32 24C27.5817 24 24 20.4183 24 16Z"
            fill="#FFFFFF"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col select-none min-w-0">
          <div className="flex items-center gap-1.5 leading-snug py-0.5">
            {/* Google Multicolor Logo Wordmark */}
            <span className={`font-['Google_Sans',sans-serif] font-medium ${textSizes[size]} tracking-tight flex items-center`}>
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </span>

            {/* Product Name */}
            <span className={`font-['Google_Sans',sans-serif] font-normal ${textSizes[size]} tracking-tight text-[var(--md-sys-color-on-surface)]`}>
              Journal
            </span>

            {/* Google Labs / Gemini Badge */}
            <span className="px-1.5 py-0.5 text-[9px] font-['Google_Sans',sans-serif] font-medium uppercase tracking-wider rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ml-0.5">
              Gemini
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] opacity-75 mt-0.5">
              Zero-Trust Vault
            </span>
          )}
        </div>
      )}
    </div>
  );
};
