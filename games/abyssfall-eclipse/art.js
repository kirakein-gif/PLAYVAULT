(() => {
  'use strict';
  const art=window.AF_ART={images:{},loaded:{}};
  const paths={heroes:'../../assets/art/heroes-v4.webp',actions:'../../assets/art/actions-v4.webp',enemies:'../../assets/art/enemies-v2.webp',props:'../../assets/art/props-v1.webp',relics:'../../assets/art/relics-v5.webp'};
  for(const zone of ['cathedral','graveyard','tower','abyss'])paths[zone]='../../assets/art/room-'+zone+'-v5.webp';
  art.ready=Promise.all(Object.entries(paths).map(([key,path])=>new Promise(resolve=>{
    const im=new Image();art.images[key]=im;
    im.onload=()=>{art.loaded[key]=true;if(key==='relics')relicIcons(im);resolve(true)};
    im.onerror=()=>{art.loaded[key]=false;resolve(false)};
    im.src=path+'?v=35';
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
  const floorEdges=[[[.28,.82],[.32,.82],[.32,.79]],[[.32,.79],[.32,.79],[.32,.79]],[[.25,.80],[.29,.81],[.28,.77]],[[.28,.74],[.28,.76],[.28,.75]]];
  const zones=['cathedral','graveyard','tower','abyss'];
  const patches={N:[.35,0,.30,.30],W:[0,.24,.14,.43],E:[.86,.24,.14,.43],S:[.32,.79,.36,.21]};
  function alignedPanel(zone,panel){
    const key=zone+':'+panel;if(panels.has(key))return panels.get(key);
    const im=art.images[zones[zone]],ys=rows[zone],c=document.createElement('canvas');c.width=916;c.height=572;
    const cc=c.getContext('2d'),[start,end]=floorEdges[zone][panel],src=[0,start,end,1],dst=[0,.28,.82,1],height=ys[panel+1]-ys[panel];
    for(let i=0;i<3;i++)cc.drawImage(im,0,ys[panel]+src[i]*height,im.width,(src[i+1]-src[i])*height,0,dst[i]*c.height,c.width,(dst[i+1]-dst[i])*c.height);
    panels.set(key,c);return c;
  }
  art.room=(zone,room,isOpen)=>{
    const key=zones[zone];if(!art.loaded[key])return null;
    const states=['N','W','E','S'].map(d=>!room.doors[d]?0:isOpen(d,room)?1:2),cache=zone+':'+states.join('');
    if(scenes.has(cache))return scenes.get(cache);
    const c=document.createElement('canvas');c.width=916;c.height=572;
    const cc=c.getContext('2d');cc.drawImage(alignedPanel(zone,1),0,0);
    ['N','W','E','S'].forEach((d,i)=>{
      if(states[i]===1)return;
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
    if(scenes.size>=12)scenes.delete(scenes.keys().next().value);
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
