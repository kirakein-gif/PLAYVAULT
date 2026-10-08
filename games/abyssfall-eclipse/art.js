(() => {
  'use strict';
  const art=window.AF_ART={images:{},loaded:{}};
  const paths={heroes:'../../assets/art/heroes-v4.webp',actions:'../../assets/art/actions-v4.webp',enemies:'../../assets/art/enemies-v2.webp',props:'../../assets/art/props-v1.webp',relics:'../../assets/art/relics-v5.webp',lavaFlow:'../../assets/art/lava-flow-v39.webp'};
  for(const zone of ['cathedral','graveyard','tower','abyss'])paths[zone]='../../assets/art/room-'+zone+'-v5.webp';
  for(const zone of ['ice','lava','sewer','rift'])paths[zone]='../../assets/art/floor-'+zone+'-v39.webp';
  art.ready=Promise.all(Object.entries(paths).map(([key,path])=>new Promise(resolve=>{
    const im=new Image();art.images[key]=im;
    im.onload=()=>{art.loaded[key]=true;if(key==='relics')relicIcons(im);resolve(true)};
    im.onerror=()=>{art.loaded[key]=false;resolve(false)};
    im.src=path+'?v=40';
  })));
  function relicIcons(im){
    art.relicIcons={};
    const ids=['relic-blade','dash-sigil','guardian-seal','resonance-core','condensed-crystal','twin-grail','abyss-mirror','pilgrim-lantern','red-vow','time-gear','solar-shard','eclipse-fang'];
    const frames=[[0,0,380,355],[405,10,355,345],[780,0,312,355],[1140,0,308,352],[42,361,310,363],[370,375,410,320],[807,355,272,372],[1140,355,308,360],[18,724,354,362],[382,703,386,383],[800,712,265,374],[1080,713,368,373]];
    art.relicFrames=Object.fromEntries(ids.map((id,i)=>[id,frames[i]]));
    ids.forEach((id,i)=>{
      const c=document.createElement('canvas'),[x,y,w,h]=frames[i];c.width=c.height=Math.max(w,h);
      const cc=c.getContext('2d'),dx=(c.width-w)/2,dy=(c.height-h)/2;
      if(id==='solar-shard'){
        // The mirror's handle crosses the atlas gutter above the shard.
        cc.beginPath();cc.moveTo(dx+65,dy);cc.lineTo(dx+w,dy);cc.lineTo(dx+w,dy+h);cc.lineTo(dx,dy+h);cc.lineTo(dx,dy+80);cc.closePath();cc.clip();
      }
      cc.drawImage(im,x,y,w,h,dx,dy,w,h);
      art.relicIcons[id]=c.toDataURL('image/png');
    });
  }
  // Cache complete rooms. Door patches share the background's camera and stonework.
  const rows=[[0,544,1115,1717],[0,572,1144,1717],[0,530,1070,1642],[0,572,1144,1717]],scenes=new Map(),panels=new Map();
  art.ready.then(()=>scenes.clear());
  const floorEdges=[[[.28,.82],[.32,.82],[.32,.79]],[[.32,.79],[.32,.79],[.32,.79]],[[.25,.80],[.29,.81],[.28,.77]],[[.28,.74],[.28,.76],[.28,.75]]];
  const zones=['cathedral','graveyard','tower','abyss'];
  art.baseZone=zone=>zone<4?zone:[0,0,0,3][zone-4];
  const patches={N:[.39,0,.22,.28],W:[0,.24,.10,.43],E:[.90,.24,.10,.43],S:[.40,.82,.20,.18]};
  function alignedPanel(zone,panel){
    const key=zone+':'+panel;if(panels.has(key))return panels.get(key);
    const im=art.images[zones[zone]],ys=rows[zone],c=document.createElement('canvas');c.width=916;c.height=572;
    const cc=c.getContext('2d'),[start,end]=floorEdges[zone][panel],src=[0,start,end,1],dst=[0,.28,.82,1],height=ys[panel+1]-ys[panel];
    for(let i=0;i<3;i++)cc.drawImage(im,0,ys[panel]+src[i]*height,im.width,(src[i+1]-src[i])*height,0,dst[i]*c.height,c.width,(dst[i+1]-dst[i])*c.height);
    panels.set(key,c);return c;
  }
  // Open-wall masonry is permanent. Only a door leaf covers the aperture.
  const sideApertures=[{W:[42,148,35,116],E:[837,149,36,116]},{W:[42,196,32,111],E:[842,195,33,111]},{W:[50,196,33,104],E:[836,195,32,106]},{W:[39,175,36,133],E:[839,175,36,133]}];
  const doorWood=[[431,1195,48,63],[435,1248,48,43],[432,1150,45,45],[432,1218,48,56]];
  function panelY(zone,y){
    const [start,end]=floorEdges[zone][1],height=rows[zone][2]-rows[zone][1],u=y/height;
    return 572*(u<start?u/start*.28:u<end?.28+(u-start)/(end-start)*.54:.82+(u-end)/(1-end)*.18);
  }
  art.sideAperture=(zone,d)=>{
    zone=art.baseZone(zone);
    const [x,y,w,h]=sideApertures[zone][d];return{x,y:panelY(zone,y),w,h:panelY(zone,y+h)-panelY(zone,y)};
  };
  function sideLeaf(cc,zone,d){
    const {x,y,w,h}=art.sideAperture(zone,d),west=d==='W';
    cc.save();cc.beginPath();
    cc.moveTo(x,y+h*.30);cc.bezierCurveTo(x+w*.08,y+h*.12,x+w*.37,y+h*.01,x+w*.55,y);
    cc.bezierCurveTo(x+w*.76,y+h*.05,x+w*.96,y+h*.18,x+w,y+h*.29);
    cc.lineTo(x+w,y+h*(west?1:.92));cc.lineTo(x,y+h*(west?.92:1));cc.closePath();cc.clip();
    cc.drawImage(art.images[zones[zone]],...doorWood[zone],x,y,w,h);
    cc.fillStyle='rgba(9,8,10,.25)';cc.fillRect(x,y,w,h);
    cc.strokeStyle='#343338';cc.lineWidth=2;
    for(const t of [.40,.73]){cc.beginPath();cc.moveTo(x,y+h*t);cc.lineTo(x+w,y+h*(t+(west?.05:-.05)));cc.stroke()}
    cc.restore();
  }
  function southPassage(cc,zone){
    // A break through the foreground wall, with stone steps descending out of view.
    const x=407,y=475,w=102,h=97,base=alignedPanel(zone,1);
    cc.save();cc.beginPath();cc.rect(x,y,w,h);cc.clip();
    cc.fillStyle='#090a0c';cc.fillRect(x,y,w,h);
    for(let i=0;i<8;i++){
      const yy=y+i*12,inset=i*.7;
      cc.drawImage(base,408,355,100,12,x+inset,yy,w-inset*2,10);
      cc.fillStyle='rgba(5,6,8,'+(.18+i*.065)+')';cc.fillRect(x+inset,yy,w-inset*2,12);
      cc.fillStyle='rgba(144,133,113,'+(.28-i*.025)+')';cc.fillRect(x+inset,yy,w-inset*2,1);
    }
    cc.restore();
  }
  art.room=(zone,room,isOpen)=>{
    const region=zone;zone=art.baseZone(zone);const key=zones[zone];if(!art.loaded[key])return null;
    const states=['N','W','E','S'].map(d=>!room.doors[d]?0:isOpen(d,room)?1:2),cache=region+':'+states.join('');
    if(scenes.has(cache))return scenes.get(cache);
    const c=document.createElement('canvas');c.width=916;c.height=572;
    const cc=c.getContext('2d');cc.drawImage(alignedPanel(zone,1),0,0);
    ['N','W','E','S'].forEach((d,i)=>{
      if(states[i]===1)return;
      if(states[i]===2&&(d==='W'||d==='E')){sideLeaf(cc,zone,d);return}
      const panel=states[i]===0?0:2,[x,y,w,h]=patches[d],p=document.createElement('canvas');
      p.width=Math.round(w*c.width);p.height=Math.round(h*c.height);const pc=p.getContext('2d');
      pc.drawImage(alignedPanel(zone,panel),x*c.width,y*c.height,w*c.width,h*c.height,0,0,p.width,p.height);
      // Feather only the join, retaining sharp stone, arch, door and passage detail.
      pc.globalCompositeOperation='destination-in';
      for(const vertical of [false,true]){
        const size=vertical?p.height:p.width,g=pc.createLinearGradient(0,0,vertical?0:size,vertical?size:0),edge=Math.min(.12,10/size);
        g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(edge,'#000');g.addColorStop(1-edge,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
        pc.fillStyle=g;pc.fillRect(0,0,p.width,p.height);
      }
      cc.drawImage(p,x*c.width,y*c.height);
    });
    // Every room uses exactly the same playable floor, including its borders.
    // Alternate wall paintings may only affect the passage recesses.
    const floor=alignedPanel(zone,1);
    cc.drawImage(floor,.10*c.width,.28*c.height,.80*c.width,.54*c.height,
      .10*c.width,.28*c.height,.80*c.width,.54*c.height);
    if(states[3]===0){
      // Repeat neighboring intact masonry instead of the atlas's ambiguous central steps.
      cc.drawImage(alignedPanel(zone,0),250,469,122,103,397,469,122,103);
    }else if(states[3]===1)southPassage(cc,zone);
    if(region>=4){
      // Tint the entire fixed masonry, so door leaves and jambs retain one palette.
      const filters=['saturate(.65) hue-rotate(165deg) brightness(.87)','sepia(.28) saturate(1.15) brightness(.81)','saturate(.65) hue-rotate(60deg) brightness(.80)','saturate(.65) hue-rotate(250deg) brightness(.74)'];
      const copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;copy.getContext('2d').drawImage(c,0,0);
      cc.filter=filters[region-4];cc.drawImage(copy,0,0);cc.filter='none';
      const texture=['ice','lava','sewer','rift'][region-4];
      if(art.loaded[texture]){
        cc.save();cc.beginPath();cc.rect(.10*c.width,.28*c.height,.80*c.width,.54*c.height);cc.clip();
        // Texture rows widen toward the camera. Fixed across every door configuration.
        const im=art.images[texture],height=.54*c.height;
        for(let row=0;row<Math.ceil(height);row++){
          const t=row/height,zoom=1-t*.38,sw=im.width*zoom,sy=(t-.19*t*t)/.81*im.height,sh=Math.min(im.height-sy,zoom/.81*im.height/height);
          cc.drawImage(im,(im.width-sw)/2,sy,sw,sh, .10*c.width,.28*c.height+row,.80*c.width,1.2);
        }
        const shade=cc.createLinearGradient(0,.28*c.height,0,.82*c.height);shade.addColorStop(0,'rgba(4,8,12,.48)');shade.addColorStop(.35,'rgba(4,8,12,.04)');shade.addColorStop(1,'rgba(4,8,12,.24)');cc.fillStyle=shade;cc.fillRect(.10*c.width,.28*c.height,.80*c.width,height);cc.restore();
      }
    }
    if(scenes.size>=24)scenes.delete(scenes.keys().next().value);
    scenes.set(cache,c);return c;
  };
  // Authored sampling rectangles: the generated sheet does not use uniform rows.
  const heroRows=[0,278,512,773,1024],heroEdges=[0,256,512,768,1024,1280,1536];
  const heroFeet=[[264,264,264,263,264,264],[219,219,219,223,223,223],[250,250,250,250,250,253],[222,221,219,224,224,224]];
  const heroTorso=[[145,389,629,889,1140,1410],[146,389,641,889,1144,1420],[143,387,626,888,1140,1404],[143,388,640,888,1140,1410]];
  art.hero=(key,anim,index)=>{
    if((anim==='attack'||anim==='death')&&art.loaded.actions){
      const row=(key==='dawn'?0:2)+(anim==='death'?1:0),col=Math.min(3,index);
      const edges=[[0,315,630,975,1254],[0,315,630,950,1254],[0,315,630,975,1254],[0,315,630,950,1254]];
      const xs=edges[row],ys=[0,340,625,980,1254];
      const pivot=[[157,482,795,1125],[154,462,772,1094],[156,481,795,1129],[155,463,775,1095]];
      const feet=[[318,318,321,320],[251,248,253,250],[325,325,325,325],[226,220,224,223]];
      return {image:'actions',x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row],pivot:pivot[row][col]-xs[col],foot:feet[row][col],scale:key==='dawn'?.73:.72};
    }
    const base=key==='dawn'?0:2;
    let row=base,col=index;
    if(anim==='run')row++;
    else if(anim==='hurt')col=4;
    else if(anim==='death')col=index===0?4:5;
    else if(anim==='attack')col=Math.min(3,index);
    return {image:'heroes',x:heroEdges[col],y:heroRows[row],w:heroEdges[col+1]-heroEdges[col],h:heroRows[row+1]-heroRows[row],pivot:heroTorso[row][col]-heroEdges[col],foot:heroFeet[row][col],scale:key==='dawn'?.78:.81};
  };
  const enemyRows=[0,215,455,640,1024];
  const enemyFeet=[[197,195,197,196,196,197],[228,226,230,227,229,229],[178,177,178,182,179,183],[355,348,354,350,352,361]];
  art.enemy=(type,col)=>{
    const row={crawler:0,shooter:1,brute:2,boss:3}[type];
    return {x:col*256,y:enemyRows[row],w:256,h:enemyRows[row+1]-enemyRows[row],pivot:128,foot:enemyFeet[row][col]};
  };
  art.draw=(ctx,key,f,scale,ground)=>ctx.drawImage(art.images[key],f.x,f.y,f.w,f.h,-f.pivot*scale,ground-f.foot*scale,f.w*scale,f.h*scale);
})();
