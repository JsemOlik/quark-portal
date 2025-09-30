import React from 'react';

export default function GradientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 top-0 left-0 -z-10 h-full w-full overflow-hidden select-none">
      <div className="absolute inset-0">
        <img
          alt=""
          aria-hidden="true"
          draggable="false"
          decoding="async"
          data-nimg="fill"
          className="object-cover"
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            inset: 0,
            color: 'transparent',
            filter:
              'grayscale(100%) blur(40px) brightness(0.3) contrast(1.2)',
            opacity: 0.8,
          }}
          sizes="100vw"
          srcSet="/minecraft-banner.png"
          src="/minecraft-banner.png"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgb(94, 177, 74)',
          opacity: 0.25,
          mixBlendMode: 'multiply',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgb(94, 177, 74)',
          opacity: 0.08,
          mixBlendMode: 'screen',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
}
