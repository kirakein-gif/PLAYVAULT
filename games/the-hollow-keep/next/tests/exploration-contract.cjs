#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 2단계 탐험 구조 규칙 인수 테스트
 * 규격: games/the-hollow-keep/docs/EXPLORATION_SPEC.md §2~§6, TILE_MOSAIC_SPEC.md §6(방 이동 직후 겹침 금지)
 * 실행: node games/the-hollow-keep/next/tests/exploration-contract.cjs   (HK_SIM으로 다른 sim.js 지정 가능)
 *
 * 검사마다 작은 구역을 이 파일 안에서 만든다. 실제 시범 구역 데이터는 area-data.cjs가 검사한다.
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(__dirname, '..', 'sim.js'));

const T = 30, COLS = 32, ROWS = 18, FLOOR = 510; // 17번 행 윗면
const NONE = { left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false, interact: false };
const I = (o = {}) => Object.assign({}, NONE, o);
const P = (w) => HK.getPlayer(w);
const cx = (p) => p.x + p.w / 2, feet = (p) => p.y + p.h;
const cfg = (h) => HK.CONFIG.heroes[h];

// 기본 방: 천장(0행)·바닥(17행)·좌우 벽. open: {left:[행], right:[행], top:[열], bottom:[열]}
function room(pos, { open = {}, set = [], objects = [] } = {}) {
  const g = Array.from({ length: ROWS }, (_, r) => (r === 0 || r === ROWS - 1 ? '#'.repeat(COLS) : '#' + '.'.repeat(COLS - 2) + '#').split(''));
  for (const r of open.left || []) g[r][0] = '.';
  for (const r of open.right || []) g[r][COLS - 1] = '.';
  for (const c of open.top || []) g[0][c] = '.';
  for (const c of open.bottom || []) g[ROWS - 1][c] = '.';
  for (const [r, c, ch] of set) g[r][c] = ch;
  return { pos, name: 'test', grid: g.map((row) => row.join('')), objects };
}
const area = (start, rooms) => ({ version: 1, cols: COLS, rows: ROWS, tile: T, start, rooms });
const standAt = (hero, col) => ({ x: col * T + T / 2 - cfg(hero).width / 2, y: FLOOR - cfg(hero).height });
function world(a, hero = 'ethan') { return HK.createWorld({ area: JSON.parse(JSON.stringify(a)), hero }); }
function run(w, inp, n) { const all = []; for (let i = 0; i < n; i++) all.push(...HK.step(w, inp)); return all; }
function until(w, inp, pred, max = 600) {
  const all = [];
  for (let i = 0; i < max; i++) { all.push(...HK.step(w, inp)); if (pred(w, all)) return all; }
  assert.fail(`조건을 ${max}틱 안에 만족하지 못함 (방 ${w.roomId}, x ${P(w).x.toFixed(1)}, y ${P(w).y.toFixed(1)})`);
}
function tap(w, key) { const ev = HK.step(w, I({ [key]: true })); ev.push(...HK.step(w, I())); return ev; }
function walkTo(w, col, max = 400) { // 몸 중심을 해당 칸 중심 근처로
  const target = col * T + T / 2;
  until(w, I({ [cx(P(w)) < target ? 'right' : 'left']: true }), (W) => Math.abs(cx(P(W)) - target) < 6, max);
  run(w, I(), 30);
}
const has = (ev, type, extra = {}) => ev.some((e) => e.type === type && Object.entries(extra).every(([k, v]) => e[k] === v));

const results = [];
function test(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}

