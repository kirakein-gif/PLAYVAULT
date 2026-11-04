// Simple stroke icons (original), sized by font-size.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const S = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden {...P}>
    {d}
  </svg>
);
export const Icon = {
  gear: S(<><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>),
  home: S(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>),
  back: S(<path d="M15 5l-7 7 7 7" />),
  undo: S(<><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>),
  flip: S(<><path d="M7 4v16" /><path d="M4 7l3-3 3 3" /><path d="M17 20V4" /><path d="M14 17l3 3 3-3" /></>),
  plus: S(<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  more: S(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
  bulb: S(<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" /></>),
  restart: S(<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>),
  next: S(<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>),
  prev: S(<><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>),
  first: S(<><path d="M6 5v14" /><path d="M18 6l-7 6 7 6" /></>),
  last: S(<><path d="M18 5v14" /><path d="M6 6l7 6-7 6" /></>),
  play: S(<path d="M7 4l13 8-13 8z" />),
  stop: S(<rect x="6" y="6" width="12" height="12" rx="1" />),
  heart: S(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />),
  flag: S(<><path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" /></>),
  handshake: S(<><path d="M2 12l4-4 4 2 4-2 4 2 4 4" /><path d="M6 12l4 4 2-1 2 1 4-4" /></>),
  save: S(<><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8" /><path d="M8 21v-7h8v7" /></>),
  folder: S(<path d="M3 6h6l2 2h10v11H3z" />),
  user: S(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  book: S(<><path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-4a2 2 0 0 0-2 2" /><path d="M20 4v15h-6" /></>),
  chart: S(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>),
  check: S(<path d="M4 12l5 5L20 6" />),
  info: S(<><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><path d="M12 7.5v.5" /></>),
};

export function Star({ on, size = '1em' }: { on: boolean; size?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={on ? 'star on' : 'star'} aria-hidden>
      <defs>
        <linearGradient id="starGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dd9b" />
          <stop offset="0.5" stopColor="#d4ab5c" />
          <stop offset="1" stopColor="#9a7434" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.9l-5.8 3.2 1.4-6.4-4.9-4.4 6.5-.7z"
        fill={on ? 'url(#starGold)' : 'rgba(255,255,255,0.06)'}
        stroke={on ? '#7a5a26' : 'rgba(174,185,192,0.55)'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({ n, size }: { n: number; size?: string }) {
  return (
    <span className="stars" aria-label={`${n}/3`}>
      {[1, 2, 3].map((i) => (
        <Star key={i} on={i <= n} size={size} />
      ))}
    </span>
  );
}
