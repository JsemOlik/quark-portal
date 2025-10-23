// resources/js/Pages/storage/components/Hero.tsx
import React from 'react';
import BackdropGrid from './BackdropGrid';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function Hero({ appName }: { appName: string }) {
  return (
    <section className="relative mx-auto w-full overflow-hidden">
      {/* arc glow */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(70% 40% at 50% 0%, rgba(238,129,50,0.22) 0%, transparent 55%)',
        }}
      />
      <BackdropGrid opacity={0.10} />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-14 pb-12 text-center">
        <div className="mx-auto mb-3 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#ee8132] to-transparent opacity-70" />
        <h1 className="text-3xl font-semibold md:text-5xl">
          Your Storage
          <br />
          <span className="text-brand">on {appName}</span>
        </h1>
        <p className="mt-3 text-sm text-brand-cream/80 md:text-base">
          Harness S3‑compatible object storage powered by MinIO. Fast backups,
          reliable assets, fair pricing.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="#pricing">
            <Button className="rounded-full bg-brand text-black hover:bg-brand/90">
              Learn More
            </Button>
          </Link>
          <a href="#pricing">
            <Button
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 text-brand-cream hover:bg-white/10"
            >
              Starting at 49 Kč/mo →
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
