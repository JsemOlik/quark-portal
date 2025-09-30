import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { formatGameName } from '@/lib/utils/formatGameName';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// import { Checkbox } from '@/components/ui/checkbox';

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
  date: string;
  amount: string;
};

type FlashMessages = {
  success?: string;
  error?: string;
};

export default function ServerShow({
  server,
  invoices = [] as unknown[],
  nextBilling,
//   csrf,
  flash,
}: {
  server: Server;
  invoices?: unknown[];
  nextBilling?: NextBilling | null;
  csrf?: string;
  flash?: FlashMessages;
}) {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [showNotification, setShowNotification] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [removeInvoices, setRemoveInvoices] = React.useState(false);

  React.useEffect(() => {
    if (flash?.success || flash?.error) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  function handleAction(
    path: string,
    body: Record<string, string>,
    loadingKey: string,
    closeDialog?: () => void
  ) {
    if (loading) return;

    setLoading(loadingKey);
    router.post(path, body, {
      onFinish: () => {
        setLoading(null);
        if (closeDialog) closeDialog();
      },
    });
  }

  return (
    <>
      <Head title={`Server • ${server.name}`} />
      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
          {/* Notification */}
          {showNotification && (flash?.success || flash?.error) && (
            <div
              className={`mb-6 rounded-xl border p-4 ${
                flash?.success
                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                  : 'border-red-500/20 bg-red-500/10 text-red-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm">{flash?.success || flash?.error}</p>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-brand-cream/60 hover:text-brand-cream"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <Link
            href="/dashboard"
            className="text-sm text-brand-cream/70 hover:text-brand"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 mb-2 text-2xl font-semibold text-brand-cream">
            {server.name}
          </h1>
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-brand-cream/80">
            <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">
              {formatGameName(server.game)}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10 capitalize">
              {server.billing_cycle}
              {server.pending_billing_cycle &&
                server.pending_billing_cycle !== server.billing_cycle && (
                  <span className="text-brand ml-1">
                    ({server.pending_billing_cycle} Pending)
                  </span>
                )}
            </span>
            <span
              className={`rounded-full px-3 py-1 border capitalize ${
                server.status === 'active'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : server.status === 'cancelled'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}
            >
              {server.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 text-lg font-semibold text-brand-cream">
                  Manage subscription
                </div>
                <div className="mb-3 text-sm text-brand-cream/70">
                  Changes to your billing cycle will take effect at the end of
                  your current period.
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Switch Billing Dialog */}
                  <Dialog
                    open={switchDialogOpen}
                    onOpenChange={setSwitchDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="rounded-xl bg-brand text-brand-brown hover:bg-brand">
                        Switch to{' '}
                        {server.billing_cycle === 'monthly'
                          ? 'Yearly'
                          : 'Monthly'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#201c18] border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-brand-cream">
                          Switch Billing Cycle
                        </DialogTitle>
                        <DialogDescription className="text-brand-cream/70">
                          Are you sure you want to switch from{' '}
                          {server.billing_cycle} to{' '}
                          {server.billing_cycle === 'monthly'
                            ? 'yearly'
                            : 'monthly'}{' '}
                          billing?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm text-brand-cream/80">
                          <p className="mb-2">
                            • Your current billing cycle will continue until{' '}
                            {nextBilling?.date
                              ? new Date(
                                  nextBilling.date
                                ).toLocaleDateString()
                              : 'the end of the period'}
                          </p>
                          <p>• The new billing cycle will begin at your next renewal</p>
                          <p className="mt-2">• No immediate charges will be made</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setSwitchDialogOpen(false)}
                          className="rounded-xl text-brand-cream"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={!!loading}
                          onClick={() =>
                            handleAction(
                              `/servers/${server.id}/switch-billing`,
                              {
                                billing:
                                  server.billing_cycle === 'monthly'
                                    ? 'yearly'
                                    : 'monthly',
                              },
                              'switch',
                              () => setSwitchDialogOpen(false)
                            )
                          }
                          className="rounded-xl bg-brand text-brand-brown hover:bg-brand"
                        >
                          {loading === 'switch'
                            ? 'Switching...'
                            : 'Confirm Switch'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Cancel Subscription Dialog (hidden if already cancelled) */}
                  {server.status !== 'cancelled' && (
                    <Dialog
                      open={cancelDialogOpen}
                      onOpenChange={setCancelDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="rounded-xl bg-transparent text-red-300 hover:text-red-200 hover:bg-red-500/10">
                          Cancel service
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#201c18] border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-brand-cream">
                            Cancel Subscription
                          </DialogTitle>
                          <DialogDescription className="text-brand-cream/70">
                            Are you sure you want to cancel your server
                            subscription?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-brand-cream/80">
                            <p className="font-semibold text-yellow-400 mb-2">
                              What happens next:
                            </p>
                            <p className="mb-1">
                              • Your server will remain active until{' '}
                              {nextBilling?.date
                                ? new Date(
                                    nextBilling.date
                                  ).toLocaleDateString()
                                : 'the end of your billing period'}
                            </p>
                            <p className="mb-1">
                              • You'll continue to have full access during this time
                            </p>
                            <p>• No further charges will be made</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setCancelDialogOpen(false)}
                            className="rounded-xl text-brand-cream"
                          >
                            Keep subscription
                          </Button>
                          <Button
                            disabled={!!loading}
                            onClick={() =>
                              handleAction(
                                `/dashboard/servers/${server.id}/cancel`,
                                {},
                                'cancel',
                                () => setCancelDialogOpen(false)
                              )
                            }
                            variant="destructive"
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                          >
                            {loading === 'cancel'
                              ? 'Cancelling...'
                              : 'Yes, cancel subscription'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Remove From Account (only when cancelled) */}
                  {server.status === 'cancelled' && (
                    <Dialog
                      open={removeDialogOpen}
                      onOpenChange={(open) => {
                        setRemoveDialogOpen(open);
                        if (!open) setRemoveInvoices(false);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="rounded-xl bg-red-700 hover:bg-red-800"
                        >
                          Remove from account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#201c18] border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-brand-cream">
                            Remove Server
                          </DialogTitle>
                          <DialogDescription className="text-brand-cream/70">
                            This will permanently remove this server from your
                            account. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-brand-cream/80">
                            <p className="font-semibold text-red-400 mb-2">
                              Important:
                            </p>
                            <p className="mb-1">
                              • The server record and its links will be deleted
                            </p>
                            <p className="mb-1">
                              • You will no longer see it in your dashboard
                            </p>
                            <p>• This cannot be reversed</p>
                          </div>

                          {/* <div className="flex items-center gap-3">
                            <Checkbox
                              id="removeInvoices"
                              checked={removeInvoices}
                              onCheckedChange={(v) =>
                                setRemoveInvoices(Boolean(v))
                              }
                              className="border-white/30 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <label
                              htmlFor="removeInvoices"
                              className="text-sm text-brand-cream/90 select-none"
                            >
                              Remove invoices too?
                            </label>
                          </div> */}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setRemoveDialogOpen(false)}
                            className="rounded-xl text-brand-cream"
                          >
                            Keep it
                          </Button>
                          <Button
                            disabled={!!loading}
                            onClick={() =>
                              handleAction(
                                `/dashboard/servers/${server.id}/remove`,
                                {
                                  remove_invoices: removeInvoices ? '1' : '0',
                                },
                                'remove',
                                () => setRemoveDialogOpen(false)
                              )
                            }
                            variant="destructive"
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                          >
                            {loading === 'remove'
                              ? 'Removing...'
                              : 'Yes, remove'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              {/* Next Payment Card */}
              {nextBilling && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 text-lg font-semibold text-brand-cream">
                    Next Payment
                  </div>
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                    <div className="mb-2 text-xs text-brand-cream/60 uppercase tracking-wide">
                      Due Date
                    </div>
                    <div className="mb-3 text-lg font-semibold text-brand-cream">
                      {new Date(nextBilling.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="mb-2 text-xs text-brand-cream/60 uppercase tracking-wide">
                      Amount
                    </div>
                    <div className="text-2xl font-bold text-brand">
                      {nextBilling.amount}
                    </div>
                  </div>
                </div>
              )}

              {/* Server Details Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 text-lg font-semibold text-brand-cream">
                  Server Details
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-brand-cream/60">
                      Server ID
                    </span>
                    <span className="text-sm font-medium text-brand-cream">
                      #{server.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-brand-cream/60">
                      Created
                    </span>
                    <span className="text-sm font-medium text-brand-cream">
                      {new Date(server.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-brand-cream/60">Game</span>
                    <span className="text-sm font-medium text-brand-cream">
                      {formatGameName(server.game)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Invoices Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 text-lg font-semibold text-brand-cream">
                  Recent Invoices
                </div>
                {!invoices || invoices.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm text-brand-cream/70">
                    No invoices yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((inv: any, idx: number) => (
                      <a
                        key={`${inv.id}-${idx}`}
                        href={inv.hosted_invoice_url ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-brand-cream/60">
                            {inv.date ?? 'N/A'}
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              inv.paid
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {inv.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-brand-cream">
                            {inv.number || 'Invoice'}
                          </div>
                          <div className="text-sm font-semibold text-brand">
                            {inv.total}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
