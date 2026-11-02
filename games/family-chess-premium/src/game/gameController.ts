// Pure chess state. No DOM, no animation: the UI only renders what this says.
import { Chess, type Move, type Square, type PieceSymbol } from 'chess.js';

export type Color = 'w' | 'b';
export type ResultKind =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient'
  | 'fivefold'
  | 'seventyFive'
  | 'threefoldClaim'
  | 'fiftyClaim'
  | 'resign'
  | 'agreement';

export interface GameResult {
  kind: ResultKind;
  winner: Color | null;
}

export interface MoveRecord {
  san: string;
  uci: string;
  from: Square;
  to: Square;
  color: Color;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  isCastle: boolean;
  isEnPassant: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  fenBefore: string;
  fenAfter: string;
}

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Position identity for repetition (board, side, castling, en-passant). */
export function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

function toRecord(m: Move, after: Chess): MoveRecord {
  return {
    san: m.san,
    uci: m.from + m.to + (m.promotion ?? ''),
    from: m.from,
    to: m.to,
    color: m.color,
    piece: m.piece,
    captured: m.captured,
    promotion: m.promotion,
    isCastle: m.isKingsideCastle() || m.isQueensideCastle(),
    isEnPassant: m.isEnPassant(),
    isCheck: after.inCheck(),
    isCheckmate: after.isCheckmate(),
    fenBefore: m.before,
    fenAfter: m.after,
  };
}

export class GameController {
  private chess: Chess;
  readonly startFen: string;
  private records: MoveRecord[] = [];
  private forcedResult: GameResult | null = null;

  constructor(startFen: string = START_FEN, moves: string[] = []) {
    this.startFen = startFen;
    this.chess = new Chess(startFen);
    for (const u of moves) {
      if (!this.move(GameController.parseUci(u))) throw new Error(`illegal move in replay: ${u}`);
    }
  }

  static parseUci(u: string): { from: Square; to: Square; promotion?: PieceSymbol } {
    return { from: u.slice(0, 2) as Square, to: u.slice(2, 4) as Square, promotion: (u[4] as PieceSymbol) || undefined };
  }

  static validateFen(fen: string): boolean {
    try {
      new Chess(fen);
      return true;
    } catch {
      return false;
    }
  }

  fen(): string { return this.chess.fen(); }
  turn(): Color { return this.chess.turn(); }
  history(): readonly MoveRecord[] { return this.records; }
  lastMove(): MoveRecord | undefined { return this.records[this.records.length - 1]; }
  board() { return this.chess.board(); }
  get(square: Square) { return this.chess.get(square); }
  inCheck(): boolean { return this.chess.inCheck(); }
  uciMoves(): string[] { return this.records.map((r) => r.uci); }

  /** Square of the king of the side to move when it is in check. */
  checkSquare(): Square | null {
    if (!this.chess.inCheck()) return null;
    const color = this.chess.turn();
    for (const row of this.chess.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
    return null;
  }

  legalTargets(from: Square): Square[] {
    if (this.result()) return [];
    return this.chess.moves({ square: from, verbose: true }).map((m) => m.to);
  }

  allLegalUci(): string[] {
    return this.chess.moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ''));
  }

  isPromotion(from: Square, to: Square): boolean {
    return this.chess.moves({ square: from, verbose: true }).some((m) => m.to === to && !!m.promotion);
  }

  /** Plays a move if legal. Returns null (and changes nothing) otherwise. */
  move(mv: { from: Square; to: Square; promotion?: PieceSymbol }): MoveRecord | null {
    if (this.result()) return null;
    let m: Move;
    try {
      m = this.chess.move({ from: mv.from, to: mv.to, promotion: mv.promotion ?? 'q' });
    } catch {
      return null;
    }
    const rec = toRecord(m, this.chess);
    this.records.push(rec);
    return rec;
  }

  undo(): MoveRecord | null {
    if (!this.records.length) return null;
    this.forcedResult = null;
    this.chess.undo();
    return this.records.pop() ?? null;
  }

  /** How many times the current position has occurred (including now). */
  repetitionCount(): number {
    const key = positionKey(this.chess.fen());
    const keys = [positionKey(this.startFen), ...this.records.map((r) => positionKey(r.fenAfter))];
    return keys.filter((k) => k === key).length;
  }

  halfmoveClock(): number {
    return Number(this.chess.fen().split(' ')[4]) || 0;
  }

  /** Draws a player may claim (FIDE 9.2 / 9.3); they do not end the game alone. */
  claimableDraw(): 'threefold' | 'fifty' | null {
    if (this.result()) return null;
    if (this.repetitionCount() >= 3) return 'threefold';
    if (this.halfmoveClock() >= 100) return 'fifty';
    return null;
  }

  claimDraw(): GameResult | null {
    const c = this.claimableDraw();
    if (!c) return null;
    this.forcedResult = { kind: c === 'threefold' ? 'threefoldClaim' : 'fiftyClaim', winner: null };
    return this.forcedResult;
  }

  resign(color: Color): GameResult {
    this.forcedResult = { kind: 'resign', winner: color === 'w' ? 'b' : 'w' };
    return this.forcedResult;
  }

  agreeDraw(): GameResult {
    this.forcedResult = { kind: 'agreement', winner: null };
    return this.forcedResult;
  }

  /** Automatic game end, or a recorded claim/resignation. */
  result(): GameResult | null {
    if (this.forcedResult) return this.forcedResult;
    const c = this.chess;
    if (c.isCheckmate()) return { kind: 'checkmate', winner: c.turn() === 'w' ? 'b' : 'w' };
    if (c.isStalemate()) return { kind: 'stalemate', winner: null };
    if (c.isInsufficientMaterial()) return { kind: 'insufficient', winner: null };
    if (this.repetitionCount() >= 5) return { kind: 'fivefold', winner: null };
    if (this.halfmoveClock() >= 150) return { kind: 'seventyFive', winner: null };
    return null;
  }

  pgn(headers: Record<string, string> = {}): string {
    const c = new Chess(this.startFen);
    const h: Record<string, string> = { Event: 'Family Chess', Site: 'Offline', ...headers };
    if (this.startFen !== START_FEN) {
      h.SetUp = '1';
      h.FEN = this.startFen;
    }
    const res = this.result();
    h.Result = !res ? '*' : res.winner === 'w' ? '1-0' : res.winner === 'b' ? '0-1' : '1/2-1/2';
    for (const [k, v] of Object.entries(h)) c.setHeader(k, v);
    for (const r of this.records) c.move(r.san);
    return c.pgn();
  }

  static fromPgn(pgn: string): { game: GameController; headers: Record<string, string> } {
    const c = new Chess();
    c.loadPgn(pgn);
    const headers = c.getHeaders() as Record<string, string>;
    const start = headers.FEN || START_FEN;
    const moves = c.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ''));
    return { game: new GameController(start, moves), headers };
  }
}
