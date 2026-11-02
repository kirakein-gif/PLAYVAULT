import type { Lesson } from './types';

export const STRATEGY: Lesson[] = [
  {
    id: 'st-center',
    course: 'strategy',
    title: { ko: '중앙 장악', en: 'Control the Centre' },
    summary: { ko: '중앙의 기물과 폰은 더 많은 칸을 지배합니다', en: 'Central pieces and pawns control more squares' },
    steps: [
      {
        pre: '',
        text: { ko: 'd4·e4·d5·e5 네 칸이 중앙(Centre)입니다. 중앙을 차지하면 기물이 양쪽 날개로 빠르게 움직일 수 있습니다.', en: 'd4, e4, d5 and e5 are the centre. Owning it lets your pieces reach both wings quickly.' },
        highlights: ['d4', 'e4', 'd5', 'e5'],
      },
      {
        fen: '7k/8/8/8/4N3/8/8/N6K w - - 0 1',
        text: { ko: 'e4의 나이트는 8칸을 공격하지만 a1 구석의 나이트는 2칸뿐입니다.', en: 'The knight on e4 attacks 8 squares; the knight in the a1 corner only 2.' },
        detail: { ko: '"가장자리의 나이트는 약하다"는 격언이 있습니다. 영어로는 "A knight on the rim is dim."', en: 'The saying goes: "A knight on the rim is dim."' },
        highlights: ['d6', 'f6', 'c5', 'g5', 'c3', 'g3', 'd2', 'f2', 'b3', 'c2'],
      },
      {
        pre: '',
        text: { ko: '첫 수로 폰을 중앙에 세워 보세요.', en: 'Put a pawn in the centre with your first move.' },
        task: {
          accept: ['e4', 'd4'],
          success: { ko: '좋습니다! 중앙 폰이 칸을 지배하고 비숍과 퀸의 길도 열어 줍니다.', en: 'Good! A central pawn controls squares and opens lines for the bishop and queen.' },
          wrong: { a4: { ko: '가장자리 폰은 중앙에 영향을 주지 못합니다.', en: 'An edge pawn does not affect the centre.' }, h4: { ko: '가장자리 폰은 중앙에 영향을 주지 못합니다.', en: 'An edge pawn does not affect the centre.' } },
        },
      },
      {
        pre: 'e4 e5 Nf3 Nc6',
        text: { ko: '백은 d4로 중앙을 열어 공간을 넓힐 수 있습니다. 흑이 exd4로 잡으면 Nxd4로 나이트가 중앙에 섭니다.', en: 'White can strike with d4 to open the centre. After exd4, Nxd4 puts a knight in the middle.' },
        demo: 'd4 exd4 Nxd4',
      },
    ],
  },
  {
    id: 'st-develop',
    course: 'strategy',
    title: { ko: '기물 전개', en: 'Develop Your Pieces' },
    summary: { ko: '나이트와 비숍을 먼저 꺼내고 캐슬링으로 마무리', en: 'Knights and bishops out first, then castle' },
    steps: [
      {
        pre: '',
        text: { ko: '전개(Development)란 처음 자리의 기물을 활동적인 칸으로 옮기는 것입니다. 나이트와 비숍이 먼저입니다.', en: 'Development means bringing pieces from their starting squares to active ones. Knights and bishops come first.' },
        detail: { ko: '오프닝에서는 같은 기물을 두 번 움직이지 않고, 퀸을 너무 일찍 꺼내지 않는 것이 좋습니다.', en: 'In the opening, avoid moving the same piece twice and do not bring the queen out too early.' },
      },
      {
        pre: 'e4 e5',
        text: { ko: '나이트를 전개하면서 흑의 e5 폰을 공격해 보세요.', en: 'Develop a knight and attack Black’s e5 pawn.' },
        task: { accept: ['Nf3'], reply: 'Nc6', success: { ko: '정확합니다. 전개와 공격을 한 번에 했습니다. 흑도 Nc6으로 폰을 지킵니다.', en: 'Exactly — development with a threat. Black defends with Nc6.' } },
      },
      {
        pre: 'e4 e5 Nf3 Nc6',
        text: { ko: '이제 킹 쪽 비숍을 활동적인 칸으로 꺼내세요.', en: 'Now bring the king’s bishop to an active square.' },
        task: { accept: ['Bc4', 'Bb5'], success: { ko: '좋습니다. 비숍이 나오면 캐슬링할 준비도 됩니다.', en: 'Good. With the bishop out you are ready to castle.' } },
      },
      {
        pre: 'e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6',
        text: { ko: '퀸이 일찍 나오면 상대가 기물을 전개하며 퀸을 쫓아냅니다. 흑은 공짜로 두 기물을 전개했습니다.', en: 'An early queen gets chased while the opponent develops. Black has gained two developing moves for free.' },
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bc4 Bc5',
        text: { ko: '킹 쪽이 비었습니다. 캐슬링으로 킹을 안전하게 하고 룩을 활동시키세요.', en: 'The kingside is clear. Castle to protect your king and activate the rook.' },
        task: { accept: ['O-O'], success: { ko: '캐슬링(Castling)은 킹 안전과 룩 전개를 한 번에 해결합니다.', en: 'Castling solves king safety and rook development in one move.' } },
      },
    ],
  },
  {
    id: 'st-king',
    course: 'strategy',
    title: { ko: '왕의 안전', en: 'King Safety' },
    summary: { ko: '폰 방패와 백랭크의 약점', en: 'Pawn shields and the back rank' },
    steps: [
      {
        fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6',
        text: { ko: '캐슬링한 킹 앞의 f·g·h 폰은 방패입니다. 꼭 필요할 때가 아니면 움직이지 않습니다.', en: 'The f, g and h pawns in front of a castled king are its shield. Do not move them without a reason.' },
        highlights: ['f2', 'g2', 'h2', 'f7', 'g7', 'h7'],
      },
      {
        fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
        text: { ko: '흑 킹은 자기 폰에 막혀 8랭크에서 도망칠 수 없습니다. 한 수로 메이트하세요.', en: 'Black’s king is trapped on the back rank by its own pawns. Mate in one.' },
        task: { accept: ['Rd8#'], mate: true, success: { ko: '백랭크 메이트(Back-rank mate)입니다!', en: 'Back-rank mate!' } },
      },
      {
        fen: '6k1/5pp1/7p/8/8/8/5PPP/3R2K1 w - - 0 1',
        text: { ko: '흑이 미리 h6로 "숨구멍(루프트, Luft)"을 만들어 두면 Rd8+에도 Kh7으로 피할 수 있습니다.', en: 'If Black has played h6 in advance — a "luft" — the king escapes to h7 after Rd8+.' },
        demo: 'Rd8+ Kh7',
      },
      {
        fen: 'r1b1k2r/pppp1ppp/2n5/2b1p3/2B1P1nq/2N5/PPPP1PPP/R1BQR1K1 w kq - 0 7',
        text: { ko: '상대 기물이 킹 주변으로 모일 때는 위협을 먼저 확인하세요. 지금 흑은 f2를 노립니다.', en: 'When enemy pieces gather near your king, check the threats first. Black is aiming at f2.' },
        highlights: ['f2'],
        arrows: [['h4', 'f2'], ['g4', 'f2'], ['c5', 'f2']],
        task: {
          accept: ['Re2', 'Rf1', 'Qf3', 'Qe2', 'd4'],
          success: { ko: '좋습니다. 노리는 칸을 지키거나(Re2·Rf1·Qf3·Qe2), d4처럼 공격 기물을 쫓아내 위협을 없앱니다.', en: 'Good. Guard the target square (Re2, Rf1, Qf3, Qe2) or chase an attacker away like d4.' },
        },
      },
    ],
  },
  {
    id: 'st-activity',
    course: 'strategy',
    title: { ko: '기물 활동성', en: 'Piece Activity' },
    summary: { ko: '열린 파일의 룩, 7랭크의 룩', en: 'Rooks on open files and the 7th rank' },
    steps: [
      {
        fen: 'r5k1/ppp1pppp/8/8/8/8/PPP1PPPP/R5K1 w - - 0 1',
        text: { ko: '폰이 하나도 없는 세로줄을 열린 파일(Open file)이라고 합니다. 룩은 열린 파일에서 강합니다. 먼저 차지하세요.', en: 'A file without pawns is an open file. Rooks love open files — take it first.' },
        highlights: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'],
        task: { accept: ['Rd1'], success: { ko: '열린 d파일을 먼저 차지했습니다. 이제 룩이 상대 진영까지 들어갈 수 있습니다.', en: 'You took the open d-file first. Now the rook can invade.' } },
      },
      {
        fen: '6k1/pp3pp1/7p/8/8/8/5PPP/3R2K1 w - - 0 1',
        text: { ko: '7랭크(상대 진영 두 번째 줄)의 룩은 폰들을 옆에서 공격합니다. 룩을 7랭크로 보내세요.', en: 'A rook on the 7th rank attacks pawns from the side. Send your rook there.' },
        task: {
          accept: ['Rd7'],
          success: { ko: 'Rd7! b7, f7 폰을 동시에 노립니다.', en: 'Rd7! It eyes the b7 and f7 pawns at once.' },
          wrong: { 'Rd8+': { ko: 'Rd8+도 나쁜 수는 아니지만, 이번 과제는 7랭크를 차지하는 수입니다.', en: 'Rd8+ is not bad, but this task is about taking the 7th rank.' } },
        },
      },
      {
        fen: '6k1/5ppp/8/8/8/8/5PPP/N5K1 w - - 0 1',
        text: { ko: '가장 나쁜 자리의 기물을 찾아 좋은 칸으로 옮기는 것도 전략입니다. a1의 나이트를 중앙 쪽으로 움직이세요.', en: 'Improving your worst piece is strategy too. Bring the a1 knight toward the centre.' },
        task: { accept: ['Nb3', 'Nc2'], success: { ko: '좋습니다. 나이트는 중앙에 가까울수록 강해집니다.', en: 'Good. A knight grows stronger closer to the centre.' } },
      },
    ],
  },
  {
    id: 'st-weakness',
    course: 'strategy',
    title: { ko: '약점 공략', en: 'Target Weaknesses' },
    summary: { ko: '고립 폰을 막고 공격하기', en: 'Blockade and attack an isolated pawn' },
    steps: [
      {
        fen: '6k1/pp3ppp/8/3p4/8/4PN2/PP3PPP/6K1 w - - 0 1',
        text: { ko: 'd5의 흑 폰은 옆 파일(c·e)에 같은 편 폰이 없는 고립 폰(Isolated pawn)입니다. 폰으로는 지킬 수 없습니다.', en: 'Black’s d5 pawn has no friendly pawns on the c- or e-files: an isolated pawn. No pawn can defend it.' },
        highlights: ['d5'],
      },
      {
        fen: '6k1/pp3ppp/8/3p4/8/4PN2/PP3PPP/6K1 w - - 0 1',
        text: { ko: '고립 폰 바로 앞 칸은 좋은 거점입니다. 나이트로 d4를 차지하세요.', en: 'The square in front of an isolated pawn is a great outpost. Put your knight on d4.' },
        task: { accept: ['Nd4'], success: { ko: 'd4의 나이트는 폰으로 쫓아낼 수 없고 폰의 전진도 막습니다(블록).', en: 'No pawn can chase a knight on d4, and it blocks the pawn.' } },
      },
      {
        fen: '6k1/pp3ppp/8/3p4/8/8/PP3PPP/3R2K1 w - - 0 1',
        text: { ko: '지켜지지 않는 약한 폰은 결국 떨어집니다. 잡아 보세요.', en: 'An undefended weak pawn eventually falls. Take it.' },
        task: { accept: ['Rxd5'], success: { ko: '약점을 계속 공격하면 상대는 지키느라 수동적이 됩니다.', en: 'Keep attacking a weakness and the defender becomes passive.' } },
      },
    ],
  },
  {
    id: 'st-compare',
    course: 'strategy',
    title: { ko: '좋은 수와 나쁜 수 비교', en: 'Good Move vs Bad Move' },
    summary: { ko: '같은 목적, 다른 결과', en: 'Same goal, different results' },
    steps: [
      {
        pre: 'e4 e5 Nf3',
        text: { ko: '백이 e5 폰을 공격합니다. 흑은 Nc6(전개하며 지킴)과 f6(폰으로 지킴) 중 무엇이 좋을까요?', en: 'White attacks e5. Should Black defend with Nc6 (developing) or f6 (a pawn)?' },
        arrows: [['b8', 'c6'], ['f7', 'f6']],
      },
      {
        pre: 'e4 e5 Nf3',
        text: { ko: '좋은 수를 직접 골라 두어 보세요.', en: 'Choose the good move yourself.' },
        orientation: 'b',
        task: {
          accept: ['Nc6', 'd6'],
          success: { ko: '정답! 지키면서 기물도 전개하는 수가 좋은 수입니다.', en: 'Right! Defending while developing is a good move.' },
          wrong: { f6: { ko: 'f6은 킹 앞을 약하게 하고 나이트의 좋은 칸(f6)을 빼앗습니다.', en: 'f6 weakens the king and takes the knight’s best square.' } },
        },
      },
      {
        pre: 'e4 e5 Nf3 f6',
        text: { ko: 'f6을 두면 백은 Nxe5! 희생 후 Qh5+로 흑 킹을 공격할 수 있습니다.', en: 'After f6, White can sacrifice with Nxe5! and attack the king with Qh5+.' },
        demo: 'Nxe5 fxe5 Qh5+ Ke7 Qxe5+ Kf7 Bc4+',
      },
      {
        pre: '',
        text: { ko: '수를 두기 전 세 가지 질문: ① 체크가 있나? ② 잡을 수 있나? ③ 상대는 무엇을 위협하나?', en: 'Before every move ask: 1) Any checks? 2) Any captures? 3) What does my opponent threaten?' },
        detail: { ko: '영어로 "Checks, Captures, Threats"라고 기억하세요. 실수의 대부분은 이 질문을 건너뛸 때 나옵니다.', en: 'Remember "Checks, Captures, Threats". Most blunders happen when we skip these questions.' },
      },
    ],
  },
];
