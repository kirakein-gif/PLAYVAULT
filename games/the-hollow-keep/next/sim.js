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
      ethan: { width: 42, height: 68, runSpeed: 2.95, airControlSpeed: 1.33, climbSpeed: 2, stopTicks: 8,
        accelerationGround: .42, accelerationAir: .22, friction: .82,
        gravity: .70, jumpHeight: 80, variableJump: true, minJumpHeight: 34,
        maxFall: 13.5, coyoteTicks: 6, jumpBufferTicks: 7,
        weapon: { kind: 'projectile', damage: 22, range: 1017.6, cooldownTicks: 29,
          speed: 10.6, width: 18, height: 12, activeTicks: 96 } },
      noah: { width: 39, height: 64, runSpeed: 3.85, airControlSpeed: 1.73, climbSpeed: 2.4, stopTicks: 5,
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
  function createWorld({ room, spawn, area, hero = 'ethan' }) {
    if (area) return createArea(area, hero);
    const c = CONFIG.heroes[hero];
    if (!c) throw new Error('Unknown hero: ' + hero);
    const r = copy(room);
    r.solids = r.solids || []; r.dummies = r.dummies || [];
    const player = { x: spawn.x, y: spawn.y, w: c.width, h: c.height,
      vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuffer: 0,
      jumpStartFeet: null, jumpCut: false, takeoffVx: 0, jumpKind: null, climbing: false, dropTicks: 0 };
    player.onGround = supported(player, r.solids);
    return { tick: 0, active: hero, room: r, player, dummies: r.dummies,
      previous: {}, swapCooldown: 0, attackCooldowns: { ethan: 0, noah: 0 }, attacks: [], nextAttackId: 1 };
  }
  // Area state is owned by the world; the legacy one-room path stays independent.
  function createArea(data, hero) {
    const area=copy(data), rooms={}, tile=area.tile;
    for(const [id,r] of Object.entries(area.rooms)) {
      const walls=[],platforms=[],ladders=[];
      r.grid.forEach((row,y)=>[...row].forEach((ch,x)=>{
        const box={x:x*tile,y:y*tile,w:tile,h:tile};
        if(ch==='#')walls.push(box);
        if(ch==='-')platforms.push({...box,h:1,oneway:true});
      }));
      for(let x=0;x<area.cols;x++)for(let y=0;y<area.rows;y++)if(r.grid[y][x]==='H'&&(y===0||r.grid[y-1][x]!=='H')){
        let end=y;while(end<area.rows&&r.grid[end][x]==='H')end++;
        const above=Object.values(area.rooms).find(other=>other.pos[0]===r.pos[0]&&other.pos[1]===r.pos[1]-1);
        const openTop=!!(above&&r.grid[0][x]!=='#'&&above.grid[area.rows-1][x]==='H');
        ladders.push({x:x*tile,y:y*tile,w:tile,h:(end-y)*tile,openTop});
        if(y>0&&!openTop)platforms.push({x:x*tile,y:y*tile,w:tile,h:1,oneway:true});
      }
      const objects=(r.objects||[]).map(o=>({...o,cellX:o.x,cellY:o.y,x:o.x*tile,y:o.y*tile,w:(o.w||1)*tile,h:(o.h||(o.type==='target'?2:1))*tile}));
      rooms[id]={width:area.cols*tile,height:area.rows*tile,name:r.name,grid:r.grid,pos:r.pos,objects,walls,solids:walls.slice(),platforms,ladders,dummies:objects.filter(o=>o.type==='target')};
    }
    const start=area.start,w=createWorld({room:rooms[start.room],spawn:start,hero});
    Object.assign(w,{area,areaRooms:rooms,roomId:start.room,visited:{[start.room]:true},flags:{switches:{},doors:{},broken:{},keys:{},picked:{},cleared:{}}});
    w.room=rooms[w.roomId];w.dummies=w.room.dummies;refreshArea(w);w.player.onGround=supported(w.player,[...w.room.solids,...w.room.platforms]);return w;
  }
  function refreshArea(w, ev=[]) {
    for(const room of Object.values(w.areaRooms))for(const o of room.objects)if(o.type==='target'&&o.hp<=0)w.flags.cleared[o.id]=true;
    for(const room of Object.values(w.areaRooms)) {
      room.solids=room.walls.slice();
      for(const o of room.objects) {
        if(o.type==='door'&&!w.flags.doors[o.id]) {
          const c=o.open,ready=c.switch?w.flags.switches[c.switch]:c.cleared?c.cleared.every(id=>w.flags.cleared[id]):false;
          if(ready){w.flags.doors[o.id]=true;ev.push({type:'door',id:o.id});}
        }
        if(o.type==='door'&&!w.flags.doors[o.id])room.solids.push({...o});
        if(o.type==='breakable'&&!w.flags.broken[o.id])room.solids.push({...o,breakable:o.id});
      }
    }
  }
  function interact(w, held, edge, ev) {
    const p=w.player,f=w.flags;
    for(const o of w.room.objects) {
      if(o.type==='switch'&&edge('interact')&&overlap(p,o)&&!f.switches[o.id]) {
        if(o.hero&&o.hero!==w.active)ev.push({type:'denied',id:o.id});
        else {f.switches[o.id]=true;ev.push({type:'switch',id:o.id});}
      }
      if(o.type==='key'&&!f.picked[o.id]&&overlap(p,o)){f.picked[o.id]=true;f.keys[o.name]=(f.keys[o.name]||0)+1;ev.push({type:'pickup',id:o.id,name:o.name});}
      if(o.type==='door'&&o.open.key&&!f.doors[o.id]&&(f.keys[o.open.key]||0)>0&&overlap({...p,x:p.x-1,y:p.y-1,w:p.w+2,h:p.h+2},o)) {
        f.keys[o.open.key]--;f.doors[o.id]=true;ev.push({type:'door',id:o.id});
      }
    }
  }
  function climb(w,held,edge,ev,c) {
    const p=w.player,center=p.x+p.w/2,feet=p.y+p.h;
    const ladder=w.room.ladders.find(l=>center>=l.x&&center<l.x+l.w&&p.y<l.y+l.h&&feet>=l.y-.01);
    if(p.climbing&&edge('jump')){p.climbing=false;p.onGround=true;return false;}
    if(!p.climbing&&ladder&&!edge('jump')&&(held.down||(held.up&&feet>ladder.y+.01)))p.climbing=true;
    if(!p.climbing)return false;
    if(!ladder){p.climbing=false;return false;}
    p.x=ladder.x+(ladder.w-p.w)/2;p.vx=0;p.vy=(Number(!!held.down)-Number(!!held.up))*c.climbSpeed;
    // A one-cell ladder portal is narrower than the hero's shoulder width.
    // Use its center lane through boundary masonry while attached.
    const solids=w.room.solids.filter(s=>!!s.type||!((ladder.openTop&&s.y===0)||(ladder.y+ladder.h>=w.room.height&&s.y===w.room.height-w.area.tile)));
    move(p,solids);
    if(held.up&&!ladder.openTop&&ladder.y>0&&p.y+p.h<=ladder.y){p.y=ladder.y-p.h;p.vy=0;p.climbing=false;p.onGround=true;}
    if(p.onGround&&held.down)p.climbing=false;
    return true;
  }
  function transition(w,ev) {
    const p=w.player,r=w.room,cx=p.x+p.w/2,cy=p.y+p.h/2;
    const dir=cx<0?'left':cx>r.width?'right':cy<0?'up':cy>r.height?'down':null;
    if(!dir)return;
    const delta={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[dir];
    const pos=w.area.rooms[w.roomId].pos;
    const entry=Object.entries(w.area.rooms).find(([,next])=>next.pos[0]===pos[0]+delta[0]&&next.pos[1]===pos[1]+delta[1]);
    if(!entry)return;
    const from=w.roomId;w.roomId=entry[0];p.x-=delta[0]*r.width;p.y-=delta[1]*r.height;
    w.room=w.areaRooms[w.roomId];w.dummies=w.room.dummies;w.visited[w.roomId]=true;w.attacks=[];
    ev.push({type:'room',from,to:w.roomId,dir});
  }
  function move(p, solids, platforms = []) {
    let dx = p.vx;
    for (const s of solids) if (vertical(p, s)) {
      if (dx > 0 && p.x + p.w <= s.x && p.x + p.w + dx >= s.x) dx = Math.min(dx, s.x - p.x - p.w);
      if (dx < 0 && p.x >= s.x + s.w && p.x + dx <= s.x + s.w) dx = Math.max(dx, s.x + s.w - p.x);
    }
    p.x += dx; if (dx !== p.vx) p.vx = 0;
    let dy = p.vy;
    p.onGround = false;
    for (const s of [...solids, ...(p.dropTicks ? [] : platforms)]) if (horizontal(p, s)) {
      if (dy >= 0 && p.y + p.h <= s.y && p.y + p.h + dy >= s.y) {
        dy = Math.min(dy, s.y - p.y - p.h); p.onGround = true;
      }
      if (!s.oneway && dy < 0 && p.y >= s.y + s.h && p.y + dy <= s.y + s.h) dy = Math.max(dy, s.y + s.h - p.y);
    }
    p.y += dy; if (dy !== p.vy || p.onGround) p.vy = 0;
  }
  function step(w, held = {}) {
    const ev = [], p = w.player;
    const edge = key => !!held[key] && !w.previous[key];
    w.tick++;
    if (w.area) refreshArea(w);
    p.dropTicks = Math.max(0, p.dropTicks - 1);
    w.swapCooldown = Math.max(0, w.swapCooldown - 1);
    for (const key of Object.keys(w.attackCooldowns)) w.attackCooldowns[key] = Math.max(0, w.attackCooldowns[key] - 1);
    if (edge('swap') && !w.swapCooldown) {
      const from = w.active, to = from === 'ethan' ? 'noah' : 'ethan', c = CONFIG.heroes[to];
      const candidate = { x: p.x + (p.w - c.width) / 2, y: p.y + p.h - c.height, w: c.width, h: c.height };
      const blocked = body => w.room.solids.some(s => overlap(body, s));
      if (blocked(candidate)) {
        // Widening at a wall may overlap by half the width difference. Try only
        // nearby solid boundaries, in order of the smallest sideways correction.
        const limit = Math.abs(c.width - p.w), centeredX = candidate.x;
        const offsets = w.room.solids.filter(s => vertical(candidate, s))
          .flatMap(s => [s.x - candidate.w - centeredX, s.x + s.w - centeredX])
          .filter(dx => Math.abs(dx) > 0 && Math.abs(dx) <= limit)
          .sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
        for (const dx of offsets) {
          const shifted = { ...candidate, x: centeredX + dx };
          if (!blocked(shifted)) { candidate.x = shifted.x; break; }
        }
      }
      if (!blocked(candidate)) {
        Object.assign(p, candidate); p.vx *= CONFIG.swapVelocityScale; p.vy *= CONFIG.swapVelocityScale;
        w.active = to; w.swapCooldown = CONFIG.swapCooldownTicks;
        w.attacks = w.attacks.filter(a => a.kind === 'projectile');
        ev.push({ type: 'swap', from, to });
      } else ev.push({ type: 'swapBlocked' });
    }
    const c = CONFIG.heroes[w.active];
    let climbing = false;
    if (w.area) climbing = climb(w, held, edge, ev, c);
    const dropping = w.area && edge('jump') && held.down && p.onGround && supported(p, w.room.platforms);
    if (dropping) { p.dropTicks = 14; p.onGround = false; p.coyote = 0; p.jumpBuffer = 0; p.y += .01; }
    const wasGround = p.onGround;
    if (!climbing) {
    p.coyote = wasGround ? c.coyoteTicks : Math.max(0, p.coyote - 1);
    p.jumpBuffer = edge('jump') ? c.jumpBufferTicks : Math.max(0, p.jumpBuffer - 1);
    const jump = () => {
      p.takeoffVx = p.vx;
      p.jumpKind = Math.abs(p.takeoffVx) >= c.runSpeed * .5 ? 'running' : 'standing';
      p.vy = -launchSpeed(c.jumpHeight, c.gravity); p.jumpStartFeet = p.y + p.h;
      p.jumpCut = false; p.onGround = false; p.coyote = 0; p.jumpBuffer = 0;
      ev.push({ type: 'jump' });
    };
    if (!dropping && (edge('jump') || p.jumpBuffer > 0) && (wasGround || p.coyote > 0)) jump();
    if (c.variableJump && !held.jump && p.vy < 0 && !p.jumpCut && p.jumpStartFeet !== null) {
      const risen = p.jumpStartFeet - (p.y + p.h);
      p.vy = Math.max(p.vy, -launchSpeed(Math.max(0, c.minJumpHeight - risen), c.gravity)); p.jumpCut = true;
    }
    const dir = Number(!!held.right) - Number(!!held.left);
    if (dir) p.face = dir;
    const accel = p.onGround ? c.accelerationGround : c.accelerationAir;
    const launchDir = Math.sign(p.takeoffVx);
    const forwardCap = Math.max(c.airControlSpeed, Math.abs(p.takeoffVx));
    const cap = p.onGround ? c.runSpeed : dir && dir === launchDir ? forwardCap : c.airControlSpeed;
    p.vx += (dir * cap - p.vx) * accel;
    if (!p.onGround && dir) {
      const leftCap = launchDir < 0 ? forwardCap : c.airControlSpeed;
      const rightCap = launchDir > 0 ? forwardCap : c.airControlSpeed;
      p.vx = Math.max(-leftCap, Math.min(rightCap, p.vx));
    }
    if (!dir) {
      p.vx *= c.friction;
      // This linear cap guarantees the declared maximum stopping time even in air.
      p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - c.runSpeed / c.stopTicks);
    }
    p.vy = Math.min(c.maxFall, p.vy + c.gravity);
    move(p, w.room.solids, w.room.platforms);
    if (p.onGround) { p.jumpKind = null; p.takeoffVx = 0; }
    else if (wasGround && p.jumpKind === null) p.takeoffVx = p.vx; // Preserve ledge momentum until a coyote jump records its own speed.
    if (!wasGround && p.onGround) {
      ev.push({ type: 'land' });
      if (p.jumpBuffer > 0) jump();
    }
    }
    if (w.area) { transition(w, ev); interact(w, held, edge, ev); refreshArea(w, ev); }
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
      // Resolve a swept shot by spatial order, independent of room array order.
      // At the same distance a solid wins, so a target inside a wall is protected.
      const distanceTo = box => a.face > 0 ? box.x - hitbox.x : hitbox.x + hitbox.w - (box.x + box.w);
      const targets = w.dummies.filter(d => d.hp > 0 && !a.hit.includes(d.id) && overlap(hitbox, d));
      if (a.kind === 'projectile') {
        const contacts = [
          ...w.room.solids.filter(s => overlap(hitbox, s)).map(box => ({ box, solid: true })),
          ...targets.map(box => ({ box, solid: false }))
        ].sort((one, two) => Math.max(0, distanceTo(one.box)) - Math.max(0, distanceTo(two.box)) || Number(two.solid) - Number(one.solid));
        const first = contacts[0];
        if (first) {
          if (first.solid && first.box.breakable && w.area) { w.flags.broken[first.box.breakable] = true; ev.push({type:'break',id:first.box.breakable}); }
          if (!first.solid) {
            first.box.hp = Math.max(0, first.box.hp - a.damage);
            ev.push({ type: 'hit', target: first.box.id, damage: a.damage });
          }
          a.life = 0; delete a.sweep; continue;
        }
      } else {
        if (w.area) for (const box of w.room.solids) if (box.breakable && !a.hit.includes(box.breakable) && overlap(hitbox,box)) {
          a.hit.push(box.breakable);w.flags.broken[box.breakable]=true;ev.push({type:'break',id:box.breakable});
        }
        for (const d of targets) {
        a.hit.push(d.id); d.hp = Math.max(0, d.hp - a.damage);
        ev.push({ type: 'hit', target: d.id, damage: a.damage });
      }
      }
      a.life--;
      if (a.kind === 'projectile' && a.traveled >= a.range) a.life = 0;
      delete a.sweep;
    }
    if (w.area) refreshArea(w, ev);
    w.previous = Object.fromEntries(['left','right','up','down','jump','attack','swap','interact'].map(k => [k, !!held[k]]));
    return ev;
  }
  return { TICK, CONFIG, createWorld, step, getPlayer: w => w.player,
    getMap: w => ({current:w.roomId,rooms:w.area?Object.entries(w.area.rooms).map(([id,r])=>({id,pos:copy(r.pos),visited:!!w.visited[id]})):[]}),
    getFlags: w => copy(w.flags||{switches:{},doors:{},broken:{},keys:{},picked:{},cleared:{}}),
    getHitboxes: w => w.attacks.filter(a => a.life > 0).map(a => ({ x: a.x, y: a.y, w: a.w, h: a.h })),
    snapshot: w => copy(w) };
});
