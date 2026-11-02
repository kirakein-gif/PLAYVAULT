// Premium walnut board. Rendering only: legality comes from the parent (chess.js).
// Touch: tap-select then tap-target, or drag & drop. Pieces keep identities so
// moves slide (≈160 ms) and land with a small bounce; captured pieces shrink away.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import { trackPieces, type TrackedPiece } from '../../game/pieceTracker';
import './board.css';

export interface Arrow {
  from: string;
  to: string;
  kind: 'hint' | 'best' | 'line';
}

export interface BoardProps {
  fen: string;
  size: number; // outer size in px (including frame)
  orientation: 'w' | 'b';
  movable: 'w' | 'b' | 'both' | null;
  legalTargets: (from: Square) => Square[];
  isPromotion: (from: Square, to: Square) => boolean;
  onMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  onSelect?: (sq: Square) => void;
  onIllegal?: (from: Square, to: Square) => void;
  onTouchLocked?: (sq: Square) => void; // touched a piece that can't move now
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  highlights?: string[];
  arrows?: Arrow[];
  showCoords?: boolean;
  animMs?: number;
  flash?: { square: string; kind: 'wrong' | 'right'; key: number } | null;
}

const FILES = 'abcdefgh';
const PROMO: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n'];

function sqToXY(sq: string, orientation: 'w' | 'b'): [number, number] {
  const f = FILES.indexOf(sq[0]);
  const r = Number(sq[1]) - 1;
  return orientation === 'w' ? [f, 7 - r] : [7 - f, r];
}
function xyToSq(x: number, y: number, orientation: 'w' | 'b'): Square {
  const f = orientation === 'w' ? x : 7 - x;
  const r = orientation === 'w' ? 7 - y : y;
  return (FILES[f] + (r + 1)) as Square;
}
const pieceSrc = (color: string, type: string) => `pieces/${color}${type.toUpperCase()}.svg`;

/** deterministic grain offset so neighbouring squares look like different wood */
const grain = (i: number) => `${(i * 37) % 100}% ${(i * 61 + 13) % 100}%`;

