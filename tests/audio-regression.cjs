const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const deferred=[],intervals=new Set(),nodes=[];
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
function node(){const n={gain:param(),frequency:param(),detune:param(),threshold:param(),knee:param(),ratio:param(),connect(){},disconnect(){this.disconnected=true},start(){this.started=true},stop(){this.stopped=true}};nodes.push(n);return n}
class Context{
 constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=22050;this.destination=node()}
 async resume(){this.state='running'}
 createGain(){return node()}createOscillator(){return node()}createBufferSource(){return node()}createBiquadFilter(){return node()}createDynamicsCompressor(){return node()}createConvolver(){return node()}
 createBuffer(c,l){return {getChannelData:()=>new Float32Array(l)}}
 async decodeAudioData(){return {duration:32}}
}
const env={console,AudioContext:Context,performance:{now:()=>10000},localStorage:{getItem(){return null},setItem(){}},document:{getElementById(){return null}},addEventListener(){},setInterval(fn){const id={fn};intervals.add(id);return id},clearInterval(id){intervals.delete(id)},setTimeout(fn){deferred.push(fn)},fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)})};env.window=env;vm.createContext(env);
vm.runInContext(fs.readFileSync(__dirname+'/../games/abyssfall-eclipse/audio.js','utf8'),env);
(async()=>{
 const a=env.PV_AUDIO;assert.equal(await a.unlock(),true);a.startExplore();
 assert.equal(a.musicNodes.filter(n=>n.started).length,0,'no fallback while track is loading');a.startBoss();
 for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(a.mode,'boss');assert.equal(intervals.size,0,'file loop replaces fallback timers');
 assert.equal(a.musicNodes.filter(n=>n.buffer).length,1,'only current mode can install its loop');
 a.stopMusic();deferred.splice(0).forEach(fn=>fn());assert.equal(a.mode,null);assert.equal(intervals.size,0);
 let resolveLoad;env.fetch=()=>new Promise(resolve=>resolveLoad=resolve);a.trackBuffers={};a.startExplore();a.stopMusic();
 resolveLoad({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(a.mode,null);assert.equal(a.musicNodes.length,0,'late load cannot restart stopped music');
 env.fetch=async()=>({ok:false,status:404});a.startTitle();for(let i=0;i<12;i++)await Promise.resolve();
 const fallback=a.musicNodes.filter(n=>n.started);assert.equal(fallback.length,2,'failed file installs just two quiet aligned tones');
 assert.equal(fallback[1].frequency.value,fallback[0].frequency.value*2);assert.equal(intervals.size,0,'fallback has no pulse timers');
 a.stopMusic();deferred.splice(0).forEach(fn=>fn());assert.ok(fallback.every(n=>n.stopped),'fallback tones stop on exit');
 a.ctx.state='interrupted';assert.equal(await a.unlock(),true,'Android interruption resumes');
 await a.toggle();assert.equal(a.muted,true);await a.toggle();assert.equal(a.muted,false);
 for(let i=0;i<30;i++)a.sfx('special',i%2?'night':'dawn');assert.equal(a.voices,40);a.sfx('bossWarn');assert.equal(a.voices,40);
 nodes.forEach(n=>n.onended?.());assert.equal(a.voices,0);
 console.log('PASS audio: resume, latest-mode file loading, no loading overlap, stopped-load guard, quiet failure fallback, mute persistence, bounded voices');
})().catch(err=>{console.error(err);process.exitCode=1});