// ── 구역: 이동(오른쪽 b, 아래 c, 위 d) ──
const LADDER = 15, HOLE = [20, 21, 22];
const A_MOVE = area({ room: 'a', ...standAt('ethan', 4) }, {
  a: room([0, 0], { open: { right: [13, 14, 15, 16], bottom: HOLE, top: [14, 15, 16] },
    set: Array.from({ length: 16 }, (_, i) => [i + 1, LADDER, 'H']) }),
  b: room([1, 0], { open: { left: [13, 14, 15, 16] } }),
  c: room([0, 1], { open: { top: HOLE } }),
  d: room([0, -1], { open: { bottom: [14, 15, 16] },
    set: [[17, 14, '#'], [17, 16, '#'], ...[12, 13, 14, 15, 16, 17].map((r) => [r, LADDER, 'H'])] })
});
// d의 바닥 틈은 사다리 칸(15열)만 열고 양옆은 막는다(a의 천장 틈 14~16열 중 14·16열은 a 쪽만 열림이면 규칙 위반이므로 맞춘다)
A_MOVE.rooms.a.grid[0] = A_MOVE.rooms.a.grid[0].split('').map((ch, c) => (c === LADDER ? '.' : '#')).join('');
A_MOVE.rooms.d.grid[ROWS - 1] = A_MOVE.rooms.d.grid[ROWS - 1].split('').map((ch, c) => (c === LADDER ? 'H' : '#')).join('');

test('contract: 구역 API와 CONFIG.climbSpeed', () => {
  for (const fn of ['createWorld', 'step', 'getPlayer', 'getMap', 'getFlags', 'snapshot']) assert.equal(typeof HK[fn], 'function', `HK.${fn} 필요`);
  for (const h of ['ethan', 'noah']) assert.ok(typeof cfg(h).climbSpeed === 'number' && cfg(h).climbSpeed > 0, `${h}.climbSpeed(양수) 필요`);
  const w = world(A_MOVE);
  assert.equal(w.roomId, 'a');
  assert.ok(Math.abs(P(w).x - A_MOVE.start.x) < 0.01 && Math.abs(P(w).y - A_MOVE.start.y) < 0.01, '시작 위치가 area.start와 다름');
  const m = HK.getMap(w);
  assert.equal(m.current, 'a');
  assert.equal(m.rooms.length, 4);
  assert.deepEqual(m.rooms.filter((r) => r.visited).map((r) => r.id), ['a'], '처음에는 시작 방만 방문');
  assert.equal(typeof P(w).climbing, 'boolean');
});

test('방 이동: 오른쪽·왼쪽 — 좌표 이어짐, 높이 유지, 이벤트·지도', () => {
  const a = JSON.parse(JSON.stringify(A_MOVE)); Object.assign(a.start, standAt('ethan', 24)); // 구멍(20~22열) 너머에서 출발
  const w = world(a);
  run(w, I(), 10);
  const y0 = P(w).y;
  const ev = until(w, I({ right: true }), (W) => W.roomId === 'b');
  assert.ok(has(ev, 'room', { from: 'a', to: 'b', dir: 'right' }), 'room 이벤트(a→b, right) 없음');
  assert.ok(cx(P(w)) < 60, `b에 들어온 직후 몸 중심 x ${cx(P(w)).toFixed(1)}(왼쪽 가장자리여야 함)`);
  assert.ok(Math.abs(P(w).y - y0) < 1, '방을 옮기며 높이가 바뀜');
  assert.ok(HK.getMap(w).rooms.find((r) => r.id === 'b').visited, '지도에 b 방문이 기록되지 않음');
  const ev2 = until(w, I({ left: true }), (W) => W.roomId === 'a');
  assert.ok(has(ev2, 'room', { from: 'b', to: 'a', dir: 'left' }), 'room 이벤트(b→a, left) 없음');
  assert.ok(cx(P(w)) > 900, 'a로 돌아온 직후 오른쪽 가장자리여야 함');
});

test('방 이동: 아래 — 구멍으로 떨어지면 아래 방 바닥에 착지', () => {
  const w = world(A_MOVE);
  const ev = until(w, I({ right: true }), (W) => W.roomId === 'c', 400);
  assert.ok(has(ev, 'room', { from: 'a', to: 'c', dir: 'down' }), 'room 이벤트(a→c, down) 없음');
  until(w, I(), (W) => P(W).onGround, 200);
  assert.ok(Math.abs(feet(P(w)) - FLOOR) < 0.5, `c 바닥에 착지해야 함(발 ${feet(P(w)).toFixed(1)})`);
});

