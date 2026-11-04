// The picture for wrong guesses. Instead of the traditional gallows, a child
// rides a basket held up by balloons: every wrong letter lets one balloon float
// away and the basket sinks a little. With no balloons left the basket lands
// softly on the hill; a found word lifts it up. Original SVG, drawn in code.
import { MAX_LIVES } from '../game/hangman';

// muted colours on purpose ("not too flashy")
const COLORS = ['#c98b7d', '#8fae8b', '#d1b36a', '#7f9bb8', '#b98fae', '#c7a07a'];
// balloon centres relative to the basket centre
const SPOTS: [number, number][] = [
  [-62, -112],
  [-30, -142],
  [6, -152],
  [40, -136],
  [68, -104],
  [2, -110],
];

export function BalloonScene({ lives, state }: { lives: number; state: 'playing' | 'won' | 'lost' }) {
  const dy = state === 'won' ? -14 : state === 'lost' ? 85 : (MAX_LIVES - lives) * 14;
  const mouth = state === 'lost' ? 'M-4 3 h8' : 'M-5 2 q5 5 10 0';
  return (
    <svg className={`scene ${state}`} viewBox="0 0 400 380" role="img" aria-label={`${lives}/${MAX_LIVES}`} data-testid="scene" data-lives={lives} data-picture="balloon">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2834" />
          <stop offset="1" stopColor="#2a3d48" />
        </linearGradient>
      </defs>
      <rect width="400" height="380" rx="22" fill="url(#skyG)" />
      {[
        [40, 40],
        [120, 70],
        [330, 46],
        [360, 120],
        [70, 150],
        [250, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill="#e3d6b8" opacity={0.45} />
      ))}
      <path d="M0 330 Q90 290 200 318 T400 300 V380 H0Z" fill="#3c5146" />
      <path d="M0 352 Q120 324 230 346 T400 340 V380 H0Z" fill="#33463c" />
      <g className="rig" style={{ transform: `translateY(${dy}px)` }}>
        <g transform="translate(200 200)">
          {SPOTS.map(([x, y], i) => {
            const gone = i >= lives;
            return (
              <g key={i} className={`balloon${gone ? ' gone' : ''}`} data-testid={gone ? 'balloon-gone' : 'balloon'}>
                <path d={`M${x} ${y + 28} Q${x * 0.8} ${(y + 24) / 2} ${x > 0 ? 27 : -27} -4`} fill="none" stroke="#c9bfa8" strokeWidth="1.3" opacity="0.8" />
                <ellipse cx={x} cy={y} rx="23" ry="28" fill={COLORS[i]} />
                <ellipse cx={x - 8} cy={y - 10} rx="5" ry="8" fill="#fff" opacity="0.18" />
                <path d={`M${x - 4} ${y + 31} L${x + 4} ${y + 31} L${x} ${y + 26}Z`} fill={COLORS[i]} />
              </g>
            );
          })}
          {/* child */}
          <g className="kid">
            {state === 'won' ? (
              <path d="M-9 -10 L-20 -34 M9 -10 L20 -34" stroke="#e8c9a4" strokeWidth="5" strokeLinecap="round" />
            ) : (
              <path d="M-9 -8 L-18 0 M9 -8 L18 0" stroke="#e8c9a4" strokeWidth="5" strokeLinecap="round" />
            )}
            <rect x="-11" y="-18" width="22" height="22" rx="8" fill="#5f7f9a" />
            <circle cx="0" cy="-30" r="12" fill="#e8c9a4" />
            <path d="M-12 -32 Q-10 -46 2 -44 Q12 -43 12 -32 Q6 -38 -2 -37 Q-8 -36 -12 -32Z" fill="#4a3426" />
            <circle cx="-4" cy="-30" r="1.6" fill="#2b2b2b" />
            <circle cx="4" cy="-30" r="1.6" fill="#2b2b2b" />
            <path d={mouth} transform="translate(0 -25)" stroke="#7a4b3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
          {/* basket */}
          <path d="M-30 -4 H30 L24 30 Q0 36 -24 30Z" fill="#8a6440" />
          <path d="M-30 -4 H30" stroke="#a98058" strokeWidth="5" strokeLinecap="round" />
          {[-16, 0, 16].map((x) => (
            <path key={x} d={`M${x} 0 L${x * 0.85} 31`} stroke="#6d4d30" strokeWidth="1.4" />
          ))}
          <path d="M-27 12 H27 M-25 22 H25" stroke="#6d4d30" strokeWidth="1.4" />
        </g>
      </g>
    </svg>
  );
}
