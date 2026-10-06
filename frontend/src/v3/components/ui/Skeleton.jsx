import React from 'react';
import { cn } from '../../lib/cn';

/*
  Skeletons mimic the real layout (wireframe, not frame-only) and announce busy
  state once per region instead of four competing aria-live messages.
*/
export const Skeleton = ({ className = '' }) => (
  <div className={cn('animate-pulse rounded-tile3 bg-sand-200/80', className)} aria-hidden />
);

const FigureSkeleton = () => (
  <div className="bg-bone p-4 sm:p-5">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="mt-3 h-8 w-28" />
    <Skeleton className="mt-3 h-3 w-24" />
  </div>
);

export const PageSkeleton = ({ figures = 0, columns = 4, rows = 4, className = '' }) => (
  <div
    className={cn('space-y-6', className)}
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <span className="sr-only">Loading this screen</span>

    {figures > 0 && (
      <div
        className={cn(
          'grid grid-cols-2 gap-px overflow-hidden rounded-card3 border border-sand-200/90 bg-sand-200',
          columns === 6
            ? 'sm:grid-cols-3 lg:grid-cols-6'
            : columns === 3
              ? 'sm:grid-cols-3'
              : 'sm:grid-cols-4'
        )}
      >
        {Array.from({ length: figures }).map((_, index) => (
          <FigureSkeleton key={index} />
        ))}
      </div>
    )}

    <div className="rounded-card3 border border-sand-200/90 bg-bone-raised p-5 shadow-v3card sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
);
