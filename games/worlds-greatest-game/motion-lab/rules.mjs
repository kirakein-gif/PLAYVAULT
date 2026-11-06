import { C } from './config.mjs';
import { V, clamp } from './kinematics.mjs';
export const outcome=(a,b)=>a===b?'tie':(a+2)%3===b?'win':'lose';
export function segmentDistance(a,b,p) {
  const d=b.clone().sub(a),l=d.lengthSq();
  const t=l?clamp(p.clone().sub(a).dot(d)/l,0,1):0;
  return a.clone().addScaledVector(d,t).distanceTo(p);
}
export class Strike {
  constructor() {this.spent=false;this.travel=0;}
  step(previous,current,dt,crown) {
    if(this.spent||dt<=0) return false;
    const delta=current.clone().sub(previous);this.travel+=delta.length();
    // A crown is a small 3D sphere; the face is below it and never a hit target.
    if(this.travel<C.swing.minTravel || delta.length()/dt<C.swing.minSpeed || delta.y/dt>-C.swing.minDown) return false;
    if(delta.dot(crown.clone().sub(previous))<=0) return false;
    if(segmentDistance(previous,current,crown)>C.swing.radius+.075) return false;
    this.spent=true;return true;
  }
}
export class Equip {
  constructor(){this.reset();}
  reset(){this.since=null;this.ready=false;}
  step(center,normal,crown,now) {
    const aligned=center.distanceTo(crown)<=C.equip.radius && normal.dot(new V(0,1,0))>=Math.cos(C.equip.maxTilt*Math.PI/180);
    if(!aligned){this.reset();return false;}
    this.since??=now;this.ready=now-this.since>=C.equip.seconds-1e-9;
    return this.ready;
  }
}
export class Match {
  constructor(random=Math.random){this.random=random;this.round=0;this.phase='idle';this.selection=null;this.held=null;this.result=null;this.equip=new Equip();}
  start(now){this.round++;this.phase='count';this.at=now;this.beat=C.timing.pump;this.zeroAt=now+this.beat*2;this.selection=null;this.rule=null;this.reason='';this.reactAt=null;this.resolvedAt=null;this.enemy=Math.floor(this.random()*3);this.result=null;this.held=null;this.equip.reset();}
  choose(hand,now){
    this.tick(now);
    if(!Number.isInteger(hand)||hand<0||hand>2)return false;
    if(this.phase==='count'&&now<this.zeroAt){this.selection=hand;return true;}
    if(this.phase==='reveal'||this.phase==='react')this.resolve('foul',now,'늦은 손');
    return false;
  }
  tick(now) {
    if(this.phase==='count'&&now>=this.zeroAt){
      if(this.selection===null){this.resolve('foul',this.zeroAt,'늦은 손');return;}
      this.phase='reveal';this.rule=outcome(this.selection,this.enemy);
    }
    if(this.phase==='reveal'&&now>=this.zeroAt+C.timing.reveal){this.phase='react';this.reactAt=this.zeroAt+C.timing.reveal;}
    if(this.phase==='react') {
      const age=now-this.reactAt;
      if(this.rule==='tie'&&age>=.5)this.resolve('tie',now);
      if(age>=C.timing.reactionEnd)this.resolve('miss',now);
    }
  }
  grab(kind,now) {
    if(this.phase==='result'||this.phase==='idle'||this.held)return false;
    if(this.phase!=='react'||this.rule==='tie'||kind!==(this.rule==='win'?'hammer':'pot')){this.resolve('foul',now,this.phase!=='react'?'조기 출발':this.rule==='tie'?'무승부 중 도구':'잘못된 도구');return false;}
    this.held=kind;this.grabAt=now;this.strike=new Strike();return true;
  }
  resolve(result,now,reason=''){if(this.phase==='result')return false;this.result=result;this.reason=reason;this.phase='result';this.resolvedAt=now;this.held=null;return true;}
  release(cancel=false){if(!cancel&&this.held==='hammer')this.resolve('miss',this.now||0);this.held=null;this.equip.reset();}
}
