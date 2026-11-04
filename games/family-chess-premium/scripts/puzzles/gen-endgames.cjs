// Random basic endgames (K+P, K+2P vs K+P, K+R+P vs K+R, K+Q vs K+P ...) filtered
// for positions with exactly one winning move. A legal king "set-up" move for the
// defender is reconstructed so the puzzle follows the same convention as the rest.
// Output candidates go through verify.cjs like every other puzzle.
// usage: node gen-endgames.cjs <count> <out.jsonl> <seed>
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('./engine.cjs');

const [count, out, seed0] = [+process.argv[2] || 40, process.argv[3], +process.argv[4] || 1];
let s = seed0 * 7919;
const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const FILES = 'abcdefgh';
const TEMPLATES = [
  { w: ['k', 'p'], b: ['k'] },
  { w: ['k', 'p', 'p'], b: ['k', 'p'] },
  { w: ['k', 'p', 'p'], b: ['k', 'p', 'p'] },
  { w: ['k', 'p'], b: ['k', 'p'] },
  { w: ['k', 'r', 'p'], b: ['k', 'r'] },
  { w: ['k', 'q'], b: ['k', 'p'] },
  { w: ['k', 'r'], b: ['k', 'p'] },
];

function randomPosition() {
  const t = TEMPLATES[Math.floor(rnd() * TEMPLATES.length)];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const place = (piece, color) => {
    for (let i = 0; i < 50; i++) {
      const f = Math.floor(rnd() * 8);
      let r = Math.floor(rnd() * 8);
      if (piece === 'p') r = 1 + Math.floor(rnd() * 6);
      if (board[r][f]) continue;
      board[r][f] = color === 'w' ? piece.toUpperCase() : piece;
      return true;
    }
    return false;
  };
  for (const p of t.w) if (!place(p, 'w')) return null;
  for (const p of t.b) if (!place(p, 'b')) return null;
  const rows = [];
  for (let r = 7; r >= 0; r--) {
    let row = '', e = 0;
    for (let f = 0; f < 8; f++) { const x = board[r][f]; if (!x) e++; else { if (e) row += e; e = 0; row += x; } }
    if (e) row += e;
    rows.push(row);
  }
  const solver = rnd() < 0.75 ? 'w' : 'b';
  return `${rows.join('/')} ${solver} - - 0 50`;
}

/** builds "position before the defender's king move" so moves[0] is a real move */
function retro(fen) {
  const c = new Chess(fen);
  const solver = c.turn(), opp = solver === 'w' ? 'b' : 'w';
  let kSq;
  for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === opp) kSq = p.square;
  const [kf, kr] = [FILES.indexOf(kSq[0]), +kSq[1]];
  const opts = [];
  for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) {
    if (!df && !dr) continue;
    const f = kf + df, r = kr + dr;
    if (f < 0 || f > 7 || r < 1 || r > 8) continue;
    const sq = FILES[f] + r;
    if (c.get(sq)) continue;
    opts.push(sq);
  }
  for (const from of opts.sort(() => rnd() - 0.5)) {
    const parts = fen.split(' ');
    const b = new Chess();
    try {
      b.load(`${parts[0]} ${opp} - - 0 49`, { skipValidation: true });
    } catch { continue; }
    b.remove(kSq);
    b.put({ type: 'k', color: opp }, from);
    let before;
    try { before = new Chess(b.fen()); } catch { continue; }
    if (before.inCheck() && false) continue;
    const mv = before.moves({ verbose: true }).find((m) => m.from === from && m.to === kSq);
    if (!mv) continue;
    // in the "before" position the solver must not be in check while the opponent is to move
    const test = new Chess(b.fen().replace(` ${opp} `, ` ${solver} `));
    if (test.inCheck()) continue;
    before.move({ from, to: kSq });
    if (before.fen().split(' ')[0] !== fen.split(' ')[0]) continue;
    return { fen: b.fen(), move: from + kSq };
  }
  return null;
}

(async () => {
  const eng = new Engine('lite-single');
  await eng.init({ Hash: 32 });
  let found = 0, tried = 0;
  while (found < count && tried < 200000) {
    tried++;
    const fen = randomPosition();
    if (!fen) continue;
    let c;
    try { c = new Chess(fen); } catch { continue; }
    if (c.isGameOver() || c.inCheck()) continue;
    const oppFen = fen.replace(/ [wb] /, (m) => (m === ' w ' ? ' b ' : ' w '));
    try { if (new Chess(oppFen).inCheck()) continue; } catch { continue; }
    const r = await eng.go(fen, 'go depth 14', 2);
    const b = r.lines[0], s2 = r.lines[1];
    if (!b || !s2) continue;
    const wb = winChance(b.score), ws = winChance(s2.score);
    if (b.score.mate !== undefined) continue; // mating nets are covered elsewhere
    if (!(wb >= 0.5 && ws <= 0.15)) continue; // exactly one winning idea
    const capture = c.get(b.pv[0].slice(2, 4));
    if (capture && capture.type !== 'p') continue; // not a free-piece grab
    const rt = retro(fen);
    if (!rt) continue;
    fs.appendFileSync(out, JSON.stringify({ game: `eg${seed0}-${tried}`, ply: 0, fen: rt.fen, move: rt.move, kind: 'tactic' }) + '\n');
    found++;
  }
  console.log('found', found, 'tried', tried);
  eng.quit();
  process.exit(0);
})();
