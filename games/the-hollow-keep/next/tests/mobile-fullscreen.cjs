#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 모바일 전체 화면·가로 고정 인수 테스트
 * 규격: games/the-hollow-keep/docs/FOUNDATION_SPEC.md §7-2
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/mobile-fullscreen.cjs
 * 환경 변수: HK_URL, CHROMIUM_PATH
 *
 * 전체 화면 버튼은 모두 [data-fullscreen] 속성을 가진다.
 * headless 브라우저에서는 실제 화면 회전을 할 수 없으므로 screen.orientation.lock 호출을 기록·거절하도록 바꿔
 * "가로 고정을 요청하는지"와 "거절되어도 오류 없이 동작하는지"를 검사한다.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
const SPY = () => {
  window.__lockCalls = [];
  window.__unhandled = [];
  addEventListener('unhandledrejection', (e) => window.__unhandled.push(String(e.reason)));
  if (window.ScreenOrientation) {
    Object.defineProperty(ScreenOrientation.prototype, 'lock', {
      configurable: true,
      value(kind) { window.__lockCalls.push(kind); return Promise.reject(new DOMException('test: lock rejected', 'NotSupportedError')); }
    });
  }
};
const NO_FULLSCREEN = () => {
  Object.defineProperty(Document.prototype, 'fullscreenEnabled', { configurable: true, get: () => false });
  Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: undefined });
  Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { configurable: true, value: undefined });
};
const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) > 0;

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS ${name}`); }
    catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
  };
  async function open(viewport, init = []) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    for (const fn of [SPY, ...init]) await page.addInitScript(fn);
    await page.goto(URL);
    await page.waitForFunction(() => window.HKSim && document.querySelector('canvas'));
    await page.waitForTimeout(300);
    return { ctx, page, errors };
  }
  const visibleFs = (page) => page.evaluate(() => [...document.querySelectorAll('[data-fullscreen]')].filter((b) => !b.closest('#rotate'))
    .filter((b) => b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden')
    .map((b) => { const r = b.getBoundingClientRect(); return { id: b.id, left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; }));
  const fsOn = (page) => page.evaluate(() => !!(document.fullscreenElement || document.webkitFullscreenElement));

  try {
    // 1. 가로 화면: 버튼 위치·크기
    for (const [vw, vh] of [[780, 330], [915, 412]]) {
      await test(`${vw}x${vh} 가로: 전체 화면 버튼이 보이고 36px 이상, 캔버스·조작을 가리지 않음`, async () => {
        const { ctx, page } = await open({ width: vw, height: vh });
        const fs = await visibleFs(page);
        assert.ok(fs.length >= 1, '보이는 [data-fullscreen] 버튼이 없음');
        for (const b of fs) {
        assert.ok(b.left >= -0.5 && b.top >= -0.5 && b.right <= vw + 0.5 && b.bottom <= vh + 0.5, '버튼이 화면 밖');
        assert.ok(b.width >= 36 && b.height >= 36, `버튼 ${b.width.toFixed(0)}x${b.height.toFixed(0)} < 36px`);
        const others = await page.evaluate(() => [document.querySelector('canvas'), ...document.querySelectorAll('[data-action],[data-control="move"],#reset,#debug-toggle')]
          .filter((e) => e && e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return { name: e.id || e.dataset.action || e.dataset.control || e.tagName, left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }));
        for (const o of others) assert.ok(!overlap(b, o), `전체 화면 버튼이 ${o.name}와 겹침`);
        }
        await ctx.close();
      });
    }

    // 2. 가로 화면: 누르면 전체 화면 + 가로 고정 요청, 다시 누르면 해제, 오류 없음
    await test('780x330 가로: 누르면 전체 화면 진입·가로 고정 요청, 다시 누르면 해제, 거절돼도 오류 없음', async () => {
      const { ctx, page, errors } = await open({ width: 780, height: 330 });
      const sel = '[data-fullscreen]:visible';
      await page.locator(sel).first().tap();
      await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 2000 });
      await page.waitForTimeout(200);
      const calls = await page.evaluate(() => window.__lockCalls);
      assert.ok(calls.some((k) => String(k).startsWith('landscape')), `가로 고정 요청 없음: ${JSON.stringify(calls)}`);
      await page.locator(sel).first().tap();
      await page.waitForFunction(() => !document.fullscreenElement, null, { timeout: 2000 });
      await page.waitForTimeout(200);
      const unhandled = await page.evaluate(() => window.__unhandled);
      assert.deepEqual(unhandled, [], `처리되지 않은 Promise 거절: ${unhandled.join(' | ')}`);
      assert.deepEqual(errors, [], `페이지 오류: ${errors.join(' | ')}`);
      await ctx.close();
    });

    // 3. 전체 화면 중에도 게임 조작이 계속 동작
    await test('780x330 가로: 전체 화면에서 공격 버튼 입력이 게임에 전달됨', async () => {
      const { ctx, page } = await open({ width: 780, height: 330 });
      await page.locator('[data-fullscreen]:visible').first().tap();
      await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 2000 });
      const t0 = await page.evaluate(() => HKPlaytest.snapshot().tick);
      await page.waitForFunction((t) => HKPlaytest.snapshot().tick > t + 5, t0, { timeout: 3000 });
      const before = await page.evaluate(() => HKPlaytest.snapshot().attacks.length + HKPlaytest.snapshot().dummies.reduce((s, d) => s + d.hp, 0));
      const atk = page.locator('[data-action="attack"]');
      const box = await atk.boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
      const after = await page.evaluate(() => HKPlaytest.snapshot().attacks.length + HKPlaytest.snapshot().dummies.reduce((s, d) => s + d.hp, 0));
      assert.notEqual(after, before, '전체 화면에서 공격 입력이 반영되지 않음');
      await ctx.close();
    });

    // 4. 세로 화면: 회전 안내 안에 전체 화면(가로) 버튼
    await test('390x780 세로: 회전 안내에 전체 화면 버튼이 있고 누르면 전체 화면·가로 고정 요청', async () => {
      const { ctx, page, errors } = await open({ width: 390, height: 780 });
      const inRotate = await page.evaluate(() => { const r = document.getElementById('rotate'); if (!r || getComputedStyle(r).display === 'none') return 'rotate-hidden'; const b = r.querySelector('[data-fullscreen]'); return b && b.offsetParent !== null ? 'ok' : 'no-button'; });
      assert.notEqual(inRotate, 'rotate-hidden', '세로 화면에서 회전 안내(#rotate)가 보이지 않음');
      assert.equal(inRotate, 'ok', '회전 안내(#rotate) 안에 보이는 [data-fullscreen] 버튼이 필요합니다');
      await page.locator('#rotate [data-fullscreen]').tap();
      await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 2000 });
      await page.waitForTimeout(200);
      const calls = await page.evaluate(() => window.__lockCalls);
      assert.ok(calls.some((k) => String(k).startsWith('landscape')), `가로 고정 요청 없음: ${JSON.stringify(calls)}`);
      assert.deepEqual(errors, [], `페이지 오류: ${errors.join(' | ')}`);
      await ctx.close();
    });

    // 5. 전체 화면 미지원 브라우저(예: iPhone Safari)
    await test('미지원 브라우저: 오류 없이 버튼을 숨기거나 누르면 안내 문구 표시', async () => {
      const { ctx, page, errors } = await open({ width: 780, height: 330 }, [NO_FULLSCREEN]);
      const fs = await visibleFs(page);
      if (fs.length) {
        const before = await page.locator('#notice').textContent();
        await page.locator('[data-fullscreen]:visible').first().tap();
        await page.waitForTimeout(300);
        const after = await page.locator('#notice').textContent();
        assert.notEqual(after, before, '미지원 환경에서 버튼을 눌러도 안내가 없음');
      }
      const unhandled = await page.evaluate(() => window.__unhandled);
      assert.deepEqual([...errors, ...unhandled], [], `오류: ${[...errors, ...unhandled].join(' | ')}`);
      await ctx.close();
    });
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
