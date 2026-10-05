(() => {
  'use strict';
  const A = window.AF_ATLAS = {
    width: 384,
    height: 260,
    cols: 6,
    rows: 5,
    cellW: 64,
    cellH: 52,
    frames: {
      idle:   [[0,0],[1,0],[2,0],[3,0]],
      run:    [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],
      attack: [[0,2],[1,2],[2,2],[3,2]],
      hurt:   [[0,3],[1,3]],
      death:  [[0,4],[1,4],[2,4],[3,4]]
    },
    images: {},
    loaded: {},
    ready: null
  };

  const partCounts = { dawn: 4, night: 3 };
  const sharedPaths = { dawn: 'dawn-seeker', night: 'night-veil' };

  async function load(name) {
    try {
      const pieces = [];
      for (let i = 0; i < partCounts[name]; i++) {
        const res = await fetch(`../../assets/characters/${sharedPaths[name]}/atlas/${i}.b64?v=5`, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`${name} atlas chunk ${i}: ${res.status}`);
        pieces.push((await res.text()).trim());
      }
      const img = new Image();
      const ok = await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error(`${name} atlas decode failed`));
        img.src = 'data:image/webp;base64,' + pieces.join('');
      });
      A.images[name] = img;
      A.loaded[name] = ok;
      return ok;
    } catch (err) {
      console.warn('[PLAYVAULT] atlas fallback:', err);
      A.loaded[name] = false;
      return false;
    }
  }

  A.ready = Promise.all([load('dawn'), load('night')]);
})();