(() => {
  'use strict';
  const art=window.AF_ART={images:{},loaded:{}};
  const paths={heroes:'../../assets/art/heroes-v2.webp',actions:'../../assets/art/actions-v2.webp',enemies:'../../assets/art/enemies-v2.webp',rooms:'../../assets/art/rooms-v2.webp'};
  art.ready=Promise.all(Object.entries(paths).map(([key,path])=>new Promise(resolve=>{
    const im=new Image();art.images[key]=im;
    im.onload=()=>{art.loaded[key]=true;resolve(true)};
    im.onerror=()=>{art.loaded[key]=false;resolve(false)};
    im.src=path+'?v=30';
  })));
  // Authored sampling rectangles: the generated sheet does not use uniform rows.
  const heroRows=[0,280,540,802,1024],heroEdges=[0,284,536,790,1035,1267,1536];
  const heroFeet=[[277,277,277,276,276,277],[252,251,248,242,251,250],[254,253,254,254,252,253],[211,210,211,211,208,211]];
  const heroTorso=[164,421,672,925,1176,1424];
  art.hero=(key,anim,index)=>{
    if((anim==='attack'||anim==='death')&&art.loaded.actions){
      const row=(key==='dawn'?0:2)+(anim==='death'?1:0),col=Math.min(3,index);
      const xs=[0,310,615,957,1254],ys=[0,380,650,960,1254],pivot=[175,450,770,1092];
      const feet=[[348,348,353,355],[247,241,240,234],[286,285,286,290],[261,263,262,262]];
      return {image:'actions',x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row],pivot:pivot[col]-xs[col],foot:feet[row][col],scale:.96};
    }
    const base=key==='dawn'?0:2;
    let row=base,col=index;
    if(anim==='run')row++;
    else if(anim==='hurt')col=4;
    else if(anim==='death')col=index===0?4:5;
    else if(anim==='attack')col=Math.min(3,index);
    return {image:'heroes',x:heroEdges[col],y:heroRows[row],w:heroEdges[col+1]-heroEdges[col],h:heroRows[row+1]-heroRows[row],pivot:heroTorso[col]-heroEdges[col],foot:heroFeet[row][col],scale:1};
  };
  const enemyRows=[0,215,455,640,1024];
  const enemyFeet=[[197,195,197,196,196,197],[228,226,230,227,229,229],[178,177,178,182,179,183],[355,348,354,350,352,361]];
  art.enemy=(type,col)=>{
    const row={crawler:0,shooter:1,brute:2,boss:3}[type];
    return {x:col*256,y:enemyRows[row],w:256,h:enemyRows[row+1]-enemyRows[row],pivot:128,foot:enemyFeet[row][col]};
  };
  art.draw=(ctx,key,f,scale,ground)=>ctx.drawImage(art.images[key],f.x,f.y,f.w,f.h,-f.pivot*scale,ground-f.foot*scale,f.w*scale,f.h*scale);
})();
