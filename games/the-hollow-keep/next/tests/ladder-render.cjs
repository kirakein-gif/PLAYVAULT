#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 사다리 오르기 동작 그리기 검사
 * 규격: games/the-hollow-keep/docs/LADDER_ACTIONS_SPEC.md §3
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/ladder-render.cjs
 * 환경 변수: HK_URL(구역 화면), CHROMIUM_PATH
 *
 * 실제 앱에서 키보드로 시작 방(성문)의 가장 가까운 사다리까지 걸어가 ↑로 오른다.
 * 캔버스 drawImage를 가로채 주인공을 어느 시트의 어느 프레임으로 그렸는지 기록한다(월드·좌표 주입 없음).
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS ${name}`); }
    catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
  };
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.addInitScript(() => {
      window.__rec = null;
      const orig = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
        if (window.__rec && a.length === 8 && window.__heroFiles) {
          const src = img.src || '', hit = window.__heroFiles.find((f) => src.endsWith('/' + f.file));
          if (hit) window.__rec.cur.push({ anim: hit.name, sx: a[0] });
        }
        return orig.call(this, img, ...a);
      };
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => raf.call(window, (t) => {
        if (window.__rec) window.__rec.cur = [];
        cb(t);
        if (window.__rec && window.HKPlaytest) { const p = HKPlaytest.snapshot().player; window.__rec.frames.push({ draws: window.__rec.cur, climbing: !!p.climbing, y: p.y }); }
      });
    });
    await page.goto(URL);
    await page.waitForFunction(() => window.HKPlaytest && HKPlaytest.snapshot().tick > 3, null, { timeout: 8000 });
    await page.waitForFunction(() => { const s = HKPlaytest.artStatus && HKPlaytest.artStatus(); return s && (s.loaded || (s.failed && s.failed.length)); }, null, { timeout: 8000 }).catch(() => {});
    const info = await page.evaluate(() => {
      const w = HKPlaytest.snapshot(), m = HKPixel.manifest(), files = [];
      for (const [name, a] of Object.entries(m.heroes[w.active].animations)) files.push({ name, file: a.file, frameW: a.frameW });
      window.__heroFiles = files;
      // 시작 방에서 주인공과 가장 가까운 사다리 열(바닥에서 바로 잡을 수 있는 것)
      const room = w.area.rooms[w.roomId], p = w.player, foot = Math.floor((p.y + p.h - 1) / 30), cols = [];
      for (let c = 0; c < 32; c++) if (room.grid[foot] && room.grid[foot][c] === 'H') cols.push(c);
      cols.sort((a, b) => Math.abs(a * 30 + 15 - (p.x + p.w / 2)) - Math.abs(b * 30 + 15 - (p.x + p.w / 2)));
      return { climb: m.heroes[w.active].animations.climb || null, ladder: cols[0], hero: w.active };
    });
    await test('시작 방 바닥 높이에 사다리가 있음(검사 준비)', () => assert.ok(Number.isInteger(info.ladder), '시작 방 발 높이에 사다리 칸이 없음'));
    // 사다리까지 걷기
    const target = info.ladder * 30 + 15;
    const cx = () => page.evaluate(() => { const p = HKPlaytest.snapshot().player; return p.x + p.w / 2; });
    for (let i = 0; i < 80; i++) {
      const x = await cx(); if (Math.abs(x - target) < 5) break;
      const key = x < target ? 'ArrowRight' : 'ArrowLeft';
      await page.keyboard.down(key); await page.waitForTimeout(Math.min(120, Math.abs(x - target) * 4)); await page.keyboard.up(key); await page.waitForTimeout(40);
    }
    await page.waitForTimeout(200);
    const run = async (fn) => { await page.evaluate(() => { window.__rec = { cur: [], frames: [] }; }); await fn(); const r = await page.evaluate(() => window.__rec.frames); await page.evaluate(() => { window.__rec = null; }); return r; };
    const moving = await run(async () => { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); });
    const still = await run(async () => { await page.keyboard.up('ArrowUp'); await page.waitForTimeout(150); await page.evaluate(() => { window.__rec.frames = []; }); await page.waitForTimeout(500); });
    const heroDraw = (f) => f.draws[f.draws.length - 1];
    await test('↑로 사다리를 잡고 오름(검사 준비)', () => {
      assert.ok(moving.some((f) => f.climbing), '사다리에 매달리지 못함');
      assert.ok(moving[0].y - moving[moving.length - 1].y > 30, '위로 오르지 않음');
    });
    await test(`${info.hero}: manifest에 climb 동작이 있음`, () => assert.ok(info.climb, 'animations.climb 없음'));
    await test('매달린 동안 주인공을 climb 시트로 그림(idle 대체 아님)', () => {
      const c = moving.filter((f) => f.climbing && f.draws.length);
      assert.ok(c.length >= 10, `매달린 프레임 ${c.length}개`);
      const wrong = c.filter((f) => heroDraw(f).anim !== 'climb');
      assert.ok(wrong.length <= 1, `${wrong.length}/${c.length} 프레임을 ${wrong[0] && heroDraw(wrong[0]).anim}로 그림`);
    });
    await test('오르는 동안 프레임이 바뀜(2종 이상)', () => {
      const sx = new Set(moving.filter((f) => f.climbing && f.draws.length && heroDraw(f).anim === 'climb').map((f) => heroDraw(f).sx));
      assert.ok(sx.size >= 2, `오르는 동안 프레임 ${sx.size}종`);
    });
    await test('사다리에서 멈추면 프레임도 멈춤(시간이 지나도 손발이 움직이지 않음)', () => {
      const c = still.filter((f) => f.climbing && f.draws.length);
      assert.ok(c.length >= 10, `멈춘 동안 매달린 프레임 ${c.length}개(사다리에서 떨어짐?)`);
      const ys = new Set(c.map((f) => f.y.toFixed(2)));
      assert.equal(ys.size, 1, '멈춤 확인 실패: 위치가 바뀜');
      const sx = new Set(c.map((f) => heroDraw(f).anim + ':' + heroDraw(f).sx));
      assert.equal(sx.size, 1, `멈춘 동안 그림이 ${sx.size}종으로 바뀜`);
    });
    await test('페이지 오류 없음', () => assert.deepEqual(errors, []));
    await ctx.close();
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
