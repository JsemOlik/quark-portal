import React from 'react';
import { Bill } from '../../types';
import { planData } from '../../data/plans';
import PlanCard from './PlanCard';

export default function PlansGrid({ bill }: { bill: Bill }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {planData.map((p) => (
        <PlanCard key={p.id} plan={p} yearly={bill === 'yearly'} />
      ))}
    </div>
  );
}
