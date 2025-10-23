// resources/js/Pages/storage/components/FeatureStrip.tsx
import React from 'react';
import { IconKey, IconShield, IconGauge, IconCloudArrow } from './icons';

const items = [
  { icon: IconCloudArrow, title: 'S3 compatible', sub: 'AWS SDKs, rclone, s3cmd' },
  { icon: IconGauge, title: 'Low latency', sub: 'NVMe-backed throughput' },
  { icon: IconShield, title: 'Durability options', sub: 'Single or erasure coded' },
  { icon: IconKey, title: 'Keys & policies', sub: 'Fine-grained access' },
];

export default function FeatureStrip() {
  return (
    <section className="relative mx-auto w-full border-t border-white/5">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 py-10 md:grid-cols-4">
        {items.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="rounded-xl border border-white/10 bg-gradient-to-b from-[#1a1612]/50 to-transparent p-4"
          >
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-brand-cream/70">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
