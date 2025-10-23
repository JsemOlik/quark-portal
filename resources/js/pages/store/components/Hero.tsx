import GradientBackdrop from './ui/GradientBackdrop';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function Hero() {
    return (<>
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
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 mt-8 ">

            <GradientBackdrop />
            <div className="relative z-10 text-brand-cream">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                    Elevate your next
                    <span className="block text-brand">Game server</span>
                </h1>
                <p className="mt-4 max-w-2xl text-white/80">
                    Build, compete, and customize—whether it’s vanilla gameplay, heavy modding, co‑op survival, or fast‑paced competitive servers. Launch your game server in minutes with reliable hosting, low-latency performance, and straightforward management.
                </p>
                <Link href="#pricing">
                    <Button
                        size="lg"
                        className="align-middle text-md text-brand-cream mr-4 mt-8"
                    >
                        Starting at just 85Kč/month
                    </Button>
                </Link>
                <a href="/discord" target="_blank" rel="noreferrer">
                <Button
                    size="lg"
                    className="cursor-pointer align-middle bg-[#5865F2] hover:bg-[#5865F2]/80 text-md text-white mr-4 mt-8 border border-[#5865F2]/80"
                >
                    <img
                        src="/discordwhite.svg"
                        alt="Discord Logo"
                        className="mr-2 inline-block h-7 w-7 align-middle"
                    />
                    Join our Discord
                </Button>
                </a>
            </div>
            <img src='/images/pyrodactyl-panel.png' className='mt-24' />
        </section></>
    );
}
