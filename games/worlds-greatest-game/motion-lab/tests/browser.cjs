const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.WGG_PLAYWRIGHT_PATH||'playwright');
const {serve}=require('./serve.cjs');
const lab=path.resolve(__dirname,'..'),repo=path.resolve(__dirname,'../../../..');
const evidence=path.join(lab,'evidence','revision-01-1');fs.mkdirSync(evidence,{recursive:true});
async function launch(){
 const common={headless:true,args:['--disable-background-networking',...(process.env.WGG_SOFTWARE_GL?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:[])]};
 if(process.env.WGG_BROWSER_EXECUTABLE)return chromium.launch({...common,executablePath:process.env.WGG_BROWSER_EXECUTABLE});
 if(process.env.WGG_BROWSER_CHANNEL==='chromium')return chromium.launch(common);
 try{return await chromium.launch({...common,channel:process.env.WGG_BROWSER_CHANNEL||'chrome'});}
 catch(error){console.log('Chrome unavailable; trying installed Chromium.');return chromium.launch(common);}
}
(async()=>{
 const server=await serve(repo);let browser;const runs=[];
 try{
  browser=await launch();
  for(const fps of [30,60]){
   const recording=process.env.WGG_VIDEO&&fps===60;
   const context=await browser.newContext({viewport:{width:1440,height:1100},recordVideo:recording?{dir:evidence,size:{width:1440,height:1100}}:undefined});
   await context.addInitScript(()=>{Math.random=()=>.5;});
   const page=await context.newPage(),errors=[],external=[],checks=[],captures={},motion={};let realtime=!!recording;
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:'))external.push(r.url());});
   try{
    // Install/pause before navigation: GPU work and Playwright round trips cannot
    // advance match time. Only runFor advances the clock. rAF is sampled at fps.
    await page.clock.install({time:new Date(0)});await page.clock.pauseAt(new Date(1000));
    await page.goto(`http://127.0.0.1:${server.address().port}/games/worlds-greatest-game/motion-lab/`);
    await page.evaluate(fps=>{window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),1000/fps);},fps);
    const tick=async ms=>{if(!realtime){await page.clock.runFor(ms);return;}let left=ms;while(left>0){const dt=Math.min(left,1000/fps);await page.clock.runFor(dt);await new Promise(r=>setTimeout(r,dt));left-=dt;}};
    const state=()=>page.evaluate(()=>motionLab.state()),target=()=>page.evaluate(()=>motionLab.targets());
    const click=selector=>page.locator(selector).click({force:true});
    async function resize(width,height){
     await page.evaluate(()=>{window.__resizeObserved=false;addEventListener('resize',()=>window.__resizeObserved=true,{once:true});});
     await page.setViewportSize({width,height});
     // Native viewport delivery is outside page.clock. The match clock remains
     // paused while waiting for the browser to deliver this OS/browser event.
     for(let i=0;i<100;i++){if(await page.evaluate(()=>window.__resizeObserved))return;await new Promise(r=>setTimeout(r,5));}
     throw Error('Native resize event not delivered');
    }
    async function check(name,fn){await fn();checks.push(name);console.log(`PASS ${fps}fps ${name}`);}
    async function advanceTo(time){await tick(Math.max(0,(time-(await state()).eventTime)*1000));}
    async function round(hand,{capture=false}={}){
     await click('#start');assert.equal((await state()).selection,null);await tick(40);await page.keyboard.press(String(hand+1));
     const s=await state();await advanceTo(s.zeroAt+.22+2/fps);
     assert.equal((await state()).phase,'react');
     if(capture)await captureMoment('reveal');
    }
    async function captureMoment(name){
     const v=await page.evaluate(()=>motionLab.visibility());if(Object.values(v).some(p=>p.occluded))console.log('OCCLUSION',name,JSON.stringify(v));
     for(const [part,p] of Object.entries(v)){assert.equal(p.inFrame,true,`${name} ${part} outside frame`);assert.equal(p.occluded,false,`${name} ${part} occluded`);}
     captures[name]=v;await page.screenshot({path:path.join(evidence,`${process.env.WGG_BROWSER_CHANNEL==='chromium'?'chromium-':''}${fps}fps-${name}.png`)});
    }
    let cursor=null;
    async function grab(kind){const p=(await target())[kind];await page.mouse.move(p.x,p.y);cursor=p;await page.mouse.down();await tick(140);assert.equal((await state()).attached,true,JSON.stringify(await state()));return page.evaluate(kind=>motionLab.guide(kind),kind);}
    async function moveTo(point,ms,{stopOnResult=false}={}){
     const from=cursor,steps=Math.max(2,Math.ceil(ms/(1000/fps)));
     for(let i=1;i<=steps;i++){
      const p={x:from.x+(point.x-from.x)*i/steps,y:from.y+(point.y-from.y)*i/steps};
      await page.mouse.move(p.x,p.y);cursor=p;await tick(ms/steps);
      assert.ok((await state()).playerArm.lift<112,'vertical overhead arm');
      if(stopOnResult&&(await state()).phase==='result')break;
     }
    }
    async function finish(){for(let i=0;i<70&&(await state()).phase!=='result';i++)await tick(1000/fps);return state();}
    await tick(50);
    await check('direct loaded short arc hits crown; camera head/hand visible',async()=>{
     await round(2,{capture:true});const g=await grab('hammer');await moveTo(g[1],200);await tick(80);
     const loaded=await state();assert.equal(loaded.loaded,true);assert.ok(loaded.playerArm.inner>=70&&loaded.playerArm.inner<=85);assert.ok(loaded.playerArm.lift>=85&&loaded.playerArm.lift<=100);
     motion.load=loaded.playerArm;await captureMoment('load');
     await moveTo(g[2],150);await tick(45);const peak=await state();assert.equal(peak.peakSeen,true);assert.ok(peak.playerArm.inner>=160);assert.ok(peak.playerArm.lift>=104&&peak.playerArm.lift<=110);motion.peak=peak.playerArm;
     await captureMoment('peak');await moveTo(g[3],160,{stopOnResult:true});const hit=await finish();
     assert.equal(hit.result,'hit');assert.equal(hit.loaded,true);assert.equal(hit.peakSeen,true);assert.ok(hit.contactPose.inner>=160);assert.ok(hit.contactPose.lift>=94&&hit.contactPose.lift<=100);motion.contact=hit.contactPose;
     await captureMoment('impact');await page.mouse.up();
    });
    await check('direct one-hand pot uses 55/75 and bows head; blocks 3D strike',async()=>{
     await round(0);const g=await grab('pot');await moveTo(g[1],240);await tick(100);
     const s=await state();assert.equal(s.equipped,true,JSON.stringify(s));assert.ok(s.playerArm.inner>=55-1e-6&&s.playerArm.inner<58);assert.ok(Math.abs(s.playerArm.lift-75)<2);assert.ok(s.playerArm.neck>=17);motion.pot=s.playerArm;
     await captureMoment('pot');const end=await finish();assert.equal(end.result,'block');await page.mouse.up();
    });
    realtime=false;
    await check('one pixel continuity across old surface boundary; 0 input violations',async()=>{
     await round(2);await grab('hammer');const start={...cursor};
     for(let i=1;i<=55;i++){const old=await state();await page.mouse.move(start.x,start.y-i);cursor={x:start.x,y:start.y-i};const s=await state();const d=Math.hypot(...s.requestedHand.map((v,k)=>v-old.requestedHand[k]));assert.ok(d<=s.maxAllowedRatio+1e-8);}
     for(let i=54;i>=15;i--){await page.mouse.move(start.x,start.y-i);cursor={x:start.x,y:start.y-i};}
     assert.equal((await state()).inputViolations,0);await page.locator('#scene').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();
    });
    await check('legacy vertical overhead cursor path cannot make a vertical arm',async()=>{
     await round(2);await grab('hammer');const high=await page.evaluate(()=>motionLab.project([0,2.05,-.49]));await moveTo(high,200);await tick(80);
     const crown=(await target()).enemy;await moveTo(crown,180,{stopOnResult:true});const s=await finish();
     assert.equal(s.result,'miss');motion.verticalResult=s.result;await page.mouse.up();
    });
    await check('late attack meets actual opponent pot guard',async()=>{
     await round(2);const g=await grab('hammer');await moveTo(g[1],180);await tick(80);await moveTo(g[2],150);await tick(500);
     await moveTo(g[3],160,{stopOnResult:true});assert.equal((await finish()).result,'guarded');await page.mouse.up();
    });
    await check('wrong tool and tie tool remain fouls',async()=>{
     for(const [hand,kind] of [[2,'pot'],[1,'hammer']]){await round(hand);const p=(await target())[kind];await page.mouse.move(p.x,p.y);await page.mouse.down();await tick(40);assert.equal((await state()).result,'foul');await page.mouse.up();}
    });
    await check('held click cannot auto-attack; release is miss',async()=>{
     await round(2);await grab('hammer');await tick(300);assert.equal((await state()).result,null);assert.equal((await state()).requestedProgress,0);await page.mouse.up();assert.equal((await state()).result,'miss');
    });
    await check('pot retreat removes defense and allows actual enemy hit',async()=>{
     await round(0);const g=await grab('pot');await moveTo(g[1],220);await tick(100);assert.equal((await state()).equipped,true);await moveTo(g[0],180);await tick(50);assert.equal((await state()).equipped,false);await page.mouse.up();assert.equal((await finish()).result,'hurt');
    });
    await check('cancel, focus loss and resize release captures',async()=>{
     for(const action of ['cancel','blur','resize']){
      await round(2);await grab('hammer');
      if(action==='cancel')await page.locator('#scene').dispatchEvent('pointercancel',{pointerId:1});
      if(action==='blur')await page.evaluate(()=>dispatchEvent(new Event('blur')));
      if(action==='resize'){await resize(1280,1000);await tick(40);}
      assert.equal((await state()).held,null);assert.equal((await state()).equipped,false);await page.mouse.up();
     }await resize(1440,1100);await tick(40);
    });
    await check('2-1-0 chants, just-before-zero selection succeeds',async()=>{
     await click('#start');await tick(40);assert.match(await page.locator('#cue').textContent(),/2 가위/);const s=await state();await advanceTo(s.at+.53);assert.match(await page.locator('#cue').textContent(),/1 바위/);
     await advanceTo(s.zeroAt-.005);await page.keyboard.press('3');await advanceTo(s.zeroAt+.05);assert.equal((await state()).phase,'reveal');assert.match(await page.locator('#cue').textContent(),/0 보/);await advanceTo(s.zeroAt+.26);assert.equal((await state()).phase,'react');
    });
    await check('late/no choice foul, including a change attempted after zero',async()=>{
     await click('#start');let s=await state();await advanceTo(s.zeroAt+.01);await page.keyboard.press('3');assert.equal((await state()).result,'foul');assert.equal((await state()).reason,'늦은 손');
     await click('#start');await tick(40);await page.keyboard.press('1');s=await state();await advanceTo(s.zeroAt+.01);await page.keyboard.press('3');assert.equal((await state()).result,'foul');assert.equal((await state()).reason,'늦은 손');
    });
    await check('last pre-zero choice wins and next round inherits nothing',async()=>{
     await click('#start');await tick(40);await page.keyboard.press('1');let s=await state();await advanceTo(s.zeroAt-.01);await click('[data-hand="2"]');await advanceTo(s.zeroAt+.26);assert.equal((await state()).selection,2);assert.equal((await state()).rule,'win');
     await click('#start');assert.equal((await state()).selection,null);s=await state();await advanceTo(s.zeroAt+.05);assert.equal((await state()).result,'foul');
    });
    await check('adjustable beat preserves hidden hands; snap setting remains bounded',async()=>{
     for(const beat of [.3,.7]){
      await page.locator('#beat').fill(String(beat));await page.locator('#beat').dispatchEvent('change');await click('#start');await tick(20);await page.keyboard.press('3');const s=await state();assert.ok(Math.abs(s.zeroAt-s.at-beat*2)<1e-6);
      await advanceTo(s.zeroAt-.11);assert.equal((await state()).handReveal,0);await advanceTo(s.zeroAt+.11);assert.equal((await state()).handReveal,0);await advanceTo(s.zeroAt+.20);assert.ok((await state()).handReveal>0);await advanceTo(s.zeroAt+2.2);
     }
     await page.locator('#beat').fill('.45');await page.locator('#beat').dispatchEvent('change');await page.locator('#snap').fill('20');await page.locator('#snap').dispatchEvent('input');assert.equal(await page.locator('#snap').inputValue(),'20');
     await page.locator('#snap').fill('8');await page.locator('#snap').dispatchEvent('input');
    });
    await check('three cameras, large opposite hand, two-hand pot and slow motion',async()=>{
     for(const cam of ['1','2','0']){await page.locator('#camera').selectOption(cam);await tick(50);assert.equal((await state()).camera,+cam);}
     for(const kind of ['large','one','two']){await page.locator('#motion').selectOption(kind);await tick(400);assert.equal((await state()).violations,0);}
     await page.locator('#slow').check();await tick(160);await page.locator('#slow').uncheck();
    });
    const final=await state();assert.equal(final.violations,0);assert.equal(final.inputViolations,0);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    const result={clockFps:fps,passed:checks.length,checks,motion,captures,outcomes:{strike:'hit',defense:'block',opponentGuard:'guarded',vertical:'miss',lateHand:'foul'},violations:final.violations,inputViolations:final.inputViolations,maxTargetRatio:final.maxTargetRatio,errors,external};runs.push(result);
    if(recording){const video=page.video();await page.close();await video.saveAs(path.join(evidence,'direct-load-short-arc-and-pot.webm'));fs.unlinkSync(await video.path());}
   }catch(error){console.error(`FAIL ${fps}fps`,error);console.log('STATE',await page.evaluate(()=>window.motionLab?.state()).catch(()=>null));await page.screenshot({path:path.join(evidence,`${fps}fps-failure.png`)}).catch(()=>{});throw error;}
   finally{await context.close();}
  }
  assert.deepEqual(runs[0].outcomes,runs[1].outcomes);
  fs.writeFileSync(path.join(evidence,process.env.WGG_BROWSER_CHANNEL==='chromium'?'chromium-results.json':'browser-results.json'),JSON.stringify({browser:await browser.version(),softwareGL:!!process.env.WGG_SOFTWARE_GL,viewport:'1440x1100',clock:'page.clock paused; rAF callbacks at 30/60fps',runs},null,2));
  console.log(`PASS matrix: ${runs.map(r=>`${r.clockFps}fps ${r.passed}/${r.passed}`).join(', ')}`);
 }catch(error){console.error(error);process.exitCode=1;}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})();
