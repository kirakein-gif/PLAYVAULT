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
  // landscape tablet orientation
  await device.shell('settings put system accelerometer_rotation 0');
  await device.shell('settings put system user_rotation 1');
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
  await page.waitForSelector('[data-testid=menu-ai]', { timeout: 60000 });
  log('home visible', { ms: Date.now() - t0, viewport: await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]) });
  await page.waitForTimeout(800);
  await device.screenshot({ path: path.join(out, '01-home.png') });

  const tapSq = async (sq) => {
    await page.click(`[data-square=${sq}]`, { force: true });
    await page.waitForTimeout(250);
  };
  const replies = {};
  for (const level of [1, 2, 3, 4, 5]) {
    await page.click('[data-testid=menu-ai]');
    if (await page.locator('[data-testid=confirm-no]').count()) await page.click('[data-testid=confirm-no]');
    await page.click(`[data-testid=level-${level}]`);
    await page.click('[data-testid=color-w]');
    await page.click('[data-testid=setup-start]');
    await page.waitForSelector('[data-square=e2]');
    await tapSq('e2');
    await tapSq('e4');
    const s = Date.now();
    await page.waitForFunction(() => {
      const m = [...document.querySelectorAll('.moveSan')].map((x) => x.textContent).filter(Boolean);
      return m.length >= 2;
    }, null, { timeout: 90000 });
    const moves = await page.locator('.moveList').innerText();
    replies[level] = { ms: Date.now() - s, moves: moves.replace(/\s+/g, ' ').trim() };
    log(`level ${level} replied`, replies[level]);
    if (level === 3) await device.screenshot({ path: path.join(out, '02-game-ai.png') });
    // undo while idle must restore the start position for the player
    await page.click('[data-testid=undo]');
    await page.waitForTimeout(400);
    const after = await page.locator('.moveSan').allInnerTexts();
    log(`level ${level} undo`, { remaining: after.filter(Boolean).length });
    await page.click('[data-testid=game-home]');
    await page.waitForTimeout(400);
  }
  result.replies = replies;

  // academy + first puzzle
  await page.click('[data-testid=menu-academy]');
  await page.waitForTimeout(500);
  await device.screenshot({ path: path.join(out, '03-academy.png') });
  await page.click('[data-testid=course-tactics]');
  await page.waitForTimeout(500);
  await page.locator('.stage').first().click();
  await page.waitForTimeout(1500);
  await device.screenshot({ path: path.join(out, '04-puzzle.png') });
  log('academy ok');

  // app restart keeps settings & data (preferences)
  await page.evaluate(() => 1);
  await device.shell(`am force-stop ${PKG}`);
  await device.shell(`am start -n ${PKG}/.MainActivity`);
  const wv2 = await device.webView({ pkg: PKG }, { timeout: 60000 });
  const p2 = await wv2.page();
  await p2.waitForSelector('[data-testid=menu-ai]', { timeout: 60000 });
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
