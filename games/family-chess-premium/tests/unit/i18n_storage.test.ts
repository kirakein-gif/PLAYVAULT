import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ko from '../../src/i18n/ko.json';
import en from '../../src/i18n/en.json';
import { allKeys, translate } from '../../src/i18n/i18n';
import { defaultData, validateData, SCHEMA_VERSION } from '../../src/storage/schema';
import { makeBackup, parseBackup } from '../../src/storage/backup';
import { recordAttempt } from '../../src/academy/progressManager';
import { GLOSSARY } from '../../src/academy/glossary';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('Korean / English texts', () => {
  it('both dictionaries have exactly the same keys', () => {
    expect(allKeys(en).sort()).toEqual(allKeys(ko).sort());
  });
  it('every literal t("...") key used in the source exists', () => {
    const keys = new Set(allKeys(ko));
    const missing: string[] = [];
    for (const f of walk(join(__dirname, '../../src'))) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) if (!keys.has(m[1])) missing.push(`${f}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });
  it('fills parameters', () => {
    expect(translate('ko', 'academy.solvedOf', { solved: 3, total: 10 })).toBe('3/10 해결');
    expect(translate('en', 'academy.solvedOf', { solved: 3, total: 10 })).toBe('3/10 solved');
  });
  it('glossary covers the requested core terms in both languages', () => {
    const en2 = GLOSSARY.map((g) => g.en);
    for (const term of ['Knight', 'Bishop', 'Checkmate', 'Fork', 'Pin', 'Sacrifice', 'Attack', 'Defense']) expect(en2).toContain(term);
  });
});

describe('local data, versioning, backup', () => {
  it('default data has two independent profiles', () => {
    const d = defaultData();
    expect(d.schema).toBe(SCHEMA_VERSION);
    expect(d.profileOrder).toEqual(['p1', 'p2']);
    d.profiles.p1.puzzles.X = recordAttempt(undefined, { solved: true, mistakes: 0, hintsUsed: 0 });
    expect(d.profiles.p2.puzzles.X).toBeUndefined();
  });
  it('backup round trip keeps every record', () => {
    const d = defaultData();
    d.profiles.p2.name = '아들';
    d.profiles.p2.lang = 'en';
    d.profiles.p2.favorites = ['FCP-001'];
    d.profiles.p2.puzzles['FCP-001'] = recordAttempt(undefined, { solved: true, mistakes: 1, hintsUsed: 0 });
    const r = parseBackup(JSON.stringify(makeBackup(d, '1.0.0')));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.profiles.p2.name).toBe('아들');
      expect(r.data.profiles.p2.lang).toBe('en');
      expect(r.data.profiles.p2.puzzles['FCP-001'].best).toBe(2);
      expect(r.summary.profiles).toEqual(['플레이어 1', '아들']);
    }
  });
  it('rejects files that are not valid backups', () => {
    expect(parseBackup('nope')).toEqual({ ok: false, error: 'notJson' });
    expect(parseBackup(JSON.stringify({ app: 'other' }))).toEqual({ ok: false, error: 'wrongApp' });
    const newer = { ...makeBackup(defaultData(), '9'), data: { ...defaultData(), schema: SCHEMA_VERSION + 1 } };
    expect(parseBackup(JSON.stringify(newer))).toEqual({ ok: false, error: 'newerSchema' });
    const broken = makeBackup(defaultData(), '1');
    (broken.data.profiles as Record<string, unknown>).p1 = 5;
    expect(parseBackup(JSON.stringify(broken))).toEqual({ ok: false, error: 'badProfile' });
  });
  it('repairs missing fields from older/partial data', () => {
    const v = validateData({ schema: 1, activeProfileId: 'zz', profileOrder: ['p1'], profiles: { p1: { name: 'A' } } });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.data.activeProfileId).toBe('p1');
      expect(v.data.profiles.p1.puzzles).toEqual({});
      expect(v.data.settings.soundOn).toBe(true);
    }
  });
});
