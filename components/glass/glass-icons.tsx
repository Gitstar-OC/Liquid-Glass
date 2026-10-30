import type { SVGProps } from "react";

/** Original glyphs drawn on one 24px grid. Not Apple SF Symbols. */
export type GlassIconName =
  | "arrow"
  | "diagonal"
  | "down"
  | "heart"
  | "plus"
  | "check"
  | "close"
  | "undo"
  | "sun"
  | "moon"
  | "power"
  | "restart"
  | "play"
  | "pause"
  | "previous"
  | "next"
  | "speaker"
  | "quiet"
  | "muted"
  | "airdrop"
  | "person"
  | "people"
  | "search"
  | "folder"
  | "message"
  | "drawer"
  | "book"
  | "components"
  | "sliders"
  | "music"
  | "wave"
  | "more"
  | "bookmark"
  | "bell"
  | "copy"
  | "edit"
  | "share"
  | "hubs"
  | "spokes"
  | "reserves"
  | "assets"
  | "chains"
  | "rewind15"
  | "forward15";
export function GlassIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: GlassIconName }) {
  const paths = {
    hubs: (
      <>
        <path
          fill="currentColor"
          stroke="none"
          opacity=".5"
          d="m8 3 6 3.5v7L8 17l-6-3.5v-7Z"
        />
        <path
          fill="currentColor"
          stroke="none"
          d="m16 7 6 3.5v7L16 21l-6-3.5v-7Z"
        />
      </>
    ),
    spokes: (
      <>
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="8" strokeWidth="4" strokeDasharray="7 4" />
      </>
    ),
    reserves: (
      <>
        <circle
          cx="8.5"
          cy="8.5"
          r="6.5"
          fill="currentColor"
          stroke="none"
          opacity=".5"
        />
        <circle cx="15.5" cy="15.5" r="6.5" fill="currentColor" stroke="none" />
      </>
    ),
    assets: (
      <>
        <ellipse
          cx="12"
          cy="5"
          rx="8"
          ry="3"
          fill="currentColor"
          stroke="none"
        />
        <path d="M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0M4 7v12c0 4 16 4 16 0V7" />
      </>
    ),
    chains: (
      <>
        <path d="m6 5 12 7-12 7Z" opacity=".5" />
        <circle cx="6" cy="5" r="3" fill="currentColor" stroke="none" />
        <circle cx="18" cy="12" r="3" fill="currentColor" stroke="none" />
        <circle cx="6" cy="19" r="3" fill="currentColor" stroke="none" />
      </>
    ),
    rewind15: (
      <>
        <path d="M4 8a9 9 0 1 1-1 8M4 3v5h5" />
        <text
          x="12"
          y="15"
          fontSize="8"
          fontWeight="600"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
        >
          15
        </text>
      </>
    ),
    forward15: (
      <>
        <path d="M20 8a9 9 0 1 0 1 8m-1-13v5h-5" />
        <text
          x="12"
          y="15"
          fontSize="8"
          fontWeight="600"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
        >
          15
        </text>
      </>
    ),
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    edit: (
      <>
        <path d="m15 4 5 5M4 15 15.5 3.5a2.1 2.1 0 0 1 3 0l2 2a2.1 2.1 0 0 1 0 3L9 20l-6 1Z" />
      </>
    ),
    share: <path d="M12 16V3m-4 4 4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />,
    diagonal: <path d="M6 18 18 6M6 6h12v12" />,
    down: <path d="M12 4v16m-5-5 5 5 5-5" />,
    heart: (
      <path d="M12 20S3.5 15.1 3.5 8.9a4.4 4.4 0 0 1 8.5-1.6 4.4 4.4 0 0 1 8.5 1.6C20.5 15.1 12 20 12 20Z" />
    ),
    plus: <path d="M12 4v16M4 12h16" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    undo: (
      <>
        <path d="M8 5 3 10l5 5M3 10h11a6 6 0 0 1 0 12" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: (
      <path d="M20.5 14.2A8.8 8.8 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z" />
    ),
    power: <path d="M12 2v10M6.4 5.4a9 9 0 1 0 11.2 0" />,
    restart: (
      <>
        <path d="M4 9a8.3 8.3 0 1 1-.3 5M4 3v6h6" />
      </>
    ),
    play: (
      <path
        fill="currentColor"
        stroke="none"
        d="M7 4.8c0-1 1.1-1.6 2-1l12 7.1a1.3 1.3 0 0 1 0 2.2l-12 7.1c-.9.6-2 0-2-1Z"
      />
    ),
    pause: (
      <>
        <rect
          fill="currentColor"
          stroke="none"
          x="5"
          y="4"
          width="5"
          height="16"
          rx="1.3"
        />
        <rect
          fill="currentColor"
          stroke="none"
          x="14"
          y="4"
          width="5"
          height="16"
          rx="1.3"
        />
      </>
    ),
    previous: (
      <path
        fill="currentColor"
        stroke="none"
        d="M11.4 5.4c.7-.5 1.6 0 1.6.8v4.2l7.4-5c.7-.5 1.6 0 1.6.8v11.6c0 .8-.9 1.3-1.6.8l-7.4-5v4.2c0 .8-.9 1.3-1.6.8L3 12.9a1 1 0 0 1 0-1.8Z"
      />
    ),
    next: (
      <path
        fill="currentColor"
        stroke="none"
        d="M12.6 5.4c-.7-.5-1.6 0-1.6.8v4.2l-7.4-5c-.7-.5-1.6 0-1.6.8v11.6c0 .8.9 1.3 1.6.8l7.4-5v4.2c0 .8.9 1.3 1.6.8l8.4-5.7a1 1 0 0 0 0-1.8Z"
      />
    ),
    speaker: (
      <>
        <path
          fill="currentColor"
          stroke="none"
          d="m4 9 5-4c.7-.5 1.5-.2 1.5.7v12.6c0 .9-.8 1.2-1.5.7l-5-4H1.5V9Z"
        />
        <path d="M14 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14m3-17a14 14 0 0 1 0 20" />
      </>
    ),
    quiet: (
      <>
        <path
          fill="currentColor"
          stroke="none"
          d="m8 9 5-4c.7-.5 1.5-.2 1.5.7v12.6c0 .9-.8 1.2-1.5.7l-5-4H4V9Z"
        />
      </>
    ),
    muted: (
      <>
        <path d="m8 9 5-4v14l-5-4H4V9Zm10 1 4 4m0-4-4 4" />
      </>
    ),
    airdrop: (
      <>
        <path d="M7.5 18.7a8 8 0 1 1 9 0M9 16.1a5 5 0 1 1 6 0M10.5 13.5a2 2 0 1 1 3 0" />
        <path fill="currentColor" stroke="none" d="m12 14 4 7H8Z" />
      </>
    ),
    person: (
      <>
        <circle fill="currentColor" stroke="none" cx="12" cy="7.3" r="3.4" />
        <path
          fill="currentColor"
          stroke="none"
          d="M5 20v-1.8a7 7 0 0 1 14 0V20Z"
        />
      </>
    ),
    people: (
      <>
        <circle fill="currentColor" stroke="none" cx="9" cy="8" r="3" />
        <circle fill="currentColor" stroke="none" cx="17" cy="9" r="2.5" />
        <path
          fill="currentColor"
          stroke="none"
          d="M2.5 20v-2a6.5 6.5 0 0 1 13 0v2Zm14.5 0v-2a8 8 0 0 0-1.5-4.6A5 5 0 0 1 22 18v2Z"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    folder: (
      <path d="M3 8h18v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2" />
    ),
    message: (
      <path d="M20.5 11.3c0 5.2-5.7 8.4-10.2 6.8L5 20l1-4C.6 10.7 4.8 3 12 3c4.7 0 8.5 3.7 8.5 8.3Z" />
    ),
    drawer: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 14h18M9 17h6" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" />
      </>
    ),
    components: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    sliders: (
      <>
        <path d="M6 3v4m0 6v8M18 3v10m0 6v2" />
        <rect x="3" y="7" width="6" height="6" rx="2" />
        <rect x="15" y="13" width="6" height="6" rx="2" />
      </>
    ),
    music: (
      <>
        <path d="M10 18V5l10-2v13M10 8l10-2" />
        <ellipse
          fill="currentColor"
          stroke="none"
          cx="6.5"
          cy="18"
          rx="4.5"
          ry="3"
        />
        <ellipse
          fill="currentColor"
          stroke="none"
          cx="16.5"
          cy="16"
          rx="4.5"
          ry="3"
        />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4" />
        <path d="M12 2v2" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M15 8V3H3v13h5" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none" />
      </>
    ),
    wave: <path d="M3 10v4m4-7v10m5-14v18m5-14v10m4-7v4" />,
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
