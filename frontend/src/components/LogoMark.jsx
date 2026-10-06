import React from 'react';

/**
 * Authored logomark: an instrument-panel waveform inside a graphite tile,
 * replacing the generic icon-in-a-colored-box pattern. Scale-tick hairlines
 * above the trace read as a calibrated gauge, not a decorative flourish.
 */
export const LogoMark = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Health Sync AI"
  >
    <rect width="40" height="40" rx="10" className="fill-ink-900" />
    <g stroke="currentColor" className="text-ink-600" strokeWidth="1" strokeLinecap="round" opacity="0.55">
      <line x1="9" y1="9" x2="9" y2="12" />
      <line x1="16" y1="7.5" x2="16" y2="12" />
      <line x1="24" y1="7.5" x2="24" y2="12" />
      <line x1="31" y1="9" x2="31" y2="12" />
    </g>
    <path
      d="M6 23H12.5L15.5 13L20.5 29L24 17.5L26.5 23H34"
      stroke="currentColor"
      className="text-accent-400"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
