// store/index.tsx (or your StoreV2 page)
import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Hero, Specs, ReviewRail, GamesRail, PricingSection, FAQSection } from './components';
import { IntervalKey, PlanCardData } from './types';

export default function StoreV2() {
  const { props } = usePage<{ plans: PlanCardData[]; currency: string }>();
  const [bill, setBill] = React.useState<IntervalKey>('annual');

  return (
    <>
      <Head title="Game Server Hosting">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <Hero />

        <section className="relative mx-auto w-full pb-14 border-t border-brand-cream/05 pt-14 mb-6">
          <h2 className="mb-2 text-2xl font-semibold text-brand-cream text-center">
            Host all your favorite games with Quark
          </h2>
          <p className="mb-14 text-brand-cream/80 text-center">
            Our list isn't exhaustive; if your game isn't listed, just ask, and we'll likely host it!
          </p>
          <GamesRail />
        </section>

        <Specs />

        <section className="relative mx-auto w-full pb-14 mt-16 mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-brand-cream text-center">
            Loved by gamers worldwide
          </h2>
          <p className="mb-4 text-brand-cream/80 text-center">
            Join thousands of satisfied customers who trust our game server hosting needs. See what our community has to say.
          </p>
          <ReviewRail />
        </section>

        <PricingSection
          bill={bill}
          onChangeBill={setBill}
          plans={props.plans}
          currency={props.currency}
        />

        <FAQSection />

        <footer className="mx-auto w-full max-w-7xl px-4 pb-10 text-xs text-brand-cream/50">
          Prices and specs are indicative. Final performance varies by node and
          workload. Features may change without notice.
        </footer>

        <section id="footnotes">
          <footer className="mx-auto w-full max-w-7xl px-4 pb-10 text-xs text-brand-cream/50">
            <h1 className="text-lg font-semibold">Footnotes</h1>
            <ol className="list-decimal pl-5">
              <li>Nodes feature 1 Gbps uplinks to the Internet, delivering "light-speed" throughput.</li>
              <li>Regional ping averages are ≈ 30 ms to our datacenters, ensuring "ultra-low" latency.</li>
              <li>Storage capacity is limited at 20 GB, delivering "unlimited" storage.</li>
            </ol>
          </footer>
        </section>
      </div>
    </>
  );
}
