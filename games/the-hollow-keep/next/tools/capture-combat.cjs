'use strict';
// TASK_09: original app, real inputs, controlled browser clock. No world/pose injection.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const url=process.env.HK_URL||'http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test';
const out=process.env.HK_SHOT_DIR||'/tmp/hk09-review';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
 async function open(mobile=false){
  const context=await browser.newContext({viewport:mobile?{width:780,height:330}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.clock.install({time:new Date('2026-11-02T03:00:00Z')});await page.clock.pauseAt(new Date('2026-11-02T03:00:01Z'));
  await page.addInitScript(()=>{
   window.__events=[];window.__draws=[];
   Object.defineProperty(window,'HKSim',{configurable:true,set(sim){const step=sim.step;sim.step=function(w,input){const ev=step(w,input);for(const e of ev)window.__events.push({...e,tick:w.tick});return ev;};Object.defineProperty(window,'HKSim',{value:sim,writable:true,configurable:true});}});
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(image,...a){if(a.length===8&&/\/(noah|ethan)-/.test(image.src||''))window.__draws.push({file:image.src.split('/').pop(),frame:a[0]/a[2],x:a[4],y:a[5]});return draw.call(this,image,...a);};
   const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{window.__draws=[];cb(t);});
  });
  await page.goto(url);await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();await page.clock.runFor(100);
  const state=()=>page.evaluate(()=>({world:HKPlaytest.snapshot(),draws:window.__draws,events:window.__events}));
  async function ticks(n){const target=(await state()).world.tick+n;while((await state()).world.tick<target)await page.clock.runFor(16);}
  async function key(code,n){await page.keyboard.down(code);await ticks(n);await page.keyboard.up(code);}
  async function shot(name,full=false){if(full){await page.screenshot({path:path.join(out,name+'.png')});return;}
   const data=await page.evaluate(()=>{const canvas=document.querySelector('canvas'),p=HKPlaytest.snapshot().player,unit=canvas.width/960;
    const x=Math.max(0,Math.min(600,p.x+p.w/2-150)),y=Math.max(0,Math.min(360,p.y+p.h-150));
    const crop=document.createElement('canvas');crop.width=720;crop.height=360;crop.getContext('2d').drawImage(canvas,x*unit,y*unit,360*unit,180*unit,0,0,720,360);return crop.toDataURL();});
   fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  }
  return {context,page,state,ticks,key,shot,errors};
 }
 try{
  for(const direction of ['right','left']){
   const c=await open();await c.key('KeyQ',1);await c.ticks(12);
   await c.page.keyboard.down('ArrowRight');while((await c.state()).world.player.x+(await c.state()).world.player.w/2<168)await c.ticks(1);await c.page.keyboard.up('ArrowRight');await c.ticks(12);
   if(direction==='left'){await c.key('ArrowLeft',1);await c.ticks(8);}
   await c.page.evaluate(()=>window.__events=[]);const frames=new Set(),fx=new Set(),fxFrames=new Set();
   const rhythm=await c.page.evaluate(()=>({recover:HKSim.CONFIG.heroes.noah.weapon.combo.map(s=>s.recoveryTicks),finish:HKPixel.manifest().heroes.noah.animations['attack-3'].ticks.reduce((a,b)=>a+b,0)}));
   for(let i=0;i<rhythm.recover[0]+rhythm.recover[1]+rhythm.finish+8;i++){
    if([0,4,rhythm.recover[0]+4].includes(i))await c.page.keyboard.down('KeyJ');else await c.page.keyboard.up('KeyJ');await c.ticks(1);
    const s=await c.state(),d=s.draws.find(d=>/^noah-attack(?:-[23])?\.png$/.test(d.file));
    for(const draw of s.draws)if(draw.file.includes('fx-slash')){fx.add(draw.file);fxFrames.add(draw.file+':'+draw.frame);}
    if(d){const step=d.file==='noah-attack.png'?1:Number(d.file.match(/-([23])\.png/)[1]),id=step+'-'+d.frame;
     if(!frames.has(id)){frames.add(id);await c.shot(`noah-${direction}-step-${step}-frame-${d.frame}`);}}
   }
   assert.deepEqual((await c.state()).events.filter(e=>e.type==='attack').map(e=>e.step),[1,2,3]);assert.equal(frames.size,12,'four actual poses in each combo stage');assert.equal(fx.size,3,'three actual slash effect sheets');assert.equal(fxFrames.size,9,'all3 actual effect frames in each stage');assert.deepEqual(c.errors,[]);
   console.log('PASS Noah '+direction+': actual1/2/3 events, all12 body frames and all9 slash effect frames');checks++;await c.context.close();
  }
  for(const level of [2,3]){
   const c=await open();await c.page.keyboard.down('KeyJ');await c.ticks(level===2?42:82);
   let s=await c.state();assert.equal(s.world.player.charge.level,level);assert.ok(s.draws.some(d=>d.file==='ethan-charge.png'));
   assert.ok(s.draws.some(d=>d.file==='ethan-fx-charge.png'&&Math.floor(d.frame/3)===level-1));await c.shot(`ethan-charge-${level}`);
   await c.page.keyboard.up('KeyJ');await c.ticks(1);s=await c.state();assert.ok(s.events.some(e=>e.type==='attack'&&e.level===level));assert.ok(s.draws.some(d=>d.file===`ethan-fx-rune-${level}.png`));await c.shot(`ethan-projectile-${level}`);
   const burstFrames=new Set();for(let i=0;i<35;i++){await c.ticks(1);s=await c.state();const d=s.draws.find(d=>d.file==='ethan-fx-burst.png');if(d&&!burstFrames.has(d.frame)){burstFrames.add(d.frame);await c.shot(`ethan-burst-${d.frame}`);}}
   if(level===3){assert.equal(burstFrames.size,3);assert.ok(s.events.some(e=>e.type==='burst'));}
   assert.deepEqual(c.errors,[]);console.log('PASS Ethan level'+level+': hold/release, distinct charge bank and projectile'+(level===3?', all3 actual burst frames':''));checks++;await c.context.close();
  }
  {
   const c=await open(true),button=c.page.locator('[data-action="attack"]'),box=await button.boundingBox(),cdp=await c.context.newCDPSession(c.page);
   const point={x:box.x+box.width/2,y:box.y+box.height/2,id:1};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await c.ticks(82);
   assert.equal((await c.state()).world.player.charge.level,3);assert.ok(await button.evaluate(b=>b.classList.contains('pressed')));await c.shot('mobile-charge-780x330',true);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.ticks(1);assert.ok((await c.state()).events.some(e=>e.type==='attack'&&e.level===3));assert.ok(!(await button.evaluate(b=>b.classList.contains('pressed'))));assert.deepEqual(c.errors,[]);
   console.log('PASS mobile780x330: actual touch stays held through level3 and release fires');checks++;await c.context.close();
  }
  {
   const c=await open();await c.page.keyboard.press('F2');
   const input=key=>c.page.locator('input[data-key="'+key+'"]');
   for(const key of ['NOAH 콤보 1단.damage','NOAH 콤보 2단.range','NOAH 콤보 3단.recoveryTicks','NOAH 무기.comboWindowTicks','ETHAN 충전.stage2Ticks','ETHAN 충전.stage3Ticks','ETHAN 충전탄 2단.damage','ETHAN 충전탄 3단.damage'])assert.equal(await input(key).count(),1,key);
   await input('NOAH 콤보 1단.damage').fill('23');await input('NOAH 콤보 1단.damage').dispatchEvent('change');
   assert.equal(await c.page.evaluate(()=>HKSim.CONFIG.heroes.noah.weapon.damage),23);
   await input('ETHAN 충전.stage2Ticks').fill('45');await input('ETHAN 충전.stage2Ticks').dispatchEvent('change');assert.equal(await c.page.evaluate(()=>HKSim.CONFIG.heroes.ethan.weapon.charge.stage2Ticks),45);
   await c.page.locator('#copy-config').click();const exported=JSON.parse(await c.page.locator('#config-export').inputValue());assert.equal(exported.heroes.noah.weapon.combo[0].damage,23);assert.equal(exported.heroes.ethan.weapon.charge.stage2Ticks,45);
   await c.page.locator('#default-config').click();assert.equal(await c.page.evaluate(()=>HKSim.CONFIG.heroes.noah.weapon.damage),22);assert.equal(await c.page.evaluate(()=>HKSim.CONFIG.heroes.ethan.weapon.charge.stage2Ticks),40);assert.deepEqual(c.errors,[]);
   console.log('PASS F2: combo/charge controls, synchronized first stage, export and defaults');checks++;await c.context.close();
  }
 }finally{await browser.close();}
 console.log(`${checks}/${checks} actual-input combat browser checks passed; captures: ${out}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