export function ChessBoard(p: BoardProps) {
  const animMs = p.animMs ?? 160;
  const frame = Math.round(p.size * (p.showCoords === false ? 0.025 : 0.045));
  const inner = p.size - frame * 2;
  const sqPx = inner / 8;
  const boardRef = useRef<HTMLDivElement>(null);

  // ----- piece identity tracking -----
  const [pieces, setPieces] = useState<TrackedPiece[]>(() => trackPieces([], p.fen).pieces);
  const [ghosts, setGhosts] = useState<(TrackedPiece & { key: string })[]>([]);
  const [landing, setLanding] = useState<Record<string, 'land' | 'heavy'>>({});
  const skipAnim = useRef<Set<string>>(new Set());
  const [noAnimIds, setNoAnimIds] = useState<Set<string>>(new Set());
  const prevFen = useRef(p.fen);

  const piecesRef = useRef(pieces);
  useLayoutEffect(() => {
    if (prevFen.current === p.fen) return;
    prevFen.current = p.fen;
    const prev = piecesRef.current;
    const { pieces: next, removed } = trackPieces(prev, p.fen);
    piecesRef.current = next;
    const moved = next.filter((n) => {
      const o = prev.find((q) => q.id === n.id);
      return o && o.square !== n.square;
    });
    if (removed.length) {
      const stamp = Date.now();
      const keys = removed.map((r) => `${r.id}-${stamp}`);
      setGhosts((g) => [...g, ...removed.map((r, i) => ({ ...r, key: keys[i] }))]);
      setTimeout(() => setGhosts((g) => g.filter((x) => !keys.includes(x.key))), animMs + 320);
    }
    if (moved.length && moved.length <= 2) {
      const heavy = removed.length > 0;
      const marks: Record<string, 'land' | 'heavy'> = {};
      moved.forEach((m) => (marks[m.id] = heavy && moved.length === 1 ? 'heavy' : 'land'));
      const wasDragged = moved.some((m) => skipAnim.current.has(m.id));
      const delay = wasDragged ? 0 : animMs;
      setTimeout(() => setLanding(marks), delay);
      setTimeout(() => setLanding({}), delay + 300);
    }
    setNoAnimIds(new Set(skipAnim.current));
    skipAnim.current.clear();
    setPieces(next);
  }, [p.fen, animMs]);

  useEffect(() => {
    if (noAnimIds.size) {
      const id = requestAnimationFrame(() => setNoAnimIds(new Set()));
      return () => cancelAnimationFrame(id);
    }
  }, [noAnimIds]);

  // ----- selection & drag -----
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);
  const [drag, setDrag] = useState<{ id: string; from: Square; x: number; y: number; active: boolean } | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square; color: 'w' | 'b' } | null>(null);
  const [badFlash, setBadFlash] = useState<{ square: string; key: number } | null>(null);
  const downInfo = useRef<{ x: number; y: number; sq: Square; wasSelected: boolean } | null>(null);

  useEffect(() => {
    setSelected(null);
    setTargets([]);
    setPromo(null);
  }, [p.fen, p.movable]);

  const pieceAt = useCallback((sq: string) => pieces.find((x) => x.square === sq), [pieces]);
  const canMove = (color: 'w' | 'b') => p.movable === 'both' || p.movable === color;
  const turn = p.fen.split(' ')[1] as 'w' | 'b';

  const select = (sq: Square | null) => {
    setSelected(sq);
    setTargets(sq ? p.legalTargets(sq) : []);
    if (sq) p.onSelect?.(sq);
  };

  const tryMove = (from: Square, to: Square, dragged: boolean): boolean => {
    const piece = pieceAt(from);
    if (p.isPromotion(from, to)) {
      setPromo({ from, to, color: (piece?.color ?? turn) as 'w' | 'b' });
      return true;
    }
    if (dragged && piece) skipAnim.current.add(piece.id);
    const ok = p.onMove(from, to);
    if (!ok) skipAnim.current.clear();
    select(null);
    return ok;
  };

  const local = (e: React.PointerEvent) => {
    const r = boardRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width };
  };
  const squareAt = (x: number, y: number, w: number): Square | null => {
    const s = w / 8;
    const cx = Math.floor(x / s);
    const cy = Math.floor(y / s);
    if (cx < 0 || cy < 0 || cx > 7 || cy > 7) return null;
    return xyToSq(cx, cy, p.orientation);
  };

  const illegal = (from: Square, to: Square) => {
    setBadFlash({ square: to, key: Date.now() });
    p.onIllegal?.(from, to);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (promo || p.movable === null) return;
    const { x, y, w } = local(e);
    const sq = squareAt(x, y, w);
    if (!sq) return;
    const piece = pieceAt(sq);
    if (selected && targets.includes(sq)) {
      tryMove(selected, sq, false);
      return;
    }
    if (piece && piece.color === turn && canMove(piece.color)) {
      const wasSelected = selected === sq;
      if (!wasSelected) select(sq);
      downInfo.current = { x, y, sq, wasSelected };
      setDrag({ id: piece.id, from: sq, x, y, active: false });
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {
        /* synthetic or already-released pointer */
      }
      return;
    }
    if (selected && sq !== selected) {
      illegal(selected, sq);
      select(null);
      return;
    }
    if (piece) p.onTouchLocked?.(sq);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const { x, y } = local(e);
    const d0 = downInfo.current;
    const active = drag.active || (d0 ? Math.hypot(x - d0.x, y - d0.y) > sqPx * 0.12 : false);
    setDrag({ ...drag, x, y, active });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const { x, y, w } = local(e);
    const d0 = downInfo.current;
    downInfo.current = null;
    const from = drag.from;
    const wasActive = drag.active;
    setDrag(null);
    if (!wasActive) {
      if (d0?.wasSelected) select(null); // tapping the selected piece again deselects
      return;
    }
    const sq = squareAt(x, y, w);
    if (!sq || sq === from) return; // dropped back home: keep selection
    if (targets.includes(sq)) tryMove(from, sq, true);
    else illegal(from, sq);
  };

  const onPointerCancel = () => {
    setDrag(null);
    downInfo.current = null;
  };

  // ----- rendering helpers -----
  const squares = useMemo(() => {
    const out: { sq: string; x: number; y: number; light: boolean; i: number }[] = [];
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const sq = xyToSq(x, y, p.orientation);
        const f = FILES.indexOf(sq[0]);
        const r = Number(sq[1]) - 1;
        out.push({ sq, x, y, light: (f + r) % 2 === 1, i: f * 8 + r });
      }
    return out;
  }, [p.orientation]);

  const style = { width: p.size, height: p.size, padding: frame, ['--sq' as string]: `${sqPx}px`, ['--anim' as string]: `${animMs}ms` } as React.CSSProperties;

  const flashes = [p.flash && { ...p.flash }, badFlash && { square: badFlash.square, kind: 'wrong' as const, key: badFlash.key }].filter(Boolean) as {
    square: string;
    kind: string;
    key: number;
  }[];

  return (
    <div className="boardFrame" style={style}>
      {p.showCoords !== false && (
        <div className="coords" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={`f${i}`} className="coord file" style={{ left: frame + sqPx * (i + 0.5), top: frame + inner + frame * 0.5 }}>
              {p.orientation === 'w' ? FILES[i] : FILES[7 - i]}
            </span>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <span key={`r${i}`} className="coord rank" style={{ top: frame + sqPx * (i + 0.5), left: frame * 0.5 }}>
              {p.orientation === 'w' ? 8 - i : i + 1}
            </span>
          ))}
        </div>
      )}
      <div
        className={`board${drag?.active ? ' dragging' : ''}`}
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        data-testid="board"
      >
        {squares.map((s) => {
          const cls = ['sq', s.light ? 'light' : 'dark'];
          if (p.lastMove && (p.lastMove.from === s.sq || p.lastMove.to === s.sq)) cls.push('last');
          if (selected === s.sq) cls.push('sel');
          if (p.highlights?.includes(s.sq)) cls.push('hl');
          if (p.checkSquare === s.sq) cls.push('check');
          return (
            <div
              key={s.sq}
              className={cls.join(' ')}
              data-square={s.sq}
              style={{ transform: `translate(${s.x * 100}%, ${s.y * 100}%)`, backgroundPosition: grain(s.i) }}
            />
          );
        })}
        {targets.map((t) => {
          const [x, y] = sqToXY(t, p.orientation);
          const cap = !!pieceAt(t) || (pieceAt(selected ?? '')?.type === 'p' && t[0] !== selected?.[0]);
          return <div key={`t${t}`} className={`target${cap ? ' cap' : ''}`} style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }} />;
        })}
        {flashes.map((f) => {
          const [x, y] = sqToXY(f.square, p.orientation);
          return <div key={`fl${f.key}${f.square}`} className={`flash ${f.kind}`} style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }} />;
        })}
        {ghosts.map((g) => {
          const [x, y] = sqToXY(g.square, p.orientation);
          return (
            <div key={g.key} className="piece ghost" style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}>
              <div className="pieceInner">
                <img src={pieceSrc(g.color, g.type)} alt="" draggable={false} />
              </div>
            </div>
          );
        })}
        {pieces.map((pc) => {
          const [x, y] = sqToXY(pc.square, p.orientation);
          const isDrag = drag?.active && drag.id === pc.id;
          const cls = ['piece'];
          if (selected === pc.square) cls.push('lifted');
          if (isDrag) cls.push('drag');
          if (landing[pc.id]) cls.push(landing[pc.id] === 'heavy' ? 'landHeavy' : 'land');
          if (noAnimIds.has(pc.id)) cls.push('noanim');
          const transform = isDrag ? `translate(${drag!.x - sqPx / 2}px, ${drag!.y - sqPx * 0.62}px)` : `translate(${x * 100}%, ${y * 100}%)`;
          return (
            <div key={pc.id} className={cls.join(' ')} style={{ transform }} data-piece={`${pc.color}${pc.type}`} data-sq={pc.square}>
              <div className="pieceInner">
                <img src={pieceSrc(pc.color, pc.type)} alt={`${pc.color}${pc.type}`} draggable={false} />
              </div>
            </div>
          );
        })}
        {!!p.arrows?.length && (
          <svg className="arrows" viewBox="0 0 8 8" aria-hidden>
            <defs>
              {['hint', 'best', 'line'].map((k) => (
                <marker key={k} id={`ah-${k}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.6" markerHeight="2.6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className={`ah ${k}`} />
                </marker>
              ))}
            </defs>
            {p.arrows.map((a, i) => {
              const [x1, y1] = sqToXY(a.from, p.orientation);
              const [x2, y2] = sqToXY(a.to, p.orientation);
              const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
              const ex = x2 + 0.5 - (dx / len) * 0.32, ey = y2 + 0.5 - (dy / len) * 0.32;
              return <line key={i} className={`arrow ${a.kind}`} x1={x1 + 0.5} y1={y1 + 0.5} x2={ex} y2={ey} markerEnd={`url(#ah-${a.kind})`} />;
            })}
          </svg>
        )}
        {promo && (
          <div className="promoLayer" onPointerDown={(e) => { e.stopPropagation(); setPromo(null); select(null); }}>
            {(() => {
              const [x, y] = sqToXY(promo.to, p.orientation);
              const down = y === 0;
              return (
                <div className="promoBox" style={{ left: `${x * 12.5}%`, top: down ? 0 : undefined, bottom: down ? undefined : 0, flexDirection: down ? 'column' : 'column-reverse' }}>
                  {PROMO.map((k) => (
                    <button
                      key={k}
                      className="promoBtn"
                      data-promo={k}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const pr = promo;
                        setPromo(null);
                        const piece = pieceAt(pr.from);
                        if (piece) skipAnim.current.delete(piece.id);
                        p.onMove(pr.from, pr.to, k);
                        select(null);
                      }}
                    >
                      <img src={pieceSrc(promo.color, k)} alt={k} draggable={false} />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
