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
</script>`;

const TEX = {
  // light squares: pale maple / boxwood, close to #D8C2A2
  'square-light': { w: 512, h: 512, seed: 11, wx: 0.004, wy: 0.02, warp: 2.4, freq: 0.022, sharp: 1.6, ringAmt: 0.22, fiberAmt: 0.18, pores: 0.25, blotch: 0.2, a: [196, 170, 134], b: [232, 214, 184] },
  // dark squares: American walnut, close to #765239
  'square-dark': { w: 512, h: 512, seed: 23, wx: 0.003, wy: 0.018, warp: 2.8, freq: 0.03, sharp: 1.3, ringAmt: 0.3, fiberAmt: 0.22, pores: 0.4, blotch: 0.25, a: [86, 56, 36], b: [146, 104, 72] },
  // frame: deep polished walnut
  frame: { w: 1024, h: 256, seed: 37, wx: 0.002, wy: 0.03, warp: 3.2, freq: 0.028, sharp: 1.2, ringAmt: 0.34, fiberAmt: 0.24, pores: 0.35, blotch: 0.3, a: [38, 22, 14], b: [104, 66, 40] },
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(page);
  for (const [name, o] of Object.entries(TEX)) {
    const url = await p.evaluate((o) => wood(o), o);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    const out = path.join(__dirname, '..', 'src', 'assets', 'textures', name + '.webp');
    fs.writeFileSync(out, buf);
    console.log(name, buf.length);
  }
  await b.close();
})();
