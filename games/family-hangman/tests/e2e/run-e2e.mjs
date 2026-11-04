// Browser acceptance tests on the production build, fully offline: every
// request that is not to the local preview server is aborted and logged.
// usage: NODE_PATH=$(npm root -g) node tests/e2e/run-e2e.mjs [outDir]
//        E2E_OUTDIR=play ... runs the same suite on the PLAYVAULT web build
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
const PORT = 4181;
const BASE = `http://localhost:${PORT}/`;
const KEY = 'CapacitorStorage.fhm.data.v1';

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
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

const outDirArgs = process.env.E2E_OUTDIR ? ['--outDir', process.env.E2E_OUTDIR] : [];
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', ...outDirArgs], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();

async function newPage(vp = { width: 1280, height: 800 }, opts = {}) {
  const ctx = opts.ctx ?? (await browser.newContext({ viewport: vp, deviceScaleFactor: 1, acceptDownloads: true }));
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    external.push({ test: current, url: u });
    return route.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.errors = errors;
  await page.goto(BASE);
  await page.waitForSelector('[data-testid=menu-solo]', { timeout: 15000 });
  await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 5000 });
  return page;
}
const click = async (page, id) => {
  await page.click(`[data-testid=${id}]`);
  await page.waitForTimeout(60);
};
const typeWord = async (page, w) => {
  for (const l of w) await click(page, `key-${l}`);
};
async function startTwo(page, word, hint = '') {
  await click(page, 'menu-two');
  await typeWord(page, word);
  if (hint) await page.fill('[data-testid=two-hint]', hint);
  await click(page, 'two-next');
  await click(page, 'two-go');
  await page.waitForSelector('[data-testid=word]');
}
const lives = (page) => page.getAttribute('[data-testid=scene]', 'data-lives').then(Number);
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
/** Plays solo letters in a fixed order until the round ends (win or loss). */
async function finishSolo(page) {
  for (const l of 'eariotnslcudpmhgbfywkvxzjq') {
    if (await page.$('[data-testid=result]')) break;
    if (await page.isEnabled(`[data-testid=key-${l}]`)) await click(page, `key-${l}`);
  }
  await page.waitForSelector('[data-testid=result]');
  return page.getAttribute('[data-testid=result]', 'data-result');
}

console.log('HANGMAN MASTER e2e');

for (const vp of [
  { width: 853, height: 533 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
]) {
  await test(`layout fits ${vp.width}x${vp.height} (home, game, two-player entry)`, async () => {
    const page = await newPage(vp);
    await page.screenshot({ path: join(out, `home-${vp.width}.png`) });
    const inView = async (sel) => {
      const b = await page.locator(sel).boundingBox();
      assert(b, `${sel} missing`);
      assert(b.x >= 0 && b.y >= 0 && b.x + b.width <= vp.width + 0.5 && b.y + b.height <= vp.height + 0.5, `${sel} outside view ${JSON.stringify(b)}`);
      return b;
    };
    for (const id of ['menu-solo', 'menu-two', 'menu-words', 'settings-btn', 'brand']) await inView(`[data-testid=${id}]`);
    await click(page, 'menu-solo');
    await inView('[data-testid=setup-start]');
    await page.screenshot({ path: join(out, `setup-${vp.width}.png`) });
    await click(page, 'setup-start');
    await page.waitForSelector('[data-testid=keyboard]');
    await page.waitForTimeout(250);
    const kb = await inView('[data-testid=keyboard]');
    // every key, including the row ends, is fully on screen
    for (const l of 'qplazm') await inView(`[data-testid=key-${l}]`);
    const word = await inView('[data-testid=word]');
    await inView('[data-testid=scene]');
    await inView('[data-testid=hint-letter]');
    assert(word.y + word.height <= kb.y, 'word overlaps keyboard');
    const key = await page.locator('[data-testid=key-q]').boundingBox();
    assert(key.height >= 44 && key.width >= 44, `keys too small ${key.width}x${key.height}`);
    await click(page, 'key-e');
    await click(page, 'key-z');
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, `game-${vp.width}.png`) });
    await page.goto(BASE);
    await page.waitForSelector('[data-testid=menu-two]');
    await click(page, 'menu-two');
    await inView('[data-testid=two-next]');
    await inView('[data-testid=key-erase]');
    for (const l of 'qplazm') await inView(`[data-testid=key-${l}]`);
    await page.screenshot({ path: join(out, `two-${vp.width}.png`) });
    assert(page.errors.length === 0, page.errors.join('; '));
  });
}

