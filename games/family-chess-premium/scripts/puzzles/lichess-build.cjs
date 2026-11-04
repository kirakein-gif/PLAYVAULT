// Selects puzzles from the Lichess puzzle database (CC0, https://database.lichess.org/)
// and converts them to the app format. Lichess uses the same convention as the
// app: FEN is the position BEFORE the opponent's move, moves[0] is that move.
//
// usage: node lichess-build.cjs <lichess_db_puzzle.csv> <out.json> [exclude-ids.txt]
// Run recheck-lichess afterwards (engine re-verification) before shipping.
const fs = require('fs');
const readline = require('readline');
const { Chess } = require('chess.js');
const { tagPuzzle } = require('./tag.cjs');

const [csv, out, excludeFile] = process.argv.slice(2);
const exclude = new Set(excludeFile && fs.existsSync(excludeFile) ? fs.readFileSync(excludeFile, 'utf8').split(/\s+/).filter(Boolean) : []);

// how many Lichess puzzles per bucket, and the difficulty mix
const TARGET = { mate: 45, fork: 30, pin: 25, skewerDiscovered: 25, defense: 25, endgame: 25, other: 25 };
const MATE_SPLIT = { 1: 15, 2: 18, 3: 12 };
const MIX = { easy: 0.35, medium: 0.4, hard: 0.25 };
const band = (r) => (r < 1250 ? 'easy' : r < 1650 ? 'medium' : 'hard');
const OTHER = ['hangingPiece', 'trappedPiece', 'deflection', 'attraction', 'capturingDefender', 'intermezzo', 'clearance', 'interference'];

function bucketOf(th) {
  const t = new Set(th);
  if (t.has('mateIn1') || t.has('mateIn2') || t.has('mateIn3')) return 'mate';
  if ([...t].some((x) => /^mateIn[4-9]/.test(x))) return null;
  const winning = t.has('crushing') || t.has('advantage');
  if (t.has('defensiveMove')) return 'defense';
  if (!winning) return null;
  if (t.has('skewer') || t.has('discoveredAttack')) return 'skewerDiscovered';
  if (t.has('pin')) return 'pin';
  if (t.has('fork')) return 'fork';
  if (t.has('pawnEndgame') || t.has('rookEndgame')) return 'endgame';
  if (OTHER.some((x) => t.has(x))) return 'other';
  return null;
}

// deterministic pseudo-random order (stable across runs)
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

