#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 3단계 전투 1차 — Noah 3단 콤보, Ethan 3단계 충전 사격 인수 테스트
 * 규격: games/the-hollow-keep/docs/COMBAT_SPEC.md §2~§3
 * 실행: node games/the-hollow-keep/next/tests/weapons-contract.cjs   (HK_SIM으로 다른 sim.js 지정 가능)
 * 한 방 모드(createWorld({room, spawn, hero}))의 평평한 방과 시험 표적으로 검사한다.
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(__dirname, '..', 'sim.js'));

const FLOOR_Y = 500, PX = 300;
const NONE = { left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false, interact: false };
const I = (o = {}) => Object.assign({}, NONE, o);
const cfg = (h) => HK.CONFIG.heroes[h];
const P = (w) => HK.getPlayer(w);
const room = (dummies = [], extraSolids = []) => ({ width: 960, height: 540, dummies,
  solids: [{ x: -40, y: FLOOR_Y, w: 1040, h: 40 }, { x: -40, y: -40, w: 40, h: 620 }, { x: 960, y: -40, w: 40, h: 620 }, ...extraSolids] });
const dummy = (id, x, hp = 1000) => ({ id, x, y: FLOOR_Y - 60, w: 30, h: 60, hp });
function world(hero, dummies = [], extraSolids = []) {
  const w = HK.createWorld({ room: JSON.parse(JSON.stringify(room(dummies, extraSolids))), spawn: { x: PX, y: FLOOR_Y - cfg(hero).height }, hero });
  for (let i = 0; i < 3; i++) HK.step(w, I());
  return w;
}
const front = (w) => P(w).x + P(w).w; // 오른쪽을 보는 몸의 앞면
const hp = (w, id) => w.dummies.find((d) => d.id === id).hp;
function run(w, n, inp = I()) { const ev = []; for (let i = 0; i < n; i++) ev.push(...HK.step(w, typeof inp === 'function' ? inp(i) : inp)); return ev; }
const attacks = (ev) => ev.filter((e) => e.type === 'attack');

const results = [];
function test(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}

// ── 계약 ──
test('CONFIG: noah.weapon.combo 3단·comboWindowTicks, 1단 = 기존 weapon 값 / ethan.weapon.charge 단계·탄', () => {
  const n = cfg('noah').weapon, e = cfg('ethan').weapon;
  assert.ok(Array.isArray(n.combo) && n.combo.length === 3, 'noah.weapon.combo는 3단 배열');
  for (const k of ['damage', 'range', 'height', 'activeTicks', 'recoveryTicks']) n.combo.forEach((s, i) => assert.equal(typeof s[k], 'number', `combo[${i}].${k}`));
  assert.equal(n.combo[0].damage, n.damage); assert.equal(n.combo[0].range, n.range); assert.equal(n.combo[0].recoveryTicks, n.cooldownTicks);
  assert.ok(Number.isInteger(n.comboWindowTicks) && n.comboWindowTicks > 0, 'comboWindowTicks');
  assert.ok(n.combo[2].damage > n.combo[0].damage && n.combo[2].range > n.combo[1].range && n.combo[1].range > n.combo[0].range, '단계가 올라갈수록 길고 3단이 가장 강함');
  assert.ok(e.charge && e.charge.stage3Ticks > e.charge.stage2Ticks && e.charge.stage2Ticks > 0, 'ethan.weapon.charge 단계 틱');
  assert.ok(Array.isArray(e.charge.shots) && e.charge.shots.length === 2 && e.charge.shots[1].burstRadius > 0 && e.charge.shots[1].burstDamage > 0, 'charge.shots[2단, 3단], 3단 burst');
  assert.deepEqual(P(world('ethan')).charge, { ticks: 0, level: 0 }, 'getPlayer().charge 초기값');
});