await test('two players: the guesser finds the word (with Korean hint)', async () => {
  const page = await newPage();
  await startTwo(page, 'cat', '고양이');
  assert((await page.getAttribute('[data-testid=word]', 'data-len')) === '3', 'word length');
  assert((await page.getAttribute('[data-testid=scene]', 'data-picture')) === 'balloon', 'balloons by default');
  assert((await page.textContent('[data-testid=clue]')).includes('고양이'), 'hint shown');
  await typeWord(page, 'zca');
  assert((await lives(page)) === 5, 'one miss');
  await click(page, 'key-t');
  await page.waitForSelector('[data-testid=result][data-result=won]');
  assert((await page.textContent('.modalTitle')).includes('맞힐 사람'), 'guesser wins');
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(out, 'two-won.png') });
  await click(page, 'result-new');
  await page.waitForSelector('[data-testid=entry]');
});

await test('two players: six misses lose and the answer is shown', async () => {
  const page = await newPage();
  await startTwo(page, 'dog');
  await typeWord(page, 'abcefh');
  await page.waitForSelector('[data-testid=result][data-result=lost]');
  assert((await page.locator('[data-testid=balloon-gone]').count()) === 6, 'all balloons gone');
  assert((await page.textContent('.resultWord')) === 'DOG', 'answer shown');
  assert((await page.textContent('.modalTitle')).includes('문제 낸 사람'), 'setter wins');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(out, 'two-lost.png') });
});

await test('two players: invalid words cannot start; erase works', async () => {
  const page = await newPage();
  await click(page, 'menu-two');
  await click(page, 'key-a');
  assert(!(await page.isEnabled('[data-testid=two-next]')), '1 letter must not start');
  await click(page, 'key-b');
  assert(await page.isEnabled('[data-testid=two-next]'), '2 letters can start');
  await click(page, 'key-erase');
  assert((await page.getAttribute('[data-testid=entry]', 'data-len')) === '1', 'erase');
  assert(!(await page.textContent('[data-testid=entry]')).includes('A'), 'hidden by default');
  await click(page, 'two-show');
  assert((await page.textContent('[data-testid=entry]')).includes('A'), 'show');
});

await test('physical keyboard uses event.code (Korean IME state)', async () => {
  const page = await newPage();
  await startTwo(page, 'cat');
  // a Korean IME reports key "ㅊ" for the C key; code stays KeyC
  for (const [key, code] of [['ㅊ', 'KeyC'], ['ㅁ', 'KeyA'], ['ㅅ', 'KeyT']])
    await page.evaluate(([k, c]) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: c, bubbles: true })), [key, code]);
  await page.waitForSelector('[data-testid=result][data-result=won]');
});

await test('repeated physical key shows a notice and costs nothing', async () => {
  const page = await newPage();
  await startTwo(page, 'cat');
  await page.keyboard.press('KeyZ');
  await page.keyboard.press('KeyZ');
  await page.waitForSelector('[data-testid=toast]');
  assert((await lives(page)) === 5, 'only one balloon lost');
});

await test('solo: hints, a full round, records saved and kept after reload', async () => {
  const page = await newPage();
  await click(page, 'menu-solo');
  await click(page, 'level-easy');
  await click(page, 'cat-animals');
  assert(/\d+/.test(await page.textContent('[data-testid=pool-count]')), 'pool count');
  await click(page, 'setup-start');
  await page.waitForSelector('[data-testid=word]');
  const len = Number(await page.getAttribute('[data-testid=word]', 'data-len'));
  assert(len >= 2 && len <= 4, `easy word length ${len}`);
  await click(page, 'hint-meaning');
  assert(/[가-힣]/.test(await page.textContent('[data-testid=clue]')), 'meaning shown');
  if (await page.isEnabled('[data-testid=hint-letter]')) {
    await click(page, 'hint-letter');
    assert((await lives(page)) === 5, 'letter hint costs one balloon');
  }
  const result = await finishSolo(page);
  assert(result === 'won' || result === 'lost', 'round ended');
  await page.waitForTimeout(500);
  const d = await stored(page);
  const p = d.profiles[d.activeProfileId];
  assert(p.stats.played === 1 && Object.keys(p.words).length === 1, 'record saved');
  assert(p.level === 'easy' && p.category === 'animals', 'choice remembered');
  await click(page, 'result-next');
  await page.waitForSelector('[data-testid=word]');
  assert(!(await page.$('[data-testid=result]')), 'next word started');
  await page.reload();
  await page.waitForSelector('[data-testid=menu-words]');
  await click(page, 'menu-words');
  assert((await page.textContent('[data-testid=stats]')).includes('1'), 'stats after reload');
  await page.screenshot({ path: join(out, 'words.png') });
});

