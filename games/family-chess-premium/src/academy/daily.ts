// "Today's 10-minute training": 3 tactics + 1 checkmate + 1 strategy/endgame.
// Mixes puzzles that need review (unsolved / below 3 stars) with new ones.
// Deterministic per profile and day so reopening the app shows the same set.
import type { PuzzleRecord } from '../storage/schema';
import type { Puzzle } from './types';
import { statusOf } from './progressManager';

export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>> 0) % 100000) / 100000;
  };
}

export function pickDaily(puzzles: Puzzle[], records: Record<string, PuzzleRecord>, profileId: string, date: string): string[] {
  const rand = seeded(profileId + date);
  const review = (p: Puzzle) => {
    const r = records[p.id];
    return statusOf(r) === 'unsolved' || (r?.solved && r.best < 3);
  };
  const fresh = (p: Puzzle) => statusOf(records[p.id]) === 'untried';
  const take = (pool: Puzzle[], n: number, chosen: Set<string>) => {
    const out: string[] = [];
    const reviewPool = pool.filter((p) => review(p) && !chosen.has(p.id));
    const freshPool = pool.filter((p) => fresh(p) && !chosen.has(p.id));
    const restPool = pool.filter((p) => !chosen.has(p.id));
    const pick = (arr: Puzzle[]) => {
      const c = arr.filter((p) => !chosen.has(p.id));
      if (!c.length) return false;
      const p = c[Math.floor(rand() * c.length)];
      chosen.add(p.id);
      out.push(p.id);
      return true;
    };
    for (let i = 0; i < n; i++) {
      // alternate: review first when available, then new puzzles
      const order = i % 2 === 0 ? [reviewPool, freshPool, restPool] : [freshPool, reviewPool, restPool];
      for (const arr of order) if (pick(arr)) break;
    }
    return out;
  };
  const chosen = new Set<string>();
  const tactics = puzzles.filter((p) => ['fork', 'pin', 'skewerDiscovered', 'defense'].includes(p.category) && p.difficulty !== 'hard');
  const mates = puzzles.filter((p) => p.category === 'mate');
  const endgames = puzzles.filter((p) => p.category === 'endgame');
  return [...take(tactics, 3, chosen), ...take(mates, 1, chosen), ...take(endgames, 1, chosen)];
}
