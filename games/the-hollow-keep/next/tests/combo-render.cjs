#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · Noah 3단 콤보 화면 연결 검사
 * 규격: games/the-hollow-keep/docs/COMBAT_SPEC.md §2-2
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/combo-render.cjs
 * 환경 변수: HK_URL(기본 http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test), CHROMIUM_PATH
 *
 * 실제 앱에서 키보드로 Noah로 교대하고, 표적이 없는 쪽을 본 채 공격 키를 짧게 세 번(회복 중 미리 입력) 누른다.
 * 캔버스 drawImage를 가로채 주인공 몸을 어느 시트로 그렸는지 프레임마다 기록한다(월드·좌표 주입 없음).
 * 맞히지 않는 경우가 가장 엄격하다(맞히면 렌더러가 자세를 더 붙잡아 틈이 가려짐).
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test';

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS ${name}`); }
    catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
  };
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.addInitScript(() => {
      window.__rec = null;
      const orig = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
        if (window.__rec && window.__bodyFiles && a.length === 8) {
          const src = img.src || '', hit = window.__bodyFiles.find((f) => src.endsWith('/' + f.file));
          if (hit) window.__rec.cur.push(hit.name);
        }
        return orig.call(this, img, ...a);
      };
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => raf.call(window, (t) => {
        if (window.__rec) window.__rec.cur = [];
        cb(t);
        if (window.__rec && window.HKPlaytest) window.__rec.frames.push({ body: window.__rec.cur.slice(), tick: HKPlaytest.snapshot().tick });
      });
    });
    await page.goto(URL);
    await page.waitForFunction(() => window.HKPlaytest && HKPlaytest.snapshot().tick > 3, null, { timeout: 8000 });
    await page.waitForFunction(() => { const s = HKPlaytest.artStatus && HKPlaytest.artStatus(); return s && (s.loaded || (s.failed && s.failed.length)); }, null, { timeout: 8000 }).catch(() => {});
    // Noah로 교대
    if ((await page.evaluate(() => HKPlaytest.snapshot().active)) !== 'noah') { await page.keyboard.press('KeyQ'); await page.waitForTimeout(300); }
    await test('Noah로 교대(검사 준비)', async () => assert.equal(await page.evaluate(() => HKPlaytest.snapshot().active), 'noah'));
    // 표적이 없는 쪽을 바라보기
    const side = await page.evaluate(() => {
      const w = HKPlaytest.snapshot(), p = w.player, cx = p.x + p.w / 2;
      const near = (dir) => (w.dummies || []).some((d) => d.hp > 0 && (dir > 0 ? d.x - (p.x + p.w) : p.x - (d.x + d.w)) >= -5 && (dir > 0 ? d.x - (p.x + p.w) : p.x - (d.x + d.w)) < 140);
      return near(1) ? (near(-1) ? 0 : -1) : 1;
    });
    await test('표적이 없는 방향이 있음(검사 준비)', async () => assert.ok(side !== 0, '양쪽 모두 140 안에 표적'));
    await page.keyboard.press(side > 0 ? 'ArrowRight' : 'ArrowLeft'); await page.waitForTimeout(400);
    await page.evaluate(() => {
      const m = HKPixel.manifest(), files = [];
      for (const [name, a] of Object.entries(m.heroes.noah.animations)) if (!name.startsWith('fx-')) files.push({ name, file: a.file });
      window.__bodyFiles = files; window.__rec = { cur: [], frames: [] };
    });
    // 미리 입력은 한 번만 기억되므로, 각 누름이 앞 단이 나간 뒤 그 단의 회복 중에 들어가게 누른다
    // (1단 0초, 2단 입력 ≈0.2초 → 0.3초에 나감, 3단 입력 ≈0.45초 → 2단 회복 끝에 나감)
    for (const wait of [160, 210, 0]) { await page.keyboard.down('KeyJ'); await page.waitForTimeout(40); await page.keyboard.up('KeyJ'); await page.waitForTimeout(wait); }
    await page.waitForTimeout(1800);
    const frames = await page.evaluate(() => { const f = window.__rec.frames; window.__rec = null; return f; });
    const seq = frames.map((f) => f.body[f.body.length - 1] || null);
    const first = seq.findIndex((n) => n && n.startsWith('attack'));
    let last = -1; seq.forEach((n, i) => { if (n === 'attack-3') last = i; });
    await test('1·2·3단이 차례로 그려짐', async () => {
      const order = seq.filter((n, i) => n && n.startsWith('attack') && n !== seq[i - 1]);
      assert.deepEqual(order, ['attack', 'attack-2', 'attack-3'], `그려진 순서 ${order.join(' → ')}`);
    });
    await test('1단 시작부터 3단 끝까지 서 있는 자세(idle·run 등)가 한 프레임도 끼지 않음', async () => {
      assert.ok(first >= 0 && last > first, '콤보 구간을 찾지 못함');
      const gaps = [];
      for (let i = first; i <= last; i++) if (!seq[i] || !seq[i].startsWith('attack')) gaps.push(`${frames[i].tick}틱 ${seq[i]}`);
      assert.deepEqual(gaps.slice(0, 5), [], `콤보 중 다른 자세 ${gaps.length}프레임`);
    });
    await test('페이지 오류 없음', async () => assert.deepEqual(errors, []));
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
