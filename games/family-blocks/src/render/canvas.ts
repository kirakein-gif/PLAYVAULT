import { BOARD_W, BOARD_H, HIDDEN_H, type Kind } from '../core/config';
import { blocks, shape } from '../core/pieces';
import { ghostY, type GameState } from '../core/game';
import type { Settings } from '../storage/schema';
import { translate as t } from '../i18n';

const palettes: Record<Kind,{base:string;grain:string;edge:string;symbol:number}> = {
  I:{base:'#a87952',grain:'#d2a57e',edge:'#5f3c27',symbol:0},
  O:{base:'#d2ae74',grain:'#f1d4a2',edge:'#896542',symbol:1},
  T:{base:'#8b665a',grain:'#c09d88',edge:'#523c35',symbol:2},
  S:{base:'#bca08c',grain:'#e4cdb3',edge:'#756358',symbol:3},
  Z:{base:'#98705c',grain:'#c69a7b',edge:'#5c4035',symbol:4},
  J:{base:'#aa8e68',grain:'#d7be90',edge:'#68543b',symbol:5},
  L:{base:'#c6b48e',grain:'#e7d8af',edge:'#7c7157',symbol:6},
};
const textures = new Map<Kind,HTMLCanvasElement>();
function tile(kind:Kind):HTMLCanvasElement{
  const cached=textures.get(kind);if(cached)return cached;
  const cv=document.createElement('canvas');cv.width=64;cv.height=64;
  const c=cv.getContext('2d')!,p=palettes[kind];
  c.fillStyle=p.base;c.fillRect(0,0,64,64);
  let seed=(p.symbol+1)*317;
  for(let i=0;i<22;i++){
    seed=(Math.imul(seed,1103515245)+12345)|0;
    const y=((seed>>>0)%61)+1;
    c.strokeStyle=p.grain;c.globalAlpha=i%4===0?.24:.10;c.lineWidth=i%3===0?2:1;
    c.beginPath();c.moveTo(4,y);c.bezierCurveTo(20,y-2,43,y+3,60,y);c.stroke();
  }
  c.globalAlpha=1;
  c.fillStyle='#ffffff';c.globalAlpha=.16;c.fillRect(0,0,64,3);c.fillRect(0,0,3,64);
  c.fillStyle='#000000';c.globalAlpha=.18;c.fillRect(0,61,64,3);c.fillRect(61,0,3,64);
  c.globalAlpha=1;c.lineWidth=3;c.strokeStyle=p.edge;c.fillStyle=p.edge;
  const m=p.symbol;
  // Seven carved marks make the pieces distinguishable without relying on colour.
  if(m===0){c.fillRect(27,21,10,21);}
  if(m===1){c.beginPath();c.arc(32,32,8,0,Math.PI*2);c.stroke();}
  if(m===2){c.fillRect(15,29,34,5);}
  if(m===3){c.beginPath();c.arc(24,31,4,0,7);c.arc(40,31,4,0,7);c.fill();}
  if(m===4){c.beginPath();c.moveTo(19,22);c.lineTo(45,42);c.stroke();}
  if(m===5){c.beginPath();c.moveTo(19,32);c.lineTo(32,18);c.lineTo(45,32);c.stroke();}
  if(m===6){c.beginPath();c.moveTo(19,20);c.lineTo(45,44);c.moveTo(45,20);c.lineTo(19,44);c.stroke();}
  textures.set(kind,cv);return cv;
}
function label(c:CanvasRenderingContext2D,txt:string,x:number,y:number,size=17,color='#e7d5bc'){
  c.fillStyle=color;c.font='600 '+size+'px Nunito, "Gowun Dodum", sans-serif';c.fillText(txt,x,y);
}
function drawPiece(c:CanvasRenderingContext2D,kind:Kind,x:number,y:number,size:number,rotation=0){
  const coords=shape(kind,rotation);
  const minX=Math.min(...coords.map(p=>p[0])),maxX=Math.max(...coords.map(p=>p[0]));
  const offset=(4-(maxX-minX+1))*size/2;
  for(const [px,py] of coords)c.drawImage(tile(kind),x+(px-minX)*size+offset,y+py*size,size-.5,size-.5);
}
function rounded(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,r=12){
  c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
}
export interface Layout {boardX:number;boardY:number;cell:number;boardRight:number}
export function renderGame(canvas:HTMLCanvasElement,s:GameState,settings:Settings,lang:'ko'|'en'):Layout {
  const box=canvas.getBoundingClientRect(), w=box.width,h=box.height,dpr=Math.min(2,window.devicePixelRatio||1);
  const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
  if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
  const c=canvas.getContext('2d',{alpha:false})!;
  c.setTransform(dpr,0,0,dpr,0,0);
  const cell=Math.max(13,Math.floor(Math.min((h-30)/20,(w-450)/10)));
  const bh=cell*20,bw=cell*10,bx=Math.floor((w-bw)/2),by=Math.floor((h-bh)/2);
  c.fillStyle='#192621';c.fillRect(0,0,w,h);
  // Muted wood backdrop; no runtime gradients or shadows.
  for(let i=0;i<Math.ceil(h/30);i++){
    c.fillStyle=i%2===0?'rgba(204,171,125,.016)':'rgba(0,0,0,.035)';
    c.fillRect(0,i*30,w,29);
  }
  rounded(c,bx-10,by-10,bw+20,bh+20,'#5c4934',8);
  c.fillStyle='#201b19';c.fillRect(bx,by,bw,bh);
  c.strokeStyle='rgba(222,194,153,.12)';c.lineWidth=1;
  for(let x=0;x<=10;x++){c.beginPath();c.moveTo(bx+x*cell+.5,by);c.lineTo(bx+x*cell+.5,by+bh);c.stroke();}
  for(let y=0;y<=20;y++){c.beginPath();c.moveTo(bx,by+y*cell+.5);c.lineTo(bx+bw,by+y*cell+.5);c.stroke();}
  for(let y=HIDDEN_H;y<BOARD_H;y++)for(let x=0;x<BOARD_W;x++){
    const kind=s.board[y][x];
    if(kind)c.drawImage(tile(kind),bx+x*cell,by+(y-HIDDEN_H)*cell,cell-.5,cell-.5);
  }
  if(s.phase==='clearing'){
    c.fillStyle='rgba(235,207,152,.22)';
    for(const y of s.pendingRows)if(y>=HIDDEN_H)c.fillRect(bx,by+(y-HIDDEN_H)*cell,bw,cell);
  }
  if(s.phase==='active'){
    if(settings.ghost){
      const yy=ghostY(s);
      c.strokeStyle='#d6c5a4';c.globalAlpha=.45;c.lineWidth=Math.max(1.5,cell*.065);
      for(const [x,y] of blocks({...s.active,y:yy}))if(y>=HIDDEN_H){
        c.strokeRect(bx+x*cell+2,by+(y-HIDDEN_H)*cell+2,cell-4,cell-4);
      }
      c.globalAlpha=1;
    }
    for(const [x,y] of blocks(s.active))if(y>=HIDDEN_H&&y<BOARD_H)
      c.drawImage(tile(s.active.kind),bx+x*cell,by+(y-HIDDEN_H)*cell,cell-.5,cell-.5);
  }
  // Quiet, spacious information rails keep the board clear at 853 x 533.
  const left=Math.max(18,bx-225),right=bx+bw+25;
  rounded(c,left,by+14,Math.min(190,bx-left-15),128,'rgba(231,205,160,.065)');
  label(c,t(lang,'hold'),left+14,by+43,17);
  if(s.hold)drawPiece(c,s.hold,left+23,by+58,19);
  label(c,t(lang,'time'),left+6,by+203,16,'#c3b29c');
  label(c,formatTime(s.ticks*1000/60),left+6,by+239,24);
  label(c,t(lang,'lines'),left+6,by+280,16,'#c3b29c');
  label(c,String(s.lines),left+6,by+316,26);
  const sideW=Math.max(120,Math.min(206,w-right-16));
  rounded(c,right,by+14,sideW,Math.min(214,bh*.46),'rgba(231,205,160,.065)');
  label(c,t(lang,'next'),right+15,by+43,17);
  const count=settings.previews===1?1:3;
  for(let i=0;i<count;i++){
    const next=s.queue[i];if(!next)break;
    drawPiece(c,next,right+13,by+51+i*61,Math.min(15,Math.max(11,cell*.55)));
  }
  label(c,t(lang,'score'),right+7,by+bh*.62,16,'#c3b29c');
  label(c,s.score.toLocaleString(),right+7,by+bh*.62+36,Math.min(29,Math.max(23,cell*1.2)));
  label(c,t(lang,'level')+'  '+s.level,right+7,by+bh*.80,20);
  // The current mode is already named in the top-left HTML chip.
  // Do not draw it at the bottom-left: that rail is reserved for the
  // physical touch buttons and would overlap them even at 1280x800.
  return {boardX:bx,boardY:by,cell,boardRight:bx+bw};
}
export function formatTime(ms:number):string{
  const total=Math.max(0,Math.floor(ms/1000)),min=Math.floor(total/60),sec=total%60;
  return String(min).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
