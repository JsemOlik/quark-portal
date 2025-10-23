// resources/js/Pages/storage/components/Pricing.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type StoragePlan = {
  id: string;
  name: string;
  monthlyMinor: number;
  storageGB: number;
  bandwidthTB: number;
  redundancy: 'single' | 'erasure';
  class: 'standard' | 'infrequent';
  features: string[];
  popular?: boolean;
};

function formatCZKMinorToMajorString(minor: number): string {
  const major = minor / 100;
  const parts = major.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withThousands},${decPart}`;
}

export default function Pricing({
  currency,
  plans,
}: {
  currency: string;
  plans: StoragePlan[];
}) {
  const standard = plans.filter((p) => p.class === 'standard');
  const infrequent = plans.filter((p) => p.class === 'infrequent');

  const Grid = ({ items }: { items: StoragePlan[] }) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((plan) => (
        <Card
          key={plan.id}
          className={`relative border-white/10 bg-gradient-to-b from-[#201c18]/37 to-background text-brand-cream transition-transform duration-200 hover:scale-[1.02] ${
            plan.popular ? 'ring-1 ring-brand' : ''
          }`}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 bg-brand text-black">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{plan.name}</span>
              <span className="text-sm text-brand-cream/70">
                {plan.redundancy === 'erasure' ? 'Erasure coded' : 'Single replica'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              {formatCZKMinorToMajorString(plan.monthlyMinor)} Kč
              <span className="ml-1 align-middle text-sm font-normal text-brand-cream/80">
                /month
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• {plan.storageGB} GB storage</li>
              <li>• {plan.bandwidthTB} TB egress included</li>
              <li>• S3-compatible API</li>
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Button className="w-full text-brand-cream">
              <a href={`/storage/checkout?plan=${encodeURIComponent(plan.id)}`}>
                Get Storage
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
        style={{ backgroundColor: '#ee8132' }}
      />
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 className="text-2xl font-semibold text-brand-cream">Straightforward pricing</h2>
        <div className="text-sm text-brand-cream/70">
          VAT and overage details shown at checkout
        </div>
      </div>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="mb-6 bg-white/5">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="infrequent">Infrequent Access</TabsTrigger>
        </TabsList>
        <TabsContent value="standard">
          <Grid items={standard} />
        </TabsContent>
        <TabsContent value="infrequent">
          <Grid items={infrequent} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-sm text-brand-cream/70">
        Notes:
        <ul className="ml-4 list-disc">
          <li>Egress beyond included TB billed per GB at checkout rate.</li>
          <li>API requests are included up to fair-use thresholds.</li>
          <li>Erasure coding increases durability with a small overhead.</li>
        </ul>
      </div>
    </section>
  );
}
