import { C } from './config.mjs';
import { clamp, V } from './kinematics.mjs';
import { toolPoses, samplePose, poseFrame } from './poses.mjs';

// Cursor displacement along a visible path controls joint progress. No timer
// advances this controller. Reversing the cursor reverses the arm.
export class DirectInput {
  constructor(kind,home,screenPoints,cursor){
    this.kind=kind;this.knots=toolPoses(kind,home);this.points=screenPoints;
    this.cursor={...cursor};this.progress=0;this.segment=0;this.steer=0;this.maxRatio=0;this.violations=0;
  }
  frame(p=this.progress,steer=this.steer){return poseFrame(samplePose(this.knots,p),steer);}
  point(p=this.progress){
    let i=0;while(i<this.points.length-2&&p>this.points[i+1].p)i++;
    const a=this.points[i],b=this.points[i+1],t=clamp((p-a.p)/(b.p-a.p),0,1);
    return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
  }
  move(x,y,loaded=false){
    const dx=x-this.cursor.x,dy=y-this.cursor.y,d=Math.hypot(dx,dy);
    if(d<1e-9)return;
    const n=Math.ceil(d),sx=dx/n,sy=dy/n,len=d/n;
    for(let j=0;j<n;j++){
      // Latch path corners so sub-pixel rounding cannot choose the old tangent
      // after the arm has actually loaded. Hysteresis also permits reversal.
      if(this.kind==='hammer'){
        if(loaded&&this.segment===0&&this.progress>=C.input.loadProgress-C.input.loadTolerance)this.segment=1;
        if(this.segment===1&&this.progress>=C.input.peakProgress-1e-6)this.segment=2;
        if(this.segment>0&&this.progress<this.points[this.segment].p-.02)this.segment--;
      }
      const i=this.segment;
      const a=this.points[i],b=this.points[i+1],distance=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));
      const tx=(b.x-a.x)/distance,ty=(b.y-a.y)/distance;
      const limit=this.kind==='hammer'&&!loaded?C.input.loadProgress:1;
      const next=clamp(this.progress+(sx*tx+sy*ty)*(b.p-a.p)/distance,0,limit);
      const steer=clamp(this.steer+(-ty*sx+tx*sy)*C.input.steerDegreesPerPixel,-C.input.maxSteerDegrees,C.input.maxSteerDegrees);
      const old=this.frame().targets[0],max=C.input.maxTargetMetersPerPixel*len;
      // Bound actual requested 3D displacement, including joint-space steering.
      let scale=1;
      if(this.frame(next,steer).targets[0].distanceTo(old)>max){
        let lo=0,hi=1;for(let k=0;k<24;k++){const mid=(lo+hi)/2;
          if(this.frame(this.progress+(next-this.progress)*mid,this.steer+(steer-this.steer)*mid).targets[0].distanceTo(old)>max)hi=mid;else lo=mid;
        }scale=lo;
      }
      const prior=this.progress,priorSteer=this.steer;
      this.progress=prior+(next-prior)*scale;this.steer=priorSteer+(steer-priorSteer)*scale;
      const ratio=this.frame().targets[0].distanceTo(old)/len;
      this.maxRatio=Math.max(this.maxRatio,ratio);
      if(ratio>C.input.maxTargetMetersPerPixel+1e-9)this.violations++;
    }
    this.cursor={x,y};
  }
}
