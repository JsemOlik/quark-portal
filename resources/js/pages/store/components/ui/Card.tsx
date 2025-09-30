import React from 'react';

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ' +
        className
      }
    >
      {children}
    </div>
  );
}
