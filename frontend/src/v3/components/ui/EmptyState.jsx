import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from './Card';

/*
  Empty states teach: they state the system's status, say what will appear here,
  and link straight to the action that fills the space (NN/g). `bare` is for use
  inside an existing card; the default wraps itself in one.
*/
export const EmptyState = ({
  icon: Icon,
  title,
  body,
  action,
  tone = 'sand',
  bare = false,
  headingLevel: Heading = 'h3',
  className = '',
}) => {
  const content = (
    <div className={cn('flex flex-col items-center text-center', bare ? 'py-8' : 'py-10', className)}>
      {Icon && (
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-card3',
            tone === 'dusk' ? 'bg-white/8 text-petrol-200' : 'bg-sand-200/70 text-sand-600'
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      )}
      <Heading
        className={cn(
          'mt-4 text-d4',
          Heading === 'h2' ? 'font-light' : '',
          tone === 'dusk' ? 'text-dusk-text' : 'text-sand-950'
        )}
      >
        {title}
      </Heading>
      {body && (
        <p className={cn('mt-2 max-w-sm text-b2 leading-relaxed', tone === 'dusk' ? 'text-dusk-soft' : 'text-sand-600')}>
          {body}
        </p>
      )}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );

  if (bare) return content;
  return <Card pad="none" className="px-6">{content}</Card>;
};
