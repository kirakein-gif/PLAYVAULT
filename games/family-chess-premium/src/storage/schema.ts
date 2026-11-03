// Versioned on-device data model. Bump SCHEMA_VERSION and add a migration step
// in migrate() whenever the shape changes.
export const SCHEMA_VERSION = 1;
export const APP_ID = 'family-chess-premium';

export type Lang = 'ko' | 'en';
export type Stars = 0 | 1 | 2 | 3;
export type AttemptResult = 'stars3' | 'stars2' | 'stars1' | 'failed';

export interface PuzzleRecord {
  attempts: number;
  solved: boolean;
  best: Stars;
  firstSolvedAt: string | null;
  lastAttemptAt: string | null;
  recentMistakes: number; // wrong moves in the most recent attempt
  hintUsed: boolean; // in the most recent attempt
  lastResult: AttemptResult | null;
  history: AttemptResult[]; // most recent last, capped
}

export interface LessonRecord {
  completed: boolean;
  completedAt: string | null;
  lastStep: number;
}

export interface SavedGame {
  id: string;
  mode: 'two' | 'ai';
  date: string;
  pgn: string;
  result: string; // 1-0, 0-1, 1/2-1/2, *
  resultKind: string | null;
  level?: number;
  playerColor?: 'w' | 'b';
  plies: number;
}

export interface InProgressGame {
  mode: 'two' | 'ai';
  startFen: string;
  moves: string[]; // uci
  level?: number;
  playerColor?: 'w' | 'b';
  flipped: boolean;
  savedAt: string;
}

export interface DailyState {
  date: string; // YYYY-MM-DD local
  ids: string[];
  done: string[];
  celebrated: boolean;
}

export interface Profile {
  id: string;
  name: string;
  lang: Lang;
  aiLevel: number;
  aiColor: 'w' | 'b' | 'random';
  skin: 'classic' | 'wizard' | 'gothic';
  puzzles: Record<string, PuzzleRecord>;
  favorites: string[];
  lessons: Record<string, LessonRecord>;
  games: SavedGame[];
  inProgress: InProgressGame | null;
  daily: DailyState | null;
  stats: { gamesPlayed: number; aiWins: number; aiLosses: number; aiDraws: number };
}

export interface Settings {
  soundOn: boolean;
  volume: number; // 0..1
  haptics: boolean;
  lowPower: boolean;
  showCoords: boolean;
  autoRotate: boolean; // two-player: turn the board each move
  showOtherLang: boolean; // bilingual learning line in the academy
}

export interface AppData {
  schema: number;
  activeProfileId: string;
  profileOrder: string[];
  settings: Settings;
  profiles: Record<string, Profile>;
}

export const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  volume: 0.8,
  haptics: true,
  lowPower: false,
  showCoords: true,
  autoRotate: false,
  showOtherLang: true,
};

export function newProfile(id: string, name: string, lang: Lang = 'ko'): Profile {
  return {
    id,
    name,
    lang,
    aiLevel: 2,
    aiColor: 'w',
    skin: 'classic',
    puzzles: {},
    favorites: [],
    lessons: {},
    games: [],
    inProgress: null,
    daily: null,
    stats: { gamesPlayed: 0, aiWins: 0, aiLosses: 0, aiDraws: 0 },
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

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

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
    if (!isObj(p) || typeof p.name !== 'string') return { ok: false, error: 'badProfile' };
    const base = newProfile(id, p.name.slice(0, 24), p.lang === 'en' ? 'en' : 'ko');
    profiles[id] = {
      ...base,
      ...(p as Partial<Profile>),
      id,
      name: base.name,
      lang: base.lang,
      aiLevel: Math.min(5, Math.max(1, Number(p.aiLevel) || 2)),
      skin: p.skin === 'wizard' || p.skin === 'gothic' ? p.skin : 'classic',
      puzzles: isObj(p.puzzles) ? (p.puzzles as Record<string, PuzzleRecord>) : {},
      favorites: Array.isArray(p.favorites) ? (p.favorites as unknown[]).filter((x): x is string => typeof x === 'string') : [],
      lessons: isObj(p.lessons) ? (p.lessons as Record<string, LessonRecord>) : {},
      games: Array.isArray(p.games) ? (p.games as SavedGame[]).filter((g) => isObj(g) && typeof g.pgn === 'string') : [],
      stats: { ...base.stats, ...(isObj(p.stats) ? (p.stats as Profile['stats']) : {}) },
    };
  }
  if (!Object.keys(profiles).length) return { ok: false, error: 'noProfiles' };
  const order = data.profileOrder.filter((id) => profiles[id]);
  return {
    ok: true,
    data: {
      schema: SCHEMA_VERSION,
      activeProfileId: profiles[data.activeProfileId] ? data.activeProfileId : order[0],
      profileOrder: order,
      settings: { ...DEFAULT_SETTINGS, ...(isObj(data.settings) ? (data.settings as Partial<Settings>) : {}) },
      profiles,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(raw: Record<string, any>): AppData {
  const d = { ...raw };
  // v1 is the first schema; future: if (d.schema === 1) { ...; d.schema = 2 }
  return d as AppData;
}
