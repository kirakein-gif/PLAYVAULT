// Wood-and-metal sound set synthesised once into AudioBuffers (no network, no
// files). Modal synthesis: a short noise "contact" + decaying resonant modes of a
// wooden piece hitting a wooden board, plus a low body thump. Bells use
// inharmonic partials and a small generated room reverb.
//
// Audio starts only after a user gesture (unlock()). Events are prioritised so a
// checkmate never stacks with the ordinary check alert.

export type SoundName =
  | 'select'
  | 'move'
  | 'capture'
  | 'castle'
  | 'check'
  | 'mate'
  | 'promote'
  | 'button'
  | 'draw'
  | 'wrong'
  | 'correct'
  | 'solved'
  | 'illegal';

type Mode = [freq: number, amp: number, decay: number];

const SR = 44100;

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
}

function buffer(ctx: BaseAudioContext, seconds: number, fill: (data: Float32Array) => void): AudioBuffer {
  const b = ctx.createBuffer(1, Math.ceil(seconds * SR), SR);
  fill(b.getChannelData(0));
  return b;
}

/** One wooden impact. */
function knock(d: Float32Array, at: number, o: { modes: Mode[]; noise: number; noiseMs: number; thump: number; thumpHz: number; gain: number; seed: number }) {
  const n0 = Math.floor(at * SR);
  const r = rand(o.seed);
  let lp = 0;
  const noiseLen = Math.floor((o.noiseMs / 1000) * SR);
  for (let i = 0; i < d.length - n0; i++) {
    const t = i / SR;
    let v = 0;
    for (const [f, a, dec] of o.modes) v += a * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / dec);
    if (i < noiseLen) {
      const env = Math.exp(-i / (noiseLen * 0.25));
      const raw = r();
      lp += 0.35 * (raw - lp); // soft contact click (low-passed noise)
      v += o.noise * env * (raw - lp * 0.6);
    }
    v += o.thump * Math.sin(2 * Math.PI * o.thumpHz * t) * Math.exp(-t / 0.028) * Math.min(1, t * 2000);
    const attack = Math.min(1, t * 6000);
    d[n0 + i] += o.gain * v * attack;
  }
}

/** Bell / chime note with inharmonic partials. */
function bell(d: Float32Array, at: number, f: number, gain: number, decay: number, bright = 1) {
  const n0 = Math.floor(at * SR);
  const partials: Mode[] = [
    [f, 1, decay],
    [f * 2.0, 0.42 * bright, decay * 0.6],
    [f * 2.76, 0.3 * bright, decay * 0.45],
    [f * 5.4, 0.12 * bright, decay * 0.25],
    [f * 0.5, 0.18, decay * 1.1],
  ];
  for (let i = 0; i < d.length - n0; i++) {
    const t = i / SR;
    let v = 0;
    for (const [pf, a, dec] of partials) v += a * Math.sin(2 * Math.PI * pf * t) * Math.exp(-t / dec);
    d[n0 + i] += gain * v * Math.min(1, t * 900);
  }
}

function normalize(d: Float32Array, peak: number) {
  let m = 0;
  for (const v of d) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < d.length; i++) d[i] = (d[i] / m) * peak;
}

const WOOD: Mode[] = [
  [760, 1, 0.05],
  [1490, 0.55, 0.032],
  [2310, 0.32, 0.022],
  [3650, 0.14, 0.012],
];
const scaleModes = (m: Mode[], k: number, dk = 1): Mode[] => m.map(([f, a, d]) => [f * k, a, d * dk]);

