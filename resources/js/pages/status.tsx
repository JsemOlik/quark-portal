import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ChevronDown,
  Info,
} from 'lucide-react';

/* ==================== Types ==================== */

type CubeState = 'up' | 'down' | 'partial' | 'maintenance';
type ComponentStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'
  | 'maintenance';

type DaySample = {
  date: string; // ISO date at midnight
  state: CubeState;
  minutes?: number;
};

type Service = {
  id: string;
  name: string;
  status: ComponentStatus;
  uptime90d: number;
  history: DaySample[]; // 90 entries
};

type Notice = {
  id: string | number;
  kind: 'maintenance' | 'incident';
  title: string;
  started_at: string;
  ends_at?: string | null;
  impact?: 'minor' | 'major' | 'critical';
};

/* ==================== Dummy Data ==================== */

const now = new Date();

const SERVICES: Service[] = [
  mkService('mkt', 'Marketing Website', 'operational', 99.997, {
    downDays: [60],
    partialDays: [],
    maintDays: [],
  }),
  mkService('bill', 'Billing Portal', 'operational', 100.0, {
    downDays: [],
    partialDays: [],
    maintDays: [],
  }),
  mkService('panel', 'Game Panel', 'partial_outage', 99.537, {
    downDays: [75, 76],
    partialDays: [50],
    maintDays: [35],
  }),
  mkService('vps', 'VPS Panel', 'operational', 99.979, {
    downDays: [20],
    partialDays: [],
    maintDays: [],
  }),
];

const NOTICES: Notice[] = [
  {
    id: 1,
    kind: 'maintenance',
    title: 'Scheduled network maintenance (EU region)',
    started_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    ends_at: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
  },
];

/* ==================== Page ==================== */

