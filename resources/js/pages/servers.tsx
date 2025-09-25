import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Servers',
        href: '/servers',
    },
];

const cols =
  "[grid-template-columns:1.6fr_1fr_1fr_.8fr_.9fr_auto]"; // 5 data cols + auto arrow

const userServers = [
    {
        id: 1,
        name: 'Minecraft Survival',
        nextPayment: '2025-10-15',
        billingCycle: 'Monthly',
        price: '$12.99',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Valheim Adventure',
        nextPayment: '2025-10-02',
        billingCycle: 'Quarterly',
        price: '$34.99',
        status: 'Active',
    },
    {
        id: 3,
        name: 'Rust PvP',
        nextPayment: '2025-09-30',
        billingCycle: 'Monthly',
        price: '$15.99',
        status: 'Suspended',
    },
];

function statusStyles(status: string) {
    if (status === 'Active') {
        return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (status === 'Suspended') {
        return 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

export default function ServersOverview() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Your Game Servers" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <h1 className="text-2xl font-bold mb-4 mt-2">Your Purchased Servers</h1>
        <div className="rounded-xl shadow-lg bg-card dark:bg-card p-4">
          {/* Header row */}
          <div
            className={`grid ${cols} gap-4 px-2 py-3 border-b border-border dark:border-sidebar-border font-semibold text-lg mb-6`}
          >
            <div>Server Name</div>
            <div>Next Payment</div>
            <div>Billing Cycle</div>
            <div>Price</div>
            <div>Status</div>
            <div className='text-transparent'>Hey ;&#41;</div> {/* Invisible placeholder for alignment (the html code is a right parenthesis) */}
          </div>

          {/* Data rows */}
          <div>
            {userServers.map((server, idx) => (
              <Link href={`/servers/${server.id}`}>
                <div
                    key={server.id}
                    className={`grid ${cols} gap-4 px-2 py-4 items-center transition-colors rounded-lg mb-2
                    ${idx % 2 === 0 ? "bg-gray-50 dark:bg-sidebar hover:bg-gray-100 dark:hover:bg-sidebar-border" : "bg-white dark:bg-sidebar-accent hover:bg-gray-100 dark:hover:bg-sidebar-border"}`}
                >
                    <div className="font-medium ml-1">{server.name}</div>
                    <div>{server.nextPayment}</div>
                    <div>{server.billingCycle}</div>
                    <div className="font-semibold">{server.price}</div>
                    <div>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles(
                        server.status
                        )}`}
                    >
                        {server.status}
                    </span>
                    </div>

                    <ArrowRight
                        className="text-blue-400 justify-self-end"
                        aria-label="Open server details"
                    />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
