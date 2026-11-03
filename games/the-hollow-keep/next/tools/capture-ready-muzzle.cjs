'use strict';
// Observe the real app with keyboard input. No world/pose injection.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.HK_SHOT_DIR,base=process.env.HK_URL||'http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});let checks=0;const observations=[];
 async function open(dir,hero){
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.clock.install({time:new Date('2026-11-03T02:00:00Z')});await page.clock.pauseAt(new Date('2026-11-03T02:00:01Z'));
  await page.addInitScript(()=>{
   window.__paint=[];window.__events=[];window.__errors=[];window.addEventListener('error',e=>window.__errors.push(e.message));
   Object.defineProperty(window,'HKSim',{configurable:true,set(sim){const step=sim.step;sim.step=(w,input)=>{const es=step(w,input);window.__events.push(...es.map(e=>({...e,tick:w.tick})));return es;};Object.defineProperty(window,'HKSim',{value:sim,configurable:true});}});
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(img,...a){if(a.length===8&&/\/(noah|ethan)-/.test(img.src||''))window.__paint.push({file:img.src.split('/').pop(),frame:a[0]/a[2]});return draw.call(this,img,...a);};
   const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{window.__paint=[];cb(t);});
  });
  await page.goto(base);await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();await page.clock.runFor(100);
  const state=()=>page.evaluate(()=>({world:HKPlaytest.snapshot(),draws:window.__paint,events:window.__events}));
  async function ticks(n){const target=(await state()).world.tick+n;while((await state()).world.tick<target)await page.clock.runFor(16);}
  async function key(code,n=1){await page.keyboard.down(code);await ticks(n);await page.keyboard.up(code);}
  if(hero==='noah'){await key('KeyQ');await ticks(12);}
  if(dir==='left'){await key('ArrowLeft');await ticks(10);}
  async function shot(name,cross=false){
   const data=await page.evaluate(cross=>{
    const canvas=document.querySelector('canvas'),p=HKPlaytest.snapshot().player,unit=canvas.width/960;
    const x=Math.max(0,Math.min(600,p.x+p.w/2-160)),y=p.y+p.h-180;
    const c=document.createElement('canvas');c.width=720;c.height=420;const ctx=c.getContext('2d');ctx.drawImage(canvas,x*unit,y*unit,360*unit,210*unit,0,0,720,420);
    if(cross){const m=HKSim.CONFIG.heroes.ethan.weapon.muzzle,mx=(p.face>0?p.x+p.w+m.forward:p.x-m.forward),my=p.y+p.h-m.height;ctx.strokeStyle='#ff6acb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo((mx-x)*2-6,(my-y)*2);ctx.lineTo((mx-x)*2+6,(my-y)*2);ctx.moveTo((mx-x)*2,(my-y)*2-6);ctx.lineTo((mx-x)*2,(my-y)*2+6);ctx.stroke();}
    return c.toDataURL();
   },cross);fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  }
  return {page,state,ticks,key,shot};
 }
 try{
  for(const dir of ['right','left']){
   for(const stop of [1,2]){
    const c=await open(dir,'noah');await c.key('KeyJ');await c.ticks(3);
    if(stop===2){await c.key('KeyJ');await c.ticks(37);}else await c.ticks(15);
    const s=await c.state(),step=stop===1?'attack':'attack-2',body=s.draws.find(d=>d.file===`noah-${step}.png`);
    const last=await c.page.evaluate(step=>HKPixel.manifest().heroes.noah.animations[step].frames-1,step);
    assert.equal(body?.frame,last,'stop at the common upright final frame');assert.deepEqual(s.events.filter(e=>e.type==='attack').map(e=>e.step),stop===1?[1]:[1,2]);
    await c.shot(`noah-${dir}-stop-${stop}`);observations.push({dir,stop,tick:s.world.tick,body});checks++;await c.page.close();
   }
   const c=await open(dir,'ethan');
   await c.page.keyboard.down('KeyJ');await c.ticks(3);await c.shot(`ethan-${dir}-fire-1-cross`,true);
   let s=await c.state();assert.ok(s.draws.some(d=>d.file==='ethan-attack.png'&&d.frame===1));
   const stages=await c.page.evaluate(()=>HKSim.CONFIG.heroes.ethan.weapon.charge);
   await c.ticks(stages.stage2Ticks+2);s=await c.state();assert.equal(s.world.player.charge.level,2);await c.shot(`ethan-${dir}-charge-2-cross`,true);
   await c.ticks(stages.stage3Ticks-stages.stage2Ticks);s=await c.state();assert.equal(s.world.player.charge.level,3);await c.shot(`ethan-${dir}-charge-3-cross`,true);
   await c.page.keyboard.up('KeyJ');await c.ticks(1);assert.ok((await c.state()).events.some(e=>e.type==='attack'&&e.level===3));await c.shot(`ethan-${dir}-fire-3-cross`,true);
   assert.deepEqual(await c.page.evaluate(()=>window.__errors),[]);checks++;await c.page.close();
  }
  fs.writeFileSync(path.join(out,'ready-muzzle-observations.json'),JSON.stringify(observations,null,2));
  console.log(`${checks}/${checks} actual-input ready stance and muzzle capture checks passed`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
