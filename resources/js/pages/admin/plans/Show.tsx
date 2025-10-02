import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Plan = {
  id: number;
  key: string;
  name: string;
  active: boolean;
  stripe_product_id: string | null;
};

export default function Show({
  plan,
  grid,
  currencies,
  intervals,
  savings,
}: {
  plan: Plan;
  grid: Record<string, Record<string, { id: number; stripe_price_id: string; unit_amount: number; active: boolean } | null>>;
  currencies: string[];
  intervals: string[];
  savings: Record<string, | { monthly_annualized: number; annual: number; savings: number; savings_pct: number } | null>;
}) {
  const { data, setData, put, processing } = useForm({
    name: plan.name,
    active: plan.active,
  });

  const [currency, setCurrency] = React.useState<string>(currencies[0] || 'czk');
  const [interval, setInterval] = React.useState<string>(intervals[0] || 'monthly');
  const [amount, setAmount] = React.useState<string>('');
  const [priceId, setPriceId] = React.useState<string>('');

  const onUpdatePlan = () => {
    put(`/admin/plans/${plan.id}`);
  };

  const addPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('interval', interval);
    fd.append('currency', currency);
    // UI receives amount in major units; convert to minor (×100)
    const minor = Math.round(Number(amount) * 100);
    fd.append('unit_amount', String(minor));
    fd.append('stripe_price_id', priceId);
    await fetch(`/admin/plans/${plan.id}/prices`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': getCsrf() },
      body: fd,
    });
    window.location.reload();
  };

  const deactivatePrice = async (priceRow: { id: number }) => {
    const fd = new FormData();
    fd.append('active', '0');
    await fetch(`/admin/plans/${plan.id}/prices/${priceRow.id}`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': getCsrf() },
      body: fd,
    });
    window.location.reload();
  };

  function getCsrf() {
    const el = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return el?.content || '';
  }

  return (
    <>
      <Head title={`Admin • ${plan.name}`}>
        <link rel="preconnect" href="https://fonts.bunny.net" />
      </Head>

      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10">
          <div className="mb-6">
            <Link href="/admin/plans" className="text-sm text-brand-cream/70 hover:text-brand">
              ← Back to plans
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 text-lg font-semibold text-brand-cream">Plan details</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-brand-cream">Name</Label>
                  <Input
                    className="mt-2"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-brand-cream">Key</Label>
                  <Input className="mt-2" value={plan.key} readOnly />
                </div>
                <div>
                  <Label className="text-brand-cream">Stripe Product ID</Label>
                  <Input className="mt-2" value={plan.stripe_product_id || ''} readOnly />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="active"
                    type="checkbox"
                    checked={data.active}
                    onChange={(e) => setData('active', e.target.checked)}
                  />
                  <Label htmlFor="active" className="text-brand-cream">Active</Label>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  disabled={processing}
                  className="rounded-xl bg-brand text-brand-brown hover:bg-brand"
                  onClick={onUpdatePlan}
                >
                  {processing ? 'Saving…' : 'Save'}
                </Button>
              </div>

              <div className="mt-8">
                <div className="mb-2 text-lg font-semibold text-brand-cream">Prices</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-brand-cream/80">
                    <thead>
                      <tr>
                        <th className="py-2">Currency</th>
                        {intervals.map((intv) => (
                          <th key={intv} className="py-2 capitalize">{intv.replace('_', ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currencies.map((cur) => (
                        <tr key={cur} className="border-t border-white/10">
                          <td className="py-2 uppercase">{cur}</td>
                          {intervals.map((intv) => {
                            const row = grid[cur][intv];
                            return (
                              <td key={`${cur}-${intv}`} className="py-2">
                                {row ? (
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div>ID: {row.stripe_price_id}</div>
                                      <div>Amount: {(row.unit_amount / 100).toFixed(2)}</div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      className="text-red-300 hover:bg-red-900/20"
                                      onClick={() => deactivatePrice(row)}
                                    >
                                      Deactivate
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-brand-cream/50">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 text-lg font-semibold text-brand-cream">Add a price</div>
                <form onSubmit={addPrice} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <Label className="text-brand-cream">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-brand-cream">Interval</Label>
                    <Select value={interval} onValueChange={setInterval}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Interval" />
                      </SelectTrigger>
                      <SelectContent>
                        {intervals.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-brand-cream">Amount (major units)</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-brand-cream">Stripe Price ID</Label>
                    <Input
                      className="mt-2"
                      value={priceId}
                      onChange={(e) => setPriceId(e.target.value)}
                      placeholder="price_..."
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Button type="submit" className="rounded-xl bg-brand text-brand-brown hover:bg-brand">
                      Add price
                    </Button>
                  </div>
                </form>
                <div className="mt-2 text-xs text-brand-cream/60">
                  Tip: You can also leave Price creation to the sync command and only manage amounts in config/quark_plans.php.
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-lg font-semibold text-brand-cream">Savings (Annual vs Monthly)</div>
              <ul className="space-y-2 text-sm text-brand-cream/80">
                {currencies.map((cur) => {
                  const row = savings[cur];
                  return (
                    <li key={cur} className="rounded-lg bg-white/5 p-3">
                      <div className="font-semibold uppercase">{cur}</div>
                      {row ? (
                        <div className="mt-1 text-brand-cream/70">
                          <div>Monthly x12: {(row.monthly_annualized / 100).toFixed(2)}</div>
                          <div>Annual: {(row.annual / 100).toFixed(2)}</div>
                          <div className="text-green-300">
                            Save: {(row.savings / 100).toFixed(2)} ({row.savings_pct}%)
                          </div>
                        </div>
                      ) : (
                        <div className="text-brand-cream/50">Unavailable (need monthly and annual)</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <Link href="/admin/plans" className="text-brand underline hover:text-brand/80">
                  Back to list
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
