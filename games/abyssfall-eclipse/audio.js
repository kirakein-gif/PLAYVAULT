(() => {
  'use strict';

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const A = window.PV_AUDIO = {
    ctx:null, master:null, musicGain:null, sfxGain:null,
    unlocked:false, muted:false, mode:null, timers:[], musicNodes:[],
    lastSfx:{},voices:0,noiseBuffers:{},musicSession:0,
    // Optional original/licensed loop files. Procedural ambience remains the fallback.
    tracks:{title:null,explore:null,boss:null},trackBuffers:{}
  };

  try { A.muted = localStorage.getItem('playvaultMuted') === '1'; } catch (_) {}

  function ensure(){
    if(A.ctx || !AudioCtx) return !!A.ctx;
    const ctx=A.ctx=new AudioCtx();
    A.master=ctx.createGain();A.musicGain=ctx.createGain();A.sfxGain=ctx.createGain();
    A.musicGain.gain.value=.36;A.sfxGain.gain.value=.68;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;
    const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=18;compressor.ratio.value=3;
    A.musicGain.connect(filter);filter.connect(A.master);A.sfxGain.connect(A.master);A.master.connect(compressor);compressor.connect(ctx.destination);
    // A quiet stereo hall return; SFX warnings retain a clear dry attack.
    const reverb=ctx.createConvolver(),wet=ctx.createGain(),ir=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.8),ctx.sampleRate);
    for(let c=0;c<2;c++){const data=ir.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3)*.18}
    reverb.buffer=ir;wet.gain.value=.20;filter.connect(reverb);reverb.connect(wet);wet.connect(A.master);
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

  function drone(freq,vol,type='sine',detune=0){
    const o=A.ctx.createOscillator(),g=A.ctx.createGain();
    o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.value=vol;
    o.connect(g);g.connect(A.musicBus||A.musicGain);o.start();A.musicNodes.push(o,g);
  }

  function musicNote(freq,vol=.080,dur=1.7,type='sine'){
    if(!A.ctx||A.muted)return;
    tone(freq,dur,vol,type,A.musicBus||A.musicGain,0);
    tone(freq*2,Math.min(.9,dur*.55),vol*.22,'sine',A.musicBus||A.musicGain,.04);
  }

  A.unlock=async()=>{
    if(!ensure())return false;
    try{if(A.ctx.state!=='running')await A.ctx.resume();A.unlocked=A.ctx.state==='running';A.updateButton();return A.unlocked}catch(_){return false}
  };

  function beginMode(mode){
    clearMusic();A.mode=mode;
    const t=A.ctx.currentTime,bus=A.musicBus=A.ctx.createGain();bus.gain.value=0;bus.gain.setTargetAtTime(1,t,.35);bus.connect(A.musicGain);A.musicNodes.push(bus);
    const url=A.tracks[mode],session=A.musicSession;
    if(!url)return;
    (async()=>{
      try{
        let buffer=A.trackBuffers[url];
        if(!buffer){const res=await fetch(url);if(!res.ok)throw new Error('audio '+res.status);buffer=await A.ctx.decodeAudioData(await res.arrayBuffer());A.trackBuffers[url]=buffer}
        if(session!==A.musicSession)return;
        // Replace fallback only once a complete buffer is ready. Stale loads cannot restart old music.
        A.timers.forEach(clearInterval);A.timers.length=0;
        A.musicNodes.filter(n=>n!==bus).forEach(n=>{try{n.stop?.()}catch(_){}try{n.disconnect?.()}catch(_){}});A.musicNodes=[bus];
        const src=A.ctx.createBufferSource();src.buffer=buffer;src.loop=true;src.connect(bus);src.start();A.musicNodes.push(src);
      }catch(err){console.warn('[PLAYVAULT] music fallback:',err.message)}
    })();
  }
  A.startTitle=()=>{
    if(!ensure()||!A.unlocked||A.mode==='title')return;
    beginMode('title');drone(110,.025);drone(220,.010,'sine',3);
    let i=0;const notes=[220,293.66,246.94,196];musicNote(notes[i++],.055,3.4);
    A.timers.push(setInterval(()=>musicNote(notes[i++%4],.050,3.4),6200));
  };

  A.startExplore=()=>{
    if(!ensure())return;
    if(A.ctx.state==='suspended'){A.ctx.resume().then(()=>{A.unlocked=true;A.startExplore()}).catch(()=>{});return}
    A.unlocked=true;if(A.mode==='explore')return;
    beginMode('explore');
    // Phone-friendly register: the first version was too low to reproduce on mobile speakers.
    drone(110,.050,'sine',-5);drone(164.81,.028,'triangle',4);drone(220,.012,'sine',1);
    const notes=[329.63,392,440,293.66,261.63,293.66,329.63,246.94];
    let i=0;
    musicNote(notes[i++%notes.length],.060,3.8);
    A.timers.push(setInterval(()=>musicNote(notes[i++%notes.length],.045,3.8),6400));
    A.timers.push(setInterval(()=>tone(659.25,2.8,.015,'sine',A.musicBus||A.musicGain),17100));
  };

  A.startBoss=()=>{
    if(!ensure())return;
    if(A.ctx.state==='suspended'){A.ctx.resume().then(()=>{A.unlocked=true;A.startBoss()}).catch(()=>{});return}
    A.unlocked=true;if(A.mode==='boss')return;
    beginMode('boss');
    drone(98,.050,'triangle',-7);drone(146.83,.032,'triangle',4);
    let beat=0;
    const pulse=()=>{
      tone(beat%4===3?146.83:110,.32,beat%4===0?.075:.040,'sine',A.musicBus||A.musicGain,0,-18);
      beat++;
    };
    pulse();A.timers.push(setInterval(pulse,620));
    const notes=[220,207.65,196,174.61];let i=0;
    A.timers.push(setInterval(()=>musicNote(notes[i++%notes.length],.070,1.15,'triangle'),2480));
  };

  A.stopMusic=()=>clearMusic();

  A.sfx=(name,variant='')=>{
    if(!ensure()||!A.unlocked||A.muted)return;
    const now=performance.now(),limits={basic:140,hit:100,enemyDeath:120};
    if(limits[name] && now-(A.lastSfx[name]||0)<limits[name])return;
    A.lastSfx[name]=now;
    if(['bossWarn','bossIntro','special','hurt','gateOpen'].includes(name)){
      const t=A.ctx.currentTime,g=A.musicGain.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.17,t,.025);g.setTargetAtTime(.36,t+.5,.20);
    }

    switch(name){
      case 'start': tone(196,.18,.045,'sine');tone(293.66,.28,.032,'sine',A.sfxGain,.08);break;
      case 'basic':
        tone(variant==='night'?410:520,.060,.032,variant==='night'?'triangle':'sine',A.sfxGain,0,variant==='night'?-90:75);break;
      case 'hit': noise(.05,.040,1600);tone(180,.055,.030,'triangle');break;
      case 'hurt': noise(.11,.090,1100);tone(140,.15,.085,'sawtooth',A.sfxGain,0,-35);break;
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
        tone(92,.12,.130,'square',A.sfxGain,0,-18);noise(.11,.090,520);break;
      case 'gateOpen':
        tone(82.41,.52,.150,'sawtooth',A.sfxGain,0,-28);noise(.62,.125,420,.04);
        tone(61.74,.78,.105,'triangle',A.sfxGain,.12,-14);noise(.35,.080,720,.32);break;
      case 'stairsOpen':
        tone(110,.38,.105,'triangle',A.sfxGain,0,-32);noise(.45,.100,560,.02);
        tone(73.42,.55,.080,'sine',A.sfxGain,.12,-18);break;
      case 'stairsDown':
        noise(.08,.055,900,0);tone(180,.07,.045,'triangle',A.sfxGain,0,-35);
        noise(.08,.052,820,.13);tone(165,.07,.043,'triangle',A.sfxGain,.13,-35);
        noise(.08,.048,760,.27);tone(150,.07,.040,'triangle',A.sfxGain,.27,-32);
        noise(.08,.045,700,.42);tone(136,.08,.038,'triangle',A.sfxGain,.42,-28);
        noise(.10,.040,620,.58);tone(122,.10,.035,'triangle',A.sfxGain,.58,-22);break;
      case 'bossIntro': tone(110,.72,.145,'sawtooth',A.sfxGain,0,-16);noise(.34,.100,700,.08);break;
      case 'bossWarn': tone(261.63,.17,.085,'square',A.sfxGain,0,45);break;
      case 'bossCast': tone(146.83,.23,.110,'sawtooth',A.sfxGain,0,-25);noise(.10,.060,1200);break;
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
