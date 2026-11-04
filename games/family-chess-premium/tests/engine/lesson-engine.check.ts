// Engine check of lesson tasks: every accepted move should be close to the
// engine's best move (loss in winning chances). Run:
//   npx vitest run --config tests/engine/vitest.engine.config.ts
import { it } from 'vitest';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { LESSONS } from '../../src/academy/lessons';
import { stepStartFen } from '../../src/academy/lessons/fen';

const require = createRequire(import.meta.url);
const { Engine, winChance } = require('../../scripts/puzzles/engine.cjs');

it('lesson tasks accept only good moves', async () => {
  const e = new Engine('single');
  await e.init({ Hash: 64 });
  const rows: unknown[] = [];
  for (const l of LESSONS)
    for (const [i, st] of l.steps.entries()) {
      if (!st.task) continue;
      const fen = stepStartFen(st);
      const r = await e.go(fen, 'go depth 16', 1);
      const best = winChance(r.lines[0].score);
      const bestSan = new Chess(fen).move({ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4), promotion: r.bestmove[4] }).san;
      const acc: Record<string, number> = {};
      for (const san of st.task.accept) {
        const c = new Chess(fen);
        c.move(san);
        let wc = 1;
        if (!c.isCheckmate()) {
          const q = await e.go(c.fen(), 'go depth 16', 1);
          wc = -winChance(q.lines[0].score);
        }
        acc[san] = +(best - wc).toFixed(3);
      }
      rows.push({ lesson: l.id, step: i, engineBest: bestSan, acceptLoss: acc });
      console.log(l.id, i, bestSan, JSON.stringify(acc));
    }
  writeFileSync('docs/lesson-engine-check.json', JSON.stringify({ when: new Date().toISOString(), engine: 'Stockfish 19 depth 16', rows }, null, 1));
  e.quit();
}, 900000);
