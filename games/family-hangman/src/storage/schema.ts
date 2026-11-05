// Versioned on-device data model. Bump SCHEMA_VERSION and add a migration step
// in migrate() whenever the shape changes.
import { CATEGORIES, type CategoryId } from '../game/words';
import { LEVELS, type Level } from '../game/hangman';
import { SPEECH_RATES, type SpeechRate } from '../platform/speechRates';

export const SCHEMA_VERSION = 1;
export const APP_ID = 'family-hangman';

export type Lang = 'ko' | 'en';
/** Picture for wrong guesses, chosen per player in Settings. */
export type Picture = 'balloon' | 'classic';
export const PICTURES: Picture[] = ['balloon', 'classic'];

export interface WordRecord {
  played: number;
  won: number;
  bestStars: 0 | 1 | 2 | 3;
  last: 'won' | 'lost';
  lastAt: string;
}

export interface Stats {
  played: number;
  won: number;
  streak: number;
  bestStreak: number;
  twoPlayed: number;
}

export interface Profile {
  id: string;
  name: string;
  lang: Lang;
  level: Level | 'all';
  picture: Picture;
  /** pronunciation speed of the 🔊 button */
  speechRate: SpeechRate;
  category: CategoryId | 'all';
  words: Record<string, WordRecord>;
  recent: string[]; // most recent last, capped at RECENT_MAX
  stats: Stats;
}

export interface Settings {
  soundOn: boolean;
  volume: number; // 0..1
  haptics: boolean;
  lowPower: boolean;
  /** APK: hide Android's status/navigation bars (web full screen is per visit) */
  fullscreen: boolean;
}

export interface AppData {
  schema: number;
  activeProfileId: string;
  profileOrder: string[];
  settings: Settings;
  profiles: Record<string, Profile>;
}

export const RECENT_MAX = 40;

export const DEFAULT_SETTINGS: Settings = { soundOn: true, volume: 0.8, haptics: true, lowPower: false, fullscreen: false };

export function newProfile(id: string, name: string, lang: Lang = 'ko'): Profile {
  return {
    id,
    name,
    lang,
    level: 'easy',
    picture: 'balloon',
    speechRate: 'normal',
    category: 'all',
    words: {},
    recent: [],
    stats: { played: 0, won: 0, streak: 0, bestStreak: 0, twoPlayed: 0 },
  };
}

export function defaultData(): AppData {
  return {
    schema: SCHEMA_VERSION,
    activeProfileId: 'p1',
    profileOrder: ['p1', 'p2'],
    settings: { ...DEFAULT_SETTINGS },
    profiles: { p1: newProfile('p1', '플레이어 1'), p2: newProfile('p2', '플레이어 2') },
  };
}

/** Applies one finished solo round to a profile (pure). */
export function recordSolo(p: Profile, word: string, won: boolean, stars: 0 | 1 | 2 | 3, now = new Date()): Profile {
  const prev = p.words[word];
  const rec: WordRecord = {
    played: (prev?.played ?? 0) + 1,
    won: (prev?.won ?? 0) + (won ? 1 : 0),
    bestStars: Math.max(prev?.bestStars ?? 0, stars) as WordRecord['bestStars'],
    last: won ? 'won' : 'lost',
    lastAt: now.toISOString(),
  };
  const streak = won ? p.stats.streak + 1 : 0;
  return {
    ...p,
    words: { ...p.words, [word]: rec },
    recent: [...p.recent.filter((w) => w !== word), word].slice(-RECENT_MAX),
    stats: { ...p.stats, played: p.stats.played + 1, won: p.stats.won + (won ? 1 : 0), streak, bestStreak: Math.max(p.stats.bestStreak, streak) },
  };
}

/** Words whose most recent result was a miss (the "practice again" list). */
export const missedWords = (p: Profile) => Object.entries(p.words).filter(([, r]) => r.last === 'lost').map(([w]) => w);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : d);

