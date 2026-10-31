#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 기반(Foundation) 1차 인수 테스트
 *
 * 규격: games/the-hollow-keep/docs/FOUNDATION_SPEC.md §4 (시뮬레이션 계약)
 * 대상: games/the-hollow-keep/next/sim.js  (환경 변수 HK_SIM으로 다른 경로 지정 가능)
 *
 * 실행: node games/the-hollow-keep/next/tests/foundation-contract.cjs
 *
 * 이 테스트는 "손맛 수치"를 고정하지 않는다. 수치는 sim.js의 CONFIG에서 조정하고,
 * 테스트는 CONFIG에 적힌 값대로 실제로 움직이는지(일관성)와 조작 규칙(불변식)만 검사한다.
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');

const SIM_PATH = process.env.HK_SIM
  ? path.resolve(process.env.HK_SIM)
  : path.join(__dirname, '..', 'sim.js');

let HK;
try {
  HK = require(SIM_PATH);
} catch (err) {
  console.error(`FAIL load: ${SIM_PATH} 를 불러오지 못했습니다. (DOM 없이 Node에서 로드되어야 합니다)`);
  console.error(String(err && err.stack || err));
  process.exit(1);
}

// ───────────────────────── helpers ─────────────────────────
const HEROES = ['ethan', 'noah'];
const FLOOR_Y = 500;
const NO_INPUT = Object.freeze({ left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false });
const input = (o = {}) => Object.assign({}, NO_INPUT, o);
const cfg = (hero) => HK.CONFIG.heroes[hero];
const clone = (v) => JSON.parse(JSON.stringify(v));

function flatRoom(extra = {}) {
  return Object.assign({
    width: 960,
    height: 540,
    solids: [{ x: -40, y: FLOOR_Y, w: 1040, h: 40 }, { x: -40, y: -40, w: 40, h: 620 }, { x: 960, y: -40, w: 40, h: 620 }],
    dummies: []
  }, extra);
}

function world(hero, room = flatRoom(), spawn) {
  const c = cfg(hero);
  const sp = spawn || { x: 200, y: FLOOR_Y - c.height };
  return HK.createWorld({ room: clone(room), spawn: sp, hero });
}

function step(w, inp = NO_INPUT) {
  const ev = HK.step(w, inp);
  assert.ok(Array.isArray(ev), 'HK.step은 이번 틱의 이벤트 배열을 반환해야 합니다');
  return ev;
}
const P = (w) => HK.getPlayer(w);
const bottom = (p) => p.y + p.h;
const centerX = (p) => p.x + p.w / 2;

function settle(w, ticks = 30) { for (let i = 0; i < ticks; i++) step(w); }

// 점프 한 번의 최고 높이(발 기준, px)를 잰다. holdTicks 동안 점프를 누르고 있다가 뗀다.
function measureJump(hero, holdTicks) {
  const w = world(hero);
  settle(w, 10);
  const startBottom = bottom(P(w));
  let minBottom = startBottom, jumped = false;
  for (let i = 0; i < 240; i++) {
    const ev = step(w, input({ jump: i < holdTicks }));
    if (ev.some((e) => e.type === 'jump')) jumped = true;
    minBottom = Math.min(minBottom, bottom(P(w)));
    if (jumped && i > 5 && P(w).onGround) break;
  }
  return { height: startBottom - minBottom, jumped, landed: P(w).onGround };
}

const results = [];
function test(name, fn) {
  try { fn(); results.push([true, name]); console.log(`PASS ${name}`); }
  catch (err) { results.push([false, name]); console.log(`FAIL ${name}\n     ${String(err && err.message || err).split('\n').join('\n     ')}`); }
}
const within = (actual, expected, ratio, label) =>
  assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * ratio,
    `${label}: 기대 ${expected.toFixed(2)} ±${Math.round(ratio * 100)}%, 실제 ${actual.toFixed(2)}`);

