#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 타일 모자이크 실제 그리기 검사
 * 규격: games/the-hollow-keep/docs/TILE_MOSAIC_SPEC.md §2~§4
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/tile-mosaic-render.cjs
 * 환경 변수: HK_URL(구역 화면, 기본 http://127.0.0.1:8765/games/the-hollow-keep/next/), CHROMIUM_PATH, HK_AREA(구역 파일)
 *
 * 캔버스 drawImage 호출을 가로채 tiles 시트에서 어떤 조각을 어느 칸에 그렸는지 기록한다.
 * 칸 위치는 그린 크기(dw)로 나눠 구하므로 렌더러가 게임 단위로 그리든 픽셀 단위로 그리든 같다.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
const NEXT = path.join(__dirname, '..');
const area = JSON.parse(fs.readFileSync(path.resolve(process.env.HK_AREA || path.join(NEXT, 'areas', 'area1.json')), 'utf8'));
const ROWS = 18, COLS = 32;

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
      window.__draws = null; // null이면 기록 안 함
      const orig = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
        if (window.__draws && a.length === 8) window.__draws.push({ src: img.src || '', sx: a[0], sy: a[1], sw: a[2], sh: a[3], dx: a[4], dy: a[5], dw: a[6], dh: a[7] });
        else if (window.__draws && (a.length === 2 || a.length === 4)) window.__draws.push({ src: img.src || '', whole: true, dx: a[0], dy: a[1] });
        return orig.call(this, img, ...a);
      };
    });
    await page.goto(URL);
    await page.waitForFunction(() => window.HKPlaytest && HKPlaytest.snapshot().tick > 3, null, { timeout: 8000 });
    await page.waitForFunction(() => { const s = HKPlaytest.artStatus && HKPlaytest.artStatus(); return s && (s.loaded || (s.failed && s.failed.length)); }, null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(200);
    const grab = () => page.evaluate(async () => {
      window.__draws = [];
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const d = window.__draws; window.__draws = null;
      return { draws: d, manifest: HKPixel.manifest(), room: HKPlaytest.snapshot().roomId };
    });
    const f1 = await grab();
    const f2 = await grab();
    const m = f1.manifest || {}, tiles = m.tiles || {}, cells = tiles.cells || {};
    const TILE = (m.tileSize) || 60;
    const roomId = f1.room || area.start.room, room = area.rooms[roomId];
    // 한 프레임에서 tiles 시트 조각을 칸별로 정리
    function tileMap(frame) {
      const map = new Map(); // "r,c" -> [이름들]
      for (const d of frame.draws) {
        if (d.whole || !tiles.file || !d.src.endsWith('/' + tiles.file)) continue;
        const names = Object.entries(cells).filter(([, [cx, cy]]) => cx * TILE === d.sx && cy * TILE === d.sy).map(([n]) => n);
        const c = Math.round(d.dx / d.dw), r = Math.round(d.dy / d.dw); // 칸 크기 = 그린 폭(발판처럼 높이가 낮은 조각도 있음)
        const k = `${r},${c}`; map.set(k, [...(map.get(k) || []), ...names]);
      }
      return map;
    }
    const t1 = tileMap(f1), t2 = tileMap(f2);
    const at = (r, c) => t1.get(`${r},${c}`) || [];

    await test('구역 화면에서 큰 배경 그림을 그리지 않음(모자이크 §2)', () => {
      assert.ok(m.background, 'manifest.background 이름 확인 불가');
      const big = f1.draws.filter((d) => d.src.endsWith('/' + m.background));
      assert.equal(big.length, 0, `${m.background}를 ${big.length}번 그림`);
    });
    await test('조각은 격자에 딱 맞음: tiles 시트 그리기의 위치가 그린 크기의 정수 배', () => {
      const bad = f1.draws.filter((d) => !d.whole && tiles.file && d.src.endsWith('/' + tiles.file))
        .filter((d) => Math.abs(d.dx / d.dw - Math.round(d.dx / d.dw)) > 1e-6 || Math.abs(d.dy / d.dw - Math.round(d.dy / d.dw)) > 1e-6 || d.dh > d.dw);
      assert.equal(bad.length, 0, `격자에 안 맞는 조각 ${bad.length}개 (예: ${JSON.stringify(bad[0] || {})})`);
    });
    await test(`뒷벽: ${roomId} 방의 벽 아닌 칸마다 back-1~3 중 하나, 변형 2종 이상 사용`, () => {
      const holes = [], used = new Set();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (room.grid[r][c] === '#') continue;
        const b = at(r, c).filter((n) => /^back-[123]$/.test(n));
        if (!b.length) holes.push(`${r},${c}`); else b.forEach((n) => used.add(n));
      }
      assert.deepEqual(holes.slice(0, 5), [], `뒷벽 없는 칸 ${holes.length}개`);
      assert.ok(used.size >= 2, `뒷벽 변형 ${[...used].join(', ')}만 사용`);
    });
    await test('벽 조각 고르기(§3): 서는 면 floor-top, 천장 아랫면 wall-bottom, 옆면 wall-left/right, 속 wall-fill·wall-fill-2', () => {
      const wall = (r, c) => r < 0 || r >= ROWS || c < 0 || c >= COLS || room.grid[r][c] === '#';
      const bad = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!wall(r, c)) continue;
        const want = !wall(r - 1, c) ? ['floor-top'] : !wall(r + 1, c) ? ['wall-bottom'] : !wall(r, c - 1) ? ['wall-left'] : !wall(r, c + 1) ? ['wall-right'] : ['wall-fill', 'wall-fill-2'];
        const got = at(r, c);
        // 모서리 조각(선택)은 wall-top-left 등 이름이면 허용
        if (!got.some((n) => want.includes(n) || /^wall-(top|bottom)-(left|right)$/.test(n))) bad.push(`${r},${c} 기대 ${want.join('/')} 실제 ${got.join('/') || '없음'}`);
      }
      assert.deepEqual(bad.slice(0, 3), [], `맞지 않는 벽 칸 ${bad.length}개`);
    });
    await test('장식(§4): back 격자의 w·p·b 묶음은 위·가운데·아래 조각, c는 candle', () => {
      assert.ok(Array.isArray(room.back), `${roomId}.back 없음`);
      const bad = [];
      const piece = { w: ['window-top', 'window-mid', 'window-bottom'], p: ['pillar-top', 'pillar-mid', 'pillar-base'], b: ['banner-top', 'banner-mid', 'banner-bottom'] };
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const ch = room.back[r][c]; if (ch === '.') continue;
        let want;
        if (ch === 'c') want = 'candle';
        else { const up = r > 0 && room.back[r - 1][c] === ch, down = r < ROWS - 1 && room.back[r + 1][c] === ch; want = piece[ch][!up ? 0 : !down ? 2 : 1]; }
        if (!at(r, c).includes(want)) bad.push(`${r},${c} ${want}`);
      }
      assert.deepEqual(bad.slice(0, 3), [], `그려지지 않은 장식 조각 ${bad.length}개`);
    });
    await test('같은 방은 언제나 같은 모습: 두 프레임의 조각 배치가 같음', () => {
      const s = (map) => [...map.entries()].sort().map(([k, v]) => k + ':' + [...v].sort().join('/')).join(';');
      assert.equal(s(t1), s(t2), '프레임마다 조각 선택이 바뀜');
    });
    await test('페이지 오류 없음', () => assert.deepEqual(errors, []));
    await ctx.close();
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
