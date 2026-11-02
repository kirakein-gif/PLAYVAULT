// Generates the original FAMILY CHESS PREMIUM piece set as SVG files.
// Turned pieces are built from lathe profiles and shaded like solid cylinders,
// so White is an opaque ivory piece (never an outline) and Black is ebony.
// Output: public/pieces/{w,b}{K,Q,R,B,N,P}.svg   (100x100 viewBox)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pieces');
mkdirSync(out, { recursive: true });

const PALETTE = {
  w: {
    body: [[0, '#8f7a5c'], [0.1, '#c8b391'], [0.3, '#f3e8d2'], [0.42, '#fffaf0'], [0.58, '#efe2c8'], [0.8, '#cdb791'], [1, '#8a7353']],
    top: ['#fffdf6', '#e9dbbf'],
    shade: ['#ffffff', 0.0, '#5a4630', 0.28],
    stroke: '#5b4a35',
    strokeW: 1.25,
    detail: '#7a6448',
    gloss: 0.55,
    ring: [[0, '#8a7454'], [0.3, '#f0e3c9'], [0.45, '#fffbf3'], [0.7, '#d9c6a2'], [1, '#806a4b']],
  },
  b: {
    body: [[0, '#050404'], [0.12, '#1d1916'], [0.3, '#4a413a'], [0.4, '#625750'], [0.55, '#2b2521'], [0.82, '#141110'], [1, '#030303']],
    top: ['#6b6058', '#221d1a'],
    shade: ['#ffffff', 0.0, '#000000', 0.35],
    stroke: '#000000',
    strokeW: 1.1,
    detail: '#8a7c70',
    gloss: 0.32,
    ring: [[0, '#040303'], [0.3, '#4f463f'], [0.45, '#756a61'], [0.7, '#2a2420'], [1, '#030303']],
  },
};

const f = (n) => Math.round(n * 100) / 100;

/** Smooth lathe outline through [y, halfWidth] points (top to bottom), elliptic bottom. */
function lathe(points, cx = 50, bottomRy = 3) {
  const right = points.map(([y, w]) => [cx + w, y]);
  const left = points.map(([y, w]) => [cx - w, y]).reverse();
  const curve = (pts) => {
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
    }
    return d;
  };
  const top = points[0];
  const bot = points[points.length - 1];
  return `M${f(cx - top[1])},${f(top[0])} L${f(cx + top[1])},${f(top[0])}` + curve(right) +
    ` A${f(bot[1])},${bottomRy} 0 0 1 ${f(cx - bot[1])},${f(bot[0])}` + curve(left) + ' Z';
}

/** A short solid cylinder (step / collar) seen slightly from above. */
function drum(y1, y2, rx, ry, cx = 50) {
  const side = `M${f(cx - rx)},${f(y1)} L${f(cx - rx)},${f(y2)} A${rx},${ry} 0 0 0 ${f(cx + rx)},${f(y2)} L${f(cx + rx)},${f(y1)} Z`;
  return { side, topEllipse: { cx, cy: y1, rx, ry } };
}

function defs(c, id) {
  const P = PALETTE[c];
  const stops = (arr) => arr.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('');
  return `<defs>
<linearGradient id="${id}b" x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">${stops(P.body)}</linearGradient>
<linearGradient id="${id}r" x1="0" x2="1" y1="0" y2="0">${stops(P.ring)}</linearGradient>
<radialGradient id="${id}t" cx="0.42" cy="0.35" r="0.75">${stops([[0, P.top[0]], [1, P.top[1]]])}</radialGradient>
<linearGradient id="${id}s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${P.shade[0]}" stop-opacity="${P.shade[1]}"/><stop offset="0.55" stop-color="${P.shade[2]}" stop-opacity="0"/><stop offset="1" stop-color="${P.shade[2]}" stop-opacity="${P.shade[3]}"/></linearGradient>
<radialGradient id="${id}sph" cx="0.36" cy="0.32" r="0.72">${stops(c === 'w' ? [[0, '#ffffff'], [0.25, '#fbf3e3'], [0.65, '#d9c6a2'], [1, '#7f6a4b']] : [[0, '#8a7f76'], [0.2, '#4e4640'], [0.6, '#1d1916'], [1, '#020202']])}</radialGradient>
<linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${P.gloss}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}fs" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.6" stop-color="#000" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>`;
}

function solid(c, id, d, fill = 'b') {
  const P = PALETTE[c];
  return `<path d="${d}" fill="url(#${id}${fill})" stroke="${P.stroke}" stroke-width="${P.strokeW}" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="url(#${id}s)"/>`;
}

function drumSvg(c, id, dr, fill = 'r') {
  const P = PALETTE[c];
  const e = dr.topEllipse;
  return solid(c, id, dr.side, fill) +
    `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="url(#${id}t)" stroke="${P.stroke}" stroke-width="${P.strokeW}"/>`;
}

function gloss(id, x, y1, y2, w = 3.2) {
  return `<rect x="${f(x)}" y="${y1}" width="${w}" height="${y2 - y1}" rx="${w / 2}" fill="url(#${id}g)" opacity="0.9"/>`;
}

