import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

type P = SVGProps<SVGSVGElement>;

export const IconPetal = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c4 3.2 6 6.2 6 9a6 6 0 0 1-12 0c0-2.8 2-5.8 6-9Z" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="4" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c.6 4.2 2.2 5.9 6 6.5-3.8.6-5.4 2.3-6 6.5-.6-4.2-2.2-5.9-6-6.5 3.8-.6 5.4-2.3 6-6.5Z" />
    <path d="M18 16.5c.3 1.7 1 2.4 2.5 2.7-1.5.3-2.2 1-2.5 2.7-.3-1.7-1-2.4-2.5-2.7 1.5-.3 2.2-1 2.5-2.7Z" />
  </svg>
);

export const IconBook = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" />
  </svg>
);

export const IconHeart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.3-7-9.2A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7 2.4c0 4.9-7 9.2-7 9.2Z" />
  </svg>
);

export const IconGear = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconDrop = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5c3.2 3.6 5 6.2 5 8.6a5 5 0 0 1-10 0c0-2.4 1.8-5 5-8.6Z" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
);
