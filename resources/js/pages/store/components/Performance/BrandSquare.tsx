import React from 'react';

export default function BrandSquare({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded bg-white/12 text-[10px]">
      {children}
    </div>
  );
}
