// Pure game rules (no DOM, no React, no clock) so they can be unit tested.
import { WORDS, type CategoryId, type Word } from './words';

/** Balloons on the basket = wrong guesses allowed. */
export const MAX_LIVES = 6;
export const MIN_CUSTOM = 2;
export const MAX_CUSTOM = 14;
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export type Level = 'easy' | 'normal' | 'hard';
export const LEVELS: Level[] = ['easy', 'normal', 'hard'];

/** Difficulty is decided by length only: easy 2-4, normal 5-6, hard 7+ letters. */
export function levelOf(word: string): Level {
  if (word.length <= 4) return 'easy';
  if (word.length <= 6) return 'normal';
  return 'hard';
}

export interface Round {
  word: string; // lowercase a-z
  guessed: string[]; // every letter tried, in order
  letterHints: number; // revealed letters (each costs one balloon)
  meaningShown: boolean;
}

export type GuessResult = 'hit' | 'miss' | 'repeat' | 'invalid' | 'over';
export type Status = 'playing' | 'won' | 'lost';

export function newRound(word: string): Round {
  return { word: word.toLowerCase(), guessed: [], letterHints: 0, meaningShown: false };
}

export const wrongLetters = (r: Round) => r.guessed.filter((l) => !r.word.includes(l));
export const livesLeft = (r: Round) => Math.max(0, MAX_LIVES - wrongLetters(r).length - r.letterHints);
export const isRevealed = (r: Round, letter: string) => r.guessed.includes(letter);

export function status(r: Round): Status {
  if ([...r.word].every((l) => r.guessed.includes(l))) return 'won';
  if (livesLeft(r) <= 0) return 'lost';
  return 'playing';
}

/** Letters shown on the board; null = still hidden. */
export function masked(r: Round): (string | null)[] {
  return [...r.word].map((l) => (r.guessed.includes(l) ? l : null));
}

export function guess(r: Round, raw: string): { round: Round; result: GuessResult } {
  const letter = raw.toLowerCase();
  if (status(r) !== 'playing') return { round: r, result: 'over' };
  if (!/^[a-z]$/.test(letter)) return { round: r, result: 'invalid' };
  if (r.guessed.includes(letter)) return { round: r, result: 'repeat' };
  const round = { ...r, guessed: [...r.guessed, letter] };
  return { round, result: r.word.includes(letter) ? 'hit' : 'miss' };
}

/** A letter hint is allowed while at least 2 balloons and 2 hidden letters remain. */
export function canLetterHint(r: Round): boolean {
  const hidden = new Set([...r.word].filter((l) => !r.guessed.includes(l)));
  return status(r) === 'playing' && livesLeft(r) >= 2 && hidden.size >= 2;
}

/** Reveals one hidden letter (rng picks which) and pops one balloon. */
export function letterHint(r: Round, rng: () => number = Math.random): Round {
  if (!canLetterHint(r)) return r;
  const hidden = [...new Set([...r.word].filter((l) => !r.guessed.includes(l)))];
  const pick = hidden[Math.min(hidden.length - 1, Math.floor(rng() * hidden.length))];
  return { ...r, guessed: [...r.guessed, pick], letterHints: r.letterHints + 1 };
}

export const showMeaning = (r: Round): Round => ({ ...r, meaningShown: true });

/** Stars for a won round: lives left 4+ = 3, 2+ = 2, else 1; any hint caps at 2. Lost = 0. */
export function starsFor(r: Round): 0 | 1 | 2 | 3 {
  if (status(r) !== 'won') return 0;
  const left = livesLeft(r);
  let s: 1 | 2 | 3 = left >= 4 ? 3 : left >= 2 ? 2 : 1;
  if ((r.meaningShown || r.letterHints > 0) && s > 2) s = 2;
  return s;
}

/** Turns what a parent typed into a playable word, or null if it is not one. */
export function normalizeCustomWord(s: string): string | null {
  const w = s.trim().toLowerCase();
  if (!/^[a-z]+$/.test(w)) return null;
  if (w.length < MIN_CUSTOM || w.length > MAX_CUSTOM) return null;
  return w;
}

export interface PoolFilter {
  level: Level | 'all';
  category: CategoryId | 'all';
  only?: string[]; // e.g. missed words from the word book
}

export function wordPool(f: PoolFilter, words: Word[] = WORDS): Word[] {
  const only = f.only ? new Set(f.only) : null;
  return words.filter(
    (w) => (!only || only.has(w.w)) && (f.level === 'all' || levelOf(w.w) === f.level) && (f.category === 'all' || w.cat === f.category),
  );
}

/** Picks a word, avoiding the recently played ones while the pool allows it. */
export function pickWord(pool: Word[], recent: string[], rng: () => number = Math.random): Word | null {
  if (!pool.length) return null;
  const recentSet = new Set(recent);
  const fresh = pool.filter((w) => !recentSet.has(w.w));
  const from = fresh.length ? fresh : pool;
  return from[Math.min(from.length - 1, Math.floor(rng() * from.length))];
}

/** Small seeded generator (mulberry32) for tests and repeatable runs. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
