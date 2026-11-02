// Stage 4: tag, classify, dedupe and select the shipped puzzle set.
// usage: node build.cjs <out.json> <verified.jsonl...>
const fs = require('fs');
const { Chess } = require('chess.js');
const { tagPuzzle } = require('./tag.cjs');

const [out, ...inputs] = process.argv.slice(2);
const raw = inputs.flatMap((f) => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)));

const seenFen = new Set();
const perGame = {};
const cands = [];
for (const r of raw) {
  const key = r.startFen.split(' ').slice(0, 4).join(' ');
  if (seenFen.has(key)) continue;
  const g = (perGame[r.game] ||= []);
  if (g.some((p) => Math.abs(p - r.ply) < 6)) continue;
  const pz = { fen: r.fen, moves: [r.move, ...r.solution], alternatives: r.alternatives || [], mateIn: r.mateIn, kind: r.kind };
  const t = tagPuzzle(pz);
  const solverMoves = Math.ceil(r.solution.length / 2);
  let category = null;
  if (r.mateIn) category = 'mate';
  else if (t.tags.includes('endgame')) category = 'endgame';
  else if (r.kind === 'defense') category = 'defense';
  else if (t.tags.includes('skewer') || t.tags.includes('discoveredAttack')) category = 'skewerDiscovered';
  else if (t.tags.includes('pin')) category = 'pin';
  else if (t.tags.includes('fork') || t.tags.includes('doubleAttack')) category = 'fork';
  if (!category) continue;
  // endgame puzzles must be decisive technique, not trivial captures
  if (category === 'endgame' && t.tags.includes('hangingPiece') && solverMoves === 1) continue;
  const score = r.foundDepth + 3 * (solverMoves - 1) + (r.mateIn === 3 ? 3 : 0);
  const difficulty = score <= 3 ? 'easy' : score <= 8 ? 'medium' : 'hard';
  seenFen.add(key);
  g.push(r.ply);
  cands.push({ r, pz, t, category, difficulty, solverMoves, score });
}

const counts = {};
for (const c of cands) { const k = `${c.category}/${c.difficulty}${c.r.mateIn ? '/m' + c.r.mateIn : ''}`; counts[k] = (counts[k] || 0) + 1; }
console.error('candidates', cands.length, counts);

const TARGET = { mate: 30, fork: 18, pin: 15, skewerDiscovered: 16, defense: 16, endgame: 12 };
const MATE_SPLIT = { 1: 10, 2: 12, 3: 8 };
const MIX = { easy: 0.35, medium: 0.4, hard: 0.25 };

function pick(list, n) {
  const byD = { easy: [], medium: [], hard: [] };
  for (const c of list) byD[c.difficulty].push(c);
  for (const k of Object.keys(byD)) byD[k].sort((a, b) => a.r.game.localeCompare(b.r.game) || a.r.ply - b.r.ply);
  const chosen = [];
  for (const d of ['easy', 'medium', 'hard']) chosen.push(...byD[d].splice(0, Math.round(n * MIX[d])));
  const rest = [...byD.medium, ...byD.easy, ...byD.hard];
  while (chosen.length < n && rest.length) chosen.push(rest.shift());
  return chosen.slice(0, n);
}

const selected = [];
for (const [cat, n] of Object.entries(TARGET)) {
  const list = cands.filter((c) => c.category === cat);
  if (cat === 'mate') {
    for (const [m, k] of Object.entries(MATE_SPLIT)) selected.push(...pick(list.filter((c) => c.r.mateIn === +m), k));
  } else selected.push(...pick(list, n));
}

function san(fen, moves) {
  const c = new Chess(fen);
  return moves.map((u) => c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
}

const ORDER = ['mate', 'fork', 'pin', 'skewerDiscovered', 'defense', 'endgame'];
const DORD = { easy: 0, medium: 1, hard: 2 };
selected.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || (a.r.mateIn || 0) - (b.r.mateIn || 0) || DORD[a.difficulty] - DORD[b.difficulty]);

const puzzles = selected.map((c, i) => {
  const { r, t } = c;
  const sol = r.solution;
  const startFen = t.startFen;
  const first = new Chess(startFen);
  const fromSq = sol[0].slice(0, 2);
  const piece = first.get(fromSq);
  const sans = san(startFen, sol);
  let focus = [fromSq];
  let explain = { key: 'tactic', params: { line: sans.join(' ') } };
  const I = t.info;
  if (c.category === 'mate') { focus.push(I.mate?.king); explain = { key: 'mate', params: { line: sans.join(' ') } }; }
  else if (c.category === 'fork' && I.fork) {
    focus = [I.fork.square, ...I.fork.targets.map((x) => x.split(':')[1])];
    explain = { key: 'fork', params: { move: sans[I.fork.move], piece: I.fork.piece, square: I.fork.square, targets: I.fork.targets.join(',') } };
  } else if (c.category === 'fork' && I.double) {
    focus = [fromSq, ...I.double.targets.map((x) => x.split(':')[1])];
    explain = { key: 'doubleAttack', params: { move: sans[I.double.move], targets: I.double.targets.join(',') } };
  } else if (c.category === 'pin' && I.pin) {
    focus = [fromSq, I.pin.square, ...(I.pin.focus || [])];
    explain = { key: 'pin', params: { move: sans[0], pinned: I.pin.pinned } };
  } else if (c.category === 'skewerDiscovered' && I.skewer) {
    focus = [I.skewer.square, ...I.skewer.focus];
    explain = { key: 'skewer', params: { move: sans[I.skewer.move], front: I.skewer.front, back: I.skewer.back } };
  } else if (c.category === 'skewerDiscovered' && I.discovered) {
    focus = [fromSq, ...I.discovered.focus];
    explain = { key: 'discoveredAttack', params: { move: sans[I.discovered.move], attacker: I.discovered.attacker } };
  } else if (c.category === 'defense') {
    // pieces of the solver that are currently attacked
    const opp = t.solver === 'w' ? 'b' : 'w';
    for (const row of first.board()) for (const p of row) if (p && p.color === t.solver && p.type !== 'p' && first.attackers(p.square, opp).length) focus.push(p.square);
    explain = { key: 'defense', params: { move: sans[0] } };
  } else if (c.category === 'endgame') {
    explain = { key: 'endgame', params: { line: sans.join(' ') } };
  }
  const themes = t.tags.filter((x) => x !== 'endgame' || c.category === 'endgame');
  return {
    id: `FCP-${String(i + 1).padStart(3, '0')}`,
    fen: r.fen,
    moves: [r.move, ...sol],
    alternatives: r.alternatives || [],
    category: c.category,
    themes,
    difficulty: c.difficulty,
    mateIn: r.mateIn || null,
    hint: { focus: [...new Set(focus.filter(Boolean))], pieceSquare: fromSq, pieceType: piece.type },
    explain,
    source: `FCP self-play ${r.game} ply ${r.ply}; verified Stockfish 19 (depth 18, MultiPV 3)`,
  };
});

const summary = {};
for (const p of puzzles) summary[p.category] = (summary[p.category] || 0) + 1;
console.error('selected', puzzles.length, summary);
fs.writeFileSync(out, JSON.stringify(puzzles, null, 1) + '\n');
