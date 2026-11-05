import type { GameState } from '../core/game';
import type { Mode, Speed } from '../core/config';
export const APP_ID = 'com.playvault.familyblocks';
export const SCHEMA_VERSION = 1;
export interface Settings {
  touchButtons: 'auto'|'on'|'off'; repeatSpeed: Speed;
  ghost: boolean; previews: 1|3;
  sfx: boolean; music: boolean; volume: number; vibration: boolean;
  /** APK: hide Android's status/navigation bars (web full screen is per visit) */
  fullscreen: boolean;
}
export interface RecentGame {mode: Mode;date:string;score:number;lines:number;ms:number}
export interface Profile {
  id:string; name:string;lang:'ko'|'en';
  settings:Settings;
  records:{
    gentle:{totalLines:number;bestLinesOneGame:number;plays:number};
    challenge:{bestScore:number;bestLevel:number;bestLines:number;plays:number};
    sprint40:{bestMs:number|null;plays:number;clears:number};
  };
  recent:RecentGame[];
}
export interface AppData {version:1;activeProfileId:string;profiles:Profile[]}
export function defaultSettings():Settings {
  return {touchButtons:'auto',repeatSpeed:'normal',ghost:true,previews:3,
    sfx:true,music:true,volume:0.35,vibration:true,fullscreen:false};
}
export function makeProfile(id:string,name:string):Profile {
  return {id,name,lang:'ko',settings:defaultSettings(),records:{
    gentle:{totalLines:0,bestLinesOneGame:0,plays:0},
    challenge:{bestScore:0,bestLevel:0,bestLines:0,plays:0},
    sprint40:{bestMs:null,plays:0,clears:0}
  },recent:[]};
}
export function defaultData():AppData {
  return {version:1,activeProfileId:'child',profiles:[makeProfile('dad','아빠'),makeProfile('child','아이')]};
}
function dict(v:unknown):Record<string,unknown> {
  return v && typeof v==='object'&&!Array.isArray(v) ? v as Record<string,unknown> : {};
}
function text(v:unknown,fallback:string,max=24) {return typeof v==='string'&&v.trim()?v.slice(0,max):fallback;}
function number(v:unknown,fallback=0) {return typeof v==='number'&&Number.isFinite(v)&&v>=0?v:fallback;}
function positiveInt(v:unknown,fallback=0) {return Math.floor(number(v,fallback));}
function bool(v:unknown,fallback:boolean) {return typeof v==='boolean'?v:fallback;}
function option<T extends string>(v:unknown,values:readonly T[],fallback:T):T {
  return typeof v==='string'&&values.includes(v as T)?v as T:fallback;
}
export function validateData(raw:unknown):{ok:true;data:AppData;recovered:boolean}|{ok:false;error:string} {
  const obj=dict(raw);
  if(obj.version!==1||!Array.isArray(obj.profiles)) return {ok:false,error:'invalidSchema'};
  const output:Profile[]=[];
  const ids=new Set<string>();
  for(const candidate of obj.profiles.slice(0,2)){
    const p=dict(candidate), id=text(p.id,'',60);
    if(!id||ids.has(id)) continue;
    ids.add(id);
    const fallback=makeProfile(id,id==='dad'?'아빠':id==='child'?'아이':id);
    const s=dict(p.settings),r=dict(p.records);
    const g=dict(r.gentle),c=dict(r.challenge),v=dict(r.sprint40);
    const recent=(Array.isArray(p.recent)?p.recent:[]).slice(0,20).map(entry=>{
      const z=dict(entry);
      return {mode:option(z.mode,['gentle','challenge','sprint40'] as const,'gentle'),
        date:text(z.date,'',50),score:positiveInt(z.score),lines:positiveInt(z.lines),ms:positiveInt(z.ms)};
    });
    const profile:Profile={
      id,name:text(p.name,fallback.name),lang:option(p.lang,['ko','en'] as const,'ko'),
      settings:{
        touchButtons:option(s.touchButtons,['auto','on','off'] as const,'auto'),
        repeatSpeed:option(s.repeatSpeed,['slow','normal','fast'] as const,'normal'),
        ghost:bool(s.ghost,true),previews:s.previews===1?1:3,
        sfx:bool(s.sfx,true),music:bool(s.music,true),
        volume:Math.min(1,number(s.volume,0.35)),vibration:bool(s.vibration,true),
        fullscreen:bool(s.fullscreen,false)
      },
      records:{
        gentle:{totalLines:positiveInt(g.totalLines),bestLinesOneGame:positiveInt(g.bestLinesOneGame),plays:positiveInt(g.plays)},
        challenge:{bestScore:positiveInt(c.bestScore),bestLevel:positiveInt(c.bestLevel),bestLines:positiveInt(c.bestLines),plays:positiveInt(c.plays)},
        sprint40:{bestMs:typeof v.bestMs==='number'&&v.bestMs>0&&Number.isFinite(v.bestMs)?v.bestMs:null,
          plays:positiveInt(v.plays),clears:positiveInt(v.clears)}
      },recent
    };
    output.push(profile);
  }
  if(!output.length) return {ok:false,error:'noProfile'};
  const active=option(obj.activeProfileId,output.map(p=>p.id),output[0].id);
  const data:AppData={version:1,activeProfileId:active,profiles:output};
  return {ok:true,data,recovered:JSON.stringify(data)!==JSON.stringify(raw)};
}
export function recordGame(data:AppData,game:GameState):AppData {
  const copy=structuredClone(data);
  const p=copy.profiles.find(x=>x.id===copy.activeProfileId)??copy.profiles[0];
  const r=p.records;
  if(game.mode==='gentle') {
    r.gentle.plays++;r.gentle.totalLines+=game.lines;
    r.gentle.bestLinesOneGame=Math.max(game.lines,r.gentle.bestLinesOneGame);
  }else if(game.mode==='challenge'){
    r.challenge.plays++;r.challenge.bestScore=Math.max(game.score,r.challenge.bestScore);
    r.challenge.bestLevel=Math.max(game.level,r.challenge.bestLevel);
    r.challenge.bestLines=Math.max(game.lines,r.challenge.bestLines);
  }else {
    r.sprint40.plays++;
    if(game.phase==='won'){
      r.sprint40.clears++;
      const ms=Math.round(game.ticks*1000/60);
      r.sprint40.bestMs=r.sprint40.bestMs===null?ms:Math.min(ms,r.sprint40.bestMs);
    }
  }
  p.recent.unshift({mode:game.mode,date:new Date().toISOString(),
    score:game.score,lines:game.lines,ms:Math.round(game.ticks*1000/60)});
  p.recent=p.recent.slice(0,20);
  return copy;
}
