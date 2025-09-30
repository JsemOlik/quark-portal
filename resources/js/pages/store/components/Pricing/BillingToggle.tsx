import React from 'react';
import { Bill } from '../../types';

export default function BillingToggle({
  bill,
  onChange,
}: {
  bill: Bill;
  onChange: (b: Bill) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => onChange('monthly')}
        className={
          'rounded-full px-3 py-1 text-sm text-white ' +
          (bill === 'monthly' ? 'bg-brand' : 'hover:bg-white/10')
        }
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={
          'rounded-full px-3 py-1 text-sm text-white ' +
          (bill === 'yearly' ? 'bg-brand' : 'hover:bg-white/10')
        }
      >
        Yearly
      </button>
    </div>
  );
}
