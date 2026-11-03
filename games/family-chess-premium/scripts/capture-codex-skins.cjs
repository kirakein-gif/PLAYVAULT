'use strict';
// Real settings selection and six legal moves; only read DOM/storage for checks.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.CHESS_URL||'http://localhost:4173/',out=process.env.CHESS_SHOTS||path.resolve('docs/screenshots/skin-compare/raw');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});let checks=0;const results=[],external=[];
 try{
  for(const vp of [{width:853,height:533,scale:1.5},{width:1280,height:800,scale:1}]){
   for(const skin of ['wizard','medieval-codex','gothic','gothic-codex','noble-codex']){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:vp.scale});
    await ctx.route('**/*',route=>{const u=route.request().url();if(u.startsWith(base)||u.startsWith('data:')||u.startsWith('blob:'))return route.continue();external.push(u);return route.abort();});
    const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
    await page.getByTestId('settings-btn').click();await page.getByTestId('skin-'+skin).click();
    assert.ok((await page.getByTestId('skin-'+skin).innerText()).includes(skin.endsWith('codex')?'Codex':'Claude'));
    await page.getByTestId('settings-close').click();await page.getByTestId('menu-two').click();await page.waitForSelector('[data-square=e2]');
    for(const [from,to] of [['e2','e4'],['e7','e5'],['g1','f3'],['b8','c6'],['f1','c4'],['g8','f6']]){
     for(const sq of [from,to]){const b=await page.locator('[data-square='+sq+']').boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(170);}
    }
    await page.waitForTimeout(400);
    for(const [sq,piece] of [['e4','wp'],['e5','bp'],['f3','wn'],['c6','bn'],['c4','wb'],['f6','bn']])assert.equal(await page.locator('.piece[data-sq='+sq+']:not(.ghost)').getAttribute('data-piece'),piece);
    const imgs=await page.locator('.piece:not(.ghost) img').evaluateAll(xs=>xs.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));
    assert.equal(imgs.length,32);assert.ok(imgs.every(i=>i.ok));
    if(skin.endsWith('codex'))assert.ok(imgs.every(i=>i.src.startsWith('skins/'+skin+'/')));
    const name=skin+'-'+vp.width+'x'+vp.height;
    await page.screenshot({path:path.join(out,name+'.png')});
    // A reload must keep both selected skin and resumable game for this profile.
    await page.reload();await page.waitForSelector('[data-testid=menu-two]');assert.equal(await page.evaluate(()=>document.documentElement.dataset.skin),skin);
    assert.deepEqual(errors,[]);results.push({skin,viewport:vp,position:'1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6',pieces:imgs});checks++;await ctx.close();
   }
  }
  // Exactly60 CSS pixel squares: both colors on both tones, six silhouettes.
  for(const skin of ['medieval-codex','gothic-codex','noble-codex']){
   const page=await browser.newPage({viewport:{width:660,height:470},deviceScaleFactor:1});
   const names=['King','Queen','Rook','Bishop','Knight','Pawn'];let rows='';
   for(const color of ['w','b'])for(const tone of ['light','dark']){
    rows+=`<div class="row"><span>${color==='w'?'White':'Black'}<br>${tone}</span>`+'KQRBNP'.split('').map((p,i)=>`<div><small>${names[i]}</small><i style="background-image:url('${base}skins/${skin}/board-${tone}.webp')"><img src="${base}skins/${skin}/${color}${p}.webp"></i></div>`).join('')+'</div>';
   }
   await page.setContent(`<style>body{margin:20px;background:#18202a;color:#e3e2df;font:14px Arial}h2{font-size:18px}.row{display:flex;gap:14px;margin:14px 0}.row>span{width:82px;padding-top:32px;font-size:12px}.row>div{width:70px;text-align:center}small{display:block;font-size:11px;margin-bottom:6px}i{display:block;width:60px;height:60px;background-size:400%;border:1px solid #8b8c91}img{width:60px;height:60px}</style><h2>${skin}: 60px / both square tones</h2>${rows}`);
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.screenshot({path:path.join(out,skin+'-60px-matrix.png')});checks++;await page.close();
  }
  assert.deepEqual(external,[]);fs.writeFileSync(path.join(out,'observations.json'),JSON.stringify({checks,external,results},null,2));console.log(`${checks}/${checks} skin comparison checks passed; external requests0`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
