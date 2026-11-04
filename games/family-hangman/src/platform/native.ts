// Thin wrappers over Capacitor plugins with web fallbacks, so the same source
// runs in the Android APK and in a desktop browser.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const isNative = Capacitor.isNativePlatform();

/** Web build inside the PLAYVAULT site: link back to the game hub (set by `npm run build:web`). */
export const hubUrl: string | undefined = isNative ? undefined : import.meta.env.VITE_HUB_URL || undefined;

export function onBackButton(handler: () => void): () => void {
  if (!isNative) return () => undefined;
  const p = App.addListener('backButton', handler);
  return () => void p.then((h) => h.remove());
}

/** pause = app goes to background (or tab hidden); resume = back to foreground */
export function onLifecycle(onPause: () => void, onResume: () => void): () => void {
  const vis = () => (document.hidden ? onPause() : onResume());
  document.addEventListener('visibilitychange', vis);
  const removers: (() => void)[] = [() => document.removeEventListener('visibilitychange', vis)];
  if (isNative) {
    const a = App.addListener('pause', onPause);
    const b = App.addListener('resume', onResume);
    removers.push(() => void a.then((h) => h.remove()), () => void b.then((h) => h.remove()));
  } else {
    window.addEventListener('pagehide', onPause);
    removers.push(() => window.removeEventListener('pagehide', onPause));
  }
  return () => removers.forEach((r) => r());
}

export function exitApp() {
  if (isNative) void App.exitApp();
}

export async function haptic(kind: 'light' | 'medium' | 'heavy') {
  try {
    if (isNative) await Haptics.impact({ style: kind === 'light' ? ImpactStyle.Light : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy });
    else if (navigator.vibrate) navigator.vibrate(kind === 'light' ? 8 : kind === 'medium' ? 14 : 22);
  } catch {
    /* devices without a vibrator simply skip haptics */
  }
}

/** Saves a text file the user can find later. Returns a human-readable location. */
export async function saveTextFile(name: string, text: string, mime: string): Promise<{ where: string; uri?: string }> {
  if (!isNative) {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return { where: name };
  }
  try {
    const r = await Filesystem.writeFile({ path: `FamilyHangman/${name}`, data: text, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
    return { where: `Documents/FamilyHangman/${name}`, uri: r.uri };
  } catch {
    // fall back to the app's own folder; the user can still share it out
    const r = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Data, encoding: Encoding.UTF8, recursive: true });
    return { where: name, uri: r.uri };
  }
}

export async function shareFile(uri: string, title: string) {
  if (!isNative) return;
  await Share.share({ title, files: [uri] });
}

/** Opens the system file picker and resolves with the chosen file's text. */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      resolve(file ? await file.text() : null);
    };
    input.click();
  });
}
