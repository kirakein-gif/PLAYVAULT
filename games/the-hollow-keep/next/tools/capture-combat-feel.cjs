'use strict';
// Real app/inputs; observe painted poses/targets/text/transforms without mutating world state.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.HK_SHOT_DIR||'/tmp/hk09b-feel';fs.mkdirSync(out,{recursive:true});
const url=process.env.HK_URL||'http://127.0.0.1:8765/games/the-hollow-keep/next/?room=test';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
try{for(const direction of ['right','left']){
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.clock.install({time:new Date('2026-11-02T04:00:00Z')});await page.clock.pauseAt(new Date('2026-11-02T04:00:01Z'));
 await page.addInitScript(()=>{
  window.__events=[];window.__paint={sprites:[],targets:[],text:[]};
  Object.defineProperty(window,'HKSim',{configurable:true,set(sim){const step=sim.step;sim.step=function(w,input){const ev=step(w,input);for(const e of ev)window.__events.push({...e,tick:w.tick});return ev;};Object.defineProperty(window,'HKSim',{value:sim,writable:true,configurable:true});}});
  const draw=CanvasRenderingContext2D.prototype.drawImage,rect=CanvasRenderingContext2D.prototype.fillRect,txt=CanvasRenderingContext2D.prototype.fillText;
  const matrix=ctx=>{const m=ctx.getTransform();return {a:m.a,e:m.e,f:m.f};};
  CanvasRenderingContext2D.prototype.drawImage=function(img,...a){if(a.length===8&&/noah-attack/.test(img.src||''))window.__paint.sprites.push({file:img.src.split('/').pop(),frame:a[0]/a[2],matrix:matrix(this)});return draw.call(this,img,...a);};
  CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(y===430&&w===12&&h===60)window.__paint.targets.push({x,y,w,h,color:this.fillStyle,matrix:matrix(this)});return rect.call(this,x,y,w,h);};
  CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){if(String(text).startsWith('−')||String(text).endsWith(' HP')){const width=this.measureText(text).width,size=parseFloat(this.font),left=this.textAlign==='center'?x-width/2:x;window.__paint.text.push({text,x:left,y:y-size,w:width,h:size,matrix:matrix(this)});}return txt.call(this,text,x,y,...args);};
  const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{window.__paint={sprites:[],targets:[],text:[]};cb(t);});
 });
 await page.goto(url);await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();await page.clock.runFor(100);
 const state=()=>page.evaluate(()=>HKPlaytest.snapshot());async function ticks(n){const target=(await state()).tick+n;while((await state()).tick<target)await page.clock.runFor(16);}
 await page.keyboard.down('KeyQ');await ticks(1);await page.keyboard.up('KeyQ');await ticks(12);
 const targetX=direction==='right'?100:179;await page.keyboard.down('ArrowRight');while((await state()).player.x<targetX)await ticks(1);await page.keyboard.up('ArrowRight');await ticks(10);
 if(direction==='left'){await page.keyboard.down('ArrowLeft');await ticks(1);await page.keyboard.up('ArrowLeft');await ticks(8);}
 const s0=await state(),x=Math.max(0,Math.min(600,s0.player.x+s0.player.w/2-150)),y=310,trace=[];
 await page.evaluate(()=>window.__events=[]);
 const rhythm=await page.evaluate(()=>HKSim.CONFIG.heroes.noah.weapon.combo.map(s=>s.recoveryTicks));
 const length=rhythm[0]+rhythm[1]+rhythm[2]+8;
 for(let i=0;i<length;i++){
  if([0,4,rhythm[0]+4].includes(i))await page.keyboard.down('KeyJ');else await page.keyboard.up('KeyJ');await ticks(1);
  const result=await page.evaluate(({x,y})=>{const canvas=document.querySelector('canvas'),unit=canvas.width/960,crop=document.createElement('canvas');crop.width=720;crop.height=420;crop.getContext('2d').drawImage(canvas,x*unit,y*unit,360*unit,210*unit,0,0,720,420);return {world:HKPlaytest.snapshot(),paint:window.__paint,data:crop.toDataURL(),unit};},{x,y});
  const name=`noah-${direction}-tick-${String(i).padStart(3,'0')}.png`;fs.writeFileSync(path.join(out,name),Buffer.from(result.data.split(',')[1],'base64'));
  trace.push({i,tick:result.world.tick,player:result.world.player,target:result.world.dummies[0],paint:result.paint,unit:result.unit});
 }
 const events=await page.evaluate(()=>window.__events),attacks=events.filter(e=>e.type==='attack'),hits=events.filter(e=>e.type==='hit'&&e.hero==='noah');
 assert.deepEqual(attacks.map(e=>e.step),[1,2,3]);assert.equal(attacks[1].tick-attacks[0].tick,18);assert.equal(attacks[2].tick-attacks[1].tick,22);assert.equal(hits.length,3);
 for(let i=1;i<trace.length;i++)assert.equal(trace[i].tick-trace[i-1].tick,1,'simulation tick continues during held drawing');
 for(const hit of hits){
  const attack=attacks.find(a=>a.step===hit.step),start=Math.max(hit.tick,attack.tick+2),hold=hit.step===3?5:3;
  const frames=trace.filter(t=>t.tick>=start&&t.tick<start+hold+2).map(t=>t.paint.sprites[0]?.frame);assert.equal(frames.length,hold+2);assert.equal(frames[0],1);assert.equal(trace.find(t=>t.tick===start+hold+2).paint.sprites[0]?.frame,2,'held cut resumes at the exact3/3/5tick boundary');assert.equal(new Set(frames).size,1,'Noah pose held while ticks advance');
  for(let dt=0;dt<4;dt++){const t=trace.find(t=>t.tick===start+dt),paint=t.paint.targets[0];assert.ok(paint);assert.equal(paint.color,dt<2?'#ffffff':'#987667');assert.equal(paint.x,171+(dt<3?hit.face*(3-dt):0));assert.equal(t.target.x,162,'physical target never moved');}
 }
 const third=hits.find(e=>e.step===3),shakeStart=Math.max(third.tick,attacks[2].tick+2);
 for(const t of trace){const hp=t.paint.text.find(e=>e.text.endsWith(' HP')),camera=hp.matrix.e/t.unit;const age=t.tick-shakeStart;assert.equal(camera,age>=0&&age<6?[3,-3,2,-2,1,-1][age]:0,'only the finisher shakes the world for6ticks');
  const labels=t.paint.text.filter(e=>e.text.startsWith('−')),hpLabels=t.paint.text.filter(e=>e.text.endsWith(' HP'));
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  for(let i=0;i<labels.length;i++){assert.ok(hpLabels.every(h=>!overlap(labels[i],h)),'damage does not cover HP');assert.ok(labels.slice(i+1).every(b=>!overlap(labels[i],b)),'damage labels do not overlap');}
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,`noah-${direction}-trace.json`),JSON.stringify({events,trace},null,2));
 console.log(`PASS ${direction}:18/22 rhythm;3/3/5 visual hold;2tick flash;3px recoil without physics movement;6tick finisher shake;separate floating labels;world ticks uninterrupted`);checks++;await context.close();
}}finally{await browser.close();}
console.log(`${checks}/${checks} combat presentation checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
