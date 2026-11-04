// Gives every piece on the board a stable identity across positions so the UI
// can slide pieces instead of redrawing them. Works for normal moves, captures,
// castling, en passant, promotion, undo and loading arbitrary positions.
import type { Square } from 'chess.js';

export interface TrackedPiece {
  id: string;
  type: string; // p n b r q k
  color: 'w' | 'b';
  square: Square;
}

const FILES = 'abcdefgh';
export function squareXY(sq: string): [number, number] {
  return [FILES.indexOf(sq[0]), Number(sq[1]) - 1];
}

export function fenPieces(fen: string): { type: string; color: 'w' | 'b'; square: Square }[] {
  const rows = fen.split(' ')[0].split('/');
  const out: { type: string; color: 'w' | 'b'; square: Square }[] = [];
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += Number(ch);
      else {
        out.push({ type: ch.toLowerCase(), color: ch === ch.toUpperCase() ? 'w' : 'b', square: (FILES[f] + (8 - r)) as Square });
        f++;
      }
    }
  });
  return out;
}

let counter = 0;
const newId = () => `p${++counter}`;

/**
 * Matches the previous identities to the next position.
 * 1. same square & same piece keeps its id
 * 2. remaining pieces of the same kind are paired by shortest distance
 * 3. a pawn that vanished next to a newly appeared piece of the same colour on
 *    the last rank keeps its id (promotion slides instead of popping)
 * Unmatched previous pieces are returned as `removed` (captured).
 */
export function trackPieces(prev: TrackedPiece[], fen: string): { pieces: TrackedPiece[]; removed: TrackedPiece[] } {
  const next = fenPieces(fen);
  const used = new Set<string>();
  const result: (TrackedPiece | null)[] = next.map(() => null);

  next.forEach((n, i) => {
    const same = prev.find((p) => !used.has(p.id) && p.square === n.square && p.type === n.type && p.color === n.color);
    if (same) {
      used.add(same.id);
      result[i] = { ...same };
    }
  });

  const dist = (a: string, b: string) => {
    const [ax, ay] = squareXY(a);
    const [bx, by] = squareXY(b);
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by)) + 0.01 * (Math.abs(ax - bx) + Math.abs(ay - by));
  };

  // greedy closest pairing among the rest
  const pairs: { d: number; i: number; p: TrackedPiece }[] = [];
  next.forEach((n, i) => {
    if (result[i]) return;
    for (const p of prev) {
      if (used.has(p.id) || p.type !== n.type || p.color !== n.color) continue;
      pairs.push({ d: dist(p.square, n.square), i, p });
    }
  });
  pairs.sort((a, b) => a.d - b.d);
  for (const { i, p } of pairs) {
    if (result[i] || used.has(p.id)) continue;
    used.add(p.id);
    result[i] = { ...p, square: next[i].square };
  }

  // promotion: a pawn turned into another piece on the last rank
  next.forEach((n, i) => {
    if (result[i]) return;
    const lastRank = n.color === 'w' ? '8' : '1';
    if (n.square[1] === lastRank && n.type !== 'p') {
      const pawn = prev
        .filter((p) => !used.has(p.id) && p.type === 'p' && p.color === n.color)
        .sort((a, b) => dist(a.square, n.square) - dist(b.square, n.square))[0];
      if (pawn && dist(pawn.square, n.square) < 2) {
        used.add(pawn.id);
        result[i] = { id: pawn.id, type: n.type, color: n.color, square: n.square };
        return;
      }
    }
    result[i] = { id: newId(), ...n };
  });

  return { pieces: result as TrackedPiece[], removed: prev.filter((p) => !used.has(p.id)) };
}
