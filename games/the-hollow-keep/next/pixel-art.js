(function () {
  'use strict';
  const choice = new URLSearchParams(location.search).get('art');
  const trial = choice === 'trial-x1' || choice === 'trial-x2';
  const base = trial ? 'assets/pixel-trial/' + choice.slice(-2) + '/' : 'assets/pixel/';
  const images = new Map(), failed = [];
  let manifest = null, settled = false;
  const fail = file => { if (!failed.includes(file)) failed.push(file); };
  async function load(file) {
    const img = new Image();
    await new Promise(resolve => {
      img.onload = () => { images.set(file, img); resolve(); };
      img.onerror = () => { fail(file); resolve(); };
      img.src = base + file;
    });
  }
  const ready = (async () => {
    try {
      const response = await fetch(base + 'manifest.json');
      if (!response.ok) throw new Error('manifest');
      manifest = await response.json();
      const files = new Set([...(manifest.tiles ? [manifest.tiles.file] : []), ...(manifest.background ? [manifest.background] : [])]);
      for (const hero of Object.values(manifest.heroes)) for (const anim of Object.values(hero.animations)) files.add(anim.file);
      await Promise.all([...files].map(load));
    } catch { fail('manifest.json'); }
    settled = true;
  })();
  window.HKPixel = { ready, manifest: () => manifest, image: file => images.get(file),
    status: () => ({ loaded: settled && failed.length === 0, failed: [...failed], scale: manifest?.scale || (choice === 'trial-x2' ? 2 : 1) }) };
})();
