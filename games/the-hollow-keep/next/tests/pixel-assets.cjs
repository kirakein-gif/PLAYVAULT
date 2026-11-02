#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 픽셀아트 HD 자산 인수 테스트
 * 규격: games/the-hollow-keep/docs/ART_DIRECTION.md §4
 *
 * 실행: node games/the-hollow-keep/next/tests/pixel-assets.cjs
 * 환경 변수: HK_ART_DIR(자산 폴더, 기본 next/assets/pixel), CHROMIUM_PATH
 *   HK_ART_REQUIRE  시험본 모드. 예: "ethan:idle,run;noah:idle" — 적힌 동작만 필수로 검사하고 타일·배경은 건너뜀
 * 그림 밀도: manifest.scale(1 또는 2, 기본 1) = 게임 1단위당 그림 픽셀 수. 타일·배경·몸 높이 기준이 scale배가 됨
 * HTTP 서버가 필요 없다. PNG는 Chromium으로 색 변환 없이 해석한다.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const NEXT = path.join(__dirname, '..');
const DIR = path.resolve(process.env.HK_ART_DIR || path.join(NEXT, 'assets', 'pixel'));
const SIM = require(path.join(NEXT, 'sim.js'));
const BASE_TILE = 30;
let SCALE = 1, TILE = BASE_TILE;
const MAX_COLORS = 64;
const FULL = { idle: 4, run: 6, 'jump-standing': 3, 'jump-running': 3, land: 2, attack: 4, climb: 4 }; // climb: LADDER_ACTIONS_SPEC §3
const TRIAL = process.env.HK_ART_REQUIRE || '';
const REQUIRE_BY_HERO = { ethan: FULL, noah: FULL };
if (TRIAL) {
  for (const h of Object.keys(REQUIRE_BY_HERO)) REQUIRE_BY_HERO[h] = {};
  for (const part of TRIAL.split(';').filter(Boolean)) {
    const [h, list] = part.split(':');
    REQUIRE_BY_HERO[h.trim()] = Object.fromEntries(list.split(',').map((n) => n.trim()).filter((n) => n in FULL).map((n) => [n, FULL[n]]));
  }
}
const REQUIRED = FULL; // 시트 분석 대상 이름 목록
const OPTIONAL_FX = { 'fx-rune': 2, 'fx-slash': 3 };
const GROUNDED = ['idle', 'run', 'land'];
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const results = [];
function check(name, fn) {
  try { fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (e) { results.push(false); console.log(`FAIL ${name}\n     ${String(e.message).split('\n')[0]}`); }
}
const isInt = (v) => Number.isInteger(v) && v > 0;

// 브라우저 안에서 이미지 한 장을 분석한다(픽셀 배열 대신 요약만 돌려받음).
async function analyze(page, file, opts) {
  const b64 = fs.readFileSync(file).toString('base64');
  return page.evaluate(async ({ b64, opts }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const W = bmp.width, H = bmp.height;
    const cv = new OffscreenCanvas(W, H);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, W, H, { colorSpace: 'srgb' }).data;
    const pal = new Set(opts.palette);
    let alphaMid = 0, off = 0; const offSample = [];
    const hex = (i) => '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a !== 0 && a !== 255) alphaMid++;
      if (a === 255 && !pal.has(hex(i))) { off++; if (offSample.length < 3) offSample.push(hex(i)); }
    }
    // 정렬된 k×k 블록이 전부 같은 색이면 확대 저장된 이미지로 본다.
    const upscaled = [2, 3].filter((k) => {
      if (W % k || H % k) return false;
      let opaque = 0;
      for (let y = 0; y < H; y += k) for (let x = 0; x < W; x += k) {
        const b = (y * W + x) * 4;
        for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) {
          const j = ((y + dy) * W + (x + dx)) * 4;
          if (d[j] !== d[b] || d[j + 1] !== d[b + 1] || d[j + 2] !== d[b + 2] || d[j + 3] !== d[b + 3]) return false;
        }
        if (d[b + 3]) opaque++;
      }
      return opaque > 0;
    });
    const boxes = [];
    if (opts.frameW) {
      const n = Math.floor(W / opts.frameW);
      for (let f = 0; f < n; f++) {
        let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
        for (let y = 0; y < Math.min(H, opts.frameH); y++) for (let x = 0; x < opts.frameW; x++) {
          if (d[(y * W + f * opts.frameW + x) * 4 + 3]) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        }
        boxes.push(maxX < 0 ? null : { minX, minY, maxX, maxY });
      }
    }
    const cells = {}, cellLum = {};
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    for (const [name, [cx, cy]] of Object.entries(opts.cells || {})) {
      const rowOpaque = [], rowLum = []; let sum = 0, n = 0;
      for (let y = 0; y < opts.tile; y++) {
        let c = 0, ls = 0;
        for (let x = 0; x < opts.tile; x++) {
          const X = cx * opts.tile + x, Y = cy * opts.tile + y, i = (Y * W + X) * 4;
          if (X < W && Y < H && d[i + 3]) { c++; const l = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]); ls += l; sum += l; n++; }
        }
        rowOpaque.push(c); rowLum.push(c ? ls / c : null);
      }
      cells[name] = rowOpaque; cellLum[name] = { mean: n ? sum / n : null, rows: rowLum };
    }
    // 프레임별 무게중심 x(불투명 픽셀 평균)와 맨 위 6줄의 x 중심(올린 손 위치) — 오르기 자세 검사용
    const frameStats = [];
    if (opts.frameW) {
      for (let f = 0; f < Math.floor(W / opts.frameW); f++) {
        let sx = 0, n = 0, top = -1;
        for (let y = 0; y < Math.min(H, opts.frameH); y++) for (let x = 0; x < opts.frameW; x++) {
          if (d[(y * W + f * opts.frameW + x) * 4 + 3]) { sx += x; n++; if (top < 0) top = y; }
        }
        let tx = 0, tn = 0;
        if (top >= 0) for (let y = top; y < Math.min(top + 6, H); y++) for (let x = 0; x < opts.frameW; x++) if (d[(y * W + f * opts.frameW + x) * 4 + 3]) { tx += x; tn++; }
        frameStats.push({ massX: n ? sx / n : null, topX: tn ? tx / tn : null });
      }
    }
    let h = 0; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) >>> 0;
    const frameHashes = [];
    if (opts.frameW) {
      for (let f = 0; f < Math.floor(W / opts.frameW); f++) {
        let fh = 0;
        for (let y = 0; y < Math.min(H, opts.frameH); y++) for (let x = 0; x < opts.frameW; x++) {
          const i = (y * W + f * opts.frameW + x) * 4;
          fh = (fh * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13 + d[i + 3] * 17) >>> 0;
        }
        frameHashes.push(fh);
      }
    }
    // 프레임별로 '큰 덩어리(8방향 연결, opts.minPart 픽셀 이상)' 수를 센다 — 베기 효과가 한 획인지 확인용
    const parts = [];
    if (opts.frameW && opts.minPart) {
      for (let f = 0; f < Math.floor(W / opts.frameW); f++) {
        const fw = opts.frameW, fh = Math.min(H, opts.frameH), seen = new Uint8Array(fw * fh);
        const op = (x, y) => d[(y * W + f * fw + x) * 4 + 3] !== 0;
        let big = 0;
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
          if (seen[y * fw + x] || !op(x, y)) continue;
          let n = 0; const st = [[x, y]]; seen[y * fw + x] = 1;
          while (st.length) {
            const [cx, cy] = st.pop(); n++;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx, ny = cy + dy;
              if (nx < 0 || ny < 0 || nx >= fw || ny >= fh || seen[ny * fw + nx] || !op(nx, ny)) continue;
              seen[ny * fw + nx] = 1; st.push([nx, ny]);
            }
          }
          if (n >= opts.minPart) big++;
        }
        parts.push(big);
      }
    }
    return { W, H, alphaMid, off, offSample, upscaled, boxes, cells, cellLum, hash: h, frameHashes, parts, frameStats };
  }, { b64, opts });
}

