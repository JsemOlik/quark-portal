import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/navbar';

function GridBackdrop() {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        >
            <defs>
                <pattern
                    id="grid-24"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                >
                    <path
                        d="M0.5 24V0.5H24"
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity="0.10"
                    />
                </pattern>
                <g id="grid-pass">
                    <rect width="100%" height="100%" fill="url(#grid-24)" />
                </g>
            </defs>
            <use href="#grid-pass" opacity="0.10" />
            <g transform="scale(-1 1) translate(-100%,0)">
                <use href="#grid-pass" opacity="0.10" />
            </g>
        </svg>
    );
}

function SectionLine() {
    return (
        <div
            aria-hidden
            className="pointer-events-none h-px w-full [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
            style={{ backgroundColor: '#ee8132' }}
        />
    );
}

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={
                'rounded-2xl border border-white/10 bg-white/5 ' + className
            }
        >
            {children}
        </div>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-brand-cream/80">
            {children}
        </span>
    );
}

function ChevronRow({
    left,
    right,
}: {
    left: string;
    right: string;
}) {
    return (
        <div className="hover:bg-black/10 flex items-start justify-between gap-3 border border-white/10 bg-black/20 px-3 py-10">
            <div className="text-sm font-medium text-brand-cream">{left}</div>
            <div className="flex items-center gap-2 text-xs text-brand-cream/70">
                <span className="max-w-[38ch] text-right leading-snug">{right}</span>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-brand-cream/60">
                    →
                </span>
            </div>
        </div>
    );
}

function AvatarCircle({ src, alt }: { src: string; alt: string }) {
    return (
        <img
            src={src}
            alt={alt}
            className="h-10 w-10 rounded-full border border-white/10 object-cover"
        />
    );
}

