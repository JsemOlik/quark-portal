// resources/js/Pages/storage/components/ConsolePreview.tsx
import React from 'react';

export default function ConsolePreview() {
  return (
    <section className="relative mx-auto w-full border-t border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1612]/45 to-[#0f0e0c] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Storage Console</div>
            <div className="text-xs text-brand-cream/70">Demo snapshot</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-medium">Endpoint</div>
              <div className="mt-1 rounded-md border border-white/10 bg-black/40 p-2 text-xs">
                s3.example.com
              </div>
              <div className="mt-3 text-sm font-medium">Bucket</div>
              <div className="mt-1 rounded-md border border-white/10 bg-black/40 p-2 text-xs">
                world-backups
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-medium">Access</div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-white/10 bg-black/40 p-2 text-xs">
                  AKIA... (panel)
                </div>
                <div className="rounded-md border border-white/10 bg-black/40 p-2 text-xs">
                  ****** (panel)
                </div>
              </div>
              <div className="mt-3 text-xs text-brand-cream/70">
                Policies: readonly, backup-writer
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-medium">Quick CLI</div>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border border-white/10 bg-black/40 p-2 text-xs text-brand-cream/90">
                rclone copy ./world s3:world-backups/world --s3-endpoint s3.example.com
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
