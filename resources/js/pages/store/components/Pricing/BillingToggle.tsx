// store/components/Pricing/BillingToggle.tsx
import React from 'react';
import { IntervalKey } from '../../types';

export default function BillingToggle({
  bill,
  onChange,
}: {
  bill: IntervalKey;
  onChange: (b: IntervalKey) => void;
}) {
  const options: { key: IntervalKey; label: string }[] = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'semi_annual', label: 'Semi-annual' },
    { key: 'annual', label: 'Annual' },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={
            'rounded-full px-3 py-1 text-sm text-white ' +
            (bill === opt.key ? 'bg-brand' : 'hover:bg-white/10')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
