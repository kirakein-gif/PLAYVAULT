// Saving finished / loaded games to the profile.
import type { Profile, SavedGame } from '../storage/schema';
import { GameController, type GameResult } from './gameController';

export const MAX_SAVED_GAMES = 40;

export function resultTag(r: GameResult | null): string {
  if (!r) return '*';
  return r.winner === 'w' ? '1-0' : r.winner === 'b' ? '0-1' : '1/2-1/2';
}

export function makeSavedGame(g: GameController, mode: 'two' | 'ai', opts: { level?: number; playerColor?: 'w' | 'b'; names: { w: string; b: string } }): SavedGame {
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const r = g.result();
  return {
    id: `g${d.getTime()}`,
    mode,
    date: d.toISOString(),
    pgn: g.pgn({ Date: date, White: opts.names.w, Black: opts.names.b }),
    result: resultTag(r),
    resultKind: r?.kind ?? null,
    level: opts.level,
    playerColor: opts.playerColor,
    plies: g.history().length,
  };
}

export function addGame(p: Profile, s: SavedGame, ai?: { playerColor: 'w' | 'b' }): Profile {
  const stats = { ...p.stats, gamesPlayed: p.stats.gamesPlayed + 1 };
  if (ai && s.result !== '*') {
    const win = (s.result === '1-0' && ai.playerColor === 'w') || (s.result === '0-1' && ai.playerColor === 'b');
    if (s.result === '1/2-1/2') stats.aiDraws += 1;
    else if (win) stats.aiWins += 1;
    else stats.aiLosses += 1;
  }
  return { ...p, games: [s, ...p.games].slice(0, MAX_SAVED_GAMES), stats };
}
