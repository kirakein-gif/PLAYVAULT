import { describe, expect, it } from 'vitest';
import { defaultData, missedWords, newProfile, recordSolo, validateData, RECENT_MAX } from '../../src/storage/schema';
import { makeBackup, parseBackup } from '../../src/storage/backup';
import { allKeys, DICTS, translate } from '../../src/i18n/i18n';
import { RATE_VALUE } from '../../src/platform/speechRates';

describe('records', () => {
  it('recordSolo counts wins, streaks, best stars and the recent list', () => {
    let p = newProfile('p1', 'A');
    p = recordSolo(p, 'cat', true, 3);
    p = recordSolo(p, 'dog', true, 2);
    expect(p.stats).toMatchObject({ played: 2, won: 2, streak: 2, bestStreak: 2 });
    p = recordSolo(p, 'pig', false, 0);
    expect(p.stats).toMatchObject({ played: 3, won: 2, streak: 0, bestStreak: 2 });
    p = recordSolo(p, 'cat', true, 1);
    expect(p.words.cat).toMatchObject({ played: 2, won: 2, bestStars: 3, last: 'won' });
    expect(p.recent).toEqual(['dog', 'pig', 'cat']);
    expect(missedWords(p)).toEqual(['pig']);
    p = recordSolo(p, 'pig', true, 2);
    expect(missedWords(p)).toEqual([]);
  });

  it('recent list is capped', () => {
    let p = newProfile('p1', 'A');
    for (let i = 0; i < RECENT_MAX + 10; i++) p = recordSolo(p, `w${'a'.repeat((i % 20) + 1)}${i}`.replace(/\d/g, (d) => 'abcdefghij'[+d]), true, 1);
    expect(p.recent.length).toBe(RECENT_MAX);
  });
});

describe('storage', () => {
  it('default data validates', () => {
    const v = validateData(defaultData());
    expect(v.ok).toBe(true);
  });

  it('repairs bad fields instead of failing', () => {
    const d = defaultData() as unknown as Record<string, any>;
    d.settings = { soundOn: 'yes', volume: 9 };
    d.profiles.p1.level = 'insane';
    d.profiles.p1.category = 'cars';
    d.profiles.p1.words = { cat: { played: -3, won: 'x', bestStars: 9, last: 'won' }, 'NOT A WORD': {} };
    d.profiles.p1.stats = { played: 'many' };
    const v = validateData(d);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.data.settings.soundOn).toBe(true);
    expect(v.data.settings.volume).toBe(0.8);
    expect(v.data.profiles.p1.level).toBe('easy');
    expect(v.data.profiles.p1.category).toBe('all');
    expect(Object.keys(v.data.profiles.p1.words)).toEqual(['cat']);
    expect(v.data.profiles.p1.words.cat).toMatchObject({ played: 0, won: 0, bestStars: 3 });
    expect(v.data.profiles.p1.stats.played).toBe(0);
  });

  it('picture: balloon by default, classic kept, anything else repaired', () => {
    const d = defaultData() as unknown as Record<string, any>;
    expect(d.profiles.p1.picture).toBe('balloon');
    d.profiles.p1.picture = 'classic';
    d.profiles.p2.picture = 'gallows3d';
    const v = validateData(d);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.data.profiles.p1.picture).toBe('classic');
    expect(v.data.profiles.p2.picture).toBe('balloon');
    // data saved before this option existed
    delete d.profiles.p1.picture;
    const old = validateData(d);
    expect(old.ok && old.data.profiles.p1.picture).toBe('balloon');
  });

  it('speech rate: normal by default, valid choices kept, others repaired', () => {
    const d = defaultData() as unknown as Record<string, any>;
    expect(d.profiles.p1.speechRate).toBe('normal');
    d.profiles.p1.speechRate = 'slow';
    d.profiles.p2.speechRate = 'turbo';
    const v = validateData(d);
    expect(v.ok && v.data.profiles.p1.speechRate).toBe('slow');
    expect(v.ok && v.data.profiles.p2.speechRate).toBe('normal');
    expect(RATE_VALUE.slow).toBeLessThan(RATE_VALUE.normal);
    expect(RATE_VALUE.normal).toBeLessThan(RATE_VALUE.fast);
  });

  it('rejects broken or foreign data', () => {
    expect(validateData(null).ok).toBe(false);
    expect(validateData({ schema: 99, profiles: {}, profileOrder: [] }).ok).toBe(false);
    expect(validateData({ schema: 1, profiles: {}, profileOrder: [] }).ok).toBe(false);
  });

  it('backup round trip keeps records; other apps and junk are refused', () => {
    const d = defaultData();
    d.profiles.p1 = recordSolo(d.profiles.p1, 'zebra', true, 3);
    const r = parseBackup(JSON.stringify(makeBackup(d, '1.0.0')));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.profiles.p1.words.zebra.won).toBe(1);
    expect(parseBackup('not json')).toEqual({ ok: false, error: 'notJson' });
    expect(parseBackup(JSON.stringify({ app: 'family-chess-premium', data: d }))).toEqual({ ok: false, error: 'wrongApp' });
  });
});

describe('i18n', () => {
  it('Korean and English have the same keys', () => {
    expect(allKeys(DICTS.en).sort()).toEqual(allKeys(DICTS.ko).sort());
  });
  it('fills parameters', () => {
    expect(translate('ko', 'game.lives', { n: 3 })).toBe('풍선 3개 남음');
    expect(translate('en', 'game.lives', { n: 3 })).toBe('3 balloons left');
  });
});
