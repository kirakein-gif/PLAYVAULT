// Original piece sets for the Wizard Stone and Gothic Keep skins.
// Design rule (family request): calm, not flashy — muted stone/iron colours,
// one signature motif per piece, no glow or gilding, strong silhouettes that
// still read at ~60 px per square.
// Output: public/pieces/<skin>/{w,b}{K,Q,R,B,N,P}.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.OUT_DIR || join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pieces');
const f = (n) => Math.round(n * 100) / 100;

const MAT = {
  wizard: {
    w: { stops: [[0, '#6c6e72'], [0.32, '#a6a8ab'], [0.32, '#dcdcda'], [0.6, '#ebebe9'], [0.6, '#c3c4c4'], [1, '#7c7e81']], top: ['#f1f1ef', '#b7b8b9'], stroke: '#2f3033', sw: 1.2, detail: '#55575b', inset: '#e8e9ea', speckle: 0.2 },
    b: { stops: [[0, '#0b0b0c'], [0.32, '#1c1d1f'], [0.32, '#3d3e42'], [0.6, '#4a4b4f'], [0.6, '#2a2b2e'], [1, '#0e0e0f']], top: ['#55565a', '#202124'], stroke: '#77797e', sw: 1.15, detail: '#7d7f84', inset: '#5c5e62', speckle: 0.28 },
  },
  // Gothic: candle-lit bone vs dark iron. Variant A "violet night", B "candle stone".
  gothic: {
    w: { stops: [[0, '#7a6c58'], [0.18, '#b5a68a'], [0.42, '#e8dcc4'], [0.55, '#f2e9d6'], [0.78, '#c4b496'], [1, '#7c6d58']], top: ['#f6efe0', '#c3b391'], stroke: '#3b3226', sw: 1.2, detail: '#6b5c47', inset: '#f4ecda', speckle: 0 },
    b: process.env.GOTHIC_VARIANT === 'B'
      ? { stops: [[0, '#0d0b09'], [0.18, '#25201a'], [0.42, '#4a3f32'], [0.55, '#57493a'], [0.78, '#2d2620'], [1, '#0d0b09']], top: ['#5e5244', '#241e18'], stroke: '#8a7a66', sw: 1.15, detail: '#9a8a74', inset: '#5a4d3e', speckle: 0 }
      : { stops: [[0, '#0b0910'], [0.18, '#1f1a2b'], [0.42, '#3c3450'], [0.55, '#4a4160'], [0.78, '#261f33'], [1, '#0b0910']], top: ['#544a66', '#211b2c'], stroke: '#7d7290', sw: 1.15, detail: '#8a7fa0', inset: '#514767', speckle: 0 },
  },
};

function defs(skin, c, id) {
  const M = MAT[skin][c];
  const stops = M.stops.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('');
  const speckle = M.speckle
    ? `<filter id="${id}sp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 0.95" result="a"/><feComposite in="a" in2="SourceAlpha" operator="in" result="s"/><feComponentTransfer in="s" result="s2"><feFuncA type="linear" slope="${M.speckle}"/></feComponentTransfer><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s2"/></feMerge></filter>`
    : '';
  return `<defs><linearGradient id="${id}b" x1="0" x2="1" y1="0" y2="0">${stops}</linearGradient>
<linearGradient id="${id}t" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${M.top[0]}"/><stop offset="1" stop-color="${M.top[1]}"/></linearGradient>
<linearGradient id="${id}s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.06"/><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></linearGradient>
<radialGradient id="${id}fs" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.5"/><stop offset="0.6" stop-color="#000" stop-opacity="0.22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
${speckle}</defs>`;
}

