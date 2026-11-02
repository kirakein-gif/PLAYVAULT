// Stockfish 19 Lite (single-threaded WASM) running in a Web Worker.
// - Jobs are serialised: a new search never starts until the previous one has
//   produced its "bestmove" (after "stop" if it was cancelled), so a reply can
//   never be attributed to the wrong position or the wrong game.
// - Callers pass a token and ignore results whose token is stale.
// - Communication failures surface as errors (no random fallback moves).
import { parseBestmove, parseInfo, parseOption, type UciInfo, type UciOption } from './uci';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SearchParams {
  fen: string;
  depth?: number;
  movetimeMs?: number;
  multipv?: number;
  skill?: number; // 0..20, undefined = full strength
  limitElo?: number; // only used when Skill Level is not supported
  onInfo?: (info: UciInfo) => void;
}

export interface SearchResult {
  bestmove: string | null;
  lines: UciInfo[]; // final line per multipv
  depth: number;
  cancelled: boolean;
}

export class EngineError extends Error {}

const ENGINE_URL = 'engine/stockfish-19-lite-single.js';
const INIT_TIMEOUT = 20000;

type Waiter = { pred: (l: string) => boolean; resolve: (l: string) => void };

export class StockfishAdapter {
  status: EngineStatus = 'idle';
  options = new Map<string, UciOption>();
  engineName = '';
  lastError = '';
  private worker: Worker | null = null;
  private waiters: Waiter[] = [];
  private lineHandler: ((l: string) => void) | null = null;
  private chain: Promise<unknown> = Promise.resolve();
  private initPromise: Promise<void> | null = null;
  private searching = false;
  private statusListeners = new Set<(s: EngineStatus) => void>();
  private applied: Record<string, string> = {};

  constructor(private url: string = ENGINE_URL) {}

