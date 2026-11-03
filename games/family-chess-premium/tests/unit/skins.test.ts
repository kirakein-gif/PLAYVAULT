import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SKINS, pieceUrl, isSkin } from '../../src/skins';
import { defaultData, validateData } from '../../src/storage/schema';

const pub = join(__dirname, '../../public');

describe('skins', () => {
  it('every skin has all 12 piece images, each a non-empty SVG', () => {
    for (const s of SKINS)
      for (const c of ['w', 'b'])
        for (const p of 'KQRBNP') {
          const f = join(pub, pieceUrl(s.id, `${c}${p}`));
          expect(existsSync(f), f).toBe(true);
          expect(readFileSync(f, 'utf8')).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
        }
  });
  it('classic keeps the original paths', () => {
    expect(pieceUrl('classic', 'wK')).toBe('pieces/wK.svg');
    expect(pieceUrl('wizard', 'bN')).toBe('pieces/wizard/bN.svg');
  });
  it('skin is stored per profile and invalid values fall back to classic', () => {
    const d = defaultData();
    expect(d.profiles.p1.skin).toBe('classic');
    d.profiles.p2.skin = 'wizard';
    const v = validateData(JSON.parse(JSON.stringify(d)));
    expect(v.ok && v.data.profiles.p2.skin).toBe('wizard');
    expect(v.ok && v.data.profiles.p1.skin).toBe('classic');
    (d.profiles.p1 as unknown as Record<string, unknown>).skin = 'neon';
    const w = validateData(JSON.parse(JSON.stringify(d)));
    expect(w.ok && w.data.profiles.p1.skin).toBe('classic');
    expect(isSkin('gothic')).toBe(true);
    expect(isSkin('neon')).toBe(false);
  });
  it('skin names exist in both languages', () => {
    for (const s of SKINS) {
      expect(s.name.ko.length && s.name.en.length).toBeTruthy();
      expect(s.desc.ko.length && s.desc.en.length).toBeTruthy();
    }
  });
});
