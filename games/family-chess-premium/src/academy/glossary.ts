import type { Bi } from '../i18n/i18n';

export interface Term { ko: string; en: string; desc: Bi }

/** Bilingual chess vocabulary (shown in both languages regardless of UI language). */
export const GLOSSARY: Term[] = [
  { ko: '킹', en: 'King', desc: { ko: '잡히면(메이트) 지는 가장 중요한 기물', en: 'The most important piece; checkmate it to win' } },
  { ko: '퀸', en: 'Queen', desc: { ko: '가장 강한 기물(약 9점)', en: 'The strongest piece (about 9 points)' } },
  { ko: '룩', en: 'Rook', desc: { ko: '가로·세로로 움직이는 기물(약 5점)', en: 'Moves along ranks and files (about 5 points)' } },
  { ko: '비숍', en: 'Bishop', desc: { ko: '대각선으로 움직이는 기물(약 3점)', en: 'Moves diagonally (about 3 points)' } },
  { ko: '나이트', en: 'Knight', desc: { ko: 'L자로 뛰는 기물(약 3점)', en: 'Jumps in an L-shape (about 3 points)' } },
  { ko: '폰', en: 'Pawn', desc: { ko: '앞으로 전진하는 기물(1점)', en: 'Marches forward (1 point)' } },
  { ko: '체크', en: 'Check', desc: { ko: '킹이 공격받는 상태', en: 'The king is under attack' } },
  { ko: '체크메이트', en: 'Checkmate', desc: { ko: '체크를 피할 수 없는 상태 — 게임 끝', en: 'Check that cannot be escaped — game over' } },
  { ko: '스테일메이트', en: 'Stalemate', desc: { ko: '체크는 아니지만 둘 수가 없는 상태 — 무승부', en: 'No legal move but not in check — a draw' } },
  { ko: '포크', en: 'Fork', desc: { ko: '한 기물이 두 기물 이상을 동시에 공격', en: 'One piece attacks two or more pieces at once' } },
  { ko: '핀', en: 'Pin', desc: { ko: '뒤의 더 중요한 기물 때문에 움직이지 못하는 기물', en: 'A piece that cannot move because of a more valuable piece behind it' } },
  { ko: '스큐어', en: 'Skewer', desc: { ko: '앞의 큰 기물을 공격해 비키게 하고 뒤의 기물을 얻음', en: 'Attack a big piece so it moves and win the piece behind' } },
  { ko: '발견 공격', en: 'Discovered attack', desc: { ko: '한 기물이 비켜서며 뒤 기물의 공격 길을 여는 것', en: 'Moving one piece to unmask another piece’s attack' } },
  { ko: '이중 공격', en: 'Double attack', desc: { ko: '한 수로 두 개의 위협을 만드는 것', en: 'One move that creates two threats' } },
  { ko: '희생', en: 'Sacrifice', desc: { ko: '더 큰 이득을 위해 일부러 기물을 내주는 것', en: 'Giving up material on purpose for a bigger gain' } },
  { ko: '공격', en: 'Attack', desc: { ko: '상대 기물이나 킹을 위협하는 것', en: 'Threatening an enemy piece or the king' } },
  { ko: '수비', en: 'Defense', desc: { ko: '위협을 막거나 기물을 지키는 것', en: 'Stopping a threat or protecting a piece' } },
  { ko: '전개', en: 'Development', desc: { ko: '기물을 활동적인 칸으로 꺼내는 것', en: 'Bringing pieces out to active squares' } },
  { ko: '캐슬링', en: 'Castling', desc: { ko: '킹과 룩을 한 번에 움직이는 특수 규칙', en: 'Special move of king and rook together' } },
  { ko: '앙파상', en: 'En passant', desc: { ko: '두 칸 전진한 폰을 지나가며 잡는 특수 규칙', en: 'Special pawn capture “in passing”' } },
  { ko: '승격', en: 'Promotion', desc: { ko: '끝줄에 도착한 폰이 다른 기물로 바뀌는 것', en: 'A pawn on the last rank becomes another piece' } },
  { ko: '오프닝', en: 'Opening', desc: { ko: '게임의 시작 단계', en: 'The first phase of the game' } },
  { ko: '미들게임', en: 'Middlegame', desc: { ko: '전개가 끝난 뒤의 중반', en: 'The phase after development' } },
  { ko: '엔드게임', en: 'Endgame', desc: { ko: '기물이 적게 남은 마지막 단계', en: 'The final phase with few pieces left' } },
  { ko: '대면', en: 'Opposition', desc: { ko: '두 킹이 한 칸 사이로 마주 보는 상태', en: 'Kings facing each other with one square between' } },
  { ko: '열린 파일', en: 'Open file', desc: { ko: '폰이 없는 세로줄', en: 'A file with no pawns' } },
  { ko: '고립 폰', en: 'Isolated pawn', desc: { ko: '옆 파일에 같은 편 폰이 없는 폰', en: 'A pawn with no friendly pawns on the files beside it' } },
  { ko: '무승부', en: 'Draw', desc: { ko: '승패 없이 끝난 게임', en: 'A game with no winner' } },
  { ko: '기권', en: 'Resign', desc: { ko: '스스로 패배를 인정하는 것', en: 'Giving up the game' } },
  { ko: '기보', en: 'Game score (PGN)', desc: { ko: '둔 수를 기록한 것', en: 'The written record of the moves' } },
];
