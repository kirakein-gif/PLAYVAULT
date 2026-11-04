import { describe, expect, it } from 'vitest';
import {
  MAX_LIVES,
  canLetterHint,
  guess,
  letterHint,
  levelOf,
  livesLeft,
  masked,
  newRound,
  normalizeCustomWord,
  pickWord,
  seeded,
  showMeaning,
  starsFor,
  status,
  wordPool,
  wrongLetters,
  type Round,
} from '../../src/game/hangman';
import { WORDS } from '../../src/game/words';

const play = (r: Round, letters: string) => [...letters].reduce((acc, l) => guess(acc, l).round, r);

describe('rules', () => {
  it('a new round hides every letter and has full balloons', () => {
    const r = newRound('Apple');
    expect(r.word).toBe('apple');
    expect(masked(r)).toEqual([null, null, null, null, null]);
    expect(livesLeft(r)).toBe(MAX_LIVES);
    expect(status(r)).toBe('playing');
  });

  it('a hit reveals every copy of the letter and keeps the balloons', () => {
    const { round, result } = guess(newRound('apple'), 'p');
    expect(result).toBe('hit');
    expect(masked(round)).toEqual([null, 'p', 'p', null, null]);
    expect(livesLeft(round)).toBe(MAX_LIVES);
  });

  it('a miss costs one balloon; repeats and non-letters cost nothing', () => {
    let r = guess(newRound('cat'), 'z').round;
    expect(livesLeft(r)).toBe(MAX_LIVES - 1);
    const rep = guess(r, 'Z');
    expect(rep.result).toBe('repeat');
    expect(livesLeft(rep.round)).toBe(MAX_LIVES - 1);
    for (const bad of ['1', 'ab', '', '가', ' ']) expect(guess(r, bad).result).toBe('invalid');
    r = guess(r, 'C').round; // upper case is accepted
    expect(masked(r)[0]).toBe('c');
  });

  it('wins when all letters are found, loses after six misses', () => {
    expect(status(play(newRound('cat'), 'tac'))).toBe('won');
    const lost = play(newRound('cat'), 'bdefgh');
    expect(wrongLetters(lost)).toHaveLength(6);
    expect(status(lost)).toBe('lost');
    expect(livesLeft(lost)).toBe(0);
    expect(guess(lost, 'c').result).toBe('over');
    expect(guess(play(newRound('cat'), 'cat'), 'z').result).toBe('over');
  });

  it('five misses still leaves the round playable', () => {
    const r = play(newRound('cat'), 'bdefg');
    expect(status(r)).toBe('playing');
    expect(livesLeft(r)).toBe(1);
  });

  it('a letter hint reveals a hidden letter and costs one balloon', () => {
    const r = letterHint(newRound('banana'), () => 0);
    expect(r.letterHints).toBe(1);
    expect(livesLeft(r)).toBe(MAX_LIVES - 1);
    expect(masked(r).filter(Boolean).length).toBeGreaterThan(0);
    expect(wrongLetters(r)).toHaveLength(0);
  });

  it('no letter hint with one balloon or one hidden letter left', () => {
    expect(canLetterHint(play(newRound('cat'), 'bdefg'))).toBe(false); // 1 balloon
    expect(canLetterHint(play(newRound('cat'), 'ca'))).toBe(false); // only t hidden
    const same = play(newRound('cat'), 'bdefg');
    expect(letterHint(same)).toBe(same);
  });

  it('stars: 3 with 4+ balloons, 2 with 2+, else 1; hints cap at 2; loss is 0', () => {
    expect(starsFor(play(newRound('cat'), 'cat'))).toBe(3);
    expect(starsFor(play(newRound('cat'), 'bdcat'))).toBe(3);
    expect(starsFor(play(newRound('cat'), 'bdecat'))).toBe(2);
    expect(starsFor(play(newRound('cat'), 'bdefcat'))).toBe(2);
    expect(starsFor(play(newRound('cat'), 'bdefgcat'))).toBe(1);
    expect(starsFor(play(showMeaning(newRound('cat')), 'cat'))).toBe(2);
    expect(starsFor(play(newRound('cat'), 'bdefgh'))).toBe(0);
  });

  it('level comes from length', () => {
    expect(['ox', 'cat', 'bear'].map(levelOf)).toEqual(['easy', 'easy', 'easy']);
    expect(['apple', 'banana'].map(levelOf)).toEqual(['normal', 'normal']);
    expect(['giraffe', 'watermelon'].map(levelOf)).toEqual(['hard', 'hard']);
  });

  it('custom words: 2-14 English letters only', () => {
    expect(normalizeCustomWord(' Dragon ')).toBe('dragon');
    for (const bad of ['a', 'abcdefghijklmno', 'ice cream', 'café', '사과', 'r2d2', '']) expect(normalizeCustomWord(bad)).toBeNull();
    expect(normalizeCustomWord('ab')).toBe('ab');
    expect(normalizeCustomWord('abcdefghijklmn')).toBe('abcdefghijklmn');
  });
});

describe('word choice', () => {
  it('pool filters by level, category and an explicit list', () => {
    const easyAnimals = wordPool({ level: 'easy', category: 'animals' });
    expect(easyAnimals.length).toBeGreaterThan(5);
    expect(easyAnimals.every((w) => w.cat === 'animals' && w.w.length <= 4)).toBe(true);
    expect(wordPool({ level: 'all', category: 'all' })).toHaveLength(WORDS.length);
    expect(wordPool({ level: 'all', category: 'all', only: ['cat', 'zebra', 'nope'] }).map((w) => w.w).sort()).toEqual(['cat', 'zebra']);
  });

  it('pickWord avoids recent words while it can and falls back when it cannot', () => {
    const pool = wordPool({ level: 'all', category: 'all', only: ['cat', 'dog', 'pig'] });
    const rng = seeded(7);
    for (let i = 0; i < 50; i++) expect(pickWord(pool, ['cat', 'dog'], rng)?.w).toBe('pig');
    expect(pickWord(pool, ['cat', 'dog', 'pig'], rng)).not.toBeNull();
    expect(pickWord([], [], rng)).toBeNull();
  });

  it('seeded generator is repeatable and in [0, 1)', () => {
    const a = seeded(42), b = seeded(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});
