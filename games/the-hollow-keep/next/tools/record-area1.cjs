// Record only real inputs into the public pure simulator, never change world state.
'use strict';
const HK=require('../sim.js'),area=require('../areas/area1.json'),fs=require('node:fs'),path=require('node:path');
const w=HK.createWorld({area,hero:'ethan'}),inputs=[];
const player=()=>HK.getPlayer(w),cx=()=>player().x+player().w/2;
function tick(keys=''){const names=keys.split(',').filter(Boolean),input=Object.fromEntries(names.map(k=>[k,true]));const ev=HK.step(w,input);if(inputs.at(-1)?.keys===keys)inputs.at(-1).ticks++;else inputs.push({keys,ticks:1});return ev;}
function run(keys,n){for(let i=0;i<n;i++)tick(keys);}
function until(keys,pred,max=1200){for(let i=0;i<max;i++){tick(keys);if(pred())return;}throw Error(`stuck ${keys} ${w.roomId} x${cx().toFixed(1)} y${player().y.toFixed(1)}`);}
function move(x){if(Math.abs(cx()-x)>4)until(cx()<x?'right':'left',()=>Math.abs(cx()-x)<4);run('',12);}
function room(id,dir){until(dir,()=>w.roomId===id);console.log('visit',id,w.tick);}
function tap(key){tick(key);tick('');}
run('',5);
// First pair is an open, distant route into the vault, before any barrier is opened.
move(360);tap('interact');if(w.roomId!=='vault')throw Error('gate arch');
move(540);tap('attack');run('',35);move(825);
move(300);tap('up');if(w.roomId!=='gate')throw Error('vault arch');
move(795);room('crypt','down');until('down',()=>player().onGround);
move(450);tap('interact');if(w.roomId!=='prism')throw Error('locked arch');run('',5);tap('up');if(w.roomId!=='crypt')throw Error('return arch');
move(795);room('gate','up');until('up',()=>player().y+player().h<=500);until('jump,right',()=>player().onGround);run('',8);
room('nave','right');room('reliquary','right');move(180);tap('attack');run('',65);tap('attack');run('',65);
move(765);room('belfry','up');until('up',()=>player().y+player().h<=500);until('jump,left',()=>player().onGround);move(465);
tap('swap');run('',15);until('jump',()=>player().y<330,90);tick('jump,interact');run('jump',35);until('',()=>player().onGround);
room('prism','left');move(375);tap('swap');run('',15);tap('interact');room('loft','left');move(495);tap('interact');move(195);room('gate','down');until('down',()=>player().onGround&&!player().climbing);run('',10);
const flags=HK.getFlags(w);console.log(JSON.stringify(flags));
fs.writeFileSync(path.join(__dirname,'../areas/area1.walkthrough.json'),JSON.stringify({hero:'ethan',inputs},null,2)+'\n');
console.log('recorded',w.tick,'ticks',inputs.length,'segments');
