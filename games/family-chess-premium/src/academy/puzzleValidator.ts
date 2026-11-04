// Judges a solver move with the rules engine — never by string comparison alone.
import { Chess, type Square } from 'chess.js';
import type { Puzzle } from './types';

export type MoveVerdict = 'illegal' | 'correct' | 'solved' | 'wrong';

export interface PuzzleSession {
  puzzle: Puzzle;
  chess: Chess; // current position
  index: number; // index in puzzle.moves of the next expected solver move
}

export function playUci(chess: Chess, uci: string) {
  return chess.move({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: (uci[4] as 'q') || undefined });
}

/** Position after the opponent's automatic set-up move (what the solver sees). */
export function startSession(puzzle: Puzzle): PuzzleSession {
  const chess = new Chess(puzzle.fen);
  playUci(chess, puzzle.moves[0]);
  return { puzzle, chess, index: 1 };
}

export function solverColor(puzzle: Puzzle): 'w' | 'b' {
  return puzzle.fen.split(' ')[1] === 'w' ? 'b' : 'w';
}

export function solverMoveCount(puzzle: Puzzle): number {
  return Math.floor(puzzle.moves.length / 2);
}

/**
 * Checks a solver move without changing the session.
 * - illegal moves are rejected by chess.js
 * - the expected move is correct
 * - on the final step, any checkmate or a listed alternative also solves it
 */
export function judgeMove(s: PuzzleSession, uci: string): MoveVerdict {
  const test = new Chess(s.chess.fen());
  let mv;
  try {
    mv = playUci(test, uci);
  } catch {
    return 'illegal';
  }
  const played = mv.from + mv.to + (mv.promotion ?? '');
  const expected = s.puzzle.moves[s.index];
  const isLast = s.index >= s.puzzle.moves.length - 1;
  const same = played === expected || (expected.length === 4 && played === expected + 'q' && !!mv.promotion);
  if (test.isCheckmate()) return 'solved';
  if (same) return isLast ? 'solved' : 'correct';
  if (isLast && s.puzzle.alternatives.includes(played)) return 'solved';
  return 'wrong';
}

/** Applies a correct solver move and the scripted reply; returns the reply uci. */
export function advance(s: PuzzleSession, uci: string): string | null {
  playUci(s.chess, uci);
  s.index += 1;
  const reply = s.puzzle.moves[s.index];
  if (reply && !s.chess.isGameOver()) {
    playUci(s.chess, reply);
    s.index += 1;
    return reply;
  }
  return null;
}
