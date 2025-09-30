import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import React from 'react';
import { Slider } from '@/components/ui/slider';
import AppLogoIcon from '@/components/app-logo-icon';

type Bill = 'monthly' | 'yearly';

export default function StoreV2() {
    const [bill, setBill] = React.useState<Bill>('monthly');

    return (
        <>
            <Head title="Game Server Hosting">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            {/* Page base uses your default bg; only hero has gradient */}
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255, 245, 235)] dark:bg-background">
                {/* Floating navbar space */}
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                {/* HERO */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6 mb-8">
                    <GradientBackdrop />
                    <div className="relative z-10 text-white">
                        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                            Start your own
                            <span className="block text-[#5eb14a]">Minecraft</span>
                            server
                        </h1>

                        <p className="mt-4 max-w-2xl text-white/80">
                            Create, survive, and automate—from vanilla survival to massive
                            modpacks, minigames, and redstone engineering. Get your server
                            running in minutes with reliable hosting and straightforward
                            management.
                        </p>

                        {/* <div className="mt-6 flex flex-wrap gap-2">
                            <Button className="bg-green-600 text-white hover:bg-green-700">
                                Learn More
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Starting at just Kč75/month
                            </Button>
                        </div> */}
                    </div>
                </section>

                {/* SPEED / VALUE + PERFORMANCE BARS */}
                <section id="specs" className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pb-24 md:grid-cols-2">
                    <div className="p-6">
                        <h2 className="text-6xl font-semibold text-white">
                            Unmatched Speed,<br /> <span className="text-[#5eb14a]">Incredible Value.</span>
                        </h2>
                        <p className="mt-4 text-white/80 text-lg">
                            Our AMD Ryzen 5950X powered servers crush the competition,
                            delivering next‑gen performance at just 30Kč per gigabyte. Enjoy
                            instant spin‑ups, rock‑solid uptime, and low‑latency connections
                            for a seamless gaming experience.
                        </p>

                        {/* <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                            <FeaturePill icon={<Cpu className="h-4 w-4" />} label="Ryzen™ 7 5700" />
                            <FeaturePill icon={<HardDrive className="h-4 w-4" />} label="NVMe Storage" />
                            <FeaturePill icon={<Shield className="h-4 w-4" />} label="Advanced DDoS" />
                        </div> */}
                        <div className="mt-2 flex items-center gap-4 px-3 py-2">
                            <div className="flex flex-col justify-center text-left">
                                <span className="font-bold text-white text-sm leading-tight">Proudly</span>
                                <span className="text-white text-sm leading-tight">Powered by</span>
                            </div>
                            <img src="/AMD_Ryzen_logo.svg" alt="AMD Ryzen" className="h-15 w-auto" />
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="mb-3 font-medium text-white/90">Benchmark highlights</h3>
                        <div className="space-y-[-10px]">
                            <PerformanceBar brand="Quark" pricePerGb="Kč25/GB" chip="AMD Ryzen™ 7 5700" color="bg-[#EE8132]" value={0.98} icon={<AppLogoIcon />} />
                            <PerformanceBar brand="Apex Hosting" pricePerGb="Kč105/GB" chip="AMD Ryzen 5800X" color="bg-[#F6E05E]" value={0.55} icon={<BrandSquare>L</BrandSquare>} />
                            <PerformanceBar brand="Bisect Hosting" pricePerGb="Kč105/GB" chip="Intel Xeon E5-2643" color="bg-[#FBBF24]" value={0.32} icon={<BrandSquare>B</BrandSquare>} />
                            <PerformanceBar brand="GGServers" pricePerGb="Kč126/GB" chip="Unknown Ryzen" color="bg-[#A0AEC0]" value={0.18} icon={<BrandSquare>G</BrandSquare>} />
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS STRIP */}
                <section className="relative mx-auto w-full pb-24">
                    <h2 className="mb-4 text-2xl font-semibold text-white text-center">
                        Loved by gamers worldwide
                    </h2>
                    <p className="mb-4 text-white/80 text-center" >
                        Join thousands of satisfied customers who trust our game server hosting
                        needs. See what our community has to say.
                    </p>
                    <ReviewRail />
                </section>

                {/* PLANS SECTION */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pb-16">
                    <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
                        <h2 className="text-2xl font-semibold text-white">
                            Simple, transparent pricing.
                        </h2>
                        <BillingToggle bill={bill} onChange={setBill} />
                    </div>

                    <PlansGrid bill={bill} />

                    {/* Custom plan */}
                    <div className="mt-8">
                        <CustomPlanRow bill={bill} />
                    </div>
                </section>

                {/* FAQ */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pb-20">
                    <h2 className="mb-6 text-2xl font-semibold text-white">
                        Minecraft Server Hosting FAQ
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {faqData.map((f) => (
                            <FaqRow key={f.q} q={f.q} a={f.a} />
                        ))}
                    </div>
                </section>

                {/* Footer note */}
                <footer className="mx-auto w-full max-w-7xl px-4 pb-10 text-xs text-white/50">
                    Prices and specs are indicative. Final performance varies by node and
                    workload. Features may change without notice.
                </footer>
            </div>
        </>
    );
}