test('Noah 리듬(COMBAT_SPEC §2-1): 1단 회복 18 그대로, 2단 22·3단 34틱', () => {
  const c = cfg('noah').weapon.combo;
  assert.deepEqual(c.map((x) => x.recoveryTicks), [18, 22, 34], `recoveryTicks ${c.map((x) => x.recoveryTicks).join(',')}`);
});

// ── Noah ──
const N = () => cfg('noah').weapon;
test('Noah: 리듬에 맞춰 세 번 누르면 1·2·3단, 피해 22·22·44 (3단 뒤엔 다시 1단)', () => {
  const w = world('noah', [dummy('d', PX + cfg('noah').width + 20, 10000)]);
  const c = N().combo, steps = [];
  // 각 단 시작 6틱 뒤에 눌러 다음 단을 미리 입력한다
  let ev = HK.step(w, I({ attack: true })); steps.push(...attacks(ev).map((e) => e.step));
  for (let k = 0; k < 3; k++) {
    run(w, 5); ev = HK.step(w, I({ attack: true }));
    ev.push(...run(w, c[k].recoveryTicks + 2)); steps.push(...attacks(ev).map((e) => e.step));
  }
  assert.deepEqual(steps, [1, 2, 3, 1], `단계 ${steps.join(',')}`);
  assert.equal(10000 - hp(w, 'd'), c[0].damage + c[1].damage + c[2].damage + c[0].damage, `총 피해 ${10000 - hp(w, 'd')}`);
});

test('Noah: 회복 중에 누른 것은 미리 입력 — 다음 단은 정확히 recoveryTicks 뒤에 나감', () => {
  const w = world('noah');
  let t0 = null, t1 = null;
  for (let i = 0; i < 60; i++) {
    const ev = HK.step(w, I({ attack: i === 0 || i === 4 }));
    for (const e of attacks(ev)) { if (t0 === null) t0 = i; else if (t1 === null) t1 = i; }
  }
  assert.equal(t1 - t0, N().combo[0].recoveryTicks, `1단→2단 간격 ${t1 - t0}틱`);
});

test('Noah: 창을 넘겨 누르면 콤보가 끊겨 1단', () => {
  const w = world('noah'), c = N().combo, gap = c[0].recoveryTicks + N().comboWindowTicks + 2;
  const steps = attacks(run(w, gap * 3, (i) => I({ attack: i % gap === 0 }))).map((e) => e.step);
  assert.deepEqual(steps, [1, 1, 1], `단계 ${steps.join(',')}`);
});

test('Noah: 창 마지막 틱에 누르면 이어짐', () => {
  const w = world('noah'), c = N().combo, last = c[0].recoveryTicks + N().comboWindowTicks - 1;
  const steps = attacks(run(w, last + 5, (i) => I({ attack: i === 0 || i === last }))).map((e) => e.step);
  assert.deepEqual(steps, [1, 2], `단계 ${steps.join(',')}`);
});

test('Noah: 3단만 닿는 거리(1·2단 사거리 밖)의 표적은 3단에만 맞음', () => {
  const c = N().combo, gap = Math.round((c[1].range + c[2].range) / 2); // 72와 84 사이
  const w = world('noah', [dummy('far', PX + cfg('noah').width + gap)]);
  const lunge = c[2].lunge || 0;
  const hits = [];
  for (let k = 0; k < 3; k++) {
    const before = hp(w, 'far');
    HK.step(w, I({ attack: true })); run(w, 4);
    run(w, c[k].recoveryTicks - 4);
    hits.push(before - hp(w, 'far'));
  }
  assert.equal(hits[0] + hits[1], 0, `1·2단에 맞음(${hits.join(',')}) — 표적 간격 ${gap}`);
  assert.equal(hits[2], c[2].damage, `3단 피해 ${hits[2]} (디딤 ${lunge} 포함)`);
});