export default function AboutUs() {
    return (
        <>
            <Head title="About • Quark">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#0f0e0d] text-[rgb(255,245,235)]">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                {/* Hero block */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pt-6">
                    <GridBackdrop />

                    <Card className="relative z-10 p-6">
                        <div className="mb-4 text-xs text-brand-cream/70">About</div>
                        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                            The world is better
                            <br /> when we’re connected.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm text-brand-cream/80">
                            It starts with the tech we use and the people we work with. At
                            Quark, our mission is to power connections that matter by building
                            solid infrastructure and tools that bring players together.
                        </p>

                        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                            {/* Little animated/illustration placeholder */}
                            <div className="grid h-40 place-items-center text-brand-cream/70">
                                <span className="text-sm"> animation areQuark logoa</span>
                            </div>
                        </div>
                    </Card>

                    <div className="mt-12 text-4xl text-brand-cream/80">
                        Our Team consists of 3 talented developers located in the Czech Republic,<br /> with over 500,000 lines of code already written.
                    </div>
                </section>

                {/* Values */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pt-10">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold text-brand-cream">
                            Learn Our Values
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm text-brand-cream/80">
                            More than corporate jargon, these are the guiding principles that
                            define our culture and our decisions. We embody them in our work
                            and interactions with our customers.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-0 md:grid-cols-2 border-1 border-brand-cream/20 rounded-xl">
                            <ChevronRow
                                left="Courage"
                                right="We’re unafraid to take risks and challenge the status quo."
                            />
                            <ChevronRow
                                left="Curiosity"
                                right="We’re lifelong learners, always exploring and improving."
                            />
                            <ChevronRow
                                left="Resilience"
                                right="We persist even when the path forward isn’t clear."
                            />
                            <ChevronRow
                                left="Empathy"
                                right="We build with compassion for players and creators."
                            />
                            <ChevronRow
                                left="Integrity"
                                right="We’re honest and transparent in how we operate."
                            />
                            <ChevronRow
                                left="Innovation"
                                right="We move fast, iterate, and ship the right things."
                            />
                        </div>
                    </Card>
                </section>

                {/* Team */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pt-10">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold text-brand-cream">
                            Meet Our Team
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm text-brand-cream/80">
                            We’re a small team doing big work. From infrastructure to support,
                            we collaborate tightly to deliver a great experience.
                        </p>

                        <div className="mt-5 grid grid-cols-8 gap-3 rounded-xl border border-white/10 bg-black/10 p-4 md:grid-cols-12">
                            {/* Replace with your real avatars */}
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="grid place-items-center">
                                    <AvatarCircle src={`/images/avatars/a${(i % 8) + 1}.png`} alt={`Member ${i + 1}`} />
                                </div>
                            ))}
                        </div>

                        <div className="mt-5">
                            <a
                                href="/careers"
                                className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-brand-brown transition-transform duration-200 hover:scale-105"
                            >
                                We’re Hiring <span>→</span>
                            </a>
                        </div>
                    </Card>
                </section>

                {/* Products and Infra (mini card set) */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pt-10">
                    <h3 className="mb-4 text-sm text-brand-cream/70">
                        We answer only to our Customers, and we build our products in public.
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Products column */}
                        <div className="space-y-4">
                            <Card className="p-4">
                                <div className="text-sm font-semibold text-brand">Modrinth Servers</div>
                                <p className="text-xs text-brand-cream/80">
                                    Fast, beautiful, open-source. Built entirely from scratch by Quark.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="text-sm font-semibold text-brand">Quark Supercluster</div>
                                <p className="text-xs text-brand-cream/80">
                                    Nix-based orchestration powering all Quark server deployments.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="text-sm font-semibold text-brand">Prometheus Bot</div>
                                <p className="text-xs text-brand-cream/80">
                                    Rust-based Discord bot with multi-functionality for running events and management.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="text-sm font-semibold text-brand">Quarkdactyl</div>
                                <p className="text-xs text-brand-cream/80">
                                    Our tailored Pterodactyl panel fork—faster, simpler, more reliable.
                                </p>
                            </Card>
                        </div>

                        {/* Infra column (small “Infra” card set) */}
                        <div className="space-y-4">
                            <Card className="p-4">
                                <div className="mb-1 text-sm font-semibold text-brand">Infra • CPUs</div>
                                <div className="text-brand-cream">AMD Ryzen™ 7 5700</div>
                                <p className="mt-1 text-xs text-brand-cream/80">
                                    High clocks for game workloads and tick stability.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="mb-1 text-sm font-semibold text-brand">Infra • Storage</div>
                                <div className="text-brand-cream">NVMe SSD</div>
                                <p className="mt-1 text-xs text-brand-cream/80">
                                    Blazing I/O with careful wear-leveling and backups.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="mb-1 text-sm font-semibold text-brand">Infra • Network</div>
                                <div className="text-brand-cream">1 Gbps uplinks</div>
                                <p className="mt-1 text-xs text-brand-cream/80">
                                    Low-latency routes and anti‑DDoS hardening.
                                </p>
                            </Card>
                            <Card className="p-4">
                                <div className="mb-1 text-sm font-semibold text-brand">Infra • Panel</div>
                                <div className="text-brand-cream">Pterodactyl (Quarkdactyl)</div>
                                <p className="mt-1 text-xs text-brand-cream/80">
                                    Streamlined management with presets and sensible defaults.
                                </p>
                            </Card>
                        </div>
                    </div>

                    <div className="my-10">
                        <SectionLine />
                    </div>
                </section>

                {/* Closing line */}
                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12">
                    <p className="text-center text-brand-cream/80">
                        We’re sick of an industry where the status quo holds everyone back.
                        <br />
                        <span className="text-brand">Quark is the only way forward.</span>
                    </p>
                </section>

                {/* Footer note */}
                <footer className="mx-auto w-full max-w-7xl px-4 pb-10 text-xs text-brand-cream/50">
                    Quark © {new Date().getFullYear()}. Specs and features may change as we
                    improve the platform.
                </footer>
            </div>
        </>
    );
}
