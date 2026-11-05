// Full screen on both builds:
// - APK: a small local Android plugin (FullscreenPlugin.java) hides the status
//   and navigation bars; the choice is saved and applied again at start/resume.
// - Web: the browser Fullscreen API (needs a tap, so it is not restored on reload).
import { registerPlugin } from '@capacitor/core';
import { isNative } from './native';

interface FullscreenNative {
  set(o: { on: boolean }): Promise<{ on: boolean }>;
}
const Native = registerPlugin<FullscreenNative>('Fullscreen');

export const fullscreenSupported: boolean =
  isNative || (typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function');

export function isWebFullscreen(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenElement;
}

export async function setFullscreen(on: boolean): Promise<boolean> {
  try {
    if (isNative) {
      await Native.set({ on });
      return on;
    }
    if (on && !document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    if (!on && document.fullscreenElement) await document.exitFullscreen();
    return isWebFullscreen();
  } catch {
    return isNative ? !on : isWebFullscreen();
  }
}

/** Calls back whenever the web page enters or leaves full screen (Esc, F11, our button). */
export function onWebFullscreenChange(fn: (on: boolean) => void): () => void {
  if (isNative || typeof document === 'undefined') return () => undefined;
  const h = () => fn(isWebFullscreen());
  document.addEventListener('fullscreenchange', h);
  return () => document.removeEventListener('fullscreenchange', h);
}
