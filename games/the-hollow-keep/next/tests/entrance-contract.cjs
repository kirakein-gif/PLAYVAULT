#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 출입문(entrance) 규칙 인수 테스트
 * 규격: games/the-hollow-keep/docs/EXPLORATION_REFINE_SPEC.md §3
 * 실행: node games/the-hollow-keep/next/tests/entrance-contract.cjs   (HK_SIM으로 다른 sim.js 지정 가능)
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(__dirname, '..', 'sim.js'));

const T = 30, COLS = 32, ROWS = 18, FLOOR = 510;
const NONE = { left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false, interact: false };
const I = (o = {}) => Object.assign({}, NONE, o);
const P = (w) => HK.getPlayer(w);
const cx = (p) => p.x + p.w / 2, feet = (p) => p.y + p.h;
const cfg = (h) => HK.CONFIG.heroes[h];

function room(pos, objects = []) {
  const g = Array.from({ length: ROWS }, (_, r) => (r === 0 || r === ROWS - 1 ? '#'.repeat(COLS) : '#' + '.'.repeat(COLS - 2) + '#'));
  return { pos, name: 'test', grid: g, objects };
}
const ent = (id, x, to, extra = {}) => ({ type: 'entrance', id, x, y: 14, to, ...extra }); // 2×3칸, 아래 끝 = 17행 윗면
const area = (start, rooms) => ({ version: 1, cols: COLS, rows: ROWS, tile: T, start, rooms });
const standAt = (hero, col) => ({ x: col * T + T / 2 - cfg(hero).width / 2, y: FLOOR - cfg(hero).height });
const world = (a, hero = 'ethan') => HK.createWorld({ area: JSON.parse(JSON.stringify(a)), hero });
function run(w, inp, n) { const all = []; for (let i = 0; i < n; i++) all.push(...HK.step(w, inp)); return all; }
function tap(w, key) { const ev = HK.step(w, I({ [key]: true })); ev.push(...HK.step(w, I())); return ev; }
function walkTo(w, xCenter, max = 400) {
  for (let i = 0; i < max && Math.abs(cx(P(w)) - xCenter) >= 4; i++) HK.step(w, I({ [cx(P(w)) < xCenter ? 'right' : 'left']: true }));
  run(w, I(), 30);
  assert.ok(Math.abs(cx(P(w)) - xCenter) < 6, `x ${xCenter} 근처로 가지 못함 (현재 ${cx(P(w)).toFixed(1)})`);
}
const has = (ev, type, extra = {}) => ev.some((e) => e.type === type && Object.entries(extra).every(([k, v]) => e[k] === v));
const count = (ev, type) => ev.filter((e) => e.type === type).length;
const doorCenter = (col) => col * T + T; // 2칸 폭 출입문 가운데

const results = [];
function test(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}

// a(0,0)와 이웃하지 않은 b(3,0)를 출입문 한 쌍으로 잇는다
const A_PAIR = area({ room: 'a', ...standAt('ethan', 4) }, {
  a: room([0, 0], [ent('a-door', 10, 'b-door')]),
  b: room([3, 0], [ent('b-door', 20, 'a-door')])
});

test('getFlags에 entered·unlocked가 있고 처음엔 비어 있음', () => {
  const f = HK.getFlags(world(A_PAIR));
  assert.deepEqual(f.entered, {}); assert.deepEqual(f.unlocked, {});
});

test('↑로 들어가면 짝 출입문(이웃하지 않은 방)으로 이동: 위치·속도·이벤트·방문·공격 정리', () => {
  const w = world(A_PAIR);
  walkTo(w, doorCenter(10));
  HK.step(w, I({ attack: true })); HK.step(w, I()); // 날아가는 룬탄
  const ev = tap(w, 'up');
  assert.equal(w.roomId, 'b', `방 ${w.roomId}`);
  assert.ok(has(ev, 'enter', { id: 'a-door', to: 'b-door', room: 'b' }), 'enter 이벤트');
  assert.ok(has(ev, 'room', { from: 'a', to: 'b', dir: 'entrance' }), "room 이벤트(dir 'entrance')");
  const p = P(w);
  assert.ok(Math.abs(cx(p) - doorCenter(20)) <= 1, `도착 중심 ${cx(p).toFixed(1)} ≠ ${doorCenter(20)}`);
  assert.ok(Math.abs(feet(p) - FLOOR) <= 0.5 && p.onGround, `발 ${feet(p).toFixed(1)}, onGround ${p.onGround}`);
  assert.equal(p.vx, 0);
  assert.equal(HK.getHitboxes(w).length, 0, '이전 방의 공격이 남아 있음');
  assert.ok(HK.getMap(w).rooms.find((r) => r.id === 'b').visited, 'b 방문 기록');
  assert.ok(HK.getFlags(w).entered['a-door'], 'entered[a-door]');
});

