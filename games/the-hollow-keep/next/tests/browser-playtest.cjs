// Requires Playwright and Chromium, plus a running repository-root HTTP server.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const url = process.env.HK_URL || 'http://127.0.0.1:8765/games/the-hollow-keep/next/';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless:true, args:['--no-sandbox'] });
  const errors = [], failures = [];
  let checks = 0;
  async function check(name, fn) { await fn(); checks++; console.log('PASS '+name); }
  async function setup(context) {
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => {if(r.status() >= 400)failures.push(r.url()+': '+r.status());});
    await page.goto(url);await page.locator('canvas').focus();
    await page.waitForFunction(()=>window.HKPlaytest && HKPlaytest.snapshot().tick > 2);
    return page;
  }
  const snap = page => page.evaluate(()=>HKPlaytest.snapshot());
  async function ticks(page, count) {
    const start=(await snap(page)).tick;
    await page.waitForFunction(start=>HKPlaytest.snapshot().tick>=start, start+count);
  }
  async function reset(page) {await page.locator('#reset').click();await page.locator('canvas').focus();await ticks(page,3);}
  try {
    const desktop=await browser.newContext({viewport:{width:1280,height:900}}),page=await setup(desktop);
    await check('debug hidden by default', async()=>assert.equal(await page.locator('#debug').isVisible(),false));
    await check('D key moves the actual player',async()=>{
      const x=(await snap(page)).player.x;await page.keyboard.down('KeyD');await ticks(page,20);await page.keyboard.up('KeyD');
      assert.ok((await snap(page)).player.x>x+30);
    });
    await check('space jumps, release lands, hold does not repeat',async()=>{
      await reset(page);const y=(await snap(page)).player.y;await page.keyboard.down('Space');await ticks(page,10);
      assert.ok((await snap(page)).player.y<y-30);await ticks(page,80);assert.ok((await snap(page)).player.onGround);await page.keyboard.up('Space');
    });
    await check('X shot stops at the near target and leaves the far target untouched',async()=>{
      await reset(page);await page.keyboard.press('KeyX');await ticks(page,90);const w=await snap(page);
      assert.equal(w.dummies[0].hp,978);assert.equal(w.dummies[1].hp,1000);assert.ok(!w.attacks.some(a=>a.life>0));assert.match(await page.locator('#notice').textContent(),/피해 22/);
    });
    await check('Q swaps hero and updates visible HUD',async()=>{
      await page.keyboard.press('KeyQ');await ticks(page,3);assert.equal((await snap(page)).active,'noah');assert.match(await page.locator('#hero-name').textContent(),/NOAH/);
    });
    await check('Noah melee hits nearby target once',async()=>{
      await reset(page);await page.keyboard.down('KeyD');await ticks(page,18);await page.keyboard.up('KeyD');await ticks(page,6);
      await page.keyboard.press('KeyJ');await ticks(page,20);assert.equal((await snap(page)).dummies[0].hp,978);
    });
    await check('F2 panel applies CONFIG and exports JSON',async()=>{
      await page.keyboard.press('F2');assert.equal(await page.locator('#debug').isVisible(),true);
      const control=page.locator('[data-key="NOAH.runSpeed"]');await control.fill('4.2');await control.press('Tab');
      assert.equal(await page.evaluate(()=>HKSim.CONFIG.heroes.noah.runSpeed),4.2);
      const cooldown=page.locator('[data-key="NOAH 무기.cooldownTicks"]');await cooldown.fill('20');await cooldown.press('Tab');
      assert.equal(await page.evaluate(()=>HKSim.CONFIG.heroes.noah.weapon.cooldownTicks),20);
      await page.locator('#copy-config').click();assert.equal(JSON.parse(await page.locator('#config-export').inputValue()).heroes.noah.runSpeed,4.2);
      await page.locator('#default-config').click();assert.equal(await page.evaluate(()=>HKSim.CONFIG.heroes.noah.runSpeed),3.85);
    });
    await check('editing controls does not move the player',async()=>{
      await page.locator('[data-key="ETHAN.runSpeed"]').focus();const before=(await snap(page)).player.x;
      await page.keyboard.down('ArrowRight');await ticks(page,15);await page.keyboard.up('ArrowRight');assert.equal((await snap(page)).player.x,before);
    });
    await check('blur clears held movement',async()=>{
      await page.locator('canvas').focus();await page.keyboard.down('KeyD');await ticks(page,5);
      await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await ticks(page,15);assert.equal((await snap(page)).player.vx,0);await page.keyboard.up('KeyD');
    });
    await page.screenshot({path:'/tmp/hollow-keep-desktop.png',fullPage:true});
    const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}),touch=await setup(mobile);
    const cdp=await mobile.newCDPSession(touch);
    const point=async(action,id)=>{const b=await touch.locator(`[data-action="${action}"]`).boundingBox();assert.ok(b);return{x:b.x+b.width/2,y:b.y+b.height/2,id};};
    await check('mobile landscape fits stage and controls',async()=>{
      assert.equal(await touch.locator('#rotate').isVisible(),false);
      for(const action of ['left','right','jump','attack','swap']) {const b=await touch.locator(`[data-action="${action}"]`).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=844&&b.y+b.height<=390);}
      const canvasBox=await touch.locator('canvas').boundingBox();
      assert.ok(canvasBox.x>=0&&canvasBox.y>=0&&canvasBox.x+canvasBox.width<=844&&canvasBox.y+canvasBox.height<=390);
      for(const action of ['left','right','jump','attack','swap']) {
        const b=await touch.locator(`[data-action="${action}"]`).boundingBox();
        assert.ok(b.y>=canvasBox.y+canvasBox.height,action+' must be below the canvas');
      }
      assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    });
    await check('starting hero is visible with no controls covering the play area',async()=>{
      const w=await snap(touch),b=await touch.locator('canvas').boundingBox();
      assert.equal(w.active,'ethan');assert.equal(w.player.x,35);
      const center={x:b.x+(w.player.x+w.player.w/2)*b.width/960,y:b.y+(w.player.y+w.player.h/2)*b.height/540};
      assert.ok(center.x>b.x&&center.x<b.x+b.width&&center.y>b.y&&center.y<b.y+b.height);
      assert.equal(await touch.evaluate(p=>document.elementFromPoint(p.x,p.y).id,center),'game');
      await touch.screenshot({path:'/tmp/hollow-keep-mobile-start.png'});
    });
    await check('real multitouch right + jump moves and jumps',async()=>{
      const before=await snap(touch),points=[await point('right',1),await point('jump',2)];
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await ticks(touch,12);
      const after=await snap(touch);assert.ok(after.player.x>before.player.x+15);assert.ok(after.player.y<before.player.y-30);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,65);
      assert.ok((await snap(touch)).player.onGround);assert.equal((await snap(touch)).player.vx,0);
    });
    await check('touch attack and swap buttons trigger gameplay',async()=>{
      await reset(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('attack',1)]});await ticks(touch,3);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,25);assert.equal((await snap(touch)).dummies[0].hp,978);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('swap',1)]});await ticks(touch,3);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,2);assert.equal((await snap(touch)).active,'noah');assert.equal(await touch.locator('[data-action].pressed').count(),0);
    });
    await touch.screenshot({path:'/tmp/hollow-keep-mobile.png'});
    await check('portrait pauses and landscape resumes without stuck input',async()=>{
      await touch.setViewportSize({width:390,height:844});await touch.waitForTimeout(150);assert.equal(await touch.locator('#rotate').isVisible(),true);
      const before=(await snap(touch)).tick;await touch.waitForTimeout(150);assert.equal((await snap(touch)).tick,before);
      await touch.setViewportSize({width:844,height:390});await ticks(touch,5);assert.equal(await touch.locator('#rotate').isVisible(),false);assert.equal((await snap(touch)).player.vx,0);
    });
    await check('no page errors or missing resources',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);});
    console.log(`${checks}/${checks} browser checks passed; screenshots: /tmp/hollow-keep-{desktop,mobile,mobile-start}.png`);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
