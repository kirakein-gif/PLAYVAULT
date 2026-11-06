import { C, DURATIONS } from './config.mjs';
import { V, rad, ease, clamp, buildRig } from './kinematics.mjs';
export const idle=()=>[new V(-.27,.91,.18),new V(.27,.91,.18)];
const pairMix=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*ease(t));
export function motionFrame(kind,t,shape=0,home=new V(-.31,.91,.26)) {
  const targets=idle(),wrists={},grips=[0,0],shapes=[1,1],poles=[],clavRaises=[];
  const T=C.timing,P=C.poses,pumpEnd=T.pump*2,showEnd=pumpEnd+T.reveal,holdEnd=showEnd+T.hold;
  let reveal=0,lean=0,twist=0,neck=0,tool=null,stage='대기',toolPitch=0,commands=[];
  if(kind==='small'||kind==='large'){
    const large=kind==='large',i=large?1:0,p=ease((t-pumpEnd)/T.reveal),ret=ease((t-holdEnd)/T.return);
    const [lo,hi]=P.smallPump;
    const pump=(lo+hi)/2-(hi-lo)/2*Math.cos(t/T.pump*Math.PI*2);
    const inner=t<pumpEnd?pump:lo+((large?P.largeShow:P.smallShow)-lo)*p;
    commands=[[i,inner,P.smallLift+((large?P.largeLift:P.smallLift)-P.smallLift)*p,10,ret]];
    clavRaises[i]=.025;shapes[i]=shape;
    reveal=ease((t-(showEnd-.1))/.1)*(1-ret);
    stage=t<T.pump?'흔들기 1':t<pumpEnd?'흔들기 2':t<showEnd?'내기':t<holdEnd?'유지':'복귀';
    if(large){lean=12*p*(1-ret);twist=-10*p*(1-ret);}
  } else if(kind==='hammer'){
    const a=T.lift,b=a+T.load,c=b+T.extend;
    let pose=P.hammerLift;
    if(t>=a&&t<b)pose=pairMix(P.hammerLift,P.hammerLoad,(t-a)/T.load);
    else if(t>=b&&t<c)pose=pairMix(P.hammerLoad,P.hammerPeak,(t-b)/T.extend);
    else if(t>=c)pose=pairMix(P.hammerPeak,P.hammerHit,(t-c)/T.strike);
    commands=[[0,...pose,-16,0]];clavRaises[0]=.065;lean=4*ease(t/b);
    tool='hammer';toolPitch=clamp((t-b)/(DURATIONS.hammer-b),0,1)*62;
    wrists[0]={flex:toolPitch};grips[0]=ease(t/C.gripSeconds);
    stage=t<a?'들기':t<b?'장전':t<c?'최고점':'충돌';
  } else if(kind==='one'||kind==='two'){
    const two=kind==='two',d=DURATIONS[kind],pose=two?P.potTwo:P.potOne;
    commands=[[0,...pose,0,0]];clavRaises[0]=two?.01:.065;
    const progress=t>d+.6?1-ease((t-d-.6)/T.potReturn):ease(t/d);
    tool='pot';grips[0]=ease(t/C.gripSeconds)*progress;neck=two?0:18*progress;
    if(two){commands.push([1,...pose,0,0]);clavRaises[1]=.01;grips[1]=grips[0];}
    stage=t>d+.6?'내려놓기':t<d?'쓰기':'착용';
  }
  // Authored angles use the current torso/clavicles, then the same two-link IK.
  const base=buildRig(idle(),{lean,twist,neck,clavRaises});
  for(const [i,inner,lift,spread,ret] of commands){
    const side=i===0?-1:1,az=rad(side*spread),el=rad(lift),flex=rad(180-inner);
    const upper=new V(Math.sin(az)*Math.sin(el),-Math.cos(el),Math.cos(az)*Math.sin(el));
    const tangent=new V(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
    const elbow=base.arms[i].shoulder.clone().addScaledVector(upper,C.upper);
    const fore=upper.clone().multiplyScalar(Math.cos(flex)).addScaledVector(tangent,Math.sin(flex));
    let goal=elbow.clone().addScaledVector(fore,C.fore);
    if(kind==='hammer'&&t<C.timing.lift)goal=home.clone().lerp(goal,ease(t/C.timing.lift));
    if(kind==='one'||kind==='two'){
      const d=DURATIONS[kind],p=t>d+.6?1-ease((t-d-.6)/C.timing.potReturn):ease(t/d);
      goal=(i===0?home:idle()[i]).clone().lerp(goal,p);
    }
    if(ret)goal.lerp(idle()[i],ret);
    targets[i]=goal;poles[i]=elbow;
  }
  return {targets,wrists,grips,shapes,reveal,lean,twist,neck,tool,toolPitch,stage,poles,clavRaises};
}
export function stages(kind){
  const t=C.timing;
  if(kind==='small'||kind==='large'){
    const a=t.pump,b=a*2,c=b+t.reveal,d=c+t.hold;
    return [['흔들기 1',0,a],['흔들기 2',a,b],['내기',b,c],['유지',c,d],['복귀',d,d+t.return]];
  }
  if(kind==='hammer'){
    const a=t.lift,b=a+t.load,c=b+t.extend;
    return [['들기',0,a],['장전',a,b],['최고점',b,c],['내려치기',c,c+t.strike]];
  }
  const d=DURATIONS[kind];
  return [['쓰기',0,d],['착용',d,d+.6],['내려놓기',d+.6,d+.6+t.potReturn]];
}
