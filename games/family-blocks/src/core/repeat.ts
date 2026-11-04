import { repeatTiming, type Speed } from './config';
export interface RepeatState { ticks: number; pressed: boolean }
export function repeatStart(s: RepeatState): void {s.pressed=true;s.ticks=0;}
export function repeatStop(s: RepeatState): void {s.pressed=false;s.ticks=0;}
/** First move belongs to pointer/key down. This reports only subsequent repeats. */
export function repeatTick(s: RepeatState, speed: Speed): boolean {
  if(!s.pressed) return false;
  s.ticks++;
  const {delay,interval}=repeatTiming(speed);
  return s.ticks>=delay && (s.ticks-delay)%interval===0;
}
