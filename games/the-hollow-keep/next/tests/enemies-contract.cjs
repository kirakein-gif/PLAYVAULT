#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 3단계 전투 2차 — 체력·피격·쓰러짐·회복·적 3종 인수 테스트
 * 규격: games/the-hollow-keep/docs/COMBAT2_SPEC.md §2~§5
 * 실행: node games/the-hollow-keep/next/tests/enemies-contract.cjs   (HK_SIM으로 다른 sim.js 지정 가능)
 * 검사마다 작은 구역을 이 파일 안에서 만든다(바닥 = 17행 윗면 y 510).
 */
'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(__dirname, '..', 'sim.js'));

const T = 30, COLS = 32, ROWS = 18, FLOOR = 510;
const NONE = { left: false, right: false, up: false, down: false, jump: false, attack: false, swap: false, interact: false };
const I = (o = {}) => Object.assign({}, NONE, o);
const P = (w) => HK.getPlayer(w);
const cfg = (h) => HK.CONFIG.heroes[h];
const E = (k) => HK.CONFIG.enemies[k];

function room(pos, { open = {}, set = [], objects = [] } = {}) {
  const g = Array.from({ length: ROWS }, (_, r) => (r === 0 || r === ROWS - 1 ? '#'.repeat(COLS) : '#' + '.'.repeat(COLS - 2) + '#').split(''));
  for (const r of open.left || []) g[r][0] = '.';
  for (const r of open.right || []) g[r][COLS - 1] = '.';
  for (const [r, c, ch] of set) g[r][c] = ch;
  return { pos, name: 'test', grid: g.map((row) => row.join('')), objects };
}
const area = (start, rooms) => ({ version: 1, cols: COLS, rows: ROWS, tile: T, start, rooms });
const at = (hero, col) => ({ x: col * T + T / 2 - cfg(hero).width / 2, y: FLOOR - cfg(hero).height });
const enemy = (id, kind, x, y = 16, extra = {}) => ({ type: 'enemy', id, kind, x, y, ...extra });
function world(a, opts = {}) { return HK.createWorld({ area: JSON.parse(JSON.stringify(a)), hero: opts.hero || 'ethan', ...(opts.hp ? { hp: opts.hp } : {}) }); }
function run(w, inp, n) { const ev = []; for (let i = 0; i < n; i++) ev.push(...HK.step(w, typeof inp === 'function' ? inp(i) : inp)); return ev; }
function until(w, inp, pred, max = 900) {
  const ev = [];
  for (let i = 0; i < max; i++) { ev.push(...HK.step(w, typeof inp === 'function' ? inp(i) : inp)); if (pred(w, ev)) return ev; }
  assert.fail(`조건을 ${max}틱 안에 만족하지 못함 (방 ${w.roomId}, x ${P(w).x.toFixed(1)}, 적 ${JSON.stringify(HK.getEnemies(w).map((e) => [e.id, e.state, Math.round(e.x), e.hp]))})`);
}
const has = (ev, type, extra = {}) => ev.some((e) => e.type === type && Object.entries(extra).every(([k, v]) => e[k] === v));
const en = (w, id) => HK.getEnemies(w).find((e) => e.id === id);
const cx = (b) => b.x + b.w / 2;

const results = [];
function test(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}

test('계약: CONFIG(maxHp·무적·밀림·회복·적 3종)와 getHeroes·getEnemies·getPickups', () => {
  assert.equal(cfg('ethan').maxHp, 6); assert.equal(cfg('noah').maxHp, 5);
  for (const k of ['hurtInvulnTicks', 'downSwapInvulnTicks', 'healDropEvery', 'healAmount']) assert.equal(typeof HK.CONFIG[k], 'number', k);
  assert.ok(HK.CONFIG.knockback && HK.CONFIG.knockback.vx > 0 && HK.CONFIG.knockback.vy < 0, 'knockback');
  for (const k of ['crawler', 'wisp', 'shield']) for (const f of ['width', 'height', 'hp', 'speed', 'contactDamage']) assert.equal(typeof (E(k) || {})[f], 'number', `enemies.${k}.${f}`);
  assert.ok(E('crawler').height >= 36, `crawler 키 ${E('crawler').height} — Ethan 탄(발에서 40 ± 6)에 맞아야 함`);
  const w = world(area({ room: 'a', ...at('ethan', 3) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 20)] }) }));
  assert.deepEqual(HK.getHeroes(w), { ethan: { hp: 6, maxHp: 6, down: false }, noah: { hp: 5, maxHp: 5, down: false } });
  const e = HK.getEnemies(w); assert.equal(e.length, 1); assert.equal(e[0].kind, 'crawler'); assert.equal(e[0].hp, E('crawler').hp);
  assert.ok(Math.abs(e[0].y + e[0].h - FLOOR) <= 0.5, '적 발이 바닥에');
  assert.deepEqual(HK.getPickups(w), []);
  assert.equal(P(w).invuln, 0);
});

