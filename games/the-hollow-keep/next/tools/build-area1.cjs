// Original eight-room, three-tier circuit. No simulation state is authored here.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const rooms={};
const layouts={
 gate:[[4,6,1,30],[9,11,1,30],[13,16,1,30],[1,11,12,17]],
 nave:[[2,4,1,14],[6,8,15,30],[9,11,1,30],[13,16,1,30]],
 reliquary:[[2,5,1,14],[4,6,19,30],[9,11,1,30],[13,16,1,30]],
 belfry:[[4,6,1,30],[1,3,1,8],[1,3,22,30],[9,11,1,30],[13,16,1,30]],
 prism:[[3,5,1,30],[9,11,1,30],[13,16,1,30],[3,16,18,22]],
 loft:[[2,4,1,30],[8,10,1,30],[13,16,1,30]],
 crypt:[[4,6,1,12],[1,3,16,30],[9,11,1,30],[13,16,1,30]],
 vault:[[2,4,1,18],[5,7,22,30],[9,11,1,30],[13,16,1,30]]
};
function room(id,pos,name,hint){const grid=Array.from({length:18},()=>Array(32).fill('#'));for(const [a,b,lo,hi]of layouts[id])for(let r=a;r<=b;r++)for(let c=lo;c<=hi;c++)grid[r][c]='.';rooms[id]={pos,name,hint,grid,objects:[]};}
room('gate',[0,0],'잔광의 성문','어두운 아치 앞 ↑/조사: 보관실 · 아래: 서고 · 오른쪽: 봉인 회랑');
room('nave',[1,0],'봉인 회랑','열쇠 표식은 봉쇄물. 위층 통로는 막히지 않은 우회로다.');
room('reliquary',[2,0],'잿빛 맹세의 홀','표적 둘을 쓰러뜨리면 아래 통로의 창살이 걷힌다. 종탑은 오른쪽 사다리 위.');
room('belfry',[2,-1],'기울어진 종탑','높은 레버는 Noah의 점프로. 위층을 돌아가는 길도 열려 있다.');
room('prism',[1,-1],'달빛 프리즘실','빛 표식 봉쇄물은 Ethan의 장치로. 어두운 아치는 지하 서고로 이어진다.');
room('loft',[0,-1],'귀환의 다락','레버로 성문 위의 격자 덮개를 걷어 지름길을 만든다.');
room('crypt',[0,1],'침묵의 서고','잠긴 아치는 인장 열쇠로. 성문에는 오른쪽 사다리로 돌아간다.');
room('vault',[1,1],'금 간 보관실','오른쪽 벽의 미세한 금을 살펴보자. 돌아갈 때는 어두운 아치 앞 ↑/조사.');
function shaft(id,c,a=4,b=16,top=7){const g=rooms[id].grid;for(let r=a;r<=b;r++)for(let x=c-1;x<=c+1;x++)g[r][x]='.';for(let r=top;r<=b;r++)g[r][c]='H';}
const shafts={gate:[[6,4,7],[26,4,7]],nave:[[9,2,5],[27,6,12]],reliquary:[[7,2,6],[25,4,7]],belfry:[[3,1,7],[25,1,7]],prism:[[8,3,6],[28,3,6]],loft:[[6,2,5],[24,2,5]],crypt:[[10,4,7],[26,1,4]],vault:[[11,2,5]]};
for(const [id,list]of Object.entries(shafts))for(const [c,start,top]of list)shaft(id,c,start,16,top);
for(let c=22;c<=30;c++)rooms.vault.grid[8][c]='-';
// An open drop joins the two gallery heights in the corridor.
for(let y=2;y<=11;y++)for(let c=14;c<=16;c++)rooms.nave.grid[y][c]='.';
function horizontal(a,b){for(let r=13;r<=16;r++){rooms[a].grid[r][31]='.';rooms[b].grid[r][0]='.';}}
for(const [a,b]of [['gate','nave'],['nave','reliquary'],['loft','prism'],['prism','belfry'],['crypt','vault']])horizontal(a,b);
function vertical(lower,upper,c){shaft(lower,c,0,16,0);const upperShaft=shafts[upper].find(s=>s[0]===c);shaft(upper,c,upperShaft[1],17,upperShaft[2]);for(let x=c-1;x<=c+1;x++){rooms[lower].grid[0][x]='.';rooms[upper].grid[17][x]='.';}}
vertical('gate','loft',6);vertical('crypt','gate',26);vertical('reliquary','belfry',25);
// Tall bays retain distinct side galleries; no reachable shelf beside the high lever.
for(const [id,a,b]of [['crypt',12,18],['reliquary',12,18],['belfry',10,21]])for(let c=a;c<=b;c++){rooms[id].grid[9][c]='#';for(let r=10;r<=16;r++)rooms[id].grid[r][c]='.';}
for(let c=9;c<=13;c++)rooms.belfry.grid[7][c]='-';
for(let c=12;c<=17;c++)rooms.nave.grid[12][c]='-';
const obj=(id,o)=>rooms[id].objects.push(o),barrier=(id,x,open)=>({type:'door',id,x,y:13,w:1,h:4,open});
obj('gate',{type:'door',id:'return-seal',x:5,y:1,w:3,h:1,open:{switch:'return-lever'}});
obj('nave',barrier('bronze-door',20,{key:'bronze'}));
obj('reliquary',{type:'target',id:'oath-west',x:10,y:15,hp:22});obj('reliquary',{type:'target',id:'oath-east',x:15,y:15,hp:22});obj('reliquary',barrier('oath-door',21,{cleared:['oath-west','oath-east']}));
obj('belfry',{type:'switch',id:'high-lever',x:15,y:10,hero:'noah',kind:'lever'});obj('belfry',barrier('bell-door',8,{switch:'high-lever'}));
obj('prism',{type:'switch',id:'sun-prism',x:12,y:16,hero:'ethan',kind:'light'});obj('prism',barrier('light-door',6,{switch:'sun-prism'}));
obj('loft',{type:'switch',id:'return-lever',x:16,y:16,kind:'lever'});
// Sealed lower alcove: no upper shaft or entrance bypasses this breakable screen.
obj('vault',{type:'breakable',id:'cracked-screen',x:20,y:13,w:1,h:4});obj('vault',{type:'key',id:'bronze-key',x:25,y:16,name:'bronze'});obj('vault',{type:'key',id:'sigil-key',x:27,y:16,name:'sigil'});
obj('gate',{type:'entrance',id:'gate-arch',x:11,y:14,to:'vault-arch'});obj('vault',{type:'entrance',id:'vault-arch',x:9,y:14,to:'gate-arch'});
obj('crypt',{type:'entrance',id:'crypt-arch',x:14,y:14,to:'prism-arch',lock:{key:'sigil'}});obj('prism',{type:'entrance',id:'prism-arch',x:20,y:14,to:'crypt-arch'});
// Back ornaments are authored into unobstructed vertical runs of the finished plan.
const ornamentSets={gate:['w','p','c'],nave:['b','p','c'],reliquary:['w','p','c'],belfry:['b','w','c'],prism:['p','w','c'],loft:['b','p','c'],crypt:['w','b','c'],vault:['p','b','c']};
for(const [id,r]of Object.entries(rooms)){
 const back=Array.from({length:18},()=>Array(32).fill('.')),used=new Set();let painted=0;
 const candidates=[];
 for(let c=2;c<30;c++)for(let row=1;row<16;row++)if(r.grid[row][c]!=='#'&&r.grid[row-1][c]==='#'){
  let end=row;while(end<17&&r.grid[end][c]!=='#')end++;if(end-row>=3)candidates.push({c,row,end});
 }
 const index=Object.keys(rooms).indexOf(id);
 for(let i=0;i<6;i++){
  const band=[13,9,3][i%3],target=4+(index*5+i*7)%24;
  const options=candidates.filter(s=>!used.has(s.c)&&!Array.from({length:s.end-s.row},(_,n)=>r.grid[s.row+n][s.c]).includes('H'));
  options.sort((a,b)=>Math.abs(a.row-band)*5+Math.abs(a.c-target)-Math.abs(b.row-band)*5-Math.abs(b.c-target));
  const spot=options[0];if(!spot)continue;used.add(spot.c);const kind=ornamentSets[id][i%2],count=Math.min(spot.end-spot.row,4);
  for(let y=0;y<count;y++)back[spot.row+y][spot.c]=kind;painted+=count;
 }
 for(const spot of candidates.filter(s=>s.row>=9)){if(back[spot.end-1][spot.c]==='.'&&!used.has(spot.c)){back[spot.end-1][spot.c]='c';break;}}
 r.back=back.map(row=>row.join(''));
}
for(const r of Object.values(rooms))r.grid=r.grid.map(row=>row.join(''));
fs.writeFileSync(path.join(__dirname,'../areas/area1.json'),JSON.stringify({version:1,cols:32,rows:18,tile:30,start:{room:'gate',x:90,y:442},rooms},null,2)+'\n');