// ───────────────────────── 0. 계약 형태 ─────────────────────────
test('contract: API와 CONFIG 필수 항목', () => {
  for (const fn of ['createWorld', 'step', 'getPlayer', 'getHitboxes', 'snapshot']) {
    assert.equal(typeof HK[fn], 'function', `HK.${fn} 함수가 필요합니다`);
  }
  assert.equal(typeof HK.TICK, 'number', 'HK.TICK(초/틱)이 필요합니다');
  assert.ok(Math.abs(HK.TICK - 1 / 60) < 1e-9, 'HK.TICK은 1/60이어야 합니다(고정 시간 간격)');
  assert.ok(HK.CONFIG && HK.CONFIG.heroes, 'HK.CONFIG.heroes가 필요합니다');
  assert.equal(typeof HK.CONFIG.swapCooldownTicks, 'number', 'HK.CONFIG.swapCooldownTicks가 필요합니다');
  for (const h of HEROES) {
    const c = cfg(h);
    assert.ok(c, `CONFIG.heroes.${h}가 필요합니다`);
    for (const k of ['width', 'height', 'runSpeed', 'jumpHeight', 'maxFall', 'coyoteTicks', 'jumpBufferTicks', 'stopTicks']) {
      assert.equal(typeof c[k], 'number', `CONFIG.heroes.${h}.${k}(number)가 필요합니다`);
    }
    assert.equal(typeof c.variableJump, 'boolean', `CONFIG.heroes.${h}.variableJump(boolean)가 필요합니다`);
    if (c.variableJump) assert.equal(typeof c.minJumpHeight, 'number', `${h}.variableJump=true이면 minJumpHeight가 필요합니다`);
    const wp = c.weapon;
    assert.ok(wp, `CONFIG.heroes.${h}.weapon이 필요합니다`);
    assert.ok(['melee', 'projectile'].includes(wp.kind), `${h}.weapon.kind는 melee|projectile`);
    for (const k of ['damage', 'range', 'cooldownTicks']) assert.equal(typeof wp[k], 'number', `${h}.weapon.${k}(number)가 필요합니다`);
  }
});

test('contract: 두 주인공의 조작 특성이 구분됨', () => {
  const a = cfg('ethan'), b = cfg('noah');
  const keys = ['runSpeed', 'jumpHeight'];
  assert.ok(keys.some((k) => a[k] !== b[k]) || a.weapon.kind !== b.weapon.kind,
    'Ethan과 Noah는 이동 속도·점프 높이·무기 종류 중 하나 이상이 달라야 합니다');
});

test('contract: snapshot은 JSON 직렬화 가능', () => {
  const w = world('ethan');
  settle(w, 5);
  const s = HK.snapshot(w);
  assert.doesNotThrow(() => JSON.stringify(s));
});

// ───────────────────────── 1. 결정성 ─────────────────────────
test('determinism: 같은 입력 → 같은 결과(600틱)', () => {
  const script = (i) => input({
    right: (i % 200) < 120, left: (i % 200) >= 150,
    jump: (i % 90) < 12, attack: (i % 37) === 0, swap: i === 300
  });
  const run = () => {
    const room = flatRoom({ solids: flatRoom().solids.concat([{ x: 500, y: 420, w: 120, h: 16 }]), dummies: [{ id: 'd1', x: 700, y: FLOOR_Y - 60, w: 30, h: 60, hp: 9999 }] });
    const w = world('ethan', room);
    for (let i = 0; i < 600; i++) step(w, script(i));
    return JSON.stringify(HK.snapshot(w));
  };
  assert.equal(run(), run(), '두 번 실행한 결과 snapshot이 다릅니다(난수·시간·DOM 의존 확인)');
});