test('피격: 적에 닿으면 접촉 피해·적 반대쪽으로 밀림·무적 동안 추가 피해 없음', () => {
  const w = world(area({ room: 'a', ...at('ethan', 6) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 10)] }) }));
  const ev = until(w, I(), (W, e) => has(e, 'hurt'), 400);
  const hurt = ev.find((x) => x.type === 'hurt');
  assert.equal(hurt.hero, 'ethan'); assert.equal(hurt.damage, E('crawler').contactDamage); assert.equal(HK.getHeroes(w).ethan.hp, 6 - hurt.damage);
  const c = en(w, 'c1'), dir = Math.sign(cx(P(w)) - cx(c)) || -1;
  assert.ok(P(w).invuln > 0, '무적 없음');
  const x0 = P(w).x; run(w, I(), 6);
  assert.ok((P(w).x - x0) * dir > 3, `적 반대쪽으로 밀리지 않음(${(P(w).x - x0).toFixed(1)}, 방향 ${dir})`);
  const more = run(w, I(), HK.CONFIG.hurtInvulnTicks - 8);
  assert.ok(!has(more, 'hurt'), '무적 중 다시 맞음');
});

test('쓰러짐(한 명): 체력 0 → down, 다른 주인공으로 자동 교대·무적, 쓰러진 쪽으로는 교대 불가', () => {
  const w = world(area({ room: 'a', ...at('ethan', 6) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 10)] }) }), { hp: { ethan: 1, noah: 5 } });
  const ev = until(w, I(), (W, e) => has(e, 'down'), 400);
  assert.ok(has(ev, 'down', { hero: 'ethan' }));
  assert.ok(has(ev, 'swap', { from: 'ethan', to: 'noah', reason: 'down' }), '자동 교대 이벤트');
  assert.equal(w.active, 'noah'); assert.deepEqual(HK.getHeroes(w).ethan, { hp: 0, maxHp: 6, down: true });
  assert.ok(P(w).invuln >= HK.CONFIG.downSwapInvulnTicks - 2, `교대 무적 ${P(w).invuln}`);
  assert.ok(Math.abs(P(w).y + P(w).h - FLOOR) <= 1 || !P(w).onGround, '같은 발 위치');
  run(w, I(), 20);
  const sw = HK.step(w, I({ swap: true }));
  assert.ok(has(sw, 'swapBlocked', { reason: 'down' }) && w.active === 'noah', '쓰러진 Ethan으로 교대됨');
});

test('쓰러짐(둘 다): defeat → respawn — 시작 방·위치, 두 주인공 가득, 진행(스위치) 유지, 일반 적 되살아남', () => {
  const a = area({ room: 'a', ...at('ethan', 4) }, {
    a: room([0, 0], { open: { right: [13, 14, 15, 16] }, objects: [{ type: 'switch', id: 'sw', x: 4, y: 16, kind: 'lever' }] }),
    b: room([1, 0], { open: { left: [13, 14, 15, 16] }, objects: [enemy('c1', 'crawler', 8)] })
  });
  const w = world(a, { hp: { ethan: 1, noah: 1 } });
  HK.step(w, I({ interact: true })); HK.step(w, I());
  assert.ok(HK.getFlags(w).switches.sw, '스위치 켜기');
  until(w, I({ right: true }), (W) => W.roomId === 'b', 400);
  const ev = until(w, (i) => I({ right: i % 40 < 20 }), (W, e) => has(e, 'respawn'), 1500);
  assert.ok(has(ev, 'defeat'), 'defeat 이벤트');
  assert.equal(w.roomId, 'a'); const s = a.start;
  assert.ok(Math.abs(P(w).x - s.x) <= 1 && Math.abs(P(w).y - s.y) <= 1, '시작 위치');
  assert.deepEqual(HK.getHeroes(w), { ethan: { hp: 6, maxHp: 6, down: false }, noah: { hp: 5, maxHp: 5, down: false } });
  assert.ok(HK.getFlags(w).switches.sw, '진행이 초기화됨');
  until(w, I({ right: true }), (W) => W.roomId === 'b', 400);
  assert.equal(en(w, 'c1').hp, E('crawler').hp, '일반 적 되살아남');
});

