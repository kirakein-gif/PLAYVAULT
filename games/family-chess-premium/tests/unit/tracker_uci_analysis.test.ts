import { describe, expect, it } from 'vitest';
import { trackPieces } from '../../src/game/pieceTracker';
import { GameController } from '../../src/game/gameController';
import { parseBestmove, parseInfo, parseOption, winChance } from '../../src/engine/uci';
import { reviewMove, verdictFor, THRESHOLDS } from '../../src/engine/analysis';
import { LEVELS, levelConfig } from '../../src/engine/difficulty';

describe('piece identity tracking (animation)', () => {
  const step = (fen0: string, ...u: string[]) => {
    const g = new GameController(fen0);
    let t = trackPieces([], g.fen());
    const out = [t];
    for (const m of u) {
      g.move(GameController.parseUci(m));
      t = trackPieces(t.pieces, g.fen());
      out.push(t);
    }
    return out;
  };
  it('a normal move keeps the same id', () => {
    const [a, b] = step('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'e2e4');
    const pawn = a.pieces.find((p) => p.square === 'e2')!;
    expect(b.pieces.find((p) => p.id === pawn.id)!.square).toBe('e4');
    expect(b.removed).toHaveLength(0);
  });
  it('a capture removes exactly the captured piece', () => {
    const [, , , c] = step('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'e2e4', 'd7d5', 'e4d5');
    expect(c.removed).toHaveLength(1);
    expect(c.removed[0].color).toBe('b');
  });
  it('castling slides king and rook', () => {
    const [a, b] = step('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'e1g1');
    const rook = a.pieces.find((p) => p.square === 'h1')!;
    expect(b.pieces.find((p) => p.id === rook.id)!.square).toBe('f1');
  });
  it('promotion keeps the pawn identity', () => {
    const [a, b] = step('8/P6k/8/8/8/8/8/K7 w - - 0 1', 'a7a8n');
    const pawn = a.pieces.find((p) => p.square === 'a7')!;
    const now = b.pieces.find((p) => p.id === pawn.id)!;
    expect(now.square).toBe('a8');
    expect(now.type).toBe('n');
  });
});

describe('UCI parsing', () => {
  it('parses info lines', () => {
    const i = parseInfo('info depth 12 seldepth 18 multipv 2 score cp -34 nodes 1000 nps 1 pv e7e5 g1f3');
    expect(i).toEqual({ depth: 12, multipv: 2, score: { cp: -34 }, pv: ['e7e5', 'g1f3'], bound: undefined });
    expect(parseInfo('info depth 5 score mate 3 pv a1a8')?.score).toEqual({ mate: 3 });
    expect(parseInfo('info depth 5 score cp 10 lowerbound pv a1a8')?.bound).toBe('lower');
    expect(parseInfo('info string hello')).toBeNull();
  });
  it('parses options and bestmove', () => {
    expect(parseOption('option name Skill Level type spin default 20 min 0 max 20')).toEqual({ name: 'Skill Level', type: 'spin', default: '20', min: 0, max: 20 });
    expect(parseBestmove('bestmove e2e4 ponder e7e5')).toBe('e2e4');
    expect(parseBestmove('bestmove (none)')).toBeNull();
  });
  it('win chances are symmetric and bounded', () => {
    expect(winChance({ cp: 0 })).toBeCloseTo(0);
    expect(winChance({ cp: 300 })).toBeCloseTo(-winChance({ cp: -300 }));
    expect(winChance({ mate: 2 })).toBe(1);
    expect(winChance({ mate: -1 })).toBe(-1);
    expect(winChance({ mate: 0 })).toBe(-1);
  });
});

describe('review verdicts', () => {
  it('uses fixed thresholds', () => {
    expect(verdictFor(0, true)).toBe('best');
    expect(verdictFor(THRESHOLDS.good, false)).toBe('good');
    expect(verdictFor(0.05, false)).toBe('ok');
    expect(verdictFor(0.15, false)).toBe('inaccuracy');
    expect(verdictFor(0.25, false)).toBe('mistake');
    expect(verdictFor(0.5, false)).toBe('blunder');
  });
  const ev = (fen: string, score: { cp?: number; mate?: number }, best: string | null, depth = 12, pv: string[] = best ? [best] : []) => ({ fen, score, bestmove: best, pv, depth });
  it('flags a hanging-queen blunder with a concrete reason', () => {
    // 1.e4 d5 2.Qg4?? Bxg4
    const f0 = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    const f1 = 'rnbqkbnr/ppp1pppp/8/3p4/4P1Q1/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2';
    const r = reviewMove(2, 'd1g4', 'Qg4', ev(f0, { cp: 30 }, 'e4d5'), ev(f1, { cp: 800 }, 'c8g4', 12, ['c8g4']), 9);
    expect(r.verdict).toBe('blunder');
    expect(r.reason).toEqual({ key: 'losesPiece', piece: 'q', square: 'g4', best: 'exd5' });
    expect(r.uncertain).toBe(false);
  });
  it('softens a verdict reached at shallow depth', () => {
    const f0 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    const f1 = 'rnbqkbnr/pppp1ppp/8/4p3/4P1Q1/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2';
    const r = reviewMove(2, 'd1g4', 'Qg4', ev(f0, { cp: 30 }, 'g1f3', 5), ev(f1, { cp: 700 }, 'd7d5', 5), 9);
    expect(r.uncertain).toBe(true);
  });
  it('a delivered checkmate is never a mistake', () => {
    const f0 = 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2';
    const f1 = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
    const r = reviewMove(3, 'd8h4', 'Qh4#', ev(f0, { mate: 1 }, 'd8h4'), ev(f1, { mate: 0 }, null, 99), 9);
    expect(r.verdict).toBe('best');
  });
});

describe('difficulty configuration', () => {
  it('has five levels whose strength settings strictly increase', () => {
    expect(LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].skill).toBeGreaterThan(LEVELS[i - 1].skill);
      expect(LEVELS[i].depth).toBeGreaterThan(LEVELS[i - 1].depth);
    }
  });
  it('low-power mode caps work but keeps the skill', () => {
    const lp = levelConfig(5, true);
    expect(lp.skill).toBe(20);
    expect(lp.movetimeMs).toBeLessThanOrEqual(1000);
  });
});
