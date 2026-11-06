const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.WGG_PLAYWRIGHT_PATH||'playwright');
const {serve}=require('./serve.cjs');
const lab=path.resolve(__dirname,'..'),repo=path.resolve(__dirname,'../../../..');
const evidence=path.join(lab,'evidence');fs.mkdirSync(evidence,{recursive:true});
(async()=>{
 const server=await serve(repo);let browser,context;const errors=[],external=[];let passed=0;
 try {
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-background-networking']});
  context=await browser.newContext({viewport:{width:1440,height:1100},recordVideo:process.env.WGG_VIDEO?{dir:evidence,size:{width:1440,height:1100}}:undefined});
  await context.addInitScript(()=>{Math.random=()=>.5;});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:'))external.push(r.url());});
  const url=`http://127.0.0.1:${server.address().port}/games/worlds-greatest-game/motion-lab/`;
  await page.goto(url);await page.waitForFunction(()=>!!window.motionLab);
  const state=()=>page.evaluate(()=>motionLab.state());
  const targets=()=>page.evaluate(()=>motionLab.targets());
  const project=p=>page.evaluate(p=>motionLab.project(p),p);
  const move=async(p,steps=1)=>page.mouse.move(p.x,p.y,{steps});
  const wait=ms=>page.waitForTimeout(ms);
  async function check(name,fn){await fn();console.log(`PASS ${name}`);passed++;}
  async function round(selection){await page.locator(`[data-hand="${selection}"]`).click();await page.locator('#start').click();await page.waitForFunction(()=>motionLab.state().phase==='react');}
  await check('initial scene loads locally without console errors',async()=>{await wait(300);assert.deepEqual(errors,[]);assert.equal((await state()).violations,0);await page.screenshot({path:path.join(evidence,'overview.png')});});
  await check('actual pointer hammer pickup and downward crown strike',async()=>{
    await round(2);const t=await targets();await move(t.hammer);await page.mouse.down();await wait(160);
    assert.equal((await state()).attached,true,JSON.stringify(await state()));
    const high=await project([0,2.05,-.49]);await move(high,6);await wait(130);
    const crown=(await state()).enemyCrown;const end=await project(crown);
    for(let i=1;i<=10;i++){await move({x:high.x+(end.x-high.x)*i/10,y:high.y+(end.y-high.y)*i/10});await wait(12);}
    await wait(80);const s=await state();console.log('hammer state',JSON.stringify(s));assert.equal(s.result,'hit');await page.mouse.up();await page.screenshot({path:path.join(evidence,'pointer-hit.png')});
  });
  await check('actual pointer pot pickup, wear and enemy 3D strike block',async()=>{
    await round(0);await move((await targets()).pot);await page.mouse.down();await wait(160);
    assert.equal((await state()).attached,true);
    await move((await targets()).player,8);await wait(180);
    console.log('pot state',JSON.stringify(await state()));assert.equal((await state()).equipped,true);
    await page.screenshot({path:path.join(evidence,'pointer-pot.png')});
    await page.waitForFunction(()=>motionLab.state().phase==='result',{timeout:3000});
    console.log('block state',JSON.stringify(await state()));assert.equal((await state()).result,'block');await page.mouse.up();
  });
  await check('wrong tool foul uses real pointerdown',async()=>{await round(2);await move((await targets()).pot);await page.mouse.down();await page.mouse.up();assert.equal((await state()).result,'foul');});
  await check('late actual pointer strike meets opponent real 3D pot guard',async()=>{
    await round(2);await move((await targets()).hammer);await page.mouse.down();await wait(160);
    const high=await project([0,2.05,-.49]);await move(high,6);await wait(850);
    const end=await project((await state()).enemyCrown);
    for(let i=1;i<=10;i++){await move({x:high.x+(end.x-high.x)*i/10,y:high.y+(end.y-high.y)*i/10});await wait(12);}
    await wait(50);assert.equal((await state()).result,'guarded');await page.mouse.up();
  });
  await check('tie tool foul',async()=>{await round(1);await move((await targets()).hammer);await page.mouse.down();await page.mouse.up();assert.equal((await state()).result,'foul');});
  await check('a held click does not attack automatically; release is a miss',async()=>{
    await round(2);await move((await targets()).hammer);await page.mouse.down();await wait(300);
    assert.equal((await state()).result,null);assert.equal((await state()).held,'hammer');
    await page.mouse.up();assert.equal((await state()).result,'miss');
  });
  await check('moving pot away removes defense; actual enemy swing hurts',async()=>{
    await round(0);await move((await targets()).pot);await page.mouse.down();await wait(150);
    await move((await targets()).player,5);await wait(140);assert.equal((await state()).equipped,true);
    await move(await project([.65,1.8,.49]),5);await wait(120);assert.equal((await state()).equipped,false);
    await page.mouse.up();await page.waitForFunction(()=>motionLab.state().phase==='result');assert.equal((await state()).result,'hurt');
  });
  await check('pointercancel and resize safely release captures and equipment',async()=>{
    await round(2);await move((await targets()).hammer);await page.mouse.down();await wait(150);
    await page.locator('#scene').dispatchEvent('pointercancel',{pointerId:1});assert.equal((await state()).held,null);await page.mouse.up();
    await round(0);await move((await targets()).pot);await page.mouse.down();await wait(150);await page.setViewportSize({width:1280,height:1000});await wait(50);assert.equal((await state()).held,null);assert.equal((await state()).equipped,false);await page.mouse.up();
    await page.setViewportSize({width:1440,height:1100});
  });
  await check('three camera views × reveal, load, impact, pot wear captures',async()=>{
    await page.locator('#bones').check();
    for(let cam=0;cam<3;cam++){
      await page.locator('#camera').selectOption(String(cam));
      for(const [name,kind,time] of [['reveal','small',1.12],['load','hammer',.4],['impact','hammer',.73],['pot','one',.285]]){
        await page.locator('#motion').selectOption(kind);
        await page.locator('#time').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}));},time);
        await wait(100);await page.screenshot({path:path.join(evidence,`camera-${cam}-${name}.png`)});
        assert.equal((await state()).violations,0);
      }
    }
  });
  await check('large RPS uses opposite hand, two-handed pot, slow motion and performance',async()=>{
    for(const kind of ['large','two']){await page.locator('#motion').selectOption(kind);await wait(150);assert.equal((await state()).violations,0);}
    await page.locator('#slow').check();await wait(200);await page.locator('#slow').uncheck();
    const benchmark=await page.evaluate(()=>new Promise(resolve=>{let last=null,frames=[];function sample(now){if(last!==null)frames.push(now-last);last=now;if(frames.length<330)requestAnimationFrame(sample);else{frames=frames.slice(30);const ordered=[...frames].sort((a,b)=>a-b);resolve({samples:frames.length,fps:1000/(frames.reduce((a,b)=>a+b,0)/frames.length),p95ms:ordered[Math.floor(ordered.length*.95)],maxMs:Math.max(...frames)});}}requestAnimationFrame(sample);}));
    const s=await state();fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify({passed:passed+1,benchmark,violations:s.violations,external,errors,viewport:'1440x1100',browser:await browser.version()},null,2));
    console.log('Measured performance',JSON.stringify(benchmark));assert.equal(s.violations,0);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  });
  if(process.env.WGG_VIDEO){const video=page.video();await page.close();await video.saveAs(path.join(evidence,'motion-lab-review.webm'));fs.unlinkSync(await video.path());}
  console.log(`${passed}/${passed} browser groups passed.`);
 } catch(e){console.error(e);const p=context?.pages()[0];if(p){console.log('STATE',await p.evaluate(()=>window.motionLab?.state()).catch(()=>null));await p.screenshot({path:path.join(evidence,'failure.png')}).catch(()=>{});}process.exitCode=1;}
 finally{if(context)await context.close();if(browser)await browser.close();await new Promise(r=>server.close(r));}
})();