// ───────────────────────── 2. 지면·중력 ─────────────────────────
for (const h of HEROES) {
  test(`ground[${h}]: 입력이 없으면 제자리에 서 있음`, () => {
    const w = world(h);
    settle(w, 5);
    const p0 = clone(P(w));
    settle(w, 300);
    const p1 = P(w);
    assert.ok(p1.onGround, '지면 위에 있어야 합니다');
    assert.ok(Math.abs(p1.x - p0.x) < 0.01 && Math.abs(p1.y - p0.y) < 0.01, `미끄러짐/떨림: (${p0.x},${p0.y}) → (${p1.x},${p1.y})`);
  });

  test(`ground[${h}]: 높은 곳에서 떨어져도 바닥을 뚫지 않고 착지`, () => {
    const thin = { x: -40, y: FLOOR_Y, w: 1040, h: 12 };
    const room = flatRoom({ solids: [thin] });
    const w = world(h, room, { x: 300, y: -400 });
    let landed = false;
    for (let i = 0; i < 400; i++) {
      const ev = step(w);
      assert.ok(P(w).vy <= cfg(h).maxFall + 1e-6, `낙하 속도 ${P(w).vy} > maxFall ${cfg(h).maxFall}`);
      if (ev.some((e) => e.type === 'land')) landed = true;
    }
    assert.ok(landed, 'land 이벤트가 발생해야 합니다');
    assert.ok(P(w).onGround, '착지 후 onGround=true');
    assert.ok(Math.abs(bottom(P(w)) - FLOOR_Y) < 0.5, `발 위치 ${bottom(P(w))}가 바닥 ${FLOOR_Y}와 달라 뚫고 지나감`);
  });
}

// ───────────────────────── 3. 달리기·정지·방향 ─────────────────────────
for (const h of HEROES) {
  test(`run[${h}]: 최고 속도 = CONFIG.runSpeed(±5%), 방향 전환`, () => {
    const w = world(h);
    settle(w, 5);
    for (let i = 0; i < 90; i++) step(w, input({ right: true }));
    within(P(w).vx, cfg(h).runSpeed, 0.05, '오른쪽 최고 속도');
    assert.equal(P(w).face, 1, '오른쪽을 보고 있어야 합니다');
    for (let i = 0; i < 120; i++) step(w, input({ left: true }));
    within(P(w).vx, -cfg(h).runSpeed, 0.05, '왼쪽 최고 속도');
    assert.equal(P(w).face, -1, '왼쪽을 보고 있어야 합니다');
  });

  test(`run[${h}]: 키를 떼면 CONFIG.stopTicks 안에 멈춤`, () => {
    const w = world(h);
    settle(w, 5);
    for (let i = 0; i < 90; i++) step(w, input({ right: true }));
    let stoppedAt = -1;
    for (let i = 1; i <= cfg(h).stopTicks + 1; i++) {
      step(w);
      if (Math.abs(P(w).vx) < 0.05) { stoppedAt = i; break; }
    }
    assert.ok(stoppedAt > 0, `stopTicks(${cfg(h).stopTicks}) 안에 멈추지 않음 (vx=${P(w).vx.toFixed(3)})`);
  });

  test(`run[${h}]: 좌우를 동시에 누르면 가속하지 않음`, () => {
    const w = world(h);
    settle(w, 5);
    const x0 = P(w).x;
    for (let i = 0; i < 60; i++) step(w, input({ left: true, right: true }));
    assert.ok(Math.abs(P(w).x - x0) < 0.5, `좌우 동시 입력에 ${P(w).x - x0}px 이동`);
  });
}

// ───────────────────────── 4. 벽·천장 충돌 ─────────────────────────
for (const h of HEROES) {
  test(`collision[${h}]: 벽을 통과하지 않음`, () => {
    const wall = { x: 600, y: 0, w: 40, h: FLOOR_Y };
    const w = world(h, flatRoom({ solids: flatRoom().solids.concat([wall]) }));
    for (let i = 0; i < 200; i++) {
      step(w, input({ right: true }));
      assert.ok(P(w).x + P(w).w <= wall.x + 0.01, `벽 안으로 들어감: 오른쪽 끝 ${P(w).x + P(w).w} > ${wall.x}`);
    }
    assert.ok(P(w).x + P(w).w > wall.x - 2, '벽에 붙을 때까지 이동해야 합니다');
    // 벽에 붙은 채 점프해도 벽에 끼거나 통과하지 않음
    for (let i = 0; i < 90; i++) {
      step(w, input({ right: true, jump: i < 20 }));
      assert.ok(P(w).x + P(w).w <= wall.x + 0.01, '점프 중 벽 통과');
    }
  });

  test(`collision[${h}]: 낮은 천장에 머리를 부딪히면 통과하지 않고 떨어짐`, () => {
    const c = cfg(h);
    const ceilBottom = FLOOR_Y - c.height - Math.max(8, c.jumpHeight * 0.4);
    const ceiling = { x: 100, y: ceilBottom - 30, w: 300, h: 30 };
    const w = world(h, flatRoom({ solids: flatRoom().solids.concat([ceiling]) }), { x: 200, y: FLOOR_Y - c.height });
    settle(w, 5);
    let minTop = Infinity;
    for (let i = 0; i < 120; i++) {
      step(w, input({ jump: i < 30 }));
      minTop = Math.min(minTop, P(w).y);
      assert.ok(P(w).y >= ceilBottom - 0.01, `천장 통과: 머리 ${P(w).y} < 천장 아래 ${ceilBottom}`);
    }
    assert.ok(minTop < ceilBottom + 2, '천장까지 닿아야 테스트가 유효합니다');
    assert.ok(P(w).onGround, '부딪힌 뒤 다시 착지해야 합니다');
  });
}

