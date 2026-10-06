import React, { useId } from 'react';
import { cn } from '../../lib/cn';

/*
  Logomark: an open ring of record holding a filled dot of person, on a clay tile.
  The ring's gap is deliberate: records are open, consent is required. Replaces the
  pulse-wave mark per the brand refresh (PRODUCT.md).
*/
export const LogoMark = ({ size = 34, className = '' }) => {
  const id = useId();
  const face = `v3-logo-face-${id}`;
  const rim = `v3-logo-rim-${id}`;

  return (
    <span className={cn('inline-flex shrink-0', className)} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id={face} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17767C" />
            <stop offset="1" stopColor="#093C42" />
          </linearGradient>
          <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="11" fill={`url(#${face})`} />
        <rect x="0.5" y="0.5" width="35" height="35" rx="10.5" stroke={`url(#${rim})`} />
        <circle cx="18" cy="18.6" r="4.1" fill="#F4F1E9" />
        <path
          d="M18 8.9a9.2 9.2 0 1 1-9.2 9.2"
          stroke="#ABD5D6"
          strokeWidth="2.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
};

/** Wordmark: the lockup. Always rendered next to LogoMark inside a link that
    already carries the accessible name, so both parts stay aria-hidden. */
export const Wordmark = ({ className = '', markSize = 30 }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <LogoMark size={markSize} />
    <span aria-hidden="true" className="font-display3 text-[1.1875rem] leading-none tracking-[-0.01em] text-sand-950">
      Health Sync <span className="text-petrol-700">AI</span>
    </span>
  </span>
);
