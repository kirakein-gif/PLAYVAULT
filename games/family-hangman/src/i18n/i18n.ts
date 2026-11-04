import ko from './ko.json';
import en from './en.json';
import type { Lang } from '../storage/schema';

export const DICTS: Record<Lang, unknown> = { ko, en };

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export type Params = Record<string, string | number>;

export function translate(lang: Lang, key: string, params?: Params): string {
  const raw = lookup(DICTS[lang], key) ?? lookup(DICTS.ko, key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
}

export type T = (key: string, params?: Params) => string;
export const makeT = (lang: Lang): T => (key, params) => translate(lang, key, params);

/** Text that exists in both languages inline (lessons, glossary). */
export interface Bi { ko: string; en: string }
export const bi = (lang: Lang, b: Bi) => b[lang];
export const other = (lang: Lang): Lang => (lang === 'ko' ? 'en' : 'ko');

/** Flattens all keys of a dictionary (used by tests for ko/en parity). */
export function allKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => allKeys(v, prefix ? `${prefix}.${k}` : k));
}
