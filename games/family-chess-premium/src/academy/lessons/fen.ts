import { Chess } from 'chess.js';
import type { LessonStep } from './types';

/** Position at the start of a lesson step (FEN, or SAN moves from the initial position). */
export function stepStartFen(step: LessonStep): string {
  if (step.fen) return step.fen;
  const c = new Chess();
  for (const san of (step.pre ?? '').split(' ').filter(Boolean)) c.move(san);
  return c.fen();
}
