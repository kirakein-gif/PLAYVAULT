// Real-device / emulator acceptance test for the installed APK.
// Drives the app's WebView through Playwright's Android support with the
// network switched OFF, and checks that Stockfish answers at every level.
// usage: node tests/android/smoke.cjs <outDir>
const { _android: android } = require('playwright');
const fs = require('fs');
const path = require('path');

const PKG = 'com.playvault.familychess';
const out = process.argv[2] || 'android-smoke';
fs.mkdirSync(out, { recursive: true });
const result = { started: new Date().toISOString(), steps: [], requests: [], external: [], errors: [], ok: false };
const log = (s, extra = {}) => { console.log(s, JSON.stringify(extra)); result.steps.push({ s, ...extra, t: Date.now() }); };

(async () => {
  const [device] = await android.devices();
  if (!device) throw new Error('no adb device');
  log('device', { model: device.model(), serial: device.serial() });
  for (const cmd of ['svc wifi disable', 'svc data disable', 'cmd connectivity airplane-mode enable']) await device.shell(cmd).catch(() => undefined);
  const net = (await device.shell('dumpsys connectivity | grep -m1 "Active default network"').catch(() => Buffer.from('?'))).toString().trim();
  log('network off', { net });
  // the emulator is started with a landscape 1280x800 skin (see workflow); no rotation commands
  await new Promise((r) => setTimeout(r, 3000));
  const net2 = (await device.shell('dumpsys connectivity | grep -m1 "Active default network"').catch(() => Buffer.from('?'))).toString().trim();
  log('network re-check', { net2 });
  await device.shell(`am force-stop ${PKG}`);
  await device.shell('logcat -c');
  const t0 = Date.now();
  await device.shell(`am start -n ${PKG}/.MainActivity`);
  const webview = await device.webView({ pkg: PKG }, { timeout: 60000 });
  const page = await webview.page();
  page.on('request', (r) => {
    result.requests.push(r.url());
    if (!/^(https?:\/\/localhost|data:|blob:|about:)/.test(r.url())) result.external.push(r.url());
  });
  page.on('pageerror', (e) => result.errors.push(String(e)));
  // A headless emulator WebView may not run requestAnimationFrame, so every wait
  // uses interval polling and every tap goes to coordinates (no rAF "stable" checks).
  const waitSel = (sel, timeout = 60000) => page.waitForFunction((q) => !!document.querySelector(q), sel, { polling: 300, timeout });
  // buttons: DOM click (React onClick); board squares: real PointerEvents at the square centre
  const click = async (sel) => {
    await waitSel(sel, 30000);
    console.log('click', sel);
    await page.evaluate((q) => document.querySelector(q).click(), sel);
    await page.waitForTimeout(400);
  };
  const tapSq = async (sq) => {
    await waitSel(`[data-square=${sq}]`, 30000);
    await page.evaluate((s) => {
      const r = document.querySelector(`[data-square=${s}]`).getBoundingClientRect();
      const board = document.querySelector('[data-testid=board]');
      const o = { bubbles: true, cancelable: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, pointerId: 1, pointerType: 'touch', isPrimary: true };
      board.dispatchEvent(new PointerEvent('pointerdown', o));
      board.dispatchEvent(new PointerEvent('pointerup', o));
    }, sq);
    await page.waitForTimeout(400);
  };
  const exists = (sel) => page.evaluate((q) => !!document.querySelector(q), sel);
  await waitSel('[data-testid=menu-ai]');
  log('home visible', { ms: Date.now() - t0, viewport: await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]) });
  await page.waitForTimeout(800);
  await device.screenshot({ path: path.join(out, '01-home.png') });

  const replies = {};
  for (const level of [1, 2, 3, 4, 5]) {
    await click('[data-testid=menu-ai]');
    if (await exists('[data-testid=confirm-no]')) await click('[data-testid=confirm-no]');
    await click(`[data-testid=level-${level}]`);
    await click('[data-testid=color-w]');
    await click('[data-testid=setup-start]');
    await waitSel('[data-square=e2]');
    await tapSq('e2');
    await tapSq('e4');
    const s = Date.now();
    await page.waitForFunction(() => {
      const m = [...document.querySelectorAll('.moveSan')].map((x) => x.textContent).filter(Boolean);
      return m.length >= 2;
    }, null, { timeout: 90000, polling: 300 });
    const moves = await page.evaluate(() => document.querySelector('.moveList').innerText);
    replies[level] = { ms: Date.now() - s, moves: moves.replace(/\s+/g, ' ').trim() };
    log(`level ${level} replied`, replies[level]);
    if (level === 3) await device.screenshot({ path: path.join(out, '02-game-ai.png') });
    // undo while idle must restore the start position for the player
    await click('[data-testid=undo]');
    const after = await page.evaluate(() => [...document.querySelectorAll('.moveSan')].map((x) => x.textContent).filter(Boolean));
    log(`level ${level} undo`, { remaining: after.length });
    await click('[data-testid=game-home]');
  }
  result.replies = replies;

  // academy + first puzzle
  await click('[data-testid=menu-academy]');
  await device.screenshot({ path: path.join(out, '03-academy.png') });
  await click('[data-testid=course-tactics]');
  await click('.stage');
  await page.waitForTimeout(1500);
  await device.screenshot({ path: path.join(out, '04-puzzle.png') });
  log('academy ok');

  // app restart keeps settings & data (preferences)
  await page.evaluate(() => 1);
  await device.shell(`am force-stop ${PKG}`);
  await device.shell(`am start -n ${PKG}/.MainActivity`);
  const wv2 = await device.webView({ pkg: PKG }, { timeout: 60000 });
  const p2 = await wv2.page();
  await p2.waitForFunction(() => !!document.querySelector('[data-testid=menu-ai]'), null, { polling: 300, timeout: 60000 });
  log('restart ok');

  const logcat = (await device.shell('logcat -d -s Capacitor:* Capacitor/Console:* chromium:*')).toString();
  fs.writeFileSync(path.join(out, 'logcat.txt'), logcat);
  result.ok = result.external.length === 0 && Object.keys(replies).length === 5;
  result.finished = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
  console.log(result.ok ? 'ANDROID SMOKE: PASS' : 'ANDROID SMOKE: FAIL', JSON.stringify({ external: result.external, errors: result.errors }));
  await device.close();
  process.exit(result.ok ? 0 : 1);
})().catch((e) => {
  result.errors.push(String(e && e.stack || e));
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
  console.error('ANDROID SMOKE: ERROR', e);
  process.exit(1);
});
