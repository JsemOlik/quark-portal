// resources/js/Pages/storage/components/PricingPrimary.tsx
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
  popular?: boolean;
};

function cz(minor: number) {
  const major = minor / 100;
  const [int, dec] = major.toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${dec}`;
}

export default function PricingPrimary({
  currency,
  plans,
}: {
  currency: string;
  plans: Plan[];
}) {
  const top = plans.slice(0, 3);

  return (
    <section id="pricing" className="relative mx-auto w-full border-t border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <h2 className="text-2xl font-semibold">Find your perfect plan</h2>
          <div className="text-xs text-brand-cream/70">Available in select regions</div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {top.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1612]/45 to-[#0f0e0c] p-5 transition-transform duration-200 hover:scale-[1.02] ${
                p.popular ? 'ring-1 ring-brand' : ''
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-black">
                  Most Popular
                </div>
              )}
              <div className="mb-1 text-lg font-semibold">{p.name}</div>
              <div className="text-sm text-brand-cream/70">
                {p.redundancy === 'erasure' ? 'Erasure coded' : 'Single replica'}
              </div>
              <div className="my-4 h-px w-full bg-white/10" />
              <div className="text-3xl font-bold">
                {cz(p.monthlyMinor)} Kč
                <span className="ml-1 text-sm font-normal text-brand-cream/80">/mo</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>• {p.storageGB} GB storage</li>
                <li>• {p.bandwidthTB} TB egress included</li>
                <li>• S3-compatible API</li>
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-5">
                <Button className="w-full rounded-xl text-brand-cream">
                  <a href={`/storage/checkout?plan=${encodeURIComponent(p.id)}`}>Get Storage</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
