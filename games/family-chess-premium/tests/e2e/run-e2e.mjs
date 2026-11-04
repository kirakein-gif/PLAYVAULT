// Browser acceptance tests on the production build, fully offline:
// every request that is not to the local preview server is aborted and logged.
// usage: NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs [outDir]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = process.argv[2] || join(root, 'test-results', 'e2e');
mkdirSync(out, { recursive: true });
const PORT = 4180;
const BASE = `http://localhost:${PORT}/`;

const results = [];
const external = [];
let current = '';
async function test(name, fn) {
  current = name;
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t0 });
    console.log(`  ✓ ${name} (${Date.now() - t0} ms)`);
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, error: String(e?.message || e).slice(0, 500) });
    console.log(`  ✗ ${name}\n    ${String(e?.message || e).slice(0, 300)}`);
  }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

// E2E_OUTDIR=play runs the same suite against the PLAYVAULT web build (npm run build:web)
const outDirArgs = process.env.E2E_OUTDIR ? ['--outDir', process.env.E2E_OUTDIR] : [];
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', ...outDirArgs], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();

async function newPage(vp = { width: 1280, height: 800 }, storage = null) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: false });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    external.push({ test: current, url: u });
    return route.abort();
  });
  if (storage) await ctx.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, storage);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.errors = errors;
  await page.goto(BASE);
  await page.waitForSelector('[data-testid=menu-ai]', { timeout: 15000 });
  return page;
}
const center = async (page, sq) => { const b = await page.locator(`[data-square=${sq}]`).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
async function tap(page, sq) { const [x, y] = await center(page, sq); await page.mouse.click(x, y); await page.waitForTimeout(120); }
async function drag(page, a, b) {
  const [x1, y1] = await center(page, a), [x2, y2] = await center(page, b);
  await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move(x2, y2, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(150);
}
const sans = (page) => page.locator('.moveSan').allInnerTexts().then((a) => a.filter((x) => x.trim()));
const pieceAt = (page, sq) => page.locator(`.piece[data-sq=${sq}]:not(.ghost)`).getAttribute('data-piece').catch(() => null);
const storageDump = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.fcp.data.v1') || 'null'));
async function startAi(page, level, color = 'w') {
  await page.click('[data-testid=menu-ai]');
  if (await page.locator('[data-testid=confirm-no]').count()) await page.click('[data-testid=confirm-no]');
  await page.click(`[data-testid=level-${level}]`);
  await page.click(`[data-testid=color-${color}]`);
  await page.click('[data-testid=setup-start]');
  await page.waitForSelector('[data-square=e2]');
}

console.log('E2E (offline, production build)');

await test('home shows exactly three main menus, title, language and settings', async () => {
  const p = await newPage();
  assert((await p.locator('.menuCard').count()) === 3, 'three menu cards');
  assert(await p.locator('[data-testid=lang-toggle]').isVisible(), 'lang toggle');
  assert(await p.locator('[data-testid=settings-btn]').isVisible(), 'settings');
  assert((await p.locator('.brandName').innerText()) === 'CHESS MASTER', 'title is English');
  await p.click('[data-testid=lang-toggle]');
  assert((await p.locator('.brandName').innerText()) === 'CHESS MASTER', 'title stays English in EN mode');
  await p.context().close();
});

await test('two players: tap-tap and drag moves, illegal move guidance, undo, flip', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-two]');
  await tap(p, 'e2'); await tap(p, 'e4');
  assert((await pieceAt(p, 'e4')) === 'wp', 'tap move');
  await drag(p, 'e7', 'e5');
  assert((await pieceAt(p, 'e5')) === 'bp', 'drag move');
  await drag(p, 'g1', 'g4'); // illegal: knight cannot go there
  assert((await pieceAt(p, 'g1')) === 'wn', 'illegal drop returns home');
  assert((await p.locator('[data-testid=toast]').count()) === 1, 'gentle guidance toast');
  assert((await sans(p)).join(' ') === 'e4 e5', 'moves listed');
  await p.click('[data-testid=undo]');
  assert((await sans(p)).join(' ') === 'e4', 'undo one ply');
  await p.click('[data-testid=flip]');
  await p.waitForTimeout(300);
  const a1 = await p.locator('[data-square=a1]').boundingBox();
  const h8 = await p.locator('[data-square=h8]').boundingBox();
  assert(a1.y < h8.y, 'board flipped');
  await p.context().close();
});

