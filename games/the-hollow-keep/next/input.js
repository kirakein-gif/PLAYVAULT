(function () {
  'use strict';
  const bindings = { KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right',
    KeyW:'up', ArrowUp:'up', KeyS:'down', ArrowDown:'down', KeyE:'interact',
    Space:'jump', KeyK:'jump', KeyZ:'jump', KeyJ:'attack', KeyX:'attack', KeyQ:'swap', Tab:'swap' };
  window.HKInput = function (canvas) {
    const keys = new Set(), pointers = new Map();
    const stick = document.querySelector('[data-control="move"]');
    let stickPointer = null, stickAxis = 0, stickVertical = 0;
    let physical = {}, sampled = {}, pending = {};
    function sync() {
      const next = {};
      for (const code of keys) next[bindings[code]] = true;
      for (const value of pointers.values()) for (const action of [].concat(value)) next[action] = true;
      for (const action of ['left','right','up','down','jump','attack','swap','interact']) {
        if (!!next[action] !== !!physical[action]) (pending[action] ||= []).push(!!next[action]);
      }
      physical = next;
    }
    const editable = target => target.closest && target.closest('input,textarea,select,button,[contenteditable=true]');
    function clear() {
      keys.clear(); pointers.clear(); physical = {}; sampled = {}; pending = {};
      document.querySelectorAll('[data-action],[data-control="move"]').forEach(b => b.classList.remove('pressed'));
      stickPointer = null; stickAxis = 0; if (stick) {stick.style.setProperty('--stick-x', '0px');stick.style.setProperty('--stick-y', '0px');}
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
    document.addEventListener('focusin', e => { if (editable(e.target)) { keys.clear(); sync(); } });
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
    if (stick) {
      function steer(e) {
        const box = stick.getBoundingClientRect();
        const reach = Math.max(1, (box.width - 24) / 2);
        const delta = Math.max(-reach, Math.min(reach, e.clientX - (box.x + box.width / 2)));
        const reachY=Math.max(1,(box.height-24)/2),dy=Math.max(-reachY,Math.min(reachY,e.clientY-(box.y+box.height/2)));
        stickAxis = delta / reach;stickVertical=dy/reachY;
        stick.style.setProperty('--stick-x', delta + 'px');
        stick.style.setProperty('--stick-y',dy+'px');
        const actions=[];if(Math.abs(stickAxis)>.25)actions.push(stickAxis<0?'left':'right');if(Math.abs(stickVertical)>.25)actions.push(stickVertical<0?'up':'down');
        if(actions.length)pointers.set(e.pointerId,actions);else pointers.delete(e.pointerId);
        sync();
      }
      stick.addEventListener('pointerdown', e => {
        if (stickPointer !== null) return;
        e.preventDefault(); canvas.focus({ preventScroll: true });
        stickPointer = e.pointerId; stick.setPointerCapture(e.pointerId);
        stick.classList.add('pressed'); steer(e);
      });
      stick.addEventListener('pointermove', e => { if (e.pointerId === stickPointer) steer(e); });
      const release = e => {
        if (e.pointerId !== stickPointer) return;
        pointers.delete(e.pointerId); sync(); stickPointer = null; stickAxis = 0;
        stickVertical=0;stick.style.setProperty('--stick-y','0px');stick.style.setProperty('--stick-x', '0px'); stick.classList.remove('pressed');
      };
      for (const event of ['pointerup','pointercancel','lostpointercapture']) stick.addEventListener(event, release);
      stick.addEventListener('contextmenu', e => e.preventDefault());
    }
    function relayout() {
      if (stick && stickPointer !== null) {
        const reach = Math.max(1, (stick.getBoundingClientRect().width - 24) / 2);
        stick.style.setProperty('--stick-x', stickAxis * reach + 'px');
        stick.style.setProperty('--stick-y',stickVertical*Math.max(1,(stick.getBoundingClientRect().height-24)/2)+'px');
      }
    }
    return { clear, relayout, sample() {
      // Preserve a press/release between frames, one transition per action per tick.
      for (const [action, queue] of Object.entries(pending)) {
        if (queue.length) sampled[action] = queue.shift();
      }
      return { ...sampled };
    } };
  };
})();
