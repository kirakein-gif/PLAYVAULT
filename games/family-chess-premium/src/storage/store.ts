// Persistence through Capacitor Preferences (Android SharedPreferences; the web
// build falls back to localStorage inside the same plugin). Writes are debounced
// and flushed immediately when the app is paused.
import { Preferences } from '@capacitor/preferences';
import { defaultData, validateData, type AppData } from './schema';

const KEY = 'fcp.data.v1';
const BACKUP_KEY = 'fcp.data.v1.prev';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pending: AppData | null = null;

export async function loadData(): Promise<{ data: AppData; recovered: boolean }> {
  for (const key of [KEY, BACKUP_KEY]) {
    try {
      const { value } = await Preferences.get({ key });
      if (!value) continue;
      const v = validateData(JSON.parse(value));
      if (v.ok) return { data: v.data, recovered: key === BACKUP_KEY };
    } catch {
      /* try the previous copy */
    }
  }
  return { data: defaultData(), recovered: false };
}

async function write(data: AppData) {
  const json = JSON.stringify(data);
  const { value: prev } = await Preferences.get({ key: KEY });
  if (prev) await Preferences.set({ key: BACKUP_KEY, value: prev });
  await Preferences.set({ key: KEY, value: json });
}

export function scheduleSave(data: AppData) {
  pending = data;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void flushSave(), 400);
}

export async function flushSave(): Promise<void> {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  const d = pending;
  pending = null;
  if (d) await write(d);
}

export async function replaceAll(data: AppData) {
  pending = null;
  await write(data);
}
