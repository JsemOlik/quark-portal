import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Headphones,
  Package,
  Plus,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

// Mock data to match the screenshot
type Service = {
  id: string;
  name: string;
  product: string;
  billing: string;
  expiresAt: string; // "Jan 30, 2025"
  status: 'active' | 'suspended';
};

type Ticket = {
  id: string;
  title: string;
  lastActivity: string; // "10 months ago"
  department: string;
  status: 'open' | 'closed' | 'waiting';
};

type Invoice = {
  id: string;
  number: string;
  due: string; // "2025-10-15"
  total: string; // "$12.99"
  status: 'unpaid' | 'paid' | 'overdue';
};

const activeServices: Service[] = [
  {
    id: 'svc_iron',
    name: 'Iron',
    product: 'Minecraft Servers',
    billing: 'Every 3 months',
    expiresAt: 'Jan 30, 2025',
    status: 'active',
  },
];

const openTickets: Ticket[] = [
  {
    id: 'tkt_001',
    title: 'My server is bricked',
    lastActivity: '10 months ago',
    department: 'Support',
    status: 'open',
  },
];

const unpaidInvoices: Invoice[] = []; // 0 as per screenshot

// Shared mini helpers
const pill = {
  active:
    'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300',
  open: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300',
  unpaid:
    'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
  overdue: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300',
  muted: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const cardBase =
  'rounded-xl bg-card dark:bg-card p-4 flex flex-col gap-4';

const listRowBase =
  'grid [grid-template-columns:1fr_auto] gap-4 px-3 py-4 items-center transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-sidebar-border';

export default function DashboardPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="mt-2 flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mb-2">
          Manage your active services, invoices, tickets, and stay updated here.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Active Services */}
            <section className={cardBase}>
              <HeaderWithCount
                icon={<Package className="h-5 w-5" />}
                title="Active Services"
                count={activeServices.length}
              />
              <div className="flex flex-col gap-2">
                {activeServices.map((svc, idx) => (
                  <div
                    key={svc.id}
                    className={`${listRowBase} ${
                      idx % 2 === 0
                        ? 'bg-gray-50 dark:bg-sidebar'
                        : 'bg-white dark:bg-sidebar-accent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <ServiceBadge status={svc.status} />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium">{svc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Product(s): {svc.product} – {svc.billing} – Expires
                          at: {svc.expiresAt}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className="text-blue-400 justify-self-end"
                      aria-label={`Open ${svc.name}`}
                    />
                  </div>
                ))}
              </div>
              <ViewAllBar href="/servers" label="View All" />
            </section>

            {/* Open Tickets */}
            <section className={cardBase}>
              <HeaderWithCount
                icon={<Headphones className="h-5 w-5" />}
                title="Open Tickets"
                count={openTickets.length}
                extras={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-500"
                    aria-label="Create ticket"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                }
              />
              <div className="flex flex-col gap-2">
                {openTickets.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`${listRowBase} ${
                      idx % 2 === 0
                        ? 'bg-gray-50 dark:bg-sidebar'
                        : 'bg-white dark:bg-sidebar-accent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <TicketBadge status={t.status} />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium">{t.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Last activity {t.lastActivity} – {t.department}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className="text-blue-400 justify-self-end"
                      aria-label={`Open ticket ${t.id}`}
                    />
                  </div>
                ))}
              </div>
              <ViewAllBar href="/tickets" label="View All" />
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Unpaid Invoices */}
            <section className={cardBase}>
              <HeaderWithCount
                icon={<CreditCard className="h-5 w-5" />}
                title="Unpaid Invoices"
                count={unpaidInvoices.length}
              />
              <div className="flex flex-col gap-2">
                {unpaidInvoices.length === 0 ? (
                  <EmptyRow
                    icon={<FileText className="h-4 w-4 opacity-60" />}
                    text="You're all caught up. No unpaid invoices."
                  />
                ) : (
                  unpaidInvoices.map((inv, idx) => (
                    <div
                      key={inv.id}
                      className={`${listRowBase} ${
                        idx % 2 === 0
                          ? 'bg-gray-50 dark:bg-sidebar'
                          : 'bg-white dark:bg-sidebar-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <InvoiceBadge status={inv.status} />
                        <div className="flex flex-col">
                          <div className="font-medium">{inv.number}</div>
                          <div className="text-sm text-muted-foreground">
                            Due {inv.due} • {inv.total}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className="text-blue-400 justify-self-end"
                        aria-label={`Open ${inv.number}`}
                      />
                    </div>
                  ))
                )}
              </div>
              <ViewAllBar href="/invoices" label="View All" />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function HeaderWithCount({
  icon,
  title,
  count,
  extras,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  extras?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-sidebar-accent/60 dark:bg-sidebar-accent flex items-center justify-center">
          <div className="text-blue-300">{icon}</div>
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {typeof count === 'number' && (
          <CountBubble value={count} ariaLabel={`${title} count`} />
        )}
      </div>
      {extras}
    </div>
  );
}

function CountBubble({
  value,
  ariaLabel,
}: {
  value: number;
  ariaLabel?: string;
}) {
  return (
    <span
      className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs px-2"
      aria-label={ariaLabel}
    >
      {value}
    </span>
  );
}

function ViewAllBar({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group mt-1 grid [grid-template-columns:1fr_auto] items-center rounded-lg border border-border dark:border-sidebar-border px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-sidebar-border"
    >
      <span className="text-muted-foreground">{label}</span>
      <ArrowRight className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
    </a>
  );
}

function EmptyRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border dark:border-sidebar-border px-4 py-6 text-sm text-muted-foreground flex items-center gap-2">
      {icon}
      {text}
    </div>
  );
}

// Badges
function ServiceBadge({ status }: { status: Service['status'] }) {
  if (status === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.active}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Active
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.muted}`}
    >
      Suspended
    </span>
  );
}

function TicketBadge({ status }: { status: Ticket['status'] }) {
  if (status === 'open') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.open}`}
      >
        <Headphones className="h-3.5 w-3.5" /> Open
      </span>
    );
  }
  if (status === 'waiting') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.unpaid}`}
      >
        <Clock3 className="h-3.5 w-3.5" /> Waiting
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.muted}`}
    >
      Closed
    </span>
  );
}

function InvoiceBadge({ status }: { status: Invoice['status'] }) {
  if (status === 'unpaid') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.unpaid}`}
      >
        <FileText className="h-3.5 w-3.5" /> Unpaid
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.overdue}`}
      >
        <FileText className="h-3.5 w-3.5" /> Overdue
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${pill.muted}`}
    >
      <FileText className="h-3.5 w-3.5" /> Paid
    </span>
  );
}
