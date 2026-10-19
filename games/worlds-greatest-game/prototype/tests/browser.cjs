'use strict';
// npm package: playwright. Uses an installed Chrome; no game dependency is introduced.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{globalThis.testEnemy=2;Math.random=()=>globalThis.testEnemy/3;});
    const dest=process.argv[2];if(dest)fs.mkdirSync(dest,{recursive:true});
    const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
    await page.goto(url);
    async function pos(x,y){const b=await page.locator('canvas').boundingBox();return{x:b.x+x*b.width/1200,y:b.y+y*b.height/720};}
    async function move(x,y,steps=1){const p=await pos(x,y);await page.mouse.move(p.x,p.y,{steps});}
    async function status(fragment){try{await page.waitForFunction(s=>document.querySelector('#status').textContent.includes(s),fragment,{timeout:5500});}catch(e){await snap('failure');console.error(await page.locator('#status').innerText(),await page.evaluate(()=>globalThis.inputLog));throw e;}}
    async function round(enemy=2,player=0){await page.locator('#reset').click();await page.evaluate(b=>{globalThis.testEnemy=b;globalThis.inputLog=[];},enemy);await page.locator(`[data-hand="${player}"]`).click();await status('직접 판단');}
    async function snap(name){if(dest)await page.screenshot({path:path.join(dest,`${name}.png`),fullPage:true});}
    await snap('01-arena');
    await page.evaluate(()=>{globalThis.inputLog=[];for(const method of ['grab','move','release']){const original=WGG.Match.prototype[method];WGG.Match.prototype[method]=function(...args){const r=original.apply(this,args);globalThis.inputLog.push({method,args,phase:this.phase,tool:this.tool,tip:this.tip(),rule:this.rule,result:this.result,held:this.held});return r;};}});
    await round();
    assert(!/승리|패배|이겼|졌|망치를|냄비를/.test(await page.locator('#status').innerText()));
    await move(560,515);await page.mouse.down();await move(490,305,4);await status('명중');await page.mouse.up();
    assert.equal(await page.locator('#playerScore').innerText(),'1');await snap('02-hit');console.log('PASS browser direct hammer swing and concealed rule');
    await round();await snap('02-rps');
    await round(1);await move(740,535);await page.mouse.down();await move(930,322,8);await page.waitForTimeout(220);await snap('03-pot-equip');await status('방어');await page.mouse.up();assert.equal(await page.locator('#enemyScore').innerText(),'0');console.log('PASS browser pot drag / dwell / block');
    await round(1);await move(740,535);await page.mouse.down();await move(930,322,8);await page.waitForTimeout(180);await page.mouse.up();await status('피격');console.log('PASS browser early pot release fails defense');
    await round();await move(740,535);await page.mouse.down();await page.mouse.up();await status('파울');assert.equal(await page.locator('#enemyScore').innerText(),'1');console.log('PASS browser wrong tool foul');
    await round();await move(560,515);await page.mouse.down();await move(700,525,6);await page.keyboard.press('Escape');await page.mouse.up();await status('기회 종료');console.log('PASS browser Escape cancellation and timeout');
    await round();await move(560,515);await page.mouse.down();await page.mouse.up();await status('빗나감');console.log('PASS browser click does not auto-attack');
    await round(0);await move(560,515);await page.mouse.down();await page.mouse.up();await status('파울');console.log('PASS browser tied tool foul');
    await page.setViewportSize({width:960,height:900});await round();await move(560,515);await page.mouse.down();await move(490,305,5);await status('명중');await page.mouse.up();await snap('04-resized');console.log('PASS browser resized coordinate mapping');
    await page.setViewportSize({width:1440,height:1100});await round();await move(560,515);await page.mouse.down();await page.dispatchEvent('canvas','pointercancel',{pointerId:1});await page.mouse.up();await status('기회 종료');console.log('PASS browser pointercancel');
    await round();await move(560,515);await page.mouse.down();await move(-40,600);await page.mouse.up();await status('기회 종료');console.log('PASS browser canvas exit cancels capture');
    await round(1);await move(740,535);await page.mouse.down();await move(930,322,8);await page.waitForTimeout(180);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();await status('피격');console.log('PASS browser focus loss releases defense');
    await page.locator('#mute').click();assert.equal(await page.locator('#mute').getAttribute('aria-pressed'),'true');
    await page.locator('#motion').check();await round();await move(560,515);await page.mouse.down();await move(490,305,5);await status('명중');await page.mouse.up();console.log('PASS browser mute and reduced motion controls');
    const retina=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:2});await retina.goto(url);await retina.locator('[data-hand="0"]').click();await retina.waitForTimeout(750);assert.equal(await retina.locator('canvas').evaluate(c=>c.width),Math.round(await retina.locator('canvas').evaluate(c=>c.clientWidth)*2));await retina.close();console.log('PASS browser DPR 2 render at 1280px');
    await page.locator('#reset').click();await move(560,515);await page.mouse.down();await page.mouse.up();await status('조기 출발');console.log('PASS browser premature grab');
    assert.deepEqual(errors,[]);console.log('PASS no browser script errors');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
