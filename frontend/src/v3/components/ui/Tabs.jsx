import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { springIndicator } from '../../lib/motion';

/*
  Two navigation idioms, clearly separated:
  - Tabs      : switching between views of ONE record. Full APG tab semantics:
                roving tabindex, arrow keys, Home/End, aria-controls to a panel.
  - FilterChips: filtering a list. Plain buttons with aria-pressed. Never tab roles.
  - SubNav    : record-to-record navigation (real links, aria-current).
*/

export const Tabs = ({ tabs, value, onChange, idPrefix = 'tabs', label, className = '' }) => {
  const refs = useRef([]);

  const handleKey = (event, index) => {
    const last = tabs.length - 1;
    let next = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn('flex items-center gap-1 border-b border-sand-200', className)}>
      {tabs.map((tab, index) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`${idPrefix}-tab-${tab.value}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${tab.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKey(event, index)}
            className={cn(
              'relative -mb-px min-h-touch px-3 pb-3 pt-2.5 text-b2 outline-none transition-colors duration-150',
              active ? 'font-semibold text-sand-950' : 'font-medium text-sand-600 hover:text-sand-900'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="v3-num ml-1.5 font-mono3 text-m4 font-normal text-sand-500">{tab.count}</span>
            )}
            {active && (
              <motion.span
                layoutId={`underline-${idPrefix}`}
                className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-petrol-600"
                transition={springIndicator}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export const TabPanel = ({ idPrefix = 'tabs', value, active, children, className = '' }) => {
  if (value !== active) return null;
  return (
    <div
      id={`${idPrefix}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${idPrefix}-tab-${value}`}
      tabIndex={-1}
      className={cn('outline-none', className)}
    >
      {children}
    </div>
  );
};

/** Filter chips. Single horizontal row, scrolls on phones inside its own bleed. */
export const FilterChips = ({ options, value, onChange, label = 'Filter', className = '' }) => (
  <div
    role="group"
    aria-label={label}
    className={cn('-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0', className)}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-10 shrink-0 rounded-full border px-3.5 text-b3 font-medium transition-colors duration-150',
            active
              ? 'border-petrol-700 bg-petrol-600 text-white'
              : 'border-sand-300 bg-bone-raised text-sand-700 hover:border-sand-400 hover:text-sand-900'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cn('v3-num ml-1.5 font-mono3 text-m4', active ? 'text-petrol-100' : 'text-sand-500')}>
              {option.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const SubNav = ({ items, className = '' }) => (
  <nav
    aria-label="Record sections"
    className={cn('-mx-5 flex min-w-0 gap-1 overflow-x-auto px-5 pb-0.5 sm:mx-0 sm:px-0', className)}
  >
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end
        className={({ isActive }) =>
          cn(
            'inline-flex min-h-10 shrink-0 items-center rounded-full px-3.5 text-b3 font-medium transition-colors duration-150',
            isActive
              ? 'bg-sand-900 text-bone'
              : 'text-sand-600 hover:bg-sand-200/60 hover:text-sand-900'
          )
        }
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);
