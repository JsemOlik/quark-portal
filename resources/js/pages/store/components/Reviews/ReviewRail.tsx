import React from 'react';
import { Review } from '../../types';
import MarqueeRow from './MarqueeRow';

function makeReviews(n: number, seed: string): Review[] {
  const samples = [
    'Support solved my modpack crash in under an hour. Legends.',
    'Super snappy and great uptime. Moved from another host and ' +
      'never looked back.',
    'Quick setup, clear panel, zero headaches. Exactly what I needed.',
    'Backups saved me after a bad plugin—restored in minutes.',
    'Best bang for buck. Good latency from Prague!',
    'Performance is solid even with lots of plugins.',
    'Very helpful staff and fast response.',
    'Seamless updates and great docs.',
  ];
  const handles = [
    '@Linkfoush',
    '@Lumi',
    '@LunarcatOwO',
    '@AngelDan',
    '@DorreIRedmond',
    '@max',
    '@DreiFxn',
    '@prettySkye',
  ];
  return Array.from({ length: n }).map((_, i) => ({
    id: `${seed}-${i}`,
    handle: handles[i % handles.length],
    avatar: ['🟣', '🟠', '🟡', '🟢', '🔵', '🟤', '🟧', '🟦'][i % 8],
    text: samples[i % samples.length],
    rating: 5,
  }));
}

export default function ReviewRail() {
  const top = makeReviews(8, 'top');
  const bottom = makeReviews(8, 'bottom');

  return (
    <div className="space-y-4">
      <MarqueeRow direction="left" items={top} />
      <MarqueeRow direction="right" items={bottom} />
      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-white/70">
        <span className="text-brand">●</span>
        Real testimonials from our
        <a
          href="#"
          className="text-brand underline-offset-4 hover:underline"
        >
          Discord community
        </a>
      </div>
    </div>
  );
}
