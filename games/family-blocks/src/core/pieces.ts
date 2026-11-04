import { KINDS, type Kind } from './config';

export type Point = readonly [number, number];
export interface ActivePiece { kind: Kind; x: number; y: number; rotation: number }
const BASE: Record<Kind, Point[]> = {
  I: [[0,1],[1,1],[2,1],[3,1]],
  O: [[1,0],[2,0],[1,1],[2,1]],
  T: [[1,0],[0,1],[1,1],[2,1]],
  S: [[1,0],[2,0],[0,1],[1,1]],
  Z: [[0,0],[1,0],[1,1],[2,1]],
  J: [[0,0],[0,1],[1,1],[2,1]],
  L: [[2,0],[0,1],[1,1],[2,1]],
};
export function shape(kind: Kind, rotation: number): Point[] {
  if (kind === 'O') return BASE.O.map(([x,y]) => [x,y]);
  const size = kind === 'I' ? 4 : 3;
  let pts = BASE[kind].map(([x,y]): Point => [x,y]);
  for (let i=0; i<((rotation%4)+4)%4; i++) pts = pts.map(([x,y]): Point => [size-1-y,x]);
  return pts;
}
export function blocks(piece: ActivePiece): Point[] {
  return shape(piece.kind,piece.rotation).map(([x,y]): Point => [x+piece.x,y+piece.y]);
}
export function spawn(kind: Kind): ActivePiece {
  // New pieces appear in visible row 2 immediately (rows 0 and 1 are hidden).
  // beginPiece() falls back to hidden rows only when this entrance is blocked.
  return { kind, x: 3, y: 1, rotation: 0 };
}
// Super Rotation System (SRS) wall offsets, documented by Hard Drop Wiki ("SRS").
// Coordinates here use downward-positive y, opposite the reference's y-up axes.
// The square piece intentionally does not kick.
const JLSTZ: Record<string,Point[]> = {
  '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};
const I_KICKS: Record<string,Point[]> = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '1>0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '2>1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};
export function kicks(kind: Kind, from: number, to: number): Point[] {
  if (kind === 'O') return [[0,0]];
  return (kind === 'I' ? I_KICKS : JLSTZ)[String(from)+'>'+String(to)] ?? [[0,0]];
}
// Stable 7-kind set is exported for validation without a dependency on rendering.
export const ALL_KINDS: readonly Kind[] = KINDS;