await test('word book: missed words can be practised again', async () => {
  const page = await newPage();
  // lose solo rounds until one word is in the missed list
  await click(page, 'menu-solo');
  await click(page, 'level-hard');
  await click(page, 'cat-all');
  await click(page, 'setup-start');
  for (let i = 0; i < 6; i++) {
    await page.waitForSelector('[data-testid=word]');
    for (const l of 'qjxzvkwy') {
      if (await page.$('[data-testid=result]')) break;
      if (await page.isEnabled(`[data-testid=key-${l}]`)) await click(page, `key-${l}`);
    }
    const r = await finishSolo(page);
    if (r === 'lost') break;
    await click(page, 'result-next');
  }
  await click(page, 'result-home');
  await click(page, 'menu-words');
  await click(page, 'tab-missed');
  await page.waitForSelector('[data-testid=practice]');
  await click(page, 'practice');
  await page.waitForSelector('[data-testid=word]');
  assert((await page.textContent('.topTitle')).includes('놓친'), 'practice title');
});

await test('back during a round asks first', async () => {
  const page = await newPage();
  await startTwo(page, 'cat');
  await click(page, 'key-z');
  await click(page, 'back');
  await page.waitForSelector('[data-testid=confirm-no]');
  await click(page, 'confirm-no');
  assert(await page.$('[data-testid=keyboard]'), 'still in game');
  await click(page, 'back');
  await click(page, 'confirm-yes');
  await page.waitForSelector('[data-testid=entry], [data-testid=menu-solo]');
});

await test('picture option: classic hangman per player, kept after reload', async () => {
  const page = await newPage();
  await click(page, 'settings-btn');
  await click(page, 'picture-classic');
  await click(page, 'settings-close');
  await startTwo(page, 'cat');
  assert((await page.getAttribute('[data-testid=scene]', 'data-picture')) === 'classic', 'classic scene');
  assert((await page.textContent('[data-testid=lives]')).includes('기회'), 'classic wording');
  await typeWord(page, 'zq');
  assert((await page.locator('[data-testid=part]').count()) === 2, 'two parts after two misses');
  await page.screenshot({ path: join(out, 'classic-playing.png') });
  await typeWord(page, 'cat');
  await page.waitForSelector('[data-testid=freed]');
  await page.screenshot({ path: join(out, 'classic-won.png') });
  await click(page, 'result-new');
  await typeWord(page, 'dog');
  await click(page, 'two-next');
  await click(page, 'two-go');
  await typeWord(page, 'abcefh');
  await page.waitForSelector('[data-testid=result][data-result=lost]');
  assert((await page.locator('[data-testid=part]').count()) === 6, 'six parts when lost');
  await page.screenshot({ path: join(out, 'classic-lost.png') });
  await page.waitForTimeout(500);
  await page.reload();
  await page.waitForSelector('[data-testid=menu-two]');
  await startTwo(page, 'cat');
  assert((await page.getAttribute('[data-testid=scene]', 'data-picture')) === 'classic', 'kept after reload');
  // the other player still has the balloons
  await page.goto(BASE);
  await page.waitForSelector('[data-testid=settings-btn]');
  await click(page, 'settings-btn');
  await click(page, 'use-p2');
  await click(page, 'settings-close');
  await startTwo(page, 'cat');
  assert((await page.getAttribute('[data-testid=scene]', 'data-picture')) === 'balloon', 'other player unchanged');
});

await test('English UI and settings', async () => {
  const page = await newPage();
  await click(page, 'lang-toggle');
  assert((await page.textContent('[data-testid=menu-solo]')).includes('Solo'), 'english label');
  await click(page, 'settings-btn');
  await page.waitForSelector('[data-testid=settings]');
  await page.screenshot({ path: join(out, 'settings.png') });
  const [dl] = await Promise.all([page.waitForEvent('download'), click(page, 'export')]);
  const json = JSON.parse(readFileSync(await dl.path(), 'utf8'));
  assert(json.app === 'family-hangman' && json.data.profiles.p1, 'backup file');
  await click(page, 'rename-p1');
  await page.fill('[data-testid=rename-input]', 'Noah');
  await click(page, 'rename-save');
  await click(page, 'settings-close');
  assert((await page.textContent('[data-testid=who]')).includes('Noah'), 'renamed');
});

await browser.close();
server.kill();
const ok = results.every((r) => r.ok) && external.length === 0;
writeFileSync(join(out, 'e2e-result.json'), JSON.stringify({ ok, results, external }, null, 2));
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed, external requests: ${external.length}`);
process.exit(ok ? 0 : 1);
