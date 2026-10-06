import React from 'react';
import { cn } from '../../lib/cn';

/*
  DeviceFrame: the marketing phone mock. Sized from the outside in, and the side
  controls are positioned with inset-0-relative offsets so any width override stays
  aligned (the v2 frame hard-coded an inner width and desynced from its consumers).
  Everything inside is real DOM: real type, real values, no screenshots.
*/
export const DeviceFrame = ({ children, className = '', screenClassName = '' }) => (
  <div
    className={cn(
      'relative rounded-[42px] border border-sand-300/90 bg-gradient-to-b from-bone-raised to-bone p-[9px]',
      'shadow-[0_2px_4px_rgba(20,18,16,0.08),0_40px_80px_-32px_rgba(20,18,16,0.45)]',
      className
    )}
  >
    <span
      aria-hidden
      className="absolute -left-[2px] top-[104px] h-9 w-[3px] rounded-l-full bg-sand-300"
    />
    <span
      aria-hidden
      className="absolute -left-[2px] top-[152px] h-14 w-[3px] rounded-l-full bg-sand-300"
    />
    <span
      aria-hidden
      className="absolute -right-[2px] top-[128px] h-16 w-[3px] rounded-r-full bg-sand-300"
    />

    <div className={cn('overflow-hidden rounded-[34px] bg-bone', screenClassName)}>
      <span aria-hidden className="mx-auto mt-2 block h-1 w-16 rounded-full bg-sand-300" />
      {children}
    </div>
  </div>
);
