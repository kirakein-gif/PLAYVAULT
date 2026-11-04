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
   // Android WebView pages do not consistently advertise hasTouch to Playwright
   // (locator.tap can throw "page does not support tap"). ADB input tap sends
   // real Android touchscreen input through the app's window instead of a
   // synthesized DOM event, so the native APK acceptance remains meaningful.
   const target=await page.evaluate(sel=>{
     const el=document.querySelector(sel),r=el.getBoundingClientRect();
     const x=r.left+r.width/2,y=r.top+r.height/2;
     return {x,y,width:r.width,height:r.height,
       hit:document.elementFromPoint(x,y)?.closest('button')?.getAttribute('data-testid')};
   },q);
   const id=q.startsWith('[data-testid=') && q.endsWith(']')
     ? q.slice('[data-testid='.length,-1) : null;
   if(target.hit!==id)throw Error('Touch target obscured or outside viewport: '+q+' '+JSON.stringify(target));
   // This CI emulator is an Android 14 1280x800 tablet at 160dpi.
   // The 24px top status bar is outside the WebView's 1280x716 CSS viewport;
   // its bottom taskbar occupies the remaining area.
   const physicalX=Math.round(target.x),physicalY=Math.round(target.y+24);
   log('adb touch',{target:q,physicalX,physicalY});
   await device.shell('input tap '+physicalX+' '+physicalY);
   await wait(500);
 }
 await waitSelector('[data-testid=start-gentle]');
 log('home loaded',{size:await page.evaluate(()=>[innerWidth,innerHeight])});
 await wait(1300);
 await device.screenshot({path:path.join(out,'home.png')});
 await click('[data-testid=start-gentle]');
 await waitSelector('[data-testid=game-screen]');
 // Any kind entering an empty board must already show its bottom cells.
 const spawnState=await page.evaluate(()=>({kind:window.__familyBlocksState.active.kind,
   y:window.__familyBlocksState.active.y,ticks:window.__familyBlocksState.ticks}));
 if(spawnState.y!==1)throw Error('New piece is hidden at start: '+JSON.stringify(spawnState));
 log('new piece visible at spawn',spawnState);
 const before=await page.evaluate(()=>window.__familyBlocksState.active.x);
 await tap('[data-testid=ctrl-left]');
 const after=await page.evaluate(()=>window.__familyBlocksState.active.x);
 if(after!==before-1)throw Error('Physical left tap did not move the active piece by one cell: '+before+' → '+after);
 // The square piece is rotation-invariant; hold it to select a rotating kind.
 if((await page.evaluate(()=>window.__familyBlocksState.active.kind))==='O')
   await tap('[data-testid=ctrl-hold]');
 const rotBefore=await page.evaluate(()=>window.__familyBlocksState.active.rotation);
 await tap('[data-testid=ctrl-cw]');
 const rotAfter=await page.evaluate(()=>window.__familyBlocksState.active.rotation);
 if(rotAfter!==(rotBefore+1)%4)throw Error('Physical rotate did not change orientation: '+rotBefore+' → '+rotAfter);
 log('physical rotation succeeded',{rotBefore,rotAfter});
 // Capture the state around the Android-only input failure. Do not retry the
 // gesture: this test must prove that one physical touch locks a piece.
 const beforeDrop=await page.evaluate(()=>({phase:window.__familyBlocksState.phase,
   paused:!!document.querySelector('[data-testid=pause-overlay]'),
   active:{...window.__familyBlocksState.active},
   boardCells:window.__familyBlocksState.board.flat().filter(Boolean).length}));
 log('before hard drop',beforeDrop);
 await device.screenshot({path:path.join(out,'before-drop.png')});
 await tap('[data-testid=ctrl-drop]');
 // Slow Android emulator boot can delay WebView input. Wait for the actual
 // board change rather than assuming 450ms is always enough.
 await page.waitForFunction(()=>window.__familyBlocksState.board.flat().filter(Boolean).length>=4,
   null,{polling:100,timeout:6000}).catch(()=>{});
 const afterDrop=await page.evaluate(()=>({phase:window.__familyBlocksState.phase,
   paused:!!document.querySelector('[data-testid=pause-overlay]'),
   active:{...window.__familyBlocksState.active},
   score:window.__familyBlocksState.score,
   ticks:window.__familyBlocksState.ticks,
   boardCells:window.__familyBlocksState.board.flat().filter(Boolean).length}));
 log('after hard drop',afterDrop);
 await device.screenshot({path:path.join(out,'after-drop.png')});
 const pieces=afterDrop.boardCells;
 if(pieces<4)throw Error('Hard drop did not lock a piece: '+JSON.stringify({beforeDrop,afterDrop}));
 log('game touch movement and drop',{before,after,pieces});
 await device.screenshot({path:path.join(out,'game.png')});
 // Android system Back: game => pause; second Back => resume.
 await device.shell('input keyevent 4');
 await waitSelector('[data-testid=pause-overlay]');
 log('Android Back paused the game');
 await device.shell('input keyevent 4');
 await page.waitForFunction(()=>!document.querySelector('[data-testid=pause-overlay]'),
   null,{polling:150,timeout:10000});
 log('Android Back resumed the paused game');
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
 const saved=await reloaded.evaluate(()=>({
   gentle:document.querySelector('[data-testid=record-gentle]')?.textContent??'',
   recent:[...document.querySelectorAll('[data-testid=recent-games] p')].map(x=>x.textContent)
 }));
 if(!/게임 횟수:\s*1/.test(saved.gentle)||!saved.recent.some(x=>x.includes('차근차근')))
   throw Error('Exact game count or recent record missing after full restart: '+JSON.stringify(saved));
 log('saved record persisted after full process restart',saved);
 // On every non-game screen Back goes Home without exiting the app.
 await device.shell('input keyevent 4');
 await reloaded.waitForFunction(()=>!!document.querySelector('[data-testid=start-gentle]'),
   null,{polling:150,timeout:10000});
 log('Android Back from records returned home');
 await reloaded.evaluate(()=>[...document.querySelectorAll('button')]
   .find(x=>x.textContent.trim()==='설정')?.click());
 await reloaded.waitForFunction(()=>!!document.querySelector('[data-testid=settings]'),
   null,{polling:150,timeout:10000});
 await device.shell('input keyevent 4');
 await reloaded.waitForFunction(()=>!!document.querySelector('[data-testid=start-gentle]'),
   null,{polling:150,timeout:10000});
 log('Android Back from settings returned home');
 // Home Back requires explicit confirmation. Dismiss it to keep the app running.
 let exitPrompt='';
 reloaded.on('dialog',d=>{exitPrompt=d.message();void d.dismiss();});
 await device.shell('input keyevent 4');
 await wait(650);
 if(!/앱을 끝낼까요\?|Exit the app\?/.test(exitPrompt))
   throw Error('Home Android Back did not ask to exit: '+exitPrompt);
 if(!await reloaded.evaluate(()=>!!document.querySelector('[data-testid=start-gentle]')))
   throw Error('App exited after declining Android Back confirmation');
 log('Android Back on home requested exit confirmation; dismissed successfully');
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
