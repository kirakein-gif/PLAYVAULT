(() => {
  'use strict';
  class Sound {
    constructor(){this.context=null;this.muted=false;this.voices=new Set();}
    unlock(){
      try{
        if(!this.context){this.context=new AudioContext();this.bus=this.context.createGain();this.bus.gain.value=this.muted?0:.65;this.bus.connect(this.context.destination);}
        if(this.context.state==='suspended')this.context.resume().catch(()=>{});
      }catch(_){/* Audio unavailable: play stays functional. */}
    }
    mute(value){this.muted=value;if(this.bus)this.bus.gain.setValueAtTime(value?0:.65,this.context.currentTime);}
    tone(freq,duration,type='sine',volume=.09,delay=0,end=freq){
      if(!this.context||this.muted||this.voices.size>=12)return;
      const o=this.context.createOscillator(),g=this.context.createGain(),at=this.context.currentTime+delay;
      o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration);
      g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.005);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
      o.connect(g).connect(this.bus);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(at);o.stop(at+duration+.02);
    }
    play(name){
      if(name==='hit'||name==='hurt'){this.tone(420,.13,'triangle',.2,0,95);this.tone(115,.18,'sine',.18,.025,55);}
      else if(name==='block'||name==='guarded'){for(const [f,v]of [[780,.13],[1240,.07],[1830,.025]])this.tone(f,.38,'sine',v,0,f*.94);}
      else if(name==='foul'){this.tone(1750,.11,'sine',.08);this.tone(1900,.16,'sine',.07,.15);}
      else if(name==='miss')this.tone(350,.15,'triangle',.035,0,80);
      else if(name==='grab')this.tone(180,.045,'triangle',.04,0,120);
      else if(name==='equip')this.tone(620,.09,'sine',.045,0,460);
      else if(name==='cue'){this.tone(392,.1,'triangle',.045);this.tone(588,.14,'triangle',.04,.12);}
    }
  }
  WGG.Sound=Sound;
})();