await test('special moves: castling, en passant, promotion picker', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-two]');
  for (const [a, b] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['e5', 'd6']]) await tap(p, a), await tap(p, b);
  assert(!(await pieceAt(p, 'd5')), 'en passant removed the d5 pawn');
  for (const [a, b] of [['c7', 'd6'], ['g1', 'f3'], ['b8', 'c6'], ['f1', 'e2'], ['c8', 'g4'], ['e1', 'g1']]) await tap(p, a), await tap(p, b);
  assert((await pieceAt(p, 'g1')) === 'wk' && (await pieceAt(p, 'f1')) === 'wr', 'castled king side');
  await p.context().close();
  const q = await newPage();
  await q.click('[data-testid=menu-two]');
  for (const [a, b] of [['h2', 'h4'], ['g7', 'g5'], ['h4', 'g5'], ['h7', 'h6'], ['g5', 'h6'], ['f8', 'g7'], ['h6', 'g7'], ['g8', 'f6']]) await tap(q, a), await tap(q, b);
  await tap(q, 'g7'); await tap(q, 'h8');
  await q.waitForSelector('.promoBox');
  await q.click('[data-promo=n]');
  await q.waitForTimeout(300);
  assert((await pieceAt(q, 'h8')) === 'wn', 'under-promotion to knight');
  await q.context().close();
});

await test('checkmate ends the game with a result and review button', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-two]');
  for (const [a, b] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) await tap(p, a), await tap(p, b);
  await p.waitForSelector('[data-testid=result]', { timeout: 5000 });
  assert((await p.locator('[data-testid=result]').innerText()).includes('체크메이트'), 'checkmate reason');
  assert(await p.locator('[data-testid=go-review]').isVisible(), 'review button');
  await p.screenshot({ path: join(out, 'checkmate.png') });
  await p.context().close();
});

const levelReplies = {};
await test('Stockfish answers at all five levels (offline Web Worker WASM)', async () => {
  const p = await newPage();
  for (const level of [1, 2, 3, 4, 5]) {
    await startAi(p, level);
    await tap(p, 'e2'); await tap(p, 'e4');
    const t0 = Date.now();
    await p.waitForFunction(() => [...document.querySelectorAll('.moveSan')].filter((x) => x.textContent.trim()).length >= 2, null, { timeout: 30000 });
    levelReplies[level] = { ms: Date.now() - t0, reply: (await sans(p))[1] };
    await p.click('[data-testid=game-home]');
  }
  assert(p.errors.length === 0, `page errors: ${p.errors.join('; ')}`);
  await p.context().close();
});

await test('computer plays first as White when the player takes Black', async () => {
  const p = await newPage();
  await startAi(p, 2, 'b');
  await p.waitForFunction(() => [...document.querySelectorAll('.moveSan')].filter((x) => x.textContent.trim()).length >= 1, null, { timeout: 20000 });
  const a1 = await p.locator('[data-square=a1]').boundingBox();
  const a8 = await p.locator('[data-square=a8]').boundingBox();
  assert(a1.y < a8.y, 'board oriented for Black');
  await p.context().close();
});

await test('undo while the computer is thinking never applies a stale reply', async () => {
  const p = await newPage();
  await startAi(p, 5);
  for (let i = 0; i < 3; i++) {
    await tap(p, 'e2'); await tap(p, 'e4');
    await p.waitForTimeout(80);
    await p.click('[data-testid=undo]');
    await p.waitForTimeout(2600); // longer than level-5 thinking
    const m = await sans(p);
    assert(m.length === 0, `expected empty move list after undo, got ${m.join(' ')}`);
    assert((await pieceAt(p, 'e2')) === 'wp', 'pawn back on e2');
  }
  // the engine still works afterwards
  await tap(p, 'd2'); await tap(p, 'd4');
  await p.waitForFunction(() => [...document.querySelectorAll('.moveSan')].filter((x) => x.textContent.trim()).length >= 2, null, { timeout: 20000 });
  await p.context().close();
});