// ───────────────────────── 5. 점프 ─────────────────────────
for (const h of HEROES) {
  test(`jump[${h}]: 길게 누른 점프 높이 = CONFIG.jumpHeight(±8%)`, () => {
    const r = measureJump(h, 60);
    assert.ok(r.jumped, 'jump 이벤트가 발생해야 합니다');
    assert.ok(r.landed, '점프 후 착지해야 합니다');
    within(r.height, cfg(h).jumpHeight, 0.08, '최고 점프 높이(px)');
  });

  test(`jump[${h}]: 짧게 누른 점프(variableJump 설정 준수)`, () => {
    const c = cfg(h);
    const tap = measureJump(h, 1);
    assert.ok(tap.jumped, '한 틱만 눌러도 점프는 시작되어야 합니다');
    if (c.variableJump) {
      // minJumpHeight = 한 틱만 눌렀을 때 실제로 측정되는 높이(첫 틱 상승분 포함)
      within(tap.height, c.minJumpHeight, 0.15, '가장 짧게 누른 점프 높이(px)');
      assert.ok(tap.height < c.jumpHeight * 0.8, '짧은 점프가 긴 점프와 충분히 달라야 합니다');
    } else {
      within(tap.height, c.jumpHeight, 0.08, 'variableJump=false: 짧게 눌러도 같은 높이');
    }
  });

  test(`jump[${h}]: 계속 누르고 있어도 착지 후 자동 연속 점프 없음`, () => {
    const w = world(h);
    settle(w, 5);
    let jumps = 0;
    for (let i = 0; i < 240; i++) if (step(w, input({ jump: true })).some((e) => e.type === 'jump')) jumps++;
    assert.equal(jumps, 1, `점프 키를 누르고 있는 동안 ${jumps}번 점프`);
  });

  test(`jump[${h}]: 공중에서 추가 점프 불가(이중 점프 없음)`, () => {
    // 점프 키를 4틱마다 뗐다 다시 누른다. 착지 직전 입력(점프 버퍼)은 허용하고,
    // 바닥에서 충분히 떨어진 공중에서 새 점프가 시작되면 실패로 본다.
    const c = cfg(h);
    const w = world(h);
    settle(w, 5);
    let takeoff = -1, illegal = 0;
    for (let i = 0; i < 180; i++) {
      const before = clone(P(w));
      const ev = step(w, input({ jump: i % 4 !== 3 }));
      if (!ev.some((e) => e.type === 'jump')) continue;
      if (takeoff < 0) { takeoff = i; continue; }
      const airborne = !before.onGround && i - takeoff > c.coyoteTicks;
      const farAboveFloor = bottom(before) < FLOOR_Y - (c.maxFall + 2);
      if (airborne && farAboveFloor) illegal++;
    }
    assert.ok(takeoff >= 0, '첫 점프가 발생해야 합니다');
    assert.equal(illegal, 0, `공중에서 ${illegal}번 추가 점프`);
  });

  test(`jump[${h}]: 코요테 타임 — 발판을 벗어난 직후 CONFIG.coyoteTicks 안에는 점프 가능`, () => {
    const c = cfg(h);
    const ledge = { x: -40, y: 380, w: 340, h: 120 };
    const room = flatRoom({ solids: flatRoom().solids.concat([ledge]) });
    const run = (delay) => {
      const w = world(h, room, { x: 100, y: ledge.y - c.height });
      settle(w, 5);
      let t = 0;
      while (P(w).onGround && t++ < 300) step(w, input({ right: true }));
      assert.ok(!P(w).onGround, '발판 끝에서 떨어져야 합니다');
      for (let i = 1; i < delay; i++) step(w, input({ right: true }));
      let jumped = false;
      for (let i = 0; i < 3; i++) if (step(w, input({ right: true, jump: true })).some((e) => e.type === 'jump')) jumped = true;
      return jumped;
    };
    assert.ok(run(Math.max(1, c.coyoteTicks - 1)), `벗어난 뒤 ${Math.max(1, c.coyoteTicks - 1)}틱에 누른 점프가 무시됨`);
    assert.ok(!run(c.coyoteTicks + 3), `벗어난 뒤 ${c.coyoteTicks + 3}틱에 누른 점프가 허용됨(코요테가 너무 김)`);
  });

  test(`jump[${h}]: 점프 버퍼 — 착지 직전 CONFIG.jumpBufferTicks 안의 입력은 착지 순간 점프`, () => {
    const c = cfg(h);
    const spawn = { x: 300, y: FLOOR_Y - c.height - 160 };
    // 1) 입력 없이 떨어뜨려 착지 틱을 찾는다
    const probe = world(h, flatRoom(), spawn);
    let landTick = -1;
    for (let i = 0; i < 300; i++) if (step(probe).some((e) => e.type === 'land')) { landTick = i; break; }
    assert.ok(landTick > c.jumpBufferTicks + 6, '착지 틱 측정 실패');
    const run = (early) => {
      const w = world(h, flatRoom(), spawn);
      let jumped = false;
      for (let i = 0; i < landTick + 6; i++) {
        const ev = step(w, input({ jump: i === landTick - early }));
        if (ev.some((e) => e.type === 'jump')) jumped = true;
      }
      return jumped;
    };
    assert.ok(run(Math.max(1, c.jumpBufferTicks - 1)), `착지 ${Math.max(1, c.jumpBufferTicks - 1)}틱 전 입력이 무시됨`);
    assert.ok(!run(c.jumpBufferTicks + 4), `착지 ${c.jumpBufferTicks + 4}틱 전 입력이 점프로 처리됨(버퍼가 너무 김)`);
  });
}