export function synthesize(ctx: BaseAudioContext): Record<SoundName, AudioBuffer> {
  const B = (s: number, fn: (d: Float32Array) => void, peak: number) =>
    buffer(ctx, s, (d) => {
      fn(d);
      normalize(d, peak);
    });
  return {
    select: B(0.08, (d) => knock(d, 0, { modes: scaleModes(WOOD, 1.9, 0.5), noise: 0.5, noiseMs: 4, thump: 0, thumpHz: 0, gain: 1, seed: 3 }), 0.25),
    move: B(0.25, (d) => knock(d, 0, { modes: WOOD, noise: 0.9, noiseMs: 6, thump: 0.9, thumpHz: 170, gain: 1, seed: 7 }), 0.7),
    capture: B(0.32, (d) => {
      knock(d, 0, { modes: scaleModes(WOOD, 0.72, 1.25), noise: 1.3, noiseMs: 9, thump: 1.6, thumpHz: 120, gain: 1, seed: 11 });
      knock(d, 0.045, { modes: scaleModes(WOOD, 1.25, 0.6), noise: 0.4, noiseMs: 4, thump: 0, thumpHz: 0, gain: 0.35, seed: 13 });
    }, 0.95),
    castle: B(0.4, (d) => {
      knock(d, 0, { modes: WOOD, noise: 0.9, noiseMs: 6, thump: 0.8, thumpHz: 170, gain: 1, seed: 17 });
      knock(d, 0.13, { modes: scaleModes(WOOD, 0.9), noise: 0.8, noiseMs: 6, thump: 0.8, thumpHz: 160, gain: 0.85, seed: 19 });
    }, 0.7),
    check: B(0.55, (d) => {
      bell(d, 0, 1174.7, 0.8, 0.16, 1.1);
      bell(d, 0.09, 1108.7, 0.6, 0.2, 1.1);
    }, 0.38),
    mate: B(2.4, (d) => {
      knock(d, 0, { modes: scaleModes(WOOD, 0.72, 1.25), noise: 1.2, noiseMs: 8, thump: 1.5, thumpHz: 110, gain: 0.9, seed: 23 });
      [392, 493.9, 587.3, 784].forEach((f, i) => bell(d, 0.18 + i * 0.13, f, i === 3 ? 0.95 : 0.7, 0.9 - i * 0.05, 0.8));
      bell(d, 0.75, 196, 0.5, 1.2, 0.4);
    }, 0.6),
    promote: B(0.7, (d) => {
      knock(d, 0, { modes: WOOD, noise: 0.8, noiseMs: 6, thump: 0.6, thumpHz: 170, gain: 0.8, seed: 29 });
      [784, 987.8, 1318.5].forEach((f, i) => bell(d, 0.06 + i * 0.07, f, 0.5 + i * 0.1, 0.22, 0.7));
    }, 0.45),
    button: B(0.06, (d) => knock(d, 0, { modes: [[2200, 0.6, 0.008], [3400, 0.3, 0.005]], noise: 0.4, noiseMs: 3, thump: 0.25, thumpHz: 400, gain: 1, seed: 31 }), 0.18),
    draw: B(1.2, (d) => {
      bell(d, 0, 523.3, 0.7, 0.6, 0.6);
      bell(d, 0.2, 392, 0.6, 0.7, 0.6);
    }, 0.4),
    wrong: B(0.3, (d) => {
      knock(d, 0, { modes: scaleModes(WOOD, 0.55, 0.8), noise: 0.4, noiseMs: 5, thump: 0.9, thumpHz: 140, gain: 0.8, seed: 37 });
      knock(d, 0.1, { modes: scaleModes(WOOD, 0.48, 0.8), noise: 0.3, noiseMs: 5, thump: 0.8, thumpHz: 120, gain: 0.6, seed: 41 });
    }, 0.35),
    illegal: B(0.15, (d) => knock(d, 0, { modes: scaleModes(WOOD, 0.5, 0.6), noise: 0.3, noiseMs: 4, thump: 0.8, thumpHz: 130, gain: 1, seed: 43 }), 0.25),
    correct: B(0.6, (d) => bell(d, 0, 880, 0.8, 0.3, 0.7), 0.35),
    solved: B(1.3, (d) => [523.3, 659.3, 784, 1046.5].forEach((f, i) => bell(d, i * 0.09, f, 0.7, 0.5, 0.7)), 0.45),
  };
}

const REVERB_SEND: Partial<Record<SoundName, number>> = { check: 0.25, mate: 0.4, promote: 0.3, draw: 0.35, correct: 0.3, solved: 0.35, capture: 0.08, move: 0.06, castle: 0.06 };
const PRIORITY: Record<SoundName, number> = {
  mate: 5, draw: 4, solved: 4, check: 3, promote: 2, capture: 2, castle: 2, wrong: 2, correct: 2, move: 1, select: 0, button: 0, illegal: 0,
};

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private buffers: Record<SoundName, AudioBuffer> | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private lastHigh = { prio: -1, until: 0 };
  enabled = true;
  volume = 0.8;

  /** Must be called from a user gesture (first tap). Safe to call repeatedly. */
  unlock() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = this.impulse(this.ctx);
      const wet = this.ctx.createGain();
      wet.gain.value = 0.9;
      this.reverb.connect(wet).connect(this.master);
      this.buffers = synthesize(this.ctx);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private impulse(ctx: AudioContext): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * 1.1);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      const r = rand(91 + ch);
      for (let i = 0; i < len; i++) d[i] = r() * Math.pow(1 - i / len, 3.2) * 0.5;
    }
    return b;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  play(name: SoundName, delayMs = 0, pitch = 1) {
    if (!this.enabled || !this.ctx || !this.buffers || !this.master || this.volume <= 0) return;
    const now = this.ctx.currentTime;
    const at = now + delayMs / 1000;
    const prio = PRIORITY[name];
    // a higher-priority event in flight swallows lower alerts (e.g. check under mate)
    if (prio >= 2 && prio < this.lastHigh.prio && at < this.lastHigh.until) return;
    if (prio >= 3) this.lastHigh = { prio, until: at + 0.6 };
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[name];
    src.playbackRate.value = pitch;
    src.connect(this.master);
    const send = REVERB_SEND[name];
    if (send && this.reverb) {
      const g = this.ctx.createGain();
      g.gain.value = send;
      src.connect(g).connect(this.reverb);
    }
    src.start(at);
  }

  /** Sound for a played move: one placement sound, then at most one alert. */
  playMove(m: { captured?: string; isCastle: boolean; promotion?: string; isCheck: boolean; isCheckmate: boolean }) {
    const pitch = 0.96 + Math.random() * 0.08; // natural variation between pieces
    if (m.isCheckmate) {
      this.play(m.captured ? 'capture' : 'move', 0, pitch);
      this.play('mate', 140);
      return;
    }
    if (m.promotion) this.play('promote');
    else if (m.isCastle) this.play('castle', 0, pitch);
    else if (m.captured) this.play('capture', 0, pitch);
    else this.play('move', 0, pitch);
    if (m.isCheck) this.play('check', m.isCastle ? 200 : 90);
  }
}

export const sound = new SoundEngine();
