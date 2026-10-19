(function(root){
  'use strict';
  const {C}=typeof module==='object'?require('./engine.js'):root.WGG;
  class RoundFlow {
    constructor(match){this.match=match;this.reset(match.time);}
    reset(now){this.until=now+C.countdownMs;this.queued=null;}
    get count(){return this.match.phase==='select'?Math.max(0,Math.ceil((this.until-this.match.time)/1000)):0;}
    choose(hand){
      if(this.match.phase!=='select'||!Number.isInteger(hand)||hand<0||hand>2)return false;
      if(this.count){this.queued=hand;return true;}
      return this.match.choose(hand);
    }
    update(){
      const m=this.match;
      if(m.phase==='resolve'&&m.time-m.resolvedAt>=C.autoNextMs&&m.next())this.reset(m.time);
      if(m.phase==='select'&&!this.count&&this.queued!==null){const hand=this.queued;this.queued=null;m.choose(hand);}
    }
  }
  if(typeof module==='object')module.exports=RoundFlow;
  else root.WGG.RoundFlow=RoundFlow;
})(typeof globalThis!=='undefined'?globalThis:this);
