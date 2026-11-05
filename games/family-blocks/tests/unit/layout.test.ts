import { describe, expect, it } from 'vitest';
import { computeLayout, PORTRAIT_CONTROLS_H } from '../../src/render/canvas';
import { defaultData, validateData } from '../../src/storage/schema';

describe('portrait layout (family request: play upright)', () => {
  for (const [w, h] of [[533, 853], [600, 960], [800, 1280]]) {
    it(`${w}x${h}: portrait, board fits between the top bar and the touch buttons`, () => {
      const L = computeLayout(w, h);
      expect(L.mode).toBe('portrait');
      expect(L.by).toBeGreaterThanOrEqual(58);
      expect(L.by + L.cell * 20).toBeLessThanOrEqual(h - PORTRAIT_CONTROLS_H);
      expect(L.bx).toBeGreaterThanOrEqual(L.railW / 2);
      expect(L.bx + L.cell * 10).toBeLessThanOrEqual(w - L.railW / 2);
      expect(L.cell).toBeGreaterThanOrEqual(25); // bigger than the old landscape board at 853x533
    });
  }
  it('landscape sizes keep the original layout', () => {
    expect(computeLayout(853, 533)).toMatchObject({ mode: 'landscape', cell: 25 });
    expect(computeLayout(1280, 800).mode).toBe('landscape');
  });
});

describe('full screen setting', () => {
  it('off by default and validated per player', () => {
    const d = defaultData();
    expect(d.profiles.every((p) => p.settings.fullscreen === false)).toBe(true);
    (d.profiles[0].settings as unknown as Record<string, unknown>).fullscreen = true;
    (d.profiles[1].settings as unknown as Record<string, unknown>).fullscreen = 'yes';
    const v = validateData(d);
    expect(v.ok && v.data.profiles[0].settings.fullscreen).toBe(true);
    expect(v.ok && v.data.profiles[1].settings.fullscreen).toBe(false);
  });
});
