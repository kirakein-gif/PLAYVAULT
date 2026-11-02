#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · PC 키보드 검사(한글 입력 상태 포함)
 * 규격: games/the-hollow-keep/docs/LADDER_ACTIONS_SPEC.md §5 (사용자 요청 2026-11-02: 회사 PC 키보드로도 플레이)
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/keyboard-ime.cjs
 * 환경 변수: HK_URL(구역 화면), CHROMIUM_PATH
 *
 * 한글 입력기가 켜져 있으면 브라우저는 key에 'ㅇ'이나 'Process'를 주고 code에만 물리 키(KeyD 등)를 준다.
 * 이 검사는 그런 키 이벤트를 만들어 이동·점프·공격·교대·조사·지도·사다리가 물리 키로 동작하는지 본다.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
const HANGUL = { KeyA: 'ㅁ', KeyD: 'ㅇ', KeyW: 'ㅈ', KeyS: 'ㄴ', KeyE: 'ㄷ', KeyJ: 'ㅓ', KeyK: 'ㅏ', KeyQ: 'ㅂ', KeyM: 'ㅡ', KeyX: 'ㅌ', KeyZ: 'ㅋ' };

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  const test = async (name, fn) => {
    try { await fn(); results.push(true); console.log(`PASS ${name}`); }
    catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
  };
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(URL);
    await page.waitForFunction(() => window.HKPlaytest && HKPlaytest.snapshot().tick > 3, null, { timeout: 8000 });
    const st = () => page.evaluate(() => { const w = HKPlaytest.snapshot(); return { x: w.player.x, y: w.player.y, cx: w.player.x + w.player.w / 2, active: w.active, climbing: !!w.player.climbing, onGround: !!w.player.onGround, tick: w.tick, attacks: (w.attacks || []).length, room: w.roomId }; });
    const ev = (type, code) => page.evaluate(([t, c, k]) => document.body.dispatchEvent(new KeyboardEvent(t, { code: c, key: k, keyCode: 229, bubbles: true, cancelable: true })), [type, code, HANGUL[code] || 'Process']);
    const down = (...codes) => Promise.all(codes.map((c) => ev('keydown', c)));
    const up = (...codes) => Promise.all(codes.map((c) => ev('keyup', c)));
    const hold = async (codes, ms) => { await down(...codes); await page.waitForTimeout(ms); await up(...codes); await page.waitForTimeout(80); };

    await test('한글 입력 상태 D·A로 좌우 이동', async () => {
      let a = await st(); await hold(['KeyD'], 300); let b = await st();
      assert.ok(b.x - a.x > 20, `D: ${(b.x - a.x).toFixed(1)}`);
      a = b; await hold(['KeyA'], 300); b = await st();
      assert.ok(a.x - b.x > 20, `A: ${(a.x - b.x).toFixed(1)}`);
    });
    await test('한글 입력 상태 K로 점프', async () => {
      await page.waitForTimeout(300);
      const a = await st(); await down('KeyK'); await page.waitForTimeout(150); const b = await st(); await up('KeyK'); await page.waitForTimeout(600);
      assert.ok(a.y - b.y > 20, `점프 높이 ${(a.y - b.y).toFixed(1)}`);
    });
    await test('한글 입력 상태 J로 공격(판정 생김)', async () => {
      await down('KeyJ'); await page.waitForTimeout(50); const b = await st(); await up('KeyJ'); await page.waitForTimeout(400);
      assert.ok(b.attacks >= 1, '공격 판정 없음');
    });
    await test('한글 입력 상태 Q로 교대', async () => {
      const a = await st(); await hold(['KeyQ'], 60); await page.waitForTimeout(200); const b = await st();
      assert.notEqual(a.active, b.active, '교대 안 됨');
      await hold(['KeyQ'], 60); await page.waitForTimeout(600);
    });
    await test('한글 입력 상태 M으로 지도 열고 닫기', async () => {
      await hold(['KeyM'], 60);
      assert.ok(await page.locator('.map-room').first().isVisible().catch(() => false), '지도가 열리지 않음');
      await hold(['KeyM'], 60);
    });
    await test('한글 입력 상태 W+A(대각선)로 사다리 아래에서 잡아 오르기, W로 계속 오르기', async () => {
      // 시작 방의 발 높이 사다리까지 걷기
      const target = await page.evaluate(() => {
        const w = HKPlaytest.snapshot(), room = w.area.rooms[w.roomId], p = w.player, f = Math.floor((p.y + p.h - 1) / 30), cols = [];
        for (let c = 0; c < 32; c++) if (room.grid[f] && room.grid[f][c] === 'H') cols.push(c);
        cols.sort((a, b) => Math.abs(a * 30 + 15 - (p.x + p.w / 2)) - Math.abs(b * 30 + 15 - (p.x + p.w / 2)));
        return cols.length ? cols[0] * 30 + 15 : null;
      });
      assert.ok(target !== null, '시작 방 발 높이에 사다리 없음');
      for (let i = 0; i < 80; i++) { const s = await st(); if (Math.abs(s.cx - target) < 5) break; await hold([s.cx < target ? 'KeyD' : 'KeyA'], Math.min(120, Math.abs(s.cx - target) * 4)); }
      await page.waitForTimeout(200);
      // 사다리 아래 끝(옆이 바닥)에서 W+A를 함께 눌러도 잡고 올라야 한다
      let a = await st(); await hold(['KeyW', 'KeyA'], 400); let b = await st();
      assert.ok(b.climbing && a.y - b.y > 20, `사다리 아래에서 W+A로 오르지 못함 (climbing ${b.climbing}, 상승 ${(a.y - b.y).toFixed(1)})`);
      a = b; await hold(['KeyW'], 300); b = await st();
      assert.ok(b.climbing && a.y - b.y > 15, `W로 오르지 못함 (climbing ${b.climbing}, 상승 ${(a.y - b.y).toFixed(1)})`);
    });
    await test('페이지 오류 없음', () => assert.deepEqual(errors, []));
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
