import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { springIndicator } from '../../lib/motion';
import { tabItems } from './nav';

/*
  Phone tab bar. Four destinations maximum for patients, three for the clinical
  roles. Every destination in the rail is also reachable from the drawer, so the
  bar stays a shortcut and never the only path (NN/g: never hide navigation behind
  a single icon-only affordance).
*/
export const BottomTabs = ({ role }) => {
  const items = tabItems(role);
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-bone-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="relative flex h-16 flex-col items-center justify-center gap-1 transition-colors duration-150"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    transition={springIndicator}
                    className="absolute top-0 h-[3px] w-9 rounded-full bg-petrol-600"
                  />
                )}
                <item.icon
                  className={cn('h-5 w-5 transition-colors', isActive ? 'text-petrol-700' : 'text-sand-500')}
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
                <span
                  className={cn(
                    'text-m4',
                    isActive ? 'font-semibold text-petrol-800' : 'font-medium text-sand-600'
                  )}
                >
                  {item.short || item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
