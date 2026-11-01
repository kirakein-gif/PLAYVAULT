'use strict';
// Controlled browser clock; real inputs, simulation, and renderer. No state injection.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const output=path.join(__dirname,'../assets/pixel-review/noah-single-stroke');
const url=process.env.HK_URL||'http://127.0.0.1:8766/games/the-hollow-keep/next/';
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    for(const direction of ['right','left']){
      const context=await browser.newContext({viewport:{width:1280,height:900}});
      const page=await context.newPage();
      await page.clock.install({time:new Date('2026-11-01T04:00:00Z')});
      await page.clock.pauseAt(new Date('2026-11-01T04:00:01Z'));
      await page.addInitScript(()=>{
        const raf=window.requestAnimationFrame;
        window.__slashFrames=[];
        window.requestAnimationFrame=callback=>raf.call(window,time=>{
          callback(time);
          if(!window.__recordSlash||!window.HKPlaytest)return;
          const s=HKPlaytest.snapshot(),age=HKSim.CONFIG.heroes.noah.weapon.cooldownTicks-s.attackCooldowns.noah;
          if(age<0||age>11||!s.attackCooldowns.noah||window.__slashFrames.some(f=>f.age===age))return;
          const canvas=document.querySelector('canvas'),unit=canvas.width/960;
          const crop=document.createElement('canvas');crop.width=600;crop.height=260;
          crop.getContext('2d').drawImage(canvas,(s.player.x+s.player.w/2-150)*unit,(s.player.y+s.player.h-120)*unit,300*unit,130*unit,0,0,600,260);
          window.__slashFrames.push({age,data:crop.toDataURL()});
        });
      });
      await page.goto(url);await page.evaluate(()=>HKPixel.ready);await page.clock.runFor(100);
      await page.locator('canvas').focus();
      async function key(code,ms){await page.keyboard.down(code);await page.clock.runFor(ms);await page.keyboard.up(code);}
      await key('KeyQ',17);await page.clock.runFor(100);
      // Make room for the full left-facing arc inside the real canvas.
      await key('ArrowRight',450);await page.clock.runFor(100);
      if(direction==='left'){await key('ArrowLeft',17);await page.clock.runFor(100);}
      await page.evaluate(()=>window.__recordSlash=true);
      await key('KeyJ',17);await page.clock.runFor(220);
      const shots=await page.evaluate(()=>{window.__recordSlash=false;return window.__slashFrames;});
      assert.deepEqual(shots.map(s=>s.age),Array.from({length:12},(_,i)=>i),'capture must include every actual attack age0..11');
      for(const s of shots)fs.writeFileSync(path.join(output,`${direction}-tick-${String(s.age).padStart(2,'0')}.png`),Buffer.from(s.data.split(',')[1],'base64'));
      const strip=await page.evaluate(async({shots,direction})=>{
        const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1160;
        const g=canvas.getContext('2d');g.fillStyle='#151720';g.fillRect(0,0,canvas.width,canvas.height);g.font='18px sans-serif';
        for(let i=0;i<shots.length;i++){
          const image=new Image();image.src=shots[i].data;await image.decode();
          const x=i%3*600,y=Math.floor(i/3)*290;g.drawImage(image,x,y+30);g.fillStyle='white';g.fillText(`Noah ${direction} actual tick ${shots[i].age}`,x+8,y+23);
        }
        return canvas.toDataURL();
      },{shots,direction});
      fs.writeFileSync(path.join(output,`${direction}-attack-sequence.png`),Buffer.from(strip.split(',')[1],'base64'));
      console.log(direction+': actual attack ages '+shots.map(s=>s.age).join(','));
      await context.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
