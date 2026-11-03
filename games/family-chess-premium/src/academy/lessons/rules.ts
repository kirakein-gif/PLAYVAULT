import type { Lesson } from './types';

// Optional help on how the pieces move (the academy assumes players know this).
export const RULES: Lesson[] = [
  {
    id: 'rl-pieces',
    course: 'rules',
    title: { ko: '기물 이동 도움말', en: 'How the Pieces Move' },
    summary: { ko: '필요할 때만 열어 보는 규칙 정리', en: 'A quick reference when you need it' },
    steps: [
      { fen: '8/8/8/8/3K4/8/8/7k w - - 0 1', text: { ko: '킹(King): 모든 방향으로 한 칸. 공격받는 칸으로는 갈 수 없습니다.', en: 'King: one square in any direction, never onto an attacked square.' }, highlights: ['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5'] },
      { fen: '7k/8/8/8/3Q4/8/8/K7 w - - 0 1', text: { ko: '퀸(Queen): 가로·세로·대각선으로 원하는 만큼.', en: 'Queen: any distance along ranks, files and diagonals.' }, arrows: [['d4', 'd8'], ['d4', 'h4'], ['d4', 'h8'], ['d4', 'a7']] },
      { fen: '7k/8/8/8/3R4/8/8/K7 w - - 0 1', text: { ko: '룩(Rook): 가로·세로로 원하는 만큼.', en: 'Rook: any distance along ranks and files.' }, arrows: [['d4', 'd8'], ['d4', 'h4'], ['d4', 'd1'], ['d4', 'a4']] },
      { fen: '7k/8/8/8/3B4/8/8/K7 w - - 0 1', text: { ko: '비숍(Bishop): 대각선으로 원하는 만큼. 처음 칸의 색을 벗어나지 못합니다.', en: 'Bishop: any distance diagonally; it stays on its colour.' }, arrows: [['d4', 'h8'], ['d4', 'a7'], ['d4', 'g1'], ['d4', 'b2']] },
      { fen: '7k/8/8/8/3N4/8/8/K7 w - - 0 1', text: { ko: '나이트(Knight): L자로 이동하고 다른 기물을 뛰어넘을 수 있습니다.', en: 'Knight: moves in an L-shape and can jump over pieces.' }, highlights: ['c6', 'e6', 'f5', 'f3', 'e2', 'c2', 'b3', 'b5'] },
      { pre: '', text: { ko: '폰(Pawn): 앞으로 한 칸(처음에는 두 칸까지), 잡을 때는 대각선 앞으로 한 칸.', en: 'Pawn: one square forward (two on its first move); it captures one square diagonally forward.' }, demo: 'e4 d5 exd5' },
      { pre: 'e4 e5 Nf3 Nc6 Bc4 Bc5', text: { ko: '캐슬링(Castling): 킹과 룩이 움직인 적 없고, 사이가 비고, 킹이 체크·통과 칸 공격을 받지 않을 때 킹이 두 칸 옆으로, 룩이 그 반대편으로.', en: 'Castling: if king and rook have not moved, the squares between are empty, and the king is not in or passing through check, the king moves two squares and the rook jumps over it.' }, demo: 'O-O' },
      { pre: 'e4 a6 e5 d5', text: { ko: '앙파상(En passant): 상대 폰이 두 칸 전진해 내 폰 옆에 서면, 바로 다음 수에 한 칸만 온 것처럼 잡을 수 있습니다.', en: 'En passant: when an enemy pawn jumps two squares to land beside your pawn, you may capture it on the very next move as if it moved one square.' }, demo: 'exd6' },
    ],
  },
];