test('쉼터: 겹친 채 조사하면 둘 다 가득·쓰러짐 해제(rest)', () => {
  const a = area({ room: 'a', ...at('ethan', 5) }, { a: room([0, 0], { objects: [{ type: 'shelter', id: 'rest1', x: 4, y: 14 }] }) });
  const w = world(a, { hp: { ethan: 2, noah: 0 } });
  assert.equal(HK.getHeroes(w).noah.down, true, 'hp 0으로 시작하면 쓰러진 상태');
  const ev = [...HK.step(w, I({ interact: true }))]; ev.push(...HK.step(w, I()));
  assert.ok(has(ev, 'rest'), 'rest 이벤트');
  assert.deepEqual(HK.getHeroes(w), { ethan: { hp: 6, maxHp: 6, down: false }, noah: { hp: 5, maxHp: 5, down: false } });
});

test('회복 조각: 적을 healDropEvery번째 쓰러뜨린 자리에 생기고, 닿으면 healAmount만큼 회복(최대 넘지 않음)', () => {
  const n = HK.CONFIG.healDropEvery, objs = [];
  for (let i = 0; i < n; i++) objs.push(enemy(`c${i}`, 'crawler', 12 + i * 4, 16, { face: 1 }));
  const w = world(area({ room: 'a', ...at('ethan', 3) }, { a: room([0, 0], { objects: objs }) }), { hp: { ethan: 3, noah: 5 } });
  let kills = 0, pick = null;
  const ev = until(w, (i) => I({ attack: i % 30 === 0 }), (W, e) => { kills = e.filter((x) => x.type === 'kill').length; return kills >= n; }, 1200);
  const lastKill = ev.filter((x) => x.type === 'kill').pop();
  const ps = HK.getPickups(w);
  assert.equal(ps.length, 1, `회복 조각 ${ps.length}개`);
  pick = ps[0]; assert.equal(pick.kind, 'heal');
  const hp0 = HK.getHeroes(w).ethan.hp;
  const ev2 = until(w, I({ [cx(pick) > cx(P(w)) ? 'right' : 'left']: true }), (W, e) => has(e, 'heal'), 600);
  assert.ok(has(ev2, 'heal', { hero: 'ethan' }));
  assert.equal(HK.getHeroes(w).ethan.hp, Math.min(6, hp0 + HK.CONFIG.healAmount));
  assert.deepEqual(HK.getPickups(w), []);
  assert.ok(lastKill, 'kill 이벤트');
});

test('crawler: 높은 단에서 오가도 떨어지지 않음(벽·낭떠러지 앞에서 돌아섬)', () => {
  const set = []; for (let c = 10; c <= 18; c++) set.push([12, c, '#']); // 12행 윗면 y 360에 단
  const w = world(area({ room: 'a', ...at('ethan', 2) }, { a: room([0, 0], { set, objects: [enemy('c1', 'crawler', 14, 11)] }) }));
  let minX = Infinity, maxX = -Infinity;
  for (let i = 0; i < 900; i++) { HK.step(w, I()); const c = en(w, 'c1'); assert.ok(Math.abs(c.y + c.h - 360) <= 0.5 && cx(c) >= 300 && cx(c) <= 570, `${i}틱에 단에서 벗어남(발 ${(c.y + c.h).toFixed(1)}, 가운데 ${cx(c).toFixed(1)} — 단 300~570)`); minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x + c.w); }
  assert.ok(maxX - minX > 90, `거의 움직이지 않음(${(maxX - minX).toFixed(1)})`);
});

test('crawler: 같은 바닥의 주인공이 앞 160 안이면 순찰보다 빠르게 돌진', () => {
  const w = world(area({ room: 'a', ...at('ethan', 6) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 11)] }) }), { hp: { ethan: 6, noah: 5 } });
  let vmax = 0, x = en(w, 'c1').x;
  // 틱마다 이동 거리를 잰다(돌진을 시작한 뒤 5틱 더)
  let after = -1;
  for (let i = 0; i < 130 && en(w, 'c1') && after !== 0; i++) { HK.step(w, I()); const c = en(w, 'c1'); if (!c) break; vmax = Math.max(vmax, Math.abs(c.x - x)); x = c.x; if (after > 0) after--; else if (after < 0 && c.state === 'charge') after = 5; }
  assert.ok(vmax >= 2, `돌진 속도 ${vmax.toFixed(2)}`); assert.ok(vmax > E('crawler').speed * 1.5, '순찰보다 빠르지 않음');
});

