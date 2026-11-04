import { useEffect, useState } from 'react';
import { GAME_TITLE, VERSION } from './brand';
import { GameScreen } from './screens/GameScreen';
import { formatTime } from './render/canvas';
import { loadData, saveData } from './storage/store';
import { backupName, exportBackup, importBackup } from './storage/backup';
import { makeProfile, recordGame, type AppData, type Profile, type Settings } from './storage/schema';
import type { GameState } from './core/game';
import type { Mode } from './core/config';
import { translate as t } from './i18n';
import { sound } from './audio/sound';
import { hubUrl, isNative, pickTextFile, saveTextFile, shareFile } from './platform/native';
import './styles/app.css';

type Screen='home'|'settings'|'records'|'play'|'result'|'licenses';
function modeName(lang:'ko'|'en',mode:Mode){return t(lang,mode);}
const MODES:Mode[]=['gentle','challenge','sprint40'];
export default function App(){
  const [data,setData]=useState<AppData|null>(null);
  const [recoverNotice,setRecoverNotice]=useState(false);
  const [screen,setScreen]=useState<Screen>('home');
  const [mode,setMode]=useState<Mode>('gentle');
  const [gentleLevel,setGentleLevel]=useState(1);
  const [challengeLevel,setChallengeLevel]=useState(1);
  const [startLevel,setStartLevel]=useState(1);
  const [session,setSession]=useState(0);
  const [result,setResult]=useState<GameState|null>(null);
  useEffect(()=>{
    let mounted=true;
    void loadData().then(({data:loaded,recovered})=>{
      if(mounted){setData(loaded);setRecoverNotice(recovered);}
    }).catch(()=>{if(mounted){setData({version:1,activeProfileId:'child',
      profiles:[makeProfile('dad','아빠'),makeProfile('child','아이')]});setRecoverNotice(true);}});
    return()=>{mounted=false;};
  },[]);
  if(!data)return <main className="loading">{GAME_TITLE}</main>;
  const current=data.profiles.find(p=>p.id===data.activeProfileId)??data.profiles[0];
  const lang=current.lang;
  const T=(key:Parameters<typeof t>[1])=>t(lang,key);
  const persist=(next:AppData)=>{
    setData(next);void saveData(next).catch(()=>alert(lang==='ko'?'저장에 실패했습니다.':'Could not save records.'));
  };
  const updateProfile=(mutate:(p:Profile)=>void)=>{
    const next=structuredClone(data);
    const p=next.profiles.find(v=>v.id===next.activeProfileId)??next.profiles[0];
    mutate(p);persist(next);
  };
  const settingsUpdate=<K extends keyof Settings>(key:K,value:Settings[K])=>{
    updateProfile(p=>{p.settings[key]=value;});
  };
  const start=(m:Mode)=>{
    sound.unlock();
    sound.configure(current.settings);
    setMode(m);setStartLevel(m==='gentle'?gentleLevel:m==='challenge'?challengeLevel:1);
    setSession(v=>v+1);setScreen('play');
  };
  const finish=(game:GameState)=>{
    const next=recordGame(data,game);persist(next);
    setResult(game);setScreen('result');sound.suspend();
  };
  const resetGame=()=>{sound.unlock();setSession(v=>v+1);};
  const saveBackup=async()=>{
    try {
      const out=await saveTextFile(backupName(),exportBackup(data),'application/json');
      if(out.uri&&isNative)await shareFile(out.uri,GAME_TITLE);
      else alert(T('saved'));
    }catch{alert(T('badBackup'));}
  };
  const restoreBackup=async()=>{
    const raw=await pickTextFile('.json,application/json');if(raw===null)return;
    const parsed=importBackup(raw);
    if(!parsed.ok){alert(T('badBackup'));return;}
    if(!window.confirm(T('importsWarning')))return;
    persist(parsed.data);alert(T('restored'));setScreen('home');
  };
  const clearProfile=()=>{
    if(!window.confirm(T('eraseConfirm'))||!window.confirm(T('eraseAgain')))return;
    updateProfile(p=>{
      const clean=makeProfile(p.id,p.name);
      p.records=clean.records;p.recent=[];
    });
  };
  const bestFor=(m:Mode,p:Profile)=>{
    if(m==='gentle')return p.records.gentle.bestLinesOneGame+' '+T('lines');
    if(m==='challenge')return p.records.challenge.bestScore.toLocaleString()+' '+T('score');
    return p.records.sprint40.bestMs===null?T('notYet'):formatTime(p.records.sprint40.bestMs);
  };
  const settings=current.settings;
  return <div className="app-shell">
    <div className="rotate-message"><div className="rotate-icon">↻</div>{T('rotateDevice')}</div>
    {screen==='play'?<GameScreen key={session} mode={mode} level={startLevel} lang={lang}
      settings={settings} onFinish={finish} onRestart={resetGame}/>:
    <main className="main-shell">
      <header className="site-header">
        <button className="logo" onClick={()=>setScreen('home')} aria-label={T('home')}>
          <span className="logo-mark" aria-hidden="true"><i/><i/><i/><i/></span>
          <span className="logo-text">{GAME_TITLE}<small>PLAYVAULT · FAMILY</small></span>
        </button>
        <div className="header-actions">
          {screen==='home'?<>
            {hubUrl&&<a className="text-link" href={hubUrl}>← PLAYVAULT</a>}
            <label className="profile-select"><span>{T('chooseProfile')}</span>
              <select aria-label={T('chooseProfile')} value={data.activeProfileId}
                onChange={e=>persist({...data,activeProfileId:e.target.value})}>
                {data.profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          </>:<button className="back-link" onClick={()=>setScreen('home')}>← {T('home')}</button>}
          {screen==='home'&&<button className="outline" onClick={()=>setScreen('settings')}>{T('settings')}</button>}
        </div>
      </header>
      {recoverNotice&&<div className="inline-alert" role="status">{T('recovered')}
        <button aria-label="Close" onClick={()=>setRecoverNotice(false)}>×</button></div>}
      {screen==='home'&&<section className="home-content">
        <div className="intro"><p className="eyebrow">OFFLINE · FAMILY GAME</p>
          <h1>{lang==='ko'?'가족이 함께 즐기는 조용한 블록 퍼즐':'A gentle block puzzle for the family'}</h1>
          <p>{lang==='ko'?'빠르게 잘할 필요는 없어요. 원하는 속도로 한 칸씩 쌓아 보세요.':'Enjoy each piece at your own pace.'}</p>
        </div>
        <div className="mode-cards">
          {MODES.map((m,i)=><article key={m} className={'mode-card mode-'+m}>
            <div className="card-top"><span className="card-number">0{i+1}</span>
              <span className="mini-pieces" aria-hidden="true">{m==='gentle'?'▟':m==='challenge'?'▦':'▤'}</span></div>
            <h2>{modeName(lang,m)}</h2>
            <p>{T(m==='gentle'?'gentleDesc':m==='challenge'?'challengeDesc':'sprintDesc')}</p>
            <div className="card-bottom">
              <div className="record-preview"><small>{T('best')}</small><strong>{bestFor(m,current)}</strong></div>
              {m!=='sprint40'&&<label className="level-picker">{T('startLevel')}
                <select data-testid={'level-'+m}
                  value={m==='gentle'?gentleLevel:challengeLevel}
                  onChange={e=>m==='gentle'?setGentleLevel(Number(e.target.value)):setChallengeLevel(Number(e.target.value))}>
                  {Array.from({length:m==='gentle'?5:10},(_,n)=>n+1).map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </label>}
              <button className="primary" data-testid={'start-'+m} onClick={()=>start(m)}>{T('start')}</button>
            </div>
          </article>)}
        </div>
        <div className="home-bottom">
          <p>{T('howTo')}</p>
          <button className="quiet-button" onClick={()=>setScreen('records')}>{T('records')} →</button>
        </div>
      </section>}
      {screen==='settings'&&<section className="content-card settings-card" data-testid="settings">
        <div className="section-title"><p className="eyebrow">PREFERENCES</p><h1>{T('settings')}</h1></div>
        <div className="settings-grid">
          <label>{T('chooseProfile')}<select value={data.activeProfileId} onChange={e=>persist({...data,activeProfileId:e.target.value})}>
            {data.profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>{T('name')}<input maxLength={24} value={current.name}
            onChange={e=>updateProfile(p=>{p.name=e.target.value.slice(0,24);})}/></label>
          <label>{T('language')}<select value={lang}
            onChange={e=>updateProfile(p=>{p.lang=e.target.value==='en'?'en':'ko';})}>
            <option value="ko">한국어</option><option value="en">English</option></select></label>
          <label>{T('controls')}<select value={settings.touchButtons} onChange={e=>settingsUpdate('touchButtons',e.target.value as Settings['touchButtons'])}>
            <option value="auto">{T('auto')}</option><option value="on">{T('on')}</option><option value="off">{T('off')}</option></select></label>
          <label>{T('repeat')}<select value={settings.repeatSpeed} onChange={e=>settingsUpdate('repeatSpeed',e.target.value as Settings['repeatSpeed'])}>
            <option value="slow">{T('slow')}</option><option value="normal">{T('normal')}</option><option value="fast">{T('fast')}</option></select></label>
          <label>{T('previews')}<select value={settings.previews} onChange={e=>settingsUpdate('previews',e.target.value==='1'?1:3)}>
            <option value="1">{T('pieces1')}</option><option value="3">{T('pieces3')}</option></select></label>
          <label className="toggle-row"><span>{T('ghost')}</span><input type="checkbox" checked={settings.ghost} onChange={e=>settingsUpdate('ghost',e.target.checked)}/></label>
          <label className="toggle-row"><span>{T('sfx')}</span><input type="checkbox" checked={settings.sfx} onChange={e=>settingsUpdate('sfx',e.target.checked)}/></label>
          <label className="toggle-row"><span>{T('music')}</span><input type="checkbox" checked={settings.music} onChange={e=>settingsUpdate('music',e.target.checked)}/></label>
          {isNative&&<label className="toggle-row"><span>{T('vibrate')}</span><input type="checkbox" checked={settings.vibration} onChange={e=>settingsUpdate('vibration',e.target.checked)}/></label>}
          <label>{T('volume')} <strong>{Math.round(settings.volume*100)}%</strong><input type="range" min="0" max="1" step=".05"
            value={settings.volume} onChange={e=>settingsUpdate('volume',Number(e.target.value))}/></label>
        </div>
        <div className="settings-actions">
          <button onClick={()=>void saveBackup()}>{T('export')}</button>
          <button onClick={()=>void restoreBackup()}>{T('import')}</button>
          <button className="destructive" onClick={clearProfile}>{T('erase')}</button>
          <button onClick={()=>setScreen('licenses')}>{T('license')}</button>
        </div>
        <p className="muted">{T('version')} {VERSION} · {T('soundHelp')}</p>
      </section>}
      {screen==='records'&&<section className="content-card" data-testid="records">
        <div className="section-title"><p className="eyebrow">{current.name}</p><h1>{T('records')}</h1></div>
        <div className="record-grid">
          {MODES.map(m=><div className="record-panel" key={m}><h2>{T(m)}</h2>
            {m==='gentle'&&<><p>{T('plays')}: {current.records.gentle.plays}</p>
              <p>{T('totalLines')}: {current.records.gentle.totalLines}</p>
              <p>{T('bestLines')}: {current.records.gentle.bestLinesOneGame}</p></>}
            {m==='challenge'&&<><p>{T('plays')}: {current.records.challenge.plays}</p>
              <p>{T('bestScore')}: {current.records.challenge.bestScore.toLocaleString()}</p>
              <p>{T('topLevel')}: {current.records.challenge.bestLevel}</p>
              <p>{T('lines')}: {current.records.challenge.bestLines}</p></>}
            {m==='sprint40'&&<><p>{T('plays')}: {current.records.sprint40.plays}</p>
              <p>{T('clear')}: {current.records.sprint40.clears}</p>
              <p>{T('sprintBest')}: {current.records.sprint40.bestMs===null?T('notYet'):formatTime(current.records.sprint40.bestMs)}</p></>}
          </div>)}
        </div>
        {current.recent.length>0&&<div className="recent-games">
          {current.recent.map((g,i)=><p key={i}>
            <span>{T(g.mode)}</span><span>{new Date(g.date).toLocaleDateString()}</span>
            <span>{g.lines} {T('lines')}</span><span>{g.score.toLocaleString()}</span>
          </p>)}
        </div>}
      </section>}
      {screen==='result'&&result&&<section className="result-view" data-testid="game-result">
        <p className="eyebrow">{T('finish')}</p>
        <h1>{result.phase==='won'?T('done'):result.phase==='over'?T('over'):T('noRecord')}</h1>
        <p>{T(result.mode)}</p>
        <div className="result-stats"><div><small>{T('score')}</small><strong>{result.score.toLocaleString()}</strong></div>
          <div><small>{T('lines')}</small><strong>{result.lines}</strong></div>
          <div><small>{T('level')}</small><strong>{result.level}</strong></div>
          <div><small>{T('time')}</small><strong>{formatTime(result.ticks*1000/60)}</strong></div></div>
        <p className="muted">{T('best')}: {bestFor(result.mode,data.profiles.find(p=>p.id===data.activeProfileId)??data.profiles[0])}</p>
        <div className="result-actions"><button className="primary" data-testid="play-again"
          onClick={()=>start(result.mode)}>{T('again')}</button>
          <button onClick={()=>setScreen('home')}>{T('home')}</button></div>
      </section>}
      {screen==='licenses'&&<section className="content-card license-content">
        <p className="eyebrow">{T('license')}</p><h1>{GAME_TITLE}</h1>
        <p>{T('copyright')}</p>
        <p>Gowun Dodum · SIL Open Font License 1.1</p>
        <p>Nunito Variable · SIL Open Font License 1.1</p>
        <p>Capacitor · MIT License, React · MIT License, Vite · MIT License</p>
        <p>{T('version')} {VERSION}</p>
      </section>}
      <footer className="site-footer">BLOCKS · MADE FOR FAMILY <span>v{VERSION}</span></footer>
    </main>}
  </div>;
}