for (const hero of ['ethan', 'noah']) {
  test(`사다리[${hero}]: 매달림·멈춤·climbSpeed·위 방 이동·꼭대기에 서기`, () => {
    const a = JSON.parse(JSON.stringify(A_MOVE)); Object.assign(a.start, standAt(hero, 12));
    const w = world(a, hero);
    run(w, I(), 5);
    walkTo(w, LADDER);
    HK.step(w, I({ up: true }));
    assert.equal(P(w).climbing, true, '사다리에서 ↑를 눌러도 매달리지 않음');
    assert.ok(Math.abs(cx(P(w)) - (LADDER * T + T / 2)) < 1, '매달리면 몸 중심이 사다리 칸 중심에 맞아야 함');
    const y1 = P(w).y; run(w, I({ up: true }), 10);
    assert.ok(Math.abs((y1 - P(w).y) / 10 - cfg(hero).climbSpeed) < 0.05, `오르는 속도 ${((y1 - P(w).y) / 10).toFixed(2)} ≠ climbSpeed ${cfg(hero).climbSpeed}`);
    const y2 = P(w).y; run(w, I(), 20);
    assert.ok(Math.abs(P(w).y - y2) < 0.01 && P(w).climbing, '입력이 없으면 사다리에 매달린 채 멈춰야 함');
    const ev = until(w, I({ up: true }), (W) => W.roomId === 'd', 600);
    assert.ok(has(ev, 'room', { from: 'a', to: 'd', dir: 'up' }), 'room 이벤트(a→d, up) 없음');
    until(w, I({ up: true }), (W) => !P(W).climbing && P(W).onGround, 400);
    assert.ok(Math.abs(feet(P(w)) - 12 * T) < 0.5, `사다리 꼭대기 윗면(${12 * T})에 서야 함(발 ${feet(P(w)).toFixed(1)})`);
  });
}

test('사다리: 점프로 떨어짐, 꼭대기에서 ↓로 내려가며 매달림', () => {
  const w = world(A_MOVE);
  run(w, I(), 5); walkTo(w, LADDER);
  run(w, I({ up: true }), 30);
  assert.equal(P(w).climbing, true);
  const ev = HK.step(w, I({ jump: true, right: true }));
  assert.equal(P(w).climbing, false, '점프하면 사다리에서 떨어져야 함');
  assert.ok(has(ev, 'jump') && P(w).vy < 0, '사다리에서 점프가 시작되지 않음');
  // d의 사다리 꼭대기에 선 뒤 ↓
  const a = JSON.parse(JSON.stringify(A_MOVE)); a.start = { room: 'd', x: LADDER * T + T / 2 - cfg('ethan').width / 2, y: 12 * T - cfg('ethan').height };
  const w2 = world(a);
  run(w2, I(), 10);
  assert.ok(P(w2).onGround && Math.abs(feet(P(w2)) - 12 * T) < 0.5, '사다리 꼭대기 윗면에 서 있어야 함');
  run(w2, I({ down: true }), 10);
  assert.equal(P(w2).climbing, true, '꼭대기에서 ↓를 누르면 매달려 내려가야 함');
  assert.ok(feet(P(w2)) > 12 * T + 5, '아래로 내려가지 않음');
});

