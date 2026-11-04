// Emulator acceptance test for the installed APK, network switched OFF.
// Drives the app's WebView through Playwright's Android support.
// usage: node tests/android/smoke.cjs <outDir>
const { _android: android } = require('playwright');
const fs = require('fs');
const path = require('path');

const PKG = 'com.playvault.familyhangman';
const out = process.argv[2] || 'android-smoke';
fs.mkdirSync(out, { recursive: true });
const result = { started: new Date().toISOString(), steps: [], requests: [], external: [], errors: [], ok: false };
const log = (s, extra = {}) => { console.log(s, JSON.stringify(extra)); result.steps.push({ s, ...extra, t: Date.now() }); };

(async () => {
  const [device] = await android.devices();
  if (!device) throw new Error('no adb device');
  log('device', { model: device.model(), serial: device.serial() });
  for (const cmd of ['svc wifi disable', 'svc data disable', 'cmd connectivity airplane-mode enable']) await device.shell(cmd).catch(() => undefined);
  await new Promise((r) => setTimeout(r, 3000));
  const net = (await device.shell('dumpsys connectivity | grep -m1 "Active default network"').catch(() => Buffer.from('?'))).toString().trim();
  log('network off', { net });
  await device.shell(`am force-stop ${PKG}`);
  const t0 = Date.now();
  await device.shell(`am start -n ${PKG}/.MainActivity`);
  const webview = await device.webView({ pkg: PKG }, { timeout: 60000 });
  const page = await webview.page();
  page.on('request', (r) => {
    result.requests.push(r.url());
    if (!/^(https?:\/\/localhost|data:|blob:|about:)/.test(r.url())) result.external.push(r.url());
  });
  page.on('pageerror', (e) => result.errors.push(String(e)));
  // headless emulator WebViews may not run requestAnimationFrame: poll, and click through the DOM
  const waitSel = (sel, timeout = 60000) => page.waitForFunction((q) => !!document.querySelector(q), sel, { polling: 300, timeout });
  const click = async (sel) => {
    await waitSel(sel, 30000);
    await page.evaluate((q) => document.querySelector(q).click(), sel);
    await page.waitForTimeout(250);
  };
  const keys = async (w) => { for (const l of w) await click(`[data-testid=key-${l}]`); };

  await waitSel('[data-testid=menu-solo]');
  log('home visible', { ms: Date.now() - t0, viewport: await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]) });
  await page.waitForTimeout(800);
  await device.screenshot({ path: path.join(out, '01-home.png') });

  // two players: set "cat", guess it with one miss
  await click('[data-testid=menu-two]');
  await keys('cat');
  await click('[data-testid=two-next]');
  await click('[data-testid=two-go]');
  await keys('zcat');
  await waitSel('[data-testid=result][data-result=won]');
  log('two-player round won');
  await device.screenshot({ path: path.join(out, '02-two-won.png') });
  // pronunciation: the engine may or may not have English voice data on the
  // emulator image, so record the status and make sure tapping never errors
  await page.waitForFunction(() => document.querySelector('[data-testid=speak-cat]')?.dataset.status !== 'checking', null, { polling: 300, timeout: 20000 }).catch(() => undefined);
  const voice = await page.evaluate(() => document.querySelector('[data-testid=speak-cat]')?.dataset.status);
  await click('[data-testid=speak-cat]');
  await page.waitForTimeout(1500);
  result.voice = voice;
  log('speak button tapped', { voice });
  await click('[data-testid=result-home]');

  // solo: play one full round with common letters
  await click('[data-testid=menu-solo]');
  await click('[data-testid=setup-start]');
  await waitSel('[data-testid=word]');
  await device.screenshot({ path: path.join(out, '03-solo.png') });
  for (const l of 'eariotnslcudpmhgbfywkvxzjq') {
    const done = await page.evaluate(() => !!document.querySelector('[data-testid=result]'));
    if (done) break;
    const enabled = await page.evaluate((k) => !document.querySelector(`[data-testid=key-${k}]`).disabled, l);
    if (enabled) await click(`[data-testid=key-${l}]`);
  }
  await waitSel('[data-testid=result]');
  const solo = await page.evaluate(() => document.querySelector('[data-testid=result]').dataset.result);
  log('solo round finished', { solo });
  await device.screenshot({ path: path.join(out, '04-solo-result.png') });
  await click('[data-testid=result-home]');
  await page.waitForTimeout(800); // debounced save

  // app restart keeps the record
  await device.shell(`am force-stop ${PKG}`);
  await device.shell(`am start -n ${PKG}/.MainActivity`);
  const wv2 = await device.webView({ pkg: PKG }, { timeout: 60000 });
  const p2 = await wv2.page();
  await p2.waitForFunction(() => !!document.querySelector('[data-testid=menu-words]'), null, { polling: 300, timeout: 60000 });
  await p2.evaluate(() => document.querySelector('[data-testid=menu-words]').click());
  await p2.waitForFunction(() => /1/.test(document.querySelector('[data-testid=stats]')?.textContent || ''), null, { polling: 300, timeout: 30000 });
  log('restart keeps records');
  await device.screenshot({ path: path.join(out, '05-words-after-restart.png') });

  result.ok = result.external.length === 0 && result.errors.length === 0;
  result.finished = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
  console.log(result.ok ? 'ANDROID SMOKE: PASS' : 'ANDROID SMOKE: FAIL', JSON.stringify({ external: result.external, errors: result.errors }));
  await device.close();
  process.exit(result.ok ? 0 : 1);
})().catch((e) => {
  result.errors.push(String((e && e.stack) || e));
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
  console.error('ANDROID SMOKE: ERROR', e);
  process.exit(1);
});
