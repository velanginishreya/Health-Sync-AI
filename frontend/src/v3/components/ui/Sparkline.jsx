import React, { useId } from 'react';
import { cn } from '../../lib/cn';
import { CHART } from '../../lib/clinical';

/*
  Sparkline: shape, not numbers. A trend drawn directly from the series, no axes,
  no dots, 2px round-capped stroke with a soft area falloff. Used where a figure
  needs a glanceable direction of travel; the value itself is always printed
  beside it (a sparkline never replaces the number).
*/
export const Sparkline = ({
  data = [],
  width = 96,
  height = 30,
  stroke = CHART.petrol,
  fill = true,
  className = '',
}) => {
  const id = useId();
  const values = data.map(Number).filter((n) => Number.isFinite(n));
  if (values.length < 2) {
    return <div className={cn('h-[30px] w-24 rounded-md bg-sand-200/70', className)} aria-hidden />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const stepX = (width - pad * 2) / (values.length - 1);
  const points = values.map((value, index) => {
    const x = pad + index * stepX;
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return [x, y];
  });

  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0 overflow-visible', className)}
      aria-hidden="true"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#spark-${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.4"
        fill={stroke}
      />
    </svg>
  );
};
