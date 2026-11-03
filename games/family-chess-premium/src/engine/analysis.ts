// Post-game review. Every position is searched with the same fixed depth, then
// each move is judged by the drop in winning chances (Lichess thresholds).
// When the search did not reach the trusted depth, or the game was already
// decided, the verdict is softened instead of stated as fact.
import { Chess } from 'chess.js';
import { negate, winChance, type UciScore } from './uci';

export type Verdict = 'best' | 'good' | 'ok' | 'inaccuracy' | 'mistake' | 'blunder';

export interface PositionEval {
  fen: string;
  score: UciScore; // side-to-move perspective
  bestmove: string | null;
  pv: string[];
  depth: number;
}

export interface MoveReview {
  ply: number; // index into the move list
  uci: string;
  san: string;
  color: 'w' | 'b';
  verdict: Verdict;
  uncertain: boolean;
  loss: number; // winning-chance drop in [0, 2]
  before: UciScore; // mover perspective, best play
  after: UciScore; // mover perspective, after the played move
  bestUci: string | null;
  bestSan: string | null;
  pvSan: string[]; // recommended continuation (from the position before the move)
  pvUci: string[];
  reason: ReviewReason;
}

export type ReviewReason =
  | { key: 'bestMove' }
  | { key: 'goodMove' }
  | { key: 'fine' }
  | { key: 'missedMate'; n: number; best: string }
  | { key: 'allowsMate'; n: number }
  | { key: 'losesPiece'; piece: string; square: string; best: string }
  | { key: 'evalDrop'; best: string }
  | { key: 'stillWinning'; best: string };

export const THRESHOLDS = { good: 0.03, ok: 0.1, inaccuracy: 0.2, mistake: 0.3 };

export function verdictFor(loss: number, isBest: boolean): Verdict {
  if (isBest || loss <= THRESHOLDS.good) return isBest ? 'best' : 'good';
  if (loss < THRESHOLDS.ok) return 'ok';
  if (loss < THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (loss < THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

function sanLine(fen: string, uciMoves: string[], max = 8): string[] {
  const c = new Chess(fen);
  const out: string[] = [];
  for (const u of uciMoves.slice(0, max)) {
    try {
      out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
    } catch {
      break;
    }
  }
  return out;
}

/** Score of a finished position from the side-to-move perspective. */
export function terminalScore(fen: string): UciScore | null {
  const c = new Chess(fen);
  if (c.isCheckmate()) return { mate: 0 };
  if (c.isDraw() || c.isStalemate()) return { cp: 0 };
  return null;
}

/**
 * evals[i] is the evaluation of the position before move i (evals has moves+1
 * entries; the last one is the final position).
 */
export function reviewMove(
  ply: number,
  uci: string,
  san: string,
  before: PositionEval,
  next: PositionEval,
  minTrustedDepth: number,
): MoveReview {
  const color = before.fen.split(' ')[1] as 'w' | 'b';
  const best = before.score;
  // a delivered checkmate is stored as "mate 0" for the mated side to move
  const after: UciScore = next.score.mate === 0 ? { mate: 1 } : negate(next.score);
  const isBest = before.bestmove === uci;
  const wcBest = winChance(best);
  const wcAfter = winChance(after);
  const loss = Math.max(0, wcBest - wcAfter);
  let verdict = verdictFor(loss, isBest);
  const shallow = before.depth < minTrustedDepth || next.depth < minTrustedDepth;
  // both sides of a decided game: small swings do not matter, do not overstate
  const decided = Math.abs(wcBest) > 0.92 && Math.sign(wcBest) === Math.sign(wcAfter) && after.mate === undefined && best.mate === undefined;
  if (decided && (verdict === 'inaccuracy' || verdict === 'mistake')) verdict = 'ok';
  const uncertain = shallow && verdict !== 'best' && verdict !== 'good';

  const pvSan = sanLine(before.fen, before.pv);
  const bestSan = pvSan[0] ?? null;
  let reason: ReviewReason = { key: isBest ? 'bestMove' : verdict === 'good' ? 'goodMove' : 'fine' };
  if (!isBest && verdict !== 'good' && verdict !== 'ok' && bestSan) {
    if (best.mate !== undefined && best.mate > 0 && !(after.mate !== undefined && after.mate > 0)) {
      reason = { key: 'missedMate', n: best.mate, best: bestSan };
    } else if (after.mate !== undefined && after.mate < 0 && !(best.mate !== undefined && best.mate < 0)) {
      reason = { key: 'allowsMate', n: Math.max(1, -after.mate) };
    } else {
      // does the opponent's best reply capture something?
      const reply = next.pv[0];
      const pos = new Chess(next.fen);
      const target = reply ? pos.get(reply.slice(2, 4) as never) : undefined;
      if (reply && target && target.color === color && target.type !== 'p') {
        reason = { key: 'losesPiece', piece: target.type, square: reply.slice(2, 4), best: bestSan };
      } else if (wcAfter > 0.6) {
        reason = { key: 'stillWinning', best: bestSan };
      } else {
        reason = { key: 'evalDrop', best: bestSan };
      }
    }
  }
  return {
    ply,
    uci,
    san,
    color,
    verdict,
    uncertain,
    loss,
    before: best,
    after,
    bestUci: before.bestmove,
    bestSan,
    pvSan,
    pvUci: before.pv.slice(0, pvSan.length),
    reason,
  };
}

/** Human-friendly evaluation string from White's point of view. */
export function formatEval(score: UciScore, sideToMove: 'w' | 'b'): string {
  const s = sideToMove === 'w' ? score : negate(score);
  if (s.mate !== undefined) return s.mate === 0 ? '#' : `${s.mate > 0 ? '+' : '-'}M${Math.abs(s.mate)}`;
  const v = (s.cp ?? 0) / 100;
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
}
