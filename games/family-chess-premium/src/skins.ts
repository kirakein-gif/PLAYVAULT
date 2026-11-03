// Board + piece skins.
// - 'classic' keeps the original files at pieces/*.svg so existing paths never change.
// - Built-in skin 'wizard' uses SVG pieces in pieces/<id>/ and board
//   textures bundled through board.css (html[data-skin=...]).
// - Added skins (e.g. Codex's image-based sets) only need an entry here: pieces in
//   any web image format and optional board textures, all under public/.
//   See docs/CODEX_TASK_SKINS.md.
import type { Bi } from './i18n/i18n';

export type SkinId = string;

export interface SkinBoard {
  /** paths relative to public/, e.g. 'skins/wizard-codex/board-light.webp' */
  light: string;
  dark: string;
  frame?: string;
  /** coordinate letter colour on the frame, e.g. '#c3c5c9' */
  coord?: string;
  /** thin line around the squares, e.g. 'rgba(170,172,176,0.55)' */
  outline?: string;
}

export interface Skin {
  id: SkinId;
  /** display name — English in both languages (family decision 2026-11-03) */
  name: Bi;
  desc: Bi;
  /** who made it (kept for the record; not shown in the app since the family chose) */
  author?: 'Claude' | 'Codex';
  /** piece images: `${dir}/${code}.${ext}`, code like 'wK'. Default: pieces/<id>/*.svg */
  pieces?: { dir: string; ext: 'svg' | 'webp' | 'png' };
  /** board textures; built-in skins style the board in board.css instead */
  board?: SkinBoard;
  /**
   * Optional detailed illustrations for the main menu cards (decoration only,
   * never used on the board). Paths relative to public/. When missing, pieces are shown.
   */
  menuArt?: { two?: string; ai?: string; academy?: string };
}

export const SKINS: Skin[] = [
  { id: 'classic', author: 'Claude', name: { ko: 'Classic', en: 'Classic' }, desc: { ko: '아이보리·흑단 기물, 월넛 원목 판', en: 'Ivory and ebony on a walnut board' }, pieces: { dir: 'pieces', ext: 'svg' } },
  { id: 'wizard', author: 'Claude', name: { ko: 'Magic', en: 'Magic' }, desc: { ko: '회색·검정 석상 기물, 대리석 판', en: 'Carved stone figures on a marble floor' } },
  // Codex skins are appended here by the Codex task (see docs/CODEX_TASK_SKINS.md).
  {
    id: 'gothic-codex', author: 'Codex',
    name: { ko: 'Gothic', en: 'Gothic' },
    desc: { ko: '간결한 첨탑 기물과 차분한 보라 석판', en: 'Simple spired pieces on muted violet slate' },
    pieces: { dir: 'skins/gothic-codex', ext: 'webp' },
    board: { light: 'skins/gothic-codex/board-light.webp', dark: 'skins/gothic-codex/board-dark.webp', coord: '#d0c8db', outline: 'rgba(171,159,190,0.55)' },
  },
];

export const skinById = (id: string): Skin | undefined => SKINS.find((s) => s.id === id);
export const isSkin = (v: unknown): v is SkinId => typeof v === 'string' && !!skinById(v);

/** code like "wK" (colour + upper-case piece letter) */
export function pieceUrl(skin: SkinId, code: string): string {
  const s = skinById(skin);
  if (!s) return `pieces/${code}.svg`;
  const p = s.pieces ?? { dir: `pieces/${s.id}`, ext: 'svg' as const };
  return `${p.dir}/${code}.${p.ext}`;
}
