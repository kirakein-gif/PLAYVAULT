// Small pure helpers for the UCI text protocol (unit-tested).
export interface UciScore { cp?: number; mate?: number }
export interface UciInfo { depth: number; multipv: number; score: UciScore; pv: string[]; bound?: 'lower' | 'upper' }
export interface UciOption { name: string; type: string; min?: number; max?: number; default?: string }

export function parseInfo(line: string): UciInfo | null {
  if (!line.startsWith('info ') || !line.includes(' pv ') || !line.includes(' score ')) return null;
  const m = line.match(/ depth (\d+)/);
  const s = line.match(/ score (cp|mate) (-?\d+)( (lowerbound|upperbound))?/);
  const pv = line.match(/ pv (.+)$/);
  if (!m || !s || !pv) return null;
  const mp = line.match(/ multipv (\d+)/);
  return {
    depth: Number(m[1]),
    multipv: mp ? Number(mp[1]) : 1,
    score: s[1] === 'cp' ? { cp: Number(s[2]) } : { mate: Number(s[2]) },
    pv: pv[1].trim().split(/\s+/),
    bound: s[4] === 'lowerbound' ? 'lower' : s[4] === 'upperbound' ? 'upper' : undefined,
  };
}

export function parseOption(line: string): UciOption | null {
  const m = line.match(/^option name (.+?) type (\w+)(?: default (\S*))?(?: min (-?\d+))?(?: max (-?\d+))?/);
  if (!m) return null;
  return { name: m[1], type: m[2], default: m[3], min: m[4] !== undefined ? Number(m[4]) : undefined, max: m[5] !== undefined ? Number(m[5]) : undefined };
}

export function parseBestmove(line: string): string | null {
  const m = line.match(/^bestmove (\S+)/);
  if (!m || m[1] === '(none)') return null;
  return m[1];
}

/** Lichess-style winning chances in [-1, 1] for the side the score belongs to. */
export function winChance(score: UciScore): number {
  // "mate 0" means the side to move is already checkmated
  if (score.mate !== undefined) return score.mate > 0 ? 1 : -1;
  const cp = Math.max(-1000, Math.min(1000, score.cp ?? 0));
  return 2 / (1 + Math.exp(-0.00368208 * cp)) - 1;
}

export function negate(score: UciScore): UciScore {
  return score.mate !== undefined ? { mate: -score.mate } : { cp: -(score.cp ?? 0) };
}
