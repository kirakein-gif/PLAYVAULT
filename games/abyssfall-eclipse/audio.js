(() => {
  'use strict';

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const A = window.PV_AUDIO = {
    ctx:null, master:null, musicGain:null, sfxGain:null,
    unlocked:false, muted:false, mode:null, timers:[], musicNodes:[],
    lastSfx:{}
  };

  try { A.muted = localStorage.getItem('playvaultMuted') === '1'; } catch (_) {}

  function ensure(){
    if(A.ctx || !AudioCtx) return !!A.ctx;
    const ctx=A.ctx=new AudioCtx();
    A.master=ctx.createGain();A.musicGain=ctx.createGain();A.sfxGain=ctx.createGain();
    A.musicGain.gain.value=.105;A.sfxGain.gain.value=.30;
    A.musicGain.connect(A.master);A.sfxGain.connect(A.master);A.master.connect(ctx.destination);
    A.master.gain.value=A.muted?0:.72;
    return true;
  }

  function clearMusic(){
    A.timers.forEach(clearInterval);A.timers.length=0;
    A.musicNodes.forEach(n=>{try{n.stop?.()}catch(_){} try{n.disconnect?.()}catch(_){}});
    A.musicNodes.length=0;A.mode=null;
  }

  function tone(freq,dur=.18,vol=.12,type='sine',dest=A.sfxGain,when=0,slide=0){
    if(!A.ctx||A.muted)return;
    const t=A.ctx.currentTime+when,o=A.ctx.createOscillator(),g=A.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.03);
  }

  function noise(dur=.12,vol=.05,cutoff=1200,when=0){
    if(!A.ctx||A.muted)return;
    const len=Math.max(1,Math.floor(A.ctx.sampleRate*dur)),buf=A.ctx.createBuffer(1,len,A.ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const src=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=A.ctx.createGain(),t=A.ctx.currentTime+when;
    src.buffer=buf;f.type='lowpass';f.frequency.value=cutoff;g.gain.value=vol;
    src.connect(f);f.connect(g);g.connect(A.sfxGain);src.start(t);
  }

  function drone(freq,vol,type='sine',detune=0){
    const o=A.ctx.createOscillator(),g=A.ctx.createGain();
    o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.value=vol;
    o.connect(g);g.connect(A.musicGain);o.start();A.musicNodes.push(o,g);
  }

  function musicNote(freq,vol=.035,dur=1.7,type='sine'){
    if(!A.ctx||A.muted)return;
    tone(freq,dur,vol,type,A.musicGain,0);
    tone(freq*2,Math.min(.9,dur*.55),vol*.22,'sine',A.musicGain,.04);
  }

  A.unlock=async()=>{
    if(!ensure())return false;
    try{if(A.ctx.state==='suspended')await A.ctx.resume();A.unlocked=true;A.updateButton();return true}catch(_){return false}
  };

  A.startExplore=()=>{
    if(!ensure()||!A.unlocked||A.mode==='explore')return;
    clearMusic();A.mode='explore';
    drone(55,.018,'sine',-6);drone(82.41,.010,'triangle',5);
    const notes=[220,246.94,261.63,196,174.61,196];
    let i=0;
    musicNote(notes[i++%notes.length],.030,2.1);
    A.timers.push(setInterval(()=>musicNote(notes[i++%notes.length],.028,2.2),3000));
    A.timers.push(setInterval(()=>tone(i%2?65.41:55,.32,.010,'sine',A.musicGain,0,-5),1500));
  };

  A.startBoss=()=>{
    if(!ensure()||!A.unlocked||A.mode==='boss')return;
    clearMusic();A.mode='boss';
    drone(48.99,.024,'sawtooth',-7);drone(73.42,.010,'triangle',4);
    let beat=0;
    const pulse=()=>{
      tone(beat%4===3?61.74:49,.20,beat%4===0?.036:.022,'sine',A.musicGain,0,-12);
      if(beat%4===2)noise(.09,.012,360);
      beat++;
    };
    pulse();A.timers.push(setInterval(pulse,620));
    const notes=[146.83,138.59,123.47,110];let i=0;
    A.timers.push(setInterval(()=>musicNote(notes[i++%notes.length],.026,1.1,'triangle'),2480));
  };

  A.stopMusic=()=>clearMusic();

  A.sfx=(name,variant='')=>{
    if(!ensure()||!A.unlocked||A.muted)return;
    const now=performance.now(),limits={basic:90,hit:65,enemyDeath:85};
    if(limits[name] && now-(A.lastSfx[name]||0)<limits[name])return;
    A.lastSfx[name]=now;

    switch(name){
      case 'start': tone(196,.18,.045,'sine');tone(293.66,.28,.032,'sine',.0?A.sfxGain:A.sfxGain,.08);break;
      case 'basic':
        tone(variant==='night'?410:520,.055,.018,variant==='night'?'triangle':'sine',A.sfxGain,0,variant==='night'?-90:75);break;
      case 'hit': noise(.045,.025,1500);tone(120,.045,.018,'triangle');break;
      case 'hurt': noise(.10,.055,850);tone(95,.13,.05,'sawtooth',A.sfxGain,0,-35);break;
      case 'enemyDeath': tone(145,.13,.030,'triangle',A.sfxGain,0,-70);noise(.07,.025,700);break;
      case 'special':
        if(variant==='night'){tone(240,.24,.080,'sine',A.sfxGain,0,520);noise(.13,.045,2100,.03)}
        else{tone(330,.30,.080,'sine',A.sfxGain,0,520);tone(660,.34,.038,'sine',A.sfxGain,.05,-180)}
        break;
      case 'chest': tone(392,.16,.045,'sine');tone(523.25,.22,.050,'sine',A.sfxGain,.11);break;
      case 'relic': tone(523.25,.18,.055,'sine');tone(659.25,.22,.048,'sine',A.sfxGain,.09);tone(783.99,.28,.040,'sine',A.sfxGain,.18);break;
      case 'heal': tone(261.63,.18,.040,'sine');tone(392,.30,.035,'sine',A.sfxGain,.08);break;
      case 'portal': tone(130.81,.42,.055,'sine',A.sfxGain,0,130);noise(.20,.022,520);break;
      case 'portalOpen': tone(98,.42,.060,'triangle',A.sfxGain,0,98);tone(196,.46,.035,'sine',A.sfxGain,.08,100);break;
      case 'bossIntro': tone(55,.72,.090,'sawtooth',A.sfxGain,0,-16);noise(.34,.060,430,.08);break;
      case 'bossWarn': tone(174.61,.17,.045,'square',A.sfxGain,0,45);break;
      case 'bossCast': tone(92.5,.23,.060,'sawtooth',A.sfxGain,0,-25);noise(.09,.035,900);break;
      case 'bossDefeat': tone(130.81,.34,.075,'triangle',A.sfxGain,0,-75);tone(65.41,.72,.065,'sine',A.sfxGain,.12,-22);noise(.28,.045,600);break;
      case 'clear': tone(261.63,.28,.050,'sine');tone(329.63,.34,.048,'sine',A.sfxGain,.13);tone(392,.48,.042,'sine',A.sfxGain,.27);break;
      case 'gameOver': tone(196,.35,.050,'triangle',A.sfxGain,0,-70);tone(110,.62,.035,'sine',A.sfxGain,.18,-35);break;
    }
  };

  A.toggle=async()=>{
    await A.unlock();
    A.muted=!A.muted;
    if(A.master)A.master.gain.setTargetAtTime(A.muted?0:.72,A.ctx.currentTime,.025);
    try{localStorage.setItem('playvaultMuted',A.muted?'1':'0')}catch(_){}
    A.updateButton();
  };

  A.updateButton=()=>{
    const b=document.getElementById('soundBtn');if(!b)return;
    b.textContent=A.muted?'🔇':'🔊';
    b.setAttribute('aria-label',A.muted?'소리 켜기':'소리 끄기');
    b.title=A.muted?'소리 켜기':'소리 끄기';
  };

  addEventListener('DOMContentLoaded',()=>{
    A.updateButton();
    const b=document.getElementById('soundBtn');
    b?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();A.toggle()});
  });
})();