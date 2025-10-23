// resources/js/Pages/storage/components/PricingEco.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

type Plan = {
  id: string;
  name: string;
  monthlyMinor: number;
  storageGB: number;
  bandwidthTB: number;
  redundancy: 'single' | 'erasure';
  features: string[];
};

function cz(minor: number) {
  const major = minor / 100;
  const [i, d] = major.toFixed(2).split('.');
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${d}`;
}

export default function PricingEco({
  currency,
  plans,
}: {
  currency: string;
  plans: Plan[];
}) {
  if (!plans.length) return null;

  return (
    <section className="relative mx-auto w-full border-t border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-4 text-sm text-brand-cream/80">
          Not chasing peak performance? Go Eco.
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20">
          {plans.map((p, idx) => (
            <div
              key={p.id}
              className={`grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-6 ${
                idx !== plans.length - 1 ? 'border-b border-white/10' : ''
              }`}
            >
              <div className="md:col-span-2">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-brand-cream/70">
                  {p.storageGB} GB • {p.bandwidthTB} TB egress •{' '}
                  {p.redundancy === 'erasure' ? 'Erasure' : 'Single'}
                </div>
              </div>
              <div className="text-sm text-brand-cream/80">S3-compatible</div>
              <div className="text-sm text-brand-cream/80">Keys & Policies</div>
              <div className="text-lg font-bold">
                {cz(p.monthlyMinor)} Kč
                <span className="ml-1 text-xs font-normal text-brand-cream/70">/mo</span>
              </div>
              <div className="justify-self-start md:justify-self-end">
                <Button className="rounded-xl text-brand-cream">
                  <a href={`/storage/checkout?plan=${encodeURIComponent(p.id)}`}>Choose</a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-brand-cream/70">
          • Deploy in minutes • API requests included up to fair use • Overage egress billed per GB
        </div>
      </div>
    </section>
  );
}
