// Adds trial-specific checks alongside pixel-render: real selected PNG failures,
// native anchors, equal game-space size, missing actions, mirrors and captures.
'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.HK_URL||'http://127.0.0.1:8766/games/the-hollow-keep/next/';
const output=path.join(__dirname,'..','assets','pixel-trial','comparison');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 let count=0;
 const check=async(name,run)=>{await run();count++;console.log('PASS '+name);};
 async function open(scale,mobile=false,fail=false){
  const ctx=await browser.newContext({viewport:mobile?{width:780,height:330}:{width:1280,height:900},deviceScaleFactor:mobile?2:1,hasTouch:mobile,isMobile:mobile});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{
   window.__sprites=[];const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(img,...args){
    if(/(?:ethan|noah)-.*\.png/.test(img.src||'')){
     const m=this.getTransform();window.__sprites.push({src:img.src,args,a:m.a});if(window.__sprites.length>50)window.__sprites.shift();
    }
    return draw.call(this,img,...args);
   };
  });
  if(fail)await page.route(new RegExp('pixel-trial/x'+scale+'/ethan-idle\\.png'),r=>r.fulfill({status:404,body:''}));
  const url=new URL(base);url.searchParams.set('art','trial-x'+scale);await page.goto(url.href);await page.locator('canvas').focus();
  await page.waitForFunction(()=>HKPlaytest.artStatus().loaded||HKPlaytest.artStatus().failed.length);
  await page.waitForFunction(()=>HKPlaytest.snapshot().tick>3);
  return {ctx,page,errors};
 }
 const ticks=async(p,n)=>{const t=await p.evaluate(()=>HKPlaytest.snapshot().tick);await p.waitForFunction(t=>HKPlaytest.snapshot().tick>=t,t+n);};
 try{for(const scale of [1,2]){
  const {ctx,page,errors}=await open(scale);
  await check('x'+scale+' loads correct native scale and draws sheets at equal game size',async()=>{
   assert.deepEqual(await page.evaluate(()=>HKPlaytest.artStatus()),{loaded:true,failed:[],scale});
   const m=await page.evaluate(()=>{const c=document.querySelector('canvas');return {width:c.width,css:c.getBoundingClientRect().width,dpr:devicePixelRatio,draw:window.__sprites.at(-1)};});
   assert.equal(m.width%(960*scale),0);assert.ok(m.width>=m.css*m.dpr-.5);
   assert.match(m.draw.src,new RegExp('/pixel-trial/x'+scale+'/ethan-idle'));
   assert.equal(m.draw.args[6],128);assert.equal(m.draw.args[7],96);
  });
  await page.screenshot({path:path.join(output,'pc-trial-x'+scale+'.png')});
  await check('x'+scale+' run and left mirror use trial sheet with native integer anchors',async()=>{
   await page.keyboard.down('KeyD');await ticks(page,10);await page.keyboard.up('KeyD');
   const calls=await page.evaluate(()=>window.__sprites);assert.ok(calls.some(x=>/ethan-run/.test(x.src)));
   await page.keyboard.down('KeyA');await ticks(page,5);await page.keyboard.up('KeyA');
   assert.ok((await page.evaluate(()=>window.__sprites)).some(x=>/ethan-run/.test(x.src)&&x.a<0));
  });
  await check('x'+scale+' missing jump draws fallback without substituting default sprites',async()=>{
   await page.evaluate(()=>window.__sprites=[]);await page.keyboard.down('Space');await ticks(page,8);
   const w=await page.evaluate(()=>HKPlaytest.snapshot());assert.equal(w.player.onGround,false);
   const calls=await page.evaluate(()=>window.__sprites);assert.ok(!calls.some(x=>/jump-|assets\/pixel\//.test(x.src)));
   await page.keyboard.up('Space');await ticks(page,60);
  });
  await page.locator('#reset').click();await page.locator('canvas').focus();await page.keyboard.press('KeyQ');await ticks(page,3);
  await page.screenshot({path:path.join(output,'pc-noah-trial-x'+scale+'.png')});assert.deepEqual(errors,[]);await ctx.close();
  const mobile=await open(scale,true);await check('x'+scale+' mobile capture retains 780x330 layout and same game-space body',async()=>{
   const c=await mobile.page.locator('canvas').boundingBox();assert.ok(c.width>=528&&c.height<=330);
   const w=await mobile.page.evaluate(()=>HKPlaytest.snapshot());assert.equal(w.player.h,68);assert.equal(w.player.w,42);
   await mobile.page.screenshot({path:path.join(output,'mobile-trial-x'+scale+'.png')});
   await mobile.page.keyboard.press('KeyQ');await ticks(mobile.page,3);
   await mobile.page.screenshot({path:path.join(output,'mobile-noah-trial-x'+scale+'.png')});
  });await mobile.ctx.close();
  const failed=await open(scale,false,true);await check('x'+scale+' actual trial idle 404 is reported and movement continues',async()=>{
   const status=await failed.page.evaluate(()=>HKPlaytest.artStatus());assert.equal(status.loaded,false);assert.ok(status.failed.includes('ethan-idle.png'));
   const before=await failed.page.evaluate(()=>HKPlaytest.snapshot());await failed.page.keyboard.down('KeyD');await ticks(failed.page,15);await failed.page.keyboard.up('KeyD');
   const after=await failed.page.evaluate(()=>HKPlaytest.snapshot());assert.ok(after.tick>before.tick&&after.player.x>before.player.x+10);assert.deepEqual(failed.errors,[]);
  });await failed.ctx.close();
 }}finally{await browser.close();}
 console.log(`${count}/${count} density-trial runtime checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
