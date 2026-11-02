(function () {
  'use strict';
  window.HKRender = function (canvas) {
    const ctx = canvas.getContext('2d');
    let previousWorld = null, visual = {};
    function backing() {
      const box = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      const scale = HKPixel.status().scale, unit = 960 * scale;
      const k = Math.max(1, Math.ceil(Math.max(box.width * dpr / unit, box.height * dpr / (540 * scale)) - 1e-9));
      if (canvas.width !== unit * k || canvas.height !== 540 * scale * k) { canvas.width = unit * k; canvas.height = 540 * scale * k; }
      ctx.setTransform(k * scale, 0, 0, k * scale, 0, 0); ctx.imageSmoothingEnabled = false;
    }
    function timed(anim, age) {
      const ticks = anim.ticks || Array(anim.frames).fill(6), total = ticks.reduce((a,b)=>a+b,0);
      let t = anim.loop ? age % total : Math.min(age,total-1);
      for(let i=0;i<ticks.length;i++){if(t<ticks[i])return i;t-=ticks[i];}
      return anim.frames-1;
    }
    function sprite(hero, action, frame, x, y, face) {
      const anim = HKPixel.manifest()?.heroes[hero]?.animations[action], img = anim && HKPixel.image(anim.file);
      if (!img) return false;
      const index = Math.min(anim.frames-1,Math.max(0,frame(anim)));
      const scale=HKPixel.status().scale;
      ctx.save();ctx.translate(Math.round(x*scale)/scale,Math.round(y*scale)/scale);ctx.scale(face,1);
      ctx.drawImage(img,index*anim.frameW,0,anim.frameW,anim.frameH,-anim.pivot.x/scale,-anim.pivot.y/scale,anim.frameW/scale,anim.frameH/scale);
      ctx.restore();return true;
    }
    function tileBlock(block) {
      const tile = HKPixel.manifest()?.tiles, image = tile && HKPixel.image(tile.file);
      if (!image) return false;
      const x=Math.round(block.x),y=Math.round(block.y),w=Math.round(block.w),h=Math.round(block.h);
      for(let row=0;row<h;row+=30)for(let col=0;col<w;col+=30){
        const cell=tile.cells[h<=16?'ledge':row===0?'floor-top':'wall-fill'];
        const cw=Math.min(30,w-col),ch=Math.min(30,h-row);
        const scale=HKPixel.status().scale;
        ctx.drawImage(image,cell[0]*30*scale,cell[1]*30*scale,cw*scale,ch*scale,x+col,y+row,cw,ch);
      }
      return true;
    }
    const backdrop = new Image(); backdrop.src = '../assets/title-keep-v1.webp';
    function areaCell(name,x,y,h=30) {
      const tiles=HKPixel.manifest()?.tiles,cell=tiles?.cells[name],image=tiles&&HKPixel.image(tiles.file),scale=HKPixel.status().scale;
      if(image&&cell)ctx.drawImage(image,cell[0]*60,cell[1]*60,60,h*scale,x,y,30,h);
      else {ctx.fillStyle=name==='ladder'?'#726349':'#2b374b';ctx.fillRect(x,y,30,h);}
    }
    function areaObjects(world) {
      const flags=HKSim.getFlags(world),objects=HKPixel.manifest()?.objects||{};
      function prop(name,x,y,w,h){const art=objects[name],image=art&&HKPixel.image(art.file);if(!image)return false;ctx.drawImage(image,art.x,art.y,art.w,art.h,x,y,w,h);return true;}
      for(const o of world.room.objects){
        if(o.type==='target'||o.type==='key'&&flags.picked[o.id]||o.type==='breakable'&&flags.broken[o.id])continue;
        if(o.type==='door'){
          if(flags.doors[o.id])continue;
          const g=world.room.grid,c=o.cellX,r=o.cellY,cols=o.w/30;
          const vertical=Array.from({length:cols},(_,i)=>i+c).every(x=>g[r-1]?.[x]==='#'&&(r+o.h/30>=18||g[r+o.h/30]?.[x]==='#'));
          const kind=vertical?'barrier-v':'barrier-h';
          for(let y=0;y<o.h;y+=30)for(let x=0;x<o.w;x+=30)if(!prop(kind,o.x+x,o.y+y,30,30)){ctx.fillStyle='#566579';ctx.fillRect(o.x+x,o.y+y,30,30);}
          const source=o.open.switch&&Object.values(world.areaRooms).flatMap(room=>room.objects).find(s=>s.id===o.open.switch);
          const mark=o.open.key?'mark-key':o.open.cleared?'mark-target':source?.kind==='light'?'mark-light':'mark-lever';
          prop(mark,o.x+o.w/2-15,o.y+o.h/2-15,30,30);continue;
        }
        if(o.type==='breakable'){
          for(let y=0;y<o.h;y+=30)for(let x=0;x<o.w;x+=30)prop('breakable',o.x+x,o.y+y,30,30);
          continue;
        }
        if(o.type==='entrance'){
          const pair=Object.values(world.areaRooms).flatMap(room=>room.objects).find(other=>other.id===o.to);
          const locked=(o.lock||pair?.lock)&&!flags.unlocked[o.id];
          prop(locked?'entrance-locked':'entrance',o.x,o.y,o.w,o.h);text('↑ / E',o.x+8,o.y-6,'#c2c0cf',10);continue;
        }
        const name=o.type==='switch'?(o.kind==='light'?'light':'lever')+'-'+(flags.switches[o.id]?'on':'off'):o.type;
        if(!prop(name,o.x,o.y+o.h-45,30,45)){ctx.fillStyle='#68798c';ctx.fillRect(o.x,o.y,o.w,o.h);}
        if(o.type==='switch')text(o.hero?o.hero.toUpperCase()+' · E':'E',o.x-12,o.y-16,'#e4d5af',10);
      }
    }
    function text(label, x, y, color = '#b8b2bf', size = 12) {
      ctx.fillStyle = color; ctx.font = `${size}px system-ui`; ctx.fillText(label, x, y);
    }
    function draw(world, debug, effects) {
      backing();
      if(previousWorld!==world){visual={};previousWorld=world;}
      const p = HKSim.getPlayer(world), room = world.room;
      ctx.clearRect(0, 0, 960, 540); ctx.fillStyle = '#101320'; ctx.fillRect(0, 0, 960, 540);
      const background=HKPixel.manifest()?.background,pixelBackground=background&&HKPixel.image(background);
      if(!room.grid&&pixelBackground)ctx.drawImage(pixelBackground,0,0,960,540);
      else if (!room.grid&&backdrop.complete && backdrop.naturalWidth) {
        ctx.globalAlpha = .18; ctx.drawImage(backdrop, 0, 0, 960, 540); ctx.globalAlpha = 1;
      }
      if(!room.grid&&!pixelBackground)for (let x = 28; x < 960; x += 154) {
        ctx.strokeStyle = '#31313e'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, 480); ctx.lineTo(x, 170); ctx.quadraticCurveTo(x, 105, x + 59, 76);
        ctx.quadraticCurveTo(x + 118, 105, x + 118, 170); ctx.lineTo(x + 118, 480); ctx.stroke();
        ctx.strokeStyle = '#4b4250'; ctx.lineWidth = 1; ctx.stroke();
      }
      if(room.grid){
        const salt=[...world.roomId].reduce((sum,ch)=>sum+ch.charCodeAt(0),0),hash=(x,y)=>x*7+y*13+salt;
        const wall=(y,x)=>y<0||y>=18||x<0||x>=32||room.grid[y][x]==='#';
        // Mosaic layers: dark masonry, authored ornaments, then collision surfaces.
        room.grid.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='#')areaCell('back-'+(hash(x,y)%3+1),x*30,y*30);}));
        const back=room.back||world.area.rooms[world.roomId].back;
        if(back)back.forEach((row,y)=>[...row].forEach((ch,x)=>{
          if(ch==='.'||wall(y,x))return;
          if(ch==='c'){areaCell('candle',x*30,y*30);return;}
          const family={w:'window',p:'pillar',b:'banner'}[ch];if(!family)return;
          const part=back[y-1]?.[x]!==ch?'top':back[y+1]?.[x]!==ch?(ch==='p'?'base':'bottom'):'mid';
          areaCell(family+'-'+part,x*30,y*30);
        }));
        room.grid.forEach((row,y)=>[...row].forEach((ch,x)=>{
          if(ch==='#'){
            const tile=!wall(y-1,x)?'floor-top':!wall(y+1,x)?'wall-bottom':!wall(y,x-1)?'wall-left':!wall(y,x+1)?'wall-right':hash(x,y)%2?'wall-fill':'wall-fill-2';
            areaCell(tile,x*30,y*30);
          }
          if(ch==='-')areaCell('ledge',x*30,y*30,16);
          if(ch==='H')areaCell('ladder',x*30,y*30);
        }));
        areaObjects(world);text(room.name,42,53,'#e0c78f',16);
      }
      for (const s of room.grid?[]:room.solids) {
        if(tileBlock(s))continue;
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
      let action = p.climbing ? 'climb' : p.onGround ? Math.abs(p.vx)>.1?'run':'idle' : p.jumpKind==='running'?'jump-running':'jump-standing';
      const state=visual[world.active]||{},anims=HKPixel.manifest()?.heroes[world.active]?.animations;
      const duration=name=>anims?.[name]?.ticks?.reduce((a,b)=>a+b,0)||({attack:20,land:8}[name]||0);
      if(state.attack!==undefined&&world.tick-state.attack<duration('attack'))action='attack';
      else if(p.onGround&&state.land!==undefined&&world.tick-state.land<duration('land'))action='land';
      const age=action==='attack'?world.tick-state.attack:action==='land'?world.tick-state.land:world.tick;
      const frame=anim=>action==='climb'?Math.floor((p.climbDistance||0)/8)%anim.frames:action.startsWith('jump-')?(p.vy < -1?0:p.vy > 1?2:1):timed(anim,age);
      const attackIndex=action==='attack'&&anims?.attack?timed(anims.attack,age):-1;
      const displayFace=action==='attack'?(state.attackFace??p.face):p.face;
      if(!sprite(world.active,action,frame,p.x+p.w/2,p.y+p.h,displayFace)){
        // Preserve geometric fallback when the current animation cannot be loaded.
        ctx.save();ctx.translate(p.x + p.w / 2, p.y + p.h);ctx.scale(p.face,1);
        if (!p.onGround && p.jumpKind === 'running') ctx.rotate(.16 * Math.sign(p.takeoffVx) * p.face);
        ctx.fillStyle = light ? '#bfb7a8' : '#524566';
        ctx.beginPath();ctx.moveTo(-p.w*.42,-p.h*.7);ctx.lineTo(p.w*.3,-p.h*.7);ctx.lineTo(p.w*.5,-8);ctx.lineTo(-p.w*.5,-8);ctx.closePath();ctx.fill();
        ctx.fillStyle = '#222539';ctx.fillRect(-12,-12,9,12);ctx.fillRect(6,-12,9,12);
        ctx.fillStyle = light ? '#e6cca4' : '#bdc8d7';ctx.fillRect(-10,-p.h,21,20);
        ctx.fillStyle = light ? '#f4cf76' : '#89d7e7';ctx.fillRect(-p.w*.42,-p.h*.66,p.w*.74,5);ctx.fillRect(4,-p.h+7,12,3);
        ctx.restore();
      }
      for (const a of world.attacks.filter(a => a.life > 0)) {
        const fx=a.kind==='projectile'?'fx-rune':'fx-slash';
        if(a.kind==='melee'){
          // One arc, only during the visible attack swing, rooted at its hand.
          // Trial sets without attack/fx keep their geometric fallback below.
          const animation=anims?.attack,arc=anims?.['fx-slash'];
          if(a.hero!==world.active||action!=='attack'||age<(animation?.ticks?.[0]??2))continue;
          if(animation&&arc&&HKPixel.image(animation.file)&&HKPixel.image(arc.file)){
            const start=animation.ticks[0],fxAge=age-start;
            const life=arc.ticks.reduce((total,ticks)=>total+ticks,0);
            if(a.hero!==world.active||action!=='attack'||attackIndex<1||fxAge<0||fxAge>=life)continue;
            const hand=animation.hands?.[attackIndex]||{x:animation.pivot.x+32,y:animation.pivot.y-70};
            const scale=HKPixel.status().scale;
            const handX=p.x+p.w/2+(hand.x-animation.pivot.x)/scale*displayFace;
            const handY=p.y+p.h+(hand.y-animation.pivot.y)/scale;
            sprite(a.hero,fx,anim=>timed(anim,fxAge),handX,handY,displayFace);
            continue;
          }
        }else if(sprite(a.hero,fx,anim=>timed(anim,world.tick),a.x+a.w/2,a.y+a.h/2,a.face))continue;
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
    }
    draw.event=(event,world)=>{
      if(previousWorld!==world){visual={};previousWorld=world;}
      const state = visual[world.active] ||= {};
      if(event.type==='room')visual={};
      if(event.type==='attack'){state.attack=world.tick;state.attackFace=world.player.face;}
      if(event.type==='land')state.land=world.tick;
    };
    return draw;
  };
})();
