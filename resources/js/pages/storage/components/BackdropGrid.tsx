// resources/js/Pages/storage/components/BackdropGrid.tsx
import React from 'react';

export default function BackdropGrid({
  opacity = 0.08,
  mask = 'radial-gradient(ellipse 80% 50% at 50% 0%, transparent 40%, #000 110%)',
}: {
  opacity?: number;
  mask?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ maskImage: mask }}
    >
      <defs>
        <pattern id="grid-20" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0.5 20V0.5H20" fill="none" stroke="#ffffff" strokeOpacity="0.12" />
        </pattern>
        <g id="grid-pass">
          <rect width="100%" height="100%" fill="url(#grid-20)" />
        </g>
      </defs>
      <use href="#grid-pass" opacity={opacity} />
      <g transform="scale(-1 1) translate(-100%,0)">
        <use href="#grid-pass" opacity={opacity * 0.7} />
      </g>
    </svg>
  );
}
