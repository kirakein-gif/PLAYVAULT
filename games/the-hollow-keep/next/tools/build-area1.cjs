// Authored eight-room circuit. No game rules are generated here.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const rooms={};
function room(id,pos,name,hint){rooms[id]={pos,name,hint,grid:Array.from({length:18},(_,r)=>(r===0||r===17?'#'.repeat(32):'#'+'.'.repeat(30)+'#').split('')),objects:[]};return rooms[id];}
room('gate',[0,0],'잔광의 성문','아래: 침묵의 서고 · 오른쪽: 봉인 회랑 · 위: 아직 잠긴 귀환길');
room('nave',[1,0],'봉인 회랑','청동 열쇠는 지하 서고 너머에 있다.');
room('reliquary',[2,0],'잿빛 맹세의 홀','두 시험 표적을 쓰러뜨리면 종탑으로 가는 길이 열린다.');
room('belfry',[2,-1],'기울어진 종탑','높은 레버: Noah의 도약과 E 조사 · 열린 서쪽 길을 따라가자.');
room('prism',[1,-1],'달빛 프리즘실','빛 장치: Ethan으로 교대하고 E 조사.');
room('loft',[0,-1],'귀환의 다락','레버를 켜면 성문으로 내려가는 지름길이 열린다.');
room('crypt',[0,1],'침묵의 서고','동쪽의 갈라진 벽 뒤에 청동 열쇠가 있다. 돌아올 때 사다리를 오르자.');
room('vault',[1,1],'금 간 보관실','금 간 벽은 공격으로 부순다. 열쇠를 얻어 성문으로 돌아가자.');
function connect(a,b,axis,col=0){if(axis==='x'){for(let r=13;r<17;r++){rooms[a].grid[r][31]='.';rooms[b].grid[r][0]='.';}}else{for(let c=col-1;c<=col+1;c++){rooms[a].grid[0][c]='.';rooms[b].grid[17][c]='.';}}}
connect('gate','nave','x');connect('nave','reliquary','x');connect('loft','prism','x');connect('prism','belfry','x');connect('crypt','vault','x');
connect('gate','loft','y',6);connect('crypt','gate','y',26);connect('reliquary','belfry','y',25);
function ladder(id,c,top,bottom){for(let r=top;r<=bottom;r++)rooms[id].grid[r][c]='H';}
ladder('gate',6,0,16);ladder('loft',6,12,17);ladder('gate',26,13,17);ladder('crypt',26,0,16);ladder('reliquary',25,1,16);ladder('belfry',25,12,17);
for(let c=8;c<=12;c++)rooms.belfry.grid[13][c]='-';
for(let c=10;c<=15;c++)rooms.crypt.grid[13][c]='-';
for(let c=12;c<=17;c++)rooms.nave.grid[14][c]='-';
for(let c=16;c<=20;c++)rooms.loft.grid[13][c]='-';
const obj=(r,o)=>rooms[r].objects.push(o),door=(id,x,open)=>({type:'door',id,x,y:8,w:2,h:9,open});
obj('gate',{type:'door',id:'return-seal',x:5,y:3,w:3,h:2,open:{switch:'return-lever'}});
obj('nave',door('bronze-door',25,{key:'bronze'}));
obj('reliquary',{type:'target',id:'oath-west',x:10,y:15,hp:22});obj('reliquary',{type:'target',id:'oath-east',x:15,y:15,hp:22});
obj('reliquary',door('oath-door',21,{cleared:['oath-west','oath-east']}));
obj('belfry',{type:'switch',id:'high-lever',x:15,y:10,hero:'noah',kind:'lever'});obj('belfry',door('bell-door',7,{switch:'high-lever'}));
obj('prism',{type:'switch',id:'sun-prism',x:12,y:16,hero:'ethan',kind:'light'});obj('prism',door('light-door',6,{switch:'sun-prism'}));
obj('loft',{type:'switch',id:'return-lever',x:16,y:16,kind:'lever'});
obj('vault',{type:'breakable',id:'cracked-screen',x:5,y:8,w:1,h:9});obj('vault',{type:'key',id:'bronze-key',x:18,y:16,name:'bronze'});
for(const r of Object.values(rooms))r.grid=r.grid.map(row=>row.join(''));
const area={version:1,cols:32,rows:18,tile:30,start:{room:'gate',x:90,y:442},rooms};
fs.writeFileSync(path.join(__dirname,'../areas/area1.json'),JSON.stringify(area,null,2)+'\n');