test('Noah: 3단 디딤은 앞으로 이동하고 벽은 뚫지 않음', () => {
  const c = N().combo;
  const go = (wallGap) => {
    const extra = wallGap === null ? [] : [{ x: PX + cfg('noah').width + wallGap, y: 0, w: 40, h: FLOOR_Y }];
    const w = world('noah', [], extra);
    for (let k = 0; k < 2; k++) { HK.step(w, I({ attack: true })); run(w, c[k].recoveryTicks - 1); }
    const x0 = P(w).x; HK.step(w, I({ attack: true })); run(w, c[2].activeTicks + 2);
    return { w, dx: P(w).x - x0 };
  };
  const free = go(null);
  assert.ok(free.dx >= (c[2].lunge || 0) * 0.8 && free.dx <= (c[2].lunge || 0) + 0.5, `디딤 ${free.dx.toFixed(1)} (lunge ${c[2].lunge})`);
  const walled = go(2);
  assert.ok(front(walled.w) <= PX + cfg('noah').width + 2 + 0.01, '벽을 뚫고 디딤');
});

test('Noah: 교대하면 콤보가 사라져 돌아와서 1단', () => {
  const w = world('noah');
  HK.step(w, I({ attack: true })); run(w, 3); HK.step(w, I({ attack: true })); // 2단 미리 입력
  run(w, 2); HK.step(w, I({ swap: true })); run(w, 20); HK.step(w, I({ swap: true })); run(w, 20);
  const ev = attacks(run(w, 40, (i) => I({ attack: i === 0 })));
  assert.deepEqual(ev.map((e) => e.step), [1], `교대 후 ${ev.map((e) => e.step).join(',')}`);
  assert.ok(ev.every((e) => e.hero === 'noah'));
});

// ── Ethan ──
const E = () => cfg('ethan').weapon;
const holdRelease = (w, ticks, extra = {}) => { const ev = []; for (let i = 0; i < ticks; i++) ev.push(...HK.step(w, I({ attack: true, ...extra }))); ev.push(...HK.step(w, I())); return ev; };

test('Ethan: 짧게 누르면 1단 1발만 (놓아도 더 쏘지 않음)', () => {
  const w = world('ethan', [dummy('d', PX + 300)]);
  const ev = holdRelease(w, 10); ev.push(...run(w, 80));
  assert.deepEqual(attacks(ev).map((e) => e.level), [1], `공격 ${attacks(ev).map((e) => e.level).join(',')}`);
  assert.equal(1000 - hp(w, 'd'), E().damage);
});

test('Ethan: 누르고 있으면 40틱에 2단·80틱에 3단 charge 이벤트, getPlayer().charge 단계', () => {
  const w = world('ethan'), c = E().charge, seen = [];
  let lv = [];
  for (let i = 0; i < c.stage3Ticks + 5; i++) {
    const ev = HK.step(w, I({ attack: true }));
    for (const e of ev) if (e.type === 'charge') seen.push([i, e.level]);
    lv.push(P(w).charge.level);
  }
  assert.deepEqual(seen, [[c.stage2Ticks, 2], [c.stage3Ticks, 3]], `charge 이벤트 ${JSON.stringify(seen)}`);
  assert.equal(lv[1], 1, '누른 직후 level 1'); assert.equal(lv[c.stage2Ticks], 2); assert.equal(lv[c.stage3Ticks + 2], 3);
});

test('Ethan: 2단에서 놓으면 2단 탄(피해 44), 관통하지 않음', () => {
  const x = PX + 300, w = world('ethan', [dummy('a', x), dummy('b', x + 40)]);
  const ev = holdRelease(w, E().charge.stage2Ticks + 2); ev.push(...run(w, 90));
  assert.deepEqual(attacks(ev).map((e) => e.level), [1, 2], `공격 ${attacks(ev).map((e) => e.level).join(',')}`);
  assert.equal(1000 - hp(w, 'a'), E().damage + E().charge.shots[0].damage, `앞 표적 피해 ${1000 - hp(w, 'a')}`);
  assert.equal(hp(w, 'b'), 1000, '2단 탄이 관통함');
});

