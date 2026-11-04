// Procedural wood textures rendered in Chromium (Playwright) and saved as WebP.
// Original, generated here — no third-party images.
// usage: NODE_PATH=$(npm root -g) node scripts/build-textures.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const page = `
<canvas id="c"></canvas><script>
function makeNoise(seed){const p=new Uint8Array(512);let s=seed;for(let i=0;i<256;i++)p[i]=i;for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<256;i++)p[i+256]=p[i];
const g=(h,x,y)=>((h&1)?x:-x)+((h&2)?y:-y);const fade=t=>t*t*t*(t*(t*6-15)+10);
return (x,y)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const u=fade(x),v=fade(y);
const a=p[X]+Y,b=p[X+1]+Y;const l=(t,a,b)=>a+t*(b-a);return l(v,l(u,g(p[a],x,y),g(p[b],x-1,y)),l(u,g(p[a+1],x,y-1),g(p[b+1],x-1,y-1)));};}
function wood(o){const c=document.getElementById('c');c.width=o.w;c.height=o.h;const ctx=c.getContext('2d');const img=ctx.createImageData(o.w,o.h);
const n=makeNoise(o.seed),n2=makeNoise(o.seed+7),n3=makeNoise(o.seed+13);
const fbm=(x,y)=>{let v=0,a=1,f=1;for(let i=0;i<5;i++){v+=a*n(x*f,y*f);a*=.5;f*=2;}return v;};
for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){
 const warp=fbm(x*o.wx,y*o.wy)*o.warp;
 let ring=Math.sin((y*o.freq+warp)*Math.PI*2);ring=(ring+1)/2;ring=Math.pow(ring,o.sharp);
 const fiber=n2(x*0.9,y*0.04)*0.5+n3(x*0.05,y*1.6)*0.5;
 const pores=Math.max(0,n3(x*0.35,y*3.2)-0.35)*o.pores;
 let t=ring*o.ringAmt+fiber*o.fiberAmt-pores+fbm(x*0.004,y*0.01)*o.blotch;
 t=Math.max(0,Math.min(1,0.5+t));
 const i=(y*o.w+x)*4;for(let k=0;k<3;k++)img.data[i+k]=o.a[k]+(o.b[k]-o.a[k])*t;img.data[i+3]=255;}
ctx.putImageData(img,0,0);return c.toDataURL('image/webp',0.9);}
// marble: soft cloudy base + thin veins (|sin| near 0 of a warped field)
function marble(o){const c=document.getElementById('c');c.width=o.w;c.height=o.h;const ctx=c.getContext('2d');const img=ctx.createImageData(o.w,o.h);
const n=makeNoise(o.seed),n2=makeNoise(o.seed+5);
const fbm=(f,x,y)=>{let v=0,a=1,q=1;for(let i=0;i<6;i++){v+=a*f(x*q,y*q);a*=.5;q*=2;}return v;};
for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){
 const w=fbm(n,x*o.scale,y*o.scale)*o.warp;
 const v=Math.abs(Math.sin((x*o.dx+y*o.dy)*o.scale*6+w));
 const vein=Math.pow(1-v,o.sharp);
 const cloud=fbm(n2,x*o.scale*0.7,y*o.scale*0.7)*0.5+0.5;
 const grain=(Math.random()-0.5)*o.grain;
 let t=cloud*o.cloud+grain;
 const i=(y*o.w+x)*4;
 for(let k=0;k<3;k++){let base=o.a[k]+(o.b[k]-o.a[k])*Math.max(0,Math.min(1,t));base=base+(o.vein[k]-base)*vein*o.veinAmt;img.data[i+k]=base;}
 img.data[i+3]=255;}
ctx.putImageData(img,0,0);return c.toDataURL('image/webp',0.9);}
// marble2: veins that fade in and out (no crack-like lines), a soft secondary
// vein layer, gentle cloudy base and a faint polished sheen
function marble2(o){const c=document.getElementById('c');c.width=o.w;c.height=o.h;const ctx=c.getContext('2d');const img=ctx.createImageData(o.w,o.h);
const n=makeNoise(o.seed),n2=makeNoise(o.seed+5),n3=makeNoise(o.seed+9),n4=makeNoise(o.seed+17);
const fbm=(f,x,y,oct)=>{let v=0,a=1,q=1;for(let i=0;i<(oct||6);i++){v+=a*f(x*q,y*q);a*=.5;q*=2;}return v;};
const sm=(e0,e1,x)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){
 const w=fbm(n,x*o.scale,y*o.scale)*o.warp;
 const v1=Math.abs(Math.sin((x*o.dx+y*o.dy)*o.scale*5+w));
 const fade=sm(-0.1,0.45,fbm(n3,x*o.scale*0.8,y*o.scale*0.8,4));          // vein strength varies along its length
 const main=Math.pow(1-v1,o.sharp)*fade;
 const w2=fbm(n4,x*o.scale*1.3,y*o.scale*1.3)*o.warp*1.2;
 const v2=Math.abs(Math.sin((x*o.dy-y*o.dx)*o.scale*3.2+w2));
 const soft=Math.pow(1-v2,o.sharp2)*(0.5+0.5*fade);
 const cloud=fbm(n2,x*o.scale*0.6,y*o.scale*0.6)*0.5+0.5;
 const sheen=((x+y)/(o.w+o.h)-0.5)*o.sheen;
 const t=Math.max(0,Math.min(1,cloud*o.cloud+sheen+(Math.random()-0.5)*o.grain));
 const i=(y*o.w+x)*4;
 for(let k=0;k<3;k++){let b=o.a[k]+(o.b[k]-o.a[k])*t;b+= (o.vein2[k]-b)*soft*o.vein2Amt;b+=(o.vein[k]-b)*main*o.veinAmt;img.data[i+k]=b;}
 img.data[i+3]=255;}
