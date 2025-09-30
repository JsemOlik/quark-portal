import React from 'react';

export function IconBoltCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M11 6l-2 5h3l-1 5 4-7h-3l2-3h-3z" fill="currentColor" />
    </svg>
  );
}

export function IconInfo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v6M12 8h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAMD(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#none"
      className="bi bi-amd"
      viewBox="0 0 256 256"
      height="256"
      width="256"
      {...props}
    >
      <path
        fill="currentColor"
        d="m5.344 0 69.728 69.744h114.4v114.4l69.728 69.728V0zM3.2 155.52l71.792 -71.808v100.496h100.48L103.68 256H3.2z"
      />
    </svg>
  );
}

export function IconVCore(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 12h6l2-3 2 6 2-3h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMemory(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M7 7v10M17 7v10M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconStorage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="4"
        width="18"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="3"
        y="14"
        width="18"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconBackup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3v4m0 10v4M4 12h4m8 0h4M6 6l2 2m8 8 2 2m0-12-2 2M8 16l-2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconPorts(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="5"
        width="16"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="4"
        y="13"
        width="16"
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 8h2M11 8h2M15 8h2M7 16h2M11 16h2M15 16h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
