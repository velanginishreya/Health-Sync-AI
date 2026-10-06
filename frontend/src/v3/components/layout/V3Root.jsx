import React from 'react';
import { MotionConfig } from 'framer-motion';
import '../../theme.css';

/**
 * V3Root: theme scope + motion policy for the whole /v3 tree.
 * `reducedMotion="user"` makes every Framer animation in this subtree follow the
 * OS-level setting automatically; theme.css enforces the same floor for CSS
 * transitions. Both layers, or the promise is only half kept.
 */
export const V3Root = ({ children }) => (
  <MotionConfig reducedMotion="user">
    <div className="v3-root min-h-screen font-body3 text-sand-900">{children}</div>
  </MotionConfig>
);
