'use strict';
// Real keyboard inputs and renderer, controlled scheduling; no state injection.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.HK_SHOT_DIR||'/tmp/hk08-review';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const hero of ['ethan','noah']){
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 await page.clock.install();await page.clock.pauseAt(Date.now()+1000);
 await page.addInitScript(()=>{const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...a){if((img.src||'').includes('-climb.png')&&a.length===8)window.__climbFrame=a[0]/a[2];return draw.call(this,img,...a);};});
 await page.goto(process.env.HK_URL||'http://127.0.0.1:8765/games/the-hollow-keep/next/');await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();await page.clock.runFor(100);
 const state=()=>page.evaluate(()=>HKPlaytest.snapshot());
 const tick=()=>page.clock.runFor(17);
 if(hero==='noah'){await page.keyboard.down('KeyQ');await tick();await page.keyboard.up('KeyQ');}
 await page.keyboard.down('ArrowRight');for(let i=0;i<100;i++){const {player:p}=await state();if(p.x+p.w/2>=192)break;await tick();}await page.keyboard.up('ArrowRight');await page.clock.runFor(170);
 await page.keyboard.down('ArrowUp');const seen=new Set();
 for(let i=0;i<100;i++){await tick();const s=await state(),f=await page.evaluate(()=>window.__climbFrame);if(s.player.climbing&&Number.isInteger(f)&&!seen.has(f)){seen.add(f);await page.screenshot({path:path.join(out,`${hero}-climb-${f}.png`)});}if(s.player.y+s.player.h<=422)break;}
 await page.keyboard.up('ArrowUp');assert.equal(seen.size,4,hero+' all actual climb frames');
 await page.keyboard.down('ArrowLeft');await tick();await page.keyboard.up('ArrowLeft');await page.keyboard.down('KeyJ');await tick();await page.keyboard.up('KeyJ');await page.clock.runFor(34);assert.ok((await state()).player.climbing);await page.screenshot({path:path.join(out,`${hero}-ladder-attack.png`)});
 await page.clock.runFor(500);await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowLeft');for(let i=0;i<100&&(await state()).player.climbing;i++)await tick();await page.keyboard.up('ArrowUp');await page.keyboard.up('ArrowLeft');
 const p=(await state()).player;assert.ok(!p.climbing&&p.onGround);assert.equal(p.y+p.h,360);await page.screenshot({path:path.join(out,`${hero}-side-dismount.png`)});
 if(hero==='ethan'){await page.setViewportSize({width:780,height:330});await page.clock.runFor(100);await page.screenshot({path:path.join(out,'mobile-780x330.png')});}
 console.log(hero+': all4 climb frames, attached attack and side dismount captured');await context.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
