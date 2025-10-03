// store/components/Pricing/PricingSection.tsx
import React from 'react';
import { IntervalKey, PlanCardData } from '../../types';
import BillingToggle from './BillingToggle';
import PlansGrid from './PlansGrid';
import CustomPlanRow from './CustomPlanRow';

export default function PricingSection({
  bill,
  onChangeBill,
  plans,
  currency,
}: {
  bill: IntervalKey;
  onChangeBill: (b: IntervalKey) => void;
  plans: PlanCardData[];
  currency: string;
}) {
  return (
    <section id='pricing' className="relative mx-auto w-full max-w-7xl px-4 pb-16">
      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <h2 className="text-2xl font-semibold text-brand-cream">
          Simple, transparent pricing.
        </h2>
        <BillingToggle bill={bill} onChange={onChangeBill} />
      </div>

      <PlansGrid bill={bill} plans={plans} currency={currency} />

      <div className="mt-8">
        <CustomPlanRow bill={bill} />
      </div>
    </section>
  );
}
