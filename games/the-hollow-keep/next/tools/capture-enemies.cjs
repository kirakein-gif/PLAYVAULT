'use strict';
// Clearly labeled simulation fixtures: documented createWorld options + real step
// inputs, no post-creation world/CONFIG mutation. Actual area inputs are tested
// separately in tests/combat2-browser.cjs.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const url=process.env.HK_URL||'http://127.0.0.1:8766/games/the-hollow-keep/next/';
const out=process.env.HK_SHOT_DIR||path.join(__dirname,'../assets/combat2-review/fixtures');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:960,height:540}});await page.goto(url);await page.evaluate(()=>HKPixel.ready);
  const results=await page.evaluate(()=>{
   const canvas=document.querySelector('canvas'),draw=HKRender(canvas),results=[];
   function scenario(name,{kind='crawler',col=10,hero='ethan',start=6,hp,face=-1,objects,steps=1,settle=0,input=()=>({}),stop=()=>false,expect}){
    const grid=Array.from({length:18},(_,y)=>y===0||y===17?'#'.repeat(32):'#'+'.'.repeat(30)+'#');
    const area={version:1,cols:32,rows:18,tile:30,start:{room:'a',hero,x:start*30+15-HKSim.CONFIG.heroes[hero].width/2,y:510-HKSim.CONFIG.heroes[hero].height},rooms:{a:{pos:[0,0],name:'전투 표시 검토 · 시뮬레이션 시험 구역',grid,objects:objects||[{type:'enemy',id:'subject',kind,x:col,y:16,face}]}}};
    const w=HKSim.createWorld({area,...(hp?{hp}:{})}),events=[];
    let last=[];
    for(let tick=0;tick<steps;tick++){
     last=HKSim.step(w,input(tick));events.push(...last);for(const e of last)draw.event(e,w);draw(w,false,[]);
     if(stop(w,last))break;
    }
    for(let tick=0;tick<settle;tick++){last=HKSim.step(w,{});events.push(...last);for(const e of last)draw.event(e,w);draw(w,false,[]);}
    const state={heroes:HKSim.getHeroes(w),enemies:HKSim.getEnemies(w),pickups:HKSim.getPickups(w),player:HKSim.getPlayer(w),events,tick:w.tick};
    if(expect&&!expect(state,last))throw Error('fixture expectation failed: '+name+' '+JSON.stringify(state));
    results.push({name,state,data:canvas.toDataURL()});
   }
   scenario('crawler-walk',{col:20,face:1,steps:8,expect:s=>s.enemies[0].state==='patrol'});
   scenario('crawler-charge',{start:13,face:1,steps:8,expect:s=>s.enemies[0].state==='charge'});
   scenario('crawler-hit',{hero:'noah',col:8,steps:20,input:t=>({attack:t===0}),stop:(_,e)=>e.some(x=>x.type==='kill'),expect:s=>s.events.some(e=>e.type==='kill')});
   scenario('wisp-hover',{kind:'wisp',steps:8,expect:s=>s.enemies[0].state==='hover'});
   scenario('wisp-dive',{kind:'wisp',start:3,col:9,steps:170,stop:w=>HKSim.getEnemies(w)[0]?.state==='dive',expect:s=>s.enemies[0].state==='dive'});
   scenario('wisp-hit',{kind:'wisp',hero:'noah',col:8,steps:40,input:t=>({jump:t<7,attack:t===7}),stop:(_,e)=>e.some(x=>x.type==='kill'),expect:s=>s.events.some(e=>e.type==='kill')});
   scenario('shield-walk',{kind:'shield',col:15,steps:8,expect:s=>s.enemies[0].state==='patrol'});
   scenario('shield-windup',{kind:'shield',start:8,steps:8,expect:s=>s.enemies[0].state==='windup'});
   scenario('shield-bash',{kind:'shield',start:8,steps:25,stop:w=>HKSim.getEnemies(w)[0]?.state==='bash',expect:s=>s.enemies[0].state==='bash'});
   scenario('shield-blocked',{kind:'shield',steps:30,input:t=>({attack:t===0}),stop:(_,e)=>e.some(x=>x.type==='blocked'),expect:s=>s.events.some(e=>e.type==='blocked')&&s.enemies[0].hp===66});
   scenario('shield-stagger-hit',{kind:'shield',start:3,col:12,steps:100,input:t=>({attack:t<42}),stop:w=>HKSim.getEnemies(w)[0]?.stagger>0,expect:s=>s.enemies[0].stagger===60&&s.enemies[0].hp===22});
   scenario('hero-hurt',{steps:300,stop:(_,e)=>e.some(x=>x.type==='hurt'),expect:s=>s.heroes.ethan.hp===5&&s.player.invuln===60});
   scenario('hero-down-auto-swap',{hp:{ethan:1,noah:5},steps:300,stop:(_,e)=>e.some(x=>x.type==='down'),expect:s=>s.heroes.ethan.down&&s.player.invuln===90});
   scenario('shelter-before-rest',{start:5,hp:{ethan:2,noah:0},objects:[{type:'shelter',id:'rest',x:4,y:14}],expect:s=>s.heroes.noah.down});
   scenario('shelter-after-rest',{start:5,hp:{ethan:2,noah:0},objects:[{type:'shelter',id:'rest',x:4,y:14}],input:()=>({interact:true}),expect:s=>s.events.some(e=>e.type==='rest')&&s.heroes.noah.hp===5});
   scenario('heal-fragment',{start:3,hp:{ethan:2,noah:5},objects:[6,9,12,15].map((x,i)=>({type:'enemy',id:'c'+i,kind:'crawler',x,y:16,face:-1})),steps:1200,settle:28,input:t=>({attack:t%30===0}),stop:w=>HKSim.getPickups(w).length>0,expect:s=>s.events.filter(e=>e.type==='kill').length===4&&s.pickups.length===1});
   return results;
  });
  for(const r of results){fs.writeFileSync(path.join(out,r.name+'.png'),Buffer.from(r.data.split(',')[1],'base64'));delete r.data;console.log('PASS '+r.name);}
  fs.writeFileSync(path.join(out,'states.json'),JSON.stringify(results,null,2));assert.equal(results.length,16);console.log('16/16 simulation capture scenarios passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
