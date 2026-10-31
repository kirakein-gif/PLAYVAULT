#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 픽셀아트 화면 확대·적용 인수 테스트
 * 규격: games/the-hollow-keep/docs/ART_DIRECTION.md §4-7
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/pixel-render.cjs
 * 환경 변수: HK_URL, CHROMIUM_PATH, HK_SHOT_DIR(지정하면 점프 자세 캡처 저장)
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
const VIEWS = [
  { name: 'PC 1280×900', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  { name: '모바일 780×330 DPR2', viewport: { width: 780, height: 330 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
  { name: '모바일 915×412 DPR2.625', viewport: { width: 915, height: 412 }, deviceScaleFactor: 2.625, hasTouch: true, isMobile: true }
];

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS ${name}`); }
    catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
  };
  async function open(view, before) {
    const { name, ...opts } = view;
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    if (before) await before(page);
    await page.goto(URL);
    await page.waitForFunction(() => window.HKPlaytest && HKPlaytest.snapshot().tick > 3, null, { timeout: 5000 });
    await page.waitForFunction(() => typeof HKPlaytest.artStatus === 'function', null, { timeout: 3000 }).catch(() => {});
    await page.waitForFunction(() => { const s = HKPlaytest.artStatus && HKPlaytest.artStatus(); return s && (s.loaded || (s.failed && s.failed.length)); }, null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(150);
    return { ctx, page, errors };
  }
  const measure = (page) => page.evaluate(() => {
    const c = document.querySelector('canvas'), r = c.getBoundingClientRect();
    return { bw: c.width, bh: c.height, cw: r.width, dpr: devicePixelRatio, smooth: c.getContext('2d').imageSmoothingEnabled,
      art: typeof HKPlaytest.artStatus === 'function' ? HKPlaytest.artStatus() : null };
  });
  const assertBacking = (m) => {
    assert.equal(m.bw % 960, 0, `캔버스 실제 폭 ${m.bw}이 960의 정수 배가 아님`);
    assert.equal(m.bh * 960, m.bw * 540, `캔버스 비율 ${m.bw}×${m.bh}이 16:9(960×540의 정수 배)가 아님`);
    const need = m.cw * m.dpr;
    assert.ok(m.bw >= need - 0.5, `실제 폭 ${m.bw} < 표시 폭×DPR ${need.toFixed(0)} (확대 시 흐려짐)`);
    assert.ok(m.bw - 960 < need - 0.5 || m.bw === 960, `실제 폭 ${m.bw}이 필요한 가장 작은 정수 배보다 큼(표시 ${need.toFixed(0)})`);
    assert.equal(m.smooth, false, 'imageSmoothingEnabled가 false가 아님');
  };

  try {
    for (const view of VIEWS) {
      await test(`${view.name}: 자산 로드, 캔버스 실제 해상도 = 960×k(가장 작은 충분한 정수), 보간 끔`, async () => {
        const { ctx, page, errors } = await open(view);
        const m = await measure(page);
        assert.ok(m.art, 'HKPlaytest.artStatus()가 없음');
        assert.equal(m.art.loaded, true, `자산 로드 실패: ${JSON.stringify(m.art)}`);
        assert.deepEqual(m.art.failed, [], `실패 자산: ${m.art.failed}`);
        assertBacking(m);
        assert.deepEqual(errors, [], `페이지 오류: ${errors.join(' | ')}`);
        await ctx.close();
      });
    }

    await test('화면 크기가 바뀌면 캔버스 실제 해상도를 다시 계산', async () => {
      const { ctx, page } = await open(VIEWS[1]);
      await page.setViewportSize({ width: 915, height: 412 });
      await page.waitForTimeout(300);
      assertBacking(await measure(page));
      await page.setViewportSize({ width: 740, height: 320 });
      await page.waitForTimeout(300);
      assertBacking(await measure(page));
      await ctx.close();
    });

    await test('그림 파일을 못 불러와도 도형으로 대신 그리고 게임은 계속 동작', async () => {
      const { ctx, page, errors } = await open(VIEWS[0], (p) => p.route(/assets\/pixel\/ethan-idle\.png/, (r) => r.fulfill({ status: 404, body: '' })));
      const m = await measure(page);
      assert.ok(m.art, 'HKPlaytest.artStatus()가 없음');
      assert.ok(m.art.failed.some((f) => /ethan-idle\.png/.test(f)), `failed에 ethan-idle.png가 기록되지 않음: ${JSON.stringify(m.art)}`);
      const t0 = await page.evaluate(() => HKPlaytest.snapshot().tick);
      await page.waitForFunction((t) => HKPlaytest.snapshot().tick > t + 10, t0, { timeout: 3000 });
      await page.locator('canvas').focus();
      const x0 = await page.evaluate(() => HKPlaytest.snapshot().player.x);
      await page.keyboard.down('KeyD'); await page.waitForTimeout(300); await page.keyboard.up('KeyD');
      const x1 = await page.evaluate(() => HKPlaytest.snapshot().player.x);
      assert.ok(x1 > x0 + 10, '자산 실패 후 이동 입력이 반영되지 않음');
      assert.deepEqual(errors, [], `페이지 오류: ${errors.join(' | ')}`);
      await ctx.close();
    });

    if (process.env.HK_SHOT_DIR) {
      const { ctx, page } = await open(VIEWS[0]);
      await page.locator('canvas').focus();
      await page.keyboard.down('Space'); await page.waitForTimeout(200);
      await page.locator('canvas').screenshot({ path: `${process.env.HK_SHOT_DIR}/hk-pixel-jump-standing.png` });
      await page.keyboard.up('Space'); await page.waitForTimeout(900);
      await page.keyboard.down('KeyD'); await page.waitForTimeout(700); await page.keyboard.down('Space'); await page.waitForTimeout(200);
      await page.locator('canvas').screenshot({ path: `${process.env.HK_SHOT_DIR}/hk-pixel-jump-running.png` });
      await page.keyboard.up('Space'); await page.keyboard.up('KeyD');
      await ctx.close();
      console.log(`(캡처 저장: ${process.env.HK_SHOT_DIR}/hk-pixel-jump-{standing,running}.png — 육안 검토용)`);
    }
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
