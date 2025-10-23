// resources/js/Pages/storage/components/Specs.tsx
import React from 'react';
import BackdropGrid from './BackdropGrid';

export default function Specs() {
  return (
    <section className="relative mx-auto w-full px-4 py-16 text-brand-cream">
      <BackdropGrid opacity={0.10} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 70% -10%, #ee813226 0%, transparent 45%)',
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold">
            Built for backups, assets, and mods
            <br />
            <span className="text-brand">Zero-nonsense storage</span>
          </h2>
          <p className="mt-4 text-white/80">
            Keep your Minecraft worlds, Steam server backups, logs, and mod packs
            safely stored. S3 APIs make it easy to wire into CI/CD, panel backups,
            or your custom scripts.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• S3-compatible API endpoints</li>
            <li>• Access keys and per-bucket policies</li>
            <li>• Optional erasure coding for higher durability</li>
            <li>• rclone, s3cmd, AWS CLI, MinIO Client support</li>
            <li>• Lifecycle rules (coming soon)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#201c18]/40 to-transparent p-5">
          <div className="mb-3 text-lg font-semibold">Quick start</div>
          <div className="space-y-3 text-sm text-brand-cream/90">
            <div>
              Endpoint
              <div className="rounded-md border border-white/10 bg-black/30 p-2 text-white/90">
                s3.example.com
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                Access Key
                <div className="truncate rounded-md border border-white/10 bg-black/30 p-2 text-white/90">
                  AKIA... (panel)
                </div>
              </div>
              <div>
                Secret
                <div className="truncate rounded-md border border-white/10 bg-black/30 p-2 text-white/90">
                  ****** (panel)
                </div>
              </div>
            </div>
            <div>
              rclone example
              <pre className="whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/90">
                rclone copy ./world s3:my-bucket/world --s3-endpoint s3.example.com
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
