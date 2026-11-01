#!/usr/bin/env node
/*
 * THE HOLLOW KEEP · 모바일 가로 화면 배치 인수 테스트
 * 규격: games/the-hollow-keep/docs/FOUNDATION_SPEC.md §7-1
 *
 * 실행(저장소 루트에서 HTTP 서버를 켠 뒤):
 *   python3 -m http.server 8765 --bind 127.0.0.1
 *   node games/the-hollow-keep/next/tests/mobile-layout.cjs
 * 환경 변수: HK_URL(페이지 주소), CHROMIUM_PATH(브라우저 경로, 없으면 Playwright 기본값)
 *
 * 실제 휴대전화는 브라우저 주소창·상태바가 세로 공간을 차지하므로
 * 844×390보다 낮은 화면(740×320, 780×330)도 함께 검사한다.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
const VIEWPORTS = [[740, 320], [780, 330], [844, 390], [915, 412]];
const SIDE = 72;          // 좌우 조작 영역으로 남겨 둘 최소 폭(CSS px)
const MIN_RATIO = 0.9;    // 달성 가능한 최대 캔버스 크기 대비 최소 비율
const MIN_TOUCH = 44;     // 버튼 최소 크기(CSS px)

const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...launch });
  const results = [];
  try {
    for (const [vw, vh] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
      const page = await ctx.newPage();
      await page.goto(URL);
      await page.waitForFunction(() => window.HKSim && document.querySelector('canvas'));
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
        const se = document.scrollingElement;
        return {
          canvas: rect(document.querySelector('canvas')),
          buttons: [...document.querySelectorAll('[data-action]')].map((b) => ({ action: b.dataset.action, ...rect(b), visible: b.offsetParent !== null })),
          move: [...document.querySelectorAll('[data-control="move"]')].map((b) => ({ action: 'move', ...rect(b), visible: b.offsetParent !== null })),
          tools: ['reset', 'debug-toggle'].map((id) => { const el = document.getElementById(id); return el ? { action: id, ...rect(el), visible: el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden' } : { action: id, visible: false }; }),
          scrollW: se.scrollWidth, scrollH: se.scrollHeight
        };
      });
      const name = `${vw}x${vh}`;
      const check = (label, fn) => {
        try { fn(); results.push(true); console.log(`PASS ${name} ${label}`); }
        catch (e) { results.push(false); console.log(`FAIL ${name} ${label}\n     ${e.message.split('\n')[0]}`); }
      };
      const best = Math.min(vh / 540, (vw - 2 * SIDE) / 960) * 960;
      check(`캔버스 크기: 가능한 최대(${best.toFixed(0)}px)의 ${MIN_RATIO * 100}% 이상`, () =>
        assert.ok(m.canvas.width >= best * MIN_RATIO, `캔버스 폭 ${m.canvas.width.toFixed(0)}px < ${(best * MIN_RATIO).toFixed(0)}px (원래 크기의 ${(m.canvas.width / 960 * 100).toFixed(0)}%)`));
      check('캔버스가 화면 안에 있고 스크롤이 필요 없음', () => {
        const c = m.canvas;
        assert.ok(c.left >= -0.5 && c.top >= -0.5 && c.right <= vw + 0.5 && c.bottom <= vh + 0.5, `캔버스 위치 ${JSON.stringify(c)}`);
        assert.ok(m.scrollH <= vh + 1 && m.scrollW <= vw + 1, `페이지 스크롤 발생 ${m.scrollW}x${m.scrollH}`);
      });
      // 이동은 좌/우 버튼([data-action=left|right]) 또는 한 축 조이스틱([data-control=move]) 중 하나
      const moveStick = m.move.find((x) => x.visible);
      const controls = [...m.buttons.filter((b) => b.visible), ...(moveStick ? [moveStick] : [])];
      check('조작(이동·점프·공격·교대·조사)이 보이고 화면 안에 있으며 최소 44px', () => {
        // interact(조사): EXPLORATION_SPEC §5
        const need = moveStick ? ['move', 'jump', 'attack', 'swap', 'interact'] : ['left', 'right', 'jump', 'attack', 'swap', 'interact'];
        for (const a of need) {
          const b = controls.find((x) => x.action === a);
          assert.ok(b, `${a} 조작이 보이지 않음`);
          assert.ok(b.left >= -0.5 && b.top >= -0.5 && b.right <= vw + 0.5 && b.bottom <= vh + 0.5, `${a} 조작이 화면 밖`);
          assert.ok(b.width >= MIN_TOUCH && b.height >= MIN_TOUCH, `${a} 조작 ${b.width.toFixed(0)}x${b.height.toFixed(0)} < ${MIN_TOUCH}px`);
        }
      });
      check('방 초기화·수치 조절 버튼이 화면 안에서 접근 가능', () => {
        for (const t of m.tools) {
          assert.ok(t.visible, `#${t.action} 버튼이 보이지 않음`);
          assert.ok(t.left >= -0.5 && t.top >= -0.5 && t.right <= vw + 0.5 && t.bottom <= vh + 0.5, `#${t.action} 버튼이 화면 밖`);
          assert.ok(t.width >= 36 && t.height >= 36, `#${t.action} 버튼 ${t.width.toFixed(0)}x${t.height.toFixed(0)} < 36px`);
        }
      });
      check('조작·도구 버튼이 플레이 화면(캔버스)과 서로를 가리지 않음', () => {
        const vis = [...controls, ...m.tools.filter((t) => t.visible)];
        for (const b of vis) assert.equal(area(b, m.canvas), 0, `${b.action}이(가) 캔버스를 가림`);
        for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++)
          assert.equal(area(vis[i], vis[j]), 0, `${vis[i].action}/${vis[j].action} 겹침`);
      });
      if (process.env.HK_SHOT_DIR) await page.screenshot({ path: `${process.env.HK_SHOT_DIR}/hk-mobile-${name}.png` });
      await ctx.close();
    }
  } finally { await browser.close(); }
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