// ───────────────────────── 6. 무기 ─────────────────────────
function attackRoom(h, side) {
  const c = cfg(h);
  const px = 300;
  const reach = Math.min(c.weapon.range * 0.6, 200);
  const dx = side > 0 ? px + c.width + reach - 15 : px - reach - 15;
  return {
    room: flatRoom({ dummies: [{ id: 'dummy', x: dx, y: FLOOR_Y - 60, w: 30, h: 60, hp: 1000 }] }),
    spawn: { x: px, y: FLOOR_Y - c.height }
  };
}
const dummyHp = (w) => w.dummies.find((d) => d.id === 'dummy').hp;

for (const h of HEROES) {
  test(`weapon[${h}]: 앞의 표적은 맞고 1회 공격 = 1회 피해(CONFIG.weapon.damage)`, () => {
    const { room, spawn } = attackRoom(h, 1);
    const w = world(h, room, spawn);
    step(w, input({ right: true })); settle(w, 10); // 오른쪽을 보게 함
    let attacks = 0, hits = 0;
    for (let i = 0; i < 90; i++) {
      const ev = step(w, input({ attack: i === 0 }));
      attacks += ev.filter((e) => e.type === 'attack').length;
      hits += ev.filter((e) => e.type === 'hit').length;
    }
    assert.equal(attacks, 1, `attack 이벤트 ${attacks}회`);
    assert.equal(hits, 1, `한 번의 공격에 hit ${hits}회(다중 판정)`);
    assert.equal(1000 - dummyHp(w), cfg(h).weapon.damage, `피해량 ${1000 - dummyHp(w)} ≠ weapon.damage ${cfg(h).weapon.damage}`);
  });

  test(`weapon[${h}]: 등 뒤의 표적은 맞지 않음, 판정은 바라보는 쪽에 생성`, () => {
    const { room, spawn } = attackRoom(h, -1);
    const w = world(h, room, spawn);
    step(w, input({ right: true })); settle(w, 10);
    let sawHitbox = false;
    for (let i = 0; i < 90; i++) {
      step(w, input({ attack: i === 0 }));
      for (const b of HK.getHitboxes(w)) {
        sawHitbox = true;
        assert.ok(b.x + b.w / 2 > centerX(P(w)) - 1, '오른쪽을 보는데 공격 판정이 왼쪽에 생김');
      }
    }
    assert.ok(sawHitbox, 'getHitboxes가 공격 판정을 반환해야 합니다');
    assert.equal(dummyHp(w), 1000, '등 뒤 표적이 피해를 입음');
  });

  test(`weapon[${h}]: 공격 키를 누르고 있어도 자동 연사 없음`, () => {
    const w = world(h);
    settle(w, 5);
    let attacks = 0;
    for (let i = 0; i < 120; i++) attacks += step(w, input({ attack: true })).filter((e) => e.type === 'attack').length;
    assert.equal(attacks, 1, `누르고 있는 동안 ${attacks}회 공격`);
  });

  test(`weapon[${h}]: 연타해도 CONFIG.weapon.cooldownTicks보다 빠르게 공격하지 않음`, () => {
    const cd = cfg(h).weapon.cooldownTicks;
    const w = world(h);
    settle(w, 5);
    let attacks = 0;
    const N = 240;
    for (let i = 0; i < N; i++) attacks += step(w, input({ attack: i % 2 === 0 })).filter((e) => e.type === 'attack').length;
    assert.ok(attacks >= 1, '연타 중 최소 1회는 공격해야 합니다');
    assert.ok(attacks <= Math.ceil(N / cd) + 1, `${N}틱 동안 ${attacks}회 공격 > 허용 ${Math.ceil(N / cd) + 1}회`);
  });
}