/* UI Pieces */

function GradientBackdrop() {
    return (
        // <img
        //     alt=""
        //     aria-hidden="true"
        //     draggable="false"
        //     decoding="async"
        //     data-nimg="fill"
        //     className="object-cover"
        //     style={{
        //         position: 'absolute',
        //         height: '300%',
        //         width: '300%',
        //         inset: 0,
        //         color: 'transparent',
        //         filter: 'blur(80px) brightness(0.3) contrast(1.2)',
        //         opacity: 0.8,
        //     }}
        //     sizes="100vw"
        //     srcSet="/minecraft-banner.png"
        //     src="/minecraft-banner.png"
        // />
        <div className="pointer-events-none absolute inset-0 top-0 left-0 -z-10 h-full w-full overflow-hidden select-none">
            <div className="absolute inset-0">
                <img
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    decoding="async"
                    data-nimg="fill"
                    className="object-cover"
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        inset: 0,
                        color: 'transparent',
                        filter: 'grayscale(100%) blur(40px) brightness(0.3) contrast(1.2)',
                        opacity: 0.8,
                    }}
                    sizes="100vw"
                    srcSet="/minecraft-banner.png"
                    src="/minecraft-banner.png"
                />
            </div>
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: 'rgb(94, 177, 74)',
                    opacity: 0.25,
                    mixBlendMode: 'multiply',
                }}
            ></div>
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: 'rgb(94, 177, 74)',
                    opacity: 0.08,
                    mixBlendMode: 'screen',
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
        </div>
    );
}

