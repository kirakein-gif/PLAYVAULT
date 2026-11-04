import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData, Lang, Profile, Settings } from './storage/schema';
import { flushSave, scheduleSave } from './storage/store';
import { makeT, type T } from './i18n/i18n';
import { sound } from './audio/sound';
import { haptic } from './platform/native';
import { pieceUrl, type SkinId } from './skins';

export type Screen =
  | { name: 'home' }
  | { name: 'setup' }
  | { name: 'game'; mode: 'two' | 'ai'; resume?: boolean; startFen?: string; level?: number; playerColor?: 'w' | 'b' }
  | { name: 'review'; gameId: string; ply?: number }
  | { name: 'games' }
  | { name: 'academy' }
  | { name: 'puzzles'; course: 'tactics' | 'checkmate' | 'endgames' | 'all' }
  | { name: 'puzzle'; id: string; list: string[]; daily?: boolean }
  | { name: 'lessons'; course: 'strategy' | 'openings' | 'endgames' | 'rules' }
  | { name: 'lesson'; id: string }
  | { name: 'records' }
  | { name: 'glossary' }
  | { name: 'licenses' };

interface Ctx {
  data: AppData;
  profile: Profile;
  settings: Settings;
  lang: Lang;
  t: T;
  skin: SkinId;
  piece: (code: string) => string;
  stack: Screen[];
  screen: Screen;
  screenKey: number;
  go: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  home: () => void;
  updateProfile: (fn: (p: Profile) => Profile) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setData: (d: AppData) => void;
  setLang: (l: Lang) => void;
  click: () => void;
  feel: (k: 'light' | 'medium' | 'heavy') => void;
  settingsOpen: boolean;
  openSettings: (open: boolean) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  /** screens may register a guard for the back action (e.g. confirm leaving) */
  backGuard: React.MutableRefObject<(() => boolean) | null>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ initial, children }: { initial: AppData; children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(initial);
  const [entries, setStack] = useState<{ s: Screen; k: number }[]>([{ s: { name: 'home' }, k: 0 }]);
  const keySeq = useRef(1);
  const stack = entries.map((e) => e.s);
  const [settingsOpen, openSettings] = useState(false);
  const [toastMsg, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backGuard = useRef<(() => boolean) | null>(null);

  const setData = useCallback((d: AppData) => {
    setDataState(d);
    scheduleSave(d);
  }, []);

  const profile = data.profiles[data.activeProfileId];
  const lang = profile.lang;
  const t = useMemo(() => makeT(lang), [lang]);
  const skin: SkinId = profile.skin ?? 'classic';

  useEffect(() => {
    sound.enabled = data.settings.soundOn;
    sound.setVolume(data.settings.volume);
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle('low-power', data.settings.lowPower);
    document.documentElement.dataset.skin = skin;
  }, [data.settings, lang, skin]);

  useEffect(() => () => void flushSave(), []);

  const updateProfile = useCallback((fn: (p: Profile) => Profile) => {
    setDataState((d) => {
      const nd = { ...d, profiles: { ...d.profiles, [d.activeProfileId]: fn(d.profiles[d.activeProfileId]) } };
      scheduleSave(nd);
      return nd;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDataState((d) => {
      const nd = { ...d, settings: { ...d.settings, ...patch } };
      scheduleSave(nd);
      return nd;
    });
  }, []);

  const value: Ctx = {
    data,
    profile,
    settings: data.settings,
    lang,
    t,
    skin,
    piece: (code) => pieceUrl(skin, code),
    stack,
    screen: stack[stack.length - 1],
    screenKey: entries[entries.length - 1].k,
    go: (s) => setStack((st) => [...st, { s, k: keySeq.current++ }]),
    replace: (s) => setStack((st) => [...st.slice(0, -1), { s, k: keySeq.current++ }]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    home: () => setStack([{ s: { name: 'home' }, k: keySeq.current++ }]),
    updateProfile,
    updateSettings,
    setData,
    setLang: (l) => updateProfile((p) => ({ ...p, lang: l })),
    click: () => {
      sound.unlock();
      sound.play('button');
    },
    feel: (k) => {
      if (data.settings.haptics) void haptic(k);
    },
    settingsOpen,
    openSettings,
    toast: (msg) => {
      setToast(msg);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    },
    toastMsg,
    backGuard,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider missing');
  return c;
}