/** a solid part: gradient body + soft vertical shading + outline */
function part(skin, c, id, d, fill = 'b') {
  const M = MAT[skin][c];
  return `<path d="${d}" fill="url(#${id}${fill})" stroke="${M.stroke}" stroke-width="${M.sw}" stroke-linejoin="round"/><path d="${d}" fill="url(#${id}s)"/>`;
}
const line = (skin, c, d, w = 1.2, op = 0.7) => `<path d="${d}" fill="none" stroke="${MAT[skin][c].detail}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
const inset = (skin, c, d, op = 0.55) => `<path d="${d}" fill="${MAT[skin][c].inset}" opacity="${op}" stroke="${MAT[skin][c].stroke}" stroke-width="0.9"/>`;
const hole = (skin, c, d) => `<path d="${d}" fill="${c === 'w' ? '#2b2e36' : '#050506'}" stroke="${MAT[skin][c].stroke}" stroke-width="0.7"/>`;

/** low plinth seen slightly from above */
function plinth(skin, c, id, rx = 22, square = false) {
  const M = MAT[skin][c];
  const shadow = `<ellipse cx="50" cy="90.5" rx="${rx + 5}" ry="5.2" fill="url(#${id}fs)"/>`;
  if (square) {
    // chiselled octagonal slab (wizard)
    const top = `M${50 - rx},81 L${50 - rx + 5},77 L${50 + rx - 5},77 L${50 + rx},81 L${50 + rx - 5},84.5 L${50 - rx + 5},84.5 Z`;
    const side = `M${50 - rx},81 L${50 - rx},86 L${50 - rx + 5},89.5 L${50 + rx - 5},89.5 L${50 + rx},86 L${50 + rx},81 L${50 + rx - 5},84.5 L${50 - rx + 5},84.5 Z`;
    return shadow + part(skin, c, id, side) + `<path d="${top}" fill="url(#${id}t)" stroke="${M.stroke}" stroke-width="${M.sw}" stroke-linejoin="round"/>`;
  }
  const side = `M${50 - rx},81 L${50 - rx},86.5 A${rx},4.4 0 0 0 ${50 + rx},86.5 L${50 + rx},81 Z`;
  return shadow + part(skin, c, id, side) + `<ellipse cx="50" cy="81" rx="${rx}" ry="4.2" fill="url(#${id}t)" stroke="${M.stroke}" stroke-width="${M.sw}"/>`;
}

// ---------------- Wizard Stone: carved statues, one motif each ----------------
const WIZ = {
  P(s, c, id) {
    return plinth(s, c, id, 19, true) +
      part(s, c, id, 'M33,80 L35,62 Q37,55 50,53 Q63,55 65,62 L67,80 Z') + // shoulders / torso
      part(s, c, id, 'M45,54 L45,50 L55,50 L55,54 Z') + // neck
      part(s, c, id, 'M40.5,50 L40.5,41 Q41,30 50,29 Q59,30 59.5,41 L59.5,50 L56,50 L56,44 L44,44 L44,50 Z') + // helmet
      line(s, c, 'M50,30 L50,49', 1.6, 0.8) + line(s, c, 'M41,41.5 L59,41.5', 1.1, 0.6) +
      inset(s, c, 'M44,61 L56,61 L56,68 Q56,74 50,77 Q44,74 44,68 Z', 0.6) + // small shield
      line(s, c, 'M50,62.5 L50,75', 1, 0.6);
  },
  R(s, c, id) {
    return plinth(s, c, id, 23, true) +
      part(s, c, id, 'M31,80 L33.5,34 L66.5,34 L69,80 Z') + // tower walls
      line(s, c, 'M33,46 L67,46 M32.5,58 L67.5,58 M32,70 L68,70', 0.9, 0.35) +
      line(s, c, 'M42,34 L42,46 M58,46 L58,58 M42,58 L42,70 M58,70 L58,80', 0.9, 0.3) +
      part(s, c, id, 'M28,35 L28,19 L36,19 L36,25 L45.5,25 L45.5,19 L54.5,19 L54.5,25 L64,25 L64,19 L72,19 L72,35 Z') + // battlements
      inset(s, c, 'M42.5,45 L57.5,45 L57.5,55 Q57.5,63 50,67 Q42.5,63 42.5,55 Z', 0.65) + // shield crest
      line(s, c, 'M50,47 L50,64 M44.5,53 L55.5,53', 1.1, 0.7);
  },
  N(s, c, id) {
    const head = 'M31,80 C30,68 33,60 39,54 C34,52.5 29,51.5 24.5,50.3 C21,49.6 18.6,48.6 17.2,46.4 C15.6,44 15.8,41 17.6,38.4 C20,34.6 24.2,30.4 28.4,25.6 C30.6,23 32,20.6 33.6,18.4 L36.4,8.6 C37.2,7 38.8,7.4 39.4,9 L41.8,15.6 C47,15.4 53.8,17.6 59.4,22 C66.6,27.8 70.6,37 71.6,47.6 C72.6,57.6 72.4,67.6 73.4,80 Z';
    return plinth(s, c, id, 23, true) + part(s, c, id, head) +
      // chanfron: the armour plate over the face (the motif)
      inset(s, c, 'M18.5,40 C22,35 27,30 31,25 L35,19.5 L39,22 C37,27 34,33 30,38 C26,42 22,44 19.5,44.5 Z', 0.55) +
      `<circle cx="27" cy="33" r="1" fill="${MAT[s][c].detail}"/><circle cx="31.5" cy="27.5" r="1" fill="${MAT[s][c].detail}"/>` +
      // stepped stone mane
      line(s, c, 'M44,17.5 L47,21 M50,19 L53,23.5 M56,21.5 L58.5,27 M61,26 L63,32 M65,32 L66,38', 1.4, 0.55) +
      `<path d="M33.5,30.6 C35,29 37,29 38.2,30.4 C36.8,31.8 35,32 33.5,30.6 Z" fill="${c === 'w' ? '#26282c' : '#a6a8ad'}"/>` +
      line(s, c, 'M39,54 C41.5,48 41.6,42 39.2,37', 1.4, 0.5);
  },
  B(s, c, id) {
    return plinth(s, c, id, 21, true) +
      // staff: thick with a contrasting rim so it reads on both square colours
      `<path d="M65.5,82 L65.5,26" stroke="${c === 'w' ? '#3a3b3e' : '#a9abb0'}" stroke-width="6.2" stroke-linecap="round"/><path d="M65.5,82 L65.5,26" stroke="${c === 'w' ? '#d4d5d6' : '#3c3d41'}" stroke-width="3.8" stroke-linecap="round"/>` +
      part(s, c, id, 'M34,80 L39,46 Q50,40 61,46 L66,80 Z') + // robe
      line(s, c, 'M44,50 L42,79 M56,50 L58,79', 1, 0.4) +
      part(s, c, id, 'M38.5,47 Q37,30 43,22 Q50,15 57,22 Q63,30 61.5,47 Q55,42 50,42 Q45,42 38.5,47 Z') + // hood
      hole(s, c, 'M44.5,38 Q44.5,28 50,26 Q55.5,28 55.5,38 Q53,36 50,36 Q47,36 44.5,38 Z') + // face shadow
      `<circle cx="65.5" cy="22" r="5" fill="${c === 'w' ? '#e6e7e8' : '#4a4b50'}" stroke="${c === 'w' ? '#3a3b3e' : '#a9abb0'}" stroke-width="1.4"/>`;
  },
  Q(s, c, id) {
    return plinth(s, c, id, 23, true) +
      part(s, c, id, 'M30,80 Q34,62 41,48 L59,48 Q66,62 70,80 Z') + // gown + cape
      line(s, c, 'M41,48 Q38,64 35,79 M59,48 Q62,64 65,79', 1.1, 0.45) +
      part(s, c, id, 'M44,49 L45,44 L55,44 L56,49 Z') +
      `<ellipse cx="50" cy="37.5" rx="6.6" ry="7.4" fill="url(#${id}b)" stroke="${MAT[s][c].stroke}" stroke-width="${MAT[s][c].sw}"/>` +
      part(s, c, id, 'M41.5,32 L42.5,20 L46,27 L50,16.5 L54,27 L57.5,20 L58.5,32 Q50,29.5 41.5,32 Z'); // crown
  },
  K(s, c, id) {
    const M = MAT[s][c];
    const rim = c === 'w' ? '#3a3b3e' : '#a9abb0';
    const core = c === 'w' ? '#d4d5d6' : '#3c3d41';
    return plinth(s, c, id, 24, true) +
      part(s, c, id, 'M28,81 Q31,62 37,51 Q42,46 50,46 Q58,46 63,51 Q69,62 72,81 Z') + // broad mantle
      line(s, c, 'M37,51 Q34,66 32,80 M63,51 Q66,66 68,80', 1.1, 0.45) +
      part(s, c, id, 'M39,50 Q50,56 61,50 L60,47 Q50,51 40,47 Z', 't') + // fur collar
      `<ellipse cx="50" cy="39" rx="6.8" ry="7.6" fill="url(#${id}b)" stroke="${M.stroke}" stroke-width="${M.sw}"/>` +
      part(s, c, id, 'M41.5,33.5 L41.5,24.5 L45.5,28.5 L50,23.5 L54.5,28.5 L58.5,24.5 L58.5,33.5 Q50,31 41.5,33.5 Z') + // crown
      part(s, c, id, 'M48.4,23.5 L48.4,19 L45.6,19 L45.6,16 L48.4,16 L48.4,12.5 L51.6,12.5 L51.6,16 L54.4,16 L54.4,19 L51.6,19 L51.6,23.5 Z') + // cross
      // sword held upright in front (the motif): blade, crossguard, grip, pommel
      `<path d="M50,78 L50,62" stroke="${rim}" stroke-width="5.4" stroke-linecap="round"/><path d="M50,78 L50,62" stroke="${core}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M42.5,60.5 L57.5,60.5" stroke="${rim}" stroke-width="4.6" stroke-linecap="round"/><path d="M42.5,60.5 L57.5,60.5" stroke="${core}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M50,59 L50,54.5" stroke="${rim}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="53" r="2.4" fill="${core}" stroke="${rim}" stroke-width="1.2"/>`;
  },
};

