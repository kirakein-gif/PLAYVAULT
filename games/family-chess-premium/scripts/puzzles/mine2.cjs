// Stage 2b: "plausible blunder" mining on balanced games.
// For each balanced position, the moves a shallow search likes (MultiPV at low
// depth) are tried; those that actually lose big become puzzle candidates —
// the opponent makes a natural-looking mistake and the solver must punish it.
// usage: node mine2.cjs <games.jsonl> <out.jsonl>
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('./engine.cjs');

(async () => {
  const [inp, out] = process.argv.slice(2);
  const games = fs.readFileSync(inp, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const eng = new Engine('lite-single');
  await eng.init({ Hash: 32 });
  for (const g of games) {
    const chess = new Chess();
    const fens = [chess.fen()];
    for (const m of g.moves) {
      chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
      fens.push(chess.fen());
    }
    let found = 0;
    let lastPly = -10;
    for (let i = 8; i < fens.length - 1 && found < 8; i += 1) {
      if (i - lastPly < 4) continue;
      const pos = new Chess(fens[i]);
      if (pos.isGameOver()) continue;
      const base = await eng.go(fens[i], 'go depth 10', 1);
      const b = base.lines[0];
      if (!b || b.score.mate !== undefined || Math.abs(winChance(b.score)) > 0.35) continue; // balanced only
      const shallow = await eng.go(fens[i], 'go depth 4', 6);
      for (const l of shallow.lines.slice(1)) {
        const m = l.pv[0];
        const after = new Chess(fens[i]);
        after.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
        if (after.isGameOver()) continue;
        const r = await eng.go(after.fen(), 'go depth 10', 2);
        const best = r.lines[0], second = r.lines[1];
        if (!best || !second) continue;
        const isMate = best.score.mate !== undefined && best.score.mate > 0;
        const wb = winChance(best.score), ws = winChance(second.score);
        if (isMate) {
          if (best.score.mate > 3) continue;
          if (best.score.mate > 1 && second.score.mate !== undefined && second.score.mate > 0) continue;
        } else if (wb < 0.45 || wb - ws < 0.3) continue;
        // skip trivial recapture of a piece just captured
        const victim = pos.get(m.slice(2, 4));
        if (!isMate && victim && best.pv[0].slice(2, 4) === m.slice(2, 4)) continue;
        fs.appendFileSync(out, JSON.stringify({ game: g.id, ply: i, fen: fens[i], move: m, kind: 'tactic' }) + '\n');
        found++;
        lastPly = i;
        break;
      }
    }
  }
  eng.quit();
  process.exit(0);
})();
