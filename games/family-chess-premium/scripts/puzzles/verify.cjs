// Stage 3: deep verification with the full Stockfish 19 network.
// Builds the solution line and keeps only puzzles where every solver move is the
// only clearly good move (except a final mating move: any mate is accepted at runtime).
// usage: node verify.cjs <candidates.jsonl> <out.jsonl>
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('./engine.cjs');

const DEEP = 'go depth 18 movetime 6000';
const uci = (m) => m.from + m.to + (m.promotion || '');
function play(chess, u) { return chess.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); }

async function buildLine(eng, fen, kind) {
  const chess = new Chess(fen);
  const solution = [];
  let alternatives = [];
  let mateIn = null;
  for (let step = 0; step < 3; step++) {
    const legal = chess.moves().length;
    const r = await eng.go(chess.fen(), DEEP, 3);
    const best = r.lines[0], second = r.lines[1];
    if (!best) break;
    const wb = winChance(best.score);
    let ok = false;
    if (best.score.mate !== undefined && best.score.mate > 0) {
      const n = best.score.mate;
      if (step === 0) mateIn = n;
      if (step === 0 && n > 3) return null;
      if (n === 1) { // final mating move: any mate accepted at runtime
        solution.push(best.pv[0]);
        alternatives = r.lines.filter((l) => l.score.mate === 1).map((l) => l.pv[0]).filter((m) => m !== best.pv[0]);
        return { solution, alternatives, mateIn, kind: 'mate' };
      }
      // another mate that is as fast or faster makes the puzzle ambiguous; a slower
      // mate does not ("mate in N" asks for the fastest one)
      ok = !second || !(second.score.mate !== undefined && second.score.mate > 0 && second.score.mate <= n);
      if (!ok) return null;
    } else {
      if (mateIn) return null;
      if (legal < 2) break;
      const ws = second ? winChance(second.score) : -1;
      if (kind === 'defense' && step === 0) ok = wb >= -0.35 && wb <= 0.45 && wb - ws >= 0.45;
      else ok = wb >= (step === 0 ? 0.45 : 0.35) && wb - ws >= 0.35;
      if (!ok) break;
    }
    const mv = best.pv[0];
    solution.push(mv);
    alternatives = kind !== 'defense' || step > 0
      ? r.lines.slice(1).filter((l) => l.score.mate === undefined && best.score.mate === undefined && winChance(l.score) >= wb - 0.06).map((l) => l.pv[0])
      : [];
    play(chess, mv);
    if (chess.isGameOver()) break;
    // opponent reply: engine best defence
    const rr = await eng.go(chess.fen(), DEEP, 1);
    const reply = rr.bestmove;
    if (!reply || reply === '(none)') break;
    // only continue if the following solver move is also forced; tentatively add reply
    const save = chess.fen();
    play(chess, reply);
    const probe = await eng.go(chess.fen(), DEEP, 2);
    const pb = probe.lines[0], ps = probe.lines[1];
    let cont = false;
    if (pb) {
      if (pb.score.mate !== undefined && pb.score.mate > 0) cont = !ps || pb.score.mate === 1 || !(ps.score.mate !== undefined && ps.score.mate > 0 && ps.score.mate <= pb.score.mate);
      else cont = !mateIn && kind !== 'defense' && ps && winChance(pb.score) >= 0.35 && winChance(pb.score) - winChance(ps.score) >= 0.35;
    }
    if (!cont) { chess.load(save); break; }
    solution.push(reply);
  }
  if (!solution.length || solution.length % 2 === 0) return null;
  if (mateIn) return null; // a mate line that did not end in mate
  return { solution, alternatives, mateIn: null, kind };
}

async function foundDepth(eng, fen, move) {
  let found = null;
  for (const d of [1, 2, 3, 4, 6, 8, 10, 12, 14]) {
    const r = await eng.go(fen, `go depth ${d}`, 1);
    if (r.bestmove === move) { if (found === null) found = d; } else found = null;
  }
  return found ?? 16;
}

(async () => {
  const [inp, out] = process.argv.slice(2);
  const cands = fs.readFileSync(inp, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const eng = new Engine('single');
  await eng.init({ Hash: 64 });
  const lite = new Engine('lite-single');
  await lite.init({ Hash: 16 });
  for (const c of cands) {
    if (process.env.ONLY_MATES) {
      const pre = new Chess(c.fen);
      play(pre, c.move);
      const q = await lite.go(pre.fen(), 'go depth 10', 1);
      const sc = q.lines[0] && q.lines[0].score;
      if (!sc || sc.mate === undefined || sc.mate < 2 || sc.mate > 3) continue;
    }
    const start = new Chess(c.fen);
    play(start, c.move);
    const res = await buildLine(eng, start.fen(), c.kind);
    if (!res) continue;
    lite.send('ucinewgame');
    const fd = await foundDepth(lite, start.fen(), res.solution[0]);
    fs.appendFileSync(out, JSON.stringify({ ...c, startFen: start.fen(), ...res, foundDepth: fd }) + '\n');
  }
  eng.quit(); lite.quit();
  process.exit(0);
})();
