import React from 'react';
import { Review } from '../../types';

export default function TestimonialCard({ review }: { review: Review }) {
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
