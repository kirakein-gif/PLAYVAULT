export const BOARD_W = 10;
export const VISIBLE_H = 20;
export const HIDDEN_H = 2;
export const BOARD_H = VISIBLE_H + HIDDEN_H;
export type Mode = 'gentle' | 'challenge' | 'sprint40';
export type Speed = 'slow' | 'normal' | 'fast';
export type Kind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export const KINDS: Kind[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
export const GRAVITY = [60,50,42,35,29,24,20,16,13,10] as const;
export function gravityTicks(level: number): number {
  const l = Math.max(1, Math.floor(level));
  if (l <= 10) return GRAVITY[l - 1];
  if (l <= 13) return 8;
  if (l <= 16) return 6;
  if (l <= 19) return 4;
  return 3;
}
export function repeatTiming(speed: Speed): { delay: number; interval: number } {
  return speed === 'slow' ? {delay:18,interval:4} : speed === 'fast' ? {delay:8,interval:2} : {delay:12,interval:4};
}
export const CLEAR_TICKS = 12;
export const LOCK_TICKS = 30;
export const MAX_LOCK_RESETS = 15;
export const LINE_SCORES = [0,100,300,500,800] as const;
