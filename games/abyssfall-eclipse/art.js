(() => {
  'use strict';
  const art=window.AF_ART={images:{},loaded:{}};
  const paths={heroes:'../../assets/art/heroes-v4.webp',actions:'../../assets/art/actions-v4.webp',enemies:'../../assets/art/enemies-v2.webp',props:'../../assets/art/props-v1.webp',relics:'../../assets/art/relics-v5.webp',lavaFlow:'../../assets/art/lava-flow-v39.webp'};
  Object.assign(paths,{bossA:'../../assets/art/boss-a-v46.webp',bossB:'../../assets/art/boss-b-v46.webp',mobA:'../../assets/art/mob-a-v46.webp',mobB:'../../assets/art/mob-b-v46.webp'});
  Object.assign(paths,{"walkBossA": "../../assets/art/boss-a-walk-v47.webp", "walkBossB": "../../assets/art/boss-b-walk-v47.webp", "walkMobA": "../../assets/art/mob-a-walk-v47.webp", "walkMobB": "../../assets/art/mob-b-walk-v47.webp", "walkBase": "../../assets/art/enemies-walk-v47.webp"});
  for(const zone of ['cathedral','graveyard','tower','abyss'])paths[zone]='../../assets/art/room-'+zone+'-v5.webp';
  for(const zone of ['ice','lava','sewer','rift'])paths[zone]='../../assets/art/floor-'+zone+'-v39.webp';
  art.ready=Promise.all(Object.entries(paths).map(([key,path])=>new Promise(resolve=>{
    const im=new Image();art.images[key]=im;
    im.onload=()=>{art.loaded[key]=true;if(key==='relics')relicIcons(im);resolve(true)};
    im.onerror=()=>{art.loaded[key]=false;resolve(false)};
    im.src=path+'?v=48';
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
  art.regionalEnemy=(e,col)=>{
    const ids={skeleton:['mobA',0],gargoyle:['mobA',1],frostWolf:['mobA',2],frostKnight:['mobA',3],emberImp:['mobB',0],slagGuard:['mobB',1],plagueVermin:['mobB',2],voidKnight:['mobB',3]};
    const spec=e.type==='boss'?[e.tier<4?'bossA':'bossB',e.tier%4]:ids[e.variant];
    if(!spec||!art.loaded[spec[0]])return null;
    // Sample authored row boundaries so neighboring helmets never appear at the feet.
    const rows={bossA:[0,303,633,915,1254],bossB:[0,290,600,905,1254],mobA:[0,320,640,890,1254],mobB:[0,295,640,880,1254]};
    const feet={bossA:[298,326,279,305],bossB:[284,308,298,315],mobA:[309,301,244,330],mobB:[290,329,234,342]};
    const im=art.images[spec[0]],w=im.width/4,c=Math.min(3,col),row=spec[1],unit=im.height/1254;
    const y=rows[spec[0]][row]*unit,h=(rows[spec[0]][row+1]-rows[spec[0]][row])*unit;
    return {image:spec[0],x:c*w,y,w,h,pivot:w/2,foot:feet[spec[0]][row]*unit};
  };
  const walkFrames={"walkBossA":[[{"image":"walkBossA","x":0,"y":0,"w":256,"h":275,"pivot":164.0,"foot":267,"bodyHeight":235,"scale":0.785408},{"image":"walkBossA","x":288,"y":0,"w":224,"h":275,"pivot":136.0,"foot":269,"bodyHeight":233,"scale":0.785408},{"image":"walkBossA","x":544,"y":0,"w":224,"h":275,"pivot":139.0,"foot":267,"bodyHeight":235,"scale":0.785408},{"image":"walkBossA","x":800,"y":0,"w":224,"h":275,"pivot":125.0,"foot":268,"bodyHeight":233,"scale":0.785408},{"image":"walkBossA","x":1056,"y":0,"w":224,"h":275,"pivot":127.0,"foot":267,"bodyHeight":231,"scale":0.785408},{"image":"walkBossA","x":1312,"y":0,"w":224,"h":275,"pivot":130.0,"foot":267,"bodyHeight":233,"scale":0.785408}],[{"image":"walkBossA","x":0,"y":275,"w":256,"h":253,"pivot":203.0,"foot":250,"bodyHeight":248,"scale":0.794297},{"image":"walkBossA","x":288,"y":275,"w":224,"h":253,"pivot":169.0,"foot":250,"bodyHeight":246,"scale":0.794297},{"image":"walkBossA","x":544,"y":275,"w":224,"h":253,"pivot":150.0,"foot":247,"bodyHeight":245,"scale":0.794297},{"image":"walkBossA","x":800,"y":275,"w":224,"h":253,"pivot":156.0,"foot":249,"bodyHeight":246,"scale":0.794297},{"image":"walkBossA","x":1056,"y":275,"w":224,"h":253,"pivot":165.0,"foot":250,"bodyHeight":244,"scale":0.794297},{"image":"walkBossA","x":1312,"y":275,"w":224,"h":253,"pivot":142.0,"foot":248,"bodyHeight":236,"scale":0.794297}],[{"image":"walkBossA","x":0,"y":528,"w":256,"h":237,"pivot":163.0,"foot":237,"bodyHeight":233,"scale":0.782609},{"image":"walkBossA","x":288,"y":528,"w":224,"h":237,"pivot":139.0,"foot":237,"bodyHeight":230,"scale":0.782609},{"image":"walkBossA","x":544,"y":528,"w":224,"h":237,"pivot":134.0,"foot":237,"bodyHeight":233,"scale":0.782609},{"image":"walkBossA","x":800,"y":528,"w":224,"h":237,"pivot":127.0,"foot":237,"bodyHeight":230,"scale":0.782609},{"image":"walkBossA","x":1056,"y":528,"w":224,"h":237,"pivot":130.0,"foot":237,"bodyHeight":229,"scale":0.782609},{"image":"walkBossA","x":1312,"y":528,"w":224,"h":237,"pivot":119.0,"foot":237,"bodyHeight":229,"scale":0.782609}],[{"image":"walkBossA","x":0,"y":765,"w":256,"h":259,"pivot":164.0,"foot":237,"bodyHeight":237,"scale":0.774737},{"image":"walkBossA","x":288,"y":765,"w":224,"h":259,"pivot":136.0,"foot":238,"bodyHeight":238,"scale":0.774737},{"image":"walkBossA","x":544,"y":765,"w":224,"h":259,"pivot":131.0,"foot":237,"bodyHeight":237,"scale":0.774737},{"image":"walkBossA","x":800,"y":765,"w":224,"h":259,"pivot":126.0,"foot":239,"bodyHeight":239,"scale":0.774737},{"image":"walkBossA","x":1056,"y":765,"w":224,"h":259,"pivot":132.0,"foot":237,"bodyHeight":237,"scale":0.774737},{"image":"walkBossA","x":1312,"y":765,"w":224,"h":259,"pivot":124.0,"foot":238,"bodyHeight":238,"scale":0.774737}]],"walkBossB":[[{"image":"walkBossB","x":0,"y":0,"w":256,"h":260,"pivot":134.0,"foot":246,"bodyHeight":221,"scale":0.819005},{"image":"walkBossB","x":288,"y":0,"w":224,"h":260,"pivot":107.0,"foot":248,"bodyHeight":221,"scale":0.819005},{"image":"walkBossB","x":544,"y":0,"w":224,"h":260,"pivot":98.0,"foot":247,"bodyHeight":221,"scale":0.819005},{"image":"walkBossB","x":800,"y":0,"w":224,"h":260,"pivot":108.0,"foot":249,"bodyHeight":222,"scale":0.819005},{"image":"walkBossB","x":1056,"y":0,"w":224,"h":260,"pivot":112.0,"foot":248,"bodyHeight":219,"scale":0.819005},{"image":"walkBossB","x":1312,"y":0,"w":224,"h":260,"pivot":106.0,"foot":248,"bodyHeight":220,"scale":0.819005}],[{"image":"walkBossB","x":0,"y":260,"w":256,"h":255,"pivot":119.0,"foot":248,"bodyHeight":246,"scale":0.812371},{"image":"walkBossB","x":288,"y":260,"w":224,"h":255,"pivot":97.0,"foot":251,"bodyHeight":242,"scale":0.812371},{"image":"walkBossB","x":544,"y":260,"w":224,"h":255,"pivot":102.0,"foot":249,"bodyHeight":236,"scale":0.812371},{"image":"walkBossB","x":800,"y":260,"w":224,"h":255,"pivot":106.0,"foot":250,"bodyHeight":243,"scale":0.812371},{"image":"walkBossB","x":1056,"y":260,"w":224,"h":255,"pivot":108.0,"foot":250,"bodyHeight":243,"scale":0.812371},{"image":"walkBossB","x":1312,"y":260,"w":224,"h":255,"pivot":104.0,"foot":251,"bodyHeight":237,"scale":0.812371}],[{"image":"walkBossB","x":0,"y":515,"w":256,"h":240,"pivot":183.0,"foot":233,"bodyHeight":231,"scale":0.804396},{"image":"walkBossB","x":288,"y":515,"w":224,"h":240,"pivot":148.0,"foot":235,"bodyHeight":226,"scale":0.804396},{"image":"walkBossB","x":544,"y":515,"w":224,"h":240,"pivot":146.0,"foot":234,"bodyHeight":229,"scale":0.804396},{"image":"walkBossB","x":800,"y":515,"w":224,"h":240,"pivot":147.5,"foot":235,"bodyHeight":224,"scale":0.804396},{"image":"walkBossB","x":1056,"y":515,"w":224,"h":240,"pivot":156.0,"foot":236,"bodyHeight":230,"scale":0.804396},{"image":"walkBossB","x":1312,"y":515,"w":224,"h":240,"pivot":137.0,"foot":234,"bodyHeight":220,"scale":0.804396}],[{"image":"walkBossB","x":0,"y":755,"w":256,"h":269,"pivot":138.0,"foot":229,"bodyHeight":227,"scale":0.876652},{"image":"walkBossB","x":288,"y":755,"w":224,"h":269,"pivot":108.0,"foot":234,"bodyHeight":230,"scale":0.876652},{"image":"walkBossB","x":544,"y":755,"w":224,"h":269,"pivot":105.0,"foot":230,"bodyHeight":226,"scale":0.876652},{"image":"walkBossB","x":800,"y":755,"w":224,"h":269,"pivot":106.0,"foot":232,"bodyHeight":227,"scale":0.876652},{"image":"walkBossB","x":1056,"y":755,"w":224,"h":269,"pivot":119.0,"foot":233,"bodyHeight":227,"scale":0.876652},{"image":"walkBossB","x":1312,"y":755,"w":224,"h":269,"pivot":108.0,"foot":232,"bodyHeight":228,"scale":0.876652}]],"walkMobA":[[{"image":"walkMobA","x":0,"y":0,"w":256,"h":288,"pivot":138.0,"foot":279,"bodyHeight":229,"scale":0.460177},{"image":"walkMobA","x":280,"y":0,"w":232,"h":288,"pivot":109.0,"foot":277,"bodyHeight":226,"scale":0.460177},{"image":"walkMobA","x":536,"y":0,"w":232,"h":288,"pivot":119.0,"foot":276,"bodyHeight":226,"scale":0.460177},{"image":"walkMobA","x":792,"y":0,"w":232,"h":288,"pivot":135.0,"foot":278,"bodyHeight":226,"scale":0.460177},{"image":"walkMobA","x":1048,"y":0,"w":232,"h":288,"pivot":139.0,"foot":278,"bodyHeight":225,"scale":0.460177},{"image":"walkMobA","x":1304,"y":0,"w":232,"h":288,"pivot":125.0,"foot":278,"bodyHeight":225,"scale":0.460177}],[{"image":"walkMobA","x":0,"y":288,"w":256,"h":249,"pivot":145.0,"foot":237,"bodyHeight":226,"scale":0.611973},{"image":"walkMobA","x":256,"y":288,"w":256,"h":249,"pivot":137.0,"foot":235,"bodyHeight":227,"scale":0.611973},{"image":"walkMobA","x":512,"y":288,"w":256,"h":249,"pivot":137.0,"foot":235,"bodyHeight":228,"scale":0.611973},{"image":"walkMobA","x":768,"y":288,"w":256,"h":249,"pivot":141.0,"foot":234,"bodyHeight":223,"scale":0.611973},{"image":"walkMobA","x":1024,"y":288,"w":256,"h":249,"pivot":138.0,"foot":235,"bodyHeight":225,"scale":0.611973},{"image":"walkMobA","x":1280,"y":288,"w":256,"h":249,"pivot":121.0,"foot":233,"bodyHeight":225,"scale":0.611973}],[{"image":"walkMobA","x":0,"y":537,"w":256,"h":193,"pivot":176.0,"foot":188,"bodyHeight":175,"scale":0.505747},{"image":"walkMobA","x":256,"y":537,"w":256,"h":193,"pivot":172.0,"foot":186,"bodyHeight":177,"scale":0.505747},{"image":"walkMobA","x":512,"y":537,"w":256,"h":193,"pivot":169.0,"foot":187,"bodyHeight":174,"scale":0.505747},{"image":"walkMobA","x":768,"y":537,"w":256,"h":193,"pivot":174.0,"foot":187,"bodyHeight":174,"scale":0.505747},{"image":"walkMobA","x":1024,"y":537,"w":256,"h":193,"pivot":172.0,"foot":186,"bodyHeight":173,"scale":0.505747},{"image":"walkMobA","x":1280,"y":537,"w":256,"h":193,"pivot":154.0,"foot":187,"bodyHeight":173,"scale":0.505747}],[{"image":"walkMobA","x":0,"y":730,"w":256,"h":294,"pivot":148.0,"foot":260,"bodyHeight":257,"scale":0.592593},{"image":"walkMobA","x":264,"y":730,"w":248,"h":294,"pivot":148.0,"foot":259,"bodyHeight":255,"scale":0.592593},{"image":"walkMobA","x":520,"y":730,"w":248,"h":294,"pivot":149.0,"foot":259,"bodyHeight":253,"scale":0.592593},{"image":"walkMobA","x":776,"y":730,"w":248,"h":294,"pivot":152.0,"foot":261,"bodyHeight":258,"scale":0.592593},{"image":"walkMobA","x":1032,"y":730,"w":248,"h":294,"pivot":163.0,"foot":260,"bodyHeight":256,"scale":0.592593},{"image":"walkMobA","x":1288,"y":730,"w":248,"h":294,"pivot":141.0,"foot":262,"bodyHeight":257,"scale":0.592593}]],"walkMobB":[[{"image":"walkMobB","x":0,"y":0,"w":256,"h":265,"pivot":149.0,"foot":253,"bodyHeight":226,"scale":0.451902},{"image":"walkMobB","x":256,"y":0,"w":256,"h":265,"pivot":160.0,"foot":254,"bodyHeight":226,"scale":0.451902},{"image":"walkMobB","x":512,"y":0,"w":256,"h":265,"pivot":169.0,"foot":254,"bodyHeight":222,"scale":0.451902},{"image":"walkMobB","x":768,"y":0,"w":256,"h":265,"pivot":157.0,"foot":254,"bodyHeight":225,"scale":0.451902},{"image":"walkMobB","x":1024,"y":0,"w":256,"h":265,"pivot":166.0,"foot":252,"bodyHeight":219,"scale":0.451902},{"image":"walkMobB","x":1280,"y":0,"w":256,"h":265,"pivot":174.0,"foot":252,"bodyHeight":222,"scale":0.451902}],[{"image":"walkMobB","x":0,"y":265,"w":256,"h":267,"pivot":121.0,"foot":252,"bodyHeight":246,"scale":0.593939},{"image":"walkMobB","x":280,"y":265,"w":232,"h":267,"pivot":109.0,"foot":253,"bodyHeight":249,"scale":0.593939},{"image":"walkMobB","x":536,"y":265,"w":232,"h":267,"pivot":113.0,"foot":253,"bodyHeight":245,"scale":0.593939},{"image":"walkMobB","x":792,"y":265,"w":232,"h":267,"pivot":117.0,"foot":254,"bodyHeight":250,"scale":0.593939},{"image":"walkMobB","x":1048,"y":265,"w":232,"h":267,"pivot":115.0,"foot":253,"bodyHeight":249,"scale":0.593939},{"image":"walkMobB","x":1304,"y":265,"w":232,"h":267,"pivot":124.0,"foot":252,"bodyHeight":243,"scale":0.593939}],[{"image":"walkMobB","x":0,"y":532,"w":256,"h":198,"pivot":150.0,"foot":180,"bodyHeight":148,"scale":0.587413},{"image":"walkMobB","x":256,"y":532,"w":256,"h":198,"pivot":175.0,"foot":179,"bodyHeight":149,"scale":0.587413},{"image":"walkMobB","x":512,"y":532,"w":256,"h":198,"pivot":180.0,"foot":180,"bodyHeight":140,"scale":0.587413},{"image":"walkMobB","x":768,"y":532,"w":256,"h":198,"pivot":161.0,"foot":179,"bodyHeight":134,"scale":0.587413},{"image":"walkMobB","x":1024,"y":532,"w":256,"h":198,"pivot":139.0,"foot":179,"bodyHeight":141,"scale":0.587413},{"image":"walkMobB","x":1280,"y":532,"w":256,"h":198,"pivot":133.0,"foot":179,"bodyHeight":145,"scale":0.587413}],[{"image":"walkMobB","x":0,"y":730,"w":256,"h":294,"pivot":143.0,"foot":270,"bodyHeight":262,"scale":0.577438},{"image":"walkMobB","x":256,"y":730,"w":256,"h":294,"pivot":155.0,"foot":269,"bodyHeight":259,"scale":0.577438},{"image":"walkMobB","x":512,"y":730,"w":256,"h":294,"pivot":147.0,"foot":272,"bodyHeight":262,"scale":0.577438},{"image":"walkMobB","x":768,"y":730,"w":256,"h":294,"pivot":160.0,"foot":270,"bodyHeight":263,"scale":0.577438},{"image":"walkMobB","x":1024,"y":730,"w":256,"h":294,"pivot":157.0,"foot":270,"bodyHeight":258,"scale":0.577438},{"image":"walkMobB","x":1280,"y":730,"w":256,"h":294,"pivot":154.0,"foot":269,"bodyHeight":261,"scale":0.577438}]],"walkBase":[[{"image":"walkBase","x":0,"y":95,"w":256,"h":264,"pivot":152.0,"foot":222,"bodyHeight":170,"scale":0.366762},{"image":"walkBase","x":256,"y":95,"w":256,"h":264,"pivot":176.0,"foot":221,"bodyHeight":175,"scale":0.366762},{"image":"walkBase","x":512,"y":95,"w":256,"h":264,"pivot":167.0,"foot":223,"bodyHeight":175,"scale":0.366762},{"image":"walkBase","x":768,"y":95,"w":256,"h":264,"pivot":150.0,"foot":223,"bodyHeight":174,"scale":0.366762},{"image":"walkBase","x":1024,"y":95,"w":256,"h":264,"pivot":161.0,"foot":223,"bodyHeight":172,"scale":0.366762},{"image":"walkBase","x":1280,"y":95,"w":256,"h":264,"pivot":156.0,"foot":223,"bodyHeight":175,"scale":0.366762}],[{"image":"walkBase","x":0,"y":359,"w":256,"h":356,"pivot":160.0,"foot":316,"bodyHeight":280,"scale":0.386617},{"image":"walkBase","x":256,"y":359,"w":256,"h":356,"pivot":166.0,"foot":315,"bodyHeight":271,"scale":0.386617},{"image":"walkBase","x":512,"y":359,"w":256,"h":356,"pivot":167.0,"foot":316,"bodyHeight":276,"scale":0.386617},{"image":"walkBase","x":768,"y":359,"w":256,"h":356,"pivot":160.0,"foot":316,"bodyHeight":264,"scale":0.386617},{"image":"walkBase","x":1024,"y":359,"w":256,"h":356,"pivot":158.0,"foot":317,"bodyHeight":267,"scale":0.386617},{"image":"walkBase","x":1280,"y":359,"w":256,"h":356,"pivot":155.0,"foot":316,"bodyHeight":266,"scale":0.386617}],[{"image":"walkBase","x":0,"y":715,"w":256,"h":309,"pivot":150.0,"foot":221,"bodyHeight":174,"scale":0.502857},{"image":"walkBase","x":256,"y":715,"w":256,"h":309,"pivot":141.0,"foot":220,"bodyHeight":176,"scale":0.502857},{"image":"walkBase","x":512,"y":715,"w":256,"h":309,"pivot":148.0,"foot":222,"bodyHeight":177,"scale":0.502857},{"image":"walkBase","x":768,"y":715,"w":256,"h":309,"pivot":143.0,"foot":217,"bodyHeight":173,"scale":0.502857},{"image":"walkBase","x":1024,"y":715,"w":256,"h":309,"pivot":136.0,"foot":224,"bodyHeight":180,"scale":0.502857},{"image":"walkBase","x":1280,"y":715,"w":256,"h":309,"pivot":129.0,"foot":220,"bodyHeight":167,"scale":0.502857}]]};
  art.enemyWalk=(e)=>{
    if(!e.alive||!e.moving||e.hurtPose>0||e.attackPose>0||e.aiWindup>0||e.bossTelegraph>0||e.intro>0)return null;
    const ids={skeleton:['walkMobA',0],gargoyle:['walkMobA',1],frostWolf:['walkMobA',2],frostKnight:['walkMobA',3],emberImp:['walkMobB',0],slagGuard:['walkMobB',1],plagueVermin:['walkMobB',2],voidKnight:['walkMobB',3]};
    const spec=e.type==='boss'?[e.tier<4?'walkBossA':'walkBossB',e.tier%4]:ids[e.variant]||['walkBase',{crawler:0,shooter:1,brute:2}[e.type]];
    if(!spec||!art.loaded[spec[0]])return null;
    return walkFrames[spec[0]][spec[1]][Math.floor((e.walkCycle||0)*6)%6];
  };
  function isolateWalk(f){
    const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const cc=c.getContext('2d');
    cc.drawImage(art.images[f.image],f.x,f.y,f.w,f.h,0,0,f.w,f.h);
    const pixels=cc.getImageData?.(0,0,c.width,c.height);if(!pixels?.data)return;
    const data=pixels.data,w=c.width,h=c.height,n=w*h,labels=new Int32Array(n),queue=new Int32Array(n),sizes=[0];let label=0;
    // Connected silhouettes separate an actor from a neighboring weapon tip or cloak.
    for(let i=0;i<n;i++)if(!labels[i]&&data[i*4+3]>80){
      label++;let head=0,tail=1;queue[0]=i;labels[i]=label;
      while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,q=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!labels[q]&&data[q*4+3]>80){labels[q]=label;queue[tail++]=q}}
      }sizes[label]=tail;
    }
    let main=1;for(let i=2;i<sizes.length;i++)if(sizes[i]>sizes[main])main=i;
    const keep=new Uint8Array(n),horizontal=new Uint8Array(n);
    // Two sliding windows preserve soft edges without a costly per-pixel square scan.
    for(let y=0;y<h;y++){let count=0;for(let x=-3;x<w;x++){if(x+3<w&&labels[y*w+x+3]===main)count++;if(x-4>=0&&labels[y*w+x-4]===main)count--;if(x>=0)horizontal[y*w+x]=count>0?1:0}}
    for(let x=0;x<w;x++){let count=0;for(let y=-3;y<h;y++){if(y+3<h)count+=horizontal[(y+3)*w+x];if(y-4>=0)count-=horizontal[(y-4)*w+x];if(y>=0)keep[y*w+x]=count>0?1:0}}
    for(let i=0;i<n;i++){if(!keep[i])data[i*4+3]=0;else {const edge=Math.min(i%w,w-1-i%w);data[i*4+3]*=Math.min(1,edge/4)}}
    cc.putImageData(pixels,0,0);f.surface=c;
  }
  art.ready.then(()=>{for(const rows of Object.values(walkFrames))for(const poses of rows)for(const f of poses)if(art.loaded[f.image])isolateWalk(f)});
  art.draw=(ctx,key,f,scale,ground)=>ctx.drawImage(f.surface||art.images[key],f.surface?0:f.x,f.surface?0:f.y,f.w,f.h,-f.pivot*scale,ground-f.foot*scale,f.w*scale,f.h*scale);
})();
