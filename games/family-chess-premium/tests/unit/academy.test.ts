import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { PUZZLES } from '../../src/academy/puzzles';
import { judgeMove, startSession, advance, solverColor, playUci } from '../../src/academy/puzzleValidator';
import { recordAttempt, starsFor, matchesFilter, statusOf } from '../../src/academy/progressManager';
import { pickDaily } from '../../src/academy/daily';
import { LESSONS } from '../../src/academy/lessons';
import { stepStartFen } from '../../src/academy/lessons/fen';
import { explanation, hint1, hint2, promptKey } from '../../src/academy/puzzleText';
import { makeT } from '../../src/i18n/i18n';

describe('puzzle data (every puzzle)', () => {
  it('has the agreed minimum size and composition', () => {
    const count = (c: string) => PUZZLES.filter((p) => p.category === c).length;
    expect(PUZZLES.length).toBeGreaterThanOrEqual(100);
    expect(count('mate')).toBeGreaterThanOrEqual(30);
    expect(count('fork')).toBeGreaterThanOrEqual(15);
    expect(count('pin')).toBeGreaterThanOrEqual(10);
    expect(count('skewerDiscovered')).toBeGreaterThanOrEqual(10);
    expect(count('defense')).toBeGreaterThanOrEqual(15);
    expect(count('endgame')).toBeGreaterThanOrEqual(10);
  });
  it('ids are unique', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
  });
  for (const p of PUZZLES) {
    it(`${p.id} (${p.category}) is valid and its full solution is legal`, () => {
      const c = new Chess(p.fen); // throws on invalid FEN
      expect(p.moves.length % 2).toBe(0); // opponent set-up move + solver/opponent pairs ending on a solver move
      for (const u of p.moves) expect(() => playUci(c, u)).not.toThrow();
      if (p.mateIn) {
        expect(c.isCheckmate()).toBe(true);
        expect(p.moves.length / 2).toBe(p.mateIn);
      }
      // the solver is to move after the set-up move, opposite to the FEN side
      const s = startSession(p);
      expect(s.chess.turn()).toBe(solverColor(p));
      // alternatives must be legal in the final position
      const fin = new Chess(p.fen);
      for (const u of p.moves.slice(0, -1)) playUci(fin, u);
      for (const a of p.alternatives) expect(() => playUci(new Chess(fin.fen()), a)).not.toThrow();
      // hint squares are real squares and the key piece belongs to the solver
      expect(s.chess.get(p.hint.pieceSquare as never)?.color).toBe(solverColor(p));
      for (const f of p.hint.focus) expect(f).toMatch(/^[a-h][1-8]$/);
      // texts render in both languages without placeholders
      for (const lang of ['ko', 'en'] as const) {
        const t = makeT(lang);
        const txt = [t(`solve.prompt.${promptKey(p)}`), hint1(t, p, s.chess.fen(), p.moves[1]), hint2(t, lang, p, s.chess.fen(), p.moves[1], true), explanation(t, lang, p)];
        for (const x of txt) expect(x).not.toMatch(/\{\w+\}|solve\./);
      }
    });
  }
});

describe('answer checking', () => {
  const mates = PUZZLES.filter((p) => p.mateIn === 1);
  it('accepts the solution and rejects other legal moves', () => {
    for (const p of PUZZLES.slice(0, 40)) {
      const s = startSession(p);
      const wrong = s.chess.moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? '')).find((u) => u !== p.moves[1] && !p.alternatives.includes(u) && judgeMove(s, u) !== 'solved');
      if (wrong) expect(judgeMove(s, wrong)).toBe('wrong');
      expect(['correct', 'solved']).toContain(judgeMove(s, p.moves[1]));
    }
  });
  it('accepts ANY checkmating move in mate puzzles', () => {
    for (const p of mates) {
      const s = startSession(p);
      for (const m of s.chess.moves({ verbose: true })) {
        const c = new Chess(s.chess.fen());
        c.move(m.san);
        if (c.isCheckmate()) expect(judgeMove(s, m.from + m.to + (m.promotion ?? ''))).toBe('solved');
      }
    }
  });
  it('plays through every multi-move solution', () => {
    for (const p of PUZZLES.filter((x) => x.moves.length > 2)) {
      const s = startSession(p);
      while (s.index < p.moves.length) {
        const u = p.moves[s.index];
        const v = judgeMove(s, u);
        expect(v).not.toBe('wrong');
        if (v === 'solved') break;
        advance(s, u);
      }
    }
  });
});

