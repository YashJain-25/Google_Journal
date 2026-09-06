import React from 'react';

interface MaterialSymbolProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
  fill?: boolean;
}

export const MaterialSymbol: React.FC<MaterialSymbolProps> = ({
  name,
  className = '',
  style = {},
  size,
  fill = false,
}) => {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
    ...(fill ? { fontVariationSettings: "'FILL' 1" } : {}),
  };

  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={dynamicStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
