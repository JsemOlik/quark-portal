import React from 'react';

export default function PerformanceBar({
  brand,
  chip,
  color,
  pricePerGb,
  value = 0.8,
  icon,
}: {
  brand: string;
  chip: string;
  color: string;
  pricePerGb: string;
  value?: number;
  icon?: React.ReactNode;
}) {
  const width = `${Math.max(0, Math.min(1, value)) * 100}%`;

  return (
    <div className="p-4 text-white">
      <div className="mb-2 grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-3">
          <div className="flex h-15 w-15 items-center justify-center">
            {icon ?? <span className="text-xl">🔥</span>}
          </div>
          <div className="leading-tight">
            <div className="font-semibold">{brand}</div>
            <div className="text-xs text-white/70">{pricePerGb}</div>
          </div>
        </div>

        <div className="flex items-center justify-start sm:justify-end w-full">
          <span className="inline-flex flex-col gap-1 px-3 py-1 text-md font-bold w-70">
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-yellow-300">
                ✨
              </span>
              <span className="opacity-90">{chip}</span>
            </span>
            <div className="h-[8px] w-full rounded-full bg-white/12">
              <div
                className={`h-[8px] rounded-full ${color}`}
                style={{ width }}
              />
            </div>
          </span>
        </div>
        <div className="hidden sm:block" />
      </div>
    </div>
  );
}