describe('achievement records', () => {
  it('stars: 3 first try, 2 after a mistake, 1 with hints, 0 unsolved', () => {
    expect(starsFor({ solved: true, mistakes: 0, hintsUsed: 0 })).toBe(3);
    expect(starsFor({ solved: true, mistakes: 2, hintsUsed: 0 })).toBe(2);
    expect(starsFor({ solved: true, mistakes: 0, hintsUsed: 1 })).toBe(1);
    expect(starsFor({ solved: false, mistakes: 1, hintsUsed: 3 })).toBe(0);
  });
  it('keeps the best result while logging recent attempts (spec example)', () => {
    let r = recordAttempt(undefined, { solved: true, mistakes: 0, hintsUsed: 2 });
    expect(r.best).toBe(1);
    r = recordAttempt(r, { solved: true, mistakes: 1, hintsUsed: 0 });
    expect(r.best).toBe(2);
    r = recordAttempt(r, { solved: true, mistakes: 0, hintsUsed: 0 });
    expect(r.best).toBe(3);
    const first = r.firstSolvedAt;
    r = recordAttempt(r, { solved: false, mistakes: 3, hintsUsed: 0 });
    expect(r.best).toBe(3);
    expect(r.solved).toBe(true);
    expect(r.lastResult).toBe('failed');
    expect(r.recentMistakes).toBe(3);
    expect(r.attempts).toBe(4);
    expect(r.firstSolvedAt).toBe(first);
    expect(r.history).toEqual(['stars1', 'stars2', 'stars3', 'failed']);
  });
  it('filters', () => {
    const unsolved = recordAttempt(undefined, { solved: false, mistakes: 1, hintsUsed: 0 });
    const two = recordAttempt(undefined, { solved: true, mistakes: 1, hintsUsed: 0 });
    expect(statusOf(undefined)).toBe('untried');
    expect(statusOf(unsolved)).toBe('unsolved');
    expect(matchesFilter('unsolved', unsolved, false)).toBe(true);
    expect(matchesFilter('solved', two, false)).toBe(true);
    expect(matchesFilter('below3', two, false)).toBe(true);
    expect(matchesFilter('favorites', undefined, true)).toBe(true);
    expect(matchesFilter('untried', two, false)).toBe(false);
  });
  it('daily training: 3 tactics + 1 mate + 1 endgame, stable per day, mixes review', () => {
    const recs = { [PUZZLES.find((p) => p.category === 'fork')!.id]: recordAttempt(undefined, { solved: false, mistakes: 1, hintsUsed: 0 }) };
    const a = pickDaily(PUZZLES, recs, 'p1', '2026-11-02');
    const b = pickDaily(PUZZLES, recs, 'p1', '2026-11-02');
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
    expect(new Set(a).size).toBe(5);
    const cat = (id: string) => PUZZLES.find((p) => p.id === id)!.category;
    expect(a.slice(0, 3).every((id) => ['fork', 'pin', 'skewerDiscovered', 'defense', 'other'].includes(cat(id)))).toBe(true);
    expect(cat(a[3])).toBe('mate');
    expect(cat(a[4])).toBe('endgame');
    expect(a.slice(0, 3)).toContain(Object.keys(recs)[0]); // review puzzle included
  });
});

describe('lessons (every step)', () => {
  for (const l of LESSONS) {
    it(`${l.id}: positions, demos and tasks are legal`, () => {
      expect(l.steps.length).toBeGreaterThan(0);
      for (const st of l.steps) {
        const fen = stepStartFen(st);
        expect(() => new Chess(fen)).not.toThrow();
        expect(st.text.ko.length).toBeGreaterThan(0);
        expect(st.text.en.length).toBeGreaterThan(0);
        if (st.demo) {
          const c = new Chess(fen);
          for (const san of st.demo.split(' ')) expect(() => c.move(san)).not.toThrow();
        }
        if (st.task) {
          for (const san of st.task.accept) {
            const c = new Chess(fen);
            expect(() => c.move(san)).not.toThrow();
            if (st.task.mate) expect(c.isCheckmate()).toBe(true);
            if (st.task.reply) expect(() => c.move(st.task!.reply!)).not.toThrow();
          }
          for (const san of Object.keys(st.task.wrong ?? {})) expect(() => new Chess(fen).move(san)).not.toThrow();
        }
        for (const h of st.highlights ?? []) expect(h).toMatch(/^[a-h][1-8]$/);
      }
    });
  }
});
