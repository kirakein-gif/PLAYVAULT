// Measures whether the five AI levels really differ in move quality (not only
// in thinking time). Each level's configuration (src/engine/difficulty.ts) is
// replayed on the same positions with the bundled Lite engine; every chosen
// move is then scored by a deeper search. Lower average loss = stronger.
// usage: node tests/engine/strength.cjs [positions=30] [samples=2]
const path = require('path');
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('../../scripts/puzzles/engine.cjs');

const src = fs.readFileSync(path.join(__dirname, '../../src/engine/difficulty.ts'), 'utf8');
const LEVELS = [...src.matchAll(/level: (\d), key: '(\w+)', skill: (\d+), depth: (\d+), movetimeMs: (\d+)/g)].map((m) => ({ level: +m[1], key: m[2], skill: +m[3], depth: +m[4], movetime: +m[5] }));

// fixed, varied middlegame positions (reached by well-known opening lines)
const LINES = [
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6',
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6', 'e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7 f4 c5 Nf3 Nc6 Be3',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6',
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', 'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6',
  'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5 Bc4 e6 Bd2', 'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O',
  'e4 e5 Nf3 d6 d4 Nf6 Nc3 Nbd7 Bc4 Be7 O-O O-O Re1 c6', 'e4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 d3 d6 f4 e6 Nf3 Nge7',
  'd4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6 Bg5 Bb7', 'Nf3 d5 g3 Nf6 Bg2 c6 O-O Bg4 d3 Nbd7 Nbd2 e5 e4',
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4', 'e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4 Be2 e6 O-O Be7 c4 Nb6',
];

(async () => {
  const nPos = +(process.argv[2] || 30), samples = +(process.argv[3] || 2);
  const fens = [];
  for (const l of LINES) {
    const c = new Chess();
    const sans = l.split(' ');
    for (const s of sans) c.move(s);
    fens.push(c.fen());
    c.undo(); fens.push(c.fen());
  }
  const positions = fens.slice(0, nPos);
  // tactical positions: the start of shipped puzzles (one clearly best move)
  const PZ = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/academy/puzzles/puzzles.json'), 'utf8'));
  const tactical = PZ.filter((_, i) => i % 3 === 0).map((p) => {
    const c = new Chess(p.fen);
    c.move({ from: p.moves[0].slice(0, 2), to: p.moves[0].slice(2, 4), promotion: p.moves[0][4] });
    return { fen: c.fen(), answer: p.moves[1], alts: p.moves.length === 2 ? p.alternatives : [], mate: !!p.mateIn };
  });
  const judge = new Engine('single');
  await judge.init({ Hash: 64 });
  const player = new Engine('lite-single');
  await player.init({ Hash: 16 });
  const evalAfter = async (fen, mv) => {
    const c = new Chess(fen);
    c.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: mv[4] });
    if (c.isCheckmate()) return 1;
    const r = await judge.go(c.fen(), 'go depth 14', 1);
    return -winChance(r.lines[0].score);
  };
  const report = { when: new Date().toISOString(), engine: 'Stockfish 19 Lite single (player) / Stockfish 19 single depth 14 (judge)', positions: positions.length, samples, levels: [] };
  const bestWc = [];
  for (const f of positions) {
    const r = await judge.go(f, 'go depth 14', 1);
    bestWc.push(winChance(r.lines[0].score));
  }
  for (const L of LEVELS) {
    let loss = 0, n = 0, blunders = 0, best = 0;
    const tStart = Date.now();
    for (let s = 0; s < samples; s++) {
      for (let i = 0; i < positions.length; i++) {
        player.send('ucinewgame');
        player.setOption('Skill Level', L.skill);
        const r = await player.go(positions[i], `go depth ${L.depth} movetime ${L.movetime}`, 1);
        const wc = await evalAfter(positions[i], r.bestmove);
        const d = Math.max(0, bestWc[i] - wc);
        loss += d; n++;
        if (d >= 0.3) blunders++;
        if (d <= 0.03) best++;
      }
    }
    let solved = 0, tn = 0;
    for (let s = 0; s < samples; s++) {
      for (const t of tactical) {
        player.send('ucinewgame');
        player.setOption('Skill Level', L.skill);
        const r = await player.go(t.fen, `go depth ${L.depth} movetime ${L.movetime}`, 1);
        const c = new Chess(t.fen);
        let mated = false;
        try { c.move({ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4), promotion: r.bestmove[4] }); mated = c.isCheckmate(); } catch {}
        if (r.bestmove === t.answer || t.alts.includes(r.bestmove) || (t.mate && mated)) solved++;
        tn++;
      }
    }
    const row = { level: L.level, key: L.key, skill: L.skill, depth: L.depth, avgWinChanceLoss: +(loss / n).toFixed(3), blunderRate: +(blunders / n).toFixed(3), nearBestRate: +(best / n).toFixed(3), tacticFoundRate: +(solved / tn).toFixed(3), tacticPositions: tactical.length, avgMsPerMove: Math.round((Date.now() - tStart) / (n + tn)) };
    report.levels.push(row);
    console.log(JSON.stringify(row));
  }
  const found = report.levels.map((l) => l.tacticFoundRate);
  report.monotonic = found.every((v, i) => i === 0 || v > found[i - 1]);
  console.log(report.monotonic ? 'STRENGTH: tactic-finding rate rises with every level' : 'STRENGTH: NOT strictly increasing', found.join(' < '));
  const out = path.join(__dirname, '../../docs/engine-strength.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  judge.quit(); player.quit();
  process.exit(0);
})();
