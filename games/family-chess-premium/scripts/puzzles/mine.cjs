// Stage 2: shallow scan of every self-play position to find candidate moments.
//  - "tactic": the opponent's move hands the solver a large advantage (or a mate).
//  - "defense": after the opponent's move a solver piece is en prise / king in check,
//               so an only-move defensive answer may exist (verified later).
// usage: node mine.cjs <games.jsonl> <out.jsonl>
const fs = require('fs');
const { Chess } = require('chess.js');
const { Engine, winChance } = require('./engine.cjs');

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function hasPieceEnPrise(chess) {
  const me = chess.turn(), opp = me === 'w' ? 'b' : 'w';
  for (const row of chess.board()) for (const sq of row) {
    if (!sq || sq.color !== me || sq.type === 'k' || sq.type === 'p') continue;
    const att = chess.attackers(sq.square, opp);
    if (!att.length) continue;
    const def = chess.attackers(sq.square, me);
    const cheapest = Math.min(...att.map((a) => VAL[chess.get(a).type] || 0));
    if (!def.length || cheapest < VAL[sq.type]) return true;
  }
  return false;
}

(async () => {
  const [inp, out] = process.argv.slice(2);
  const games = fs.readFileSync(inp, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const eng = new Engine('lite-single');
  await eng.init({ Hash: 32 });
  for (const g of games) {
    const chess = new Chess();
    const fens = [chess.fen()];
    for (const m of g.moves) { chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] }); fens.push(chess.fen()); }
    const evals = [];
    for (let i = 0; i < fens.length; i++) {
      if (i < 8) { evals.push(null); continue; }
      const c = new Chess(fens[i]);
      if (c.isGameOver()) { evals.push(null); continue; }
      const r = await eng.go(fens[i], 'go depth 10', 1);
      evals.push(r.lines[0] ? r.lines[0].score : null);
    }
    for (let i = 8; i + 1 < fens.length; i++) {
      const before = evals[i], after = evals[i + 1];
      if (!before || !after) continue;
      const solverBefore = -winChance(before); // solver perspective before opponent's move
      const solverAfter = winChance(after);
      const pos = new Chess(fens[i + 1]);
      let kind = null;
      if (after.mate !== undefined && after.mate > 0 && after.mate <= 3) kind = 'tactic';
      else if (solverAfter >= 0.4 && solverBefore <= 0.2) kind = 'tactic';
      else if (Math.abs(solverAfter) <= 0.4 && (pos.inCheck() || hasPieceEnPrise(pos))) kind = 'defense';
      if (!kind) continue;
      // cheap uniqueness pre-filter (deep check happens in verify.cjs)
      const r2 = await eng.go(fens[i + 1], 'go depth 10', 2);
      const b = r2.lines[0], s2 = r2.lines[1];
      if (!b || !s2) continue;
      const gap = winChance(b.score) - winChance(s2.score);
      const isMate = b.score.mate !== undefined && b.score.mate > 0;
      if (!isMate && gap < 0.3) continue;
      if (isMate && b.score.mate > 1 && s2.score.mate !== undefined && s2.score.mate > 0) continue;
      // trivial recapture on the square the opponent just used is not a puzzle
      const lastTo = g.moves[i].slice(2, 4);
      const victim = new Chess(fens[i]).get(lastTo);
      if (b.pv[0].slice(2, 4) === lastTo && victim && !isMate) continue;
      fs.appendFileSync(out, JSON.stringify({ game: g.id, ply: i, fen: fens[i], move: g.moves[i], kind }) + '\n');
    }
  }
  eng.quit();
  process.exit(0);
})();