test('조사(interact)로도 들어가고, 짝으로 되돌아올 수 있음', () => {
  const w = world(A_PAIR);
  walkTo(w, doorCenter(10)); tap(w, 'interact');
  assert.equal(w.roomId, 'b');
  run(w, I(), 10);
  const ev = tap(w, 'interact');
  assert.equal(w.roomId, 'a'); assert.ok(has(ev, 'enter', { id: 'b-door', to: 'a-door', room: 'a' }));
  assert.ok(Math.abs(cx(P(w)) - doorCenter(10)) <= 1);
});

test('누르고 있어도 한 번만 들어감(누른 순간 판정)', () => {
  const w = world(A_PAIR);
  walkTo(w, doorCenter(10));
  const ev = run(w, I({ up: true }), 90);
  assert.equal(count(ev, 'enter'), 1, `enter ${count(ev, 'enter')}회`);
});

test('출입문 밖이나 공중에서는 들어가지 않고, ↑는 점프가 아님', () => {
  const w = world(A_PAIR);
  walkTo(w, doorCenter(10) + 3 * T);
  let ev = tap(w, 'up');
  assert.ok(!has(ev, 'enter') && !has(ev, 'jump') && w.roomId === 'a', '출입문 밖');
  walkTo(w, doorCenter(10));
  HK.step(w, I({ jump: true })); run(w, I(), 6);
  assert.ok(!P(w).onGround, '점프 중이어야 함');
  ev = tap(w, 'up'); ev.push(...tap(w, 'interact'));
  assert.ok(!has(ev, 'enter') && w.roomId === 'a', '공중에서 들어감');
  run(w, I(), 90);
  assert.ok(P(w).onGround);
  ev = tap(w, 'up');
  assert.ok(has(ev, 'enter') && w.roomId === 'b', '착지 후에는 들어가야 함');
});

const A_LOCK = area({ room: 'a', ...standAt('ethan', 4) }, {
  a: room([0, 0], [ent('a-door', 10, 'b-door', { lock: { key: 'iron' } }), { type: 'key', id: 'iron-1', x: 20, y: 16, name: 'iron' }]),
  b: room([0, 2], [ent('b-door', 20, 'a-door')])
});

test('잠긴 출입문: 열쇠 없으면 denied, 열쇠 있으면 1개 쓰고 unlock 후 바로 들어감', () => {
  const w = world(A_LOCK);
  walkTo(w, doorCenter(10));
  let ev = tap(w, 'up');
  assert.ok(has(ev, 'denied', { id: 'a-door' }) && w.roomId === 'a', '열쇠 없이 막혀야 함');
  walkTo(w, 20 * T + T / 2);
  assert.equal(HK.getFlags(w).keys.iron, 1, '열쇠 줍기');
  walkTo(w, doorCenter(10));
  ev = tap(w, 'up');
  assert.ok(has(ev, 'unlock', { id: 'a-door' }), 'unlock 이벤트');
  assert.ok(has(ev, 'enter', { id: 'a-door', to: 'b-door' }) && w.roomId === 'b', '같은 입력으로 들어감');
  const f = HK.getFlags(w);
  assert.equal(f.keys.iron || 0, 0, '열쇠 1개 소모');
  assert.ok(f.unlocked['a-door'] && f.unlocked['b-door'], 'unlocked는 짝 둘 다');
});

test('한 번 연 출입문은 열쇠 없이 양쪽에서 계속 통과', () => {
  const w = world(A_LOCK);
  walkTo(w, 20 * T + T / 2); walkTo(w, doorCenter(10)); tap(w, 'up');
  run(w, I(), 10);
  let ev = tap(w, 'up');
  assert.ok(w.roomId === 'a' && !has(ev, 'unlock') && !has(ev, 'denied'), '돌아오기');
  run(w, I(), 10);
  ev = tap(w, 'interact');
  assert.ok(w.roomId === 'b' && !has(ev, 'denied'), '다시 들어가기');
});

test('같은 방 안의 짝: 위치만 옮기고 room 이벤트 없음 (Noah)', () => {
  const a = area({ room: 'a', ...standAt('noah', 4) }, { a: room([0, 0], [ent('w', 3, 'e'), ent('e', 26, 'w')]) });
  const w = world(a, 'noah');
  walkTo(w, doorCenter(3));
  const ev = tap(w, 'up');
  assert.ok(has(ev, 'enter', { id: 'w', to: 'e', room: 'a' }) && !has(ev, 'room'), '이벤트');
  assert.ok(Math.abs(cx(P(w)) - doorCenter(26)) <= 1, `중심 ${cx(P(w)).toFixed(1)}`);
});

test('출입문으로 간 뒤에도 방 상태(열쇠·출입문 열림)는 유지되고 1단계 이동은 그대로', () => {
  const w = world(A_LOCK);
  walkTo(w, 20 * T + T / 2); walkTo(w, doorCenter(10)); tap(w, 'up');
  const x0 = P(w).x; run(w, I({ right: true }), 30);
  assert.ok(P(w).x > x0 + 30, '도착 후 달리기');
  HK.step(w, I({ jump: true })); run(w, I(), 3);
  assert.ok(!P(w).onGround, '도착 후 점프');
  run(w, I(), 120);
  const f = HK.getFlags(w);
  assert.ok(f.picked['iron-1'] && f.unlocked['a-door'] && f.entered['a-door']);
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
