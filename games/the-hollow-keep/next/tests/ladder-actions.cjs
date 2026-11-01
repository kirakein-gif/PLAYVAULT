#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 사다리 위 행동 인수 테스트
 * 규격: games/the-hollow-keep/docs/LADDER_ACTIONS_SPEC.md §2
 * 실행: node games/the-hollow-keep/next/tests/ladder-actions.cjs   (HK_SIM으로 다른 sim.js 지정 가능)
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(__dirname, '..', 'sim.js'));

const T = 30, COLS = 32, ROWS = 18;
const NONE = { left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false, interact: false };
const I = (o = {}) => Object.assign({}, NONE, o);
const P = (w) => HK.getPlayer(w);
const feet = (p) => p.y + p.h;
const LADDER = 15, FLOOR_ROW = 10, SHELF = FLOOR_ROW * T; // 10행 윗면 = 300

// 사다리 15열(5~16행). 왼쪽 10행에 벽 바닥(1~13열, 14열은 틈), 오른쪽 10행에 한쪽 발판(17~22열, 16열은 틈).
function makeArea(hero) {
  const g = Array.from({ length: ROWS }, (_, r) => (r === 0 || r === ROWS - 1 ? '#'.repeat(COLS) : '#' + '.'.repeat(COLS - 2) + '#').split(''));
  for (let c = 1; c <= 13; c++) g[FLOOR_ROW][c] = '#';
  for (let c = 17; c <= 22; c++) g[FLOOR_ROW][c] = '-';
  for (let r = 5; r <= 16; r++) g[r][LADDER] = 'H';
  const c = HK.CONFIG.heroes[hero];
  return { version: 1, cols: COLS, rows: ROWS, tile: T, start: { room: 'a', x: LADDER * T + T / 2 - c.width / 2, y: 510 - c.height },
    rooms: { a: { pos: [0, 0], name: 'test', grid: g.map((r) => r.join('')), objects: [] } } };
}
const world = (hero = 'ethan') => { const w = HK.createWorld({ area: makeArea(hero), hero }); for (let i = 0; i < 5; i++) HK.step(w, I()); return w; };
function climbTo(w, feetY) { // 사다리를 잡고 발이 feetY 근처(±2)에 오게
  for (let i = 0; i < 400 && !(P(w).climbing && Math.abs(feet(P(w)) - feetY) <= 2); i++) HK.step(w, I(feet(P(w)) > feetY ? { up: true } : { down: true }));
  assert.ok(P(w).climbing && Math.abs(feet(P(w)) - feetY) <= 2, `사다리에서 발 ${feetY}에 오지 못함 (발 ${feet(P(w)).toFixed(1)}, climbing ${P(w).climbing})`);
}
const has = (ev, type) => ev.some((e) => e.type === type);

const results = [];
function test(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}

test('L1 ↑를 누른 채 점프(점프 계속 누름): 사다리를 떠나 위로 뛰고 16틱 동안 다시 매달리지 않음(그 뒤엔 다시 잡을 수 있음)', () => {
  const w = world(); climbTo(w, 420);
  const y0 = P(w).y, ev = HK.step(w, I({ up: true, jump: true }));
  assert.ok(has(ev, 'jump') && !P(w).climbing, '점프 이벤트와 사다리 떠남');
  let minY = P(w).y;
  for (let i = 0; i < 16; i++) { HK.step(w, I({ up: true, jump: true })); minY = Math.min(minY, P(w).y); assert.ok(!P(w).climbing, `${i + 1}틱째 다시 매달림(점프가 사라져 보임)`); }
  assert.ok(minY <= y0 - 40, `위로 ${(y0 - minY).toFixed(1)}만 오름(40 이상)`);
  let re = false; for (let i = 0; i < 90 && !re; i++) { HK.step(w, I({ up: true })); re = P(w).climbing; }
  assert.ok(re, '16틱 뒤에도 ↑로 다시 잡지 못함');
});

