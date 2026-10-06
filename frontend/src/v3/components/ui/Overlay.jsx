import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { dialogIn, drawerIn, fade, sheetUp } from '../../lib/motion';
import { IconButton } from './Button';

/**
 * Every overlay renders through a portal to <body>. This is not decoration: any
 * ancestor with `backdrop-filter` or `filter` becomes the containing block for
 * `position: fixed` descendants, which traps an overlay inside that ancestor's
 * own height. Portalling removes the whole class of bugs at the source, so
 * headers are free to use blur.
 */
const Portal = ({ children }) => createPortal(children, document.body);

/*
  Overlays. What v2 shipped was a scrim, an Escape handler and nothing else: focus
  was never moved, never trapped, never restored, and triggers never announced
  state. All of that is handled once, here.

  - Dialog : confirmation for consequential actions. Bottom sheet on phones,
             centred pop on desktop. Enter and exit are asymmetric (enter 200ms,
             exit 150ms) because leaving should never feel slower than arriving.
  - Sheet  : phone-only bottom panel for wide content (lists, sources).
  - Drawer : left navigation drawer.

  Render these as SIBLINGS of any element carrying backdrop-filter or filter: in
  most browsers such an ancestor becomes the containing block for position:fixed
  and traps the overlay inside its own height (a v2 bug worth never repeating).
*/

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useOverlay = (open, onClose, panelRef) => {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const scrollPrevious = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus?.({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (node) => node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement
      );
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = scrollPrevious;
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [open, onClose, panelRef]);
};

const CloseButton = ({ onClose, tone = 'sand', className = '' }) => (
  <IconButton
    label="Close"
    icon={X}
    variant={tone === 'dusk' ? 'quietDusk' : 'quiet'}
    size="sm"
    onClick={onClose}
    className={cn('-mr-1', className)}
  />
);

export const Dialog = ({ open, onClose, title, description, children, footer, className = '' }) => {
  const panelRef = useRef(null);
  useOverlay(open, onClose, panelRef);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div {...fade} className="absolute inset-0 bg-dusk-950/55" onClick={onClose} />
          <motion.div
            ref={panelRef}
            {...dialogIn}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'relative w-full rounded-t-hero3 border border-sand-200 bg-bone-raised p-5 outline-none shadow-v3sheet',
              'pb-[max(env(safe-area-inset-bottom),20px)] sm:max-w-md sm:rounded-panel3 sm:p-6 sm:pb-6',
              className
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-d4 font-light text-sand-950">{title}</h2>
                {description && <p className="mt-2 text-b2 leading-relaxed text-sand-600">{description}</p>}
              </div>
              <CloseButton onClose={onClose} className="-mt-1" />
            </div>
            {children && <div className="mt-4">{children}</div>}
            {footer && (
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Portal>
  );
};

export const Sheet = ({ open, onClose, title, children, className = '' }) => {
  const panelRef = useRef(null);
  useOverlay(open, onClose, panelRef);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <motion.div {...fade} className="absolute inset-0 bg-dusk-950/55" onClick={onClose} />
          <motion.div
            ref={panelRef}
            {...sheetUp}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-hero3 border-t border-sand-200 bg-bone-raised pb-[max(env(safe-area-inset-bottom),16px)] outline-none',
              className
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-sand-200 bg-bone-raised px-5 py-3">
              <span className="text-d5 text-sand-950">{title}</span>
              <CloseButton onClose={onClose} className="-mr-2" />
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Portal>
  );
};

/** Left navigation drawer (mobile). Focus-managed like every other overlay. */
export const Drawer = ({ open, onClose, label, children, className = '' }) => {
  const panelRef = useRef(null);
  useOverlay(open, onClose, panelRef);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div {...fade} className="absolute inset-0 bg-dusk-950/55" onClick={onClose} />
          <motion.div
            ref={panelRef}
            {...drawerIn}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={cn(
              'absolute inset-y-0 left-0 flex w-[290px] max-w-[86vw] flex-col overflow-y-auto rounded-r-panel3 bg-bone-raised outline-none',
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Portal>
  );
};
