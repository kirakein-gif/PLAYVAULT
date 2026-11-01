#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 시범 구역 데이터·완주 인수 테스트
 * 규격: games/the-hollow-keep/docs/EXPLORATION_SPEC.md §2, §4, §6, §7
 * 실행: node games/the-hollow-keep/next/tests/area-data.cjs
 * 환경 변수: HK_AREA(구역 파일, 기본 next/areas/area1.json), HK_WALK(완주 기록, 기본 area1.walkthrough.json), HK_SIM
 *   HK_AREA_REQ=off  — 검사기 자체 검증용. §7 필수 요소 개수 검사를 끈다(형식·연결·완주 검사는 그대로).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const NEXT = path.join(__dirname, '..');
const HK = require(process.env.HK_SIM ? path.resolve(process.env.HK_SIM) : path.join(NEXT, 'sim.js'));
const AREA = path.resolve(process.env.HK_AREA || path.join(NEXT, 'areas', 'area1.json'));
const WALK = path.resolve(process.env.HK_WALK || path.join(NEXT, 'areas', 'area1.walkthrough.json'));
const REQ = process.env.HK_AREA_REQ !== 'off';
const COLS = 32, ROWS = 18, T = 30, MAX_TICKS = 60 * 600;
const INPUTS = ['left', 'right', 'up', 'down', 'jump', 'attack', 'swap', 'interact'];

const results = [];
function check(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}
let area = null;
check('구역 파일: JSON, version 1, 32×18칸, tile 30', () => {
  assert.ok(fs.existsSync(AREA), `${AREA} 없음`);
  area = JSON.parse(fs.readFileSync(AREA, 'utf8'));
  assert.equal(area.version, 1); assert.equal(area.cols, COLS); assert.equal(area.rows, ROWS); assert.equal(area.tile, T);
  assert.ok(area.rooms && typeof area.rooms === 'object', 'rooms 필요');
});
if (!area) { console.log(`\n0/${results.length} passed`); process.exit(1); }
const rooms = Object.entries(area.rooms);
const objects = rooms.flatMap(([rid, r]) => (r.objects || []).map((o) => ({ ...o, room: rid })));
const byPos = new Map(rooms.map(([id, r]) => [String(r.pos), id]));

if (REQ) check('방 개수 8~12', () => assert.ok(rooms.length >= 8 && rooms.length <= 12, `방 ${rooms.length}개`));

