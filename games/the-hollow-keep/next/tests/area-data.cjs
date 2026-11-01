#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 시범 구역 데이터·완주 인수 테스트
 * 규격: games/the-hollow-keep/docs/EXPLORATION_SPEC.md §2, §4, §6, §7
 *       games/the-hollow-keep/docs/EXPLORATION_REFINE_SPEC.md §3~§6 (출입문, 봉쇄물 모양, 방 밀도 D1~D6)
 * 실행: node games/the-hollow-keep/next/tests/area-data.cjs
 * 환경 변수: HK_AREA(구역 파일, 기본 next/areas/area1.json), HK_WALK(완주 기록, 기본 area1.walkthrough.json), HK_SIM
 *   HK_AREA_REQ=off  — 검사기 자체 검증용. §7 필수 요소·보완 §5 밀도·§6 출입문 개수 검사를 끈다(형식·연결·배치·모양·완주 검사는 그대로).
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
const size = (o) => ({ w: o.w || (o.type === 'entrance' ? 2 : 1), h: o.h || (o.type === 'target' ? 2 : o.type === 'entrance' ? 3 : 1) });
const rectHit = (a, b) => { const A = size(a), B = size(b); return a.x < b.x + B.w && b.x < a.x + A.w && a.y < b.y + B.h && b.y < a.y + A.h; };
// 열쇠를 쓰는 곳: 열쇠 봉쇄물 + 잠긴 출입문 짝(짝 양쪽이 잠겨 있어도 한 번만 연다)
const keyUses = (name) => objects.filter((o) => (o.type === 'door' && o.open && o.open.key === name)
  || (o.type === 'entrance' && o.lock && o.lock.key === name && !objects.some((t) => t.id === o.to && t.lock && t.id < o.id))).length;

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
  const types = ['door', 'switch', 'key', 'breakable', 'target', 'entrance'];
  const ids = new Set();
  for (const o of objects) {
    assert.ok(types.includes(o.type), `${o.room}: 알 수 없는 type ${o.type}`);
    assert.ok(typeof o.id === 'string' && !ids.has(o.id), `id 없음 또는 중복: ${o.id}`); ids.add(o.id);
    const { w, h } = size(o);
    assert.ok(Number.isInteger(o.x) && Number.isInteger(o.y) && o.x >= 0 && o.y >= 0 && o.x + w <= COLS && o.y + h <= ROWS, `${o.id}: 좌표가 방 밖`);
    if (o.type === 'switch' && o.hero !== undefined) assert.ok(['ethan', 'noah'].includes(o.hero), `${o.id}.hero`);
    if (o.type === 'switch') assert.ok(['lever', 'light'].includes(o.kind), `${o.id}.kind는 lever 또는 light(보완 §4)`);
    if (o.type === 'entrance') {
      const t = objects.find((x) => x.id === o.to);
      assert.ok(t && t.type === 'entrance' && t.to === o.id, `${o.id}.to의 짝 출입문이 없거나 서로 가리키지 않음`);
      if (o.lock) assert.ok(typeof o.lock.key === 'string' && o.lock.key && Object.keys(o.lock).length === 1, `${o.id}.lock은 {key}`);
    }
    if (o.type === 'key') assert.ok(typeof o.name === 'string' && o.name, `${o.id}.name 필요`);
    if (o.type === 'target') assert.ok(o.hp > 0, `${o.id}.hp 필요`);
  }
  for (const d of objects.filter((o) => o.type === 'door')) {
    const k = d.open || {}; const keys = Object.keys(k);
    assert.equal(keys.length, 1, `${d.id}.open 조건은 하나`);
    if (k.switch) assert.ok(objects.some((o) => o.type === 'switch' && o.id === k.switch), `${d.id}: 스위치 ${k.switch} 없음`);
    else if (k.key) assert.ok(objects.filter((o) => o.type === 'key' && o.name === k.key).length >= keyUses(k.key), `${d.id}: 열쇠 ${k.key}가 쓰는 곳 수보다 적음`);
    else if (k.cleared) assert.ok(Array.isArray(k.cleared) && k.cleared.length && k.cleared.every((id) => objects.some((o) => o.type === 'target' && o.id === id)), `${d.id}: cleared 표적이 없음`);
    else assert.fail(`${d.id}: 알 수 없는 open 조건 ${keys[0]}`);
  }
  for (const e of objects.filter((o) => o.type === 'entrance' && o.lock && o.lock.key)) {
    assert.ok(objects.filter((o) => o.type === 'key' && o.name === e.lock.key).length >= keyUses(e.lock.key), `${e.id}: 열쇠 ${e.lock.key}가 쓰는 곳 수보다 적음`);
  }
});

