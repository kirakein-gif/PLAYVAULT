// All tones are generated locally: no audio files, downloads or external assets.
// The melody is newly composed for this game (see docs/MUSIC.md).
export type Sound = 'move'|'rotate'|'lock'|'clear'|'clear4'|'level'|'end'|'button'|'hold'|'rescue';
const MELODY = [60,64,67,69,67,64,62,60,65,69,72,69,67,65,64,62,60,62,64,67,65,64,62,60];
class AudioEngine {
  private ctx:AudioContext|null=null;
  private timer:ReturnType<typeof setInterval>|null=null;
  private step=0;
  enabled=true;musicEnabled=true;volume=0.35;
  unlock(){
    try{
      if(!this.ctx)this.ctx=new AudioContext({latencyHint:'interactive'});
      if(this.ctx.state==='suspended')void this.ctx.resume();
      this.syncMusic();
    }catch{/* Android devices without audio output simply stay silent. */}
  }
  private tone(freq:number,duration:number,gain:number,kind:OscillatorType='sine'){
    if(!this.ctx||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime, osc=this.ctx.createOscillator(), out=this.ctx.createGain();
    osc.type=kind;osc.frequency.value=freq;
    out.gain.setValueAtTime(0.0001,now);
    out.gain.exponentialRampToValueAtTime(Math.max(0.0002,gain),now+0.012);
    out.gain.exponentialRampToValueAtTime(0.0001,now+duration);
    osc.connect(out).connect(this.ctx.destination);
    osc.start(now);osc.stop(now+duration+0.015);
  }
  play(name:Sound){
    if(!this.enabled||!this.ctx)return;
    const f:Record<Sound,readonly number[]>={
      move:[310],rotate:[410],lock:[170],clear:[540,700],clear4:[520,660,880],
      level:[550,740],end:[330,220],button:[480],hold:[410,350],rescue:[490,590]
    };
    const tones=f[name];
    for(let i=0;i<tones.length;i++)
      setTimeout(()=>this.tone(tones[i],name==='end' ? 0.19 : 0.1,this.volume*(name==='move'?.045:.13),'triangle'),i*65);
  }
  syncMusic(){
    if(this.timer){clearInterval(this.timer);this.timer=null;}
    if(!this.musicEnabled||!this.ctx||this.ctx.state!=='running')return;
    this.timer=setInterval(()=>{
      const midi=MELODY[this.step%MELODY.length];
      this.step++;
      if(this.step%8===0)return; // short, intentional rest
      const hz=440*Math.pow(2,(midi-69)/12);
      this.tone(hz,.35,Math.max(.002,this.volume*.035),'sine');
      this.tone(hz*2,.15,Math.max(.001,this.volume*.01),'triangle');
    },410);
  }
  configure(s:{sfx:boolean;music:boolean;volume:number}){
    this.enabled=s.sfx;this.musicEnabled=s.music;this.volume=s.volume;this.syncMusic();
  }
  suspend(){
    if(this.timer){clearInterval(this.timer);this.timer=null;}
    if(this.ctx?.state==='running')void this.ctx.suspend();
  }
}
export const sound=new AudioEngine();
