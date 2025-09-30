import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import PerformanceBar from './Performance/PerformanceBar';
import BrandSquare from './Performance/BrandSquare';

export default function Specs() {
  return (
    <section
      id="specs"
      className="text-brand-cream relative mx-auto w-full px-4 py-16"
    >
      {/* Brand-colored top/bottom 1px fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
        style={{ backgroundColor: '#ee8132' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
        style={{ backgroundColor: '#ee8132' }}
      />

      {/* Full-width aligned SVG line grid */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{
          maskImage:
            'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 35%, #000 200%)',
        }}
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
              strokeOpacity="0.15"
            />
          </pattern>
          <g id="grid-pass">
            <rect width="100%" height="100%" fill="url(#grid-24)" />
          </g>
        </defs>
        <use href="#grid-pass" opacity="0.18" />
        <g transform="scale(-1 1) translate(-100%,0)">
          <use href="#grid-pass" opacity="0.10" />
        </g>
      </svg>

      {/* subtle brand glow in top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 35% 0px, #ee813226 0%, transparent 50%)',
        }}
      />

      {/* Inner constrained container with the grid columns */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* left column */}
        <div className="p-6">
          <h2 className="text-6xl font-semibold ">
            Unmatched Speed,
            <br />
            <span className="text-brand">Incredible Value.</span>
          </h2>
          <p className="mt-4 text-lg /80">
            Our AMD Ryzen 5950X powered servers crush the competition, delivering
            next‑gen performance at just 30Kč per gigabyte. Enjoy instant spin‑ups,
            rock‑solid uptime, and low‑latency connections for a seamless gaming
            experience.
          </p>
          <div className="mt-2 flex items-center gap-4 px-3 py-2">
            <div className="flex flex-col justify-center text-left">
              <span className="text-sm font-bold leading-tight ">Proudly</span>
              <span className="text-sm leading-tight ">Powered by</span>
            </div>
            <img
              src="/AMD_Ryzen_logo.svg"
              alt="AMD Ryzen"
              className="h-15 w-auto"
            />
          </div>
        </div>

        {/* right column */}
        <div className="p-6">
          <div className="space-y-[-10px]">
            <PerformanceBar
              brand="Pyro"
              pricePerGb="Kč63/GB"
              chip="AMD Ryzen™ 9 9950X"
              color="bg-[#EE8132]"
              value={0.98}
              icon={<AppLogoIcon />}
            />
            <PerformanceBar
              brand="Apex Hosting"
              pricePerGb="Kč104/GB"
              chip="AMD Ryzen 5800X"
              color="bg-[#F6E05E]"
              value={0.55}
              icon={<BrandSquare>A</BrandSquare>}
            />
            <PerformanceBar
              brand="Bisect Hosting"
              pricePerGb="Kč104/GB"
              chip="Intel Xeon E5-2643"
              color="bg-[#F87171]"
              value={0.32}
              icon={<BrandSquare>B</BrandSquare>}
            />
            <PerformanceBar
              brand="GGServers"
              pricePerGb="Kč125/GB"
              chip="Unknown Ryzen"
              color="bg-[#A0AEC0]"
              value={0.18}
              icon={<BrandSquare>G</BrandSquare>}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
