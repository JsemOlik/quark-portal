import React from 'react';
import { Bill } from '../../types';
import BillingToggle from './BillingToggle';
import PlansGrid from './PlansGrid';
import CustomPlanRow from './CustomPlanRow';

export default function PricingSection({
  bill,
  onChangeBill,
}: {
  bill: Bill;
  onChangeBill: (b: Bill) => void;
}) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pb-16">
      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <h2 className="text-2xl font-semibold text-white">
          Simple, transparent pricing.
        </h2>
        <BillingToggle bill={bill} onChange={onChangeBill} />
      </div>

      <PlansGrid bill={bill} />

      <div className="mt-8">
        <CustomPlanRow bill={bill} />
      </div>
    </section>
  );
}
