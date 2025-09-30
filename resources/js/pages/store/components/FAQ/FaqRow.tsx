import React from 'react';

export default function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-1 font-medium text-white">{q}</div>
      <div className="text-sm text-white/80">{a}</div>
    </div>
  );
}