test('Ethan: 3단에서 놓으면 3단 탄(66) + 반지름 안의 다른 표적에 빛 터짐(33), 반지름 밖은 무사', () => {
  const s3 = E().charge.shots[1], x = PX + 320;
  // 빛 터짐 중심 = 맞은 면(표적 a의 왼쪽 면 x). near는 a 바로 뒤(중심에서 40), far는 중심에서 반지름 + 60
  const w = world('ethan', [dummy('a', x), dummy('near', x + 40), dummy('far', x + s3.burstRadius + 60)]);
  const ev = holdRelease(w, E().charge.stage3Ticks + 2); ev.push(...run(w, 90));
  assert.deepEqual(attacks(ev).map((e) => e.level), [1, 3]);
  assert.ok(ev.some((e) => e.type === 'burst' && e.r === s3.burstRadius), 'burst 이벤트');
  assert.equal(1000 - hp(w, 'a'), E().damage + s3.damage, `직접 맞은 표적 ${1000 - hp(w, 'a')} (빛 터짐을 중복으로 받으면 안 됨)`);
  assert.equal(1000 - hp(w, 'near'), s3.burstDamage, `반지름 안 표적 ${1000 - hp(w, 'near')}`);
  assert.equal(hp(w, 'far'), 1000, '반지름 밖 표적이 맞음');
});

test('Ethan: 2단 전에 놓거나, 충전 중 교대하면 충전탄 없음', () => {
  let w = world('ethan');
  let ev = holdRelease(w, E().charge.stage2Ticks - 2);
  assert.deepEqual(attacks(ev).map((e) => e.level), [1], '2단 전에 놓음');
  w = world('ethan');
  ev = []; for (let i = 0; i < E().charge.stage3Ticks + 2; i++) ev.push(...HK.step(w, I({ attack: true, swap: i === E().charge.stage3Ticks })));
  ev.push(...HK.step(w, I())); ev.push(...run(w, 20));
  assert.deepEqual(attacks(ev).filter((e) => e.hero === 'ethan').map((e) => e.level), [1], '교대 후 충전탄이 나감');
  assert.deepEqual(P(w).charge, { ticks: 0, level: 0 }, '교대 후 charge 초기화');
});

test('Ethan: 충전 중에도 걷기·점프 가능, 충전탄은 공격 대기를 다시 시작', () => {
  const w = world('ethan'), x0 = P(w).x;
  const ev = []; for (let i = 0; i < E().charge.stage2Ticks + 2; i++) ev.push(...HK.step(w, I({ attack: true, right: i < 20, jump: i === 25 })));
  assert.ok(P(w).x > x0 + 20, '충전 중 걷지 못함'); assert.ok(ev.some((e) => e.type === 'jump'), '충전 중 점프 못함');
  ev.push(...HK.step(w, I())); // 2단 발사
  const cd = E().cooldownTicks, fired = [];
  for (let i = 0; i < cd + 2; i++) if (attacks(HK.step(w, I({ attack: i === 3 || i === cd + 1 }))).length) fired.push(i);
  assert.deepEqual(fired, [cd + 1], `충전탄 뒤 공격 대기를 다시 세지 않음(발사 틱 ${fired.join(',')}, 기대 ${cd + 1})`);
});

test('결정성: 같은 입력 → 같은 결과(두 주인공, 콤보·충전 섞음)', () => {
  const script = (i) => I({ attack: (i % 23) < (i % 3 === 0 ? 50 : 1) && (i % 97) < 60, right: (i % 50) < 20, swap: i === 300, jump: i % 70 === 0 });
  const a = world('noah', [dummy('d', 600, 99999)]), b = world('noah', [dummy('d', 600, 99999)]);
  run(a, 700, script); run(b, 700, script);
  assert.deepEqual(HK.snapshot(a), HK.snapshot(b));
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