export default function StatusPage() {
  const overall = deriveOverall(SERVICES, NOTICES);

  return (
    <>
      <Head title="Status" />
      <div className="min-h-screen bg-brand-brown text-brand-cream">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <main className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-10">
          {/* Overall Banner */}
          <section
            className={`mb-6 rounded-2xl border ${overall.border} ${overall.bg} p-6`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {overall.icon}
                <div>
                  <h1 className="text-2xl font-semibold text-brand-cream">
                    {overall.title}
                  </h1>
                  <p className="text-sm text-brand-cream/80">
                    Last updated on {formatUpdated(now)} • {overall.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/discord"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="border border-[#5865F2] bg-[#5865F2] text-white hover:bg-[#5865F2]/80">
                    Get in touch
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Notices (single strip) */}
          {NOTICES.length > 0 && (
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-brand-cream">
                <Info className="h-4 w-4 text-brand-cream/80" />
                <div className="text-sm font-semibold">Current notices</div>
              </div>
              <div className="flex flex-col gap-2">
                {NOTICES.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {n.kind === 'maintenance' ? (
                        <Wrench className="h-4 w-4 text-blue-300" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-300" />
                      )}
                      <div className="text-sm">
                        <span className="font-medium">{n.title}</span>
                        <span className="text-brand-cream/70">
                          {' '}
                          • {n.kind === 'maintenance' ? 'Maintenance' : 'Incident'} •{' '}
                          {formatDateTime(n.started_at)}
                          {n.ends_at ? ` – ${formatDateTime(n.ends_at)}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services card */}
          <section className="rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="text-sm font-semibold text-brand-cream">Services</div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                <span className={`inline-flex h-2 w-2 rounded-full ${overall.dot}`} />
                <span className="capitalize">{overall.badge}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </div>
            </div>

            <div className="px-5 pb-5 pt-2">
              <div className="flex flex-col gap-4">
                {SERVICES.map((svc) => (
                  <ServiceRow key={svc.id} svc={svc} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/* ==================== Row ==================== */

function ServiceRow({ svc }: { svc: Service }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusDot(svc.status)}`} />
          <div className="font-semibold text-brand-cream">{svc.name}</div>
        </div>
        <div className="text-xs text-brand-cream/70">
          {svc.uptime90d.toFixed(3)}% uptime
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-28 shrink-0 text-[11px] text-brand-cream/60">
          90 days ago
        </div>
        <HeartbeatBar samples={svc.history} />
        <div className="w-16 shrink-0 text-right text-[11px] text-brand-cream/60">
          Today
        </div>
      </div>
    </div>
  );
}

/* ==================== Heartbeat Bar ==================== */
/* Single tall row of thin vertical segments, hairline gaps, tiny radius.
   Segments auto-size to fill the width exactly (responsive). */

function HeartbeatBar({ samples }: { samples: DaySample[] }) {
  const [hover, setHover] = React.useState<{
    x: number;
    y: number;
    sample: DaySample | null;
  }>({ x: 0, y: 0, sample: null });

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [segmentWidth, setSegmentWidth] = React.useState<number>(6);

  // Visual tuning
  const barHeight =35; // taller bar
  const gap = 1; // ultra tiny gaps
  const segments = samples.length; // typically 90
  const corner = 0; // tiny radius for each segment
  const trackRadius = 10; // rounded ends for the outer track

  // Fit segments exactly to width
  React.useEffect(() => {
    function recalc() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const totalGaps = gap * (segments + 1);
      const seg = Math.max(2, Math.floor((w - totalGaps) / segments));
      setSegmentWidth(seg);
    }
    recalc();
    const obs = new ResizeObserver(recalc);
    if (containerRef.current) obs.observe(containerRef.current);
    window.addEventListener('resize', recalc);
    window.addEventListener('orientationchange', recalc);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', recalc);
      window.removeEventListener('orientationchange', recalc);
    };
  }, [segments, gap]);

  return (
    <div className="relative flex-1">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: barHeight }}
        aria-label="Service uptime history"
      >
        {/* Track */}
        <div
          className="absolute inset-0 rounded-full border border-white/10 bg-black/20"
          style={{ borderRadius: trackRadius }}
        />

        {/* Segments */}
        <div
          className="absolute inset-0 flex items-stretch"
          style={{
            borderRadius: trackRadius,
            paddingLeft: gap,
            paddingRight: gap,
            gap,
          }}
          role="listbox"
        >
          {samples.map((s, idx) => {
            const color =
              s.state === 'up'
                ? 'bg-emerald-500'
                : s.state === 'down'
                ? 'bg-red-500'
                : s.state === 'partial'
                ? 'bg-amber-500'
                : 'bg-blue-500';

            // Round only outermost ends larger; inner segments keep tiny corner
            const rLeft = idx === 0 ? trackRadius : corner;
            const rRight = idx === segments - 1 ? trackRadius : corner;

            return (
              <button
                key={idx}
                className={`${color} h-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 hover:brightness-110`}
                style={{
                  width: segmentWidth,
                  borderTopLeftRadius: rLeft,
                  borderBottomLeftRadius: rLeft,
                  borderTopRightRadius: rRight,
                  borderBottomRightRadius: rRight,
                }}
                aria-label={`${prettyCubeState(s.state)} on ${formatShortDate(
                  s.date
                )}`}
                onMouseEnter={(e) =>
                  setHover({ x: e.clientX, y: e.clientY, sample: s })
                }
                onMouseMove={(e) =>
                  setHover((h) => ({ ...h, x: e.clientX, y: e.clientY }))
                }
                onMouseLeave={() => setHover({ x: 0, y: 0, sample: null })}
                onFocus={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setHover({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    sample: s,
                  });
                }}
                onBlur={() => setHover({ x: 0, y: 0, sample: null })}
              />
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hover.sample && (
        <TooltipPortal x={hover.x} y={hover.y}>
          <TooltipContent sample={hover.sample} />
        </TooltipPortal>
      )}
    </div>
  );
}

/* ==================== Tooltip ==================== */

function TooltipPortal({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  const [pos, setPos] = React.useState({ left: x, top: y });
  React.useEffect(() => {
    const pad = 12;
    const width = 240;
    const height = 110;
    const nx = Math.min(
      Math.max(pad, x - width / 2),
      window.innerWidth - width - pad
    );
    const ny = Math.min(y + 16, window.innerHeight - height - pad);
    setPos({ left: nx, top: ny });
  }, [x, y]);

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: pos.left, top: pos.top }}
    >
      {children}
    </div>
  );
}

function TooltipContent({ sample }: { sample: DaySample }) {
  const title =
    sample.state === 'up'
      ? 'Uptime'
      : sample.state === 'down'
      ? 'Downtime'
      : sample.state === 'partial'
      ? 'Partial outage'
      : 'Maintenance';

  const color =
    sample.state === 'up'
      ? 'text-emerald-300'
      : sample.state === 'down'
      ? 'text-red-300'
      : sample.state === 'partial'
      ? 'text-amber-300'
      : 'text-blue-300';

  return (
    <div className="min-w-[220px] rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-xl">
      <div className={`mb-1 text-sm font-semibold ${color}`}>{title}</div>
      <div className="text-xs text-brand-cream/80">
        {formatLongDate(sample.date)}
      </div>
      {(sample.state === 'down' ||
        sample.state === 'maintenance' ||
        sample.state === 'partial') &&
        sample.minutes != null && (
          <div className="mt-2 text-xs text-brand-cream/90">
            {formatDuration(sample.minutes)}
          </div>
        )}
    </div>
  );
}

/* ==================== Helpers ==================== */

function deriveOverall(services: Service[], notices: Notice[]) {
  const hasMaint = notices.some((n) => n.kind === 'maintenance');
  const hasMajor =
    services.some((s) => s.status === 'major_outage') ||
    notices.some((n) => n.kind === 'incident' && n.impact === 'critical');
  const hasPartial =
    services.some((s) => s.status === 'partial_outage') ||
    notices.some((n) => n.kind === 'incident' && n.impact === 'major');
  const hasDegraded = services.some((s) => s.status === 'degraded');

  if (hasMajor)
    return {
      title: 'Major outage',
      subtitle: 'We are actively working to restore service.',
      bg: 'bg-red-500/10',
      border: 'border-red-400/30',
      icon: <AlertTriangle className="h-6 w-6 text-red-300 mt-1" />,
      badge: 'major outage',
      dot: 'bg-red-400',
    };
  if (hasMaint)
    return {
      title: 'Scheduled maintenance',
      subtitle: 'Some services may be intermittently unavailable.',
      bg: 'bg-blue-500/10',
      border: 'border-blue-400/30',
      icon: <Wrench className="h-6 w-6 text-blue-300 mt-1" />,
      badge: 'maintenance',
      dot: 'bg-blue-400',
    };
  if (hasPartial)
    return {
      title: 'Partial outage',
      subtitle: 'A subset of services is affected.',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-400/30',
      icon: <AlertTriangle className="h-6 w-6 text-yellow-300 mt-1" />,
      badge: 'partial outage',
      dot: 'bg-yellow-400',
    };
  if (hasDegraded)
    return {
      title: 'Degraded performance',
      subtitle: 'We are investigating performance issues.',
      bg: 'bg-amber-500/10',
      border: 'border-amber-400/30',
      icon: <AlertTriangle className="h-6 w-6 text-amber-300 mt-1" />,
      badge: 'degraded',
      dot: 'bg-amber-400',
    };
  return {
    title: 'All services are online',
    subtitle: 'No incidents reported.',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-300 mt-1" />,
    badge: 'operational',
    dot: 'bg-emerald-400',
  };
}

function statusDot(s: ComponentStatus) {
  switch (s) {
    case 'operational':
      return 'bg-emerald-400';
    case 'degraded':
      return 'bg-amber-400';
    case 'partial_outage':
      return 'bg-yellow-400';
    case 'major_outage':
      return 'bg-red-400';
    case 'maintenance':
      return 'bg-blue-400';
    default:
      return 'bg-white/40';
  }
}

function prettyCubeState(s: CubeState) {
  switch (s) {
    case 'up':
      return 'Up';
    case 'down':
      return 'Down';
    case 'partial':
      return 'Partial outage';
    case 'maintenance':
      return 'Maintenance';
  }
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h && m)
    return `Down for ${h} hour${h > 1 ? 's' : ''} and ${m} minute${
      m !== 1 ? 's' : ''
    }`;
  if (h) return `Down for ${h} hour${h > 1 ? 's' : ''}`;
  return `Down for ${m} minute${m !== 1 ? 's' : ''}`;
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
function formatLongDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
function formatUpdated(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/* Build 90 days of samples. Offsets: 0 oldest .. 89 today */
function mkService(
  id: string,
  name: string,
  status: ComponentStatus,
  uptime90d: number,
  opts: { downDays: number[]; partialDays: number[]; maintDays: number[] }
): Service {
  const history: DaySample[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (89 - i));
    let state: CubeState = 'up';
    let minutes: number | undefined;

    if (opts.downDays.includes(i)) {
      state = 'down';
      minutes = 60 * (1 + Math.floor(Math.random() * 4)); // 1–4h
    } else if (opts.partialDays.includes(i)) {
      state = 'partial';
      minutes = 30 + Math.floor(Math.random() * 60); // 30–90m
    } else if (opts.maintDays.includes(i)) {
      state = 'maintenance';
      minutes = 60 * (1 + Math.floor(Math.random() * 3)); // 1–3h
    }

    history.push({ date: d.toISOString(), state, minutes });
  }
  return { id, name, status, uptime90d, history };
}