test('crawler: Ethan 1단 룬탄·Noah 1단 베기 한 번에 쓰러짐(kill)', () => {
  let w = world(area({ room: 'a', ...at('ethan', 3) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 14, 16, { face: 1 })] }) }));
  let ev = run(w, (i) => I({ attack: i === 0 }), 60);
  assert.ok(has(ev, 'kill', { id: 'c1' }), 'Ethan 룬탄에 쓰러지지 않음');
  w = world(area({ room: 'a', ...at('noah', 6) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 8, 16, { face: 1 })] }) }), { hero: 'noah' });
  ev = run(w, (i) => I({ attack: i === 0 }), 20);
  assert.ok(has(ev, 'kill', { id: 'c1' }), 'Noah 1단에 쓰러지지 않음');
});

test('wisp: 떠 있는 동안 몸 아래가 바닥에서 60~70 — Ethan 서서 쏜 1단·Noah 1단은 빗나가고 Noah 2단 올려 베기는 맞음', () => {
  const far = world(area({ room: 'a', ...at('ethan', 2) }, { a: room([0, 0], { objects: [enemy('w1', 'wisp', 24, 13)] }) }));
  for (let i = 0; i < 120; i++) { HK.step(far, I({ attack: i % 30 === 0 })); const e = en(far, 'w1'); const b = FLOOR - (e.y + e.h); assert.ok(b >= 60 && b <= 70 || e.state !== 'hover', `${i}틱 떠 있는 높이 ${b.toFixed(1)}`); }
  assert.equal(en(far, 'w1').hp, E('wisp').hp, '서서 쏜 1단 룬탄이 떠 있는 wisp에 맞음');
  const w = world(area({ room: 'a', ...at('noah', 10) }, { a: room([0, 0], { objects: [enemy('w1', 'wisp', 12, 13)] }) }), { hero: 'noah' });
  const c = HK.CONFIG.heroes.noah.weapon.combo;
  let ev = run(w, (i) => I({ attack: i === 0 }), c[0].recoveryTicks - 1);
  assert.ok(!has(ev, 'hit', { target: 'w1' }), 'Noah 1단이 떠 있는 wisp에 맞음');
  ev = run(w, (i) => I({ attack: i === 0 }), (c[1].startupTicks || 0) + c[1].activeTicks + 2);
  assert.ok(has(ev, 'hit', { target: 'w1' }), 'Noah 2단 올려 베기가 wisp에 맞지 않음');
});

test('wisp: 주인공이 가로 220 안이면 따라오고, 내리꽂기(dive) 때 몸 아래가 바닥 40 아래로 내려옴', () => {
  const w = world(area({ room: 'a', ...at('ethan', 6) }, { a: room([0, 0], { objects: [enemy('w1', 'wisp', 12, 13)] }) }), { hp: { ethan: 6, noah: 5 } });
  const d0 = Math.abs(cx(en(w, 'w1')) - cx(P(w)));
  let dived = false, low = Infinity;
  for (let i = 0; i < 360; i++) { HK.step(w, I()); const e = en(w, 'w1'); if (!e) break; if (e.state === 'dive') dived = true; low = Math.min(low, FLOOR - (e.y + e.h)); }
  assert.ok(dived, 'dive 상태가 없음'); assert.ok(low < 40, `가장 낮을 때 ${low.toFixed(1)}`);
  assert.ok(Math.abs(cx(en(w, 'w1')) - cx(P(w))) < d0, '주인공 쪽으로 오지 않음');
});

