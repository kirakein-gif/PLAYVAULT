#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 픽셀아트 화면 확대·적용 인수 테스트
 * 규격: games/the-hollow-keep/docs/ART_DIRECTION.md §4-7
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/pixel-render.cjs
 * 환경 변수: HK_URL, CHROMIUM_PATH, HK_SHOT_DIR(지정하면 점프 자세 캡처 저장)
 * 그림 밀도: HKPlaytest.artStatus().scale(1 또는 2, 없으면 1). 실제 해상도는 (960×scale)의 정수 배여야 한다.
 * 베기 효과 검사는 기본 자산 manifest에 noah attack과 fx-slash가 모두 있을 때만 판정한다.
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
      art: typeof HKPlaytest.artStatus === 'function' ? HKPlaytest.artStatus() : null,
      scale: (typeof HKPlaytest.artStatus === 'function' && HKPlaytest.artStatus().scale) || 1 };
  });
  const assertBacking = (m) => {
    const unit = 960 * m.scale;
    assert.ok(m.scale === 1 || m.scale === 2, `artStatus().scale은 1 또는 2(현재 ${m.scale})`);
    assert.equal(m.bw % unit, 0, `캔버스 실제 폭 ${m.bw}이 ${unit}(960×scale)의 정수 배가 아님`);
    assert.equal(m.bh * 960, m.bw * 540, `캔버스 비율 ${m.bw}×${m.bh}이 16:9가 아님`);
    const need = m.cw * m.dpr;
    assert.ok(m.bw >= need - 0.5, `실제 폭 ${m.bw} < 표시 폭×DPR ${need.toFixed(0)} (확대 시 흐려짐)`);
    assert.ok(m.bw - unit < need - 0.5 || m.bw === unit, `실제 폭 ${m.bw}이 필요한 가장 작은 정수 배보다 큼(표시 ${need.toFixed(0)}, 단위 ${unit})`);
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

    // ── Noah 베기 효과: 휘두르는 프레임부터, 공격 그림과 함께만, 몸 앞쪽에만 (ART_DIRECTION §4-4) ──
    const SLASH_HOOK = () => {
      window.__draws = [];
      const orig = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
        const src = (img && img.src) || '';
        const m = /noah-(attack|fx-slash)\.png/.exec(src);
        if (m && a.length === 8 && window.HKPlaytest) {
          const t = this.getTransform(), w = HKPlaytest.snapshot();
          const xs = [a[4], a[4] + a[6]].map((x) => [a[5], a[5] + a[7]].map((y) => t.a * x + t.c * y + t.e)).flat();
          window.__draws.push({ kind: m[1], sx: a[0], tick: w.tick, face: w.player.face, cx: w.player.x + w.player.w / 2,
            left: Math.min(...xs), right: Math.max(...xs), unit: this.canvas.width / 960 });
          if (window.__draws.length > 400) window.__draws.shift();
        }
        return orig.call(this, img, ...a);
      };
    };
    for (const dir of ['right', 'left']) {
      await test(`Noah 베기 효과(${dir === 'right' ? '오른쪽' : '왼쪽'}): 휘두르는 프레임부터·공격 그림과 함께만·몸 앞쪽에만`, async () => {
        const { ctx, page } = await open(VIEWS[0], (p) => p.addInitScript(SLASH_HOOK));
        const man = await page.evaluate(() => fetch('assets/pixel/manifest.json').then((r) => r.json()).catch(() => null));
        const fx = man && man.heroes && man.heroes.noah && man.heroes.noah.animations['fx-slash'];
        const atk = man && man.heroes && man.heroes.noah && man.heroes.noah.animations.attack;
        if (!atk || !fx) { await ctx.close(); return; } // 공격 그림·베기 효과가 없는 구성은 검사 대상 아님
        await page.locator('canvas').focus();
        await page.keyboard.press('KeyQ'); await page.waitForTimeout(300);
        if (dir === 'left') { await page.keyboard.down('KeyA'); await page.waitForTimeout(60); await page.keyboard.up('KeyA'); }
        else { await page.keyboard.down('KeyD'); await page.waitForTimeout(60); await page.keyboard.up('KeyD'); }
        await page.waitForTimeout(400);
        await page.evaluate(() => { window.__draws = []; });
        await page.keyboard.press('KeyX'); await page.waitForTimeout(900);
        const draws = await page.evaluate(() => window.__draws);
        const fxDraws = draws.filter((d) => d.kind === 'fx-slash');
        assert.ok(fxDraws.length > 0, '공격했지만 fx-slash가 한 번도 그려지지 않음');
        for (const f of fxDraws) {
          const same = draws.filter((d) => d.kind === 'attack' && d.tick === f.tick);
          assert.ok(same.length > 0, `tick ${f.tick}: 공격 그림 없이 효과만 그려짐`);
          const frame = Math.floor(same[same.length - 1].sx / atk.frameW);
          assert.ok(frame >= 1, `tick ${f.tick}: 공격 ${frame}번(준비) 프레임에 효과가 이미 그려짐`);
          const L = f.left / f.unit, R = f.right / f.unit;
          if (f.face > 0) assert.ok(L >= f.cx - 2, `오른쪽을 보는데 효과 왼쪽 끝 ${L.toFixed(1)}이 몸 중심 ${f.cx.toFixed(1)}보다 뒤쪽`);
          else assert.ok(R <= f.cx + 2, `왼쪽을 보는데 효과 오른쪽 끝 ${R.toFixed(1)}이 몸 중심 ${f.cx.toFixed(1)}보다 뒤쪽`);
        }
        await ctx.close();
      });
    }

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
