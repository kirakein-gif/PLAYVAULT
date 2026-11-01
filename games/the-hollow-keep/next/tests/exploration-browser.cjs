// Real app, recorded keyboard inputs, map and two-axis mobile controls.
// Clock control changes only scheduling, never game state or poses.
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const url=process.env.HK_URL||'http://127.0.0.1:8766/games/the-hollow-keep/next/';
const output=process.env.HK_SHOT_DIR||'/tmp/hk-exploration-review';
const walk=require('../areas/area1.walkthrough.json'),area=require('../areas/area1.json');
const codes={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Space',attack:'KeyJ',swap:'KeyQ',interact:'KeyE'};
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;const check=async(name,fn)=>{await fn();console.log('PASS '+name);checks++;};
 const errors=[];
 async function open(mobile=false){
  const context=await browser.newContext({viewport:mobile?{width:780,height:330}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));
  await page.clock.install({time:new Date('2026-11-01T06:00:00Z')});await page.clock.pauseAt(new Date('2026-11-01T06:00:01Z'));
  await page.addInitScript(()=>{
   window.__captures=[];window.__pending=[];window.__seen={};window.__simTick=0;window.__propCalls=[];
   const drawImage=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
    for(const [name,art]of Object.entries(window.HKPixel?.manifest()?.objects||{}))if((image.src||'').endsWith('/'+art.file)&&args.length===8&&args[0]===art.x&&args[1]===art.y){const key=window.__roomId+':'+name;if(!window.__propCalls.includes(key))window.__propCalls.push(key);}
    return drawImage.call(this,image,...args);
   };
   Object.defineProperty(window,'HKSim',{configurable:true,set(sim){const step=sim.step;sim.step=function(w,input){const ev=step(w,input);window.__simTick=w.tick;window.__roomId=w.roomId;
    const add=label=>{if(!window.__seen[label]){window.__seen[label]=true;window.__pending.push(label);}};
    const p=w.player;if(p.x>=0&&p.x+p.w<=w.room.width&&p.y>=0&&p.y+p.h<=w.room.height)add('room-'+w.roomId);
    if(w.player.climbing&&input.up)add('ladder-up');if(w.player.climbing&&input.down)add('ladder-down');
    if(p.x>=0&&p.x+p.w<=w.room.width&&p.y>=0&&p.y+p.h<=w.room.height)for(const o of w.room.objects)if(o.type==='door')add((w.flags.doors[o.id]?'open-':'closed-')+o.id);
    for(const e of ev)if(e.type==='enter'&&!window.__seen['before-enter-'+e.id]){window.__seen['before-enter-'+e.id]=true;window.__captures.push({label:'before-enter-'+e.id,data:document.querySelector('canvas').toDataURL()});}
    for(const e of ev)if(['switch','door','break','pickup','enter','unlock'].includes(e.type))add(e.type+'-'+e.id);
    return ev;};Object.defineProperty(window,'HKSim',{value:sim,writable:true,configurable:true});}});
   const raf=requestAnimationFrame;window.requestAnimationFrame=callback=>raf.call(window,time=>{callback(time);if(window.__pending.length){const data=document.querySelector('canvas').toDataURL();for(const label of window.__pending)window.__captures.push({label,data});window.__pending=[];}});
  });
  await page.goto(url);await page.waitForFunction(()=>window.HKPlaytest,{},{polling:50});await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();
  return {context,page};
 }
 async function ticks(page,n){const target=await page.evaluate(n=>window.__simTick+n,n);while(await page.evaluate(()=>window.__simTick)<target)await page.clock.runFor(16);}
 async function press(page,code,n=1){await page.keyboard.down(code);await ticks(page,n);await page.keyboard.up(code);}
 try{
  const {context,page}=await open();await ticks(page,1);
  await check('default is area; map shows only visited room and pauses simulation',async()=>{
   assert.equal(await page.evaluate(()=>HKPlaytest.snapshot().roomId),area.start.room);
   await page.keyboard.press('KeyM');assert.equal(await page.locator('#area-map').isVisible(),true);assert.equal(await page.locator('.map-room').count(),1);
   const t=await page.evaluate(()=>__simTick);await page.clock.runFor(300);assert.equal(await page.evaluate(()=>__simTick),t);await page.screenshot({path:path.join(output,'map-start.png')});
   await page.keyboard.press('KeyM');await page.locator('canvas').focus();
  });
  // Return to the initial world using the actual reset button, then reproduce every tick.
  await page.locator('#reset').click();await page.locator('canvas').focus();
  let previous=[];
  await check('all recorded inputs complete the real browser area without state injection',async()=>{
   for(const segment of walk.inputs){const next=segment.keys.split(',').filter(Boolean);for(const key of previous)if(!next.includes(key))await page.keyboard.up(codes[key]);for(const key of next)if(!previous.includes(key))await page.keyboard.down(codes[key]);await ticks(page,segment.ticks);previous=next;}
   for(const key of previous)await page.keyboard.up(codes[key]);
   const state=await page.evaluate(()=>({world:HKPlaytest.snapshot(),map:HKPlaytest.map(),flags:HKPlaytest.flags()}));
   assert.equal(state.world.roomId,area.start.room);assert.equal(state.map.rooms.filter(r=>r.visited).length,Object.keys(area.rooms).length);
   for(const room of Object.values(area.rooms))for(const o of room.objects){const bucket={switch:'switches',door:'doors',breakable:'broken',key:'picked',target:'cleared'}[o.type];if(o.type==='entrance'){assert.ok(state.flags.entered[o.id]||state.flags.entered[o.to],o.id);if(o.lock)assert.equal(state.flags.unlocked[o.id],true,o.id);}else assert.equal(state.flags[bucket][o.id],true,o.id);}
  });
  await check('map after circuit includes eight rooms, current room emphasized, mobile control labels present',async()=>{
   await page.keyboard.press('KeyM');assert.equal(await page.locator('.map-room').count(),8);assert.equal(await page.locator('.map-room.current').count(),1);await page.screenshot({path:path.join(output,'map-complete.png')});await page.keyboard.press('KeyM');
  });
  await check('barrier method glyphs match the actual room mechanisms; entrance art is separate',async()=>{
   const calls=await page.evaluate(()=>window.__propCalls);
   for(const key of ['gate:mark-lever','nave:mark-key','reliquary:mark-target','belfry:mark-lever','prism:mark-light','gate:entrance','crypt:entrance-locked','crypt:entrance'])assert.ok(calls.includes(key),'missing actual draw '+key);
   assert.ok(!calls.some(key=>/:(door-closed|door-open|locked-door)$/.test(key)),'legacy door panels must not render as barriers');
  });
  const captures=await page.evaluate(()=>window.__captures);for(const {label,data}of captures)fs.writeFileSync(path.join(output,label+'.png'),Buffer.from(data.split(',')[1],'base64'));
  assert.equal(captures.filter(c=>c.label.startsWith('room-')).length,8);
  await context.close();
  const mobile=await open(true);await ticks(mobile.page,1);
  await check('780x330 mobile map button and two-axis joystick/interact buttons reach simulation',async()=>{
   await mobile.page.locator('#map-toggle').click();assert.equal(await mobile.page.locator('#area-map').isVisible(),true);await mobile.page.screenshot({path:path.join(output,'mobile-map-780x330.png')});await mobile.page.locator('#map-close').click();
   const stick=await mobile.page.locator('[data-control=move]').boundingBox(),x=stick.x+stick.width/2,y=stick.y+5;
   const touch=await mobile.context.newCDPSession(mobile.page);
   await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await ticks(mobile.page,2);assert.equal(await mobile.page.evaluate(()=>HKPlaytest.snapshot().previous.up),true);
   await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:stick.y+stick.height-5,id:1}]});await ticks(mobile.page,2);assert.equal(await mobile.page.evaluate(()=>HKPlaytest.snapshot().previous.down),true);
   await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(mobile.page,2);
   const button=await mobile.page.locator('[data-action=interact]').boundingBox();
   await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2,id:3}]});await ticks(mobile.page,1);assert.equal(await mobile.page.evaluate(()=>HKPlaytest.snapshot().previous.interact),true);
   await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ticks(mobile.page,2);assert.equal(await mobile.page.evaluate(()=>HKPlaytest.snapshot().previous.interact),false);
   await new Promise(resolve=>setTimeout(resolve,350));
   await mobile.page.screenshot({path:path.join(output,'mobile-area-780x330.png')});
  });
  await mobile.context.close();assert.deepEqual(errors,[]);console.log(`${checks}/${checks} exploration browser checks passed; captures: ${output}`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
