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
    await check('debug hidden and fullscreen never entered automatically', async()=>{assert.equal(await page.locator('#debug').isVisible(),false);assert.equal(await page.evaluate(()=>!!document.fullscreenElement),false);});
    await check('D key moves the actual player',async()=>{
      const x=(await snap(page)).player.x;await page.keyboard.down('KeyD');await ticks(page,20);await page.keyboard.up('KeyD');
      assert.ok((await snap(page)).player.x>x+30);
    });
    await check('space jumps, release lands, hold does not repeat',async()=>{
      await reset(page);const y=(await snap(page)).player.y;await page.keyboard.down('Space');await ticks(page,10);
      assert.ok((await snap(page)).player.y<y-30);await ticks(page,80);assert.ok((await snap(page)).player.onGround);await page.keyboard.up('Space');
    });
    await check('standing and running jumps expose takeoff state and render distinct poses',async()=>{
      await reset(page);await page.keyboard.down('Space');await ticks(page,8);
      const standing=await snap(page);assert.equal(standing.player.jumpKind,'standing');assert.equal(standing.player.takeoffVx,0);
      await page.screenshot({path:'/tmp/hollow-keep-standing-jump.png'});await page.keyboard.up('Space');
      await reset(page);await page.keyboard.down('KeyD');await ticks(page,10);await page.keyboard.down('Space');await ticks(page,8);
      const running=await snap(page);assert.equal(running.player.jumpKind,'running');
      assert.ok(running.player.takeoffVx>=1.475);await page.screenshot({path:'/tmp/hollow-keep-running-jump.png'});
      await page.keyboard.up('KeyD');await page.keyboard.up('Space');await reset(page);
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
      const air=page.locator('[data-key="NOAH.airControlSpeed"]');await air.fill('1.5');await air.press('Tab');
      assert.equal(await page.evaluate(()=>HKSim.CONFIG.heroes.noah.airControlSpeed),1.5);
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
    const point=async(action,id)=>{
      const movement=action==='left'||action==='right';
      const b=await touch.locator(movement?'[data-control="move"]':`[data-action="${action}"]`).boundingBox();
      assert.ok(b);return{x:b.x+b.width*(movement?(action==='left'?.15:.85):.5),y:b.y+b.height/2,id};
    };
    await check('mobile landscape fits stage and controls',async()=>{
      assert.equal(await touch.locator('#rotate').isVisible(),false);
      const controls=['[data-control="move"]','[data-action="jump"]','[data-action="attack"]','[data-action="swap"]'];
      for(const selector of controls) {const b=await touch.locator(selector).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=844&&b.y+b.height<=390);}
      const canvasBox=await touch.locator('canvas').boundingBox();
      assert.ok(canvasBox.x>=0&&canvasBox.y>=0&&canvasBox.x+canvasBox.width<=844&&canvasBox.y+canvasBox.height<=390);
      for(const selector of controls) {
        const b=await touch.locator(selector).boundingBox();
        const width=Math.min(b.x+b.width,canvasBox.x+canvasBox.width)-Math.max(b.x,canvasBox.x);
        const height=Math.min(b.y+b.height,canvasBox.y+canvasBox.height)-Math.max(b.y,canvasBox.y);
        assert.ok(width<=0||height<=0,selector+' must not overlap the canvas');
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
      const after=await snap(touch),air=await touch.evaluate(()=>HKSim.CONFIG.heroes.ethan.airControlSpeed);
      const dx=after.player.x-before.player.x;
      assert.ok(dx>air*6&&dx<=air*(after.tick-before.tick)+.01);
      assert.ok(Math.abs(after.player.vx)<=air+.01);assert.equal(after.player.jumpKind,'standing');
      assert.ok(after.player.y<before.player.y-30);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,65);
      assert.ok((await snap(touch)).player.onGround);assert.equal((await snap(touch)).player.vx,0);
    });
    await check('joystick steers left and releases on touch cancellation',async()=>{
      await reset(touch);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('right',1)]});await ticks(touch,10);
      const x=(await snap(touch)).player.x;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await point('left',1)]});await ticks(touch,10);
      assert.ok((await snap(touch)).player.x<x);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await ticks(touch,10);
      assert.equal((await snap(touch)).player.vx,0);assert.equal(await touch.locator('[data-control="move"].pressed').count(),0);
    });
    await check('touch attack and swap buttons trigger gameplay',async()=>{
      await reset(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('attack',1)]});await ticks(touch,3);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,25);assert.equal((await snap(touch)).dummies[0].hp,978);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('swap',1)]});await ticks(touch,3);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,2);assert.equal((await snap(touch)).active,'noah');assert.equal(await touch.locator('[data-action].pressed,[data-control].pressed').count(),0);
    });
    await touch.screenshot({path:'/tmp/hollow-keep-mobile.png'});
    await check('portrait pauses and landscape resumes without stuck input',async()=>{
      await touch.setViewportSize({width:390,height:844});await touch.waitForTimeout(150);assert.equal(await touch.locator('#rotate').isVisible(),true);
      const before=(await snap(touch)).tick;await touch.waitForTimeout(150);assert.equal((await snap(touch)).tick,before);
      await touch.setViewportSize({width:844,height:390});await ticks(touch,5);assert.equal(await touch.locator('#rotate').isVisible(),false);assert.equal((await snap(touch)).player.vx,0);
    });
    await check('fullscreen reflows after resizing and keeps joystick input',async()=>{
      assert.equal(await touch.evaluate(()=>!!document.fullscreenElement),false);
      await touch.locator('#fullscreen-toggle').tap();
      await touch.waitForFunction(()=>!!document.fullscreenElement);
      for(const [width,height] of [[780,330],[915,412]]) {
        await touch.setViewportSize({width,height});await ticks(touch,3);
        const box=await touch.locator('canvas').boundingBox();
        const best=Math.min(height/540,(width-144)/960)*960;
        assert.ok(box.width>=best*.9&&box.x>=0&&box.y>=0&&box.x+box.width<=width+.5&&box.y+box.height<=height+.5);
        assert.ok(await touch.evaluate(()=>document.scrollingElement.scrollHeight<=innerHeight+1));
      }
      await reset(touch);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('right',1)]});await ticks(touch,10);
      assert.ok((await snap(touch)).player.x>45);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,10);
      await touch.screenshot({path:'/tmp/hollow-keep-mobile-fullscreen.png'});
      await touch.locator('#fullscreen-toggle').tap();await touch.waitForFunction(()=>!document.fullscreenElement);
      await touch.setViewportSize({width:844,height:390});await ticks(touch,3);
    });
    await check('held joystick survives fullscreen entry and resize until touch release',async()=>{
      await reset(touch);const move=await point('right',1);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move]});await ticks(touch,5);
      const fs=await touch.locator('#fullscreen-toggle').boundingBox(),fsPoint={x:fs.x+fs.width/2,y:fs.y+fs.height/2,id:2};
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,fsPoint]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[fsPoint]});
      await touch.waitForFunction(()=>!!document.fullscreenElement);await ticks(touch,5);
      assert.ok((await snap(touch)).player.vx>0);assert.equal(await touch.locator('[data-control="move"].pressed').count(),1);
      const x=(await snap(touch)).player.x;await touch.setViewportSize({width:915,height:412});await ticks(touch,5);
      assert.ok((await snap(touch)).player.x>x+5);assert.ok((await snap(touch)).player.vx>0);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(touch,10);
      assert.equal((await snap(touch)).player.vx,0);assert.equal(await touch.locator('[data-control="move"].pressed').count(),0);
      await touch.locator('#fullscreen-toggle').tap();await touch.waitForFunction(()=>!document.fullscreenElement);
      await touch.setViewportSize({width:844,height:390});await ticks(touch,3);
    });
    await check('denied fullscreen request reports guidance and keeps controls usable',async()=>{
      await touch.evaluate(()=>{
        window.__deniedFullscreen=[];window.__fullscreenCalls=0;
        window.addEventListener('unhandledrejection',e=>window.__deniedFullscreen.push(String(e.reason)));
        document.documentElement.requestFullscreen=()=>{window.__fullscreenCalls++;return Promise.reject(new DOMException('denied','NotAllowedError'));};
      });
      assert.equal(await touch.evaluate(()=>window.__fullscreenCalls),0);
      await touch.locator('#fullscreen-toggle').tap();
      await touch.waitForFunction(()=>window.__fullscreenCalls===1);
      assert.match(await touch.locator('#notice').textContent(),/全|전체/);
      assert.equal(await touch.evaluate(()=>!!document.fullscreenElement),false);
      assert.deepEqual(await touch.evaluate(()=>window.__deniedFullscreen),[]);
      await reset(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await point('right',1)]});await ticks(touch,10);
      assert.ok((await snap(touch)).player.x>45);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    });
    await check('no page errors or missing resources',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);});
    console.log(`${checks}/${checks} browser checks passed; screenshots: /tmp/hollow-keep-{desktop,mobile,mobile-start,mobile-fullscreen}.png`);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
