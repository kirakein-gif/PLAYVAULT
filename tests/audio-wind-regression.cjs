const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let sources=0,stops=0,buffers=0;
const param=()=>({value:0,setTargetAtTime(){},cancelScheduledValues(){}});
const node=()=>({gain:param(),frequency:param(),threshold:param(),knee:param(),ratio:param(),connect(){},disconnect(){}});
class AudioContext{
 constructor(){this.state='running';this.currentTime=1;this.sampleRate=1000;this.destination=node()}
 createGain(){return node()}createBiquadFilter(){return node()}createDynamicsCompressor(){return node()}
 createBuffer(ch,n){buffers++;return {getChannelData(){return new Float32Array(n)}}}
 createBufferSource(){sources++;return {...node(),start(){},stop(){stops++;this.onended?.()}}}
}
const env={console,AudioContext,performance:{now:()=>10000},localStorage:{getItem(){return null}},document:{getElementById(){return null}},addEventListener(){},setTimeout(){},clearInterval(){}};env.window=env;
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../games/abyssfall-eclipse/audio.js'),'utf8'),env);
const a=env.PV_AUDIO;a.ctx=new AudioContext();a.sfxGain=node();a.unlocked=true;
for(let i=0;i<500;i++)a.setWind(1.8);
assert.equal(sources,1,'one loop throughout the gust');assert.equal(buffers,1,'noise generated once');
a.setWind(0);a.setWind(0);assert.equal(stops,1,'single fade and cleanup when wind ends');assert.equal(a.wind,null);
a.muted=true;a.setWind(1);assert.equal(sources,1,'muted wind never starts');a.muted=false;a.setWind(1);
assert.equal(sources,2);assert.equal(buffers,1,'next gust reuses the buffer');
a.ctx.state='suspended';a.setWind(1);assert.equal(stops,2,'suspended audio releases gust');
console.log('PASS wind audio: one continuous loop, cached noise, mute/suspend guards and gust cleanup');
