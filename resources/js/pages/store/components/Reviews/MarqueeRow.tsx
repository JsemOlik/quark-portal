import React from 'react';
import { Review } from '../../types';
import TestimonialCard from './TestimonialCard';

export default function MarqueeRow({
  direction,
  items,
}: {
  direction: 'left' | 'right';
  items: Review[];
}) {
  const content = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div
        className={
          'marquee-track flex min-w-max gap-3 ' +
          (direction === 'left' ? 'marquee-left' : 'marquee-right')
        }
      >
        {content.map((r, idx) => (
          <TestimonialCard key={`${r.id}-${idx}`} review={r} />
        ))}
      </div>
    </div>
  );
}
