import { describe, expect, it } from 'vitest';
import { BOARD_H, BOARD_W, KINDS, LINE_SCORES, gravityTicks } from '../../src/core/config';
import { blocks, kicks, shape, spawn } from '../../src/core/pieces';
import { createGame, emptyBoard, takeKind, nextPiece, move, rotate, holdPiece, hardDrop, step, removeRows, elapsedMs, type GameState } from '../../src/core/game';
import { repeatStart, repeatStop, repeatTick } from '../../src/core/repeat';

describe('Deterministic seven-kind bag',()=>{
  it('same seed produces same long sequence',()=>{
    const sequence=(seed:number)=>{
      const s=createGame('gentle',1,seed);s.rng=seed;s.bag=[];
      return Array.from({length:140},()=>takeKind(s)).join('');
    };
    expect(sequence(548)).toEqual(sequence(548));
    expect(sequence(548)).not.toEqual(sequence(549));
  });
  it('each bag has all seven kinds for 100 arbitrary seeds',()=>{
    for(let seed=1;seed<=100;seed++){
      const s=createGame('challenge',1,seed);s.rng=seed;s.bag=[];
      const seq=Array.from({length:70},()=>takeKind(s));
      for(let i=0;i<seq.length;i+=7)
        expect(new Set(seq.slice(i,i+7)).size).toBe(7);
    }
  });
});
describe('Spawning and shapes',()=>{
  it('uses the documented spawn columns for all seven kinds',()=>{
    for(const k of KINDS){
      const p=spawn(k),positions=blocks(p).map(q=>q[0]);
      expect(p.y).toBe(0);
      expect(Math.min(...positions)).toBe(k==='O'?4:3);
      expect(Math.max(...positions)).toBe(k==='I'?6:k==='O'?5:5);
    }
  });
  it('loses on blocked spawn except for gentle mode',()=>{
    for(const mode of ['challenge','sprint40','gentle'] as const){
      const s=createGame(mode,1,11);s.board[0].fill('J');s.board[1].fill('J');nextPiece(s);
      if(mode==='gentle'){expect(s.phase).toBe('active');expect(s.rescues).toBe(1);expect(s.board[0].every(x=>x===null)).toBe(true);}
      else expect(s.phase).toBe('over');
    }
  });
  it('all 7 kinds have four cells in four rotation states; O stays still',()=>{
    for(const k of KINDS){
      for(let r=0;r<4;r++){
        const pts=shape(k,r);
        expect(pts).toHaveLength(4);
        expect(new Set(pts.map(([x,y])=>x+','+y)).size).toBe(4);
      }
    }
    expect(shape('O',0)).toEqual(shape('O',1));
    expect(shape('O',1)).toEqual(shape('O',3));
    expect(shape('T',0)).not.toEqual(shape('T',1));
  });
});
describe('Rotation with SRS kick candidates',()=>{
  it('has distinct I and JLSTZ kick tables',()=>{expect(kicks('I',0,1)).not.toEqual(kicks('T',0,1));expect(kicks('O',0,1)).toEqual([[0,0]]);});
  it('kicks a T piece off the left wall',()=>{
    const s=createGame('challenge');s.active={kind:'T',rotation:1,x:-1,y:10};
    expect(rotate(s,-1)).toBe(true);expect(s.active.x).toBe(0);expect(s.active.rotation).toBe(0);
  });
  it('kicks a T piece off the right wall',()=>{
    const s=createGame('challenge');s.active={kind:'T',rotation:3,x:8,y:10};
    expect(rotate(s,1)).toBe(true);expect(s.active.x).toBe(7);expect(s.active.rotation).toBe(0);
  });
  it('uses a floor kick for T and I pieces',()=>{
    for(const kind of ['T','I'] as const){
      const s=createGame('challenge');s.active={kind,x:3,y:20,rotation:0};
      const good=rotate(s,1);
      expect(good).toBe(true);expect(s.active.rotation).toBe(1);
      expect(blocks(s.active).every(([x,y])=>y>=0&&y<BOARD_H&&x>=0&&x<BOARD_W)).toBe(true);
    }
  });
  it('preserves x, y, and rotation when all kick candidates collide',()=>{
    const s=createGame('challenge');s.active={kind:'T',rotation:0,x:3,y:10};
    s.board=Array.from({length:BOARD_H},()=>Array(BOARD_W).fill('O'));
    for(const [x,y] of blocks(s.active))s.board[y][x]=null;
    const saved={...s.active};
    expect(rotate(s,1)).toBe(false);expect(s.active).toEqual(saved);
  });
});
describe('Tick-accurate gravity, locking and drop actions',()=>{
  it('level 1 drops after 60 ticks and level 10 after 10',()=>{
    expect(gravityTicks(1)).toBe(60);expect(gravityTicks(10)).toBe(10);
    for(const [level,count] of [[1,60],[10,10]]){
      const s=createGame('challenge',level);const y=s.active.y;
      for(let i=0;i<count-1;i++)step(s);
      expect(s.active.y).toBe(y);step(s);expect(s.active.y).toBe(y+1);
    }
  });
  it('locks after 30 grounded ticks',()=>{
    const s=createGame('challenge');s.active={kind:'O',x:3,y:20,rotation:0};
    for(let i=0;i<29;i++)step(s);
    expect(s.board[21][4]).toBe(null);
    step(s);expect(s.board[21][4]).toBe('O');
  });
  it('resets ground lock when moved, at most 15 times',()=>{
    const s=createGame('challenge');s.active={kind:'O',x:3,y:20,rotation:0};
    for(let i=0;i<20;i++)step(s);
    expect(move(s,1)).toBe(true);expect(s.lockCounter).toBe(0);expect(s.lockResets).toBe(1);
    s.lockResets=15;s.lockCounter=19;
    expect(move(s,-1)).toBe(true);
    expect(s.lockCounter).toBe(19);
  });
  it('soft drop moves one cell per two ticks and scores one point',()=>{
    const s=createGame('challenge');const y=s.active.y;
    step(s,true);expect(s.active.y).toBe(y);
    step(s,true);expect(s.active.y).toBe(y+1);expect(s.score).toBe(1);
  });
  it('soft drop overrides natural gravity even at the fastest start level',()=>{
    const s=createGame('challenge',10), y=s.active.y;
    for(let i=0;i<10;i++)step(s,true);
    expect(s.active.y).toBe(y+5);
    expect(s.score).toBe(5);
  });
  it('hard drop scores 2 per cell, locks immediately',()=>{
    const s=createGame('challenge');const y=s.active.y;
    const length=hardDrop(s);
    expect(length).toBeGreaterThan(0);expect(s.score).toBe(2*length);
    expect(s.board.flat().filter(Boolean)).toHaveLength(4);expect(s.board.flat().filter(Boolean)).toHaveLength(4);
  });
});
describe('Clears, levels and different modes',()=>{
  const prepare=(lines:number)=>{
    const s=createGame('challenge',3,11);s.board=emptyBoard();s.active={kind:'I',x:2,y:0,rotation:1};
    for(let y=BOARD_H-lines;y<BOARD_H;y++)
      for(let x=0;x<BOARD_W;x++)if(x!==4)s.board[y][x]='Z';
    return s;
  };
  for(const n of [1,2,3,4]){
    it('awards '+n+' line score multiplied by level',()=>{
      const s=prepare(n);hardDrop(s);expect(s.phase).toBe('clearing');
      const before=s.score;for(let i=0;i<12;i++)step(s);
      expect(s.score-before).toBe(LINE_SCORES[n]*3);
      expect(s.lines).toBe(n);expect(s.phase).toBe('active');
    });
  }
  it('removes separated filled rows without moving the other cells incorrectly',()=>{
    const s=createGame('gentle');s.board=emptyBoard();
    s.board[18].fill('T');s.board[21].fill('T');
    s.board[19][0]='I';s.board[20][1]='J';
    removeRows(s,[18,21]);
    expect(s.board[20][0]).toBe('I');expect(s.board[21][1]).toBe('J');
  });
  it('levels up after 10 lines in challenge but stays fixed in gentle',()=>{
    for(const mode of ['challenge','gentle'] as const){
      const s=createGame(mode,1,123);s.lines=9;
      removeRows(s,[21]);expect(s.lines).toBe(10);
      expect(s.level).toBe(mode==='challenge'?2:1);
    }
  });
  it('sprint wins at 40 cleared lines, time uses 60 ticks per second',()=>{
    const s=createGame('sprint40');s.lines=39;s.ticks=180;
    removeRows(s,[21]);expect(s.phase).toBe('won');expect(s.lines).toBe(40);
    expect(elapsedMs(s)).toBe(3000);
  });
});
describe('Hold and touch input cadence',()=>{
  it('holds only once per piece, resets after locking, exchanged piece resets rotation',()=>{
    const s=createGame('challenge');const first=s.active.kind;
    expect(holdPiece(s)).toBe(true);expect(s.hold).toBe(first);
    expect(holdPiece(s)).toBe(false);
    hardDrop(s);
    if(s.phase==='clearing')for(let i=0;i<12;i++)step(s);
    expect(holdPiece(s)).toBe(true);
    expect(s.active.kind).toBe(first);
    expect(s.active.rotation).toBe(0);
  });
  it('starts repeating after 12 ticks and then every 4 ticks',()=>{
    const state={pressed:false,ticks:0};repeatStart(state);
    for(let i=1;i<12;i++)expect(repeatTick(state,'normal')).toBe(false);
    expect(repeatTick(state,'normal')).toBe(true);
    for(let i=13;i<16;i++)expect(repeatTick(state,'normal')).toBe(false);
    expect(repeatTick(state,'normal')).toBe(true);
    repeatStop(state);expect(repeatTick(state,'normal')).toBe(false);
  });
});
