// Turns structured puzzle data into short sentences in either language.
import { Chess } from 'chess.js';
import type { T } from '../i18n/i18n';
import type { Puzzle } from './types';

export function promptKey(p: Puzzle): string {
  if (p.category === 'mate') return `mate${Math.min(3, p.mateIn ?? 1)}`;
  if (p.category === 'fork') return p.themes.includes('fork') ? 'fork' : 'doubleAttack';
  if (p.category === 'skewerDiscovered') return p.themes.includes('skewer') ? 'skewer' : 'discoveredAttack';
  return p.category; // pin, defense, endgame
}

export function themeKey(p: Puzzle): string {
  const k = promptKey(p);
  return k.startsWith('mate') ? 'mate' : k;
}

const pieceName = (t: T, code: string) => t(`pieces.${code}`);

/** "q:d8,r:a8" -> "d8의 퀸, a8의 룩" / "the queen on d8, the rook on a8" */
export function targetList(t: T, lang: string, s: string): string {
  return s
    .split(',')
    .filter(Boolean)
    .map((x) => {
      const [code, sq] = x.split(':');
      return lang === 'ko' ? `${sq}의 ${pieceName(t, code)}` : `the ${pieceName(t, code).toLowerCase()} on ${sq}`;
    })
    .join(lang === 'ko' ? ', ' : ' and ');
}

/** kind of the expected move from the current position (fen) */
export function moveKind(fen: string, uci: string): 'check' | 'capture' | 'quiet' {
  const c = new Chess(fen);
  const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  if (c.inCheck()) return 'check';
  if (m.captured) return 'capture';
  return 'quiet';
}

/** Hint 1: the key situation + what kind of move the current step needs. */
export function hint1(t: T, p: Puzzle, fen: string, expected: string): string {
  return `${t(`solve.hint1.${themeKey(p)}`)} ${t(`solve.hint1.${moveKind(fen, expected).replace('check', 'check')}`)}`;
}

/** Hint 2: the piece to look at (from the current position) and, on the first step, the targets. */
export function hint2(t: T, lang: string, p: Puzzle, fen: string, expected: string, firstStep: boolean): string {
  const c = new Chess(fen);
  const from = expected.slice(0, 2);
  const piece = c.get(from as never);
  const base = t('solve.hint2', { square: from, piece: pieceName(t, piece?.type ?? p.hint.pieceType) });
  const targets = p.explain.params.targets;
  return firstStep && targets ? `${base} ${t('solve.hint2targets', { targets: targetList(t, lang, targets) })}` : base;
}

/** Squares to light up for hint 2 at the current step. */
export function hintFocus(p: Puzzle, expected: string, firstStep: boolean): string[] {
  return firstStep ? p.hint.focus : [expected.slice(0, 2)];
}

export function explanation(t: T, lang: string, p: Puzzle): string {
  const prm: Record<string, string> = { ...p.explain.params };
  if (prm.piece) prm.piece = lang === 'ko' ? pieceName(t, prm.piece) : pieceName(t, prm.piece).toLowerCase();
  if (prm.targets) prm.targets = targetList(t, lang, prm.targets);
  for (const k of ['pinned', 'front', 'back', 'attacker']) if (prm[k]) prm[k] = lang === 'ko' ? pieceName(t, prm[k]) : pieceName(t, prm[k]).toLowerCase();
  return t(`solve.explainT.${p.explain.key}`, prm);
}
