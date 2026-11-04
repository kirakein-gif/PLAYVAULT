// Installed Android tablet APK acceptance, executed with Wi-Fi/data disabled.
// Playwright's Android WebView driver observes the actual APK; adb performs touch.
const { _android: android }=require('playwright');
const fs=require('fs'),path=require('path');
const PKG='com.playvault.familyblocks';
const out=process.argv[2]||'android-smoke';
fs.mkdirSync(out,{recursive:true});
const state={started:new Date().toISOString(),checks:[],errors:[],external:[],ok:false};
const log=(label,info={})=>{state.checks.push({label,...info});console.log(label,info);};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const [device]=await android.devices();
 if(!device)throw Error('No Android device');
 for(const command of ['svc wifi disable','svc data disable','cmd connectivity airplane-mode enable'])
   await device.shell(command).catch(()=>{});
 log('network disabled');
 await device.shell('am force-stop '+PKG);
 await device.shell('am start -n '+PKG+'/.MainActivity');
 const web=await device.webView({pkg:PKG},{timeout:60000});
 const page=await web.page();
 page.on('request',r=>{
   const u=r.url();
   if(!/^(https?:\/\/localhost|data:|blob:|about:)/.test(u))state.external.push(u);
 });
 page.on('pageerror',e=>state.errors.push(String(e)));
 async function exists(q){return page.evaluate(sel=>!!document.querySelector(sel),q);}
 async function waitSelector(q){
   await page.waitForFunction(sel=>!!document.querySelector(sel),q,{polling:300,timeout:60000});
 }
 async function click(q){
   await waitSelector(q);
   await page.evaluate(sel=>document.querySelector(sel).click(),q);
   await wait(500);
 }
 async function tap(q){
   await waitSelector(q);
   // Coordinate mapping through the WebView avoids mixing the Android
   // status/task bars (physical 1280×800) with CSS viewport height (~716).
   // Playwright sends a real touchscreen tap, not a JS-dispatched event.
   await page.locator(q).tap({force:true,timeout:15000});
   await wait(450);
 }
 await waitSelector('[data-testid=start-gentle]');
 log('home loaded',{size:await page.evaluate(()=>[innerWidth,innerHeight])});
 await wait(1300);
 await device.screenshot({path:path.join(out,'home.png')});
 await click('[data-testid=start-gentle]');
 await waitSelector('[data-testid=game-screen]');
 const before=await page.evaluate(()=>window.__familyBlocksState.active.x);
 await tap('[data-testid=ctrl-left]');
 const after=await page.evaluate(()=>window.__familyBlocksState.active.x);
 if(after!==before-1)throw Error('Physical left tap did not move the active piece by one cell: '+before+' → '+after);
 await tap('[data-testid=ctrl-cw]');
 await tap('[data-testid=ctrl-drop]');
 const pieces=await page.evaluate(()=>window.__familyBlocksState.board.flat().filter(Boolean).length);
 if(pieces<4)throw Error('Hard drop did not lock a piece');
 log('game touch movement and drop',{before,after,pieces});
 await device.screenshot({path:path.join(out,'game.png')});
 await click('[data-testid=pause]');
 await waitSelector('[data-testid=pause-overlay]');
 // Android WebView confirm dialogs are handled through the Playwright JS dialog listener.
 page.on('dialog',d=>void d.accept());
 await click('[data-testid=quit]');
 await waitSelector('[data-testid=game-result]');
 log('game completed and result shown');
 await device.screenshot({path:path.join(out,'result.png')});
 await wait(1100);
 await device.shell('am force-stop '+PKG);
 await device.shell('am start -n '+PKG+'/.MainActivity');
 const restart=await device.webView({pkg:PKG},{timeout:60000});
 const reloaded=await restart.page();
 await reloaded.waitForFunction(()=>!!document.querySelector('[data-testid=start-gentle]'),null,{polling:300,timeout:60000});
 await reloaded.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/기록|Records/.test(x.textContent)).click());
 await reloaded.waitForFunction(()=>!!document.querySelector('[data-testid=records]'),null,{polling:300,timeout:30000});
 const text=await reloaded.evaluate(()=>document.querySelector('[data-testid=records]').textContent);
 if(!/1/.test(text))throw Error('Result missing after app restart');
 log('saved record persisted after full process restart');
 state.ok=state.errors.length===0&&state.external.length===0;
 state.finished=new Date().toISOString();
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(state,null,2));
 await device.close();
 if(!state.ok)throw Error('JavaScript errors or external network requests observed');
 console.log('ANDROID SMOKE: PASS');
})().catch(e=>{
 state.errors.push(String(e?.stack||e));
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(state,null,2));
 console.error('ANDROID SMOKE: FAIL',e);process.exit(1);
});