  onStatus(fn: (s: EngineStatus) => void): () => void {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  private setStatus(s: EngineStatus) {
    this.status = s;
    this.statusListeners.forEach((f) => f(s));
  }

  private post(cmd: string) {
    if (!this.worker) throw new EngineError('engine not started');
    this.worker.postMessage(cmd);
  }

  private onLine(line: string) {
    if (this.lineHandler) this.lineHandler(line);
    for (const w of [...this.waiters]) {
      if (w.pred(line)) {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        w.resolve(line);
      }
    }
  }

  private waitFor(pred: (l: string) => boolean, timeoutMs: number, what: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const w: Waiter = {
        pred,
        resolve: (l) => {
          clearTimeout(t);
          resolve(l);
        },
      };
      const t = setTimeout(() => {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        reject(new EngineError(`engine timeout waiting for ${what}`));
      }, timeoutMs);
      this.waiters.push(w);
    });
  }

  init(): Promise<void> {
    if (this.status === 'ready') return Promise.resolve();
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.start().finally(() => (this.initPromise = null));
    return this.initPromise;
  }

  private async start() {
    this.setStatus('loading');
    try {
      const url = new URL(this.url, document.baseURI).href;
      this.worker = new Worker(url);
      this.worker.onmessage = (e: MessageEvent) => {
        const data = typeof e.data === 'string' ? e.data : '';
        for (const l of data.split('\n')) if (l) this.onLine(l.trim());
      };
      this.worker.onerror = (e) => this.fail(`worker error: ${e.message || 'unknown'}`);
      this.options.clear();
      this.applied = {};
      const collect = (l: string) => {
        const o = parseOption(l);
        if (o) this.options.set(o.name, o);
        if (l.startsWith('id name ')) this.engineName = l.slice(8);
      };
      this.lineHandler = collect;
      const ok = this.waitFor((l) => l === 'uciok', INIT_TIMEOUT, 'uciok');
      this.post('uci');
      await ok;
      this.lineHandler = null;
      this.setOption('Hash', '16');
      await this.isReady(INIT_TIMEOUT);
      this.setStatus('ready');
    } catch (e) {
      this.fail(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  private fail(msg: string) {
    this.lastError = msg;
    this.terminate();
    this.setStatus('error');
    for (const w of this.waiters.splice(0)) w.resolve('__error__');
  }

  private async isReady(timeout = 10000) {
    const p = this.waitFor((l) => l === 'readyok' || l === '__error__', timeout, 'readyok');
    this.post('isready');
    if ((await p) === '__error__') throw new EngineError(this.lastError || 'engine failed');
  }

  private setOption(name: string, value: string) {
    if (this.applied[name] === value) return;
    this.applied[name] = value;
    this.post(`setoption name ${name} value ${value}`);
  }

  supports(name: string) {
    return this.options.has(name);
  }

  /** Runs exclusively after any queued job. */
  private enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = this.chain.then(job, job);
    this.chain = run.catch(() => undefined);
    return run;
  }

  newGame(): Promise<void> {
    return this.enqueue(async () => {
      await this.init();
      this.post('ucinewgame');
      await this.isReady();
    });
  }

  /** Interrupts the running search; its promise resolves with cancelled=true. */
  stop() {
    if (this.searching && this.worker) this.post('stop');
  }

  search(p: SearchParams, isStale: () => boolean = () => false): Promise<SearchResult> {
    return this.enqueue(async () => {
      if (isStale()) return { bestmove: null, lines: [], depth: 0, cancelled: true };
      await this.init();
      if (p.skill !== undefined && this.supports('Skill Level')) {
        this.setOption('UCI_LimitStrength', 'false');
        this.setOption('Skill Level', String(p.skill));
      } else if (p.limitElo !== undefined && this.supports('UCI_LimitStrength')) {
        const opt = this.options.get('UCI_Elo');
        const elo = Math.max(opt?.min ?? 0, Math.min(opt?.max ?? 4000, p.limitElo));
        this.setOption('UCI_LimitStrength', 'true');
        this.setOption('UCI_Elo', String(elo));
      } else {
        if (this.supports('Skill Level')) this.setOption('Skill Level', '20');
        if (this.supports('UCI_LimitStrength')) this.setOption('UCI_LimitStrength', 'false');
      }
      this.setOption('MultiPV', String(p.multipv ?? 1));
      await this.isReady();
      const lines = new Map<number, UciInfo>();
      let depth = 0;
      this.lineHandler = (l) => {
        const info = parseInfo(l);
        if (!info || info.bound) return;
        lines.set(info.multipv, info);
        depth = Math.max(depth, info.depth);
        p.onInfo?.(info);
      };
      let cancelled = false;
      const guard = (p.movetimeMs ?? 0) + 15000;
      const done = this.waitFor((l) => l.startsWith('bestmove') || l === '__error__', guard, 'bestmove');
      this.post(`position fen ${p.fen}`);
      const parts = ['go'];
      if (p.depth) parts.push('depth', String(p.depth));
      if (p.movetimeMs) parts.push('movetime', String(p.movetimeMs));
      this.searching = true;
      const staleTimer = setInterval(() => {
        if (!cancelled && isStale()) {
          cancelled = true;
          this.post('stop');
        }
      }, 50);
      this.post(parts.join(' '));
      try {
        const line = await done;
        if (line === '__error__') throw new EngineError(this.lastError || 'engine failed');
        return {
          bestmove: parseBestmove(line),
          lines: [...lines.values()].sort((a, b) => a.multipv - b.multipv),
          depth,
          cancelled: cancelled || isStale(),
        };
      } catch (e) {
        if (!(e instanceof EngineError) || this.status !== 'error') this.fail(e instanceof Error ? e.message : String(e));
        throw e;
      } finally {
        clearInterval(staleTimer);
        this.searching = false;
        this.lineHandler = null;
      }
    });
  }

  terminate() {
    try {
      this.worker?.terminate();
    } catch {
      /* ignore */
    }
    this.worker = null;
    this.searching = false;
  }

  /** Full restart after an error (user pressed "retry"). */
  async restart(): Promise<void> {
    this.terminate();
    this.chain = Promise.resolve();
    this.waiters = [];
    this.setStatus('idle');
    await this.init();
  }
}

let shared: StockfishAdapter | null = null;
/** One engine instance for the whole app (WASM memory is not free). */
export function getEngine(): StockfishAdapter {
  if (!shared) shared = new StockfishAdapter();
  return shared;
}
