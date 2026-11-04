// Pronounces English words with the device's own text-to-speech engine.
// APK: Android TextToSpeech through @capacitor-community/text-to-speech (no
// INTERNET permission; works offline once the engine has English voice data).
// Web: the browser's speechSynthesis. Nothing is downloaded by the app itself.
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { isNative } from './native';

import { RATE_VALUE, type SpeechRate } from './speechRates';
export { RATE_VALUE, SPEECH_RATES, type SpeechRate } from './speechRates';
const LANG = 'en-US';

export type SpeechStatus = 'checking' | 'ready' | 'missing';

let cached: Promise<SpeechStatus> | null = null;

function webVoices(): Promise<SpeechSynthesisVoice[]> {
  const s = window.speechSynthesis;
  const now = s.getVoices();
  if (now.length) return Promise.resolve(now);
  // Chrome fills the list asynchronously
  return new Promise((resolve) => {
    const done = () => resolve(s.getVoices());
    s.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1500);
  });
}

async function check(): Promise<SpeechStatus> {
  try {
    if (isNative) {
      // the Android engine needs a moment after start-up; try a few times
      for (let i = 0; i < 4; i++) {
        try {
          const { supported } = await TextToSpeech.isLanguageSupported({ lang: LANG });
          return supported ? 'ready' : 'missing';
        } catch {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      return 'missing';
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 'missing';
    const voices = await webVoices();
    return voices.some((v) => v.lang.toLowerCase().startsWith('en')) ? 'ready' : 'missing';
  } catch {
    return 'missing';
  }
}

/** Whether an English voice is available (checked once, then remembered). */
export function speechStatus(force = false): Promise<SpeechStatus> {
  if (!cached || force) cached = check();
  return cached;
}

export async function speak(word: string, rate: SpeechRate): Promise<boolean> {
  const text = word.toLowerCase();
  try {
    if (isNative) {
      await TextToSpeech.stop().catch(() => undefined);
      await TextToSpeech.speak({ text, lang: LANG, rate: RATE_VALUE[rate], pitch: 1.0, volume: 1.0, category: 'playback', queueStrategy: 0 });
      return true;
    }
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG;
    u.rate = RATE_VALUE[rate];
    const en = (await webVoices()).find((v) => v.lang.toLowerCase() === 'en-us') ?? (await webVoices()).find((v) => v.lang.toLowerCase().startsWith('en'));
    if (en) u.voice = en;
    s.speak(u);
    return true;
  } catch {
    return false;
  }
}

/** Opens Android's screen for installing voice data (APK only). */
export async function openVoiceInstall() {
  if (isNative) await TextToSpeech.openInstall().catch(() => undefined);
}
