import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/cn';
import { toastIn } from '../../lib/motion';

/*
  One-line outcome messages. The toast is a status region (announced politely),
  sits above the mobile tab bar using the shared chrome variable, and its dismiss
  control is a real 44px target.
*/

const TONES = {
  good: { icon: CheckCircle2, className: 'text-sig-good-600 bg-sig-good-50' },
  watch: { icon: AlertTriangle, className: 'text-sig-watch-600 bg-sig-watch-50' },
  critical: { icon: AlertOctagon, className: 'text-sig-critical-600 bg-sig-critical-50' },
  neutral: { icon: Info, className: 'text-petrol-700 bg-petrol-50' },
};

export const Toast = ({ toast, onClose }) => {
  const tone = TONES[toast?.tone] || TONES.neutral;
  const Icon = tone.icon;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          {...toastIn}
          role="status"
          aria-live="polite"
          className={cn(
            'fixed inset-x-0 z-50 mx-auto flex max-w-md items-center gap-3 rounded-card3 border border-sand-200 bg-bone-raised px-3.5 py-3 shadow-v3toast',
            'bottom-[calc(env(safe-area-inset-bottom)+var(--v3-tabbar-h)+14px)] lg:bottom-6'
          )}
        >
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-tile3', tone.className)}>
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1 text-b2 text-sand-900">{toast.message}</span>
          <button
            type="button"
            onClick={onClose}
            className="-my-2 -mr-1.5 min-h-touch shrink-0 rounded-tile3 px-2.5 text-b3 font-medium text-sand-600 transition-colors hover:bg-sand-100 hover:text-sand-900"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** useToast: show('Medicine added', 'good'). Auto-clears after 4s; timers cleaned. */
export const useToast = () => {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((message, tone = 'good') => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show, clear };
};
