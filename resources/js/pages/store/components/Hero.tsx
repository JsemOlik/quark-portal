import React from 'react';
import GradientBackdrop from './ui/GradientBackdrop';

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
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 ">

            <GradientBackdrop />
            <div className="relative z-10 text-brand-cream">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                    Elevate your next
                    <span className="block text-brand">Game server</span>
                </h1>
                <p className="mt-4 max-w-2xl text-white/80">
                    Create, survive, and automate—from vanilla survival to massive
                    modpacks, minigames, and redstone engineering. Get your server
                    running in minutes with reliable hosting and straightforward
                    management.
                </p>
            </div>
            <img src='/images/pyrodactyl-panel.png' className='mt-24' />
        </section></>
    );
}
