// Copies the single-threaded Stockfish 19 Lite WASM build from the pinned npm
// package into public/engine so it ships inside the APK (no CDN at runtime).
import { copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'stockfish', 'bin');
const dst = join(root, 'public', 'engine');
mkdirSync(dst, { recursive: true });
for (const f of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  const from = join(src, f);
  if (!existsSync(from)) throw new Error(`missing engine file ${from} — run npm install`);
  copyFileSync(from, join(dst, f));
  console.log(`engine: ${f} (${statSync(from).size} bytes)`);
}
copyFileSync(join(root, 'node_modules', 'stockfish', 'Copying.txt'), join(root, 'public', 'licenses', 'STOCKFISH-GPL-3.0.txt'));