test('한쪽 발판: 아래에서 뛰어 통과·위에 착지, ↓+점프로 내려감', () => {
  // 발판 13행(390~420): 바닥에 선 Noah의 머리(446)와 겹치지 않게 두어야 '아래에서 막히는' 결함을 잡을 수 있다
  const PR = 13;
  const a = area({ room: 'o', ...standAt('noah', 11) }, { o: room([0, 0], { set: [8, 9, 10, 11, 12, 13, 14].map((c) => [PR, c, '-']) }) });
  const w = world(a, 'noah');
  run(w, I(), 5);
  assert.ok(P(w).y > (PR + 1) * T, '검사 전제: 시작 시 머리가 발판보다 아래여야 함');
  until(w, I({ jump: true }), (W, ev) => ev.some((e) => e.type === 'land') && P(W).onGround, 200);
  assert.ok(Math.abs(feet(P(w)) - PR * T) < 0.5, `한쪽 발판 윗면(${PR * T})에 서야 함(발 ${feet(P(w)).toFixed(1)})`);
  run(w, I(), 10);
  HK.step(w, I({ down: true, jump: true }));
  until(w, I(), (W) => P(W).onGround && feet(P(W)) > PR * T + 10, 200);
  assert.ok(Math.abs(feet(P(w)) - FLOOR) < 0.5, '↓+점프 뒤 아래 바닥으로 내려가야 함');
});

// ── 구역: 스위치·캐릭터 전용 장치 (s1 → s2 문) ──
const A_SWITCH = area({ room: 's2', ...standAt('ethan', 4) }, {
  s1: room([0, 0], { open: { right: [13, 14, 15, 16] }, objects: [
    { type: 'switch', id: 'S1', x: 6, y: 16, kind: 'lever' },
    { type: 'switch', id: 'SL', x: 12, y: 16, kind: 'light', hero: 'ethan' },
    { type: 'switch', id: 'SN', x: 18, y: 16, kind: 'lever', hero: 'noah' }] }),
  s2: room([1, 0], { open: { left: [13, 14, 15, 16] }, objects: [{ type: 'door', id: 'D1', x: 16, y: 13, w: 1, h: 4, open: { switch: 'S1' } }] })
});

test('스위치 문: 닫혀 있으면 막힘 → 다른 방 스위치 켜기 → 열림 → 방을 오가도 유지', () => {
  const w = world(A_SWITCH);
  run(w, I(), 5);
  run(w, I({ right: true }), 200);
  assert.ok(P(w).x + P(w).w <= 16 * T + 0.01, '닫힌 문을 통과함');
  until(w, I({ left: true }), (W) => W.roomId === 's1');
  walkTo(w, 6);
  const ev = tap(w, 'interact');
  assert.ok(has(ev, 'switch', { id: 'S1' }), 'switch 이벤트 없음');
  assert.equal(HK.getFlags(w).switches.S1, true);
  assert.equal(HK.getFlags(w).doors.D1, true, '스위치를 켰는데 다른 방의 문이 열리지 않음');
  until(w, I({ right: true }), (W) => W.roomId === 's2');
  until(w, I({ right: true }), (W) => P(W).x > 17 * T, 300);
  until(w, I({ left: true }), (W) => W.roomId === 's1');
  until(w, I({ right: true }), (W) => W.roomId === 's2');
  assert.equal(HK.getFlags(w).doors.D1, true, '방을 오가자 문 상태가 사라짐');
});

test('캐릭터 전용 장치: 다른 주인공은 denied, 전용 주인공만 켬', () => {
  const a = JSON.parse(JSON.stringify(A_SWITCH)); a.start = { room: 's1', ...standAt('ethan', 12) };
  const w = world(a, 'ethan');
  run(w, I(), 5);
  tap(w, 'swap'); run(w, I(), 15);                         // Noah로 교대
  let ev = tap(w, 'interact');
  assert.ok(has(ev, 'denied', { id: 'SL' }) && !HK.getFlags(w).switches.SL, 'Noah가 Ethan 전용 빛 장치를 켬');
  tap(w, 'swap'); run(w, I(), 15);                         // Ethan
  ev = tap(w, 'interact');
  assert.ok(has(ev, 'switch', { id: 'SL' }) && HK.getFlags(w).switches.SL, 'Ethan이 빛 장치를 켜지 못함');
  walkTo(w, 18);
  ev = tap(w, 'interact');
  assert.ok(has(ev, 'denied', { id: 'SN' }) && !HK.getFlags(w).switches.SN, 'Ethan이 Noah 전용 레버를 켬');
  tap(w, 'swap'); run(w, I(), 15);
  ev = tap(w, 'interact');
  assert.ok(has(ev, 'switch', { id: 'SN' }) && HK.getFlags(w).switches.SN, 'Noah가 전용 레버를 켜지 못함');
});

