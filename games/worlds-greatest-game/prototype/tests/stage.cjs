'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1}),dest=process.argv[2];
    if(dest)fs.mkdirSync(dest,{recursive:true});
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await page.waitForFunction(()=>WGG.art.ready);
    async function shot(state,near){
      await page.evaluate(({state,near})=>{
        document.querySelector('#camera-capture')?.remove();const c=document.createElement('canvas');c.id='camera-capture';c.width=1200;c.height=720;c.style.cssText='position:fixed;top:0;left:0;width:1200px;height:720px;z-index:99999';document.body.append(c);
        WGG.render(c.getContext('2d'),new WGG.Match(),{preview:{near,state}});
      },{state,near});
      if(dest)await page.locator('#camera-capture').screenshot({path:path.join(dest,(state==='idle'?'idle':near?'player-strike':'enemy-strike')+'.png')});
      return {far:await page.screenshot({clip:{x:355,y:180,width:70,height:80}}),near:await page.screenshot({clip:{x:950,y:300,width:40,height:40}}),table:await page.screenshot({clip:{x:100,y:650,width:100,height:60}})};
    }
    const idle=await shot('idle',true),player=await shot('hammer-strike',true),enemy=await shot('hammer-strike',false);
    assert(idle.far.equals(player.far),'opponent face stays at identical scale and position during player strike');
    assert(idle.near.equals(enemy.near),'player head stays at identical scale and position during opponent strike');
    assert(idle.table.equals(player.table)&&idle.table.equals(enemy.table),'table never changes scale or position during either strike');
    console.log('PASS fixed camera: both defending heads and table pixels stay identical during strikes');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