check('출입문 배치(보완 §6): 빈칸 위, 아래 행은 모두 바닥칸, 사다리·스위치·열쇠와 겹치지 않음', () => {
  for (const e of objects.filter((o) => o.type === 'entrance')) {
    const g = area.rooms[e.room].grid, { w, h } = size(e);
    for (let r = e.y; r < e.y + h; r++) for (let c = e.x; c < e.x + w; c++) {
      assert.ok(!'#H'.includes(g[r][c]), `${e.id}: ${r}행 ${c}열이 ${g[r][c]}`);
    }
    assert.ok(e.y + h < ROWS, `${e.id}: 아래 행이 방 밖`);
    for (let c = e.x; c < e.x + w; c++) assert.ok('#-'.includes(g[e.y + h][c]), `${e.id}: 아래 ${e.y + h}행 ${c}열이 바닥칸이 아님`);
    for (const o of objects.filter((x) => x.room === e.room && (x.type === 'switch' || x.type === 'key'))) {
      assert.ok(!rectHit(e, o), `${e.id}: ${o.id}와 겹침`);
    }
  }
});

check('봉쇄물 모양(보완 §4): 빈 통로를 차지하고 위아래 또는 좌우가 벽에 딱 맞음', () => {
  for (const d of objects.filter((o) => o.type === 'door')) {
    const g = area.rooms[d.room].grid, { w, h } = size(d), wall = (r, c) => r < 0 || r >= ROWS || c < 0 || c >= COLS || g[r][c] === '#';
    for (let r = d.y; r < d.y + h; r++) for (let c = d.x; c < d.x + w; c++) assert.notEqual(g[r][c], '#', `${d.id}: ${r}행 ${c}열이 이미 벽`);
    const cols = [...Array(w).keys()].map((i) => d.x + i), rows = [...Array(h).keys()].map((i) => d.y + i);
    const vertical = cols.every((c) => g[d.y - 1] && g[d.y - 1][c] === '#' && wall(d.y + h, c));
    const horizontal = rows.every((r) => g[r][d.x - 1] === '#' && g[r][d.x + w] === '#');
    assert.ok(vertical || horizontal, `${d.id}(${d.room} ${d.x},${d.y} ${w}×${h}): 위아래(${d.y - 1}행·${d.y + h}행)도 좌우(${d.x - 1}열·${d.x + w}열)도 벽에 딱 맞지 않음`);
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

// ── 보완 §5 밀도 (격자 기준) ──
const isFloor = (g, r, c) => r < ROWS && (g[r][c] === '#' || g[r][c] === '-');
function headroom(g, r, c) { let n = 0; while (r - n >= 0 && g[r - n][c] !== '#') n++; return n; } // r행부터 위로 빈칸 수
function standRuns(g) { // [{floor, c0, c1, heads:[...]}] 같은 바닥 행에서 설 곳(머리 공간 3칸 이상)이 이어진 구간
  const runs = [];
  for (let f = 1; f < ROWS; f++) {
    let cur = null;
    for (let c = 0; c <= COLS; c++) {
      const hr = c < COLS && isFloor(g, f, c) ? headroom(g, f - 1, c) : 0;
      if (hr >= 3) { if (!cur) cur = { floor: f, c0: c, heads: [] }; cur.heads.push(hr); cur.c1 = c; }
      else if (cur) { runs.push(cur); cur = null; }
    }
  }
  return runs;
}
const subRuns = (run, ok) => { const out = []; let n = 0; for (const h of run.heads) { if (ok(h)) n++; else { if (n) out.push(n); n = 0; } } if (n) out.push(n); return out; };
const metrics = rooms.map(([id, r]) => {
  const g = r.grid, empty = g.join('').split('').filter((ch) => ch !== '#').length / (COLS * ROWS);
  const runs = standRuns(g);
  const floors = new Set(runs.filter((x) => x.heads.length >= 3).map((x) => x.floor)).size;
  const corridor = runs.some((x) => subRuns(x, (h) => h >= 3 && h <= 4).some((n) => n >= 4));
  const tight = runs.reduce((a, x) => a + subRuns(x, (h) => h === 3).filter((n) => n >= 4).length, 0);
  const maxHead = Math.max(0, ...runs.flatMap((x) => x.heads));
  return { id, empty, floors, corridor, tight, maxHead };
});

// 칸 따라가기(4방향, 방 가장자리 넘어감, 출입문 짝 연결). closed(o)가 참인 물건 칸은 막힘.
function flood(startRoom, startCell, closed, link) {
  const blocked = new Set();
  for (const o of objects) if (closed(o)) { const { w, h } = size(o); for (let r = o.y; r < o.y + h; r++) for (let c = o.x; c < o.x + w; c++) blocked.add(`${o.room}:${r}:${c}`); }
  const seen = new Set(), q = [];
  const push = (rid, r, c) => { const k = `${rid}:${r}:${c}`; if (seen.has(k) || blocked.has(k) || area.rooms[rid].grid[r][c] === '#') return; seen.add(k); q.push([rid, r, c]); };
  push(startRoom, startCell[0], startCell[1]);
  while (q.length) {
    const [rid, r, c] = q.shift(), pos = area.rooms[rid].pos;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nr = r + dr, nc = c + dc, nid = rid;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
        nid = byPos.get(String([pos[0] + dc, pos[1] + dr])); if (!nid) continue;
        nr = (nr + ROWS) % ROWS; nc = (nc + COLS) % COLS;
      }
      push(nid, nr, nc);
    }
    for (const e of objects.filter((o) => o.type === 'entrance' && o.room === rid && link(o) && rectHit(e0(r, c), o))) {
      const t = objects.find((o) => o.id === e.to); push(t.room, t.y, t.x);
    }
  }
  return seen;
}
const e0 = (r, c) => ({ x: c, y: r, w: 1, h: 1 });
const reached = (seen, o) => { const { w, h } = size(o); for (let r = o.y; r < o.y + h; r++) for (let c = o.x; c < o.x + w; c++) if (seen.has(`${o.room}:${r}:${c}`)) return true; return false; };
const startCell = () => { const c = HK.CONFIG.heroes.ethan, s = area.start; return [Math.floor((s.y + c.height - 1) / T), Math.floor((s.x + c.width / 2) / T)]; };
const lockedEntrance = (o) => o.type === 'entrance' && (o.lock || (objects.find((t) => t.id === o.to) || {}).lock);

if (REQ) {
  check('보완 §6 출입문: 짝 2쌍 이상, 이웃하지 않은 방을 잇는 짝 1쌍 이상, 잠긴 출입문 1개 이상', () => {
    const ents = objects.filter((o) => o.type === 'entrance');
    assert.ok(ents.length >= 4, `출입문 ${ents.length}개(짝 ${ents.length / 2}쌍)`);
    const far = ents.some((e) => { const t = objects.find((o) => o.id === e.to), a = area.rooms[e.room].pos, b = area.rooms[t.room].pos; return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) >= 2; });
    assert.ok(far, '이웃하지 않은 방(위치 차이 2 이상)을 잇는 짝이 없음');
    assert.ok(ents.some((e) => e.lock), '잠긴 출입문이 없음');
  });
  check('보완 §5 D1 빈칸 비율: 방마다 0.70 이하, 구역 평균 0.60 이하', () => {
    const bad = metrics.filter((m) => m.empty > 0.70).map((m) => `${m.id} ${m.empty.toFixed(2)}`);
    const avg = metrics.reduce((a, m) => a + m.empty, 0) / metrics.length;
    assert.deepEqual(bad, [], `0.70 초과: ${bad.join(', ')}`);
    assert.ok(avg <= 0.60, `구역 평균 ${avg.toFixed(2)}`);
  });
  check('보완 §5 D2 층 수: 방의 75% 이상이 3층 이상', () => {
    const ok = metrics.filter((m) => m.floors >= 3).length, need = Math.ceil(metrics.length * 0.75);
    assert.ok(ok >= need, `3층 이상 ${ok}/${metrics.length}방(필요 ${need}) — ${metrics.map((m) => `${m.id}:${m.floors}`).join(' ')}`);
  });
  check('보완 §5 D3 통로: 방마다 기본 통로(머리 공간 3~4칸·가로 4칸), 좁은 통로 2곳, 높은 공간(5칸 3방·7칸 1방)', () => {
    const noCorr = metrics.filter((m) => !m.corridor).map((m) => m.id);
    assert.deepEqual(noCorr, [], `기본 통로가 없는 방: ${noCorr.join(', ')}`);
    const tight = metrics.reduce((a, m) => a + m.tight, 0);
    assert.ok(tight >= 2, `좁은 통로(머리 공간 3칸) ${tight}곳`);
    const h5 = metrics.filter((m) => m.maxHead >= 5).length, h7 = metrics.filter((m) => m.maxHead >= 7).length;
    assert.ok(h5 >= 3 && h7 >= 1, `머리 공간 5칸 이상 ${h5}방, 7칸 이상 ${h7}방`);
  });
  check('보완 §5 D4 막히지 않은 길: 모두 닫힌 채로 시작에서 3방 이상, 열린 곳 2개 이상인 방은 방 안에서 2곳이 이어짐', () => {
    const closedAll = (o) => o.type === 'door' || o.type === 'breakable';
    const seen = flood(area.start.room, startCell(), closedAll, (o) => !lockedEntrance(o));
    const rs = new Set([...seen].map((k) => k.split(':')[0]));
    assert.ok(rs.size >= 3, `닫힌 채로 갈 수 있는 방 ${rs.size}개(${[...rs].join(', ')})`);
    const bad = [];
    for (const [id, r] of rooms) {
      const g = r.grid, opens = [];
      const edge = (cells) => { let cur = null; for (const cell of cells) { if (g[cell[0]][cell[1]] !== '#') { if (!cur) opens.push(cur = []); cur.push(cell); } else cur = null; } };
      edge([...Array(ROWS).keys()].map((i) => [i, 0])); edge([...Array(ROWS).keys()].map((i) => [i, COLS - 1]));
      edge([...Array(COLS).keys()].map((i) => [0, i])); edge([...Array(COLS).keys()].map((i) => [ROWS - 1, i]));
      for (const e of objects.filter((o) => o.type === 'entrance' && o.room === id)) opens.push([[e.y + size(e).h - 1, e.x]]);
      if (opens.length < 2) continue;
      // 방 안만 따라가기: 이웃 방이 없는 것처럼 별도 계산
      const inRoom = (cell) => { const blocked = new Set(); for (const o of objects.filter((x) => x.room === id && closedAll(x))) { const { w, h } = size(o); for (let rr = o.y; rr < o.y + h; rr++) for (let cc = o.x; cc < o.x + w; cc++) blocked.add(`${rr}:${cc}`); }
        const s = new Set(), q = [cell]; if (blocked.has(cell.join(':'))) return s; s.add(cell.join(':'));
        while (q.length) { const [a, b] = q.shift(); for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + da, nb = b + db, k = `${na}:${nb}`; if (na < 0 || na >= ROWS || nb < 0 || nb >= COLS || g[na][nb] === '#' || blocked.has(k) || s.has(k)) continue; s.add(k); q.push([na, nb]); } }
        return s; };
      const linked = opens.some((o, i) => { const s = inRoom(o[0]); return opens.some((o2, j) => j !== i && o2.some((cell) => s.has(cell.join(':')))); });
      if (!linked) bad.push(id);
    }
    assert.deepEqual(bad, [], `봉쇄물 없이 지나가는 길이 하나도 없는 방: ${bad.join(', ')}`);
  });
  check('보완 §5 D5 숨은 곳: 부서지는 벽을 부숴야만 닿는 물건이 1개 이상', () => {
    const withWalls = flood(area.start.room, startCell(), (o) => o.type === 'breakable', () => true);
    const open = flood(area.start.room, startCell(), () => false, () => true);
    const hidden = objects.filter((o) => ['key', 'switch', 'entrance', 'target'].includes(o.type) && reached(open, o) && !reached(withWalls, o));
    assert.ok(hidden.length >= 1, '부서지는 벽 뒤에만 있는 물건이 없음');
  });
  check('보완 §5 D6 Noah 높은 레버: 높이만으로 Ethan은 못 닿고 Noah는 닿음, 근처 사다리 없음', () => {
    const E = HK.CONFIG.heroes.ethan, N = HK.CONFIG.heroes.noah;
    const levers = objects.filter((o) => o.type === 'switch' && o.hero === 'noah');
    assert.ok(levers.length >= 1, 'Noah 전용 레버 없음');
    for (const l of levers) {
      const g = area.rooms[l.room].grid, bottom = (l.y + 1) * T, spots = [];
      for (let f = 1; f < ROWS; f++) for (let c = 0; c < COLS; c++) {
        const top = isFloor(g, f, c) || (g[f][c] === 'H' && g[f - 1][c] !== 'H');
        if (top && g[f - 1][c] !== '#' && headroom(g, f - 1, c) >= 3) spots.push({ f, c });
      }
      const reach = (s, H) => s.f * T - H < bottom && s.f * T > bottom - T; // 서서 뛴 몸 범위 [바닥−H, 바닥]이 레버 칸과 겹침
      const ethan = spots.filter((s) => Math.abs(s.c - l.x) <= 5 && reach(s, E.height + E.jumpHeight));
      assert.deepEqual(ethan.map((s) => `${s.f}행 ${s.c}열`), [], `${l.id}: Ethan이 닿을 수 있는 설 곳`);
      assert.ok(spots.some((s) => Math.abs(s.c - l.x) <= 1 && reach(s, N.height + N.jumpHeight - 4)), `${l.id}: Noah가 닿는 설 곳(가로 1칸 이내)이 없음`);
      for (let c = l.x - 1; c <= l.x + 1; c++) for (let r = 0; r <= Math.min(ROWS - 1, l.y + 3); r++) assert.notEqual(g[r] && g[r][c], 'H', `${l.id}: ${r}행 ${c}열 사다리가 너무 가까움`);
    }
  });
}

check('완주 기록 재생: 모든 방·스위치·문·벽·열쇠·표적·출입문 짝을 해내고 시작 방으로 돌아옴(두 주인공 사용)', () => {
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
  for (const o of objects.filter((x) => x.type === 'entrance')) {
    if (!(f.entered || {})[o.id] && !(f.entered || {})[o.to]) miss.push(`출입문 짝 ${o.id}`);
    if (o.lock && !(f.unlocked || {})[o.id]) miss.push(`잠긴 출입문 ${o.id}`);
  }
  assert.deepEqual(miss, [], `완주 후 남은 것: ${miss.join(', ')}`);
  assert.equal(w.roomId, area.start.room, `완주 후 시작 방(${area.start.room})이 아니라 ${w.roomId}에 있음`);
  assert.ok(swaps >= 1, '교대를 한 번도 하지 않음(두 주인공을 모두 써야 함)');
  console.log(`     (재생 ${ticks}틱 = ${(ticks / 60).toFixed(1)}초, 교대 ${swaps}회)`);
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
