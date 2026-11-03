'use strict';
// Actual app keyboard input and painted body observation; no world injection.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const move of [false,true]){
 const page=await browser.newPage();await page.clock.install({time:new Date('2026-11-02T04:00:00Z')});await page.clock.pauseAt(new Date('2026-11-02T04:00:01Z'));
 await page.addInitScript(()=>{const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...a){if(a.length===8&&/\/noah-(?!fx)/.test(img.src||''))window.__pose={file:img.src.split('/').pop(),frame:a[0]/a[2]};return draw.call(this,img,...a);};});
 await page.goto(process.env.HK_URL||'http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test');await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();await page.clock.runFor(100);
 const state=()=>page.evaluate(()=>HKPlaytest.snapshot());async function ticks(n){const end=(await state()).tick+n;while((await state()).tick<end)await page.clock.runFor(16);}
 async function key(code){await page.keyboard.down(code);await ticks(1);await page.keyboard.up(code);}
 await key('KeyQ');await ticks(12);await key('ArrowLeft');await ticks(12);await key('KeyJ');await ticks(18);
 const pose=()=>page.evaluate(()=>window.__pose);
 assert.deepEqual(await pose(),{file:'noah-attack.png',frame:5});
 if(move){await key('ArrowLeft');assert.equal((await pose()).file,'noah-run.png');await ticks(8);assert.equal((await pose()).file,'noah-idle.png');console.log('PASS movement releases last pose; stopping does not restore it inside window');}
 else{await ticks(19);assert.equal((await state()).tick-(await state()).player.combo.started,37);assert.equal((await pose()).file,'noah-attack.png');await ticks(1);assert.equal((await pose()).file,'noah-idle.png');console.log('PASS last pose retained until exact recovery18+window20 expiry');}
 await page.close();
}console.log('2/2 actual-input combo release checks passed');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