await test('consecutive games and new game reset the engine state', async () => {
  const p = await newPage();
  for (let g = 0; g < 3; g++) {
    await startAi(p, 3);
    await tap(p, 'g1'); await tap(p, 'f3');
    await p.waitForFunction(() => [...document.querySelectorAll('.moveSan')].filter((x) => x.textContent.trim()).length >= 2, null, { timeout: 20000 });
    await p.click('[data-testid=new-game]');
    if (await p.locator('[data-testid=confirm-yes]').count()) await p.click('[data-testid=confirm-yes]');
    await p.click('[data-testid=setup-start]');
    await p.waitForTimeout(400);
    assert((await sans(p)).length === 0, 'new game starts empty');
    await p.click('[data-testid=game-home]');
  }
  await p.context().close();
});

await test('a game in progress is saved and can be resumed after reload', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-two]');
  await tap(p, 'd2'); await tap(p, 'd4'); await tap(p, 'd7'); await tap(p, 'd5');
  await p.click('[data-testid=game-home]');
  await p.waitForTimeout(700);
  await p.reload();
  await p.waitForSelector('[data-testid=menu-two]');
  await p.click('[data-testid=menu-two]');
  await p.click('[data-testid=confirm-yes]');
  await p.waitForTimeout(400);
  assert((await sans(p)).join(' ') === 'd4 d5', 'resumed moves');
  await p.context().close();
});


// ---------- academy ----------
const PUZZLES = JSON.parse(readFileSync(join(root, 'src/academy/puzzles/puzzles.json'), 'utf8'));
const { Chess } = require(join(root, 'node_modules/chess.js'));
const firstMate = PUZZLES.find((x) => x.mateIn === 1);
const multi = PUZZLES.find((x) => x.moves.length >= 4 && x.category !== 'mate') || PUZZLES.find((x) => x.moves.length >= 4);
function wrongMoveFor(pz) {
  const c = new Chess(pz.fen);
  c.move({ from: pz.moves[0].slice(0, 2), to: pz.moves[0].slice(2, 4), promotion: pz.moves[0][4] });
  for (const m of c.moves({ verbose: true })) {
    const u = m.from + m.to + (m.promotion || '');
    if (u === pz.moves[1] || pz.alternatives.includes(u)) continue;
    const t = new Chess(c.fen()); t.move(m.san);
    if (t.isCheckmate()) continue;
    return u;
  }
  throw new Error('no wrong move');
}
async function openPuzzle(p, pz) {
  const course = pz.category === 'mate' ? 'checkmate' : pz.category === 'endgame' ? 'endgames' : 'tactics';
  await p.goto(BASE); await p.waitForSelector('[data-testid=menu-academy]');
  await p.click('[data-testid=menu-academy]');
  if (course === 'endgames') { await p.click('[data-testid=course-endgames]'); await p.click('[data-testid=endgame-puzzles]'); }
  else await p.click(`[data-testid=course-${course}]`);
  await p.click(`[data-testid=stage-${pz.id}]`);
  await p.waitForSelector('[data-testid=prompt]');
  await p.waitForFunction(() => !document.querySelector('[data-testid=pz-msg]'), null, { timeout: 5000 });
}
async function playUci(p, u) {
  await tap(p, u.slice(0, 2)); await tap(p, u.slice(2, 4));
  if (u[4] || (await p.locator('.promoBox').count())) { await p.waitForSelector('.promoBox'); await p.click(`[data-promo=${u[4] || 'q'}]`); }
}
async function solveRest(p, pz) {
  for (let i = 1; i < pz.moves.length; i += 2) {
    await playUci(p, pz.moves[i]);
    if (i + 1 < pz.moves.length) await p.waitForTimeout(1000);
  }
  await p.waitForSelector('[data-testid=pz-solved]', { timeout: 5000 });
  return p.locator('[data-testid=pz-solved] .star.on').count();
}
const record = async (p, id) => (await storageDump(p))?.profiles?.[(await storageDump(p)).activeProfileId]?.puzzles?.[id];