(async () => {
  // ── 매니페스트·팔레트 ──
  let manifest = null, palette = null;
  check('manifest.json이 있고 형식이 맞음(version 1, scale 1|2, tileSize 30×scale)', () => {
    const p = path.join(DIR, 'manifest.json');
    assert.ok(fs.existsSync(p), `${p} 없음`);
    manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(manifest.version, 1, 'version은 1');
    SCALE = manifest.scale === undefined ? 1 : manifest.scale;
    assert.ok(SCALE === 1 || SCALE === 2, `scale은 1 또는 2(현재 ${manifest.scale})`);
    TILE = BASE_TILE * SCALE;
    assert.equal(manifest.tileSize, TILE, `tileSize는 ${TILE}(30×scale)`);
  });
  if (TRIAL) console.log(`(시험본 모드: ${TRIAL} — 타일·배경 검사 생략)`);
  if (!manifest) { console.log(`\n0/${results.length} passed`); process.exit(1); }
  check(`palette.json: 1~${MAX_COLORS}색, #rrggbb, 중복 없음`, () => {
    const p = path.join(DIR, manifest.palette || 'palette.json');
    assert.ok(fs.existsSync(p), `${p} 없음`);
    const colors = JSON.parse(fs.readFileSync(p, 'utf8')).colors;
    assert.ok(Array.isArray(colors) && colors.length >= 1 && colors.length <= MAX_COLORS, `색 수 ${colors && colors.length}`);
    for (const c of colors) assert.match(c, /^#[0-9a-f]{6}$/, `색 형식(소문자 #rrggbb): ${c}`);
    assert.equal(new Set(colors).size, colors.length, '중복 색');
    palette = colors;
  });
  if (!palette) palette = [];

  const heroes = manifest.heroes || {};
  const HEROES = Object.keys(REQUIRE_BY_HERO).filter((h) => Object.keys(REQUIRE_BY_HERO[h]).length);
  for (const hero of HEROES) {
    check(`${hero}: body가 sim.js CONFIG와 같음`, () => {
      const h = heroes[hero]; assert.ok(h, `heroes.${hero} 없음`);
      const c = SIM.CONFIG.heroes[hero];
      assert.deepEqual(h.body, { w: c.width, h: c.height }, `body ${JSON.stringify(h.body)} ≠ CONFIG ${c.width}×${c.height}`);
    });
    check(`${hero}: 필수 동작과 최소 프레임 수, 기준점·시간 형식`, () => {
      const anims = (heroes[hero] || {}).animations || {};
      for (const [name, min] of Object.entries(REQUIRE_BY_HERO[hero])) {
        const a = anims[name]; assert.ok(a, `${name} 없음`);
        assert.ok(isInt(a.frames) && a.frames >= min, `${name} 프레임 ${a.frames} < ${min}`);
        assert.ok(isInt(a.frameW) && isInt(a.frameH), `${name} frameW/frameH`);
        assert.ok(a.pivot && Number.isInteger(a.pivot.x) && Number.isInteger(a.pivot.y) && a.pivot.x >= 0 && a.pivot.x < a.frameW && a.pivot.y >= 0 && a.pivot.y < a.frameH, `${name} pivot이 프레임 밖`);
        if (!name.startsWith('jump-') || a.ticks !== undefined) {
          assert.ok(Array.isArray(a.ticks) && a.ticks.length === a.frames && a.ticks.every(isInt), `${name} ticks는 프레임 수만큼의 양의 정수`);
        }
        if (name === 'idle' || name === 'run' || name === 'climb') assert.equal(a.loop, true, `${name}.loop는 true`);
        if (name === 'attack') assert.ok(a.ticks[0] <= 2, `attack 첫(준비) 프레임 ${a.ticks[0]}틱 > 2틱 — 판정은 누르는 즉시 생기므로 휘두르기 전에 피해가 먼저 보임`);
        assert.ok(/\.png$/i.test(a.file || ''), `${name} 파일은 .png`);
      }
    });
  }

  // ── 이미지 분석 ──
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const page = await browser.newPage();
  await page.setContent('<!doctype html><title>pixel</title>');
  const sheets = [];
  for (const hero of HEROES) {
    const anims = (heroes[hero] || {}).animations || {};
    for (const [name, a] of Object.entries(anims)) {
      if (!(name in REQUIRED) && !(name in OPTIONAL_FX)) continue;
      sheets.push({ label: `${hero}/${name}`, hero, name, a });
    }
  }
  const results2 = {};
  try {
    for (const s of sheets) {
      const file = path.join(DIR, s.a.file || '');
      check(`${s.label}: PNG 파일·크기(frameW×프레임 수, frameH)`, () => {
        assert.ok(fs.existsSync(file), `${s.a.file} 없음`);
        assert.ok(fs.readFileSync(file).subarray(0, 8).equals(PNG_SIG), '실제 PNG가 아님');
      });
      if (!fs.existsSync(file) || !fs.readFileSync(file).subarray(0, 8).equals(PNG_SIG)) continue;
      let r;
      try { r = await analyze(page, file, { palette, frameW: s.a.frameW, frameH: s.a.frameH, minPart: s.name === 'fx-slash' ? 6 : 0 }); }
      catch (e) { check(`${s.label}: 이미지 해석`, () => assert.fail(`해석 실패: ${e.message.split('\n')[0]}`)); continue; }
      results2[s.label] = r;
      check(`${s.label}: 크기·투명도 0/255·팔레트·원래 해상도·빈 프레임 없음`, () => {
        assert.equal(r.W, s.a.frameW * s.a.frames, `폭 ${r.W} ≠ ${s.a.frameW}×${s.a.frames}`);
        assert.equal(r.H, s.a.frameH, `높이 ${r.H} ≠ ${s.a.frameH}`);
        assert.equal(r.alphaMid, 0, `중간 투명도 픽셀 ${r.alphaMid}개`);
        assert.equal(r.off, 0, `팔레트 밖 색 ${r.off}픽셀 (예: ${r.offSample.join(', ')})`);
        assert.deepEqual(r.upscaled, [], `${r.upscaled.join('/')}배 확대 저장된 이미지로 보임`);
        const empty = r.boxes.findIndex((b) => !b);
        assert.equal(empty, -1, `${empty}번 프레임이 비어 있음`);
        if (s.name in OPTIONAL_FX) assert.ok(s.a.frames >= OPTIONAL_FX[s.name], `${s.name} 프레임 ${s.a.frames} < ${OPTIONAL_FX[s.name]}`);
      });
      if (s.name in OPTIONAL_FX) {
        const once = s.name === 'fx-slash'; // 베기는 한 번, 날아가는 룬탄은 반복 허용
        check(`${s.label}: 이웃 프레임 그림이 다름${once ? '·한 번만 재생(loop가 true가 아님)·프레임마다 한 획' : ''}`, () => {
          if (once) assert.notEqual(s.a.loop, true, `${s.name}.loop가 true(같은 효과가 반복 재생됨)`);
          if (once) r.parts.forEach((n, i) => assert.equal(n, 1, `${i}번 프레임이 한 획이 아님: 6픽셀 이상 덩어리 ${n}개(떨어진 평행선·조각은 두 줄로 보임)`));
          r.frameHashes.forEach((hsh, i) => { if (i) assert.notEqual(hsh, r.frameHashes[i - 1], `${i - 1}·${i}번 프레임이 같은 그림`); });
        });
      }
      if (s.name === 'climb') {
        check(`${s.label}: 이웃 프레임 그림이 다름(손발이 번갈아 움직이는 오르기 동작)`, () => {
          r.frameHashes.forEach((hsh, i) => { if (i) assert.notEqual(hsh, r.frameHashes[i - 1], `${i - 1}·${i}번 프레임이 같은 그림`); });
          assert.notEqual(r.frameHashes[0], r.frameHashes[r.frameHashes.length - 1], '첫·마지막 프레임이 같아 반복할 때 멈춰 보임');
        });
        check(`${s.label}: 사다리 가운데에 매달린 자세(LADDER_ACTIONS_SPEC §3-1) — 무게중심 ±2단위, 올린 손이 사다리 폭 안`, () => {
          const px = s.a.pivot.x, bad = [];
          r.frameStats.forEach((f, i) => {
            const dm = f.massX - px, dt = f.topX - px;
            if (Math.abs(dm) > 2 * SCALE) bad.push(`${i}번 무게중심 ${dm >= 0 ? '+' : ''}${(dm / SCALE).toFixed(1)}단위`);
            if (Math.abs(dt) > 12 * SCALE) bad.push(`${i}번 올린 손 ${dt >= 0 ? '+' : ''}${(dt / SCALE).toFixed(1)}단위(사다리 가로대 끝 ±10단위 + 여유 2)`);
          });
          assert.deepEqual(bad, [], `몸이 사다리 옆으로 쏠림: ${bad.join(', ')}`);
        });
      }
      if (GROUNDED.includes(s.name)) {
        check(`${s.label}: 모든 프레임의 발이 기준선(pivot.y-2 ~ pivot.y)에 있음`, () => {
          r.boxes.forEach((b, i) => {
            assert.ok(b && b.maxY >= s.a.pivot.y - 2 && b.maxY <= s.a.pivot.y, `${i}번 프레임 발 위치 y=${b && b.maxY}, 기준 ${s.a.pivot.y}`);
          });
        });
      }
      if (s.name === 'idle') {
        check(`${s.label}: 몸 크기가 판정 상자와 맞음(높이 ±15%, 가로 중심)`, () => {
          const c = SIM.CONFIG.heroes[s.hero], b = r.boxes[0];
          const h = b.maxY - b.minY + 1;
          const H = c.height * SCALE, Wd = c.width * SCALE;
          assert.ok(Math.abs(h - H) <= H * 0.15, `idle 높이 ${h}px, 판정 ${c.height}×scale ${SCALE} = ${H}px`);
          const cx = (b.minX + b.maxX) / 2;
          assert.ok(Math.abs(cx - s.a.pivot.x) <= Wd / 2, `몸 가로 중심 ${cx}가 pivot.x ${s.a.pivot.x}에서 ${Wd / 2}px 넘게 벗어남`);
        });
      }
    }
    for (const hero of HEROES.filter((h) => 'jump-running' in REQUIRE_BY_HERO[h] || 'jump-standing' in REQUIRE_BY_HERO[h])) {
      check(`${hero}: jump-running 그림이 jump-standing과 다름`, () => {
        const a = results2[`${hero}/jump-running`], b = results2[`${hero}/jump-standing`];
        assert.ok(a && b, '두 시트가 모두 있어야 함');
        assert.ok(a.W !== b.W || a.H !== b.H || a.hash !== b.hash, '두 점프 시트가 픽셀까지 같음');
      });
    }

    // ── 타일셋 (시험본 모드에서는 생략) ──
    const t = TRIAL ? {} : (manifest.tiles || {});
    if (!TRIAL) {
    const tfile = path.join(DIR, t.file || 'tiles.png');
    check('tiles: PNG 파일과 필수 칸(floor-top, wall-fill, ledge, ladder — EXPLORATION_SPEC §8)', () => {
      assert.ok(fs.existsSync(tfile), `${t.file || 'tiles.png'} 없음`);
      assert.ok(fs.readFileSync(tfile).subarray(0, 8).equals(PNG_SIG), '실제 PNG가 아님');
      for (const n of ['floor-top', 'wall-fill', 'ledge', 'ladder']) assert.ok(Array.isArray((t.cells || {})[n]) && t.cells[n].length === 2, `cells.${n} [열, 행] 필요`);
    });
    let tr = null;
    if (fs.existsSync(tfile) && t.cells && fs.readFileSync(tfile).subarray(0, 8).equals(PNG_SIG)) {
      try { tr = await analyze(page, tfile, { palette, cells: t.cells, tile: TILE }); }
      catch (e) { check('tiles: 이미지 해석', () => assert.fail(`해석 실패: ${e.message.split('\n')[0]}`)); }
    }
    if (tr) {
      const r = tr;
      check('tiles: 30의 배수 크기·투명도·팔레트·원래 해상도', () => {
        assert.ok(r.W % TILE === 0 && r.H % TILE === 0, `크기 ${r.W}×${r.H}`);
        for (const [n, [cx, cy]] of Object.entries(t.cells)) assert.ok((cx + 1) * TILE <= r.W && (cy + 1) * TILE <= r.H, `cells.${n}가 이미지 밖`);
        assert.equal(r.alphaMid, 0, `중간 투명도 ${r.alphaMid}`);
        assert.equal(r.off, 0, `팔레트 밖 색 ${r.off} (예: ${r.offSample.join(', ')})`);
        assert.deepEqual(r.upscaled, [], '확대 저장된 이미지로 보임');
      });
      const MOSAIC = ['back-1', 'back-2', 'back-3', 'wall-fill-2', 'wall-bottom', 'wall-left', 'wall-right',
        'window-top', 'window-mid', 'window-bottom', 'pillar-top', 'pillar-mid', 'pillar-base', 'banner-top', 'banner-mid', 'banner-bottom', 'candle'];
      check(`tiles: 모자이크 조각 ${MOSAIC.length}종(TILE_MOSAIC_SPEC §3)이 있고 뒷벽·벽 조각은 꽉 참`, () => {
        const missing = MOSAIC.filter((n) => !(Array.isArray(t.cells[n]) && t.cells[n].length === 2));
        assert.deepEqual(missing, [], `빠진 조각: ${missing.join(', ')}`);
        const full = (rows) => rows && rows.every((c) => c === TILE);
        const holes = ['back-1', 'back-2', 'back-3', 'wall-fill-2', 'wall-bottom', 'wall-left', 'wall-right'].filter((n) => !full(r.cells[n]));
        assert.deepEqual(holes, [], `투명 픽셀이 있는 조각(이어 붙이면 구멍): ${holes.join(', ')}`);
        const dup = new Set(['back-1', 'back-2', 'back-3'].map((n) => String(t.cells[n])));
        assert.equal(dup.size, 3, 'back-1~3이 같은 칸을 가리킴(변형이 아님)');
      });
      check('tiles: 사다리가 사다리로 읽힘(모자이크 §7) — 가로대 2~4개·두께 2단위 이상·이음새 포함 같은 간격, 뒷벽 대비 3:1 이상', () => {
        const rows = r.cells.ladder, lum = r.cellLum.ladder;
        assert.ok(rows && lum, 'ladder 칸 없음');
        const max = Math.max(...rows), rung = rows.map((c) => c > 0 && c >= 0.8 * max);
        const groups = []; let cur = null;
        rung.forEach((v, y) => { if (v) { if (!cur) groups.push(cur = { y0: y, n: 0, lum: 0 }); cur.n++; cur.lum += lum.rows[y]; } else cur = null; });
        // 칸 위아래 끝에 걸친 가로대는 이어 붙이면 하나이므로 합친다
        if (groups.length > 1 && groups[0].y0 === 0 && rung[TILE - 1]) { const last = groups.pop(); groups[0].n += last.n; groups[0].lum += last.lum; }
        assert.ok(groups.length >= 2 && groups.length <= 4, `가로대 ${groups.length}개(2~4개 필요, 가는 줄이 촘촘하면 세로줄 두 개처럼 보임)`);
        const starts = groups.map((g) => g.y0).sort((a2, b2) => a2 - b2);
        const gaps = starts.map((y, i) => ((starts[(i + 1) % starts.length] - y) + TILE) % TILE || TILE);
        assert.ok(Math.max(...gaps) - Math.min(...gaps) <= 1, `가로대 간격 ${gaps.join('·')}px — 칸을 이어 붙이면 이음새에서 간격이 달라 보임(모두 같아야 함)`);
        const thin = groups.filter((g) => g.n < 2 * SCALE).map((g) => g.n);
        assert.deepEqual(thin, [], `가로대 두께 ${thin.join(', ')}px (최소 ${2 * SCALE}px)`);
        const backs = ['back-1', 'back-2', 'back-3'].map((n) => r.cellLum[n] && r.cellLum[n].mean).filter((v) => v !== null && v !== undefined);
        assert.ok(backs.length, '뒷벽 조각(back-1~3)이 없어 대비를 잴 수 없음');
        const back = backs.reduce((a, v) => a + v, 0) / backs.length;
        const rungLum = groups.reduce((a, g) => a + g.lum, 0) / groups.reduce((a, g) => a + g.n, 0);
        const ratio = (Math.max(rungLum, back) + 0.05) / (Math.min(rungLum, back) + 0.05);
        assert.ok(ratio >= 3, `가로대와 뒷벽의 밝기 대비 ${ratio.toFixed(2)}:1 (3:1 이상 필요)`);
      });
      check('tiles: wall-fill은 꽉 참, floor-top은 아랫줄이 꽉 참, ledge는 위 16px만', () => {
        const full = (rows) => rows.every((c) => c === TILE);
        assert.ok(full(r.cells['wall-fill']), 'wall-fill에 투명 픽셀이 있음(이어 붙이면 구멍)');
        assert.equal(r.cells['floor-top'][TILE - 1], TILE, 'floor-top 아랫줄이 꽉 차야 wall-fill과 이어짐');
        const ledge = r.cells.ledge;
        assert.ok(ledge[0] > 0, 'ledge 맨 윗줄이 비어 있음');
        assert.ok(ledge.slice(16 * SCALE).every((c) => c === 0), `ledge는 위 ${16 * SCALE}px 아래가 투명해야 함(발판 두께 16×scale)`);
      });
    }
    }

    // ── 배경(선택) ──
    for (const f of !TRIAL && fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((n) => /^bg-.*\.png$/.test(n)) : []) {
      let r;
      try { r = await analyze(page, path.join(DIR, f), { palette }); }
      catch (e) { check(`${f}: 이미지 해석`, () => assert.fail(`해석 실패: ${e.message.split('\n')[0]}`)); continue; }
      check(`${f}: (960×540)×scale·투명도·팔레트·원래 해상도`, () => {
        assert.ok(r.W === 960 * SCALE && r.H === 540 * SCALE, `크기 ${r.W}×${r.H}, 기준 ${960 * SCALE}×${540 * SCALE}`);
        assert.equal(r.alphaMid, 0); assert.equal(r.off, 0, `팔레트 밖 색 ${r.off}`);
        assert.deepEqual(r.upscaled, [], '확대 저장된 이미지로 보임');
      });
    }

    // ── 탐험 물건 그림 (EXPLORATION_SPEC §8 → EXPLORATION_REFINE_SPEC §7, 시험본 모드에서는 생략) ──
    if (!TRIAL) {
      const OBJ = ['barrier-v', 'barrier-h', 'mark-key', 'mark-lever', 'mark-light', 'mark-target', 'entrance', 'entrance-locked',
        'lever-off', 'lever-on', 'light-off', 'light-on', 'key', 'breakable'];
      const objs = manifest.objects || {};
      check(`objects: 필수 그림 ${OBJ.length}종이 manifest에 있음`, () => {
        const missing = OBJ.filter((n) => !objs[n]);
        assert.deepEqual(missing, [], `빠진 그림: ${missing.join(', ')}`);
        for (const n of OBJ) { const o = objs[n]; assert.ok(/\.png$/i.test(o.file || '') && [o.x, o.y].every(Number.isInteger) && isInt(o.w) && isInt(o.h), `${n}: file(.png)·x·y·w·h 필요`); }
      });
      check('objects: 봉쇄물 한 칸·출입문 2×3칸·기호 크기(보완 §4·§7)', () => {
        const cell = 30 * SCALE, bad = [];
        for (const n of ['barrier-v', 'barrier-h']) if (objs[n] && (objs[n].w !== cell || objs[n].h !== cell)) bad.push(`${n} ${objs[n].w}×${objs[n].h} (기준 ${cell}×${cell})`);
        for (const n of ['entrance', 'entrance-locked']) if (objs[n] && (objs[n].w !== 2 * cell || objs[n].h !== 3 * cell)) bad.push(`${n} ${objs[n].w}×${objs[n].h} (기준 ${2 * cell}×${3 * cell})`);
        for (const n of ['mark-key', 'mark-lever', 'mark-light', 'mark-target']) if (objs[n] && (objs[n].w > cell || objs[n].h > cell)) bad.push(`${n} ${objs[n].w}×${objs[n].h} (최대 ${cell}×${cell})`);
        assert.deepEqual(bad, [], bad.join(', '));
      });
      for (const file of [...new Set(OBJ.filter((n) => objs[n]).map((n) => objs[n].file))]) {
        const fp = path.join(DIR, file);
        if (!fs.existsSync(fp) || !fs.readFileSync(fp).subarray(0, 8).equals(PNG_SIG)) { check(`objects ${file}: PNG 파일`, () => assert.fail(`${file} 없음 또는 PNG 아님`)); continue; }
        let r;
        try { r = await analyze(page, fp, { palette }); } catch (e) { check(`objects ${file}: 이미지 해석`, () => assert.fail(e.message.split('\n')[0])); continue; }
        check(`objects ${file}: 투명도 0/255·팔레트·원래 해상도·영역이 이미지 안`, () => {
          assert.equal(r.alphaMid, 0, `중간 투명도 ${r.alphaMid}`);
          assert.equal(r.off, 0, `팔레트 밖 색 ${r.off} (예: ${r.offSample.join(', ')})`);
          assert.deepEqual(r.upscaled, [], '확대 저장된 이미지로 보임');
          for (const n of OBJ.filter((k) => objs[k] && objs[k].file === file)) { const o = objs[n]; assert.ok(o.x >= 0 && o.y >= 0 && o.x + o.w <= r.W && o.y + o.h <= r.H, `${n} 영역이 이미지 밖`); }
        });
      }
    }

    check('PROVENANCE.md(도구·지시문·손질 기록)가 있음', () => {
      const p = path.join(DIR, 'PROVENANCE.md');
      assert.ok(fs.existsSync(p), 'PROVENANCE.md 없음');
      assert.ok(fs.readFileSync(p, 'utf8').trim().length > 200, 'PROVENANCE.md 내용이 너무 짧음');
    });
  } finally { await browser.close(); }

  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
