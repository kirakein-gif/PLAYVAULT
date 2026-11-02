// AI strength configuration. Edit this table to retune levels; nothing else needs
// to change. Strength differs through Stockfish's own "Skill Level" (which makes
// the engine pick weaker moves on purpose) combined with a search depth limit,
// not only through longer thinking time.
//
// No Elo is shown in the app because these settings were not rated against
// humans. If the engine build lacks "Skill Level", UCI_LimitStrength/UCI_Elo is
// used instead (fallbackElo) — again only as an internal knob.

export interface LevelConfig {
  level: 1 | 2 | 3 | 4 | 5;
  key: 'easy' | 'normal' | 'challenging' | 'hard' | 'master';
  skill: number; // Stockfish "Skill Level" 0..20
  depth: number; // go depth limit
  movetimeMs: number; // hard cap per move
  minThinkMs: number; // shortest visible "thinking" so replies do not feel instant
  fallbackElo: number; // only if "Skill Level" is unavailable (min 1320 in SF 19)
}

export const LEVELS: LevelConfig[] = [
  { level: 1, key: 'easy', skill: 0, depth: 2, movetimeMs: 300, minThinkMs: 650, fallbackElo: 1320 },
  { level: 2, key: 'normal', skill: 4, depth: 5, movetimeMs: 500, minThinkMs: 650, fallbackElo: 1500 },
  { level: 3, key: 'challenging', skill: 9, depth: 8, movetimeMs: 800, minThinkMs: 650, fallbackElo: 1800 },
  { level: 4, key: 'hard', skill: 15, depth: 12, movetimeMs: 1300, minThinkMs: 600, fallbackElo: 2200 },
  { level: 5, key: 'master', skill: 20, depth: 22, movetimeMs: 2200, minThinkMs: 500, fallbackElo: 3190 },
];

/** Low-power mode keeps the level's character but caps work for slow tablets. */
export function levelConfig(level: number, lowPower = false): LevelConfig {
  const base = LEVELS.find((l) => l.level === level) ?? LEVELS[1];
  if (!lowPower) return base;
  return { ...base, depth: Math.min(base.depth, 14), movetimeMs: Math.min(base.movetimeMs, 1000) };
}

/** Fixed review analysis settings (same for every move so verdicts are comparable). */
export const REVIEW = {
  depth: 12,
  lowPowerDepth: 10,
  movetimeCapMs: 2500,
  /** below this reached depth a verdict is phrased as uncertain */
  minTrustedDepth: 9,
};
