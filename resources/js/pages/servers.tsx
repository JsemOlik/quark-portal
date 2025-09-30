import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { formatGameName } from '@/lib/utils/formatGameName';

type Server = {
  id: number;
  name: string;
  game: string;
  billing_cycle: 'monthly' | 'yearly';
  pending_billing_cycle?: 'monthly' | 'yearly' | null;
  status: string;
  created_at: string;
};

export default function ServersOverview({ servers = [] as Server[] }: { servers?: Server[] }) {
  return (
    <>
      <Head title="Your Game Servers" />
      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
          <h1 className="mb-2 text-2xl font-semibold text-brand-cream">Your Purchased Servers</h1>
          <p className="mb-6 text-brand-cream/80">All services linked to your account.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servers.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-brand-cream/70">No servers yet.</div>
            )}

            {servers.map((s) => (
              <Link key={s.id} href={`/dashboard/servers/${s.id}`} className="block">
                <div
                  className="bg-gradient-to-b from-[#201c18]/37 to-background relative rounded-2xl border p-5 text-brand-cream shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:border-white/10 transition-transform duration-200 hover:scale-102"
                  style={{ outline: '1px solid var(--brand-brown)' }}
                >
                  <div className="mb-2 text-lg font-semibold">{s.name}</div>
                  <div className="text-sm text-brand-cream/80 mb-4">
                    {formatGameName(s.game)} • Billing: {s.billing_cycle}
                    {s.pending_billing_cycle && s.pending_billing_cycle !== s.billing_cycle && (
                      <span className="text-brand ml-1">
                        ({s.pending_billing_cycle} Pending)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand capitalize">{s.status}</span>
                    <span className="text-brand-cream/70 text-xs">Created {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}


