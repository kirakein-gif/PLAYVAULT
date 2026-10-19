(function (root) {
  'use strict';
  const C = typeof module === 'object' ? require('./config.js') : root.WGG_CONFIG;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const outcome = (a, b) => a === b ? 'tie' : (a + 2) % 3 === b ? 'win' : 'lose';
  function segmentCircle(a,b,c,r) {
    const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
    const p=len?clamp(((c.x-a.x)*dx+(c.y-a.y)*dy)/len,0,1):0;
    return Math.hypot(a.x+p*dx-c.x,a.y+p*dy-c.y)<=r;
  }
  function reach(p,shoulder=C.shoulder,a=C.upperArm,b=C.forearm) {
    const d=dist(p,shoulder), bounded=clamp(d,Math.abs(a-b)+1,a+b-2);
    if(d===bounded)return {...p};
    const angle=d?Math.atan2(p.y-shoulder.y,p.x-shoulder.x):Math.PI/2;
    return {x:shoulder.x+Math.cos(angle)*bounded,y:shoulder.y+Math.sin(angle)*bounded};
  }
  function ik(shoulder,wrist,a=C.upperArm,b=C.forearm,bend=1) {
    const d=clamp(dist(shoulder,wrist),Math.abs(a-b)+.01,a+b-.01);
    const theta=Math.atan2(wrist.y-shoulder.y,wrist.x-shoulder.x);
    const angle=theta+bend*Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
    return {x:shoulder.x+Math.cos(angle)*a,y:shoulder.y+Math.sin(angle)*a};
  }
  // Projected shoulder travel represents leaning/raising the near shoulder.
  // RPS has its own foreshortened authored pose; reach never stretches a bone.
  function playerRig(target,kind){
    const s={...C.shoulder};
    if(kind==='pot'){
      const depth=clamp(dist(s,target)/(C.potUpperArm+C.potForearm)*1.3,.4,1);
      return {shoulder:s,a:C.potUpperArm*depth,b:C.potForearm*depth};
    }else{
      s.x-=clamp((s.x-target.x)*.35,0,135);
      s.y-=clamp((s.y-target.y)*.16,0,35);
    }
    const depth=clamp(dist(s,target)/(C.upperArm+C.forearm)*1.35,.48,1);
    return {shoulder:s,a:C.upperArm*depth,b:C.forearm*depth};
  }
  function potFrame(tool){
    const crown=C.playerHead.y-C.playerHead.r+7;
    const depth=clamp((C.potHome.y-tool.y)/(C.potHome.y-crown),0,1);
    const offset=C.potOffset+(C.potWearOffset-C.potOffset)*depth;
    return {offset,scale:offset/C.potOffset};
  }
  class Match {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset() {
      this.phase = 'select'; this.time = 0; this.round = 1;
      this.player = null; this.enemy = null; this.result = null;
      this.score = { player: 0, enemy: 0 }; this.events = [];
      this.clearTools();
    }
    clearTools() {
      this.held = null; this.pointerId = null; this.equipped = false;
      this.tool = null; this.trace = []; this.pathLength = 0;
      this.alignSince = null; this.readyAt = null;
    }
    choose(hand) {
      if (this.phase !== 'select' || !Number.isInteger(hand) || hand < 0 || hand > 2) return false;
      this.player = hand; this.enemy = Math.floor(this.random() * 3);
      this.rule = outcome(this.player, this.enemy);
      // Full hand silhouettes and input become live in the same update.
      this.phase = 'react'; this.phaseAt = this.time; this.reactAt = this.time; this.events.push('cue');
      return true;
    }
    tick(now) {
      this.time = Math.max(this.time, now);
      if(this.phase==='react'&&this.held==='pot')this.updateEquip();
      if(this.phase==='react'){
        const elapsed=this.time-this.reactAt;
        if(this.rule==='tie'&&elapsed>=C.tieMs)this.resolve('tie');
        else if(this.rule==='lose'&&elapsed>=C.enemyStrikeMs){
          this.contact={...C.playerHead};
          this.resolve(this.equipped&&this.readyAt<=this.reactAt+C.enemyStrikeMs?'block':'hurt');
        }else if(elapsed>=C.reactMs)this.resolve('miss');
      }
      if(this.phase==='resolve'&&this.time-this.resolvedAt>=C.recoverMs&&
        (this.score.player>=C.targetScore||this.score.enemy>=C.targetScore))this.phase='end';
    }
    tip(tool=this.tool) {
      if(!tool)return null;
      return this.held==='pot'?{x:tool.x-potFrame(tool).offset,y:tool.y}:
        {x:tool.x+Math.cos(tool.angle)*C.hammerLength,y:tool.y+Math.sin(tool.angle)*C.hammerLength};
    }
    grab(p,id,now) {
      this.tick(now);
      if(this.held||this.phase==='resolve'||this.phase==='end')return false;
      const kind=dist(p,C.hammerHome)<=C.grabRadius?'hammer':dist(p,C.potHome)<=C.grabRadius?'pot':null;
      if(!kind)return false;
      if(this.phase!=='react'){this.resolve('foul','조기 출발');return false;}
      if(this.rule==='tie'||(this.rule==='win'&&kind!=='hammer')||(this.rule==='lose'&&kind!=='pot')){
        this.resolve('foul',this.rule==='tie'?'무승부 중 도구 사용':'잘못된 도구');return false;
      }
      this.held=kind;this.pointerId=id;
      const home=kind==='hammer'?C.hammerHome:C.potHome;
      this.tool={...home,angle:kind==='hammer'?C.hammerHomeAngle:-Math.PI/2};this.lastMove=this.time;this.pathLength=0;
      this.offset={x:home.x-p.x,y:home.y-p.y};
      this.trace=[{...this.tip(),t:now}];this.events.push('grab');return true;
    }
    move(p,id,now) {
      this.tick(now);
      now=this.time;
      if(!this.held||id!==this.pointerId||this.phase!=='react')return false;
      const previous=this.tip(), old=this.tool, dt=Math.max(1,now-this.lastMove);
      const requested={x:p.x+this.offset.x,y:p.y+this.offset.y};
      const rig=playerRig(requested,this.held);
      const wrist=reach(requested,rig.shoulder,rig.a,rig.b);
      const vx=(wrist.x-old.x)/dt*1000;
      const target=-Math.PI/2+clamp(vx/1800,-.8,.8);
      const angle=this.held==='hammer'?old.angle+(target-old.angle)*Math.min(1,dt/65):0;
      this.tool={...wrist,angle};this.lastMove=now;
      const tip=this.tip(), length=dist(previous,tip);
      this.pathLength+=length;this.trace.push({...tip,t:now});
      this.trace=this.trace.filter(p=>now-p.t<160).slice(-24);
      if(this.held==='pot')this.updateEquip();
      else if(this.pathLength>=C.swingMinLength&&length/dt*1000>=C.swingMinSpeed&&
        (tip.x-previous.x)*(C.enemyHead.x-previous.x)+(tip.y-previous.y)*(C.enemyHead.y-previous.y)>0&&
        segmentCircle(previous,tip,C.enemyHead,C.enemyHead.r+C.hammerRadius)) {
        this.contact={...C.enemyHead};this.resolve(this.time-this.reactAt>=C.enemyGuardMs?'guarded':'hit');
      }
      return true;
    }
    updateEquip() {
      const center=this.tip(),target={x:C.playerHead.x,y:C.playerHead.y-C.playerHead.r+7};
      if(dist(center,target)<=C.equipRadius){
        if(this.alignSince===null)this.alignSince=this.time;
        if(!this.equipped&&this.time-this.alignSince>=C.equipMs){
          this.equipped=true;this.readyAt=this.time;this.snapFrom={...this.tool};this.events.push('equip');
        }
      }else{this.alignSince=null;this.equipped=false;this.readyAt=null;}
    }
    release(id,cancel=false) {
      if(id!==this.pointerId)return false;
      if(this.held==='hammer'&&!cancel&&this.phase==='react'){this.resolve('miss');return true;}
      this.clearTools();return true;
    }
    resolve(result,reason='') {
      if(this.phase==='resolve'||this.phase==='end')return;
      if(this.phase!=='react'&&result!=='foul')return;
      this.result=result;this.phase='resolve';this.resolvedAt=this.time;
      this.reason=reason;
      if(result==='hit')this.score.player++;
      if(result==='hurt'||result==='foul')this.score.enemy++;
      this.frozenTool=this.tool?{...this.tool,kind:this.held}:null;
      this.held=null;this.pointerId=null;this.events.push(result);
    }
    next() {
      if(this.phase!=='resolve'||this.time-this.resolvedAt<C.recoverMs)return false;
      this.clearTools();this.round++;this.phase='select';this.player=null;this.enemy=null;
      this.result=null;this.reason='';this.frozenTool=null;this.contact=null;return true;
    }
    drainEvents() { return this.events.splice(0); }
  }
  const api = { Match, C, dist, clamp, outcome, segmentCircle, reach, ik, playerRig, potFrame };
  if (typeof module === 'object') module.exports = api;
  else root.WGG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
