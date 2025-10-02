import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';

type PlanRow = {
  id: number;
  key: string;
  name: string;
  active: boolean;
  stripe_product_id: string | null;
  savings: Record<
    string,
    | {
        monthly: number;
        annual: number;
        savings: number;
        savings_pct: number;
      }
    | null
  >;
};

export default function Index({
  plans,
  currencies,
}: {
  plans: PlanRow[];
  currencies: string[];
}) {
  const [syncing, setSyncing] = React.useState(false);

  const syncStripe = async () => {
    setSyncing(true);
    try {
      await fetch('/admin/plans/sync', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': getCsrf() },
      });
      window.location.reload();
    } catch { /* empty */ } finally {
      setSyncing(false);
    }
  };

  function getCsrf() {
    const el = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return el?.content || '';
  }

  return (
    <>
      <Head title="Admin • Plans">
        <link rel="preconnect" href="https://fonts.bunny.net" />
      </Head>

      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-brand-cream">Plans</h1>
            <Button
              className="rounded-xl bg-brand text-brand-brown hover:bg-brand"
              onClick={syncStripe}
              disabled={syncing}
            >
              {syncing ? 'Syncing…' : 'Sync with Stripe'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-brand-cream">{p.name}</div>
                    <div className="text-xs text-brand-cream/60">Key: {p.key}</div>
                  </div>
                  <div className="text-xs">
                    <span
                      className={
                        'rounded-full px-2 py-1 ' +
                        (p.active ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300')
                      }
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-brand-cream/60 mb-2">
                  Stripe Product: {p.stripe_product_id || '—'}
                </div>

                <div className="mt-3">
                  <div className="text-sm text-brand-cream/80 mb-1">Savings (Annual vs Monthly):</div>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-brand-cream/70">
                    {currencies.map((cur) => {
                      const row = p.savings[cur];
                      return (
                        <li key={cur} className="rounded-lg bg-white/5 p-2">
                          <div className="font-semibold uppercase">{cur}</div>
                          {row ? (
                            <div>
                              <div>Monthly x12: {(row.monthly * 12) / 100}</div>
                              <div>Annual: {row.annual / 100}</div>
                              <div className="text-green-300">Save: {row.savings / 100} ({row.savings_pct}%)</div>
                            </div>
                          ) : (
                            <div className="text-brand-cream/50">—</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/admin/plans/${p.id}`}
                    className="text-brand underline hover:text-brand/80"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
