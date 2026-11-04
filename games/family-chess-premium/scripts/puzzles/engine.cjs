// Promise-based UCI wrapper around the npm stockfish package (Node only).
// Used by the offline puzzle generation / verification scripts.
const path = require('path');
const sfFactory = require(path.join(__dirname, '..', '..', 'node_modules', 'stockfish', 'index.js'));

class Engine {
  constructor(kind = 'single') {
    this.kind = kind;
    this.waiters = [];
    this.lines = [];
    this.e = sfFactory(kind, (line) => this._onLine(line));
  }
  _onLine(line) {
    for (const w of [...this.waiters]) {
      if (w.collect) w.collect.push(line);
      if (w.pred(line)) {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        setTimeout(() => w.resolve(w.collect || line), 0);
      }
    }
  }
  send(cmd) { this.e.processCommand(cmd); }
  waitFor(pred, collect = false) {
    return new Promise((resolve) => this.waiters.push({ pred, resolve, collect: collect ? [] : null }));
  }
  async init(options = {}) {
    const p = this.waitFor((l) => l === 'uciok');
    this.send('uci');
    await p;
    for (const [k, v] of Object.entries(options)) this.send(`setoption name ${k} value ${v}`);
    await this.ready();
  }
  async ready() {
    const p = this.waitFor((l) => l === 'readyok');
    this.send('isready');
    await p;
  }
  async newGame() { this.send('ucinewgame'); await this.ready(); }
  setOption(k, v) { this.send(`setoption name ${k} value ${v}`); }
  /** returns {bestmove, lines:[{multipv, depth, score:{cp|mate}, pv:[]}]} */
  async go(fen, goCmd, multipv = 1) {
    this.setOption('MultiPV', multipv);
    await this.ready();
    this.send(`position fen ${fen}`);
    const p = this.waitFor((l) => l.startsWith('bestmove'), true);
    this.send(goCmd);
    const out = await p;
    const best = {};
    for (const l of out) {
      if (!l.startsWith('info ') || !l.includes(' pv ') || l.includes('lowerbound') || l.includes('upperbound')) continue;
      const m = l.match(/ depth (\d+).* multipv (\d+) score (cp|mate) (-?\d+).* pv (.+)$/);
      if (!m) continue;
      const mpv = +m[2];
      best[mpv] = { depth: +m[1], multipv: mpv, score: m[3] === 'cp' ? { cp: +m[4] } : { mate: +m[4] }, pv: m[5].trim().split(' ') };
    }
    const bm = out[out.length - 1].split(' ')[1];
    return { bestmove: bm, lines: Object.values(best).sort((a, b) => a.multipv - b.multipv) };
  }
  quit() { try { this.e.terminate(); } catch (_) {} }
}

/** score -> win chance in [-1,1] for side to move (Lichess formula). */
function winChance(score) {
  if (score.mate !== undefined) return score.mate > 0 ? 1 : -1;
  const cp = Math.max(-1000, Math.min(1000, score.cp));
  return 2 / (1 + Math.exp(-0.00368208 * cp)) - 1;
}

module.exports = { Engine, winChance };
