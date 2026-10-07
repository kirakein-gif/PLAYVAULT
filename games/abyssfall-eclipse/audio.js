(() => {
  'use strict';

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const A = window.PV_AUDIO = {
    ctx:null, master:null, musicGain:null, sfxGain:null,
    unlocked:false, muted:false, mode:null, timers:[], musicNodes:[],
    lastSfx:{},voices:0,noiseBuffers:{},musicSession:0,
    // Sparse high bells only. File failure leaves music silent; never install a drone.
    tracks:{title:'../../assets/audio/title-sparse.wav',explore:'../../assets/audio/explore-sparse.wav',boss:'../../assets/audio/boss-sparse.wav'},trackBuffers:{},trackLoads:{}
  };

  try { A.muted = localStorage.getItem('playvaultMuted') === '1'; } catch (_) {}

  function ensure(){
    if(A.ctx || !AudioCtx) return !!A.ctx;
    const ctx=A.ctx=new AudioCtx({latencyHint:'playback'});
    A.master=ctx.createGain();A.musicGain=ctx.createGain();A.sfxGain=ctx.createGain();
    A.musicGain.gain.value=.25;A.sfxGain.gain.value=.55;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;
    const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=18;compressor.ratio.value=3;
    A.musicGain.connect(filter);filter.connect(A.master);A.sfxGain.connect(A.master);A.master.connect(compressor);compressor.connect(ctx.destination);
    // Hall tails are rendered into the file; no expensive live convolution.
    A.master.gain.value=A.muted?0:.92;
    return true;
  }

  function clearMusic(){
    A.musicSession++;
    A.timers.forEach(clearInterval);A.timers.length=0;
    const old=A.musicNodes.slice(),bus=A.musicBus;
    if(bus&&A.ctx){const t=A.ctx.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(0,t,.12)}
    setTimeout(()=>old.forEach(n=>{try{n.stop?.()}catch(_){}try{n.disconnect?.()}catch(_){}}),550);
    A.musicNodes.length=0;A.mode=null;
    A.musicBus=null;
  }

  function tone(freq,dur=.18,vol=.12,type='sine',dest=A.sfxGain,when=0,slide=0){
    if(!A.ctx||A.muted||A.voices>=40)return;
    A.voices++;
    const t=A.ctx.currentTime+when,o=A.ctx.createOscillator(),g=A.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(dest);o.onended=()=>{o.disconnect();g.disconnect();A.voices--};o.start(t);o.stop(t+dur+.03);
  }

  function noise(dur=.12,vol=.05,cutoff=1200,when=0){
    if(!A.ctx||A.muted)return;
    if(A.voices>=40)return;A.voices++;
    const len=Math.max(1,Math.floor(A.ctx.sampleRate*dur));
    let buf=A.noiseBuffers[len];
    if(!buf){buf=A.ctx.createBuffer(1,len,A.ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);A.noiseBuffers[len]=buf}
    const src=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=A.ctx.createGain(),t=A.ctx.currentTime+when;
    src.buffer=buf;f.type='lowpass';f.frequency.value=cutoff;g.gain.value=vol;
    src.connect(f);f.connect(g);g.connect(A.sfxGain);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();A.voices--};src.start(t);
  }

  A.unlock=async()=>{
    if(!ensure())return false;
    try{if(A.ctx.state!=='running')await A.ctx.resume();A.unlocked=A.ctx.state==='running';A.updateButton();return A.unlocked}catch(_){return false}
  };

  function beginMode(mode){
    clearMusic();A.mode=mode;
    const bus=A.musicBus=A.ctx.createGain();bus.gain.value=0;bus.connect(A.musicGain);A.musicNodes.push(bus);
    const url=A.tracks[mode],session=A.musicSession;
    (async()=>{
      try{
        let buffer=A.trackBuffers[url];
        if(!buffer){
          if(!url)throw new Error('missing track');
          if(!A.trackLoads[url])A.trackLoads[url]=(async()=>{const res=await fetch(url);if(!res.ok)throw new Error('audio '+res.status);return A.ctx.decodeAudioData(await res.arrayBuffer())})();
          try{buffer=await A.trackLoads[url];A.trackBuffers[url]=buffer}finally{delete A.trackLoads[url]}
        }
        if(session!==A.musicSession)return;
        const src=A.ctx.createBufferSource();src.buffer=buffer;src.loop=true;src.connect(bus);src.start();A.musicNodes.push(src);
        bus.gain.setTargetAtTime(1,A.ctx.currentTime,.7);
      }catch(err){
        if(session!==A.musicSession)return;
        console.warn('[PLAYVAULT] music unavailable; background remains silent:',err.message);
      }
    })();
  }
  A.startTitle=()=>{
    if(!ensure()||!A.unlocked||A.mode==='title')return;
    beginMode('title');
  };

  A.startExplore=()=>{
    if(!ensure())return;
    if(A.ctx.state==='suspended'){A.ctx.resume().then(()=>{A.unlocked=true;A.startExplore()}).catch(()=>{});return}
    A.unlocked=true;if(A.mode==='explore')return;
    beginMode('explore');
  };

  A.startBoss=()=>{
    if(!ensure())return;
    if(A.ctx.state==='suspended'){A.ctx.resume().then(()=>{A.unlocked=true;A.startBoss()}).catch(()=>{});return}
    A.unlocked=true;if(A.mode==='boss')return;
    beginMode('boss');
  };

  A.stopMusic=()=>clearMusic();

  A.sfx=(name,variant='')=>{
    if(!ensure()||!A.unlocked||A.muted)return;
    const now=performance.now(),limits={basic:140,hit:100,enemyDeath:120};
    if(limits[name] && now-(A.lastSfx[name]||0)<limits[name])return;
    A.lastSfx[name]=now;
    if(['basic','hit','enemyDeath'].includes(name)&&A.voices>=24)return;
    if(['bossWarn','bossIntro','special','hurt','gateOpen'].includes(name)){
      const t=A.ctx.currentTime,g=A.musicGain.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.20,t,.12);g.setTargetAtTime(.25,t+.7,.35);
    }

    switch(name){
      case 'start': tone(196,.18,.045,'sine');tone(293.66,.28,.032,'sine',A.sfxGain,.08);break;
      case 'basic':
        tone(variant==='night'?410:520,.060,.032,variant==='night'?'triangle':'sine',A.sfxGain,0,variant==='night'?-90:75);break;
      case 'hit': noise(.05,.040,1600);tone(180,.055,.030,'triangle');break;
      case 'hurt': noise(.11,.050,900);tone(140,.15,.050,'triangle',A.sfxGain,0,-35);break;
      case 'enemyDeath': tone(196,.15,.055,'triangle',A.sfxGain,0,-70);noise(.07,.025,700);break;
      case 'special':
        if(variant==='night'){tone(280,.25,.135,'sine',A.sfxGain,0,520);noise(.14,.075,2300,.03)}
        else{tone(392,.31,.135,'sine',A.sfxGain,0,520);tone(784,.35,.070,'sine',A.sfxGain,.05,-180)}
        break;
      case 'chest': tone(392,.18,.085,'sine');tone(523.25,.24,.095,'sine',A.sfxGain,.11);break;
      case 'relic': tone(523.25,.20,.105,'sine');tone(659.25,.24,.095,'sine',A.sfxGain,.09);tone(783.99,.30,.080,'sine',A.sfxGain,.18);break;
      case 'heal': tone(329.63,.20,.080,'sine');tone(440,.30,.070,'sine',A.sfxGain,.08);break;
      case 'portal': tone(196,.42,.105,'sine',A.sfxGain,0,130);noise(.20,.022,520);break;
      case 'portalOpen': tone(164.81,.42,.115,'triangle',A.sfxGain,0,98);tone(329.63,.46,.080,'sine',A.sfxGain,.08,100);break;
      case 'sealBreak':
        tone(293.66,.22,.090,'triangle',A.sfxGain,0,-90);tone(146.83,.34,.075,'sine',A.sfxGain,.05,-42);noise(.16,.055,950,.03);break;
      case 'gateLocked':
        tone(92,.18,.060,'triangle',A.sfxGain,0,-18);noise(.11,.040,520);break;
      case 'gateOpen':
        tone(82.41,.52,.065,'triangle',A.sfxGain,0,-28);noise(.62,.060,420,.04);
        tone(61.74,.78,.045,'sine',A.sfxGain,.12,-14);noise(.35,.035,720,.32);break;
      case 'stairsOpen':
        tone(110,.38,.105,'triangle',A.sfxGain,0,-32);noise(.45,.100,560,.02);
        tone(73.42,.55,.080,'sine',A.sfxGain,.12,-18);break;
      case 'stairsDown':
        noise(.08,.055,900,0);tone(180,.07,.045,'triangle',A.sfxGain,0,-35);
        noise(.08,.052,820,.13);tone(165,.07,.043,'triangle',A.sfxGain,.13,-35);
        noise(.08,.048,760,.27);tone(150,.07,.040,'triangle',A.sfxGain,.27,-32);
        noise(.08,.045,700,.42);tone(136,.08,.038,'triangle',A.sfxGain,.42,-28);
        noise(.10,.040,620,.58);tone(122,.10,.035,'triangle',A.sfxGain,.58,-22);break;
      case 'bossIntro': tone(110,.72,.065,'triangle',A.sfxGain,0,-16);noise(.34,.040,700,.08);break;
      case 'bossWarn': tone(261.63,.24,.045,'sine',A.sfxGain,0,45);break;
      case 'bossCast': tone(146.83,.23,.065,'triangle',A.sfxGain,0,-25);noise(.10,.040,1000);break;
      case 'bossDefeat': tone(196,.34,.125,'triangle',A.sfxGain,0,-75);tone(98,.72,.110,'sine',A.sfxGain,.12,-22);noise(.28,.045,600);break;
      case 'clear': tone(261.63,.28,.050,'sine');tone(329.63,.34,.048,'sine',A.sfxGain,.13);tone(392,.48,.042,'sine',A.sfxGain,.27);break;
      case 'gameOver': tone(196,.35,.050,'triangle',A.sfxGain,0,-70);tone(110,.62,.035,'sine',A.sfxGain,.18,-35);break;
    }
  };

  A.toggle=async()=>{
    await A.unlock();
    A.muted=!A.muted;
    if(A.master)A.master.gain.setTargetAtTime(A.muted?0:.92,A.ctx.currentTime,.025);
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
  // Resume on the next real interaction after Android backgrounding/interruption.
  addEventListener('pointerdown',()=>{if(A.unlocked&&A.ctx?.state!=='running')A.unlock()},{passive:true});
  addEventListener('keydown',()=>{if(A.unlocked&&A.ctx?.state!=='running')A.unlock()});
})();