(async () => {
  const cands = {};
  const rl = readline.createInterface({ input: fs.createReadStream(csv), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    if (n++ === 0) continue; // header
    const f = line.split(',');
    const [id, fen, movesS, ratingS, devS, popS, playsS, themesS, url] = f;
    if (exclude.has(id)) continue;
    const rating = +ratingS, dev = +devS, pop = +popS, plays = +playsS;
    if (plays < 2000 || pop < 85 || dev > 80 || rating < 700 || rating > 2100) continue;
    const moves = movesS.split(' ');
    if (moves.length > 6 || moves.length % 2) continue;
    const themes = themesS.split(' ');
    const b = bucketOf(themes);
    if (!b) continue;
    const key = b === 'mate' ? `mate${themes.find((x) => /^mateIn[123]$/.test(x)).slice(-1)}` : b;
    const k = `${key}/${band(rating)}`;
    const h = hash(id);
    (cands[k] ||= []).push({ id, fen, moves, rating, plays, pop, themes, url, h, bucket: b });
  }
  for (const k of Object.keys(cands)) cands[k].sort((a, b) => a.h - b.h);
  console.error('scanned', n, Object.fromEntries(Object.entries(cands).map(([k, v]) => [k, v.length])));

  const take = (key, count) => {
    const res = [];
    for (const d of ['easy', 'medium', 'hard']) res.push(...(cands[`${key}/${d}`] || []).slice(0, Math.round(count * MIX[d])));
    return res;
  };
  const chosen = [];
  for (const [b, n2] of Object.entries(TARGET)) {
    if (b === 'mate') for (const [m, c] of Object.entries(MATE_SPLIT)) chosen.push(...take(`mate${m}`, c));
    else chosen.push(...take(b, n2));
  }

  const MAP = { mateIn1: 'mate', mateIn2: 'mate', mateIn3: 'mate', fork: 'fork', pin: 'pin', skewer: 'skewer', discoveredAttack: 'discoveredAttack', hangingPiece: 'hangingPiece', sacrifice: 'sacrifice', promotion: 'promotion', backRankMate: 'backRankMate', defensiveMove: 'defense' };
  const sanLine = (fen, ms) => {
    const c = new Chess(fen);
    return ms.map((u) => c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
  };
  const puzzles = chosen.map((p) => {
    const mateIn = p.bucket === 'mate' ? +p.themes.find((x) => /^mateIn[123]$/.test(x)).slice(-1) : null;
    const t = tagPuzzle({ fen: p.fen, moves: p.moves, mateIn, kind: p.bucket === 'defense' ? 'defense' : 'tactic' });
    const start = new Chess(t.startFen);
    const sol = p.moves.slice(1);
    const sans = sanLine(t.startFen, sol);
    const fromSq = sol[0].slice(0, 2);
    const piece = start.get(fromSq);
    const I = t.info;
    let focus = [fromSq];
    let explain = { key: 'tactic', params: { line: sans.join(' ') } };
    if (p.bucket === 'mate') {
      focus.push(I.mate?.king);
      explain = { key: 'mate', params: { line: sans.join(' ') } };
    } else if (p.bucket === 'fork' && I.fork) {
      focus = [I.fork.square, ...I.fork.targets.map((x) => x.split(':')[1])];
      explain = { key: 'fork', params: { move: sans[I.fork.move], piece: I.fork.piece, square: I.fork.square, targets: I.fork.targets.join(',') } };
    } else if (p.bucket === 'pin' && I.pin) {
      focus = [fromSq, I.pin.square, ...(I.pin.focus || [])];
      explain = { key: 'pin', params: { move: sans[0], pinned: I.pin.pinned } };
    } else if (p.bucket === 'skewerDiscovered' && I.skewer) {
      focus = [I.skewer.square, ...I.skewer.focus];
      explain = { key: 'skewer', params: { move: sans[I.skewer.move], front: I.skewer.front, back: I.skewer.back } };
    } else if (p.bucket === 'skewerDiscovered' && I.discovered) {
      focus = [fromSq, ...I.discovered.focus];
      explain = { key: 'discoveredAttack', params: { move: sans[I.discovered.move], attacker: I.discovered.attacker } };
    } else if (p.bucket === 'defense') {
      const opp = t.solver === 'w' ? 'b' : 'w';
      for (const row of start.board()) for (const q of row) if (q && q.color === t.solver && q.type !== 'p' && start.attackers(q.square, opp).length) focus.push(q.square);
      explain = { key: 'defense', params: { move: sans[0] } };
    } else if (p.bucket === 'endgame') {
      explain = { key: 'endgame', params: { line: sans.join(' ') } };
    }
    let themes = [...new Set(p.themes.map((x) => MAP[x]).filter(Boolean))];
    if (p.bucket === 'endgame') themes.push('endgame');
    // prompt wording follows the Lichess theme, so make sure it is present
    if (p.bucket === 'skewerDiscovered' && !themes.includes('skewer') && !themes.includes('discoveredAttack')) themes.push('discoveredAttack');
    return {
      id: `LI-${p.id}`,
      fen: p.fen,
      moves: p.moves,
      alternatives: [],
      category: p.bucket,
      themes,
      difficulty: band(p.rating),
      mateIn,
      rating: p.rating,
      hint: { focus: [...new Set(focus.filter(Boolean))], pieceSquare: fromSq, pieceType: piece.type },
      explain,
      source: `Lichess puzzle ${p.id} (CC0) · rating ${p.rating} · ${p.plays} plays · ${p.url}`,
    };
  });
  const ORDER = ['mate', 'fork', 'pin', 'skewerDiscovered', 'defense', 'endgame', 'other'];
  const DORD = { easy: 0, medium: 1, hard: 2 };
  puzzles.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || (a.mateIn || 0) - (b.mateIn || 0) || DORD[a.difficulty] - DORD[b.difficulty] || a.rating - b.rating);
  const summary = {};
  for (const p of puzzles) summary[`${p.category}/${p.difficulty}`] = (summary[`${p.category}/${p.difficulty}`] || 0) + 1;
  console.error('selected', puzzles.length, summary);
  fs.writeFileSync(out, JSON.stringify(puzzles, null, 1) + '\n');
})();
