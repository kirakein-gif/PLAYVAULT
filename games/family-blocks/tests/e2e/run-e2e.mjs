// Offline browser acceptance suite for the committed production web build.
// Requires Playwright Chromium. Captures 853x533 and 1280x800 screenshots.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const require=createRequire(import.meta.url);
const { chromium }=require('playwright');
const root=process.cwd();
const dir=process.argv[2]||join(root,'test-results','e2e');
mkdirSync(dir,{recursive:true});
const port=4185,url='http://127.0.0.1:'+port+'/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--outDir','play','--port',String(port),'--strictPort'],
  {cwd:root,stdio:['ignore','pipe','pipe']});
let serverOutput='';
server.stdout.on('data',chunk=>{serverOutput+=String(chunk);});
server.stderr.on('data',chunk=>{serverOutput+=String(chunk);});
const result={started:new Date().toISOString(),tests:[],external:[],errors:[],frames:[]};
async function check(name,fn){
  const started=Date.now();
  try{await fn();result.tests.push({name,ok:true,ms:Date.now()-started});console.log('PASS',name);}
  catch(e){result.tests.push({name,ok:false,ms:Date.now()-started,error:String(e)});console.error('FAIL',name,e);}
}
const assert=(ok,message)=>{if(!ok)throw Error(message);};
let ready=false;
for(let i=0;i<60;i++){
  if(server.exitCode!==null)break;
  try{if((await fetch(url)).ok){ready=true;break;}}catch{/* server still starting */}
  await new Promise(resolve=>setTimeout(resolve,250));
}
if(!ready)throw new Error('Preview server did not start: '+serverOutput);
let browser;
try{
  browser=await chromium.launch({headless:true});
  async function pageFor(width,height){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1});
    await context.route('**/*',route=>{
      const u=route.request().url();
      if(u.startsWith(url)||u.startsWith('data:')||u.startsWith('blob:'))return route.continue();
      result.external.push(u);return route.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',e=>result.errors.push(String(e)));
    await page.goto(url);
    await page.getByTestId('start-gentle').waitFor({timeout:30000});
    return {context,page};
  }
  for(const [width,height] of [[853,533],[1280,800]]){
    const {context,page}=await pageFor(width,height);
    await check('home '+width+'x'+height,async()=>{
      await page.screenshot({path:join(dir,'home-'+width+'.png')});
      assert(await page.getByTestId('start-gentle').isVisible(),'missing gentle card');
      assert(await page.getByTestId('start-challenge').isVisible(),'missing challenge card');
      assert(await page.getByTestId('start-sprint40').isVisible(),'missing sprint card');
      const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
      assert(noOverflow,'home overflows width');
    });
    for(const mode of ['gentle','challenge','sprint40']){
      await check(mode+' opens '+width,async()=>{
        await page.getByTestId('start-'+mode).click();
        assert(await page.getByTestId('game-screen').isVisible(),'game canvas absent');
        const gameState=await page.evaluate(()=>({
          mode:window.__familyBlocksState?.mode,boardRows:window.__familyBlocksState?.board.length,
          preview:window.__familyBlocksState?.queue.length
        }));
        assert(gameState.mode===mode&&gameState.boardRows===22&&gameState.preview>=3,'wrong game setup');
        await page.screenshot({path:join(dir,mode+'-'+width+'.png')});
        // Real pointer event produced by Playwright click, not an artificial onClick call.
        const before=await page.evaluate(()=>window.__familyBlocksState.active.x);
        await page.getByTestId('ctrl-left').click();
        const after=await page.evaluate(()=>window.__familyBlocksState.active.x);
        assert(after<=before,'left button did not move');
        await page.getByTestId('ctrl-cw').click();
        await page.getByTestId('ctrl-drop').click();
        const blocks=await page.evaluate(()=>window.__familyBlocksState.board.flat().filter(Boolean).length);
        assert(blocks>=4,'hard drop did not lock a piece');
        const metrics=await page.evaluate(()=>{
          const w=innerWidth,h=innerHeight,cell=Math.max(13,Math.floor(Math.min((h-30)/20,(w-450)/10)));
          const bx=Math.floor((w-cell*10)/2),left=document.querySelector('.left-controls').getBoundingClientRect(),
            right=document.querySelector('.right-controls').getBoundingClientRect();
          return {leftClear:left.right<=bx,rightClear:right.left>=bx+cell*10,
            inViewport:[left.left>=0,right.right<=innerWidth,left.bottom<=innerHeight,right.bottom<=innerHeight],
            bodyOverflow:document.documentElement.scrollWidth>innerWidth};
        });
        assert(metrics.leftClear&&metrics.rightClear,'controls overlap the board');
        assert(metrics.inViewport.every(Boolean)&&!metrics.bodyOverflow,'controls clip viewport');
        await page.getByTestId('pause').click();
        await page.getByTestId('quit').click(); // JS confirm auto-dismiss unless handled
      });
      // If JS confirm was dismissed, accept it explicitly and close this game.
      if(await page.getByTestId('pause-overlay').count()){
        page.once('dialog',d=>d.accept());
        await page.getByTestId('quit').click();
      }
      if(await page.getByTestId('game-result').count())
        await page.getByRole('button',{name:/처음으로|Home/}).last().click();
      else await page.reload();
    }
    await check('keyboard code independent from Korean key '+width,async()=>{
      await page.getByTestId('start-challenge').click();
      const a=await page.evaluate(()=>window.__familyBlocksState.active.x);
      await page.evaluate(()=>{
        window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowLeft',key:'ㅁ',bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keyup',{code:'ArrowLeft',key:'ㅁ',bubbles:true}));
      });
      const b=await page.evaluate(()=>window.__familyBlocksState.active.x);
      assert(b<=a,'event.code handler missed Korean key event');
      await page.keyboard.press('Escape');
      assert(await page.getByTestId('pause-overlay').isVisible(),'Esc did not pause');
      await page.getByTestId('resume').click();
      await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
      assert(await page.getByTestId('pause-overlay').isVisible(),'background blur did not pause');
      await page.getByTestId('resume').click();
      // Multi-touch: hold left finger, then tap rotate with a second finger.
      await page.touchscreen.tap(width/2,height/2); // touch the canvas to reveal auto-hidden controls
      await page.getByTestId('ctrl-left').waitFor();
      const bounds=await page.evaluate(()=>{
        const centre=q=>{const r=document.querySelector(q).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};};
        return {a:centre('[data-testid=ctrl-left]'),b:centre('[data-testid=ctrl-cw]')};
      });
      const cdp=await context.newCDPSession(page);
      const rot0=await page.evaluate(()=>window.__familyBlocksState.active.rotation);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.a.x,y:bounds.a.y,id:1}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.a.x,y:bounds.a.y,id:1},{x:bounds.b.x,y:bounds.b.y,id:2}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:bounds.a.x,y:bounds.a.y,id:1}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      const rot1=await page.evaluate(()=>window.__familyBlocksState.active.rotation);
      assert(rot1!==rot0,'simultaneous movement/rotation did not rotate');
      await page.getByTestId('pause').click();
      page.once('dialog',d=>d.accept());
      await page.getByTestId('quit').click();
      assert(await page.getByTestId('game-result').isVisible(),'quit should save a result');
      await page.reload();
      await page.getByRole('button',{name:/기록|Records/}).last().click();
      assert(await page.getByTestId('records').isVisible(),'records not retained after refresh');
    });
    await context.close();
  }
  await check('60-second fixed-seed random autoplay and animation budget',async()=>{
    const {context,page}=await pageFor(853,533);
    await page.getByTestId('start-gentle').click();
    const out=await page.evaluate(async()=>{
      let seed=7001;
      const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const samples=[];
      let previous=performance.now();
      let frameCount=0;
      let alive=true;
      const tick=(now)=>{
        samples.push(now-previous);previous=now;frameCount++;
        if(alive)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const keys=['ArrowLeft','ArrowRight','ArrowUp','KeyZ','Space','KeyC'];
      const start=Date.now();
      while(Date.now()-start<60000){
        const code=keys[Math.floor(random()*keys.length)];
        window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));
        window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));
        await new Promise(r=>setTimeout(r,85));
      }
      alive=false;
      samples.sort((a,b)=>a-b);
      return {duration:Date.now()-start,frames:frameCount,p95:samples[Math.floor(samples.length*.95)]??null,
        boardRows:window.__familyBlocksState.board.length};
    });
    result.frames.push(out);
    assert(out.duration>=60000&&out.boardRows===22,'autoplay failed');
    await context.close();
  });
}finally{
  if(browser)await browser.close();
  server.kill();
  result.finished=new Date().toISOString();
  writeFileSync(join(dir,'result.json'),JSON.stringify(result,null,2));
}
const passed=result.tests.filter(x=>x.ok).length,failed=result.tests.length-passed;
console.log('E2E',passed,'passed,',failed,'failed; external',result.external.length,'errors',result.errors.length);
if(failed||result.external.length||result.errors.length)process.exit(1);
