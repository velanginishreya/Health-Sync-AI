import React from 'react';
import { cn } from '../../lib/cn';

/*
  Tables keep their density: comparison and scanning are the whole point (NN/g:
  cards force spatial reorientation). The frame scrolls horizontally on phones
  instead of collapsing; ancestors must carry min-w-0.
  Every cell is tabular by default so columns of numbers always line up. Headers
  are caps, quiet, with a stronger rule; first and last cells sit flush with the
  card padding.
*/

export const TableWrap = ({ children, className = '' }) => (
  <div className={cn('v3-scroll-x -mx-6 px-6 sm:mx-0 sm:px-0', className)}>{children}</div>
);

export const Table = ({ children, minWidth = 640, className = '', caption }) => (
  <table className={cn('w-full border-collapse text-left text-b3', className)} style={{ minWidth }}>
    {caption && <caption className="sr-only">{caption}</caption>}
    {children}
  </table>
);

export const THead = ({ children }) => <thead>{children}</thead>;
export const TBody = ({ children }) => <tbody>{children}</tbody>;

export const TR = ({ children, className = '', ...props }) => (
  <tr className={cn('transition-colors duration-100 hover:bg-bone/70', className)} {...props}>
    {children}
  </tr>
);

export const TH = ({ children, align, className = '', ...props }) => (
  <th
    scope="col"
    className={cn(
      'border-b border-sand-300 px-3 py-2.5 text-mic uppercase tracking-caps text-sand-600 first:pl-0 last:pr-0',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TD = ({ children, align, className = '', ...props }) => (
  <td
    className={cn(
      'v3-num border-b border-sand-200 px-3 py-3 align-middle text-sand-800 first:pl-0 last:pr-0',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      className
    )}
    {...props}
  >
    {children}
  </td>
);