// ───────────────────────── 7. 교대(Swap) ─────────────────────────
test('swap: 교대 시 발 위치 유지, 쿨다운 동안 재교대 불가', () => {
  const w = world('ethan');
  settle(w, 10);
  const a = clone(P(w));
  const ev = step(w, input({ swap: true }));
  assert.ok(ev.some((e) => e.type === 'swap'), 'swap 이벤트가 발생해야 합니다');
  assert.equal(w.active, 'noah', 'world.active가 noah로 바뀌어야 합니다');
  const b = P(w);
  assert.ok(Math.abs(bottom(b) - bottom(a)) < 1, `발 높이 변화 ${bottom(a)} → ${bottom(b)}`);
  assert.ok(Math.abs(centerX(b) - centerX(a)) < 2, `가로 위치 변화 ${centerX(a)} → ${centerX(b)}`);
  const cd = HK.CONFIG.swapCooldownTicks;
  step(w); // 키 떼기
  let early = false;
  for (let i = 0; i < Math.max(0, cd - 3); i += 2) {
    if (step(w, input({ swap: true })).some((e) => e.type === 'swap')) early = true;
    step(w);
  }
  assert.ok(!early, `swapCooldownTicks(${cd}) 안에 다시 교대됨`);
  settle(w, cd + 2);
  assert.ok(step(w, input({ swap: true })).some((e) => e.type === 'swap'), '쿨다운이 끝난 뒤에는 교대되어야 합니다');
  assert.equal(w.active, 'ethan');
});

test('swap: 교대 후 바뀐 주인공의 CONFIG로 움직임', () => {
  const w = world('ethan');
  settle(w, 5);
  step(w, input({ swap: true }));
  for (let i = 0; i < 90; i++) step(w, input({ right: true }));
  within(P(w).vx, cfg('noah').runSpeed, 0.05, '교대 후 Noah 최고 속도');
});

// ───────────────────────── 결과 ─────────────────────────
const failed = results.filter((r) => !r[0]);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