// ---------------- Gothic Keep: spires, lancets, pointed arches ----------------
function lathe(points, cx = 50) {
  const right = points.map(([y, w]) => [cx + w, y]);
  const left = points.map(([y, w]) => [cx - w, y]).reverse();
  const seg = (pts) => pts.slice(1).map(([x, y]) => ` L${f(x)},${f(y)}`).join('');
  const top = points[0], bot = points[points.length - 1];
  return `M${f(cx - top[1])},${f(top[0])} L${f(cx + top[1])},${f(top[0])}${seg(right)} A${f(bot[1])},3 0 0 1 ${f(cx - bot[1])},${f(bot[0])}${seg(left)} Z`;
}
const GOT = {
  P(s, c, id) {
    const M = MAT[s][c];
    return plinth(s, c, id, 19) +
      part(s, c, id, lathe([[44, 5.4], [52, 5.8], [62, 8.6], [72, 13], [80, 15.5]])) +
      part(s, c, id, 'M40.5,46 L59.5,46 L58.5,49.5 L41.5,49.5 Z', 't') + // collar
      `<circle cx="50" cy="35.5" r="10" fill="url(#${id}b)" stroke="${M.stroke}" stroke-width="${M.sw}"/>` + // round head
      `<circle cx="50" cy="35.5" r="10" fill="url(#${id}s)"/>`;
  },
  R(s, c, id) {
    return plinth(s, c, id, 23) +
      part(s, c, id, 'M32,80 L34,36 L66,36 L68,80 Z') +
      part(s, c, id, 'M29,37 L29,26 L34.5,17 L40,26 L44.5,26 L50,17 L55.5,26 L60,26 L65.5,17 L71,26 L71,37 Z') + // pointed merlons
      hole(s, c, 'M45.5,66 L45.5,54 Q45.5,47.5 50,44 Q54.5,47.5 54.5,54 L54.5,66 Z') + // lancet window
      line(s, c, 'M34.5,40 L65.5,40 M33,74 L67,74', 0.9, 0.4);
  },
  N(s, c, id) {
    const head = 'M31,80 C30,68 33,60 39,54 C34,52.5 29,51.5 24.5,50.3 C21,49.6 18.6,48.6 17.2,46.4 C15.6,44 15.8,41 17.6,38.4 C20,34.6 24.2,30.4 28.4,25.6 C30.6,23 32,20.6 33.6,18.4 L36.4,8.6 C37.2,7 38.8,7.4 39.4,9 L41.8,15.6 L46,13.5 L48,18.5 L53,16.5 L54,21.5 L59,21 L59,26 L64,27 L63,32 L68,34.5 L66,38.5 L71,42 L69,46 C71,56 72,67 73.4,80 Z'; // saw-tooth gothic mane
    return plinth(s, c, id, 23) + part(s, c, id, head) +
      line(s, c, 'M39,54 C41.5,48 41.6,42 39.2,37', 1.4, 0.5) +
      `<path d="M32.6,30.4 C34.5,28.6 37,28.6 38.4,30 C36.6,31.4 34.4,31.8 32.6,30.4 Z" fill="${c === 'w' ? '#2a2e38' : '#a9adbd'}"/>` +
      `<ellipse cx="20.6" cy="42.4" rx="1.5" ry="1" fill="${MAT[s][c].detail}" transform="rotate(-30 20.6 42.4)"/>`;
  },
  B(s, c, id) {
    return plinth(s, c, id, 21) +
      part(s, c, id, lathe([[48, 6.2], [56, 6.6], [66, 10], [74, 14.5], [80, 16.5]])) +
      part(s, c, id, 'M39.5,49 L39.5,31 Q39.5,19 50,9 Q60.5,19 60.5,31 L60.5,49 Z') + // ogive mitre
      hole(s, c, 'M47.8,44 L47.8,30 Q47.8,25 50,22 Q52.2,25 52.2,30 L52.2,44 Z') + // lancet slit
      part(s, c, id, 'M41,49 L59,49 L58,52.5 L42,52.5 Z', 't');
  },
  Q(s, c, id) {
    return plinth(s, c, id, 23) +
      part(s, c, id, lathe([[40, 8.5], [50, 7.5], [60, 9.5], [70, 14], [80, 19]])) +
      part(s, c, id, 'M37.5,41 L38.5,23 L41.5,32 L44,16 L47,30 L50,11 L53,30 L56,16 L58.5,32 L61.5,23 L62.5,41 Z') + // crown of lancet spires
      part(s, c, id, 'M37,41 L63,41 L62,45 L38,45 Z', 't');
  },
  K(s, c, id) {
    return plinth(s, c, id, 24) +
      part(s, c, id, lathe([[44, 9], [54, 8], [64, 10.5], [72, 15], [80, 20]])) +
      part(s, c, id, 'M38,45 L38,33 L41,26 L44,33 L44,45 Z M56,45 L56,33 L59,26 L62,33 L62,45 Z') + // side pinnacles
      part(s, c, id, 'M43,45 L43,30 L50,13 L57,30 L57,45 Z') + // central spire
      hole(s, c, 'M48.4,41 L48.4,32 Q48.4,28.5 50,26.5 Q51.6,28.5 51.6,32 L51.6,41 Z') +
      part(s, c, id, 'M48.4,14 L48.4,9.5 L45.6,9.5 L45.6,6.8 L48.4,6.8 L48.4,3.6 L51.6,3.6 L51.6,6.8 L54.4,6.8 L54.4,9.5 L51.6,9.5 L51.6,14 Z') + // cross
      part(s, c, id, 'M37,45 L63,45 L62,48.5 L38,48.5 Z', 't');
  },
};

for (const [skin, set] of [['wizard', WIZ], ['gothic', GOT]]) {
  mkdirSync(join(root, skin), { recursive: true });
  for (const c of ['w', 'b']) {
    for (const [k, fn] of Object.entries(set)) {
      const id = `${skin[0]}${c}${k}`;
      const M = MAT[skin][c];
      const body = fn(skin, c, id);
      const g = M.speckle ? `<g filter="url(#${id}sp)">${body}</g>` : body;
      writeFileSync(join(root, skin, `${c}${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${skin === 'wizard' ? '7 6 86 86' : '5 2 90 90'}" width="200" height="200">${defs(skin, c, id)}${g}</svg>\n`);
    }
  }
}
console.log('skin pieces written');
