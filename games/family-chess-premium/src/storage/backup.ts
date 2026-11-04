// JSON backup / restore. The file is plain JSON so it can be inspected.
import { APP_ID, SCHEMA_VERSION, validateData, type AppData } from './schema';

export interface BackupFile {
  app: string;
  schema: number;
  exportedAt: string;
  appVersion: string;
  data: AppData;
}

export function makeBackup(data: AppData, appVersion: string): BackupFile {
  return { app: APP_ID, schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), appVersion, data };
}

export function backupFileName(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `family-chess-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
}

export function parseBackup(text: string): { ok: true; data: AppData; summary: { profiles: string[]; exportedAt: string } } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  const f = raw as Partial<BackupFile>;
  if (!f || f.app !== APP_ID) return { ok: false, error: 'wrongApp' };
  const v = validateData(f.data);
  if (!v.ok) return v;
  return {
    ok: true,
    data: v.data,
    summary: { profiles: v.data.profileOrder.map((id) => v.data.profiles[id].name), exportedAt: String(f.exportedAt ?? '') },
  };
}