check('방 형식: 위치 중복 없음, grid 18줄×32글자, 칸 문자 . # - H', () => {
  assert.equal(byPos.size, rooms.length, '같은 pos를 쓰는 방이 있음');
  for (const [id, r] of rooms) {
    assert.ok(Array.isArray(r.pos) && r.pos.length === 2 && r.pos.every(Number.isInteger), `${id}.pos는 정수 [x,y]`);
    assert.ok(Array.isArray(r.grid) && r.grid.length === ROWS, `${id}.grid는 ${ROWS}줄`);
    r.grid.forEach((row, i) => { assert.equal(row.length, COLS, `${id}.grid[${i}] 길이 ${row.length}`); assert.match(row, /^[.#\-H]+$/, `${id}.grid[${i}]에 허용되지 않은 문자`); });
  }
});

const open = (r, rr, cc) => r.grid[rr][cc] !== '#';
check('방 연결: 열린 가장자리마다 이웃 방이 있고 맞닿는 칸도 열림', () => {
  for (const [id, r] of rooms) {
    const [x, y] = r.pos;
    const sides = [
      ['right', [1, 0], (i) => [i, COLS - 1], (i) => [i, 0], ROWS],
      ['left', [-1, 0], (i) => [i, 0], (i) => [i, COLS - 1], ROWS],
      ['bottom', [0, 1], (i) => [ROWS - 1, i], (i) => [0, i], COLS],
      ['top', [0, -1], (i) => [0, i], (i) => [ROWS - 1, i], COLS]];
    for (const [side, [dx, dy], here, there, n] of sides) {
      for (let i = 0; i < n; i++) {
        const [hr, hc] = here(i);
        if (!open(r, hr, hc)) continue;
        const nid = byPos.get(String([x + dx, y + dy]));
        assert.ok(nid, `${id}의 ${side} 가장자리(${side === 'top' || side === 'bottom' ? i + '열' : i + '행'})가 열려 있는데 이웃 방이 없음`);
        const [tr, tc] = there(i);
        assert.ok(open(area.rooms[nid], tr, tc), `${id}의 ${side} 가장자리 ${i}가 열려 있는데 ${nid}의 맞닿는 칸은 막힘`);
      }
    }
  }
});

check('시작 위치: 방이 있고 Ethan 몸이 벽과 겹치지 않음', () => {
  const s = area.start; assert.ok(s && area.rooms[s.room], 'start.room 없음');
  const c = HK.CONFIG.heroes.ethan, g = area.rooms[s.room].grid;
  for (let r = Math.floor(s.y / T); r <= Math.floor((s.y + c.height - 0.01) / T); r++)
    for (let col = Math.floor(s.x / T); col <= Math.floor((s.x + c.width - 0.01) / T); col++)
      assert.notEqual(g[r] && g[r][col], '#', `시작 위치가 벽(${r}행 ${col}열)과 겹침`);
});

check('물건: 종류·id 유일·좌표·문 조건 참조가 올바름', () => {
  const types = ['door', 'switch', 'key', 'breakable', 'target'];
  const ids = new Set();
  for (const o of objects) {
    assert.ok(types.includes(o.type), `${o.room}: 알 수 없는 type ${o.type}`);
    assert.ok(typeof o.id === 'string' && !ids.has(o.id), `id 없음 또는 중복: ${o.id}`); ids.add(o.id);
    const w = o.w || 1, h = o.h || (o.type === 'target' ? 2 : 1);
    assert.ok(Number.isInteger(o.x) && Number.isInteger(o.y) && o.x >= 0 && o.y >= 0 && o.x + w <= COLS && o.y + h <= ROWS, `${o.id}: 좌표가 방 밖`);
    if (o.type === 'switch' && o.hero !== undefined) assert.ok(['ethan', 'noah'].includes(o.hero), `${o.id}.hero`);
    if (o.type === 'key') assert.ok(typeof o.name === 'string' && o.name, `${o.id}.name 필요`);
    if (o.type === 'target') assert.ok(o.hp > 0, `${o.id}.hp 필요`);
  }
  for (const d of objects.filter((o) => o.type === 'door')) {
    const k = d.open || {}; const keys = Object.keys(k);
    assert.equal(keys.length, 1, `${d.id}.open 조건은 하나`);
    if (k.switch) assert.ok(objects.some((o) => o.type === 'switch' && o.id === k.switch), `${d.id}: 스위치 ${k.switch} 없음`);
    else if (k.key) assert.ok(objects.filter((o) => o.type === 'key' && o.name === k.key).length >= objects.filter((o) => o.type === 'door' && o.open.key === k.key).length, `${d.id}: 열쇠 ${k.key}가 문 수보다 적음`);
    else if (k.cleared) assert.ok(Array.isArray(k.cleared) && k.cleared.length && k.cleared.every((id) => objects.some((o) => o.type === 'target' && o.id === id)), `${d.id}: cleared 표적이 없음`);
    else assert.fail(`${d.id}: 알 수 없는 open 조건 ${keys[0]}`);
  }
});

if (REQ) check('§7 필수 요소: 가로·세로 연결, 사다리, 한쪽 발판, 문 3종, 전용 장치 2종, 부서지는 벽', () => {
  const pos = new Set(rooms.map(([, r]) => String(r.pos)));
  const horiz = rooms.some(([, r]) => pos.has(String([r.pos[0] + 1, r.pos[1]])) && r.grid.some((row) => row[COLS - 1] !== '#'));
  const vert = rooms.some(([, r]) => pos.has(String([r.pos[0], r.pos[1] + 1])) && /[^#]/.test(r.grid[ROWS - 1]));
  const all = rooms.map(([, r]) => r.grid.join(''));
  const need = {
    '가로 연결': horiz, '세로 연결': vert,
    '사다리(H)': all.some((g) => g.includes('H')), '한쪽 발판(-)': all.some((g) => g.includes('-')),
    '스위치 문': objects.some((o) => o.type === 'door' && o.open.switch), '열쇠 문': objects.some((o) => o.type === 'door' && o.open.key),
    '표적 처치 문': objects.some((o) => o.type === 'door' && o.open.cleared),
    'Ethan 빛 장치': objects.some((o) => o.type === 'switch' && o.hero === 'ethan' && o.kind === 'light'),
    'Noah 높은 레버': objects.some((o) => o.type === 'switch' && o.hero === 'noah' && o.kind === 'lever'),
    '부서지는 벽': objects.some((o) => o.type === 'breakable')
  };
  const missing = Object.entries(need).filter(([, v]) => !v).map(([k]) => k);
  assert.deepEqual(missing, [], `빠진 요소: ${missing.join(', ')}`);
});

check('완주 기록 재생: 모든 방·스위치·문·벽·열쇠·표적을 해내고 시작 방으로 돌아옴(두 주인공 사용)', () => {
  assert.ok(fs.existsSync(WALK), `${WALK} 없음`);
  const walk = JSON.parse(fs.readFileSync(WALK, 'utf8'));
  assert.ok(['ethan', 'noah'].includes(walk.hero) && Array.isArray(walk.inputs), 'hero와 inputs 필요');
  const w = HK.createWorld({ area: JSON.parse(JSON.stringify(area)), hero: walk.hero });
  let ticks = 0, swaps = 0;
  for (const seg of walk.inputs) {
    const keys = (seg.keys || '').split(',').map((k) => k.trim()).filter(Boolean);
    for (const k of keys) assert.ok(INPUTS.includes(k), `알 수 없는 입력 ${k}`);
    assert.ok(Number.isInteger(seg.ticks) && seg.ticks > 0, 'ticks는 양의 정수');
    const held = Object.fromEntries(INPUTS.map((k) => [k, keys.includes(k)]));
    for (let i = 0; i < seg.ticks; i++) { swaps += HK.step(w, held).filter((e) => e.type === 'swap').length; ticks++; }
    assert.ok(ticks <= MAX_TICKS, `완주 기록이 ${MAX_TICKS}틱(10분)을 넘음`);
  }
  const f = HK.getFlags(w), map = HK.getMap(w), miss = [];
  for (const r of map.rooms) if (!r.visited) miss.push(`방 ${r.id}`);
  for (const o of objects) {
    if (o.type === 'switch' && !f.switches[o.id]) miss.push(`스위치 ${o.id}`);
    if (o.type === 'door' && !f.doors[o.id]) miss.push(`문 ${o.id}`);
    if (o.type === 'breakable' && !f.broken[o.id]) miss.push(`벽 ${o.id}`);
    if (o.type === 'key' && !f.picked[o.id]) miss.push(`열쇠 ${o.id}`);
  }
  for (const o of objects.filter((x) => x.type === 'target')) if (!(f.cleared || {})[o.id]) miss.push(`표적 ${o.id}`);
  assert.deepEqual(miss, [], `완주 후 남은 것: ${miss.join(', ')}`);
  assert.equal(w.roomId, area.start.room, `완주 후 시작 방(${area.start.room})이 아니라 ${w.roomId}에 있음`);
  assert.ok(swaps >= 1, '교대를 한 번도 하지 않음(두 주인공을 모두 써야 함)');
  console.log(`     (재생 ${ticks}틱 = ${(ticks / 60).toFixed(1)}초, 교대 ${swaps}회)`);
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
