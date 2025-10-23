// resources/js/Pages/storage/index.tsx
import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Hero from './components/Hero';
import QuickDeploy from './components/QuickDeploy';
import FeatureStrip from './components/FeatureStrip';
import ConsolePreview from './components/ConsolePreview';
import PricingPrimary from './components/PricingPrimary';
import PricingEco from './components/PricingEco';
import FAQ from './components/FAQ';

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

type PageProps = {
  currency: string;
  plans: StoragePlan[];
  name?: string;
};

export default function StoragePage({ currency = 'CZK', plans = [], name }: PageProps) {
  const appName = name ?? 'Hosting Company';

  // Split into primary and eco-style groups to mirror screenshot
  const primary = plans.filter((p) => p.class === 'standard');
  const eco = plans.filter((p) => p.class === 'infrequent');

  return (
    <>
      <Head title="Object Storage (MinIO S3)">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#0a0908] text-brand-cream">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <Hero appName={appName} />

        <div className="relative mx-auto w-full border-t border-white/5">
          <QuickDeploy />
        </div>

        <FeatureStrip />

        <ConsolePreview />

        <PricingPrimary currency={currency} plans={primary} />

        <PricingEco currency={currency} plans={eco} />

        <FAQ />

        <footer className="mx-auto w-full max-w-7xl px-4 pb-10 text-xs text-brand-cream/60">
          Prices and specs may vary. Features may change without notice.
        </footer>
      </div>

      <Footer />
    </>
  );
}
