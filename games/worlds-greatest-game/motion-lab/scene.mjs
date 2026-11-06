import * as T from './vendor/three.module.min.js';
import { C } from './config.mjs';
import { V, rad, clamp } from './kinematics.mjs';
const Y=new V(0,1,0);
const sphere=new T.SphereGeometry(1,12,8), cylinder=new T.CylinderGeometry(1,1,1,10);
const mat=(color,roughness=.7)=>new T.MeshStandardMaterial({color,roughness});
const body=mat(0xa5aaa9), joint=mat(0x596463), palm=mat(0xb4b9b6), metal=mat(0x929b98,.3);
const jointDebug=new T.MeshBasicMaterial({color:0xe8b35d,depthTest:false});
function mesh(geometry,material,parent,scale,position=[0,0,0]) {
  const m=new T.Mesh(geometry,material);m.scale.set(...scale);m.position.set(...position);parent.add(m);return m;
}
function bone(a,b,r,parent,material=body) {
  const m=mesh(cylinder,material,parent,[r,1,r]);
  return {m,update(p,q){m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,q.clone().sub(p).normalize());m.scale.y=p.distanceTo(q);}};
}
export class Actor {
  constructor(scene,z,yaw,name) {
    this.group=new T.Group();scene.add(this.group);this.group.position.z=z;this.group.rotation.y=yaw;
    this.yaw=yaw;this.z=z;this.name=name;
    this.links=Array.from({length:13},()=>bone(null,null,.035,this.group));
    this.links[0].m.scale.x=this.links[0].m.scale.z=.11;
    this.links[1].m.scale.x=this.links[1].m.scale.z=.13;
    this.head=mesh(sphere,body,this.group,[.115,.16,.115]);
    // Nose and brow make facing direction readable without artwork.
    this.face=new T.Group();this.group.add(this.face);
    mesh(new T.BoxGeometry(.095,.018,.025),joint,this.face,[1,1,1],[0,.025,.112]);
    mesh(new T.BoxGeometry(.024,.035,.035),body,this.face,[1,1,1],[0,-.005,.122]);
    this.joints=Array.from({length:12},()=>mesh(sphere,joint,this.group,[.045,.045,.045]));
    this.debug=new T.Group();this.group.add(this.debug);
    this.debugPoints=Array.from({length:12},()=>mesh(sphere,jointDebug,this.debug,[.018,.018,.018]));
    this.debugLinks=Array.from({length:13},()=>bone(null,null,.005,this.debug,jointDebug));
    this.hands=[0,1].map(()=>{
      const g=new T.Group();this.group.add(g);mesh(new T.BoxGeometry(.075,.085,.035),palm,g,[1,1,1],[0,.035,0]);
      const fingers=Array.from({length:5},(_,i)=>{
        const root=new T.Group();g.add(root);root.position.set(i===0?-.047:(i-2.5)*.021,i===0?.012:.074,0);
        const chain=[];let parent=root;
        for(let j=0;j<3;j++){const hinge=new T.Group();parent.add(hinge);if(j)hinge.position.y=i===0?.024:.029;mesh(cylinder,palm,hinge,[.009,i===0?.024:.029,.009],[0,i===0?.012:.0145,0]);chain.push(hinge);parent=hinge;}
        return {root,chain};
      });return {g,fingers};
    });
    // Fixed seated lower body and chair.
    const seat=mat(0x46524f);
    mesh(new T.BoxGeometry(.43,.055,.40),seat,this.group,[1,1,1],[0,.55,-.02]);
    mesh(new T.BoxGeometry(.43,.38,.045),seat,this.group,[1,1,1],[0,.76,-.20]);
    for(const x of [-.12,.12]){
      const thigh=bone(null,null,.075,this.group);thigh.update(new V(x,.61,0),new V(x,.55,.32));
      const shin=bone(null,null,.052,this.group);shin.update(new V(x,.55,.32),new V(x,.08,.32));
      mesh(new T.BoxGeometry(.12,.07,.24),joint,this.group,[1,1,1],[x,.05,.39]);
    }
  }
  world(p){return this.group.localToWorld(p.clone());}
  local(p){return this.group.worldToLocal(p.clone());}
  update(rig,debug=false) {
    this.rig=rig;
    const pairs=[[rig.pelvis,rig.lower],[rig.lower,rig.chest],[rig.chest,rig.neckBase],[rig.neckBase,rig.head]];
    for(const a of rig.arms)pairs.push([a.anchor,a.shoulder],[a.shoulder,a.elbow],[a.elbow,a.hand]);
    pairs.push([rig.arms[0].anchor,rig.arms[1].anchor],[rig.pelvis,new V(-.12,.61,0)],[rig.pelvis,new V(.12,.61,0)]);
    pairs.forEach(([a,b],i)=>{this.links[i].update(a,b);this.debugLinks[i].update(a,b);});
    const points=[rig.pelvis,rig.lower,rig.chest,rig.neckBase,rig.head,...rig.arms.flatMap(a=>[a.shoulder,a.elbow,a.hand]),rig.crown];
    points.forEach((p,i)=>{this.joints[i].position.copy(p);this.joints[i].visible=i!==11;this.debugPoints[i].position.copy(p);});
    this.head.position.copy(rig.head);this.head.quaternion.copy(rig.headQ);
    this.face.position.copy(rig.head);this.face.quaternion.copy(rig.headQ);
    this.debug.visible=debug;
    rig.arms.forEach((a,i)=>{
      const h=this.hands[i];h.g.position.copy(a.hand);
      const f=a.hand.clone().sub(a.elbow).normalize();
      h.g.quaternion.setFromUnitVectors(Y,f).multiply(new T.Quaternion().setFromEuler(new T.Euler(rad(a.wristFlex),0,rad(a.wristSide))));
      a.fingers.forEach((s,k)=>{h.fingers[k].root.rotation.z=rad(s.spread);h.fingers[k].chain.forEach((p,j)=>{p.rotation.x=rad(s.curl*(j===0?.65:1));});});
    });
  }
}
export class Tool {
  constructor(scene,kind,home) {
    this.kind=kind;this.home=home.clone();this.g=new T.Group();scene.add(this.g);this.pitch=0;
    if(kind==='hammer') {
      mesh(cylinder,mat(0x58625f),this.g,[.025,C.hammerLength,.025],[0,C.hammerLength/2,0]);
      const head=mesh(cylinder,mat(0xc5b99f),this.g,[.065,.20,.065],[0,C.hammerLength,0]);head.rotation.z=Math.PI/2;
      for(const x of [-.1,.1]){const cap=mesh(cylinder,mat(0xb6a88a),this.g,[.085,.025,.085],[x,C.hammerLength,0]);cap.rotation.z=Math.PI/2;}
    } else {
      // Socket at left handle. Open side faces down while covering the crown.
      const shell=new T.Mesh(new T.SphereGeometry(.17,20,12,0,Math.PI*2,0,Math.PI/2),metal);
      shell.position.set(.19,.035,-.18);shell.scale.y=.60;this.g.add(shell);
      const rim=new T.Mesh(new T.TorusGeometry(.169,.012,6,24),metal);rim.rotation.x=Math.PI/2;rim.position.set(.19,.035,-.18);this.g.add(rim);
      for(const x of [0,.38]){const handle=new T.Mesh(new T.TorusGeometry(.035,.012,6,12),metal);handle.rotation.x=Math.PI/2;handle.position.set(x,.035,0);this.g.add(handle);const rail=bone(null,null,.01,this.g,metal);rail.update(new V(x,.035,-.18),new V(x,.035,0));}
    }
    this.reset();
  }
  reset(){this.g.visible=true;this.g.position.copy(this.home);this.g.scale.set(1,1,1);this.pitch=this.kind==='hammer'?-90:0;this.g.quaternion.setFromEuler(new T.Euler(rad(this.pitch),0,0));}
  attach(actor,armIndex,desiredPitch,dt) {
    const arm=actor.rig.arms[armIndex];
    const f=arm.hand.clone().sub(arm.elbow);
    const foreAngle=Math.atan2(f.y,f.z)*180/Math.PI;
    const flex=clamp(90-desiredPitch-foreAngle,...C.limits.wristFlex);
    const pitch=90-flex-foreAngle;
    this.pitch+=(pitch-this.pitch)*(1-Math.exp(-dt/C.toolLag));
    // Bound the actual lagged orientation, not only the desired wrist angle.
    arm.wristFlex=clamp(90-this.pitch-foreAngle,...C.limits.wristFlex);
    this.pitch=90-arm.wristFlex-foreAngle;
    this.g.position.copy(actor.world(arm.hand));
    this.g.scale.x=actor.group.scale.x;
    this.g.quaternion.setFromEuler(new T.Euler(rad(this.pitch),actor.yaw,0,'YXZ'));
    // The same constrained wrist drives the gripping palm and the tool socket.
    const h=actor.hands[armIndex].g;
    h.quaternion.setFromEuler(new T.Euler(rad(this.pitch),0,0));
  }
  tip(){return this.g.localToWorld(new V(this.kind==='hammer'?0:.19,this.kind==='hammer'?C.hammerLength:.035,this.kind==='hammer'?0:-.18));}
  normal(){return new V(0,1,0).applyQuaternion(this.g.quaternion);}
}
export function createScene(canvas) {
  const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0x202b29);renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();scene.fog=new T.Fog(0x202b29,5,12);
  scene.add(new T.HemisphereLight(0xecf0e4,0x56615d,2.5));
  const light=new T.DirectionalLight(0xffefcf,3);light.position.set(2,5,3);scene.add(light);
  const floor=mesh(new T.PlaneGeometry(200,200),mat(0x2b3834),scene,[1,1,1]);floor.rotation.x=-Math.PI/2;
  const grid=new T.GridHelper(8,40,0x64706a,0x37463f);grid.position.y=.001;scene.add(grid);
  mesh(new T.BoxGeometry(1.28,.055,.72),mat(0x74817a),scene,[1,1,1],[0,C.tableY-.0275,0]);
  for(const x of [-.52,.52])for(const z of [-.25,.25])mesh(new T.BoxGeometry(.045,.81,.045),joint,scene,[1,1,1],[x,.405,z]);
  const camera=new T.PerspectiveCamera(43,1,.02,100);
  const presets=[[[1.15,2.14,2.5],[0,1.08,0]],[[2.65,1.85,.05],[0,1.05,0]],[[.65,1.95,-2.6],[0,1.10,0]]];
  let cam=0;
  function cameraMode(index){cam=index;camera.position.set(...presets[index][0]);camera.lookAt(...presets[index][1]);camera.updateMatrixWorld();}
  cameraMode(0);
  const actors=[new Actor(scene,C.seatZ,Math.PI,'player'),new Actor(scene,-C.seatZ,0,'enemy')];
  // Opponent's basic hand is on the visible side; the large gesture uses its other hand.
  actors[1].group.scale.x=-1;actors[1].group.updateMatrixWorld(true);
  const tools=Object.fromEntries(Object.entries(C.homes).map(([kind,p])=>[kind,new Tool(scene,kind,new V(...p))]));
  const enemyTools={hammer:new Tool(scene,'hammer',new V(.31,.91,-.23)),pot:new Tool(scene,'pot',new V(-.31,.91,-.2))};
  const aim=mesh(sphere,new T.MeshBasicMaterial({color:0xebc577,wireframe:true}),scene,[.028,.028,.028]);aim.visible=false;
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  function screen(p){const q=p.clone().project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2};}
  return {renderer,scene,camera,actors,tools,enemyTools,aim,screen,resize,cameraMode,get cam(){return cam;},render(){renderer.render(scene,camera);}};
}