test('열쇠 문: 열쇠 없으면 막힘 → 열쇠 줍기 → 닿으면 열리고 열쇠 1개 사용', () => {
  const a = area({ room: 'k2', ...standAt('ethan', 4) }, {
    k1: room([0, 0], { open: { right: [13, 14, 15, 16] }, objects: [{ type: 'key', id: 'K1', x: 8, y: 16, name: 'iron' }] }),
    k2: room([1, 0], { open: { left: [13, 14, 15, 16] }, objects: [{ type: 'door', id: 'D2', x: 16, y: 13, w: 1, h: 4, open: { key: 'iron' } }] })
  });
  const w = world(a);
  run(w, I(), 5);
  run(w, I({ right: true }), 200);
  assert.ok(P(w).x + P(w).w <= 16 * T + 0.01 && !HK.getFlags(w).doors.D2, '열쇠 없이 열쇠 문을 통과함');
  until(w, I({ left: true }), (W) => W.roomId === 'k1');
  const ev = until(w, I({ left: true }), (W, e) => e.some((x) => x.type === 'pickup'), 300);
  assert.ok(has(ev, 'pickup', { id: 'K1', name: 'iron' }), 'pickup 이벤트 없음');
  assert.equal(HK.getFlags(w).keys.iron, 1);
  until(w, I({ right: true }), (W) => W.roomId === 'k2');
  const ev2 = until(w, I({ right: true }), (W) => P(W).x > 17 * T, 300);
  assert.ok(has(ev2, 'door', { id: 'D2' }), 'door 이벤트 없음');
  assert.equal(HK.getFlags(w).keys.iron || 0, 0, '열쇠가 소모되지 않음');
});

for (const hero of ['noah', 'ethan']) {
  test(`부서지는 벽[${hero}]: 막힘 → 공격으로 부숨 → 통과`, () => {
    const a = area({ room: 'r', ...standAt(hero, 13) }, { r: room([0, 0], { objects: [{ type: 'breakable', id: 'B1', x: 16, y: 13, w: 1, h: 4 }] }) });
    const w = world(a, hero);
    run(w, I(), 5);
    run(w, I({ right: true }), 120);
    assert.ok(P(w).x + P(w).w <= 16 * T + 0.01, '부서지기 전 벽을 통과함');
    run(w, I(), 20);
    const ev = []; for (let i = 0; i < 90; i++) ev.push(...HK.step(w, I({ attack: i === 0 })));
    assert.ok(has(ev, 'break', { id: 'B1' }) && HK.getFlags(w).broken.B1, `${hero} 공격으로 벽이 부서지지 않음`);
    run(w, I({ right: true }), 120);
    assert.ok(P(w).x > 17 * T, '부서진 벽을 통과하지 못함');
  });
}

test('표적 처치 문: 지정 표적이 모두 쓰러져야 열림', () => {
  const a = area({ room: 'r', ...standAt('ethan', 3) }, { r: room([0, 0], { objects: [
    { type: 'target', id: 'T1', x: 8, y: 15, hp: 20 }, { type: 'target', id: 'T2', x: 12, y: 15, hp: 20 },
    { type: 'door', id: 'D3', x: 20, y: 13, w: 1, h: 4, open: { cleared: ['T1', 'T2'] } }] }) });
  const w = world(a);
  run(w, I(), 5); run(w, I({ right: true }), 2); run(w, I(), 20);
  const shoot = () => { const ev = []; for (let i = 0; i < 60; i++) ev.push(...HK.step(w, I({ attack: i === 0 }))); return ev; };
  shoot();
  assert.ok(!HK.getFlags(w).doors.D3, '표적 하나만 쓰러졌는데 문이 열림');
  assert.deepEqual(HK.getFlags(w).cleared, { T1: true }, 'getFlags().cleared는 쓰러진 표적만 담아야 함');
  const ev = shoot();
  assert.ok(has(ev, 'door', { id: 'D3' }) && HK.getFlags(w).doors.D3, '표적을 모두 쓰러뜨렸는데 문이 열리지 않음');
});

