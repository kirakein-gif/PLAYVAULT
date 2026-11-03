// Board + piece skins. 'classic' keeps the original files at pieces/*.svg so
// existing paths never change; other skins live in pieces/<skin>/.
import type { Bi } from './i18n/i18n';

export type SkinId = 'classic' | 'wizard' | 'gothic';

export interface Skin {
  id: SkinId;
  name: Bi;
  desc: Bi;
  /**
   * Optional detailed illustrations for the main menu cards (decoration only,
   * never used on the board). Paths are relative to public/, e.g.
   * 'art/wizard/menu-two.webp'. When missing, the SVG pieces are shown.
   * See docs/CODEX_TASK_SKIN_ART.md.
   */
  menuArt?: { two?: string; ai?: string; academy?: string };
}

export const SKINS: Skin[] = [
  { id: 'classic', name: { ko: '클래식 원목', en: 'Classic Walnut' }, desc: { ko: '아이보리·흑단 기물, 월넛 원목 판', en: 'Ivory and ebony on a walnut board' } },
  { id: 'wizard', name: { ko: '마법사의 석실', en: 'Wizard Stone' }, desc: { ko: '회색·검정 석상 기물, 대리석 판', en: 'Carved stone figures on a marble floor' } },
  { id: 'gothic', name: { ko: '고딕 성채', en: 'Gothic Keep' }, desc: { ko: '달빛 석재·흑철 기물, 고딕 석판', en: 'Moonstone and black iron in a gothic hall' } },
];

export const isSkin = (v: unknown): v is SkinId => v === 'classic' || v === 'wizard' || v === 'gothic';

/** code like "wK" (colour + upper-case piece letter) */
export function pieceUrl(skin: SkinId, code: string): string {
  return skin === 'classic' ? `pieces/${code}.svg` : `pieces/${skin}/${code}.svg`;
}