function base(c, id, rx = 24) {
  return `<ellipse cx="50" cy="90.5" rx="${rx + 4}" ry="5.5" fill="url(#${id}fs)"/>` +
    drumSvg(c, id, drum(82, 88.5, rx, 4.6)) +
    drumSvg(c, id, drum(77.5, 82, rx - 3.5, 4));
}

function sphere(c, id, cx, cy, r) {
  const P = PALETTE[c];
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}sph)" stroke="${P.stroke}" stroke-width="${P.strokeW}"/>` +
    `<ellipse cx="${f(cx - r * 0.35)}" cy="${f(cy - r * 0.4)}" rx="${f(r * 0.28)}" ry="${f(r * 0.2)}" fill="#fff" opacity="${PALETTE[c].gloss * 0.8}"/>`;
}

function collar(c, id, y, rx, ry = 2.6, h = 3) {
  return drumSvg(c, id, drum(y, y + h, rx, ry));
}

const PIECES = {
  P(c, id) {
    return base(c, id, 21) +
      solid(c, id, lathe([[40, 6.2], [46, 5.8], [54, 7.2], [62, 10], [70, 14], [76, 16.5], [78, 17]])) +
      gloss(id, 44.2, 47, 74, 2.6) +
      sphere(c, id, 50, 29, 11.2) +
      collar(c, id, 39.5, 11.5, 2.6, 3.2);
  },
  R(c, id) {
    const P = PALETTE[c];
    const crown = `M31,15 L31,33 A19,4 0 0 0 69,33 L69,15 L62,15 L62,21 L55,21 L55,15 L45,15 L45,21 L38,21 L38,15 Z`;
    return base(c, id, 24) +
      solid(c, id, lathe([[34, 15.5], [40, 13.5], [50, 12.5], [60, 13.5], [70, 17], [76, 19.5], [78.5, 20]])) +
      gloss(id, 41.5, 38, 75, 3) +
      collar(c, id, 33, 18, 3.6, 3.4) +
      solid(c, id, crown) +
      `<ellipse cx="50" cy="15" rx="19" ry="3.6" fill="${c === 'w' ? '#9a8462' : '#0b0908'}" stroke="${P.stroke}" stroke-width="${P.strokeW}" opacity="0.95"/>` +
      `<path d="M33,15 L33,19 M67,15 L67,19" stroke="${P.stroke}" stroke-width="0.8"/>` +
      gloss(id, 37.4, 21, 32, 3);
  },
  B(c, id) {
    const P = PALETTE[c];
    const mitre = `M50,12 C58,17 63,25 62,32 C61.5,38 57,42 50,42.5 C43,42 38.5,38 38,32 C37,25 42,17 50,12 Z`;
    return base(c, id, 22) +
      solid(c, id, lathe([[44, 6.5], [50, 6], [58, 7.5], [66, 11], [73, 15.5], [78, 18]])) +
      gloss(id, 44, 48, 75, 2.6) +
      collar(c, id, 47, 10.5, 2.4, 2.8) +
      solid(c, id, mitre) +
      `<path d="M50,12 C58,17 63,25 62,32 C61.5,38 57,42 50,42.5" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="3"/>` +
      `<path d="M53.5,22 L44.5,33" stroke="${c === 'w' ? '#6f5a3f' : '#000'}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M54.3,23 L45.3,34" stroke="${c === 'w' ? '#fff8e8' : '#5a5048'}" stroke-width="0.8" stroke-linecap="round" opacity="0.8"/>` +
      gloss(id, 42, 21, 37, 2.6) +
      collar(c, id, 41.5, 9.5, 2.2, 3) +
      sphere(c, id, 50, 10, 4.2);
  },
  Q(c, id) {
    const P = PALETTE[c];
    const cup = `M33,16 L39,27 L44.5,14 L50,26 L55.5,14 L61,27 L67,16 L63.5,33 A13.5,3.4 0 0 1 36.5,33 Z`;
    return base(c, id, 24) +
      solid(c, id, lathe([[38, 8], [46, 7], [56, 8.4], [64, 11.5], [71, 16], [76, 19], [78.5, 20]])) +
      gloss(id, 43.5, 44, 75, 2.8) +
      collar(c, id, 42, 12.5, 2.8, 3) +
      collar(c, id, 36.5, 14.5, 3.2, 3) +
      solid(c, id, cup) +
      gloss(id, 41, 22, 33, 2.4) +
      [33, 44.5, 55.5, 67].map((x, i) => sphere(c, id, x, i === 1 || i === 2 ? 13 : 15, 3)).join('') +
      sphere(c, id, 50, 21, 3.4) +
      sphere(c, id, 50, 8.5, 4.6) +
      `<path d="M36.5,33 A13.5,3.4 0 0 0 63.5,33" fill="none" stroke="${P.stroke}" stroke-width="${P.strokeW}"/>`;
  },
  K(c, id) {
    const P = PALETTE[c];
    const cup = `M34,22 C38,25 44,26 50,26 C56,26 62,25 66,22 L62.5,35 A12.5,3.2 0 0 1 37.5,35 Z`;
    const cross = `M47.4,2.5 L52.6,2.5 L52.6,7.6 L57.6,7.6 L57.6,12.4 L52.6,12.4 L52.6,20 L47.4,20 L47.4,12.4 L42.4,12.4 L42.4,7.6 L47.4,7.6 Z`;
    return base(c, id, 24) +
      solid(c, id, lathe([[40, 8], [48, 7.2], [57, 8.6], [65, 12], [71, 16.2], [76, 19], [78.5, 20]])) +
      gloss(id, 43.5, 46, 75, 2.8) +
      collar(c, id, 44, 12.5, 2.8, 3) +
      collar(c, id, 38.5, 14.5, 3.2, 3) +
      solid(c, id, cup) +
      `<ellipse cx="50" cy="23" rx="16" ry="3.6" fill="url(#${id}t)" stroke="${P.stroke}" stroke-width="${P.strokeW}"/>` +
      gloss(id, 40.5, 27, 35, 2.4) +
      solid(c, id, `M44,23 C44,19 47,18 50,18 C53,18 56,19 56,23 Z`) +
      solid(c, id, cross) +
      `<rect x="48.2" y="3.4" width="1.6" height="15.6" fill="#fff" opacity="${P.gloss * 0.7}"/>`;
  },
  N(c, id) {
    const P = PALETTE[c];
    const head = `M31,78 C30,68 33,60 39,54 C34,52.5 29,51.5 24.5,50.3 C21,49.6 18.6,48.6 17.2,46.4 C15.6,44 15.8,41 17.6,38.4 C20,34.6 24.2,30.4 28.4,25.6 C30.6,23 32,20.6 33.6,18.4 L36.4,8.6 C37.2,7 38.8,7.4 39.4,9 L41.8,15.6 C47,15.4 53.8,17.6 59.4,22 C66.6,27.8 70.6,37 71.6,47.6 C72.6,57.6 72.4,67.6 73.4,78 Z`;
    const mane = `M42.4,16.2 C50,17 57.6,21.4 62.8,28.4 C67.6,35.2 69.6,43.8 70,53 C70.4,62 70.6,70 71.6,78`;
    return base(c, id, 24) +
      `<defs><linearGradient id="${id}nk" x1="0" y1="0.15" x2="1" y2="0.45">${(c === 'w'
        ? [[0, '#e9dcc0'], [0.2, '#fff9ee'], [0.42, '#f0e3c8'], [0.75, '#c7b08a'], [1, '#86704f']]
        : [[0, '#3a332e'], [0.2, '#5d534b'], [0.42, '#2c2622'], [0.75, '#141110'], [1, '#030303']]
      ).map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient></defs>` +
      solid(c, id, head, 'nk') +
      `<path d="${mane}" fill="none" stroke="${c === 'w' ? '#9b8562' : '#000'}" stroke-width="3.2" stroke-linecap="round" opacity="0.55"/>` +
      `<path d="M47,19.5 C53,21 58.5,25 62,30 M50.5,25 C55,27.5 59,32 61.4,37 M55,33 C58,37 59.6,42 60.2,47" fill="none" stroke="${c === 'w' ? '#a38d69' : '#000'}" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>` +
      `<path d="M21,40 C24.5,34.5 28.5,30.5 32,25 C34,22 35.6,19.5 37,15" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="${P.gloss * 0.8}"/>` +
      `<path d="M39,54 C41.5,48 41.6,42 39.2,37" fill="none" stroke="${c === 'w' ? '#9b8562' : '#000'}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>` +
      `<path d="M31.6,29.4 C33.2,27.4 35.8,27 37.2,28.6 C35.6,30.4 33.4,30.8 31.6,29.4 Z" fill="${c === 'w' ? '#3a2c1e' : '#c8b8a2'}"/>` +
      `<ellipse cx="20.6" cy="42.4" rx="1.6" ry="1.1" fill="${c === 'w' ? '#5a4630' : '#8a7c70'}" transform="rotate(-30 20.6 42.4)"/>` +
      `<path d="M17.6,46.4 C20,47.4 22.4,47.6 24.8,47.2" fill="none" stroke="${c === 'w' ? '#6e5a40' : '#7a6e64'}" stroke-width="1" stroke-linecap="round"/>` +
      `<path d="M31,78 C30,68 33,60 39,54" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="${P.gloss * 0.6}"/>` +
      `<path d="M33,76.5 A20.5,2.6 0 0 0 73.2,76.5" fill="none" stroke="${P.stroke}" stroke-width="${P.strokeW}"/>`;
  },
};

for (const c of ['w', 'b']) {
  for (const [k, fn] of Object.entries(PIECES)) {
    const id = `${c}${k}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 1 94 94" width="200" height="200">${defs(c, id)}${fn(c, id)}</svg>\n`;
    writeFileSync(join(out, `${id}.svg`), svg);
  }
}
console.log('pieces written to', out);
