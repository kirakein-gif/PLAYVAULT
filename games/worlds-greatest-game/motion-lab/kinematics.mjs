import { Vector3 as V, Quaternion, Euler } from './vendor/three.module.min.js';
import { C } from './config.mjs';
export { V };
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const rad = d => d * Math.PI / 180;
export const deg = r => r * 180 / Math.PI;
export const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const vec = a => new V(...a);
const up = new V(0, 1, 0);
export function spring(p, v, target, dt, omega = C.springOmega) {
  // Closed form, no frame-dependent Euler integration or overshoot.
  const offset = p.clone().sub(target), j = v.clone().addScaledVector(offset, omega);
  const decay = Math.exp(-omega * dt);
  p.copy(target).add(offset.addScaledVector(j, dt).multiplyScalar(decay));
  v.addScaledVector(j, -omega * dt).multiplyScalar(decay);
}
export function solveArm(shoulder, requested, pole, wrist = {}, a = C.upper, b = C.fore) {
  let dir = requested.clone().sub(shoulder);
  if (dir.lengthSq() < 1e-14) dir.set(0, -.1, 1);
  dir.normalize();
  // Anatomical shoulder cone in character-local space (forward = +Z).
  const yaw = clamp(deg(Math.atan2(dir.x, dir.z)), ...C.limits.shoulderYaw);
  const elevation = Math.asin(clamp(dir.y, -1, 1));
  dir.set(Math.sin(rad(yaw)) * Math.cos(elevation), Math.sin(elevation), Math.cos(rad(yaw)) * Math.cos(elevation));
  const maxD = a + b - 1e-9;
  const minD = Math.sqrt(a*a + b*b + 2*a*b*Math.cos(rad(C.limits.elbow[1])));
  const distance = clamp(shoulder.distanceTo(requested), minD, maxD);
  const hand = shoulder.clone().addScaledVector(dir, distance);
  let bend = pole.clone().sub(shoulder);
  bend.addScaledVector(dir, -bend.dot(dir));
  if (bend.lengthSq() < 1e-10) {
    bend.copy(Math.abs(dir.y) < .9 ? up : new V(1,0,0));
    bend.addScaledVector(dir, -bend.dot(dir));
  }
  bend.normalize();
  const along = (a*a + distance*distance - b*b) / (2*distance);
  let elbow = shoulder.clone().addScaledVector(dir, along).addScaledVector(bend, Math.sqrt(Math.max(0, a*a - along*along)));
  // Limit upper-arm elevation too. Rebuild the forearm on its fixed-radius sphere.
  let upper = elbow.clone().sub(shoulder).normalize();
  const lift = deg(Math.acos(clamp(-upper.y, -1, 1)));
  if (lift > C.limits.shoulderLift[1]) {
    const horizontal = new V(upper.x,0,upper.z).normalize();
    upper.copy(horizontal.multiplyScalar(Math.sin(rad(C.limits.shoulderLift[1])))).addScaledVector(up, -Math.cos(rad(C.limits.shoulderLift[1])));
    elbow = shoulder.clone().addScaledVector(upper, a);
    const fore = hand.clone().sub(elbow).normalize();
    const angle = Math.acos(clamp(upper.dot(fore),-1,1));
    if (angle > rad(C.limits.elbow[1])) {
      const perpendicular = fore.clone().addScaledVector(upper,-fore.dot(upper)).normalize();
      fore.copy(upper).multiplyScalar(Math.cos(rad(C.limits.elbow[1]))).addScaledVector(perpendicular,Math.sin(rad(C.limits.elbow[1])));
    }
    hand.copy(elbow).addScaledVector(fore,b);
  }
  const u = elbow.clone().sub(shoulder).normalize(), f = hand.clone().sub(elbow).normalize();
  const flex = deg(Math.acos(clamp(u.dot(f),-1,1)));
  return { shoulder: shoulder.clone(), elbow, hand, flex, inner: 180-flex,
    lift: deg(Math.acos(clamp(-u.y,-1,1))),
    wristFlex: clamp(wrist.flex || 0, ...C.limits.wristFlex),
    wristSide: clamp(wrist.side || 0, ...C.limits.wristSide),
    bendNormal: dir.clone().cross(bend).normalize() };
}
export function fingers(shape = 1, reveal = 1, grip = 0) {
  // 0=scissors (thumb + index), 1=rock, 2=paper.
  return Array.from({length:5}, (_,i) => {
    const open = shape === 2 || shape === 0 && i < 2;
    const curl = (1-(open ? reveal : 0)) * 85;
    return { curl: curl*(1-grip) + 65*grip,
      spread: (i===0 ? 58 : (2.5-i)*9) * (1-grip), open: open && reveal===1 && grip===0 };
  });
}
export function buildRig(targets, {lean=0, twist=0, neck=0, wrists={}, shapes=[1,1], reveal=0, grips=[0,0], poles=[], clavRaises=[]} = {}) {
  lean=clamp(lean,...C.limits.spine); twist=clamp(twist,...C.limits.spineTwist); neck=clamp(neck,...C.limits.neck);
  const spineQ = new Quaternion().setFromEuler(new Euler(rad(lean/2),rad(twist/2),0));
  const pelvis = new V(0,.61,0), lower = pelvis.clone().add(new V(0,.27,0).applyQuaternion(spineQ));
  const fullQ = spineQ.clone().multiply(spineQ);
  const chest = lower.clone().add(new V(0,.29,0).applyQuaternion(fullQ));
  const neckBase=chest.clone().add(new V(0,.10,0).applyQuaternion(fullQ));
  const headQ=fullQ.clone().multiply(new Quaternion().setFromEuler(new Euler(rad(neck),0,0)));
  const head=neckBase.clone().add(new V(0,.14,0).applyQuaternion(headQ));
  const crown=head.clone().add(new V(0,.16,0).applyQuaternion(headQ));
  const arms = [-1,1].map((side,i) => {
    const anchor=chest.clone().add(new V(side*.025,.04,0).applyQuaternion(fullQ));
    const goal=targets[i] || new V(side*.26,.90,.21);
    const raise=clavRaises[i]??clamp((goal.y-1.16)*.14,0,.065);
    const clavDir = new V(side*C.clavicle,raise, .015).normalize();
    const shoulder=anchor.clone().add(clavDir.multiplyScalar(C.clavicle).applyQuaternion(fullQ));
    const arm=solveArm(shoulder,goal,poles[i]||new V(side*.65,.75,.10),wrists[i]);
    return {...arm, anchor, fingers:fingers(shapes[i],reveal,grips[i])};
  });
  return {pelvis, lower, chest, neckBase, head, crown, headQ, arms, lean, twist, neck};
}
export function violations(rig) {
  let n=0;
  for(const a of rig.arms) {
    if(Math.abs(a.shoulder.distanceTo(a.elbow)-C.upper)>1e-6) n++;
    if(Math.abs(a.elbow.distanceTo(a.hand)-C.fore)>1e-6) n++;
    if(Math.abs(a.anchor.distanceTo(a.shoulder)-C.clavicle)>1e-6) n++;
    if(a.flex < -1e-6 || a.flex > C.limits.elbow[1]+1e-6 || a.lift > C.limits.shoulderLift[1]+1e-6) n++;
    if(a.wristFlex<C.limits.wristFlex[0] || a.wristFlex>C.limits.wristFlex[1] || a.wristSide<C.limits.wristSide[0] || a.wristSide>C.limits.wristSide[1]) n++;
  }
  return n;
}