test('결정성: 여러 방을 오가는 같은 입력 → 같은 결과', () => {
  const script = (i) => I({ right: i < 160 || (i > 400 && i < 470), left: i >= 200 && i < 330, up: i >= 330 && i < 400, jump: i % 97 < 5, attack: i % 53 === 0 });
  const go = () => { const w = world(A_MOVE); for (let i = 0; i < 600; i++) HK.step(w, script(i)); return JSON.stringify(HK.snapshot(w)); };
  assert.equal(go(), go());
});

// ── TILE_MOSAIC_SPEC §6: 방 이동 직후 겹침 금지 ──
// a(0,0) 바닥 구멍 → b(0,1). b 1행에 구멍을 꼭 맞게 덮는 가로형 봉쇄물, 스위치는 a에.
// 떨어지기: 3칸 구멍(10~12열). 사다리: 1칸 통로(11열, 몸보다 좁아 걸어서는 빠지지 않음)에 사다리.
function sealArea(ladder) {
  const cols = ladder ? [11] : [10, 11, 12], lo = cols[0] - 1, hi = cols[cols.length - 1] + 1;
  return area({ room: 'a', ...standAt('ethan', 4) }, {
    a: room([0, 0], { open: { bottom: cols }, set: ladder ? Array.from({ length: 8 }, (_, i) => [10 + i, 11, 'H']) : [],
      objects: [{ type: 'switch', id: 'seal-sw', x: 4, y: 16, kind: 'lever' }] }),
    b: room([0, 1], { open: { top: cols }, set: [[1, lo, '#'], [1, hi, '#'], ...(ladder ? [[0, 11, 'H']] : [])],
      objects: [{ type: 'door', id: 'seal', x: cols[0], y: 1, w: cols.length, h: 1, open: { switch: 'seal-sw' } }] })
  });
}
for (const mode of ['떨어지기', '사다리']) test(`방 이동 직후 겹침 금지(${mode}): 닫힌 봉쇄물 아래 방으로 넘어가지 않음 → 열면 지나감`, () => {
  const ladder = mode === '사다리', a = sealArea(ladder), seal = a.rooms.b.objects[0];
  const box = { x: seal.x * T, y: seal.y * T, w: seal.w * T, h: T };
  const w = world(a), inp = ladder ? I({ down: true }) : I();
  const go = () => { const target = 11 * T + T / 2; for (let i = 0; i < 400 && Math.abs(cx(P(w)) - target) >= 4; i++) HK.step(w, I({ [cx(P(w)) < target ? 'right' : 'left']: true })); };
  go();
  for (let i = 0; i < 300; i++) {
    HK.step(w, inp);
    const p = P(w), f = HK.getFlags(w);
    const ov = w.roomId === 'b' && !f.doors.seal && p.x < box.x + box.w - 0.01 && p.x + p.w > box.x + 0.01 && p.y < box.y + box.h - 0.01 && p.y + p.h > box.y + 0.01;
    assert.ok(!ov, `${i}틱: 닫힌 봉쇄물과 겹침 (y ${p.y.toFixed(1)})`);
    assert.equal(w.roomId, 'a', `${i}틱: 닫힌 봉쇄물을 지나 ${w.roomId}로 이동 (y ${p.y.toFixed(1)})`);
  }
  // 빠져나와 스위치를 켜고 다시 시도
  HK.step(w, I({ jump: true, left: true })); run(w, I({ jump: true, left: true }), 40); run(w, I(), 60);
  walkTo(w, 4); tap(w, 'interact');
  run(w, I(), 2);
  assert.ok(HK.getFlags(w).doors.seal, '봉쇄물 열림');
  go();
  until(w, inp, (W) => W.roomId === 'b', 400);
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
