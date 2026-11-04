// Motif detection on a verified solution line (inspired by the ideas of the
// Lichess puzzle tagger, re-implemented here with chess.js).
const { Chess } = require('chess.js');

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const FILES = 'abcdefgh';
const xy = (sq) => [FILES.indexOf(sq[0]), +sq[1] - 1];
const sq = (x, y) => (x >= 0 && x < 8 && y >= 0 && y < 8 ? FILES[x] + (y + 1) : null);
const play = (c, u) => c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });

function attackedBy(c, from, oppColor) {
  // opponent pieces attacked by the piece standing on `from`
  const out = [];
  const me = c.get(from);
  if (!me) return out;
  for (const row of c.board()) for (const p of row) {
    if (!p || p.color !== oppColor) continue;
    if (c.attackers(p.square, me.color).includes(from)) out.push(p);
  }
  return out;
}
const defended = (c, square, color) => c.attackers(square, color).length > 0;

/** first piece hit when walking from `start` in direction (dx,dy) */
function firstOnRay(c, start, dx, dy) {
  let [x, y] = xy(start);
  for (;;) {
    x += dx; y += dy;
    const s = sq(x, y);
    if (!s) return null;
    const p = c.get(s);
    if (p) return { ...p, square: s };
  }
}
const DIRS = { r: [[1, 0], [-1, 0], [0, 1], [0, -1]], b: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
DIRS.q = [...DIRS.r, ...DIRS.b];

/** pins / skewers along rays from slider on `from`: returns [{front, back}] of opponent pieces */
function lineTargets(c, from) {
  const p = c.get(from);
  if (!p || !DIRS[p.type]) return [];
  const out = [];
  for (const [dx, dy] of DIRS[p.type]) {
    const a = firstOnRay(c, from, dx, dy);
    if (!a || a.color === p.color) continue;
    const b = firstOnRay(c, a.square, dx, dy);
    if (!b || b.color === p.color) continue;
    out.push({ front: a, back: b });
  }
  return out;
}

function isPinned(c, square) {
  const p = c.get(square);
  if (!p) return null;
  const opp = p.color === 'w' ? 'b' : 'w';
  for (const row of c.board()) for (const s of row) {
    if (!s || s.color !== opp || !DIRS[s.type]) continue;
    for (const t of lineTargets(c, s.square)) {
      if (t.front.square === square && (t.back.type === 'k' || VAL[t.back.type] > VAL[p.type])) return { pinner: s.square, behind: t.back };
    }
  }
  return null;
}

function tagPuzzle(pz) {
  const c = new Chess(pz.fen);
  play(c, pz.moves[0]);
  const solver = c.turn();
  const opp = solver === 'w' ? 'b' : 'w';
  const startFen = c.fen();
  const tags = new Set();
  const info = {};
  const positions = [];
  const sol = pz.moves.slice(1);
  // replay keeping positions before each move
  for (const u of sol) { positions.push(c.fen()); play(c, u); }
  const finalPos = new Chess(c.fen());

  for (let i = 0; i < sol.length; i += 2) {
    const before = new Chess(positions[i]);
    const u = sol[i];
    const from = u.slice(0, 2), to = u.slice(2, 4);
    const mover = before.get(from);
    const captured = before.get(to);
    const after = new Chess(positions[i]);
    const mv = play(after, u);
    const laterCaptures = [];
    for (let j = i + 2; j < sol.length; j += 2) laterCaptures.push({ to: sol[j].slice(2, 4), from: sol[j].slice(0, 2), j });
    const oppReply = sol[i + 1];

    if (mv.promotion) tags.add('promotion');
    // pin: the captured piece was pinned
    if (captured && isPinned(before, to)) { tags.add('pin'); info.pin ??= { pinned: captured.type, square: to }; }
    // fork
    if (mover.type !== 'p' || true) {
      const hit = attackedBy(after, to, opp).filter((t) => t.type === 'k' || VAL[t.type] > VAL[mover.type] || !defended(after, t.square, opp));
      const valuable = hit.filter((t) => t.type !== 'p');
      if (valuable.length >= 2 && laterCaptures.some((lc) => valuable.some((v) => v.square === lc.to && v.type !== 'k'))) {
        tags.add('fork');
        info.fork ??= { move: i, piece: mover.type, square: to, targets: valuable.map((v) => `${v.type}:${v.square}`) };
      }
    }
    // skewer: slider move attacks a valuable front piece with a lesser piece behind, which is captured after it moves
    if (DIRS[mover.type]) {
      for (const t of lineTargets(after, to)) {
        if ((t.front.type === 'k' || VAL[t.front.type] > VAL[t.back.type]) && oppReply && oppReply.slice(0, 2) === t.front.square &&
            laterCaptures.some((lc) => lc.to === t.back.square && lc.from === to)) {
          tags.add('skewer');
          info.skewer ??= { move: i, front: t.front.type, back: t.back.type, square: to, focus: [t.front.square, t.back.square] };
        }
        // pin created by this move and the pinned piece later captured
        if ((t.back.type === 'k' || VAL[t.back.type] > VAL[t.front.type]) && laterCaptures.some((lc) => lc.to === t.front.square)) {
          tags.add('pin');
          info.pin ??= { pinned: t.front.type, square: t.front.square, focus: [t.front.square, t.back.square] };
        }
      }
    }
    // discovered attack: another slider's attack is unmasked through `from`
    for (const row of after.board()) for (const s of row) {
      if (!s || s.color !== solver || s.square === to || !DIRS[s.type]) continue;
      for (const [dx, dy] of DIRS[s.type]) {
        const a = firstOnRay(after, s.square, dx, dy);
        if (!a || a.color !== opp || (a.type !== 'k' && VAL[a.type] < 3)) continue;
        const b0 = firstOnRay(before, s.square, dx, dy);
        if (b0 && b0.square === from) {
          const gain = a.type === 'k' || laterCaptures.some((lc) => lc.to === a.square) || (captured && VAL[captured.type] >= 3);
          if (gain) { tags.add('discoveredAttack'); info.discovered ??= { move: i, attacker: s.type, square: s.square, target: a.type, focus: [s.square, a.square] }; }
        }
      }
    }
    // double attack: two or more new threats against valuable/undefended pieces (by any pieces)
    const threatsBefore = new Set();
    for (const row of before.board()) for (const p of row) if (p && p.color === opp && before.attackers(p.square, solver).length) threatsBefore.add(p.square);
    const newThreats = [];
    for (const row of after.board()) for (const p of row) {
      if (!p || p.color !== opp || p.type === 'p') continue;
      if (!after.attackers(p.square, solver).length || threatsBefore.has(p.square)) continue;
      if (p.type === 'k' || !defended(after, p.square, opp) || after.attackers(p.square, solver).some((a) => VAL[after.get(a).type] < VAL[p.type])) newThreats.push(p);
    }
    if (newThreats.length >= 2 && !tags.has('fork')) { tags.add('doubleAttack'); info.double ??= { move: i, targets: newThreats.map((t) => `${t.type}:${t.square}`) }; }
    // sacrifice: the moved piece is captured next and was worth more than what it took
    if (oppReply && oppReply.slice(2, 4) === to && VAL[mover.type] > (captured ? VAL[captured.type] : 0) + 1 && mover.type !== 'k') tags.add('sacrifice');
  }
  // hanging piece: one-move capture of an undefended piece
  if (sol.length === 1) {
    const b = new Chess(positions[0]);
    const cap = b.get(sol[0].slice(2, 4));
    if (cap && !defended(b, sol[0].slice(2, 4), opp)) tags.add('hangingPiece');
  }
  if (pz.mateIn) {
    tags.add('mate');
    const kSq = (() => { for (const row of finalPos.board()) for (const p of row) if (p && p.type === 'k' && p.color === opp) return p.square; })();
    const backRank = opp === 'w' ? '1' : '8';
    if (kSq && kSq[1] === backRank) {
      const fwd = opp === 'w' ? 1 : -1;
      const [kx, ky] = xy(kSq);
      const blocked = [-1, 0, 1].map((d) => sq(kx + d, ky + fwd)).filter(Boolean).every((s) => { const p = finalPos.get(s); return p && p.color === opp; });
      if (blocked) tags.add('backRankMate');
    }
    info.mate = { king: kSq };
  }
  const startC = new Chess(startFen);
  let nonPawn = 0, total = 0;
  for (const row of startC.board()) for (const p of row) if (p && p.type !== 'k') { total++; if (p.type !== 'p') nonPawn++; }
  if (nonPawn <= 3 && total <= 10) tags.add('endgame');
  if (pz.kind === 'defense') tags.add('defense');
  return { tags: [...tags], info, startFen, solver };
}

module.exports = { tagPuzzle, VAL };
