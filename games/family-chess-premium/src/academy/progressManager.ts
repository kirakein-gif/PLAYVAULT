// Per-puzzle achievement records. The best result is never lowered; the most
// recent attempt is kept separately.
import type { AttemptResult, PuzzleRecord, Stars } from '../storage/schema';

export function emptyRecord(): PuzzleRecord {
  return {
    attempts: 0,
    solved: false,
    best: 0,
    firstSolvedAt: null,
    lastAttemptAt: null,
    recentMistakes: 0,
    hintUsed: false,
    lastResult: null,
    history: [],
  };
}

export interface AttemptOutcome {
  solved: boolean; // false = gave up / revealed the answer
  mistakes: number;
  hintsUsed: number; // highest hint level opened (0..3)
}

/** ★★★ first try without hints · ★★ solved after a wrong move · ★ solved with hints */
export function starsFor(o: AttemptOutcome): Stars {
  if (!o.solved) return 0;
  if (o.hintsUsed > 0) return 1;
  if (o.mistakes > 0) return 2;
  return 3;
}

export function recordAttempt(prev: PuzzleRecord | undefined, o: AttemptOutcome, now = new Date()): PuzzleRecord {
  const r = prev ? { ...prev, history: [...prev.history] } : emptyRecord();
  const stars = starsFor(o);
  const result: AttemptResult = stars === 3 ? 'stars3' : stars === 2 ? 'stars2' : stars === 1 ? 'stars1' : 'failed';
  const iso = now.toISOString();
  r.attempts += 1;
  r.lastAttemptAt = iso;
  r.recentMistakes = o.mistakes;
  r.hintUsed = o.hintsUsed > 0;
  r.lastResult = result;
  r.history.push(result);
  if (r.history.length > 12) r.history.splice(0, r.history.length - 12);
  if (o.solved) {
    if (!r.solved) r.firstSolvedAt = iso;
    r.solved = true;
    if (stars > r.best) r.best = stars;
  }
  return r;
}

export type PuzzleStatus = 'untried' | 'unsolved' | 'solved';
export function statusOf(r: PuzzleRecord | undefined): PuzzleStatus {
  if (!r || r.attempts === 0) return 'untried';
  return r.solved ? 'solved' : 'unsolved';
}

export type PuzzleFilter = 'all' | 'untried' | 'unsolved' | 'solved' | 'below3' | 'favorites';

export function matchesFilter(f: PuzzleFilter, r: PuzzleRecord | undefined, favorite: boolean): boolean {
  switch (f) {
    case 'all':
      return true;
    case 'untried':
      return statusOf(r) === 'untried';
    case 'unsolved':
      return statusOf(r) === 'unsolved';
    case 'solved':
      return statusOf(r) === 'solved';
    case 'below3':
      return (r?.best ?? 0) < 3;
    case 'favorites':
      return favorite;
  }
}