await test('puzzle: the set-up move is played first, then a correct answer gives ★★★', async () => {
  const p = await newPage();
  await openPuzzle(p, firstMate);
  // the board shows the position AFTER the opponent's first move
  const c = new Chess(firstMate.fen);
  const mv = c.move({ from: firstMate.moves[0].slice(0, 2), to: firstMate.moves[0].slice(2, 4), promotion: firstMate.moves[0][4] });
  assert((await pieceAt(p, mv.to)) === mv.color + mv.piece, 'set-up move applied');
  assert((await solveRest(p, firstMate)) === 3, 'three stars');
  await p.waitForTimeout(600);
  const r = await record(p, firstMate.id);
  assert(r && r.best === 3 && r.solved && r.attempts === 1, `record ${JSON.stringify(r)}`);
  await p.context().close();
});

await test('puzzle: a wrong move is refused without revealing the answer, then ★★', async () => {
  const p = await newPage();
  await openPuzzle(p, multi);
  const w = wrongMoveFor(multi);
  await playUci(p, w);
  assert((await p.locator('[data-testid=pz-msg]').innerText()).length > 0, 'feedback shown');
  assert((await p.locator('.arrow').count()) === 0, 'no answer arrow shown');
  assert((await pieceAt(p, w.slice(0, 2))) !== null, 'piece returned');
  assert((await solveRest(p, multi)) === 2, 'two stars');
  await p.context().close();
});

await test('puzzle: hints (3 levels) give ★, the best record is kept, history logged', async () => {
  const p = await newPage();
  await openPuzzle(p, firstMate);
  assert((await solveRest(p, firstMate)) === 3, 'first 3 stars');
  await openPuzzle(p, firstMate);
  await p.click('[data-testid=hint]');
  assert((await p.locator('[data-testid=hints] div').count()) === 1, 'hint 1');
  await p.click('[data-testid=hint]');
  assert((await p.locator('.sq.hl').count()) >= 1, 'hint 2 highlights squares');
  await p.click('[data-testid=hint]');
  assert((await p.locator('.arrow.hint').count()) === 1, 'hint 3 shows the move');
  assert((await solveRest(p, firstMate)) === 1, 'one star this time');
  await p.waitForTimeout(600);
  const r = await record(p, firstMate.id);
  assert(r.best === 3 && r.attempts === 2 && r.lastResult === 'stars1' && r.hintUsed, `kept best ${JSON.stringify(r)}`);
  await p.context().close();
});

await test('puzzle: leaving after a wrong move counts as unsolved and shows in the filter', async () => {
  const p = await newPage();
  await openPuzzle(p, multi);
  await playUci(p, wrongMoveFor(multi));
  await p.click('[data-testid=back]');
  await p.click('[data-testid=filter-unsolved]');
  assert((await p.locator(`[data-testid=stage-${multi.id}]`).count()) === 1, 'listed as unsolved');
  await p.click('[data-testid=filter-untried]');
  assert((await p.locator(`[data-testid=stage-${multi.id}]`).count()) === 0, 'not untried anymore');
  await p.context().close();
});

await test('switching language mid-puzzle keeps the position and progress', async () => {
  const p = await newPage();
  await openPuzzle(p, multi);
  await playUci(p, multi.moves[1]);
  await p.waitForTimeout(1100);
  const before = await p.locator('.piece:not(.ghost)').evaluateAll((e) => e.map((x) => x.dataset.piece + x.dataset.sq).sort().join());
  await p.click('[data-testid=lang-toggle]');
  await p.waitForTimeout(300);
  const after = await p.locator('.piece:not(.ghost)').evaluateAll((e) => e.map((x) => x.dataset.piece + x.dataset.sq).sort().join());
  assert(before === after, 'position unchanged');
  assert(/[A-Za-z]/.test(await p.locator('[data-testid=prompt]').innerText()) && !/[가-힣]/.test(await p.locator('[data-testid=prompt]').innerText()), 'prompt now English');
  await p.context().close();
});

await test('profiles keep independent records; names can be changed', async () => {
  const p = await newPage();
  await openPuzzle(p, firstMate);
  await solveRest(p, firstMate);
  await p.goto(BASE); await p.waitForSelector('[data-testid=profile-chip]');
  await p.click('[data-testid=profile-chip]');
  await p.click('[data-testid=profile-p2]');
  await p.click('[data-testid=settings-btn]');
  await p.click('[data-testid=rename-p2]');
  await p.fill('[data-testid=rename-input]', '아들');
  await p.click('[data-testid=rename-save]');
  await p.click('[data-testid=settings-close]');
  assert((await p.locator('[data-testid=profile-chip]').innerText()).includes('아들'), 'renamed');
  await p.click('[data-testid=menu-academy]');
  await p.click('[data-testid=course-checkmate]');
  assert((await p.locator(`[data-testid=stage-${firstMate.id}] .star.on`).count()) === 0, 'p2 has no stars');
  await p.context().close();
});