test('shield: 앞에서 Ethan 1단·Noah 1·2단은 막힘(blocked, 피해 0) — Noah 3단 내려치기·뒤에서 치기는 들어감', () => {
  const sh = E('shield'), c = HK.CONFIG.heroes.noah.weapon.combo;
  let w = world(area({ room: 'a', ...at('ethan', 4) }, { a: room([0, 0], { objects: [enemy('s1', 'shield', 14)] }) }));
  let ev = run(w, (i) => I({ attack: i === 0 }), 50);
  assert.ok(has(ev, 'blocked', { id: 's1' }) && en(w, 's1').hp === sh.hp, '앞에서 Ethan 1단이 막히지 않음');
  w = world(area({ room: 'a', ...at('noah', 9) }, { a: room([0, 0], { objects: [enemy('s1', 'shield', 12)] }) }), { hero: 'noah', hp: { ethan: 6, noah: 5 } });
  ev = [];
  for (let k = 0; k < 3; k++) { ev.push(...HK.step(w, I({ attack: true }))); ev.push(...run(w, I(), c[k].recoveryTicks - 1)); }
  const blocks = ev.filter((e) => e.type === 'blocked').length;
  assert.ok(blocks >= 2, `1·2단 막힘 ${blocks}회`);
  assert.ok(en(w, 's1') && sh.hp - en(w, 's1').hp >= c[2].damage, `3단 피해 ${sh.hp - (en(w, 's1') || { hp: 0 }).hp}`);
  // 방패형은 300 안의 주인공 쪽으로 돌아서므로, 등 뒤 300 밖에서 쏜다
  w = world(area({ room: 'a', ...at('ethan', 27) }, { a: room([0, 0], { objects: [enemy('s1', 'shield', 14, 16, { face: -1 })] }) }));
  HK.step(w, I({ left: true })); run(w, I(), 20);
  ev = run(w, (i) => I({ attack: i === 0 }), 50);
  assert.ok(has(ev, 'hit', { target: 's1' }) && !has(ev, 'blocked'), '뒤에서 친 룬탄이 막힘');
});

test('shield: 앞에서 맞은 2단 충전탄은 막지 못하고 stagger — 그동안은 1단도 들어감', () => {
  const w = world(area({ room: 'a', ...at('ethan', 3) }, { a: room([0, 0], { objects: [enemy('s1', 'shield', 16)] }) }));
  const ch = HK.CONFIG.heroes.ethan.weapon.charge, sh = E('shield');
  const ev = []; for (let i = 0; i < ch.stage2Ticks + 2; i++) ev.push(...HK.step(w, I({ attack: true })));
  ev.push(...until(w, I(), (W) => en(W, 's1').state === 'stagger', 120));
  const hp1 = en(w, 's1').hp;
  assert.ok(hp1 < sh.hp, '충전탄 피해 없음');
  run(w, I(), 2);
  // 충전탄 뒤 공격 대기가 끝나는 대로 1단이 나가도록 눌렀다 뗐다 반복(방패형 위치에 따라 대기 중일 수 있음)
  const ev2 = until(w, (i) => I({ attack: i % 2 === 0 }), (W, e) => has(e, 'hit', { target: 's1' }) || has(e, 'blocked'), 50);
  assert.ok(has(ev2, 'hit', { target: 's1' }) && !has(ev2, 'blocked'), 'stagger 중 1단이 막힘');
});

test('shield: 앞 50 안이면 준비(windup)가 15틱 이상 보인 뒤 밀치기(bash) 피해 2', () => {
  const w = world(area({ room: 'a', ...at('ethan', 10) }, { a: room([0, 0], { objects: [enemy('s1', 'shield', 13)] }) }), { hp: { ethan: 6, noah: 5 } });
  let windup = 0, hurt = null;
  for (let i = 0; i < 400 && !hurt; i++) {
    const ev = HK.step(w, I()); const s = en(w, 's1');
    if (s && s.state === 'windup') windup++;
    hurt = ev.find((e) => e.type === 'hurt');
  }
  assert.ok(hurt, '맞지 않음'); assert.equal(hurt.damage, 2, `피해 ${hurt.damage}`);
  assert.ok(windup >= 15, `준비가 ${windup}틱만 보임`);
});

test('되살아남: 일반 적은 방을 나갔다 오면 처음 체력, 봉쇄물을 여는 특정 적은 다시 나오지 않고 문도 열린 채', () => {
  const a = area({ room: 'a', ...at('ethan', 20) }, {
    a: room([0, 0], { open: { left: [13, 14, 15, 16] }, objects: [enemy('key1', 'crawler', 26, 16, { face: -1 }), enemy('n1', 'crawler', 28, 16, { face: -1 }),
      { type: 'door', id: 'gate', x: 3, y: 2, w: 1, h: 3, open: { cleared: ['key1'] } }], set: [[1, 3, '#'], [5, 3, '#']] }),
    b: room([-1, 0], { open: { right: [13, 14, 15, 16] } })
  });
  const w = world(a, { hp: { ethan: 6, noah: 5 } });
  HK.step(w, I({ right: true })); run(w, I(), 5);
  until(w, (i) => I({ attack: i % 30 === 0 }), (W) => !en(W, 'key1') && !en(W, 'n1'), 600);
  assert.ok(HK.getFlags(w).cleared.key1 && HK.getFlags(w).doors.gate, '특정 적 처치 → 문 열림');
  until(w, I({ left: true }), (W) => W.roomId === 'b', 600);
  until(w, I({ right: true }), (W) => W.roomId === 'a', 200);
  assert.ok(!en(w, 'key1'), '특정 적이 되살아남');
  assert.ok(en(w, 'n1') && en(w, 'n1').hp === E('crawler').hp, '일반 적이 되살아나지 않음');
  assert.ok(HK.getFlags(w).doors.gate, '문이 다시 닫힘');
});

