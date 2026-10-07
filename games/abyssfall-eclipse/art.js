(() => {
  'use strict';
  const art=window.AF_ART={images:{},loaded:{}};
  const paths={heroes:'../../assets/art/heroes-v4.webp',actions:'../../assets/art/actions-v4.webp',enemies:'../../assets/art/enemies-v2.webp',rooms:'../../assets/art/rooms-v2.webp'};
  art.ready=Promise.all(Object.entries(paths).map(([key,path])=>new Promise(resolve=>{
    const im=new Image();art.images[key]=im;
    im.onload=()=>{art.loaded[key]=true;resolve(true)};
    im.onerror=()=>{art.loaded[key]=false;resolve(false)};
    im.src=path+'?v=32';
  })));
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
