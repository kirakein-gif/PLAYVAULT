import type { Lesson } from './types';

export const OPENINGS: Lesson[] = [
  {
    id: 'op-principles',
    course: 'openings',
    title: { ko: '오프닝의 기본 원리', en: 'Opening Principles' },
    summary: { ko: '중앙 · 전개 · 캐슬링 · 룩 연결', en: 'Centre · development · castling · connect rooks' },
    steps: [
      {
        pre: '',
        text: { ko: '오프닝의 네 가지 목표: ① 중앙을 차지한다 ② 나이트·비숍을 전개한다 ③ 캐슬링한다 ④ 룩끼리 연결한다.', en: 'Four opening goals: 1) take the centre 2) develop knights and bishops 3) castle 4) connect the rooks.' },
        detail: { ko: '수순을 외우기보다 "왜 이 수를 두는지"를 이해하면 처음 보는 오프닝에서도 좋은 수를 찾을 수 있습니다.', en: 'Understanding why a move is played helps more than memorising it, even in openings you have never seen.' },
      },
      {
        pre: 'e4 e5',
        text: { ko: '중앙 폰을 공격하면서 기물을 전개하는 수를 두어 보세요.', en: 'Develop a piece while attacking a central pawn.' },
        task: { accept: ['Nf3'], success: { ko: 'Nf3은 e5를 공격하고 캐슬링 준비도 합니다.', en: 'Nf3 hits e5 and prepares castling.' } },
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bc4 Bc5 O-O Nf6 d3 O-O Nc3 d6 Bg5 h6 Bh4',
        text: { ko: '양쪽 모두 원리대로 두었습니다. 중앙 폰, 전개된 기물, 캐슬링한 킹을 확인해 보세요. 다음 목표는 퀸을 움직여 룩끼리 연결하는 것입니다.', en: 'Both sides followed the principles: central pawns, developed pieces, castled kings. Next: move the queen so the rooks connect.' },
      },
    ],
  },
  {
    id: 'op-italian',
    course: 'openings',
    title: { ko: '이탈리안 게임', en: 'Italian Game' },
    summary: { ko: '1.e4 e5 2.Nf3 Nc6 3.Bc4 — f7을 노린다', en: '1.e4 e5 2.Nf3 Nc6 3.Bc4 — aiming at f7' },
    steps: [
      {
        pre: 'e4 e5 Nf3 Nc6',
        text: { ko: '비숍을 c4로 보내 흑의 가장 약한 칸 f7(킹만 지키는 칸)을 겨냥하세요.', en: 'Send the bishop to c4, aiming at f7 — Black’s weakest square, defended only by the king.' },
        highlights: ['f7'],
        task: { accept: ['Bc4'], reply: 'Bc5', success: { ko: '이탈리안 게임입니다. 흑도 Bc5로 f2를 겨냥합니다(지우오코 피아노).', en: 'The Italian Game. Black mirrors with Bc5, eyeing f2 (Giuoco Piano).' } },
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bc4 Bc5',
        text: { ko: '백의 대표 계획은 c3로 d4를 준비해 중앙을 넓히는 것입니다.', en: 'White’s main plan: c3 to prepare d4 and build a big centre.' },
        demo: 'c3 Nf6 d4 exd4 cxd4',
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bc4 Nf6',
        text: { ko: '흑이 3...Nf6(투 나이츠)을 두면 e4가 공격받습니다. 서두른 Ng5는 날카롭지만, 처음에는 d3로 e4를 지키고 전개하는 것이 무난합니다.', en: 'After 3...Nf6 (Two Knights), e4 is attacked. Ng5 is sharp; a calm d3 defends e4 and keeps developing.' },
        task: { accept: ['d3', 'Nc3'], success: { ko: '좋습니다. 중앙을 지키며 전개를 이어 갑니다.', en: 'Good. You hold the centre and keep developing.' } },
      },
    ],
  },
  {
    id: 'op-ruylopez',
    course: 'openings',
    title: { ko: '루이 로페즈', en: 'Ruy Lopez' },
    summary: { ko: '3.Bb5 — e5를 지키는 나이트에 압박', en: '3.Bb5 — pressure on the knight that guards e5' },
    steps: [
      {
        pre: 'e4 e5 Nf3 Nc6',
        text: { ko: 'c6의 나이트는 e5 폰을 지킵니다. 그 나이트를 비숍으로 압박해 보세요.', en: 'The c6 knight defends e5. Put pressure on that knight with your bishop.' },
        arrows: [['c6', 'e5']],
        task: { accept: ['Bb5'], reply: 'a6', success: { ko: '루이 로페즈(스페인 게임)입니다. 흑은 a6로 "어떻게 할 거냐"고 묻습니다.', en: 'The Ruy Lopez (Spanish Game). Black asks the bishop a question with a6.' } },
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bb5 a6',
        text: { ko: '대표적인 수는 Ba4입니다. 비숍을 유지하며 압박을 이어 갑니다.', en: 'The main move is Ba4, keeping the bishop and the pressure.' },
        task: { accept: ['Ba4', 'Bxc6'], reply: 'Nf6', success: { ko: 'Ba4가 주 변화이고, Bxc6(교환 변화)도 가능한 수입니다.', en: 'Ba4 is the main line; Bxc6 (the Exchange Variation) is also playable.' } },
      },
      {
        pre: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6',
        text: { ko: 'e4가 공격받지만 백은 캐슬링합니다. Nxe4를 당해도 Re1 등으로 되찾을 수 있기 때문입니다.', en: 'e4 is attacked, yet White castles: if Black takes on e4, White wins it back with Re1 and other moves.' },
        task: { accept: ['O-O'], success: { ko: '킹을 안전하게 하고 룩을 e파일로 데려올 준비를 합니다.', en: 'King safety first, and the rook is ready for the e-file.' } },
      },
    ],
  },
  {
    id: 'op-qgambit',
    course: 'openings',
    title: { ko: '퀸즈 갬빗', en: "Queen's Gambit" },
    summary: { ko: '1.d4 d5 2.c4 — 폰을 내주며 중앙을 노린다', en: '1.d4 d5 2.c4 — offer a pawn to win the centre' },
    steps: [
      {
        pre: 'd4 d5',
        text: { ko: 'c4로 흑의 d5 폰을 공격하세요. 흑이 잡으면 d5 대신 중앙에서 멀어집니다.', en: 'Attack d5 with c4. If Black captures, the pawn leaves the centre.' },
        task: { accept: ['c4'], success: { ko: '퀸즈 갬빗입니다. "갬빗"이지만 백은 보통 폰을 쉽게 되찾습니다.', en: "The Queen's Gambit. It is called a gambit, but White usually regains the pawn." } },
      },
      {
        pre: 'd4 d5 c4 e6',
        text: { ko: '2...e6은 퀸즈 갬빗 거절(QGD)로, d5를 단단히 지킵니다. 대신 c8 비숍이 갇히기 쉽습니다.', en: '2...e6 is the Queen’s Gambit Declined: solid support for d5, but the c8 bishop is hemmed in.' },
        highlights: ['c8'],
      },
      {
        pre: 'd4 d5 c4 e6 Nc3 Nf6',
        text: { ko: 'f6 나이트를 핀으로 묶어 d5의 수비를 약하게 하는 대표 수를 두어 보세요.', en: 'Play the classic move that pins the f6 knight and weakens the defence of d5.' },
        task: { accept: ['Bg5'], success: { ko: 'Bg5! 나이트가 움직이면 퀸이 공격받는 핀(Pin)입니다.', en: 'Bg5! If the knight moves, the queen is hit — a pin.' } },
      },
      {
        pre: 'd4 d5 c4 dxc4',
        text: { ko: '2...dxc4(퀸즈 갬빗 수락)에는 e3로 비숍 길을 열어 c4 폰을 되찾는 것이 자연스럽습니다.', en: 'Against 2...dxc4 (accepted), e3 opens the bishop’s path to win back c4.' },
        demo: 'e3 Nf6 Bxc4',
      },
    ],
  },
  {
    id: 'op-defences',
    course: 'openings',
    title: { ko: '기본적인 수비 체계', en: 'Basic Defences for Black' },
    summary: { ko: '1.e4와 1.d4에 대한 흑의 계획', en: 'Black’s plans against 1.e4 and 1.d4' },
    steps: [
      {
        pre: 'e4',
        orientation: 'b',
        text: { ko: '흑의 목표도 같습니다: 중앙에 폰을 세우고, 기물을 전개하고, 캐슬링합니다. 가장 직접적인 답은 1...e5입니다.', en: 'Black has the same goals: pawns in the centre, develop, castle. The most direct reply is 1...e5.' },
        task: { accept: ['e5', 'c5', 'e6', 'c6'], success: { ko: '모두 검증된 응수입니다: e5(오픈 게임), c5(시실리안), e6(프렌치), c6(카로칸).', en: 'All proven replies: e5 (open game), c5 (Sicilian), e6 (French), c6 (Caro-Kann).' } },
      },
      {
        pre: 'e4 c6 d4',
        orientation: 'b',
        text: { ko: '카로칸 디펜스: c6로 준비한 뒤 d5로 중앙에 맞섭니다.', en: 'Caro-Kann Defence: after preparing with c6, challenge the centre with d5.' },
        task: { accept: ['d5'], success: { ko: 'd5! e4 폰과 정면으로 맞서며 c6 폰이 d5를 지킵니다.', en: 'd5! It confronts e4, and the c6 pawn supports it.' } },
      },
      {
        pre: 'e4 e6 d4',
        orientation: 'b',
        text: { ko: '프렌치 디펜스도 같은 생각입니다: e6로 준비하고 d5.', en: 'The French Defence follows the same idea: prepare with e6, then d5.' },
        task: { accept: ['d5'], success: { ko: '좋습니다. 흑은 단단한 폰 사슬(e6–d5)을 만듭니다.', en: 'Good. Black builds a solid pawn chain (e6–d5).' } },
      },
      {
        pre: 'd4',
        orientation: 'b',
        text: { ko: '1.d4에는 1...d5나 1...Nf6이 기본입니다. 1...Nf6은 e4를 막으며 전개합니다.', en: 'Against 1.d4, 1...d5 or 1...Nf6 are the basics. 1...Nf6 develops and stops e4.' },
        task: { accept: ['d5', 'Nf6'], success: { ko: '두 수 모두 중앙을 다투는 좋은 출발입니다.', en: 'Both moves fight for the centre — a good start.' } },
      },
    ],
  },
];