await test('sound & display settings persist after restart', async () => {
  const p = await newPage();
  await p.click('[data-testid=settings-btn]');
  await p.click('[data-testid=set-sound]');
  await p.locator('[data-testid=set-volume]').fill('35');
  await p.click('[data-testid=set-lowpower]');
  await p.click('[data-testid=settings-close]');
  await p.waitForTimeout(700);
  await p.reload();
  await p.waitForSelector('[data-testid=settings-btn]');
  await p.click('[data-testid=settings-btn]');
  assert((await p.getAttribute('[data-testid=set-sound]', 'aria-checked')) === 'false', 'sound off kept');
  assert((await p.inputValue('[data-testid=set-volume]')) === '35', 'volume kept');
  assert((await p.getAttribute('[data-testid=set-lowpower]', 'aria-checked')) === 'true', 'low power kept');
  await p.context().close();
});

await test('skin choice changes board and pieces, stays per profile after restart', async () => {
  const p = await newPage();
  await p.click('[data-testid=settings-btn]');
  await p.click('[data-testid=skin-wizard]');
  await p.click('[data-testid=settings-close]');
  assert((await p.evaluate(() => document.documentElement.dataset.skin)) === 'wizard', 'skin attribute');
  await p.click('[data-testid=menu-two]');
  if (await p.locator('[data-testid=confirm-no]').count()) await p.click('[data-testid=confirm-no]');
  await p.waitForSelector('[data-square=e2]');
  assert((await p.locator('.piece[data-sq=e1] img').getAttribute('src')) === 'pieces/wizard/wK.svg', 'wizard king on e1');
  await p.waitForTimeout(700);
  await p.reload();
  await p.waitForSelector('[data-testid=profile-chip]');
  assert((await p.evaluate(() => document.documentElement.dataset.skin)) === 'wizard', 'kept after restart');
  await p.click('[data-testid=profile-chip]');
  await p.click('[data-testid=profile-p2]');
  await p.waitForTimeout(200);
  assert((await p.evaluate(() => document.documentElement.dataset.skin)) === 'classic', 'other profile keeps its own skin');
  await p.context().close();
});

await test('backup export -> import restores records after a confirmation', async () => {
  const p = await newPage();
  await openPuzzle(p, firstMate);
  await solveRest(p, firstMate);
  await p.goto(BASE); await p.waitForSelector('[data-testid=settings-btn]');
  await p.click('[data-testid=settings-btn]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-testid=export]')]);
  const file = join(out, 'backup-test.json');
  await dl.saveAs(file);
  const json = JSON.parse(readFileSync(file, 'utf8'));
  assert(json.app === 'family-chess-premium' && json.data.profiles.p1.puzzles[firstMate.id].best === 3, 'backup content');
  await p.context().close();
  const q = await newPage(); // fresh device: no records
  await q.click('[data-testid=settings-btn]');
  const [fc] = await Promise.all([q.waitForEvent('filechooser'), q.click('[data-testid=import]')]);
  await fc.setFiles(file);
  await q.waitForSelector('[data-testid=confirm-yes]');
  await q.click('[data-testid=confirm-yes]');
  await q.waitForTimeout(700);
  const r = await record(q, firstMate.id);
  assert(r && r.best === 3, 'restored');
  await q.context().close();
});

await test('lesson: task accepts the right idea, refuses others with feedback', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-academy]');
  await p.click('[data-testid=course-endgames]');
  await p.click('[data-testid=lesson-eg-queenmate]');
  await tap(p, 'b1'); await tap(p, 'b8'); // Qb8+ is not mate
  assert((await p.locator('[data-testid=lesson-msg]').count()) === 1, 'feedback');
  await tap(p, 'b1'); await tap(p, 'b7');
  assert((await p.locator('[data-testid=lesson-msg]').innerText()).length > 0, 'success text');
  assert(!(await p.locator('[data-testid=step-next]').isDisabled()), 'next enabled');
  await p.context().close();
});

