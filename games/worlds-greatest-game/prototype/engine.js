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
  function enemyPotFrame(tool){
    const depth=clamp((C.potHome.y-tool.y)/(C.potHome.y-(C.enemyHead.y-C.enemyHead.r+7)),0,1);
    const scale=1+.6*depth;return {offset:C.potOffset*scale,scale};
  }
  const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  // One motion plan drives the opponent's wrist, torso and hit target.
  function enemyFrame(m){
    const resolving=['resolve','end'].includes(m.phase),age=resolving?Math.max(0,m.time-m.resolvedAt):0;
    const attacking=m.rule==='lose'||['hurt','block'].includes(m.result);
    const guarding=m.rule==='win'||m.result==='guarded';
    const elapsed=resolving?(attacking?C.enemyStrikeMs:C.enemyGuardMs):m.time-m.reactAt;
    let kind=null,mode='idle',target={x:340,y:625};
    if(m.phase==='react'||resolving&&['hurt','block','guarded'].includes(m.result)){
      if(attacking){
        const pickup=450,windEnd=C.enemyStrikeMs-260,wind={x:480,y:210};
        if(elapsed<220){mode='rps';target=C.enemyRps;}
        else if(elapsed<pickup){mode='reach';target=mix(C.enemyRps,C.hammerHome,ease((elapsed-220)/(pickup-220)));}
        else{kind='hammer';mode='tool';target=elapsed<windEnd?mix(C.hammerHome,wind,ease((elapsed-pickup)/(windEnd-pickup))):mix(wind,{x:C.playerCrown.x-40,y:C.playerCrown.y+C.hammerLength},ease((elapsed-windEnd)/(C.enemyStrikeMs-windEnd)));}
      }else if(guarding){
        const start=C.enemyGuardMs-600,pickup=C.enemyGuardMs-370;
        if(elapsed<start){mode='rps';target=C.enemyRps;}
        else if(elapsed<pickup){mode='reach';target=mix(C.enemyRps,C.potHome,ease((elapsed-start)/(pickup-start)));}
        else{kind='pot';mode='tool';target=mix(C.potHome,{x:C.enemyHead.x+C.potOffset*1.6,y:C.enemyHead.y-C.enemyHead.r+7},ease((elapsed-pickup)/(C.enemyGuardMs-pickup)));}
      }else{mode='rps';target=C.enemyRps;}
    }
    if(resolving){const p=ease(age/260);target=mix(target,{x:340,y:625},p);mode=p===1?'idle':'recover';if(p===1)kind=null;}
    if(resolving&&!['hurt','block','guarded'].includes(m.result)){mode='idle';kind=null;}
    const shoulder={...C.enemyShoulder},span=C.enemyUpperArm+C.enemyForearm-3;
    const horizontal=Math.sqrt(Math.max(0,span*span-(target.y-shoulder.y)**2));
    const lean=resolving&&m.result==='hit'?(m.enemyImpactLean||0)*(1-ease(age/260)):mode==='rps'||mode==='idle'?0:clamp(target.x-shoulder.x-horizontal,0,C.enemyMaxLean);
    shoulder.x+=lean;
    const reachProgress=attacking?ease((elapsed-220)/230):ease((elapsed-(C.enemyGuardMs-600))/230);
    return {target,shoulder,lean,reachProgress,head:{...C.enemyHead},kind,mode,visible:mode!=='idle',angle:-Math.PI/2};
  }
  // Complete drawings change only at explicit action steps; no limb interpolation.
  function stillPose(m,near){
    if(m.phase==='select')return 'idle';
    if(['resolve','end'].includes(m.phase)){
      if(near){
        if(m.frozenTool?.kind==='hammer')return ['hit','guarded','miss'].includes(m.result)?'hammer-strike':'hammer-pickup';
        if(m.frozenTool?.kind==='pot')return m.equipped?'pot-wear':'pot-pickup';
      }else{
        if(['hurt','block'].includes(m.result))return 'hammer-strike';
        if(m.result==='guarded')return 'pot-wear';
      }
      return 'idle';
    }
    if(near){
      if(m.held==='hammer')return m.tool.y<C.hammerHome.y-110?'hammer-lift':'hammer-pickup';
      if(m.held==='pot')return m.equipped||dist(m.tip(),{x:C.playerHead.x,y:C.playerHead.y-C.playerHead.r+7})<90?'pot-wear':'pot-pickup';
      return 'rps';
    }
    const f=enemyFrame(m),elapsed=m.time-m.reactAt;
    if(f.kind==='hammer')return elapsed>=C.enemyStrikeMs?'hammer-strike':elapsed>=620?'hammer-lift':'hammer-pickup';
    if(f.kind==='pot')return elapsed>=C.enemyGuardMs-100?'pot-wear':'pot-pickup';
    return 'rps';
  }
  class Match {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    get energy() { return { player: Math.max(0,C.maxEnergy-this.score.enemy*C.hitDamage), enemy: Math.max(0,C.maxEnergy-this.score.player*C.hitDamage) }; }
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
      this.hoverTool=null;this.hoverAt=null;
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
          this.contact={...C.playerCrown};
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
    hover(p,now){
      if(this.held||this.phase!=='react')return;
      const kind=p&&dist(p,C.hammerHome)<C.grabRadius+25?'hammer':p&&dist(p,C.potHome)<C.grabRadius+25?'pot':null;
      if(kind!==this.hoverTool){this.hoverTool=kind;this.hoverAt=now;}
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
      else {
        const head=C.enemyCrown;
        if(this.pathLength>=C.swingMinLength&&length/dt*1000>=C.swingMinSpeed&&
          (tip.x-previous.x)*(head.x-previous.x)+(tip.y-previous.y)*(head.y-previous.y)>0&&
          segmentCircle(previous,tip,head,C.enemyCrown.r+C.hammerRadius)) {
          this.contact={...head};this.resolve(this.time-this.reactAt>=C.enemyGuardMs?'guarded':'hit');
        }
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
      this.enemyImpactLean=enemyFrame(this).lean;
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
  const api = { Match, C, dist, clamp, outcome, segmentCircle, reach, ik, playerRig, potFrame, enemyPotFrame, enemyFrame, ease, mix, stillPose };
  if (typeof module === 'object') module.exports = api;
  else root.WGG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
