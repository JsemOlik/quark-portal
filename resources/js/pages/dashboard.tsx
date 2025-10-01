import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowRight, Headphones } from 'lucide-react';
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

type NextBilling = {
  server_name: string;
  game: string;
  date: string;
  amount: string;
};

export default function DashboardPage({
  servers = [] as Server[],
  serversCount = 0,
  invoices = [] as any[],
  nextBillings = [] as NextBilling[],
  isAdmin = false,
}: {
  servers?: Server[];
  serversCount?: number;
  invoices?: any[];
  nextBillings?: NextBilling[];
  isAdmin?: boolean;
}) {
  return (
    <>
      <Head title="Dashboard" />
      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
          <h1 className="mb-2 text-2xl font-semibold text-brand-cream">Dashboard</h1>
          <p className="mb-6 text-brand-cream/80">Manage your active services and billing.</p>

          {/* Upcoming Payments */}
          {nextBillings && nextBillings.length > 0 && (
            <div className="mb-6 rounded-2xl border border-brand/20 bg-brand/5 p-5">
              <div className="mb-3 text-lg font-semibold text-brand-cream">
                Upcoming Payments
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nextBillings.map((billing, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-1 text-sm font-medium text-brand-cream">
                      {billing.server_name}
                    </div>
                    <div className="mb-2 text-xs text-brand-cream/60">
                      {formatGameName(billing.game)}
                    </div>
                    <div className="mb-1 text-lg font-semibold text-brand">
                      {billing.amount}
                    </div>
                    <div className="text-xs text-brand-cream/70">
                      Due:{' '}
                      {new Date(billing.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-lg font-semibold text-brand-cream">
                Active Services
              </div>
              <div className="space-y-2">
                {servers.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-brand-cream/70">
                    No active services yet.
                  </div>
                )}
                {servers.map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/servers/${s.id}`}
                    className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-brand-cream">{s.name}</div>
                        <div className="text-sm text-brand-cream/70">
                          {/* {formatGameName(s.game)} • */}Billing: {s.billing_cycle}
                          {s.pending_billing_cycle &&
                            s.pending_billing_cycle !== s.billing_cycle && (
                              <span className="text-brand ml-1">
                                ({s.pending_billing_cycle} Pending)
                              </span>
                            )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </Link>
                ))}
                {serversCount > servers.length && (
                  <div className="pt-2">
                    <Link
                      href="/dashboard/servers"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-cream hover:bg-white/10"
                    >
                      View all services
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-lg font-semibold text-brand-cream">
                Billing & Invoices
              </div>
              <div className="space-y-2">
                {(!invoices || invoices.length === 0) && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-brand-cream/70">
                    No invoices yet.
                  </div>
                )}
                {invoices &&
                  invoices.slice(0, 4).map((inv: any) => (
                    <a
                      key={inv.id}
                      href={inv.hosted_invoice_url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-brand-cream">
                            Invoice {inv.number}
                          </div>
                          <div className="text-sm text-brand-cream/70">
                            {inv.date ?? ''} • {inv.paid ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                        <div className="font-semibold">{inv.total}</div>
                      </div>
                    </a>
                  ))}
                {invoices && invoices.length > 4 && (
                  <div className="pt-2">
                    <Link
                      href="/dashboard/invoices"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-cream hover:bg-white/10"
                    >
                      View all invoices
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support CTA section */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-xl font-semibold text-brand-cream mb-2">
                  Need help? We’re here for you.
                </h2>
                <p className="text-brand-cream/80">
                  Our support team is ready to help with billing, technical
                  issues, or general questions. Reach out and we’ll get back to
                  you as fast as possible.
                </p>
              </div>
              <div className="flex md:justify-end gap-3">
                <Link href="/dashboard/tickets">
                  <button className="rounded-xl bg-brand text-brand-brown px-6 py-3 text-sm font-semibold hover:bg-brand/90 transition-colors inline-flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Contact Support
                  </button>
                </Link>

                {isAdmin && (
                  <Link href="/dashboard/admin/tickets">
                    <button className="rounded-xl border border-white/20 text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors">
                      Admin Tickets
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function statusClasses(status: string) {
  switch (status) {
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border border-red-400/30';
    case 'suspended':
      return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
    case 'active':
      return 'bg-brand/20 text-brand border border-brand/30';
    default:
      return 'bg-white/10 text-brand-cream/80 border border-white/10';
  }
}
