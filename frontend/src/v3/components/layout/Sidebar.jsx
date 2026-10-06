import React from 'react';
import { motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { springIndicator } from '../../lib/motion';
import { navSections, roleHome, ROLE_LABEL } from './nav';
import { Caps } from '../ui/Text';
import { Wordmark } from '../ui/LogoMark';

/*
  NavList: the single renderer for destinations. The rail and the phone drawer both
  use it, so labels, order, icons and active states can never drift apart again.
  `variant` namespaces the shared-layout bar so two instances never claim one id.
*/
export const NavList = ({ role, onNavigate, variant = 'rail', className = '' }) => (
  <nav aria-label="Main" className={cn('flex flex-col gap-5', className)}>
    {navSections(role).map((section, index) => (
      <div key={section.label || `section-${index}`} className="flex flex-col gap-1">
        {section.label && (
          <Caps className="px-3 pb-1.5 pt-1">{section.label}</Caps>
        )}
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex min-h-touch items-center gap-3 rounded-ctl3 px-3 text-b2 transition-colors duration-150',
                isActive
                  ? 'bg-petrol-50 font-semibold text-petrol-800'
                  : 'font-medium text-sand-700 hover:bg-sand-200/50 hover:text-sand-950'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={`nav-bar-${variant}`}
                    transition={springIndicator}
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-petrol-600"
                  />
                )}
                <item.icon
                  className={cn('h-4 w-4 shrink-0', isActive ? 'text-petrol-700' : 'text-sand-500 group-hover:text-sand-700')}
                  strokeWidth={2}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>
);

/** The rail's footer: who you are signed in as, and what this build actually is. */
export const SidebarFooter = ({ role, className = '' }) => (
  <div className={cn('border-t border-sand-200 pt-4', className)}>
    <div className="flex items-center justify-between gap-2">
      <Caps>Signed in as</Caps>
      <span className="rounded-full border border-petrol-200 bg-petrol-50 px-2.5 py-0.5 text-m4 font-semibold uppercase tracking-caps text-petrol-800">
        {ROLE_LABEL[role] || role}
      </span>
    </div>
    <p className="mt-2 text-b4 leading-relaxed text-sand-600">
      Student-built prototype. Records are seeded demo data.
    </p>
    <Link
      to="/v3"
      className="mt-1.5 inline-block text-b4 font-medium text-sand-600 underline decoration-sand-300 underline-offset-2 transition-colors hover:text-petrol-700 hover:decoration-petrol-300"
    >
      About this prototype
    </Link>
  </div>
);

export const Sidebar = ({ role }) => (
  <aside className="hidden lg:block lg:w-[var(--v3-sidebar)] lg:shrink-0">
    <div className="sticky top-0 flex h-[calc(100dvh-var(--v3-strip-h))] flex-col gap-6 overflow-y-auto px-3 py-5">
      <Link to={roleHome(role)} className="flex min-h-touch items-center rounded-ctl3 px-2">
        <Wordmark />
      </Link>
      <NavList role={role} variant="rail" className="flex-1" />
      <SidebarFooter role={role} />
    </div>
  </aside>
);