function cleanWords(raw: unknown): Record<string, WordRecord> {
  const out: Record<string, WordRecord> = {};
  if (!isObj(raw)) return out;
  for (const [w, r] of Object.entries(raw)) {
    if (!/^[a-z]{1,20}$/.test(w) || !isObj(r)) continue;
    out[w] = {
      played: num(r.played),
      won: num(r.won),
      bestStars: Math.min(3, num(r.bestStars)) as WordRecord['bestStars'],
      last: r.last === 'won' ? 'won' : 'lost',
      lastAt: typeof r.lastAt === 'string' ? r.lastAt : '',
    };
  }
  return out;
}

/** Validates and normalises untrusted data (storage or an imported backup). */
export function validateData(raw: unknown): { ok: true; data: AppData } | { ok: false; error: string } {
  if (!isObj(raw)) return { ok: false, error: 'notObject' };
  if (typeof raw.schema !== 'number') return { ok: false, error: 'noSchema' };
  if (raw.schema > SCHEMA_VERSION) return { ok: false, error: 'newerSchema' };
  if (!isObj(raw.profiles) || !Array.isArray(raw.profileOrder)) return { ok: false, error: 'noProfiles' };
  const data = migrate(raw);
  const profiles: Record<string, Profile> = {};
  for (const id of data.profileOrder) {
    const p = (data.profiles as Record<string, unknown>)[id];
    if (typeof id !== 'string' || !isObj(p) || typeof p.name !== 'string') return { ok: false, error: 'badProfile' };
    const base = newProfile(id, p.name.slice(0, 24), p.lang === 'en' ? 'en' : 'ko');
    const st: Record<string, unknown> = isObj(p.stats) ? p.stats : {};
    profiles[id] = {
      ...base,
      level: (LEVELS as string[]).includes(p.level as string) || p.level === 'all' ? (p.level as Profile['level']) : 'easy',
      picture: p.picture === 'classic' ? 'classic' : 'balloon',
      speechRate: (SPEECH_RATES as unknown[]).includes(p.speechRate) ? (p.speechRate as SpeechRate) : 'normal',
      category: CATEGORIES.some((c) => c.id === p.category) || p.category === 'all' ? (p.category as Profile['category']) : 'all',
      words: cleanWords(p.words),
      recent: Array.isArray(p.recent) ? (p.recent as unknown[]).filter((x): x is string => typeof x === 'string').slice(-RECENT_MAX) : [],
      stats: { played: num(st.played), won: num(st.won), streak: num(st.streak), bestStreak: num(st.bestStreak), twoPlayed: num(st.twoPlayed) },
    };
  }
  if (!Object.keys(profiles).length) return { ok: false, error: 'noProfiles' };
  const order = data.profileOrder.filter((id) => profiles[id]);
  const s: Record<string, unknown> = isObj(data.settings) ? data.settings : {};
  return {
    ok: true,
    data: {
      schema: SCHEMA_VERSION,
      activeProfileId: profiles[data.activeProfileId] ? data.activeProfileId : order[0],
      profileOrder: order,
      settings: {
        soundOn: typeof s.soundOn === 'boolean' ? s.soundOn : DEFAULT_SETTINGS.soundOn,
        volume: typeof s.volume === 'number' && s.volume >= 0 && s.volume <= 1 ? s.volume : DEFAULT_SETTINGS.volume,
        haptics: typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics,
        lowPower: typeof s.lowPower === 'boolean' ? s.lowPower : DEFAULT_SETTINGS.lowPower,
        fullscreen: typeof s.fullscreen === 'boolean' ? s.fullscreen : DEFAULT_SETTINGS.fullscreen,
      },
      profiles,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(raw: Record<string, any>): AppData {
  // v1 is the first schema; future: if (d.schema === 1) { ...; d.schema = 2 }
  return { ...raw } as AppData;
}
