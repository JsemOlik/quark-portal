// store/components/Pricing/PlansGrid.tsx
import React from 'react';
import { IntervalKey, PlanCardData } from '../../types';
import PlanCard from './PlanCard';

export default function PlansGrid({
  bill,
  plans,
  currency,
}: {
  bill: IntervalKey;
  plans: PlanCardData[];
  currency: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} interval={bill} currency={currency} />
      ))}
    </div>
  );
}
