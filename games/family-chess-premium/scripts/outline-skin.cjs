// Adds a solid outline around raster piece images (baked in, so slow tablets
// do not pay for CSS filters). White pieces get a dark rim, black pieces a pale
// rim, so each side reads on both square colours at ~60 px.
// usage: NODE_PATH=$(npm root -g) node scripts/outline-skin.cjs <srcDir> <outDir> [radius=5] [dark=#2a2233] [light=#c4b9d6]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [src, out, radius = '5', dark = '#2a2233', light = '#c4b9d6'] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const f of fs.readdirSync(src).filter((x) => /^[wb][KQRBNP]\.(webp|png)$/.test(x))) {
    const data = `data:image/${f.endsWith('png') ? 'png' : 'webp'};base64,` + fs.readFileSync(path.join(src, f)).toString('base64');
    const color = f[0] === 'w' ? dark : light;
    const url = await p.evaluate(async ({ data, color, r }) => {
      const img = new Image();
      img.src = data;
      await img.decode();
      const w = img.width, h = img.height;
      // silhouette in the outline colour
      const sil = document.createElement('canvas');
      sil.width = w; sil.height = h;
      const s = sil.getContext('2d');
      s.drawImage(img, 0, 0);
      s.globalCompositeOperation = 'source-in';
      s.fillStyle = color;
      s.fillRect(0, 0, w, h);
      // stamp the silhouette around a circle, then draw the piece on top
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      for (let a = 0; a < 32; a++) {
        const t = (a / 32) * Math.PI * 2;
        x.drawImage(sil, Math.cos(t) * r, Math.sin(t) * r);
      }
      x.drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.92);
    }, { data, color, r: Number(radius) });
    const outFile = path.join(out, f.replace(/\.png$/, '.webp'));
    fs.writeFileSync(outFile, Buffer.from(url.split(',')[1], 'base64'));
    console.log(f, fs.statSync(outFile).size);
  }
  await b.close();
})();
