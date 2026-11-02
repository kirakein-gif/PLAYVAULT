import { describe, expect, it } from 'vitest';
import { GameController, START_FEN } from '../../src/game/gameController';

const play = (g: GameController, ...ucis: string[]) => {
  for (const u of ucis) {
    const r = g.move(GameController.parseUci(u));
    if (!r) throw new Error(`illegal ${u} in ${g.fen()}`);
  }
};

describe('chess rules (GameController)', () => {
  it('standard start position has 20 legal moves', () => {
    const g = new GameController();
    expect(g.fen()).toBe(START_FEN);
    expect(g.allLegalUci()).toHaveLength(20);
    expect(g.turn()).toBe('w');
  });

  it('rejects illegal moves without changing state', () => {
    const g = new GameController();
    expect(g.move({ from: 'e2', to: 'e5' })).toBeNull();
    expect(g.move({ from: 'e7', to: 'e5' })).toBeNull(); // not black's turn
    expect(g.fen()).toBe(START_FEN);
  });

  it('forbids moves that leave the king in check', () => {
    const g = new GameController('4k3/8/8/8/8/8/4r3/4K2R w K - 0 1');
    expect(g.inCheck()).toBe(true);
    expect(g.move({ from: 'h1', to: 'h2' })).toBeNull();
    expect(g.move({ from: 'e1', to: 'g1' })).toBeNull(); // cannot castle out of check
    expect(g.legalTargets('e1').sort()).toEqual(['d1', 'e2', 'f1'].sort());
  });

  it('detects checkmate (fool’s mate)', () => {
    const g = new GameController();
    play(g, 'f2f3', 'e7e5', 'g2g4', 'd8h4');
    expect(g.result()).toEqual({ kind: 'checkmate', winner: 'b' });
    expect(g.lastMove()?.isCheckmate).toBe(true);
    expect(g.move({ from: 'a2', to: 'a3' })).toBeNull();
  });

  it('detects stalemate after a move', () => {
    const g = new GameController('7k/8/6K1/8/8/8/8/5Q2 w - - 0 1');
    play(g, 'f1f7');
    expect(g.inCheck()).toBe(false);
    expect(g.result()).toEqual({ kind: 'stalemate', winner: null });
  });

  it('stalemate position is a draw', () => {
    const g = new GameController('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    expect(g.result()).toEqual({ kind: 'stalemate', winner: null });
  });

  it('castles both sides and moves the rook', () => {
    const g = new GameController('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    play(g, 'e1g1');
    expect(g.get('f1')?.type).toBe('r');
    expect(g.lastMove()?.isCastle).toBe(true);
    play(g, 'e8c8');
    expect(g.get('d8')?.type).toBe('r');
    expect(g.get('c8')?.type).toBe('k');
  });

  it('does not castle through an attacked square', () => {
    // the black rook on f8 attacks f1, which the king would cross
    const g = new GameController('4kr2/8/8/8/8/8/8/4K2R w K - 0 1');
    expect(g.legalTargets('e1')).not.toContain('g1');
  });

  it('supports en passant', () => {
    const g = new GameController();
    play(g, 'e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6');
    expect(g.lastMove()?.isEnPassant).toBe(true);
    expect(g.get('d5')).toBeFalsy();
    expect(g.get('d6')?.type).toBe('p');
  });

  it.each(['q', 'r', 'b', 'n'] as const)('promotes to %s', (piece) => {
    const g = new GameController('8/P6k/8/8/8/8/8/K7 w - - 0 1');
    expect(g.isPromotion('a7', 'a8')).toBe(true);
    const r = g.move({ from: 'a7', to: 'a8', promotion: piece });
    expect(r?.promotion).toBe(piece);
    expect(g.get('a8')?.type).toBe(piece);
  });

  it('insufficient material is an automatic draw', () => {
    const g = new GameController('8/8/8/4k3/8/8/2B5/4K3 w - - 0 1');
    expect(g.result()).toEqual({ kind: 'insufficient', winner: null });
  });

  it('threefold repetition is claimable, fivefold ends the game', () => {
    const g = new GameController();
    const cycle = ['g1f3', 'g8f6', 'f3g1', 'f6g8'];
    play(g, ...cycle, ...cycle);
    expect(g.repetitionCount()).toBe(3);
    expect(g.claimableDraw()).toBe('threefold');
    expect(g.result()).toBeNull(); // not automatic
    play(g, ...cycle, ...cycle);
    expect(g.repetitionCount()).toBe(5);
    expect(g.result()).toEqual({ kind: 'fivefold', winner: null });
  });

  it('claiming a draw ends the game', () => {
    const g = new GameController();
    const cycle = ['g1f3', 'g8f6', 'f3g1', 'f6g8'];
    play(g, ...cycle, ...cycle);
    expect(g.claimDraw()).toEqual({ kind: 'threefoldClaim', winner: null });
    expect(g.result()?.kind).toBe('threefoldClaim');
  });

  it('50-move rule is claimable, 75-move rule is automatic', () => {
    const g50 = new GameController('8/8/8/4k3/8/8/R7/4K3 w - - 100 80');
    expect(g50.claimableDraw()).toBe('fifty');
    expect(g50.result()).toBeNull();
    const g75 = new GameController('8/8/8/4k3/8/8/R7/4K3 w - - 150 100');
    expect(g75.result()).toEqual({ kind: 'seventyFive', winner: null });
  });

  it('undo restores the exact previous state (castling rights, en passant, clocks)', () => {
    const g = new GameController();
    play(g, 'e2e4', 'd7d5', 'e4e5', 'f7f5');
    const before = g.fen();
    play(g, 'e5f6', 'e8f7', 'e1e2');
    g.undo();
    g.undo();
    g.undo();
    expect(g.fen()).toBe(before);
    expect(g.allLegalUci()).toContain('e5f6'); // en passant still available
  });

  it('undo after checkmate reopens the game', () => {
    const g = new GameController();
    play(g, 'f2f3', 'e7e5', 'g2g4', 'd8h4');
    g.undo();
    expect(g.result()).toBeNull();
    expect(g.turn()).toBe('b');
  });

  it('resignation and agreement', () => {
    const g = new GameController();
    expect(g.resign('w')).toEqual({ kind: 'resign', winner: 'b' });
    const h = new GameController();
    expect(h.agreeDraw()).toEqual({ kind: 'agreement', winner: null });
  });

  it('PGN round trip, including a custom start position', () => {
    const g = new GameController();
    play(g, 'e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5');
    const { game } = GameController.fromPgn(g.pgn({ White: 'A', Black: 'B' }));
    expect(game.fen()).toBe(g.fen());
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    const c = new GameController(fen);
    play(c, 'e1g1', 'e8c8');
    const back = GameController.fromPgn(c.pgn());
    expect(back.game.startFen).toBe(fen);
    expect(back.game.fen()).toBe(c.fen());
  });

  it('validates FEN strings', () => {
    expect(GameController.validateFen(START_FEN)).toBe(true);
    expect(GameController.validateFen('not a fen')).toBe(false);
  });
});