await test('game review: Stockfish analyses every move and the best line can be replayed', async () => {
  const p = await newPage();
  await p.click('[data-testid=menu-two]');
  for (const [a, b] of [['e2', 'e4'], ['e7', 'e5'], ['d1', 'h5'], ['b8', 'c6'], ['f1', 'c4'], ['g8', 'f6'], ['h5', 'f7']]) await tap(p, a), await tap(p, b);
  await p.click('[data-testid=go-review]');
  await p.waitForFunction(() => /분석 완료|Analysis done/.test(document.querySelector('[data-testid=review-progress]')?.textContent || ''), null, { timeout: 60000 });
  const marks = await p.locator('.rvMove.v-blunder').count();
  assert(marks >= 1, 'Nf6?? flagged as a blunder');
  await p.locator('.rvMove.v-blunder').first().click();
  assert((await p.locator('[data-testid=review-detail]').innerText()).length > 10, 'explanation');
  await p.click('[data-testid=rv-prev]');
  await p.click('[data-testid=play-line]');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: join(out, 'review.png') });
  await p.context().close();
});

// ---------- screenshots at the three target resolutions ----------
for (const [w, h] of [[1024, 600], [1280, 800], [1920, 1200]]) {
  await test(`screens fit ${w}x${h} without overflow`, async () => {
    const p = await newPage({ width: w, height: h });
    const dir = join(out, `${w}x${h}`); mkdirSync(dir, { recursive: true });
    const noOverflow = async (name) => {
      await p.waitForTimeout(350); // let the 180 ms screen transition finish
      const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, w: innerWidth, h: innerHeight }));
      assert(o.sw <= o.w + 1 && o.sh <= o.h + 1, `${name} overflows ${JSON.stringify(o)}`);
      const small = await p.evaluate(() => [...document.querySelectorAll('button, p, span, div')].filter((e) => e.offsetParent && !e.classList.contains('coord') && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize)).filter((s) => s < 16).length);
      assert(small === 0, `${name}: ${small} text elements below 16px`);
      await p.screenshot({ path: join(dir, `${name}.png`) });
    };
    await noOverflow('01-home');
    await p.click('[data-testid=menu-two]');
    for (const [a, b] of [['e2', 'e4'], ['e7', 'e5'], ['g1', 'f3'], ['b8', 'c6'], ['f1', 'c4']]) await tap(p, a), await tap(p, b);
    await tap(p, 'g8');
    await noOverflow('02-two-players');
    await p.click('[data-testid=game-home]');
    await startAi(p, 3);
    await tap(p, 'd2'); await tap(p, 'd4');
    await p.waitForFunction(() => [...document.querySelectorAll('.moveSan')].filter((x) => x.textContent.trim()).length >= 2, null, { timeout: 20000 });
    await noOverflow('03-vs-computer');
    await p.click('[data-testid=game-home]');
    await p.click('[data-testid=menu-academy]');
    await noOverflow('04-academy');
    await p.click('[data-testid=course-tactics]');
    await noOverflow('05-puzzle-list');
    await p.locator('.stage').nth(2).click();
    await p.waitForTimeout(1300);
    await p.click('[data-testid=hint]'); await p.click('[data-testid=hint]');
    await noOverflow('06-puzzle');
    await p.click('[data-testid=back]'); await p.click('[data-testid=back]');
    await p.click('[data-testid=records]');
    await noOverflow('07-records');
    await p.click('[data-testid=back]');
    await p.click('[data-testid=course-openings]');
    await p.click('[data-testid=lesson-op-italian]');
    await noOverflow('08-lesson');
    await p.goto(BASE); await p.waitForSelector('[data-testid=settings-btn]');
    await p.click('[data-testid=settings-btn]');
    await noOverflow('09-settings');
    await p.context().close();
  });
}

await browser.close();
server.kill();
const summary = { when: new Date().toISOString(), passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results, levelReplies, externalRequests: external };
writeFileSync(join(out, 'e2e-results.json'), JSON.stringify(summary, null, 2));
console.log(`\n${summary.passed} passed, ${summary.failed} failed; external requests blocked: ${external.length}`);
console.log('level replies', JSON.stringify(levelReplies));
process.exit(summary.failed ? 1 : 0);
