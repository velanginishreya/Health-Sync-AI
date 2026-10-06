import React, { useId, useRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

/*
  Form controls. Three things v2 got wrong are structural here:
  1. `error` on a control renders its own message AND wires aria-invalid /
     aria-describedby, so no page can forget the association.
  2. File upload is a real <button> that clicks a visually hidden input, reachable
     by keyboard (v2 used a display:none input inside a non-focusable label).
  3. Labels sit above the field, always visible, single column. Placeholders are
     never labels.
*/

export const Label = ({ children, htmlFor, required = false, hint, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={cn('mb-1.5 flex items-baseline justify-between gap-3 text-lbl text-sand-800', className)}
  >
    <span>
      {children}
      {required && (
        <span aria-hidden className="ml-0.5 text-sig-critical-600">
          *
        </span>
      )}
    </span>
    {hint && <span className="text-b4 font-normal text-sand-500">{hint}</span>}
  </label>
);

export const Hint = ({ children, className = '' }) => (
  <p className={cn('mt-1.5 text-b4 leading-relaxed text-sand-600', className)}>{children}</p>
);

export const ErrorText = ({ children, id, className = '' }) => (
  <p id={id} className={cn('mt-1.5 flex items-start gap-1.5 text-b4 font-medium text-sig-critical-700', className)}>
    <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
    <span>{children}</span>
  </p>
);

const fieldBase =
  'w-full rounded-ctl3 border bg-bone-raised text-b2 text-sand-950 transition-[border-color,box-shadow] duration-150 placeholder:text-sand-400 focus:outline-none focus:border-petrol-500 focus:ring-4 focus:ring-petrol-500/12 disabled:bg-sand-100 disabled:text-sand-500';

const stateClass = (hasError) =>
  hasError ? 'border-sig-critical-500' : 'border-sand-300 hover:border-sand-400';

export const Input = React.forwardRef(function Input(
  { icon: Icon, error, id, className = '', ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn('min-w-0', className)}>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-500"
            strokeWidth={2}
          />
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(fieldBase, 'h-11 px-3.5', Icon && 'pl-10', stateClass(hasError))}
          {...props}
        />
      </div>
      {typeof error === 'string' && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
});

export const Textarea = React.forwardRef(function Textarea({ error, id, className = '', ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn('min-w-0', className)}>
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(fieldBase, 'resize-none p-3.5 leading-relaxed', stateClass(hasError))}
        {...props}
      />
      {typeof error === 'string' && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
});

export const Select = React.forwardRef(function Select({ error, id, className = '', children, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn('min-w-0', className)}>
      <div className="relative">
        <select
          id={inputId}
          ref={ref}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(fieldBase, 'h-11 appearance-none pl-3.5 pr-10', stateClass(hasError))}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-500"
          strokeWidth={2}
        />
      </div>
      {typeof error === 'string' && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
});

/**
 * FileButton: a keyboard-reachable upload. The input is sr-only (not display:none),
 * the button is a real button, and the same Button material is used everywhere.
 */
export const FileButton = ({ onSelect, accept, children, ...rest }) => {
  const ref = useRef(null);
  const id = useId();

  return (
    <>
      <input
        id={id}
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect?.(file);
          event.target.value = '';
        }}
      />
      <Button {...rest} onClick={() => ref.current?.click()}>
        {children}
      </Button>
    </>
  );
};

/** Compact key/value row, baseline-aligned, for detail panels. */
export const DataRow = ({ label, value, sub, className = '' }) => (
  <div className={cn('flex items-baseline justify-between gap-4 py-2', className)}>
    <dt className="shrink-0 text-b3 text-sand-600">{label}</dt>
    <dd className="min-w-0 text-right text-b2 font-medium text-sand-900">
      {value}
      {sub && <span className="ml-1.5 text-b4 font-normal text-sand-500">{sub}</span>}
    </dd>
  </div>
);
