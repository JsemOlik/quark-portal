import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Bill } from '../../types';
import {
  IconAMD,
  IconBackup,
  IconBoltCircle,
  IconMemory,
  IconPorts,
  IconStorage,
  IconVCore,
} from '../../components/icons';

function FeatureRow({
  icon,
  text,
  strong,
  linklike,
}: {
  icon: React.ReactNode;
  text: string;
  strong?: boolean;
  linklike?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-green-400">{icon}</span>
      <span
        className={
          (strong ? 'font-extrabold ' : '') +
          (linklike
            ? 'underline decoration-dotted underline-offset-4'
            : '')
        }
      >
        {text}
      </span>
    </li>
  );
}

export default function CustomPlanRow({ bill }: { bill: Bill }) {
  const yearly = bill === 'yearly';
  const [ram, setRam] = React.useState(14);

  const base = 0;
  const perGB = 25;
  let price = base + ram * perGB;
  if (yearly) price = Math.round(price * 0.85);

  return (
    <div className="rounded-2xl border border-black/15 bg-[#110F0D] p-4 text-brand-cream shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:border-white/10 transition-transform duration-200 hover:scale-101">
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-black">
          Custom
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
        <div className="md:col-span-2 flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <IconBoltCircle className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold">Custom</div>
        </div>

        <div className="md:col-span-3 space-y-2 text-sm">
          <FeatureRow
            icon={<IconAMD className="h-5 w-5 text-brand" />}
            text="AMD Ryzen™ 7 5700"
            strong
          />
          <FeatureRow
            icon={<IconMemory className="h-5 w-5 text-brand" />}
            text={`${ram}GB DDR4 RAM`}
          />
          <FeatureRow
            icon={<IconBackup className="h-5 w-5 text-brand" />}
            text="8 Free Backups"
          />
        </div>

        <div className="md:col-span-3 space-y-2 text-sm">
          <FeatureRow
            icon={<IconVCore className="h-5 w-5 text-brand" />}
            text="8 vCores @ ~4.2 GHz"
          />
          <FeatureRow
            icon={<IconStorage className="h-5 w-5 text-brand" />}
            text="Unlimited NVMe Storage"
            linklike
          />
          <FeatureRow
            icon={<IconPorts className="h-5 w-5 text-brand" />}
            text="12 Port Allocations"
          />
        </div>

        <div className="md:col-span-2 flex flex-col items-end justify-center gap-1">
          <div className="text-3xl font-bold">
            Kč{price}
            <span className="ml-1 align-middle text-sm font-normal text-brand-cream/80">
              /month
            </span>
          </div>
          <div className="text-xs text-brand-cream/70">Save with annual billing</div>
        </div>

        <div className="md:col-span-2 flex items-center justify-end">
          <Button className="w-full text-brand-cream transition-transform duration-200 hover:scale-105">Configure Server</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-brand-cream/80">RAM</div>
            <div className="text-sm font-semibold">{ram}GB</div>
          </div>
          <Slider
            value={[ram]}
            min={3}
            max={32}
            step={1}
            onValueChange={(v) => setRam(v[0] ?? ram)}
          />
          <div className="mt-1 flex justify-between text-xs text-brand-cream/60">
            <span>3GB</span>
            <span>32GB</span>
          </div>
        </div>

        <div className="md:col-span-12">
          <div className="mt-3 rounded-lg border border-green-800 bg-green-900/40 px-4 py-3 text-sm text-green-200">
            This plan should work well for Minecraft
            <div className="text-xs text-green-300/80">
              You can always adjust the RAM later if needed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
