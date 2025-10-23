// resources/js/Pages/storage/components/QuickDeploy.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { IconCloudArrow, IconDot } from './icons';

export default function QuickDeploy() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">
            Just a <span className="text-brand">click</span> away from
            <br /> a new backup.
          </h3>
          <p className="mt-2 text-sm text-brand-cream/80">
            Create buckets, keys, and policies in seconds. Wire it into your
            panel backups or scripts without hassle.
          </p>
          <div className="mt-4 flex gap-2">
            <Button className="rounded-full bg-brand text-black hover:bg-brand/90">
              Deploy Now
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 text-brand-cream hover:bg-white/10"
            >
              View Console
            </Button>
          </div>

          {/* dotted connector accent */}
          <div className="mt-5 flex items-center gap-2 text-brand/80">
            <IconDot className="h-1.5 w-1.5" />
            <div className="h-px w-24 bg-gradient-to-r from-brand/60 to-transparent" />
            <IconCloudArrow className="h-5 w-5" />
          </div>
        </div>

        {/* tiny action list to imply UI */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 text-sm text-brand-cream/80">Recent actions</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span>Create bucket “world-backups”</span>
              <span className="text-xs text-brand-cream/70">Success</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span>Generate access key</span>
              <span className="text-xs text-brand-cream/70">Issued</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span>Apply readonly policy</span>
              <span className="text-xs text-brand-cream/70">Applied</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
