// resources/js/Pages/storage/components/Highlights.tsx
import React from 'react';
import BackdropGrid from './BackdropGrid';
import { IconBucket, IconShield, IconSpeed, IconS3 } from './icons';
import { motion } from 'framer-motion';

const items = [
  {
    icon: IconS3,
    title: 'S3 compatible',
    desc: 'Works with AWS SDKs, rclone, s3cmd, MinIO client (mc), and most backup tools.',
  },
  {
    icon: IconSpeed,
    title: 'Low latency, high throughput',
    desc: 'Local uplinks and NVMe-backed nodes for snappy reads and fast backups.',
  },
  {
    icon: IconShield,
    title: 'Durability options',
    desc: 'Choose single-replica for value or erasure coding for robust durability.',
  },
  {
    icon: IconBucket,
    title: 'Buckets, policies, keys',
    desc: 'Manage access keys, per-bucket policies, and lifecycle in minutes.',
  },
];

export default function Highlights() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-14">
      <BackdropGrid opacity={0.08} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
        style={{ backgroundColor: '#ee8132' }}
      />
      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#201c18]/40 to-transparent p-5"
              style={{ outline: '1px solid var(--brand-brown, rgba(255,255,255,0.05))' }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold">{it.title}</div>
              <p className="mt-1 text-sm text-brand-cream/80">{it.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
