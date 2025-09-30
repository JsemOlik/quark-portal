import React from 'react';
import { Game } from '../../types';
import GameCard from './GameCard';

export default function MarqueeRow({
  direction,
  items,
}: {
  direction: 'left' | 'right';
  items: Game[];
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
        {content.map((g, idx) => (
          <GameCard key={`${g.id}-${idx}`} game={g} />
        ))}
      </div>
    </div>
  );
}
