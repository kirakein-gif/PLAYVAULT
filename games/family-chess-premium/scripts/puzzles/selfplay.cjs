// Stage 1: weak-vs-weak Stockfish self-play to produce realistic positions that
// contain tactical mistakes (the same idea Lichess uses with human games).
// usage: node selfplay.cjs <shard> <games> <out.jsonl>
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine } = require('./engine.cjs');

const OPENINGS = [
  'e4 e5 Nf3 Nc6 Bc4 Bc5', 'e4 e5 Nf3 Nc6 Bc4 Nf6', 'e4 e5 Nf3 Nc6 Bb5 a6', 'e4 e5 Nf3 Nc6 d4 exd4',
  'e4 e5 Nf3 d6', 'e4 e5 Nc3 Nf6', 'e4 e5 f4 exf4', 'e4 c5 Nf3 d6 d4 cxd4', 'e4 c5 Nc3 Nc6',
  'e4 e6 d4 d5', 'e4 c6 d4 d5', 'e4 d5 exd5 Qxd5', 'e4 Nf6 e5 Nd5', 'e4 d6 d4 Nf6 Nc3 g6',
  'd4 d5 c4 e6 Nc3 Nf6', 'd4 d5 c4 dxc4', 'd4 d5 c4 c6', 'd4 Nf6 c4 g6 Nc3 Bg7', 'd4 Nf6 c4 e6 Nc3 Bb4',
  'd4 d5 Bf4 Nf6 e3', 'd4 f5', 'd4 d5 Nf3 Nf6 e3', 'c4 e5 Nc3 Nf6', 'Nf3 d5 g3', 'e4 e5 Nf3 Nf6',
  'e4 e5 Bc4 Nf6', 'e4 g6 d4 Bg7', 'd4 e6 c4 b6', 'e4 c5 Nf3 e6 d4 cxd4', 'e4 e5 Nf3 Nc6 Nc3 Nf6',
  'd4 Nf6 Bg5', 'e4 e5 d4 exd4 Qxd4 Nc6', 'b3 e5', 'f4 d5', 'e4 c5 c3 Nf6', 'e4 e5 Nf3 Nc6 Bc4 Be7',
];

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

(async () => {
  const shard = +process.argv[2], games = +process.argv[3], out = process.argv[4];
  const rand = rng(1000 + shard * 7919);
  const eng = new Engine('lite-single');
  await eng.init({ Hash: 16 });
  for (let g = 0; g < games; g++) {
    const chess = new Chess();
    for (const san of OPENINGS[Math.floor(rand() * OPENINGS.length)].split(' ')) chess.move(san);
    const skills = process.env.SKILLS ? process.env.SKILLS.split(',').map(Number) : [0, 1, 2, 3, 5, 7, 9, 12];
    const sw = skills[Math.floor(rand() * skills.length)], sb = skills[Math.floor(rand() * skills.length)];
    await eng.newGame();
    while (!chess.isGameOver() && chess.history().length < 180) {
      eng.setOption('Skill Level', chess.turn() === 'w' ? sw : sb);
      const r = await eng.go(chess.fen(), `go movetime ${process.env.MOVETIME || 40}`, 1);
      if (!r.bestmove || r.bestmove === '(none)') break;
      const mv = r.bestmove;
      chess.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: mv[4] });
    }
    const moves = chess.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion || ''));
    fs.appendFileSync(out, JSON.stringify({ id: `s${shard}g${g}`, moves }) + '\n');
  }
  eng.quit();
  process.exit(0);
})();
