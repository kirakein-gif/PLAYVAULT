// Renders the app icon (Android adaptive + legacy + web) and splash images with
// Chromium. Original artwork: three muted balloons over a small basket.
// usage: NODE_PATH=$(npm root -g) node scripts/build-icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');

const BG = `<defs><radialGradient id="bg" cx="0.45" cy="0.35" r="0.8"><stop offset="0" stop-color="#22394a"/><stop offset="0.55" stop-color="#132330"/><stop offset="1" stop-color="#0a131a"/></radialGradient></defs>`;
const ART = `
  <path d="M42 50 L50 70 M54 44 L54 70 M66 50 L58 70" stroke="#c9bfa8" stroke-width="1.2" fill="none"/>
  <ellipse cx="42" cy="40" rx="9" ry="11" fill="#c98b7d"/><ellipse cx="39" cy="36" rx="2" ry="3.4" fill="#fff" opacity=".2"/>
  <ellipse cx="66" cy="40" rx="9" ry="11" fill="#d1b36a"/><ellipse cx="63" cy="36" rx="2" ry="3.4" fill="#fff" opacity=".2"/>
  <ellipse cx="54" cy="33" rx="9.5" ry="11.5" fill="#8fae8b"/><ellipse cx="51" cy="29" rx="2" ry="3.4" fill="#fff" opacity=".2"/>
  <path d="M46 70 H62 L60 80 Q54 82 48 80Z" fill="#8a6440"/><path d="M46 70 H62" stroke="#a98058" stroke-width="2.4" stroke-linecap="round"/>`;
const iconSvg = (full) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${BG}${full ? '<rect width="108" height="108" fill="url(#bg)"/>' : ''}
  <circle cx="54" cy="55" r="33" fill="none" stroke="#c9a66b" stroke-opacity=".55" stroke-width="1.6"/>${ART}</svg>`;
const sized = (svg, w, h, vb) => (vb ? svg.replace('viewBox="0 0 108 108"', `viewBox="${vb}"`) : svg).replace('width="108" height="108"', `width="${w}" height="${h}"`);
const page = (svg) => `<html><body style="margin:0;overflow:hidden">${svg}</body></html>`;
const splashSvg = (w, h) => {
  const s = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><radialGradient id="sb" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#1d2b36"/><stop offset="1" stop-color="#0b1218"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#sb)"/>
  <svg x="${w / 2 - s * 0.2}" y="${h / 2 - s * 0.34}" width="${s * 0.4}" height="${s * 0.4}" viewBox="22 18 64 70">${ART}</svg>
  <text x="${w / 2}" y="${h / 2 + s * 0.17}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="${s * 0.07}" letter-spacing="${s * 0.006}" fill="#e3c58f">HANGMAN MASTER</text>
</svg>`;
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (html, w, h, out, omitBackground = false) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(html);
    await p.waitForTimeout(60);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, omitBackground, clip: { x: 0, y: 0, width: w, height: h } });
  };
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const legacy = Math.round(48 * k), fg = Math.round(108 * k);
    await shot(page(sized(iconSvg(true), legacy, legacy, '12 12 84 84')), legacy, legacy, path.join(res, `mipmap-${d}`, 'ic_launcher.png'));
    await shot(page(`<div style="width:${legacy}px;height:${legacy}px;border-radius:50%;overflow:hidden">${sized(iconSvg(true), legacy, legacy, '12 12 84 84')}</div>`), legacy, legacy, path.join(res, `mipmap-${d}`, 'ic_launcher_round.png'), true);
    await shot(page(sized(iconSvg(false), fg, fg)), fg, fg, path.join(res, `mipmap-${d}`, 'ic_launcher_foreground.png'), true);
    await shot(page(sized(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${BG}<rect width="108" height="108" fill="url(#bg)"/></svg>`, fg, fg)), fg, fg, path.join(res, `mipmap-${d}`, 'ic_launcher_background.png'));
  }
  for (const dir of fs.readdirSync(res).filter((x) => x.startsWith('drawable'))) {
    const f = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    await shot(page(splashSvg(w, h)), w, h, f);
  }
  for (const s of [192, 512]) await shot(page(sized(iconSvg(true), s, s, '12 12 84 84')), s, s, path.join(root, 'public', 'icons', `icon-${s}.png`));
  await shot(page(sized(iconSvg(true), 512, 512, '12 12 84 84')), 512, 512, path.join(root, 'docs', 'icon-preview.png'));
  await b.close();
  console.log('icons and splash written');
})();
