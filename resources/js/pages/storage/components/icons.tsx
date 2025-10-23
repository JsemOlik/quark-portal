// resources/js/Pages/storage/components/icons.tsx
import React from 'react';

export const IconDot = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 6 6" {...props}><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
);

export const IconCloudArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 17a5 5 0 1 1 2-9.6A6 6 0 0 1 19 9a4 4 0 0 1 0 8H7Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 8v8m0 0l-3-3m3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconShield = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconGauge = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 12 17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconKey = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="8" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10.5 11.5l7 7M17.5 14.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