ctx.putImageData(img,0,0);return c.toDataURL('image/webp',0.92);}
// stone: rough granular slab, no veins (wizard frame)
function stone(o){const c=document.getElementById('c');c.width=o.w;c.height=o.h;const ctx=c.getContext('2d');const img=ctx.createImageData(o.w,o.h);
const n=makeNoise(o.seed),n2=makeNoise(o.seed+3);
const fbm=(f,x,y)=>{let v=0,a=1,q=1;for(let i=0;i<6;i++){v+=a*f(x*q,y*q);a*=.5;q*=2;}return v;};
for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){
 let t=0.5+fbm(n,x*o.scale,y*o.scale)*o.mottle+fbm(n2,x*o.scale*6,y*o.scale*6)*o.rough+(Math.random()-0.5)*o.grain;
 t=Math.max(0,Math.min(1,t));
 const i=(y*o.w+x)*4;for(let k=0;k<3;k++)img.data[i+k]=o.a[k]+(o.b[k]-o.a[k])*t;img.data[i+3]=255;}
ctx.putImageData(img,0,0);return c.toDataURL('image/webp',0.9);}
</script>`;

const TEX = {
  // light squares: pale maple / boxwood, close to #D8C2A2
  'square-light': { w: 512, h: 512, seed: 11, wx: 0.004, wy: 0.02, warp: 2.4, freq: 0.022, sharp: 1.6, ringAmt: 0.22, fiberAmt: 0.18, pores: 0.25, blotch: 0.2, a: [196, 170, 134], b: [232, 214, 184] },
  // dark squares: American walnut, close to #765239
  'square-dark': { w: 512, h: 512, seed: 23, wx: 0.003, wy: 0.018, warp: 2.8, freq: 0.03, sharp: 1.3, ringAmt: 0.3, fiberAmt: 0.22, pores: 0.4, blotch: 0.25, a: [86, 56, 36], b: [146, 104, 72] },
  // frame: deep polished walnut
  // ---- Wizard Stone (calm grey / black marble) ----
  'wizard-light': { kind: 'marble2', w: 512, h: 512, seed: 41, scale: 0.0045, warp: 3.0, dx: 0.6, dy: 0.4, sharp: 11, sharp2: 3, cloud: 0.7, sheen: 0.12, grain: 0.03, veinAmt: 0.4, vein2Amt: 0.18, a: [126, 127, 130], b: [162, 163, 165], vein: [210, 205, 186], vein2: [180, 177, 166] },
  'wizard-dark': { kind: 'marble2', w: 512, h: 512, seed: 53, scale: 0.0045, warp: 3.0, dx: 0.5, dy: 0.55, sharp: 12, sharp2: 3, cloud: 0.65, sheen: 0.1, grain: 0.03, veinAmt: 0.42, vein2Amt: 0.16, a: [22, 23, 26], b: [46, 47, 51], vein: [126, 122, 108], vein2: [62, 61, 58] },
  'wizard-frame': { kind: 'stone', w: 1024, h: 256, seed: 61, scale: 0.01, mottle: 0.35, rough: 0.12, grain: 0.06, a: [34, 35, 38], b: [78, 79, 82] },
  // ---- Gothic Keep (muted slate / dark stone, cold tones) ----
  frame: { w: 1024, h: 256, seed: 37, wx: 0.002, wy: 0.03, warp: 3.2, freq: 0.028, sharp: 1.2, ringAmt: 0.34, fiberAmt: 0.24, pores: 0.35, blotch: 0.3, a: [38, 22, 14], b: [104, 66, 40] },
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(page);
  for (const [name, o] of Object.entries(TEX)) {
    const url = await p.evaluate((o) => (o.kind === 'marble2' ? marble2(o) : o.kind === 'marble' ? marble(o) : o.kind === 'stone' ? stone(o) : wood(o)), o);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (process.env.ONLY && !name.startsWith(process.env.ONLY)) continue;
    const out = path.join(process.env.OUT_DIR || path.join(__dirname, '..', 'src', 'assets', 'textures'), name + '.webp');
    fs.writeFileSync(out, buf);
    console.log(name, buf.length);
  }
  await b.close();
})();