test('쓰러짐 교대: 더 큰 Ethan이 벽·닫힌 봉쇄물에 묻히지 않음(§2, 2026-11-03 보완)', () => {
  // Noah(39×64)가 오른쪽 벽 / 닫힌 봉쇄물에 붙어 선 채 쓰러지면 Ethan(42×68)으로 바뀐다(무작위 입력 검사에서 실제로 발견).
  const solidsOf = (a) => { const out = []; a.rooms.a.grid.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') out.push({ x: c * T, y: r * T, w: T, h: T }); })); for (const o of a.rooms.a.objects) if (o.type === 'door') out.push({ x: o.x * T, y: o.y * T, w: (o.w || 1) * T, h: (o.h || 1) * T }); return out; };
  const ov = (a, b) => a.x < b.x + b.w - 0.01 && a.x + a.w > b.x + 0.01 && a.y < b.y + b.h - 0.01 && a.y + a.h > b.y + 0.01;
  const nw = cfg('noah').width, nh = cfg('noah').height;
  const cases = [
    ['오른쪽 벽', area({ room: 'a', hero: 'noah', x: 930 - nw, y: FLOOR - nh }, { a: room([0, 0], { objects: [enemy('c', 'crawler', 26, 16, { face: 1 })] }) })],
    ['닫힌 봉쇄물', area({ room: 'a', hero: 'noah', x: 600 - nw, y: FLOOR - nh }, { a: room([0, 0], { objects: [{ type: 'door', id: 'd', x: 20, y: 14, h: 3, open: { key: 'never' } }, enemy('c', 'crawler', 16, 16, { face: 1 })] }) })],
  ];
  for (const [label, a] of cases) {
    const w = world(a, { hero: 'noah', hp: { ethan: 6, noah: 1 } });
    const solids = solidsOf(a);
    let swapped = -1;
    for (let t = 0; t < 600 && swapped < 0; t++) { const ev = HK.step(w, I()); if (has(ev, 'swap', { reason: 'down' })) swapped = t; }
    assert.ok(swapped >= 0, `${label}: 쓰러짐 교대가 일어나지 않음(검사 준비)`);
    for (let k = 0; k < 30; k++) {
      const p = P(w), hit = solids.find((b) => ov(p, b));
      assert.ok(!hit, `${label}: 교대 ${k}틱 뒤 Ethan(${p.x.toFixed(1)},${p.y.toFixed(1)} ${p.w}×${p.h})이 막힌 칸(${hit && hit.x},${hit && hit.y})에 겹침`);
      HK.step(w, I());
    }
  }
});

test('피격 판정(§2-1, 2026-11-04 보완): getHurtbox는 몸에서 앞뒤 hurtInset 안쪽, 적 몸이 이 상자에 닿아야 맞음', () => {
  const inset = HK.CONFIG.hurtInset;
  assert.ok(Number.isFinite(inset) && inset >= 3 && inset <= 6, `CONFIG.hurtInset ${inset} (3~6)`);
  for (const hero of ['ethan', 'noah']) {
    const a = area({ room: 'a', hero, ...at(hero, 8) }, { a: room([0, 0], { objects: [enemy('c', 'crawler', 20)] }) });
    const w = world(a, { hero });
    HK.step(w, I({ right: true }));
    const hb = HK.getHurtbox(w), p = P(w);
    assert.ok(Math.abs(hb.x - (p.x + inset)) < 1e-6 && Math.abs(hb.w - (p.w - 2 * inset)) < 1e-6 && hb.y === p.y && hb.h === p.h, `${hero} getHurtbox ${JSON.stringify(hb)}`);
    let found = false;
    for (let t = 0; t < 600 && !found; t++) {
      const before = { ...P(w) }; const ev = HK.step(w, I());
      if (has(ev, 'hurt')) {
        const e = en(w, 'c'), pen = Math.min(before.x + before.w, e.x + e.w) - Math.max(before.x, e.x);
        assert.ok(pen >= inset - 0.01, `${hero}: 돌격형 몸이 주인공 몸에 ${pen.toFixed(2)}단위만 겹쳤는데 맞음(그림보다 먼저 맞음, 기준 ${inset} 이상)`);
        found = true;
      }
    }
    assert.ok(found, `${hero}: 돌격형에 맞지 않음(검사 준비)`);
  }
});

test('shield 밀치기(§5-1, 2026-11-04 보완): 판정은 방패 앞 bashReach(그림 효과)만 — 준비 중 거리를 두면 피하고, 다음 준비까지 recoveryTicks 이상', () => {
  const c = E('shield');
  assert.ok(c.bashReach >= 24 && c.bashReach <= 40, `bashReach ${c.bashReach} (24~40)`);
  assert.ok(c.bashRange > c.bashReach, `준비 시작 거리 bashRange ${c.bashRange}가 판정 bashReach ${c.bashReach}보다 커야 물러나 피할 수 있음`);
  assert.ok(c.recoveryTicks >= 80, `recoveryTicks ${c.recoveryTicks} ≥ 80 (너무 자주 밀침)`);
  const sx = 16 * T + T / 2 - c.width / 2; // 방패형 왼쪽 끝(앞)
  const setup = (gap) => {
    const a = area({ room: 'a', hero: 'ethan', x: sx - gap - cfg('ethan').width, y: FLOOR - cfg('ethan').height }, { a: room([0, 0], { objects: [enemy('s', 'shield', 16, 16, { face: -1 })] }) });
    const w = world(a); HK.step(w, I({ right: true })); return w;
  };
  // 거리 45: 준비는 시작하지만 밀치기는 닿지 않는다
  let w = setup(45), sawBash = false, bashEnd = -1;
  for (let t = 0; t < 80; t++) {
    const ev = HK.step(w, I()), boxes = HK.getEnemyHitboxes(w), s = en(w, 's');
    assert.ok(!has(ev, 'hurt'), `거리 45에서 ${t}틱에 맞음(방패 앞 ${c.bashReach}만 닿아야 함)`);
    if (s.state === 'bash') {
      sawBash = true;
      assert.equal(boxes.length, 1, 'bash 중 getEnemyHitboxes 1개');
      const b = boxes[0];
      assert.ok(Math.abs(b.x + b.w - s.x) < 0.01 && Math.abs(b.w - c.bashReach) < 0.01, `밀치기 판정 ${JSON.stringify(b)}이 방패 앞(왼쪽 ${s.x.toFixed(1)}) ${c.bashReach}가 아님`);
    } else {
      assert.equal(boxes.length, 0, `${s.state} 중에 적 공격 판정이 있음`);
      if (sawBash && bashEnd < 0) bashEnd = t;
    }
  }
  assert.ok(sawBash && bashEnd > 0, '거리 45에서 준비·밀치기가 일어나지 않음(검사 준비)');
  // 다음 준비까지의 간격(맞아서 밀려나도 됨)
  let next = -1;
  for (let t = 80; t < bashEnd + 200 && next < 0; t++) { HK.step(w, I()); if ((en(w, 's') || {}).state === 'windup') next = t; } // 위 반복이 80틱을 이미 진행함
  assert.ok(next < 0 || next - bashEnd >= c.recoveryTicks, `밀치기 끝 ${bashEnd}틱 → 다음 준비 ${next}틱, 간격 ${next - bashEnd} < recoveryTicks ${c.recoveryTicks}`);
  // 거리 20: 밀치기에 맞는다(피해 2), 맞는 순간 판정이 피격 상자와 겹침
  w = setup(20); let hurt = null;
  for (let t = 0; t < 60 && !hurt; t++) { const ev = HK.step(w, I()); const h = ev.find((e) => e.type === 'hurt'); if (h) hurt = h; }
  assert.ok(hurt && hurt.damage === c.bashDamage, `거리 20에서 밀치기 피해 ${c.bashDamage}를 받지 않음(${JSON.stringify(hurt)})`);
});

// 위층 바닥(12행, 윗면 y 360)을 사다리(15열)가 지나고 양옆은 발판 — COMBAT2 §6-1 사다리 층계참
function twoFloors(objects, { from = 3, to = 28, through = false } = {}) {
  const set = [];
  if (through) for (let r = 8; r <= 11; r++) set.push([r, 15, 'H']); // 사다리가 위층 바닥을 지나 더 올라감(꼭대기가 아닌 층계참)
  for (let c = from; c <= to; c++) set.push([12, c, c === 15 ? 'H' : c === 14 || c === 16 ? '-' : '#']);
  for (let r = 13; r <= 16; r++) set.push([r, 15, 'H']);
  return room([0, 0], { set, objects });
}
const UPPER = 360;

test('적 반응(§4-1, 2026-11-04 보완): 사다리에 매달린 주인공에게는 반응하지 않고 순찰, 사다리에서 내린 뒤 ladderGraceTicks 동안 공격을 시작하지 않음', () => {
  const grace = HK.CONFIG.ladderGraceTicks;
  assert.ok(Number.isFinite(grace) && grace >= 20, `CONFIG.ladderGraceTicks ${grace} ≥ 20`);
  for (const [kind, col] of [['shield', 18], ['crawler', 19]]) {
    const a = area({ room: 'a', hero: 'ethan', ...at('ethan', 15) }, { a: twoFloors([enemy('s', kind, col, 11, { face: -1 })]) });
    const w = world(a, { hp: { ethan: 6, noah: 5 } });
    const xs = []; let left = -1, attackStart = -1;
    for (let t = 0; t < 400 && attackStart < 0; t++) {
      const climbingBefore = P(w).climbing, p0 = P(w);
      const goingUp = left < 0 && !(p0.onGround && !p0.climbing && p0.y + p0.h <= UPPER + 0.5);
      HK.step(w, I({ up: goingUp }));
      const p = P(w), e = en(w, 's');
      if (left < 0 && climbingBefore && !p.climbing && p.y + p.h <= UPPER + 0.5) left = t;
      if (p.climbing) { xs.push(e.x); assert.ok(!['windup', 'bash', 'charge'].includes(e.state), `${kind}: 사다리에 매달린 주인공에게 ${e.state}(${t}틱)`); }
      if (left >= 0 && ['windup', 'charge'].includes(e.state)) attackStart = t;
    }
    assert.ok(left >= 0, `${kind}: 주인공이 위층에 오르지 못함(검사 준비)`);
    assert.ok(Math.max(...xs) - Math.min(...xs) >= 10, `${kind}: 주인공이 사다리를 오르는 동안 ${(Math.max(...xs) - Math.min(...xs)).toFixed(1)}단위만 움직임(순찰하지 않고 기다림)`);
    assert.ok(attackStart < 0 || attackStart - left >= grace, `${kind}: 사다리에서 내린 ${left}틱 뒤 ${attackStart - left}틱 만에 공격 시작(기준 ${grace})`);
  }
});

test('적 순찰(§4-1): 지상 적은 바닥 높이의 사다리 칸(양옆 바닥·발판)을 건너가고, 다른 층 주인공을 따라와 기다리지 않음', () => {
  for (const kind of ['shield', 'crawler']) {
    // 주인공은 아래층 왼쪽(다른 층), 적은 위층 사다리 오른쪽에서 왼쪽으로 순찰
    const a = area({ room: 'a', hero: 'ethan', ...at('ethan', 4) }, { a: twoFloors([enemy('s', kind, 20, 11, { face: -1 })], { through: true }) });
    const w = world(a);
    let crossed = false, minX = Infinity, maxX = -Infinity;
    const limit = Math.ceil((2 * 26 * T) / E(kind).speed); // 위층을 한 번 왕복할 시간
    for (let t = 0; t < limit; t++) {
      HK.step(w, I()); const e = en(w, 's');
      assert.ok(Math.abs(e.y + e.h - UPPER) < 0.5, `${kind}: 위층에서 떨어짐(${t}틱, 발 ${(e.y + e.h).toFixed(1)})`);
      if (e.x + e.w / 2 < 15 * T) crossed = true;
      minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x);
    }
    assert.ok(crossed, `${kind}: 사다리 칸(15열)을 건너가지 못함(x ${minX.toFixed(0)}~${maxX.toFixed(0)})`);
    assert.ok(minX <= 5 * T && maxX + E(kind).width >= 26 * T, `${kind}: 위층 양 끝까지 오가지 않음(x ${minX.toFixed(0)}~${(maxX + E(kind).width).toFixed(0)}, 바닥 3~28열)`);
  }
});

test('결정성: 같은 입력 → 같은 결과(적·피격·교대 섞음)', () => {
  const a = area({ room: 'a', ...at('ethan', 4) }, { a: room([0, 0], { objects: [enemy('c1', 'crawler', 14), enemy('w1', 'wisp', 20, 13), enemy('s1', 'shield', 26)] }) });
  const script = (i) => I({ right: (i % 90) < 40, left: (i % 90) > 70, attack: i % 17 === 0, jump: i % 60 === 0, swap: i % 200 === 0 });
  const x = world(a), y = world(a); run(x, script, 900); run(y, script, 900);
  assert.deepEqual(HK.snapshot(x), HK.snapshot(y));
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
