import type { Lesson } from './types';

export const ENDGAMES: Lesson[] = [
  {
    id: 'eg-kingpawn',
    course: 'endgames',
    title: { ko: '킹과 폰 엔드게임', en: 'King and Pawn Endgames' },
    summary: { ko: '대면(Opposition)과 정사각형 규칙', en: 'The opposition and the rule of the square' },
    steps: [
      {
        fen: '8/8/4k3/8/4K3/8/4P3/8 w - - 0 1',
        text: { ko: '두 킹이 한 칸을 사이에 두고 마주 보는 것을 대면(Opposition)이라고 합니다. 이때 수를 둬야 하는 쪽이 비켜서야 하므로 불리합니다.', en: 'When kings face each other with one square between them, that is the opposition. The side that must move has to give way.' },
        highlights: ['e4', 'e6'],
      },
      {
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        text: { ko: '백 킹이 폰 앞 6랭크에 있으면 이깁니다. 폰을 지키며 흑 킹을 밀어내는 수를 두세요.', en: 'With the king on the 6th rank in front of its pawn, White wins. Push the black king aside while guarding the pawn.' },
        task: { accept: ['Kd6', 'Kf6'], success: { ko: '좋습니다. 킹이 길을 열고 폰이 따라갑니다.', en: 'Good. The king clears the way and the pawn follows.' } },
      },
      {
        fen: '8/8/1k6/8/8/8/6P1/7K w - - 0 1',
        text: { ko: '정사각형 규칙: 폰에서 승격 칸까지 그린 정사각형 안에 상대 킹이 들어오지 못하면 폰이 이깁니다. 폰을 전진시키세요.', en: 'Rule of the square: if the enemy king cannot step into the square from the pawn to its promotion rank, the pawn wins. Push it.' },
        task: { accept: ['g4'], success: { ko: 'g4! 정사각형(d4–h8)에 흑 킹이 제때 들어오지 못합니다.', en: 'g4! The black king cannot reach the square (d4–h8) in time.' } },
      },
    ],
  },
  {
    id: 'eg-promotion',
    course: 'endgames',
    title: { ko: '폰 승격', en: 'Pawn Promotion' },
    summary: { ko: '돌파(Breakthrough)와 승격 경주', en: 'Breakthroughs and promotion races' },
    steps: [
      {
        fen: '7k/8/8/8/8/8/2P5/K7 w - - 0 1',
        text: { ko: '폰이 마지막 줄에 도착하면 퀸·룩·비숍·나이트 중 하나로 승격(Promotion)합니다. 대부분 퀸이 가장 강합니다.', en: 'A pawn that reaches the last rank promotes to a queen, rook, bishop or knight. Usually the queen is best.' },
      },
      {
        fen: '7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1',
        text: { ko: '폰 셋 대 셋. 백은 한 폰을 희생해 길을 뚫는 돌파가 있습니다. 가운데 폰부터 움직여 보세요.', en: 'Three pawns against three. White has a breakthrough by sacrificing a pawn. Start with the middle pawn.' },
        task: { accept: ['b6'], success: { ko: 'b6! axb6에는 c6!, cxb6에는 a6!로 한 폰이 반드시 승격합니다.', en: 'b6! After axb6 c6!, or cxb6 a6!, one pawn always promotes.' } },
        demo: 'b6 axb6 c6 bxc6 a6',
      },
      {
        fen: '8/2P5/8/8/8/k7/8/2K5 w - - 0 1',
        text: { ko: '승격할 기물을 골라 보세요. (퀸을 추천합니다)', en: 'Promote the pawn. (The queen is recommended.)' },
        task: { accept: ['c8=Q', 'c8=R'], success: { ko: '승격 완료! 이제 메이트를 향해 갑니다.', en: 'Promoted! Now head for mate.' } },
      },
    ],
  },
  {
    id: 'eg-rookmate',
    course: 'endgames',
    title: { ko: '룩을 활용한 메이트', en: 'Mate with King and Rook' },
    summary: { ko: '룩으로 가두고, 킹으로 다가가기', en: 'Cut off with the rook, approach with the king' },
    steps: [
      {
        fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1',
        text: { ko: '룩은 한 줄 전체를 막아 상대 킹을 상자에 가둡니다. 킹이 다가가 상자를 줄이는 것이 기본 방법입니다.', en: 'The rook cuts off a whole line, boxing the enemy king in. Your king walks up and the box shrinks.' },
        arrows: [['a1', 'a4']],
        demo: 'Ra4',
      },
      {
        fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
        text: { ko: '킹이 b6에서 탈출 칸을 막고 있습니다. 한 수로 메이트하세요.', en: 'Your king on b6 covers the escape squares. Mate in one.' },
        task: { accept: ['Rh8#'], mate: true, success: { ko: '룩 메이트 완성!', en: 'Rook mate!' } },
      },
      {
        fen: '3k4/8/3K4/8/8/8/8/7R w - - 0 1',
        text: { ko: '킹끼리 마주 본 상태(대면)에서 룩이 마지막 줄을 막으면 메이트입니다.', en: 'With the kings facing each other, the rook on the back rank mates.' },
        task: { accept: ['Rh8#'], mate: true, success: { ko: '정확합니다!', en: 'Exactly!' } },
      },
    ],
  },
  {
    id: 'eg-queenmate',
    course: 'endgames',
    title: { ko: '퀸을 활용한 메이트', en: 'Mate with King and Queen' },
    summary: { ko: '메이트와 스테일메이트를 구별하기', en: 'Tell mate from stalemate' },
    steps: [
      {
        fen: 'k7/8/2K5/8/8/8/8/1Q6 w - - 0 1',
        text: { ko: '킹이 지키는 칸에 퀸을 붙이면 메이트가 됩니다. 한 수로 메이트하세요.', en: 'A queen next to the enemy king, protected by your king, is mate. Mate in one.' },
        task: { accept: ['Qb7#'], mate: true, success: { ko: '퀸 메이트!', en: 'Queen mate!' } },
      },
      {
        fen: 'k7/8/1K6/8/8/8/8/2Q5 w - - 0 1',
        text: { ko: '조심! Qc7은 체크가 아니어서 흑이 둘 곳이 없는 스테일메이트(무승부)가 됩니다. 메이트하는 수를 찾으세요.', en: 'Careful! Qc7 is not check and leaves Black no move — stalemate, a draw. Find the mate.' },
        task: {
          accept: ['Qc8#'],
          mate: true,
          success: { ko: '메이트! 마지막에는 항상 상대에게 둘 수가 남는지 확인하세요.', en: 'Mate! At the end, always check whether your opponent still has a move.' },
          wrong: { Qc7: { ko: '스테일메이트입니다! 이기던 게임이 무승부가 됩니다.', en: 'Stalemate! A won game becomes a draw.' } },
        },
      },
    ],
  },
  {
    id: 'eg-teamwork',
    course: 'endgames',
    title: { ko: '기본적인 기물 협력', en: 'Pieces Working Together' },
    summary: { ko: '두 룩의 사다리 메이트', en: 'The two-rook ladder mate' },
    steps: [
      {
        fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1',
        text: { ko: '두 룩이 번갈아 한 줄씩 막으면 사다리처럼 킹을 끝줄로 몰 수 있습니다. 한 룩으로 7랭크를 막으세요.', en: 'Two rooks taking turns to cut off one rank drive the king like a ladder. Cut off the 7th rank with one rook.' },
        task: { accept: ['Ra7', 'Rb7'], reply: 'Kf8', success: { ko: '좋습니다. 흑 킹은 8랭크에 갇혔습니다.', en: 'Good. The black king is stuck on the 8th rank.' } },
      },
      {
        fen: '5k2/R7/8/8/8/8/8/1R4K1 w - - 0 1',
        text: { ko: '이제 다른 룩으로 메이트하세요.', en: 'Now mate with the other rook.' },
        task: { accept: ['Rb8#'], mate: true, success: { ko: '사다리 메이트 완성! 두 기물이 서로 도와야 메이트가 됩니다.', en: 'Ladder mate! Mates need pieces that help each other.' } },
      },
    ],
  },
];