function Card({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${className}`}>
            {children}
        </div>
    );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-green-300">{icon}</span>
            <span className="text-sm text-white">{label}</span>
        </div>
    );
}

function PerformanceBar({
    brand,
    chip,
    color, // e.g. 'bg-green-500'
    pricePerGb,
    value = 0.8, // 0..1 bar fill
    icon,
}: {
    brand: string;
    chip: string;
    color: string;
    pricePerGb: string;
    value?: number;
    icon?: React.ReactNode;
}) {
    const width = `${Math.max(0, Math.min(1, value)) * 100}%`;

    return (
        <div className="p-4 text-white">
            {/* Top row: left icon+brand, center chip badge */}
            <div className="mb-2 grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
                <div className="flex items-center gap-3">
                    <div className="flex h-15 w-15 items-center justify-center">
                        {icon ?? <span className="text-xl">🔥</span>}
                    </div>
                    <div className="leading-tight">
                        <div className="font-semibold">{brand}</div>
                        <div className="text-xs text-white/70">{pricePerGb}</div>
                    </div>
                </div>

                <div className="flex items-center justify-start sm:justify-end w-full">
                    <span className="inline-flex flex-col gap-1 px-3 py-1 text-md font-bold w-70">
                        <span className="flex items-center gap-2">
                            <span aria-hidden className="text-yellow-300">✨</span>
                            <span className="opacity-90">{chip}</span>
                        </span>
                        {/* Meter below chip name, fixed width */}
                        <div className="h-[8px] w-full rounded-full bg-white/12">
                            <div
                                className={`h-[8px] rounded-full ${color}`}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </span>
                </div>
                <div className="hidden sm:block" />
            </div>
        </div>
    );
}

function BrandSquare({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-5 w-5 items-center justify-center rounded bg-white/12 text-[10px]">
            {children}
        </div>
    );
}

function ReviewRail() {
    const top = makeReviews(8, 'top');
    const bottom = makeReviews(8, 'bottom');

    return (
        <div className="space-y-4">
            <MarqueeRow direction="left" items={top} />
            <MarqueeRow direction="right" items={bottom} />
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-white/70">
                <span className="text-green-400">●</span>
                Real testimonials from our
                <a
                    href="#"
                    className="text-green-300 underline-offset-4 hover:underline"
                >
                    Discord community
                </a>
            </div>
        </div>
    );
}

type Review = {
    id: string;
    handle: string;
    avatar: string;
    text: string;
    rating: number;
};

function makeReviews(n: number, seed: string): Review[] {
    const samples = [
        'Support solved my modpack crash in under an hour. Legends.',
        'Super snappy and great uptime. Moved from another host and never looked back.',
        'Quick setup, clear panel, zero headaches. Exactly what I needed.',
        'Backups saved me after a bad plugin—restored in minutes.',
        'Best bang for buck. Good latency from Prague!',
        'Performance is solid even with lots of plugins.',
        'Very helpful staff and fast response.',
        'Seamless updates and great docs.',
    ];
    const handles = [
        '@Linkfoush',
        '@Lumi',
        '@LunarcatOwO',
        '@AngelDan',
        '@DorreIRedmond',
        '@max',
        '@DreiFxn',
        '@prettySkye',
    ];
    return Array.from({ length: n }).map((_, i) => ({
        id: `${seed}-${i}`,
        handle: handles[i % handles.length],
        avatar: ['🟣', '🟠', '🟡', '🟢', '🔵', '🟤', '🟧', '🟦'][i % 8],
        text: samples[i % samples.length],
        rating: 5,
    }));
}

function MarqueeRow({
    direction,
    items,
}: {
    direction: 'left' | 'right';
    items: Review[];
}) {
    // Duplicate array for seamless loop
    const content = [...items, ...items];

    return (
        <div className="relative overflow-hidden">
            {/* The row pauses on hover via CSS (see .marquee-track:hover below) */}
            <div
                className={`marquee-track flex min-w-max gap-3 ${direction === 'left' ? 'marquee-left' : 'marquee-right'
                    }`}
            >
                {content.map((r, idx) => (
                    <TestimonialCard key={`${r.id}-${idx}`} review={r} />
                ))}
            </div>
        </div>
    );
}

function TestimonialCard({ review }: { review: Review }) {
    return (
        <div className="w-[360px] rounded-xl border border-white/10 bg-white/6 p-4 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-sm">
                        {review.avatar}
                    </div>
                    <div className="text-sm text-white/90">{review.handle}</div>
                </div>
                <div className="flex items-center gap-0.5 text-yellow-300">
                    {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} aria-hidden>
                            ★
                        </span>
                    ))}
                </div>
            </div>
            <div className="text-sm text-white/80">
                <span className="pr-1 text-white/40">“</span>
                {review.text}
                <span className="pl-1 text-white/40">”</span>
            </div>
        </div>
    );
}

function BillingToggle({
    bill,
    onChange,
}: {
    bill: Bill;
    onChange: (b: Bill) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            <button
                onClick={() => onChange('monthly')}
                className={`rounded-full px-3 py-1 text-sm text-white ${bill === 'monthly' ? 'bg-green-600' : 'hover:bg-white/10'
                    }`}
            >
                Monthly
            </button>
            <button
                onClick={() => onChange('yearly')}
                className={`rounded-full px-3 py-1 text-sm text-white ${bill === 'yearly' ? 'bg-green-600' : 'hover:bg-white/10'
                    }`}
            >
                Yearly
            </button>
        </div>
    );
}

/* ---------------- Plans (screenshot style) ---------------- */

type Plan = {
    id: string;
    tier: 'Core' | 'Boost' | 'Power' | 'Extreme';
    priceCZK: number;
    popular?: boolean;
    cpu: string;
    vcores: string;
    ram: string;
    storage: string;
    backups: string;
    ports: string;
    ctaHref: string;
};

const planData: Plan[] = [
    {
        id: 'core',
        tier: 'Core',
        priceCZK: 100,
        cpu: 'AMD Ryzen™ 7 5700',
        vcores: '4 vCores @ ~4.2 GHz',
        ram: '4GB DDR4 RAM',
        storage: 'Unlimited NVMe Storage',
        backups: '5 Free Backups',
        ports: '12 Port Allocations',
        ctaHref: '#',
    },
    {
        id: 'boost',
        tier: 'Boost',
        priceCZK: 150,
        cpu: 'AMD Ryzen™ 7 5700',
        vcores: '4 vCores @ ~4.2 GHz',
        ram: '6GB DDR4 RAM',
        storage: 'Unlimited NVMe Storage',
        backups: '5 Free Backups',
        ports: '12 Port Allocations',
        ctaHref: '#',
    },
    {
        id: 'power',
        tier: 'Power',
        popular: true,
        priceCZK: 200,
        cpu: 'AMD Ryzen™ 7 5700',
        vcores: '4 vCores @ ~4.2 GHz',
        ram: '8GB DDR4 RAM',
        storage: 'Unlimited NVMe Storage',
        backups: '8 Free Backups',
        ports: '12 Port Allocations',
        ctaHref: '#',
    },
    {
        id: 'extreme',
        tier: 'Extreme',
        priceCZK: 250,
        cpu: 'AMD Ryzen™ 7 5700',
        vcores: '4 vCores @ ~4.2 GHz',
        ram: '10GB DDR4 RAM',
        storage: 'Unlimited NVMe Storage',
        backups: '8 Backups',
        ports: '12 Port Allocations',
        ctaHref: '#',
    },
];

function PlansGrid({ bill }: { bill: Bill }) {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {planData.map((p) => (
                <PlanCard key={p.id} plan={p} yearly={bill === 'yearly'} />
            ))}
        </div>
    );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
    const price = yearly ? Math.round(plan.priceCZK * 0.85) : plan.priceCZK;

    // Select icon based on tier
    let iconSrc = '/core.svg';
    if (plan.tier === 'Boost') iconSrc = '/boost.svg';
    else if (plan.tier === 'Power') iconSrc = '/power.svg';
    else if (plan.tier === 'Extreme') iconSrc = '/extreme.svg';

    return (
        <div
            className="bg-gradient-to-b from-[#201c18]/37 to-background relative rounded-2xl border border-black/15 bg- p-5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:border-white/10"
            style={{ outline: '1px solid #201c18 ' }}
        >
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white shadow">
                    Most Popular
                </div>
            )}

            {/* Header with icon and name */}
            <div className="mb-3 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-green-900/30 text-green-400">
                    <img src={iconSrc} className="h-8 w-auto white" />
                </div>
                <div className="text-lg font-semibold">{plan.tier}</div>
            </div>

            {/* Price */}
            <div className="mb-1 text-3xl font-bold">
                Kč{price}
                <span className="ml-1 align-middle text-sm font-normal text-white/80">
                    /month
                </span>
            </div>

            {/* Save hint */}
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-white/80">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-900/40 text-green-400">
                    <IconInfo className="h-3.5 w-3.5" />
                </span>
                Save with annual billing
            </div>

            <hr className="my-3 border-white/10" />

            {/* Features */}
            <ul className="space-y-3 text-sm font-medium">
                <FeatureRow icon={<IconAMD className="h-5 w-5 text-green-400" />} text={plan.cpu} strong />
                <FeatureRow icon={<IconVCore className="h-5 w-5 text-green-400" />} text={plan.vcores} />
                <FeatureRow icon={<IconMemory className="h-5 w-5 text-green-400" />} text={plan.ram} />
                <FeatureRow icon={<IconStorage className="h-5 w-5 text-green-400" />} text={plan.storage} linklike />
                <FeatureRow icon={<IconBackup className="h-5 w-5 text-green-400" />} text={plan.backups} />
                <FeatureRow icon={<IconPorts className="h-5 w-5 text-green-400" />} text={plan.ports} />
            </ul>

            <hr className="my-4 border-white/10" />

            <Button className="w-full text-white h-10 ">
                Configure Server
            </Button>
        </div>
    );
}

function FeatureRow({
    icon,
    text,
    strong,
    linklike,
}: {
    icon: React.ReactNode;
    text: string;
    strong?: boolean;
    linklike?: boolean;
}) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-0.5 text-green-400">{icon}</span>
            <span
                className={`${strong ? 'font-extrabold' : ''} ${linklike ? 'underline decoration-dotted underline-offset-4' : ''
                    }`}
            >
                {text}
            </span>
        </li>
    );
}

/* ---------------- Custom Plan Row with RAM Slider ---------------- */

function CustomPlanRow({ bill }: { bill: Bill }) {
    const yearly = bill === 'yearly';
    const [ram, setRam] = React.useState(14); // default as in screenshot

    // Simple pricing model to demonstrate live updates
    const base = 0; // Kč
    const perGB = 25; // Kč per GB
    let price = base + ram * perGB;
    if (yearly) price = Math.round(price * 0.85);

    return (
        <div className="rounded-2xl border border-black/15 bg-[#110F0D] p-4 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] dark:border-white/10">
            <div className="mb-3 inline-flex items-center gap-2">
                <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-semibold">
                    Custom
                </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
                {/* Left icon + title */}
                <div className="md:col-span-2 flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-900/30 text-green-400">
                        <IconBoltCircle className="h-5 w-5" />
                    </div>
                    <div className="text-lg font-semibold">Custom</div>
                </div>

                {/* Spec columns */}
                <div className="md:col-span-3 space-y-2 text-sm">
                    <FeatureRow icon={<IconAMD className="h-5 w-5 text-green-400" />} text="AMD Ryzen™ 7 5700" strong />
                    <FeatureRow icon={<IconMemory className="h-5 w-5 text-green-400" />} text={`${ram}GB DDR4 RAM`} />
                    <FeatureRow icon={<IconBackup className="h-5 w-5 text-green-400" />} text="8 Free Backups" />
                </div>

                <div className="md:col-span-3 space-y-2 text-sm">
                    <FeatureRow icon={<IconVCore className="h-5 w-5 text-green-400" />} text="8 vCores @ ~4.2 GHz" />
                    <FeatureRow icon={<IconStorage className="h-5 w-5 text-green-400" />} text="Unlimited NVMe Storage" linklike />
                    <FeatureRow icon={<IconPorts className="h-5 w-5 text-green-400" />} text="12 Port Allocations" />
                </div>

                {/* Price */}
                <div className="md:col-span-2 flex flex-col items-end justify-center gap-1">
                    <div className="text-3xl font-bold">
                        Kč{price}
                        <span className="ml-1 align-middle text-sm font-normal text-white/80">
                            /month
                        </span>
                    </div>
                    <div className="text-xs text-white/70">Save with annual billing</div>
                </div>

                <div className="md:col-span-2 flex items-center justify-end">
                    <Button className="w-full text-white">
                        Configure Server
                    </Button>
                </div>
            </div>

            {/* Slider */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-6">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm text-white/80">RAM</div>
                        <div className="text-sm font-semibold">{ram}GB</div>
                    </div>
                    <Slider
                        value={[ram]}
                        min={3}
                        max={32}
                        step={1}
                        onValueChange={(v) => setRam(v[0] ?? ram)}
                    />
                    <div className="mt-1 flex justify-between text-xs text-white/60">
                        <span>3GB</span>
                        <span>32GB</span>
                    </div>
                </div>

                <div className="md:col-span-12">
                    <div className="mt-3 rounded-lg border border-green-800 bg-green-900/40 px-4 py-3 text-sm text-green-200">
                        This plan should work well for Minecraft
                        <div className="text-xs text-green-300/80">
                            You can always adjust the RAM later if needed.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Small icon set to match the card rows */

function IconBoltCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M11 6l-2 5h3l-1 5 4-7h-3l2-3h-3z" fill="currentColor" />
        </svg>
    );
}
function IconInfo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11v6M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function IconAMD(props: React.SVGProps<SVGSVGElement>) {
    // Placeholder AMD-like mark. Replace with your official SVG if available.
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="#none" className="bi bi-amd" viewBox="0 0 256 256" id="Amd--Streamline-Bootstrap" height="256" width="256" {...props}>
            <path fill='currentColor' d="m5.344 0 69.728 69.744h114.4v114.4l69.728 69.728V0zM3.2 155.52l71.792 -71.808v100.496h100.48L103.68 256H3.2z" stroke-width="16"></path>
        </svg>
    );
}
function IconVCore(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M4 12h6l2-3 2 6 2-3h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function IconMemory(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 7v10M17 7v10M3 10h18" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
function IconStorage(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect x="3" y="4" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="7" cy="7" r="1" fill="currentColor" />
            <circle cx="7" cy="17" r="1" fill="currentColor" />
        </svg>
    );
}
function IconBackup(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M12 3v4m0 10v4M4 12h4m8 0h4M6 6l2 2m8 8 2 2m0-12-2 2M8 16l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
function IconPorts(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect x="4" y="5" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="4" y="13" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 8h2M11 8h2M15 8h2M7 16h2M11 16h2M15 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

/* FAQ */

const faqData = [
    {
        q: 'What performance can I expect?',
        a: 'We use high‑clock AMD Ryzen 5950X nodes with NVMe. Expect low latency and fast chunk generation for vanilla and most modpacks.',
    },
    {
        q: 'Do you support dedicated IPs?',
        a: 'Yes, dedicated IPs are available as an add‑on in most locations.',
    },
    {
        q: 'Can I invite people to co-manage my server?',
        a: 'Absolutely. Add sub‑users with role‑based permissions from your panel.',
    },
    {
        q: 'Can I switch games at any time?',
        a: 'Yes, our panel lets you switch supported games or reinstall within minutes.',
    },
    {
        q: 'Is there any player limit?',
        a: 'Player counts depend on your chosen plan resources and plugins/mods.',
    },
    {
        q: 'How do backups work?',
        a: 'Automated daily backups on all plans, with manual on‑demand backups.',
    },
];

function FaqRow({ q, a }: { q: string; a: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-1 font-medium text-white">{q}</div>
            <div className="text-sm text-white/80">{a}</div>
        </div>
    );
}
