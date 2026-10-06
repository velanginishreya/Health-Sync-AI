import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../../lib/cn';

/*
  Spotlight: a pointer-following pool of light plus a masked 1px rim that lights up
  with it. Two custom properties written from a pointermove handler, so React never
  re-renders during the gesture. Marketing surfaces only: constant repaint under a
  cursor is a cost the dashboard does not pay.
*/
export const Spotlight = ({ children, className = '', radius = 420, tone = 'light' }) => {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const ref = useRef(null);

  const onPointerMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const glow = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, ${
    tone === 'dusk' ? 'rgba(171,213,214,0.13)' : 'rgba(23,118,124,0.09)'
  }, transparent 62%)`;

  const rim = useMotionTemplate`radial-gradient(${radius * 0.72}px circle at ${x}px ${y}px, ${
    tone === 'dusk' ? 'rgba(171,213,214,0.55)' : 'rgba(23,118,124,0.45)'
  }, transparent 68%)`;

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn('group relative', className)}>
      <motion.span
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <motion.span
        aria-hidden
        style={{ background: rim, WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]"
      />
      {children}
    </div>
  );
};
