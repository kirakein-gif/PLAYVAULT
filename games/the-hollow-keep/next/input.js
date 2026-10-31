(function () {
  'use strict';
  const bindings = { KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right',
    Space:'jump', KeyK:'jump', KeyZ:'jump', KeyJ:'attack', KeyX:'attack', KeyQ:'swap', Tab:'swap' };
  window.HKInput = function (canvas) {
    const keys = new Set(), pointers = new Map();
    let physical = {}, sampled = {}, pending = {};
    function sync() {
      const next = {};
      for (const code of keys) next[bindings[code]] = true;
      for (const action of pointers.values()) next[action] = true;
      for (const action of ['left','right','jump','attack','swap']) {
        if (!!next[action] !== !!physical[action]) (pending[action] ||= []).push(!!next[action]);
      }
      physical = next;
    }
    const editable = target => target.closest && target.closest('input,textarea,select,button,[contenteditable=true]');
    function clear() {
      keys.clear(); pointers.clear(); physical = {}; sampled = {}; pending = {};
      document.querySelectorAll('[data-action]').forEach(b => b.classList.remove('pressed'));
    }
    window.addEventListener('keydown', e => {
      if (editable(e.target)) return;
      if (bindings[e.code]) { e.preventDefault(); keys.add(e.code); sync(); }
    });
    window.addEventListener('keyup', e => {
      keys.delete(e.code); sync();
      if (bindings[e.code] && !editable(e.target)) e.preventDefault();
    });
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    document.addEventListener('focusin', e => { if (editable(e.target)) clear(); });
    canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll:true }));
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('pointerdown', e => {
        e.preventDefault(); canvas.focus({ preventScroll:true });
        button.setPointerCapture(e.pointerId); pointers.set(e.pointerId, button.dataset.action); sync();
        button.classList.add('pressed');
      });
      const release = e => {
        pointers.delete(e.pointerId); sync();
        if (![...pointers.values()].includes(button.dataset.action)) button.classList.remove('pressed');
      };
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('contextmenu', e => e.preventDefault());
    });
    return { clear, sample() {
      // Preserve a press/release between frames, one transition per action per tick.
      for (const [action, queue] of Object.entries(pending)) {
        if (queue.length) sampled[action] = queue.shift();
      }
      return { ...sampled };
    } };
  };
})();
