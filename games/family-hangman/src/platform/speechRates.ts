// Pronunciation speed options (pure data, safe to import from storage and tests).
export type SpeechRate = 'slow' | 'normal' | 'fast';
export const SPEECH_RATES: SpeechRate[] = ['slow', 'normal', 'fast'];
/** Engine rate per option (1.0 = the engine's normal speed). */
export const RATE_VALUE: Record<SpeechRate, number> = { slow: 0.6, normal: 0.85, fast: 1.0 };
