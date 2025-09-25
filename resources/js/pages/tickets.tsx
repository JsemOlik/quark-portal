import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
  ArrowRight,
  Headphones,
  Plus,
  X,
  FileText,
  Clock3,
  CheckCircle2,
} from 'lucide-react';
import React from 'react';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tickets', href: '/tickets' }];

type TicketStatus = 'open' | 'waiting' | 'closed';
type Ticket = {
  id: string;
  subject: string;
  department: string;
  createdAt: string; // ISO date
  lastActivity: string; // relative or ISO
  priority: 'low' | 'normal' | 'high';
  status: TicketStatus;
};

const mockTickets: Ticket[] = [
  {
    id: 'tkt_001',
    subject: 'My server is bricked',
    department: 'Support',
    createdAt: '2025-01-05',
    lastActivity: '10 months ago',
    priority: 'normal',
    status: 'open',
  },
  {
    id: 'tkt_002',
    subject: 'Billing question about last invoice',
    department: 'Billing',
    createdAt: '2025-02-12',
    lastActivity: '8 months ago',
    priority: 'low',
    status: 'waiting',
  },
  {
    id: 'tkt_003',
    subject: 'Feature request: better backups',
    department: 'Product',
    createdAt: '2025-03-20',
    lastActivity: '6 months ago',
    priority: 'high',
    status: 'closed',
  },
];

const cols = '[grid-template-columns:1.6fr_1fr_1fr_.9fr_.9fr_auto]';

function statusStyles(status: TicketStatus) {
  switch (status) {
    case 'open':
      return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'waiting':
      return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200';
    case 'closed':
    default:
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>(mockTickets);
  const [open, setOpen] = React.useState(false);

  function handleCreated(newTicket: Ticket) {
    setTickets((prev) => [newTicket, ...prev]);
    setOpen(false);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Support Tickets" />
      <div className="mt-2 flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tickets</h1>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        <div className="rounded-xl shadow-lg bg-card dark:bg-card p-4">
          {/* Header */}
          <div
            className={`mb-6 grid ${cols} gap-4 px-2 py-3 border-b border-border dark:border-sidebar-border font-semibold text-lg`}
          >
            <div>Subject</div>
            <div>Department</div>
            <div>Created</div>
            <div>Last Activity</div>
            <div>Status</div>
            <div className="text-transparent">•</div>
          </div>

          {/* Rows */}
          <div>
            {tickets.map((t, idx) => (
              <div
                key={t.id}
                className={`grid ${cols} gap-4 px-2 py-4 items-center transition-colors rounded-lg mb-2
                  ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-sidebar' : 'bg-white dark:bg-sidebar-accent'}
                  hover:bg-gray-100 dark:hover:bg-sidebar-border`}
              >
                <div className="font-medium ml-1">{t.subject}</div>
                <div className="text-muted-foreground">{t.department}</div>
                <div>{t.createdAt}</div>
                <div className="text-muted-foreground">{t.lastActivity}</div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles(
                      t.status
                    )}`}
                  >
                    {labelForStatus(t.status)}
                  </span>
                </div>
                <ArrowRight
                  className="text-blue-400 justify-self-end"
                  aria-label={`Open ticket ${t.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <NewTicketModal onClose={() => setOpen(false)} onCreated={handleCreated} />
      )}
    </AppLayout>
  );
}

function labelForStatus(s: TicketStatus) {
  if (s === 'open') return 'Open';
  if (s === 'waiting') return 'Waiting';
  return 'Closed';
}

/* Modal */

function NewTicketModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: Ticket) => void;
}) {
  const initialRef = React.useRef<HTMLInputElement | null>(null);

  const { data, setData, processing } = useForm({
    subject: '',
    department: 'Support',
    priority: 'normal' as Ticket['priority'],
    message: '',
  });

  React.useEffect(() => {
    initialRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const newTicket: Ticket = {
      id: `tkt_${Math.random().toString(36).slice(2, 8)}`,
      subject: data.subject || 'Untitled',
      department: data.department,
      createdAt: new Date().toISOString().slice(0, 10),
      lastActivity: 'just now',
      priority: data.priority as Ticket['priority'],
      status: 'open',
    };
    onCreated(newTicket);
  }

  const canSubmit =
    data.subject.trim().length > 3 && data.message.trim().length > 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with subtle blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Create Ticket</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-sidebar-border"
            aria-label="Close"
          >
            <X />
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Subject full-width */}
          <div className="flex flex-col">
            <Label htmlFor="subject" className="mb-1 text-sm">
              Subject
            </Label>
            <Input
              ref={initialRef}
              id="subject"
              value={data.subject}
              onChange={(e) => setData('subject', e.target.value)}
              placeholder="Briefly describe your issue"
            />
          </div>

          {/* Department and Urgency side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm">Department</Label>
              <Select
                value={data.department}
                onValueChange={(v) => setData('department', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Abuse">Abuse</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm">Urgency</Label>
              <Select
                value={data.priority}
                onValueChange={(v) =>
                  setData('priority', v as Ticket['priority'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <Label htmlFor="message" className="mb-1 text-sm">
              Message
            </Label>
            <Textarea
              id="message"
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              placeholder="Describe the issue in detail..."
              className="min-h-[140px]"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Please avoid sharing secrets or passwords.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || processing}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              Submit Ticket
            </Button>
          </div>
        </form>

        {/* Helper hints */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Hint
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Tips"
            text="Attach logs, steps to reproduce, and expected vs actual behavior."
          />
          <Hint
            icon={<Clock3 className="h-4 w-4" />}
            title="Response time"
            text="Most tickets receive a response within 24 hours."
          />
          <Hint
            icon={<Headphones className="h-4 w-4" />}
            title="Priority"
            text="Set High only for outages or billing emergencies."
          />
        </div>
      </div>
    </div>
  );
}

function Hint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border border-border dark:border-sidebar-border p-3">
      <div className="mb-1 flex items-center gap-2 font-medium">
        <span className="text-blue-400">{icon}</span>
        {title}
      </div>
      <div className="text-muted-foreground">{text}</div>
    </div>
  );
}
