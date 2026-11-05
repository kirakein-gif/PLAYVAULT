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
    // Stable scenario seed 77 starts with a T piece. Random starts can be O,
    // whose rotation is intentionally a no-op; that must not fail multi-touch.
    await page.goto(url+'?seed=77');
    await page.getByTestId('start-gentle').waitFor({timeout:30000});
    return {context,page};
  }
  // landscape (PC web) and portrait (the APK is locked upright since 2026-11-05)
  for(const [width,height] of [[853,533],[1280,800],[533,853],[800,1280]]){
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
          preview:window.__familyBlocksState?.queue.length,active:{...window.__familyBlocksState.active}
        }));
        assert(gameState.mode===mode&&gameState.boardRows===22&&gameState.preview>=3,'wrong game setup');
        assert(gameState.active.kind==='T'&&gameState.active.y===1,
          'seeded T must spawn with its bottom row visible immediately: '+JSON.stringify(gameState.active));
        await page.screenshot({path:join(dir,mode+'-'+width+'.png')});
        // Verify a real painted cell in the first visible row, not just a ghost.
        const painted=await page.evaluate(()=>{
          const cv=document.querySelector('.game-canvas'),s=window.__familyBlocksState;
          const w=cv.clientWidth,dpr=cv.width/w,L=window.__familyBlocksLayout;
          const cell=L.cell,bx=L.boardX,by=L.boardY;
          const x=Math.round((bx+(s.active.x+1.5)*cell)*dpr);
          const y=Math.round((by+cell/2)*dpr);
          return [...cv.getContext('2d').getImageData(x,y,1,1).data];
        });
        assert(painted[0]+painted[1]+painted[2]>125,
          'first-row block is not visibly painted: '+painted.join(','));
        // Real pointer event produced by Playwright click, not an artificial onClick call.
        const before=await page.evaluate(()=>window.__familyBlocksState.active.x);
        await page.getByTestId('ctrl-left').click();
        const after=await page.evaluate(()=>window.__familyBlocksState.active.x);
        assert(after===before-1,'left button must move exactly one cell: '+before+' → '+after);
        await page.getByTestId('ctrl-cw').click();
        await page.getByTestId('ctrl-drop').click();
        const blocks=await page.evaluate(()=>window.__familyBlocksState.board.flat().filter(Boolean).length);
        assert(blocks>=4,'hard drop did not lock a piece');
        // Uses the layout the renderer really drew (portrait and landscape differ).
        const metrics=await page.evaluate(()=>{
          const L=window.__familyBlocksLayout;
          const board={x:L.boardX,y:L.boardY,w:L.boardRight-L.boardX,h:L.boardBottom-L.boardY};
          const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,id:e.dataset.testid||e.className};};
          const buttons=[...document.querySelectorAll('.touch-button,.button-pause')].map(box);
          const hit=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
          const overlaps=[];
          for(const b of buttons){
            if(hit(b,board))overlaps.push('board×'+b.id);
            for(const [k,t] of Object.entries(L.texts))if(hit(b,t))overlaps.push(k+'×'+b.id);
          }
          const left=document.querySelector('.left-controls').getBoundingClientRect(),
            right=document.querySelector('.right-controls').getBoundingClientRect();
          return {mode:L.mode,overlaps,
            textsInView:Object.values(L.texts).every(t=>t.x>=0&&t.x+t.w<=innerWidth&&t.y>=0&&t.y+t.h<=innerHeight),
            inViewport:[left.left>=0,right.right<=innerWidth,left.bottom<=innerHeight,right.bottom<=innerHeight],
            bodyOverflow:document.documentElement.scrollWidth>innerWidth};
        });
        assert(metrics.mode===(height>width?'portrait':'landscape'),'wrong layout mode '+metrics.mode);
        assert(metrics.overlaps.length===0,'buttons overlap the board or HUD text: '+metrics.overlaps.join(', '));
        assert(metrics.textsInView,'HUD text outside the screen');
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
      assert(b===a-1,'Korean keycode must move exactly one cell: '+a+' → '+b);
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
      const initial=await page.evaluate(()=>({rotation:window.__familyBlocksState.active.rotation,
        kind:window.__familyBlocksState.active.kind}));
      assert(initial.kind==='T','fixed-seed multi-touch setup unexpectedly changed: '+initial.kind);
      const rot0=initial.rotation;
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
      await page.getByRole('button',{name:/처음으로|Home/}).last().click();
      await page.getByRole('button',{name:/기록|Records/}).last().click();
      const snapshot=await page.evaluate(()=>({
        challenge:document.querySelector('[data-testid=record-challenge]')?.textContent,
        recent:[...document.querySelectorAll('[data-testid=recent-games] p')].map(e=>e.textContent),
      }));
      assert(/게임 횟수:\s*[1-9]/.test(snapshot.challenge??''),'saved challenge games count is missing');
      assert(snapshot.recent.some(t=>t.includes('도전')),'saved challenge entry is missing');
      // Don't reload until Preferences has actually flushed the completed game.
      await page.waitForFunction(()=>Object.keys(localStorage)
        .some(k=>k.includes('family-blocks.data.v1')),{},{polling:100,timeout:10000});
      await page.reload();
      await page.getByRole('button',{name:/기록|Records/}).last().click();
      const reloaded=await page.evaluate(()=>({
        challenge:document.querySelector('[data-testid=record-challenge]')?.textContent,
        recent:[...document.querySelectorAll('[data-testid=recent-games] p')].map(e=>e.textContent),
      }));
      assert(JSON.stringify(reloaded)===JSON.stringify(snapshot),
        'saved games count or recent records changed after reload: '+JSON.stringify({snapshot,reloaded}));
    });
    await context.close();
  }
  await check('full screen button (web) enters and leaves',async()=>{
    const {context,page}=await pageFor(1280,800);
    assert((await page.getByTestId('fullscreen-btn').getAttribute('data-on'))==='0','starts windowed');
    await page.getByTestId('fullscreen-btn').click();
    await page.waitForFunction(()=>!!document.fullscreenElement,null,{timeout:5000});
    assert((await page.getByTestId('fullscreen-btn').getAttribute('data-on'))==='1','button shows full screen');
    await page.getByTestId('fullscreen-btn').click();
    await page.waitForFunction(()=>!document.fullscreenElement,null,{timeout:5000});
    await context.close();
  });
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
