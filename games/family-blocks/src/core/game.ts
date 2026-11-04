import { BOARD_W, BOARD_H, KINDS, CLEAR_TICKS, LOCK_TICKS, MAX_LOCK_RESETS, LINE_SCORES, gravityTicks, type Kind, type Mode } from './config';
import { blocks, kicks, spawn, type ActivePiece } from './pieces';
export type Cell = Kind | null;
export type Phase = 'active' | 'clearing' | 'over' | 'won';
export type EventName = 'move' | 'rotate' | 'lock' | 'clear' | 'clear4' | 'level' | 'end' | 'hold' | 'rescue';
export interface GameState {
  mode: Mode; level: number; startLevel: number;
  board: Cell[][]; active: ActivePiece;
  phase: Phase; queue: Kind[]; bag: Kind[]; rng: number;
  hold: Kind | null; holdUsed: boolean; score: number; lines: number;
  ticks: number; gravityCounter: number; softCounter: number;
  lockCounter: number; lockResets: number;
  clearCounter: number; pendingRows: number[];
  rescues: number; events: EventName[];
}
export function emptyBoard(): Cell[][] { return Array.from({length:BOARD_H}, () => Array<Cell>(BOARD_W).fill(null)); }
export function random01(s: GameState): number {
  s.rng = (s.rng + 0x6D2B79F5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function takeKind(s: GameState): Kind {
  if (!s.bag.length) {
    s.bag = [...KINDS];
    for (let i=s.bag.length-1;i>0;i--) {
      const j = Math.floor(random01(s)*(i+1));
      [s.bag[i],s.bag[j]] = [s.bag[j],s.bag[i]];
    }
  }
  return s.bag.pop()!;
}
function fillQueue(s: GameState) { while (s.queue.length < 7) s.queue.push(takeKind(s)); }
export function createGame(mode: Mode = 'gentle', selectedLevel=1, seed=0x1234abcd): GameState {
  const startLevel = mode==='sprint40' ? 1 : Math.max(1,Math.min(mode==='gentle'?5:10,Math.trunc(selectedLevel)||1));
  const s: GameState = {
    mode,level:startLevel,startLevel,board:emptyBoard(),active:spawn('I'),phase:'active',
    queue:[],bag:[],rng:seed>>>0,hold:null,holdUsed:false,score:0,lines:0,ticks:0,
    gravityCounter:0,softCounter:0,lockCounter:0,lockResets:0,
    clearCounter:0,pendingRows:[],rescues:0,events:[]
  };
  fillQueue(s);
  nextPiece(s);
  return s;
}
export function fits(s: GameState, p: ActivePiece): boolean {
  return blocks(p).every(([x,y]) => x>=0 && x<BOARD_W && y>=0 && y<BOARD_H && s.board[y][x]===null);
}
export function grounded(s: GameState): boolean {
  return !fits(s,{...s.active,y:s.active.y+1});
}
function resetMotion(s: GameState) {
  s.lockCounter=0;s.lockResets=0;s.gravityCounter=0;s.softCounter=0;
}
function rescue(s: GameState) {
  // Keep exactly the bottom half of the 22-row board, clear the upper half.
  for (let y=0;y<Math.ceil(BOARD_H/2);y++) s.board[y].fill(null);
  s.rescues++;s.events.push('rescue');
}
function chooseSpawn(s: GameState, kind: Kind): ActivePiece | null {
  const visible=spawn(kind);
  if (fits(s,visible)) return visible;
  // Only if row 2 is blocked may the piece begin wholly in hidden rows.
  const hidden={...visible,y:0};
  return fits(s,hidden) ? hidden : null;
}
function beginPiece(s: GameState, kind: Kind) {
  resetMotion(s);
  let place=chooseSpawn(s,kind);
  if(!place && s.mode==='gentle') {
    rescue(s);
    place=chooseSpawn(s,kind);
  }
  if(place) s.active=place;
  else {s.active=spawn(kind);s.phase='over';s.events.push('end');}
}
export function nextPiece(s: GameState) {
  fillQueue(s);
  const kind=s.queue.shift()!;
  fillQueue(s);
  s.holdUsed=false;
  beginPiece(s,kind);
}
function afterPlacement(s: GameState, p: ActivePiece, wasGrounded: boolean) {
  const descended=p.y>s.active.y;
  s.active=p;
  if (descended) {s.lockCounter=0;s.lockResets=0;}
  else if (wasGrounded && grounded(s) && s.lockResets < MAX_LOCK_RESETS) {
    s.lockCounter=0;s.lockResets++;
  } else if (!grounded(s)) s.lockCounter=0;
}
export function move(s: GameState, dx: -1|1): boolean {
  if (s.phase!=='active') return false;
  const p={...s.active,x:s.active.x+dx};
  if (!fits(s,p)) return false;
  afterPlacement(s,p,grounded(s));s.events.push('move');return true;
}
export function rotate(s: GameState, dir: -1|1): boolean {
  if (s.phase!=='active') return false;
  if (s.active.kind==='O') { s.events.push('rotate'); return true; }
  const old=s.active, next=(old.rotation+dir+4)%4;
  for (const [dx,dy] of kicks(old.kind,old.rotation,next)) {
    const p={...old,rotation:next,x:old.x+dx,y:old.y+dy};
    if (fits(s,p)) {afterPlacement(s,p,grounded(s));s.events.push('rotate');return true;}
  }
  return false;
}
export function ghostY(s: GameState): number {
  let y=s.active.y;
  while (fits(s,{...s.active,y:y+1})) y++;
  return y;
}
export function holdPiece(s: GameState): boolean {
  if (s.phase!=='active'||s.holdUsed) return false;
  const old=s.active.kind;
  if (s.hold===null) { s.hold=old;nextPiece(s); }
  else {const replacement=s.hold;s.hold=old;beginPiece(s,replacement);}
  s.holdUsed=true;s.events.push('hold');return true;
}
function lockPiece(s: GameState) {
  for (const [x,y] of blocks(s.active)) s.board[y][x]=s.active.kind;
  s.events.push('lock');
  const rows:number[]=[];
  for(let y=0;y<BOARD_H;y++) if (s.board[y].every(v=>v!==null)) rows.push(y);
  if(rows.length) { s.phase='clearing';s.pendingRows=rows;s.clearCounter=CLEAR_TICKS; }
  else nextPiece(s);
}
export function hardDrop(s: GameState): number {
  if(s.phase!=='active') return 0;
  const end=ghostY(s),distance=end-s.active.y;
  s.active.y=end;s.score+=distance*2;
  lockPiece(s);return distance;
}
export function removeRows(s: GameState, rows: number[]) {
  const deleted=new Set(rows);
  s.board=s.board.filter((_,y)=>!deleted.has(y));
  while(s.board.length<BOARD_H) s.board.unshift(Array<Cell>(BOARD_W).fill(null));
  const n=rows.length;
  s.score+=(LINE_SCORES[Math.min(4,n)]??0)*s.level;
  s.lines+=n;
  s.events.push(n===4?'clear4':'clear');
  if(s.mode==='challenge') {
    const next=Math.max(s.startLevel, s.startLevel+Math.floor(s.lines/10));
    if(next>s.level) {s.level=next;s.events.push('level');}
  }
  if(s.mode==='sprint40' && s.lines>=40) s.phase='won';
  else {s.phase='active';nextPiece(s);}
}
export function step(s: GameState, soft=false) {
  if(s.phase==='over'||s.phase==='won') return;
  s.ticks++;
  if(s.phase==='clearing') {
    s.clearCounter--;
    if(s.clearCounter<=0) {
      const rows=s.pendingRows.slice();s.pendingRows=[];
      removeRows(s,rows);
    }
    return;
  }
  if(soft) {
    // Soft drop replaces natural gravity while held: exactly 1 cell / 2 ticks.
    s.gravityCounter=0;
    s.softCounter++;
    if(s.softCounter>=2) {
      s.softCounter=0;
      const p={...s.active,y:s.active.y+1};
      if(fits(s,p)){afterPlacement(s,p,grounded(s));s.score++;}
    }
  } else {
    s.softCounter=0;
    s.gravityCounter++;
    if(s.gravityCounter>=gravityTicks(s.level)) {
      s.gravityCounter=0;
      const p={...s.active,y:s.active.y+1};
      if(fits(s,p)) afterPlacement(s,p,grounded(s));
    }
  }
  if(grounded(s)) {
    s.lockCounter++;
    if(s.lockCounter>=LOCK_TICKS) lockPiece(s);
  } else s.lockCounter=0;
}
export function elapsedMs(s: GameState): number {return Math.round(s.ticks*1000/60);}
export function clearEvents(s: GameState): EventName[] {
  const list=s.events.slice();s.events.length=0;return list;
}