test('L1 ↑+→(대각선)으로 점프: 다시 매달리지 않고 오른쪽으로 이동', () => {
  const w = world(); climbTo(w, 420);
  const x0 = P(w).x; HK.step(w, I({ up: true, right: true, jump: true }));
  for (let i = 0; i < 20; i++) { HK.step(w, I({ up: true, right: true })); assert.ok(!P(w).climbing, `${i + 1}틱째 다시 매달림`); }
  assert.ok(P(w).x >= x0 + 20, `오른쪽으로 ${(P(w).x - x0).toFixed(1)}만 이동(20 이상)`);
});

for (const hero of ['ethan', 'noah']) test(`L2 옆 바닥 높이에서 ←: 사다리에서 내려 바닥 위에 서고 걸어감 [${hero}]`, () => {
  const w = world(hero); climbTo(w, SHELF);
  for (let i = 0; i < 4; i++) HK.step(w, I({ left: true }));
  const p = P(w);
  assert.ok(!p.climbing && p.onGround, `climbing ${p.climbing}, onGround ${p.onGround}`);
  assert.ok(Math.abs(feet(p) - SHELF) <= 0.5, `발 ${feet(p).toFixed(1)} ≠ ${SHELF}`);
  assert.ok(p.x + p.w <= LADDER * T + 0.5, '사다리 왼쪽으로 옮겨지지 않음');
  const x1 = p.x; for (let i = 0; i < 30; i++) HK.step(w, I({ left: true }));
  assert.ok(P(w).x < x1 - 30 && Math.abs(feet(P(w)) - SHELF) <= 0.5, '바닥 위를 걸어가지 못함');
});

test('L2 한쪽 발판 높이에서 →: 발판 위로 내림', () => {
  const w = world(); climbTo(w, SHELF);
  for (let i = 0; i < 4; i++) HK.step(w, I({ right: true }));
  const p = P(w);
  assert.ok(!p.climbing && p.onGround && Math.abs(feet(p) - SHELF) <= 0.5, `climbing ${p.climbing}, onGround ${p.onGround}, 발 ${feet(p).toFixed(1)}`);
  assert.ok(p.x >= (LADDER + 1) * T - 0.5, '사다리 오른쪽으로 옮겨지지 않음');
});

test('L2 옆에 바닥이 없으면 ←·→는 바라보는 방향만 바꾸고 계속 매달림', () => {
  const w = world(); climbTo(w, 420);
  const x0 = P(w).x;
  for (let i = 0; i < 10; i++) HK.step(w, I({ left: true }));
  assert.ok(P(w).climbing && P(w).x === x0, `떨어지거나 움직임 (climbing ${P(w).climbing}, x ${P(w).x})`);
  assert.equal(P(w).face, -1, '← 뒤 face');
  for (let i = 0; i < 3; i++) HK.step(w, I({ right: true }));
  assert.ok(P(w).climbing); assert.equal(P(w).face, 1, '→ 뒤 face');
});

test('L2 ↑+←로 오르다 바닥 높이에 오면 그 바닥으로 내림', () => {
  const w = world(); climbTo(w, 420);
  for (let i = 0; i < 200 && P(w).climbing; i++) HK.step(w, I({ up: true, left: true }));
  const p = P(w);
  assert.ok(!p.climbing && p.onGround && Math.abs(feet(p) - SHELF) <= 0.5, `climbing ${p.climbing}, 발 ${feet(p).toFixed(1)}`);
});

test('L3 사다리에서 공격: 매달린 채 공격 판정이 생기고 방향은 마지막 좌우 입력', () => {
  for (const hero of ['ethan', 'noah']) {
    const w = world(hero); climbTo(w, 420);
    HK.step(w, I({ left: true })); HK.step(w, I());
    const ev = HK.step(w, I({ attack: true }));
    assert.ok(has(ev, 'attack'), `${hero}: attack 이벤트 없음`);
    assert.ok(P(w).climbing, `${hero}: 공격하자 사다리에서 떨어짐`);
    const hb = HK.getHitboxes(w);
    assert.ok(hb.length >= 1, `${hero}: 공격 판정 없음`);
    assert.ok(hb[0].x + hb[0].w <= P(w).x + 1, `${hero}: 왼쪽을 본 뒤인데 판정이 왼쪽에 없음`);
  }
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
