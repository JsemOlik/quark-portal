// resources/js/Pages/storage/components/CTA.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

export default function CTA() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-16">
      <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#201c18]/60 to-[#13110e] p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full"
          style={{ background: 'radial-gradient(circle, #ee813226, transparent 70%)' }}
        />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-semibold text-brand-cream">Ready to store smarter?</h3>
            <p className="mt-1 text-brand-cream/80">
              Spin up an S3 bucket in minutes. Perfect for game backups, logs, and assets.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/storage/console">
              <Button className="text-brand-cream">Open Storage Console</Button>
            </a>
            <a href="/discord" target="_blank" rel="noreferrer">
              <Button className="bg-[#5865F2] text-white hover:bg-[#5865F2]/80 border border-[#5865F2]/80">
                Join our Discord
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
