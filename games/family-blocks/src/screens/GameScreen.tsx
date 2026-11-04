import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createGame, move, rotate, hardDrop, holdPiece, step, clearEvents, type GameState } from '../core/game';
import { repeatStart, repeatStop, repeatTick, type RepeatState } from '../core/repeat';
import type { Mode } from '../core/config';
import type { Settings } from '../storage/schema';
import { renderGame } from '../render/canvas';
import { sound } from '../audio/sound';
import { haptic, onBackButton, onLifecycle } from '../platform/native';
import { translate as t } from '../i18n';

type ButtonId='left'|'right'|'soft'|'cw'|'ccw'|'drop'|'hold';
const keymap:Record<string,ButtonId>={
  ArrowLeft:'left',ArrowRight:'right',ArrowDown:'soft',
  ArrowUp:'cw',KeyX:'cw',KeyZ:'ccw',Space:'drop',KeyC:'hold',
  ShiftLeft:'hold',ShiftRight:'hold'
};
const buttons:{id:ButtonId;label:string;hint:string}[]=[
  {id:'left',label:'←',hint:'Move left'},{id:'soft',label:'↓',hint:'Soft drop'},
  {id:'right',label:'→',hint:'Move right'},
  {id:'ccw',label:'↺',hint:'Rotate left'},{id:'cw',label:'↻',hint:'Rotate right'},
  {id:'drop',label:'⤓',hint:'Hard drop'},{id:'hold',label:'▣',hint:'Hold'}
];
export interface GameScreenProps {
  mode:Mode;level:number;lang:'ko'|'en';settings:Settings;
  onFinish:(s:GameState)=>void;onRestart:()=>void;
}
export function GameScreen({mode,level,lang,settings,onFinish,onRestart}:GameScreenProps){
  const seed=Number(new URLSearchParams(window.location.search).get('seed'))||Date.now();
  const game=useMemo(()=>createGame(mode,level,seed),[mode,level]); // new session on remount
  const canvas=useRef<HTMLCanvasElement>(null);
  const pointers=useRef(new Map<number,ButtonId>());
  const heldKeys=useRef(new Map<string,ButtonId>());
  const repeats=useRef<{left:RepeatState;right:RepeatState}>({
    left:{pressed:false,ticks:0},right:{pressed:false,ticks:0}
  });
  const pausedRef=useRef(false);
  const finishedRef=useRef(false);
  const handlers=useRef({onFinish,onRestart});
  handlers.current={onFinish,onRestart};
  const [paused,setPaused]=useState(false);
  const [touchVisible,setTouchVisible]=useState(true);
  const [notice,setNotice]=useState('');
  const noticeExpire=useRef(0);
  const active=useCallback((id:ButtonId)=>{
    return [...pointers.current.values(),...heldKeys.current.values()].includes(id);
  },[]);
  const trigger=useCallback((id:ButtonId)=>{
    if(pausedRef.current||game.phase!=='active')return;
    if(id==='left')move(game,-1);
    if(id==='right')move(game,1);
    if(id==='cw')rotate(game,1);
    if(id==='ccw')rotate(game,-1);
    if(id==='hold')holdPiece(game);
    if(id==='drop')hardDrop(game);
  },[game]);
  const pressed=useCallback((id:ButtonId)=>{
    if(id==='left'||id==='right'){
      repeatStart(repeats.current[id]);
    }
    trigger(id);
  },[active,trigger]);
  const released=useCallback((id:ButtonId)=>{
    if((id==='left'||id==='right')&&!active(id))repeatStop(repeats.current[id]);
  },[active]);
  const pointerDown=(id:ButtonId,e:ReactPointerEvent<HTMLButtonElement>)=>{
    e.preventDefault();
    sound.unlock();setTouchVisible(true);
    const already=active(id);
    pointers.current.set(e.pointerId,id);
    e.currentTarget.setPointerCapture(e.pointerId);
    if(!already)pressed(id);
  };
  const pointerUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    const id=pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if(id)released(id);
  };
  useEffect(()=>{
    pausedRef.current=paused;
    if(paused)sound.suspend();else sound.unlock();
  },[paused]);
  useEffect(()=>{
    const down=(event:KeyboardEvent)=>{
      if(event.code==='Escape'||event.code==='KeyP'){
        event.preventDefault();setPaused(v=>!v);return;
      }
      const id=keymap[event.code];if(!id)return;
      event.preventDefault();
      if(settings.touchButtons==='auto')setTouchVisible(false);
      if(event.repeat||heldKeys.current.has(event.code))return;
      const already=active(id);
      heldKeys.current.set(event.code,id);
      if(!already)pressed(id);
    };
    const up=(event:KeyboardEvent)=>{
      const id=heldKeys.current.get(event.code);
      if(id){event.preventDefault();heldKeys.current.delete(event.code);released(id);}
    };
    const lost=()=>{
      heldKeys.current.clear();pointers.current.clear();
      repeatStop(repeats.current.left);repeatStop(repeats.current.right);
      setPaused(true);
    };
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    window.addEventListener('blur',lost);
    const offLife=onLifecycle(()=>{lost();},()=>{});
    const offBack=onBackButton(()=>{setPaused(true);});
    return()=>{
      window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);
      window.removeEventListener('blur',lost);offLife();offBack();
    };
  },[active,pressed,released,settings.touchButtons]);
  useEffect(()=>{
    let raf=0,last=0,accumulator=0;
    const frame=(now:number)=>{
      if(!last)last=now;
      if(!pausedRef.current){
        accumulator+=Math.min(100,now-last);
        let count=0;
        while(accumulator>=1000/60&&count<5){
          accumulator-=1000/60;count++;
          if(repeatTick(repeats.current.left,settings.repeatSpeed))move(game,-1);
          if(repeatTick(repeats.current.right,settings.repeatSpeed))move(game,1);
          step(game,active('soft'));
          for(const ev of clearEvents(game)){
            if(ev==='rescue'){setNotice(t(lang,'rescue'));noticeExpire.current=now+1900;}
            else sound.play(ev);
            if(settings.vibration&&(ev==='clear4'||ev==='end'))void haptic(ev==='end'?'heavy':'medium');
          }
          if((game.phase==='over'||game.phase==='won')&&!finishedRef.current){
            finishedRef.current=true;
            handlers.current.onFinish(game);
            break;
          }
        }
      }else accumulator=0;
      if(notice&&now>=noticeExpire.current)setNotice('');
      if(canvas.current)renderGame(canvas.current,game,settings,lang);
      last=now;raf=requestAnimationFrame(frame);
    };
    Object.assign(window,{__familyBlocksState:game});
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);delete (window as Window & {__familyBlocksState?:GameState}).__familyBlocksState;};
  },[game,settings,lang,active,notice]);
  const visible=settings.touchButtons==='on'||settings.touchButtons==='auto'&&touchVisible;
  const finish=()=>{setPaused(false);handlers.current.onFinish(game);};
  return <main className="game-page" data-testid="game-screen" data-mode={mode} onPointerDown={e=>{if(e.pointerType==='touch')setTouchVisible(true);}}>
    <canvas ref={canvas} className="game-canvas" aria-label={lang==='ko'?'블록 퍼즐 게임판':'Block puzzle board'} />
    <div className="game-top"><span className="game-chip">{t(lang,mode)}</span>
      <button data-testid="pause" className="button-pause" onClick={()=>setPaused(true)}>Ⅱ <span>{t(lang,'pause')}</span></button>
    </div>
    {notice&&<div className="notice" role="status">{notice}</div>}
    {visible&&<div className="touch-controls" data-testid="touch-controls">
      <div className="touch-group left-controls">
        {buttons.slice(0,3).map(b=><button key={b.id} data-testid={'ctrl-'+b.id}
          aria-label={b.hint} className={'touch-button touch-'+b.id}
          onPointerDown={e=>pointerDown(b.id,e)} onPointerUp={pointerUp} onPointerCancel={pointerUp}
          onContextMenu={e=>e.preventDefault()}>{b.label}</button>)}
      </div>
      <div className="right-controls">
        <button data-testid="ctrl-hold" aria-label={t(lang,'hold')} className="touch-button touch-hold"
          onPointerDown={e=>pointerDown('hold',e)} onPointerUp={pointerUp} onPointerCancel={pointerUp}>▣ <small>{t(lang,'hold')}</small></button>
        <div className="touch-group">
          {buttons.slice(3,6).map(b=><button key={b.id} data-testid={'ctrl-'+b.id}
            aria-label={b.hint} className={'touch-button touch-'+b.id}
            onPointerDown={e=>pointerDown(b.id,e)} onPointerUp={pointerUp} onPointerCancel={pointerUp}
            onContextMenu={e=>e.preventDefault()}>{b.label}</button>)}
        </div>
      </div>
    </div>}
    {paused&&<div className="overlay" data-testid="pause-overlay"><div className="dialog">
      <p className="eyebrow">{t(lang,'pause')}</p><h2>{t(lang,mode)}</h2>
      <button className="primary" data-testid="resume" onClick={()=>setPaused(false)}>{t(lang,'resume')}</button>
      <button data-testid="restart" onClick={()=>{if(window.confirm(t(lang,'retryConfirm')))handlers.current.onRestart();}}>{t(lang,'restart')}</button>
      <button data-testid="quit" onClick={()=>{if(window.confirm(t(lang,'exitConfirm')))finish();}}>{t(lang,'quit')}</button>
      <p className="muted">{t(lang,'keyEsc')}</p>
    </div></div>}
  </main>;
}
