import { Matrix4, Quaternion } from './vendor/three.module.min.js';
import { C } from './config.mjs';
import { V, buildRig, rad, ease, clamp } from './kinematics.mjs';

const idle=()=>[new V(-.27,.91,.18),new V(.27,.91,.18)];
function basis(upper,tangent){
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(upper,tangent,upper.clone().cross(tangent)));
}
function preset(inner,lift,spread,{clav=.065,lean=0,neck=0,pitch=0}={}){
  const az=rad(-spread),el=rad(lift);
  return {inner,q:basis(new V(Math.sin(az)*Math.sin(el),-Math.cos(el),Math.cos(az)*Math.sin(el)),
    new V(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el))),clav,lean,neck,pitch};
}
export function seedPose(home){
  const r=buildRig([home,idle()[1]],{clavRaises:[0,0]}),a=r.arms[0];
  const u=a.elbow.clone().sub(a.shoulder).normalize(),f=a.hand.clone().sub(a.elbow).normalize();
  const tangent=f.addScaledVector(u,-f.dot(u)).normalize();
  return {inner:a.inner,q:basis(u,tangent),clav:0,lean:0,neck:0,pitch:0};
}
export function toolPoses(kind,home){
  const first=seedPose(home),P=C.poses;
  return kind==='hammer'?
    [[0,first],[C.input.loadProgress,preset(...P.hammerLoad,-16)],
      [C.input.peakProgress,preset(...P.hammerPeak,-16,{lean:4,pitch:15})],
      [1,preset(...P.hammerHit,-16,{lean:4,pitch:62})]]:
    [[0,first],[1,preset(...P.potOne,0,{neck:18})]];
}
export function samplePose(knots,progress){
  const p=clamp(progress,0,1);
  let i=0;while(i<knots.length-2&&p>knots[i+1][0])i++;
  const [start,a]=knots[i],[end,b]=knots[i+1],t=ease((p-start)/(end-start));
  const pose={q:a.q.clone().slerp(b.q,t)};
  for(const k of ['inner','clav','lean','neck','pitch'])pose[k]=a[k]+(b[k]-a[k])*t;
  return pose;
}
export function poseFrame(pose,steer=0,grip=1){
  const q=new Quaternion().setFromAxisAngle(new V(0,1,0),rad(steer)).multiply(pose.q);
  const upper=new V(1,0,0).applyQuaternion(q),tangent=new V(0,1,0).applyQuaternion(q);
  const frame={targets:idle(),lean:pose.lean,neck:pose.neck,clavRaises:[pose.clav,0],poles:[],
    grips:[grip,0],shapes:[1,1],reveal:0,toolPitch:pose.pitch};
  const shoulder=buildRig(frame.targets,frame).arms[0].shoulder;
  const elbow=shoulder.clone().addScaledVector(upper,C.upper),flex=rad(180-pose.inner);
  frame.targets[0]=elbow.clone().addScaledVector(upper,C.fore*Math.cos(flex)).addScaledVector(tangent,C.fore*Math.sin(flex));
  frame.poles[0]=elbow;
  return frame;
}
export function toolFrame(kind,progress,home,steer=0,grip=1){return poseFrame(samplePose(toolPoses(kind,home),progress),steer,grip);}
