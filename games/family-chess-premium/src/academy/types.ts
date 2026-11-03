export type PuzzleTheme =
  | 'mate'
  | 'fork'
  | 'pin'
  | 'skewer'
  | 'discoveredAttack'
  | 'doubleAttack'
  | 'defense'
  | 'endgame'
  | 'hangingPiece'
  | 'sacrifice'
  | 'promotion'
  | 'backRankMate';

/** Course bucket used for menus and counting (one per puzzle). */
export type PuzzleCategory = 'mate' | 'fork' | 'pin' | 'skewerDiscovered' | 'defense' | 'endgame' | 'other';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleHint {
  /** squares to highlight in hint 2 (piece to look at and its targets) */
  focus: string[];
  /** key piece square (hint 2 text) */
  pieceSquare: string;
  pieceType: string;
}

export interface Puzzle {
  id: string; // stable unique id, e.g. "FCP-0001"
  /** position BEFORE the opponent's set-up move (Lichess convention) */
  fen: string;
  /** moves[0] is the opponent's move played automatically; the solver replies with moves[1], moves[3], ... */
  moves: string[];
  /** extra accepted answers for the LAST solver move (uci); any checkmating final move is also accepted */
  alternatives: string[];
  category: PuzzleCategory;
  themes: PuzzleTheme[];
  difficulty: Difficulty;
  mateIn: number | null;
  /** Lichess puzzle rating (only for puzzles taken from the Lichess database) */
  rating?: number;
  hint: PuzzleHint;
  /** structured explanation, rendered in either language */
  explain: { key: string; params: Record<string, string> };
  source: string;
}
