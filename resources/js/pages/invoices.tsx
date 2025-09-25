import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowRight, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Invoices', href: '/invoices' },
];

type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Refunded';

type Invoice = {
  id: string;
  number: string;
  date: string; // ISO date
  dueDate: string; // ISO date
  total: string; // formatted currency
  status: InvoiceStatus;
  pdfUrl?: string;
};

const invoices: Invoice[] = [
  {
    id: 'inv_0001',
    number: 'INV-2025-001',
    date: '2025-09-15',
    dueDate: '2025-09-30',
    total: '$12.99',
    status: 'Paid',
    pdfUrl: '/invoices/INV-2025-001.pdf',
  },
  {
    id: 'inv_0002',
    number: 'INV-2025-002',
    date: '2025-10-01',
    dueDate: '2025-10-15',
    total: '$34.99',
    status: 'Unpaid',
    pdfUrl: '/invoices/INV-2025-002.pdf',
  },
  {
    id: 'inv_0003',
    number: 'INV-2025-003',
    date: '2025-08-01',
    dueDate: '2025-08-15',
    total: '$15.99',
    status: 'Overdue',
    pdfUrl: '/invoices/INV-2025-003.pdf',
  },
];

function statusStyles(status: InvoiceStatus) {
  switch (status) {
    case 'Paid':
      return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Unpaid':
      return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Overdue':
      return 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Refunded':
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// Reuse the same grid logic: 5 data columns + auto for arrow/actions
const cols =
  '[grid-template-columns:1.2fr_1fr_1fr_.9fr_.9fr_auto]';

export default function InvoicesPage() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Your Invoices" />
      <div className="mt-2 flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-4">Invoices</h1>

        <div className="rounded-xl shadow-lg bg-card dark:bg-card p-4">
          {/* Header */}
          <div className={`mb-6 grid ${cols} gap-4 px-2 py-3 border-b border-border dark:border-sidebar-border font-semibold text-lg`}>
            <div>Invoice #</div>
            <div>Issued</div>
            <div>Due</div>
            <div>Total</div>
            <div>Status</div>
            <div className='text-transparent'>Hey ;&#41;</div> {/* Invisible placeholder for alignment (the html code is a right parenthesis) */}
          </div>

          {/* Rows */}
          <div>
            {invoices.map((inv, idx) => (
              <div
                key={inv.id}
                className={`grid ${cols} gap-4 px-2 py-4 items-center transition-colors rounded-lg mb-2
                  ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-sidebar' : 'bg-white dark:bg-sidebar-accent'}
                  hover:bg-gray-100 dark:hover:bg-sidebar-border`}
              >
                <div className="font-medium ml-1">{inv.number}</div>
                <div>{inv.date}</div>
                <div>{inv.dueDate}</div>
                <div className="font-semibold">{inv.total}</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>

                {/* Actions: download (if available) + arrow to details */}
                <div className="flex items-center gap-3 justify-self-end">
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      className="text-blue-400 hover:text-blue-500 focus:outline-none"
                      aria-label={`Download ${inv.number}`}
                      download
                    >
                      <Download size={18} />
                    </a>
                  )}
                  <ArrowRight className="text-blue-400" aria-label={`Open ${inv.number}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional: quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Outstanding"
            value={formatCurrency(sumByStatus(invoices, ['Unpaid', 'Overdue']))}
          />
          <SummaryCard title="Paid (30d)" value={formatCurrency(sumRecentPaid(invoices, 30))} />
          <SummaryCard title="Total Invoices" value={String(invoices.length)} />
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-card dark:bg-card shadow p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function parseMoney(m: string) {
  // expects like "$12.99" — adapt as needed for your i18n
  return Number(m.replace(/[^0-9.-]+/g, '')) || 0;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
}

function sumByStatus(list: Invoice[], statuses: InvoiceStatus[]) {
  return list
    .filter((i) => statuses.includes(i.status))
    .reduce((acc, i) => acc + parseMoney(i.total), 0);
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function sumRecentPaid(list: Invoice[], days: number) {
  const now = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  return list
    .filter((i) => i.status === 'Paid' && Math.abs(daysBetween(i.date, now)) <= days)
    .reduce((acc, i) => acc + parseMoney(i.total), 0);
}
