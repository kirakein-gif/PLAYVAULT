// Independent re-check of the SHIPPED puzzle set at depth 20 (MultiPV 2):
// every solver move must still be the clear best (or mate), the final move or
// a listed alternative must keep the win. Writes a per-puzzle report.
// usage: node recheck.cjs <shard> <shards> <out.jsonl>
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('./engine.cjs');

const [shard, shards, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
const P = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/academy/puzzles/puzzles.json'), 'utf8'));
(async () => {
  const e = new Engine('single');
  await e.init({ Hash: 64 });
  for (let i = shard; i < P.length; i += shards) {
    const p = P[i];
    const c = new Chess(p.fen);
    const mv = (u) => c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    mv(p.moves[0]);
    const steps = [];
    let ok = true;
    for (let k = 1; k < p.moves.length; k += 2) {
      const r = await e.go(c.fen(), 'go depth 20 movetime 15000', 2);
      const [b, s] = r.lines;
      const exp = p.moves[k];
      const bestIsExp = b.pv[0] === exp || (p.alternatives.includes(b.pv[0]) && k === p.moves.length - 1);
      const gap = s ? winChance(b.score) - winChance(s.score) : 2;
      const mateOk = b.score.mate !== undefined && b.score.mate > 0;
      const lastMate = k === p.moves.length - 1 && p.mateIn;
      const pass = bestIsExp && (mateOk || gap >= 0.25 || (k === p.moves.length - 1 && p.alternatives.length > 0) || lastMate || (p.category === 'defense' && gap >= 0.25));
      steps.push({ k, exp, best: b.pv[0], score: b.score, second: s ? s.score : null, gap: +gap.toFixed(2), pass });
      if (!pass && !(lastMate && new Chess(c.fen()).move({ from: exp.slice(0, 2), to: exp.slice(2, 4), promotion: exp[4] }) && (() => { const t = new Chess(c.fen()); t.move({ from: exp.slice(0, 2), to: exp.slice(2, 4), promotion: exp[4] }); return t.isCheckmate(); })())) ok = false;
      mv(exp);
      if (k + 1 < p.moves.length) mv(p.moves[k + 1]);
    }
    fs.appendFileSync(out, JSON.stringify({ id: p.id, category: p.category, ok, steps }) + '\n');
  }
  e.quit();
  process.exit(0);
})();
