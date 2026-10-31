'use strict';
const assert = require('node:assert/strict');
const S = require('../sim.js');
const room = {width:960,height:540,solids:[{x:0,y:500,w:960,h:40}],dummies:[]};
const create = (hero='ethan',custom=room,spawn={x:200,y:500-S.CONFIG.heroes[hero].height}) => S.createWorld({hero,room:custom,spawn});
const tests = [
  ['zero jump buffer disables buffering without disabling grounded jumps',()=>{
    const c=S.CONFIG.heroes.ethan,original=c.jumpBufferTicks;c.jumpBufferTicks=0;
    try{assert.ok(S.step(create(),{jump:true}).some(e=>e.type==='jump'));}finally{c.jumpBufferTicks=original;}
  }],
  ['a taller hero cannot swap into a low ceiling',()=>{
    const w=create('noah',{...room,solids:[...room.solids,{x:150,y:400,w:150,h:35}]});
    assert.equal(S.step(w,{swap:true}).some(e=>e.type==='swap'),false);assert.equal(w.active,'noah');assert.equal(w.swapCooldown,0);
  }],
  ['swapping cancels melee but preserves existing projectiles',()=>{
    const w=create('noah');S.step(w,{attack:true});assert.ok(S.getHitboxes(w).length);S.step(w,{swap:true});assert.equal(S.getHitboxes(w).length,0);
    S.step(w,{attack:true});for(let i=0;i<12;i++)S.step(w);S.step(w,{swap:true});assert.equal(w.active,'noah');assert.ok(w.attacks.some(a=>a.kind==='projectile'));
  }],
  ['fast projectiles cannot skip thin walls or damage targets beyond',()=>{
    const wp=S.CONFIG.heroes.ethan.weapon,original=wp.speed;wp.speed=300;
    try{const w=create('ethan',{...room,solids:[...room.solids,{x:300,y:300,w:1,h:200}],dummies:[{id:'behind',x:350,y:435,w:30,h:65,hp:100}]});
      S.step(w,{attack:true});assert.equal(w.dummies[0].hp,100);assert.equal(S.getHitboxes(w).length,0);
    }finally{wp.speed=original;}
  }],
  ['left-facing attacks hit left and never hit right',()=>{
    for(const hero of ['ethan','noah']){
      const w=create(hero,{...room,dummies:[{id:'left',x:150,y:435,w:30,h:65,hp:100},{id:'right',x:270,y:435,w:30,h:65,hp:100}]});
      S.step(w,{left:true});S.step(w,{attack:true});for(let i=0;i<15;i++)S.step(w);
      assert.equal(w.dummies[0].hp,78);assert.equal(w.dummies[1].hp,100);
    }
  }],
  ['room input and returned snapshots cannot mutate simulation state',()=>{
    const w=create();w.room.solids[0].y=510;assert.equal(room.solids[0].y,500);
    const s=S.snapshot(w);s.player.x=999;assert.equal(S.getPlayer(w).x,200);
  }],
  ['airborne no-input stopping respects the declared stop budget',()=>{
    for(const hero of ['ethan','noah']){
      const w=create(hero);for(let i=0;i<20;i++)S.step(w,{right:true});S.step(w,{right:true,jump:true});
      for(let i=0;i<S.CONFIG.heroes[hero].stopTicks;i++)S.step(w,{});assert.equal(w.player.vx,0);
    }
  }]
];
for(const [name,run] of tests){run();console.log('PASS '+name);}
console.log(`${tests.length}/${tests.length} edge checks passed`);
