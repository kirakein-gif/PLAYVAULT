(function () {
  'use strict';
  window.HKRender = function (canvas) {
    const ctx = canvas.getContext('2d');
    const backdrop = new Image(); backdrop.src = '../assets/title-keep-v1.webp';
    function text(label, x, y, color = '#b8b2bf', size = 12) {
      ctx.fillStyle = color; ctx.font = `${size}px system-ui`; ctx.fillText(label, x, y);
    }
    return function draw(world, debug, effects) {
      const p = HKSim.getPlayer(world), room = world.room;
      ctx.clearRect(0, 0, 960, 540); ctx.fillStyle = '#101320'; ctx.fillRect(0, 0, 960, 540);
      if (backdrop.complete && backdrop.naturalWidth) {
        ctx.globalAlpha = .18; ctx.drawImage(backdrop, 0, 0, 960, 540); ctx.globalAlpha = 1;
      }
      for (let x = 28; x < 960; x += 154) {
        ctx.strokeStyle = '#31313e'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, 480); ctx.lineTo(x, 170); ctx.quadraticCurveTo(x, 105, x + 59, 76);
        ctx.quadraticCurveTo(x + 118, 105, x + 118, 170); ctx.lineTo(x + 118, 480); ctx.stroke();
        ctx.strokeStyle = '#4b4250'; ctx.lineWidth = 1; ctx.stroke();
      }
      for (const s of room.solids) {
        ctx.fillStyle = '#292d3a'; ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#716675'; ctx.fillRect(s.x, s.y, s.w, 3);
        ctx.strokeStyle = '#151923'; ctx.lineWidth = 1;
        for (let x = s.x + 24; x < s.x + s.w; x += 36) {ctx.beginPath();ctx.moveTo(x,s.y+3);ctx.lineTo(x,s.y+Math.min(20,s.h));ctx.stroke();}
      }
      for (const mark of room.labels || []) text(mark.text, mark.x, mark.y, '#a9a2b5', 11);
      for (const d of world.dummies) {
        ctx.fillStyle = d.hp > 0 ? '#987667' : '#3a3540'; ctx.fillRect(d.x + 9, d.y, d.w - 18, d.h);
        ctx.fillStyle = '#ccb58b'; ctx.fillRect(d.x, d.y + 13, d.w, 5);
        ctx.strokeStyle = '#e1be83'; ctx.beginPath();ctx.arc(d.x+d.w/2,d.y+24,11,0,Math.PI*2);ctx.stroke();
        text(`${d.hp} HP`, d.x - 10, d.y - 10, '#d9b787', 10);
      }
      const light = world.active === 'ethan';
      // Temporary geometric silhouettes, authored here; no new image assets.
      ctx.save();ctx.translate(p.x + p.w / 2, p.y + p.h);ctx.scale(p.face,1);
      if (!p.onGround && p.jumpKind === 'running') ctx.rotate(.16 * Math.sign(p.takeoffVx) * p.face);
      ctx.fillStyle = light ? '#bfb7a8' : '#524566';
      ctx.beginPath();ctx.moveTo(-p.w*.42,-p.h*.7);ctx.lineTo(p.w*.3,-p.h*.7);ctx.lineTo(p.w*.5,-8);ctx.lineTo(-p.w*.5,-8);ctx.closePath();ctx.fill();
      ctx.fillStyle = '#222539';ctx.fillRect(-12,-12,9,12);ctx.fillRect(6,-12,9,12);
      ctx.fillStyle = light ? '#e6cca4' : '#bdc8d7';ctx.fillRect(-10,-p.h,21,20);
      ctx.fillStyle = light ? '#f4cf76' : '#89d7e7';ctx.fillRect(-p.w*.42,-p.h*.66,p.w*.74,5);ctx.fillRect(4,-p.h+7,12,3);
      ctx.restore();
      for (const a of world.attacks.filter(a => a.life > 0)) {
        ctx.fillStyle = a.kind === 'projectile' ? '#efd181' : '#8addf0';
        if (a.kind === 'projectile') {ctx.beginPath();ctx.ellipse(a.x+a.w/2,a.y+a.h/2,a.w/2,a.h/2,0,0,Math.PI*2);ctx.fill();}
        else {ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(a.x+a.w/2,a.y+a.h/2,a.w/2,a.h/2,-a.face*.25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
      }
      for (const e of effects) text(`−${e.damage}`, e.x, e.y - (40 - e.life), '#fff0bd', 22);
      if (debug) {
        ctx.lineWidth=1;ctx.strokeStyle='#72e9ba';ctx.strokeRect(p.x,p.y,p.w,p.h);
        ctx.strokeStyle='#fa88b5';for(const b of HKSim.getHitboxes(world))ctx.strokeRect(b.x,b.y,b.w,b.h);
        text(`x ${p.x.toFixed(1)}  y ${p.y.toFixed(1)}  vx ${p.vx.toFixed(2)}  vy ${p.vy.toFixed(2)}`,20,72,'#9ee9dc');
        text(`ground ${p.onGround}  coyote ${p.coyote}  buffer ${p.jumpBuffer}  ${p.jumpKind || 'ground'} takeoff ${p.takeoffVx.toFixed(2)}  tick ${world.tick}`,20,90,'#9ee9dc');
      }
    };
  };
})();
