// The traditional hangman picture, chosen in Settings → Picture. Simple chalk
// lines on the same night sky as the balloon scene: the gallows is there from
// the start and each wrong guess adds one part (head, body, arms, legs).
// A found word removes the rope and the figure stands on the hill, waving.
// Original SVG, drawn in code.
import { MAX_LIVES } from '../game/hangman';

const CHALK = '#e8dcc0';
const WOOD = '#a98058';

export function ClassicScene({ lives, state }: { lives: number; state: 'playing' | 'won' | 'lost' }) {
  const misses = MAX_LIVES - lives;
  const line = { stroke: CHALK, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <svg className={`scene classic ${state}`} viewBox="0 0 400 380" role="img" aria-label={`${lives}/${MAX_LIVES}`} data-testid="scene" data-lives={lives} data-picture="classic">
      <defs>
        <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2834" />
          <stop offset="1" stopColor="#2a3d48" />
        </linearGradient>
      </defs>
      <rect width="400" height="380" rx="22" fill="url(#skyC)" />
      <path d="M0 330 Q90 290 200 318 T400 300 V380 H0Z" fill="#3c5146" />
      <path d="M0 352 Q120 324 230 346 T400 340 V380 H0Z" fill="#33463c" />
      {/* gallows */}
      <g stroke={WOOD} strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M70 322 H190" />
        <path d="M110 322 V60" />
        <path d="M106 64 H250" />
        <path d="M110 110 L156 64" strokeWidth="6" />
      </g>
      {state === 'won' ? (
        // freed: the whole figure stands on the hill and waves
        <g {...line} data-testid="freed">
          <circle cx="310" cy="196" r="20" />
          <path d="M303 198 q7 7 14 0" strokeWidth="3" />
          <path d="M310 216 V262 M310 230 L286 206 M310 230 L336 206 M310 262 L292 296 M310 262 L328 296" />
        </g>
      ) : (
        <g>
          <path d="M246 64 V100" stroke={CHALK} strokeWidth="3" strokeLinecap="round" data-testid="rope" />
          <g {...line}>
            {misses >= 1 && <circle cx="246" cy="122" r="22" data-testid="part" />}
            {misses >= 2 && <path d="M246 144 V214" data-testid="part" />}
            {misses >= 3 && <path d="M246 162 L218 192" data-testid="part" />}
            {misses >= 4 && <path d="M246 162 L274 192" data-testid="part" />}
            {misses >= 5 && <path d="M246 214 L224 258" data-testid="part" />}
            {misses >= 6 && <path d="M246 214 L268 258" data-testid="part" />}
            {misses >= 1 && state === 'lost' && <path d="M238 128 h16" strokeWidth="3" />}
          </g>
        </g>
      )}
    </svg>
  );
}
