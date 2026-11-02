// Renders the app icon (Android adaptive + legacy + web) and splash images
// with Chromium. Original artwork built from our own knight SVG.
// usage: NODE_PATH=$(npm root -g) node scripts/build-icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
const knight = fs.readFileSync(path.join(root, 'public', 'pieces', 'wN.svg'), 'utf8');
const knightData = 'data:image/svg+xml;base64,' + Buffer.from(knight).toString('base64');

const BG = `
  <defs>
    <radialGradient id="bg" cx="0.45" cy="0.35" r="0.8"><stop offset="0" stop-color="#22394a"/><stop offset="0.55" stop-color="#132330"/><stop offset="1" stop-color="#0a131a"/></radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d9a6"/><stop offset="0.45" stop-color="#c9a66b"/><stop offset="1" stop-color="#7d5d2c"/></linearGradient>
  </defs>`;

const iconSvg = ({ full, ring = true, knightScale = 0.62 }) => {
  const k = 108 * knightScale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${BG}
  ${full ? '<rect width="108" height="108" fill="url(#bg)"/>' : ''}
  ${ring ? '<circle cx="54" cy="54" r="31.5" fill="none" stroke="url(#ring)" stroke-width="2.4"/><circle cx="54" cy="54" r="28.6" fill="none" stroke="#c9a66b" stroke-opacity="0.35" stroke-width="0.8"/>' : ''}
  <image href="${knightData}" x="${54 - k / 2}" y="${52 - k / 2}" width="${k}" height="${k}"/>
</svg>`;
};

const page = (svg, w, h, bg = 'transparent') =>
  `<html><body style="margin:0;background:${bg};width:${w}px;height:${h}px;overflow:hidden">${svg.replace('width="108" height="108"', `width="${w}" height="${h}"`)}</body></html>`;

const splashSvg = (w, h) => {
  const s = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><radialGradient id="sb" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#1d2b36"/><stop offset="1" stop-color="#0b1218"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#sb)"/>
  <image href="${knightData}" x="${w / 2 - s * 0.17}" y="${h / 2 - s * 0.3}" width="${s * 0.34}" height="${s * 0.34}"/>
  <text x="${w / 2}" y="${h / 2 + s * 0.17}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="${s * 0.075}" fill="#e3c58f">CHESS MASTER</text>
  <text x="${w / 2}" y="${h / 2 + s * 0.25}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="${s * 0.04}" letter-spacing="${s * 0.02}" fill="#c9a66b">PREMIUM</text>
</svg>`;
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (html, w, h, out, omitBackground = false) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(html);
    await p.waitForTimeout(80);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, omitBackground, clip: { x: 0, y: 0, width: w, height: h } });
  };
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const legacy = Math.round(48 * k), fg = Math.round(108 * k);
    // legacy square icon (full bleed artwork with rounded corners drawn by launcher)
    await shot(page(iconSvg({ full: true, knightScale: 0.7 }).replace('viewBox="0 0 108 108"', 'viewBox="12 12 84 84"'), legacy, legacy), legacy, legacy, path.join(res, `mipmap-${d}`, 'ic_launcher.png'));
    await shot(
      `<html><body style="margin:0;width:${legacy}px;height:${legacy}px;overflow:hidden"><div style="width:${legacy}px;height:${legacy}px;border-radius:50%;overflow:hidden">${iconSvg({ full: true, knightScale: 0.7 }).replace('viewBox="0 0 108 108"', 'viewBox="12 12 84 84"').replace('width="108" height="108"', `width="${legacy}" height="${legacy}"`)}</div></body></html>`,
      legacy, legacy, path.join(res, `mipmap-${d}`, 'ic_launcher_round.png'), true);
    // adaptive foreground (transparent, art inside the 66dp safe zone)
    await shot(page(iconSvg({ full: false }), fg, fg), fg, fg, path.join(res, `mipmap-${d}`, 'ic_launcher_foreground.png'), true);
    // adaptive background layer (deep navy radial gradient)
    await shot(page(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${BG}<rect width="108" height="108" fill="url(#bg)"/></svg>`, fg, fg), fg, fg, path.join(res, `mipmap-${d}`, 'ic_launcher_background.png'));
  }
  // splash screens: match the template's existing sizes
  const walk = (dir) => fs.readdirSync(dir).filter((x) => x.startsWith('drawable'));
  for (const dir of walk(res)) {
    const f = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    await shot(`<html><body style="margin:0">${splashSvg(w, h)}</body></html>`, w, h, f);
  }
  // web icons
  for (const s of [192, 512]) await shot(page(iconSvg({ full: true, knightScale: 0.7 }).replace('viewBox="0 0 108 108"', 'viewBox="12 12 84 84"'), s, s), s, s, path.join(root, 'public', 'icons', `icon-${s}.png`));
  await shot(page(iconSvg({ full: true, knightScale: 0.7 }).replace('viewBox="0 0 108 108"', 'viewBox="12 12 84 84"'), 512, 512), 512, 512, path.join(root, 'docs', 'icon-preview.png'));
  await b.close();
  console.log('icons and splash written');
})();
