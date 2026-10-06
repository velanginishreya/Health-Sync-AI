import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Prose } from './Prose';
import { tagTone } from './Tag';

/*
  ChatBubble: one geometry for both places a conversation is rendered (the v2
  audit found Home's mock and the assistant page drawing two different bubbles).
  The assistant bubble is vellum and may carry sources and a disclaimer; the user
  bubble is the single petrol field in the conversation.
*/
export const ChatBubble = ({ role = 'assistant', children, meta, sources, time, className = '' }) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start', className)}>
      {/* Measure caps, not percentages, at the top end: a 78% bubble on a 2560
          screen runs past 110 characters a line and stops being readable. */}
      <div
        className={cn(
          'max-w-[92%]',
          isUser ? 'sm:max-w-[52ch]' : 'sm:max-w-[70ch]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'rounded-card3 px-4 py-3',
            isUser
              ? 'rounded-br-[6px] bg-petrol-700 text-petrol-50 shadow-v3card'
              : 'rounded-bl-[6px] border border-sand-200 bg-bone-raised shadow-v3card'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-b2 leading-relaxed">{children}</p>
          ) : (
            <Prose text={children} />
          )}
        </div>

        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((source) => (
              <span
                key={source}
                className={cn('v3-num rounded-full border px-2.5 py-1 font-mono3 text-m4', tagTone('petrol'))}
              >
                {source}
              </span>
            ))}
          </div>
        )}

        {(meta || time) && (
          <div className={cn('mt-1.5 flex items-center gap-2', isUser && 'flex-row-reverse')}>
            {meta}
            {time && <span className="v3-num font-mono3 text-m4 text-sand-500">{time}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/** The safety-checked marker used on every assistant answer. */
export const SafetyMark = ({ className = '' }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-m4 font-semibold uppercase tracking-caps',
      tagTone('neutral'),
      className
    )}
  >
    <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
    Safety checked
  </span>
);
