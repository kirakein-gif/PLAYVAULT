import { describe, expect, it } from 'vitest';
import { CATEGORIES, WORDS } from '../../src/game/words';
import { LEVELS, levelOf } from '../../src/game/hangman';

describe('built-in word list', () => {
  it('has at least 1500 words (up to middle-school level)', () => expect(WORDS.length).toBeGreaterThanOrEqual(1500));

  it('every word is lowercase a-z, 2-12 letters, with a Korean meaning', () => {
    for (const w of WORDS) {
      expect(w.w, w.w).toMatch(/^[a-z]{2,12}$/);
      expect(w.ko, w.w).toMatch(/[가-힣]/);
      expect(w.ko, w.w).not.toMatch(/\s/);
    }
  });

  it('no word appears twice', () => {
    const seen = new Set<string>();
    const dup = WORDS.filter((w) => (seen.has(w.w) ? true : (seen.add(w.w), false))).map((w) => w.w);
    expect(dup).toEqual([]);
  });

  it('every category has 25+ words and at least one word of each level', () => {
    for (const c of CATEGORIES) {
      const ws = WORDS.filter((w) => w.cat === c.id);
      expect(ws.length, c.id).toBeGreaterThanOrEqual(25);
      for (const l of LEVELS) expect(ws.some((w) => levelOf(w.w) === l), `${c.id} ${l}`).toBe(true);
    }
  });

  it('each level has plenty of words', () => {
    for (const l of LEVELS) expect(WORDS.filter((w) => levelOf(w.w) === l).length, l).toBeGreaterThanOrEqual(70);
  });
});
