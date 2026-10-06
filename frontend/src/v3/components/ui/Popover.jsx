import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { popIn } from '../../lib/motion';

/*
  Popover: the desktop counterpart of Sheet. Anchored, opens from its trigger
  corner (never from centre: an origin is what makes the relationship legible),
  closes on outside pointerdown or Escape. The trigger owns aria-expanded and
  aria-haspopup; the panel is labelled by whatever the trigger says.
*/
export const Popover = ({
  open,
  onClose,
  align = 'right',
  label,
  className = '',
  width = 'w-80',
  children,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose?.();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          {...popIn}
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute top-[calc(100%+10px)] z-40 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-card3 border border-sand-200 bg-bone-raised shadow-v3menu',
            align === 'right' ? 'right-0' : 'left-0 origin-top-left',
            width,
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
