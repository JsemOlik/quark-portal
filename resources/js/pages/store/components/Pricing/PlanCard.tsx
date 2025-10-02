// store/components/Pricing/PlanCard.tsx
import React from 'react';
import { PlanCardData, IntervalKey } from '../../types';
import {
  IconAMD,
  IconBackup,
  IconInfo,
  IconMemory,
  IconPorts,
  IconStorage,
  IconVCore,
} from '../../components/icons';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

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
          (linklike ? 'underline decoration-dotted underline-offset-4' : '')
        }
      >
        {text}
      </span>
    </li>
  );
}

// Months per cycle for monthly-equivalent calculation
const monthsPerCycle: Record<IntervalKey, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
};

// Format minor units (e.g., 16050) to string "160,50" with Czech-style formatting
function formatCZKMinorToMajorString(minor: number): string {
  // Convert to major (Kč) with 2 decimals
  const major = minor / 100;
  // Format with space as thousands sep and comma as decimal sep
  // Example: 123456.5 -> "123 456,50"
  const parts = major.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withThousands},${decPart}`;
}

export default function PlanCard({
  plan,
  interval,
  currency,
}: {
  plan: PlanCardData;
  interval: IntervalKey;
  currency: string;
}) {
  const unitAmountMinor = plan.intervals[interval];

  // Compute monthly-equivalent minor amount if we have a price for the selected cycle
  const monthlyMinor =
    typeof unitAmountMinor === 'number'
      ? Math.round(unitAmountMinor / monthsPerCycle[interval])
      : null;

  // Format for display: "160,50 Kč"
  const displayAmount =
    monthlyMinor !== null
      ? `${formatCZKMinorToMajorString(monthlyMinor)} Kč`
      : '—';

  let iconSrc = '/core.svg';
  if (plan.tier === 'Boost') iconSrc = '/boost.svg';
  else if (plan.tier === 'Power') iconSrc = '/power.svg';
  else if (plan.tier === 'Extreme') iconSrc = '/extreme.svg';

  return (
    <div
      className={
        'bg-gradient-to-b from-[#201c18]/37 to-background relative rounded-2xl border p-5 text-brand-cream shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:border-white/10 transition-transform duration-200 hover:scale-102' +
        (plan.popular ? ' border-brand' : ' border-black/15')
      }
      style={{
        outline: plan.popular ? '1px solid var(--brand)' : '1px solid var(--brand-brown)',
      }}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-sm font-semibold text-black shadow">
          Most Popular
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/15 text-green-400">
          <img src={iconSrc} className="h-8 w-auto white" />
        </div>
        <div className="text-lg font-semibold">{plan.tier}</div>
      </div>

      <div className="mb-1 text-3xl font-bold">
        {displayAmount}
        <span className="ml-1 align-middle text-sm font-normal text-brand-cream/80">
          /month
        </span>
      </div>

      <div className="mb-3 inline-flex items-center gap-2 text-sm text-brand-cream/80">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/40 text-brand">
          <IconInfo className="h-3.5 w-3.5" />
        </span>
        {interval === 'monthly' && 'Billed monthly'}
        {interval === 'quarterly' && 'Billed every 3 months'}
        {interval === 'semi_annual' && 'Billed every 6 months'}
        {interval === 'annual' && 'Billed yearly'}
      </div>

      <hr className="my-3 border-white/10" />

      <ul className="space-y-3 text-sm font-medium">
        <FeatureRow icon={<IconAMD className="h-5 w-5 text-brand" />} text={plan.cpu} strong />
        <FeatureRow icon={<IconVCore className="h-5 w-5 text-brand" />} text={plan.vcores} />
        <FeatureRow icon={<IconMemory className="h-5 w-5 text-brand" />} text={plan.ram} />
        <Link href="#footnotes">
          <FeatureRow
            icon={<IconStorage className="mb-3 h-5 w-5 text-brand" />}
            text={plan.storage}
            linklike
          />
        </Link>
        <FeatureRow icon={<IconBackup className="h-5 w-5 text-brand" />} text={plan.backups} />
        <FeatureRow icon={<IconPorts className="h-5 w-5 text-brand" />} text={plan.ports} />
      </ul>

      <hr className="my-4 border-white/10" />

      <Button
        className={
          'w-full inline-flex items-center justify-center text-brand-cream text-md font-semibold h-10 transition-transform duration-200 hover:scale-105 rounded-xl ' +
          (plan.popular ? ' bg-brand text-brand-brown hover:bg-brand' : 'text-brand-cream border border-white/10 hover:bg-white/10')
        }
      >
        <a
          href={`/configure?plan=${encodeURIComponent(plan.id)}&bill=${
            interval === 'annual' ? 'yearly' : interval
          }`}
        >
          Configure Server
        </a>
      </Button>
    </div>
  );
}
