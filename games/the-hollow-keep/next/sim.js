/* Pure, fixed-tick rules. No clock, random source, rendering or input device. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HKSim = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const TICK = 1 / 60;
  const CONFIG = {
    swapCooldownTicks: 11, swapVelocityScale: .82,
    heroes: {
      ethan: { width: 42, height: 68, runSpeed: 2.95, stopTicks: 8,
        accelerationGround: .42, accelerationAir: .22, friction: .82,
        gravity: .70, jumpHeight: 80, variableJump: true, minJumpHeight: 34,
        maxFall: 13.5, coyoteTicks: 6, jumpBufferTicks: 7,
        weapon: { kind: 'projectile', damage: 22, range: 1017.6, cooldownTicks: 29,
          speed: 10.6, width: 18, height: 12, activeTicks: 96 } },
      noah: { width: 39, height: 64, runSpeed: 3.85, stopTicks: 5,
        accelerationGround: .68, accelerationAir: .40, friction: .60,
        gravity: .57, jumpHeight: 145, variableJump: true, minJumpHeight: 56,
        maxFall: 13.8, coyoteTicks: 8, jumpBufferTicks: 8,
        weapon: { kind: 'melee', damage: 22, range: 66, cooldownTicks: 18,
          height: 46, activeTicks: 9 } }
    }
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const horizontal = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x;
  const vertical = (a, b) => a.y < b.y + b.h && a.y + a.h > b.y;
  const supported = (p, solids) => solids.some(s => horizontal(p, s) && Math.abs(p.y + p.h - s.y) < 1e-7);
  // Invert the discrete semi-implicit trajectory, rather than v²/(2g).
  function rise(speed, gravity) {
    const n = Math.max(0, Math.ceil(speed / gravity) - 1);
    return n * speed - gravity * n * (n + 1) / 2;
  }
  function launchSpeed(height, gravity) {
    let lo = 0, hi = gravity + Math.sqrt(2 * gravity * Math.max(0, height)) + gravity;
    for (let i = 0; i < 48; i++) {
      const mid = (lo + hi) / 2;
      if (rise(mid, gravity) < height) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function createWorld({ room, spawn, hero = 'ethan' }) {
    const c = CONFIG.heroes[hero];
    if (!c) throw new Error('Unknown hero: ' + hero);
    const r = copy(room);
    r.solids = r.solids || []; r.dummies = r.dummies || [];
    const player = { x: spawn.x, y: spawn.y, w: c.width, h: c.height,
      vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuffer: 0,
      jumpStartFeet: null, jumpCut: false };
    player.onGround = supported(player, r.solids);
    return { tick: 0, active: hero, room: r, player, dummies: r.dummies,
      previous: {}, swapCooldown: 0, attackCooldowns: { ethan: 0, noah: 0 }, attacks: [], nextAttackId: 1 };
  }
  function move(p, solids) {
    let dx = p.vx;
    for (const s of solids) if (vertical(p, s)) {
      if (dx > 0 && p.x + p.w <= s.x && p.x + p.w + dx >= s.x) dx = Math.min(dx, s.x - p.x - p.w);
      if (dx < 0 && p.x >= s.x + s.w && p.x + dx <= s.x + s.w) dx = Math.max(dx, s.x + s.w - p.x);
    }
    p.x += dx; if (dx !== p.vx) p.vx = 0;
    let dy = p.vy;
    p.onGround = false;
    for (const s of solids) if (horizontal(p, s)) {
      if (dy >= 0 && p.y + p.h <= s.y && p.y + p.h + dy >= s.y) {
        dy = Math.min(dy, s.y - p.y - p.h); p.onGround = true;
      }
      if (dy < 0 && p.y >= s.y + s.h && p.y + dy <= s.y + s.h) dy = Math.max(dy, s.y + s.h - p.y);
    }
    p.y += dy; if (dy !== p.vy || p.onGround) p.vy = 0;
  }
  function step(w, held = {}) {
    const ev = [], p = w.player;
    const edge = key => !!held[key] && !w.previous[key];
    w.tick++;
    w.swapCooldown = Math.max(0, w.swapCooldown - 1);
    for (const key of Object.keys(w.attackCooldowns)) w.attackCooldowns[key] = Math.max(0, w.attackCooldowns[key] - 1);
    if (edge('swap') && !w.swapCooldown) {
      const from = w.active, to = from === 'ethan' ? 'noah' : 'ethan', c = CONFIG.heroes[to];
      const candidate = { x: p.x + (p.w - c.width) / 2, y: p.y + p.h - c.height, w: c.width, h: c.height };
      if (!w.room.solids.some(s => overlap(candidate, s))) {
        Object.assign(p, candidate); p.vx *= CONFIG.swapVelocityScale; p.vy *= CONFIG.swapVelocityScale;
        w.active = to; w.swapCooldown = CONFIG.swapCooldownTicks;
        w.attacks = w.attacks.filter(a => a.kind === 'projectile');
        ev.push({ type: 'swap', from, to });
      } else ev.push({ type: 'swapBlocked' });
    }
    const c = CONFIG.heroes[w.active];
    const wasGround = p.onGround;
    p.coyote = wasGround ? c.coyoteTicks : Math.max(0, p.coyote - 1);
    p.jumpBuffer = edge('jump') ? c.jumpBufferTicks : Math.max(0, p.jumpBuffer - 1);
    const jump = () => {
      p.vy = -launchSpeed(c.jumpHeight, c.gravity); p.jumpStartFeet = p.y + p.h;
      p.jumpCut = false; p.onGround = false; p.coyote = 0; p.jumpBuffer = 0;
      ev.push({ type: 'jump' });
    };
    if ((edge('jump') || p.jumpBuffer > 0) && (wasGround || p.coyote > 0)) jump();
    if (c.variableJump && !held.jump && p.vy < 0 && !p.jumpCut && p.jumpStartFeet !== null) {
      const risen = p.jumpStartFeet - (p.y + p.h);
      p.vy = Math.max(p.vy, -launchSpeed(Math.max(0, c.minJumpHeight - risen), c.gravity)); p.jumpCut = true;
    }
    const dir = Number(!!held.right) - Number(!!held.left);
    if (dir) p.face = dir;
    const accel = p.onGround ? c.accelerationGround : c.accelerationAir;
    p.vx += (dir * c.runSpeed - p.vx) * accel;
    if (!dir) {
      p.vx *= c.friction;
      // This linear cap guarantees the declared maximum stopping time even in air.
      p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - c.runSpeed / c.stopTicks);
    }
    p.vy = Math.min(c.maxFall, p.vy + c.gravity);
    move(p, w.room.solids);
    if (!wasGround && p.onGround) {
      ev.push({ type: 'land' });
      if (p.jumpBuffer > 0) jump();
    }
    w.attacks = w.attacks.filter(a => a.life > 0);
    if (edge('attack') && !w.attackCooldowns[w.active]) {
      const wp = c.weapon;
      w.attackCooldowns[w.active] = wp.cooldownTicks;
      w.attacks.push({ id: w.nextAttackId++, hero: w.active, kind: wp.kind,
        x: p.face > 0 ? p.x + p.w : p.x - (wp.kind === 'melee' ? wp.range : wp.width),
        y: p.y + (p.h - wp.height) / 2, w: wp.kind === 'melee' ? wp.range : wp.width,
        h: wp.height, face: p.face, damage: wp.damage, speed: wp.speed || 0,
        range: wp.range, traveled: 0, life: wp.activeTicks, hit: [] });
      ev.push({ type: 'attack', hero: w.active });
    }
    for (const a of w.attacks) {
      if (a.kind === 'melee') {
        // A swing stays attached to its owner; swapping cancels it.
        a.x = a.face > 0 ? p.x + p.w : p.x - a.w; a.y = p.y + (p.h - a.h) / 2;
      } else {
        const distance = Math.min(a.speed, a.range - a.traveled);
        // Swept horizontal box prevents thin walls/targets being skipped by fast shots.
        a.sweep = { x: Math.min(a.x, a.x + distance * a.face), y: a.y, w: a.w + distance, h: a.h };
        a.x += distance * a.face; a.traveled += distance;
      }
      const hitbox = a.sweep || a;
      // Solids absorb a projectile before targets behind them can be hit.
      if (a.kind === 'projectile' && w.room.solids.some(s => overlap(hitbox, s))) { a.life = 0; continue; }
      for (const d of w.dummies) if (d.hp > 0 && !a.hit.includes(d.id) && overlap(hitbox, d)) {
        a.hit.push(d.id); d.hp = Math.max(0, d.hp - a.damage);
        ev.push({ type: 'hit', target: d.id, damage: a.damage });
      }
      a.life--;
      if (a.kind === 'projectile' && a.traveled >= a.range) a.life = 0;
      delete a.sweep;
    }
    w.previous = Object.fromEntries(['left','right','up','down','jump','attack','swap'].map(k => [k, !!held[k]]));
    return ev;
  }
  return { TICK, CONFIG, createWorld, step, getPlayer: w => w.player,
    getHitboxes: w => w.attacks.filter(a => a.life > 0).map(a => ({ x: a.x, y: a.y, w: a.w, h: a.h })),
    snapshot: w => copy(w) };
});
