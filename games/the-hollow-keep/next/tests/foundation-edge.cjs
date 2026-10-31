'use strict';
const assert = require('node:assert/strict');
const S = require('../sim.js');
const room = {width:960,height:540,solids:[{x:0,y:500,w:960,h:40}],dummies:[]};
const create = (hero='ethan',custom=room,spawn={x:200,y:500-S.CONFIG.heroes[hero].height}) => S.createWorld({hero,room:custom,spawn});
const tests = [
  ...['left','right'].map(side => [`Noah can swap to Ethan against the ${side} wall`,()=>{
    const walls=[{x:-40,y:0,w:40,h:500},{x:600,y:0,w:40,h:500}];
    const w=create('noah',{...room,solids:[...room.solids,...walls]});
    for(let i=0;i<180;i++)S.step(w,{[side]:true});
    const before={...w.player};
    assert.equal(side==='left'?before.x:before.x+before.w,side==='left'?0:600);
    const events=S.step(w,{swap:true});
    assert.ok(events.some(e=>e.type==='swap'));assert.ok(!events.some(e=>e.type==='swapBlocked'));
    assert.equal(w.active,'ethan');assert.equal(w.player.y+w.player.h,before.y+before.h);
    assert.equal(side==='left'?w.player.x:w.player.x+w.player.w,side==='left'?0:600);
    assert.ok(Math.abs(w.player.x+w.player.w/2-(before.x+before.w/2))<=S.CONFIG.heroes.ethan.width-before.w);
  }]),
  ['a corridor narrower than Ethan still blocks swapping',()=>{
    const solids=[...room.solids,{x:0,y:0,w:200,h:500},{x:239.5,y:0,w:40,h:500}];
    const w=create('noah',{...room,solids});const before={...w.player};
    assert.ok(S.step(w,{swap:true}).some(e=>e.type==='swapBlocked'));
    assert.equal(w.active,'noah');assert.equal(w.player.x,before.x);assert.equal(w.swapCooldown,0);
  }],
  ...[1,-1].map(face => [`fast non-piercing shot hits the nearest target facing ${face}`,()=>{
    const wp=S.CONFIG.heroes.ethan.weapon,original=wp.speed;wp.speed=300;
    try{
      const dummies=[{id:'far',x:face===1?450:60,y:435,w:20,h:65,hp:100},{id:'near',x:face===1?300:140,y:435,w:20,h:65,hp:100}];
      const wall={x:face===1?500:20,y:300,w:10,h:200};
      const w=create('ethan',{...room,solids:[...room.solids,wall],dummies});
      S.step(w,face===1?{right:true}:{left:true});const events=S.step(w,{attack:true});
      assert.equal(w.dummies[0].hp,100);assert.equal(w.dummies[1].hp,78);
      assert.equal(events.filter(e=>e.type==='hit').length,1);assert.equal(S.getHitboxes(w).length,0);
    }finally{wp.speed=original;}
  }]),
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
