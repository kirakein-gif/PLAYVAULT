(() => {
  'use strict';
  const art=WGG.art={ready:false,failed:false,images:{},sprites:{},loading:null};
  art.loading=Promise.all(['office','enemy-rps','player-rps','enemy-stills','player-stills','enemy-crown-strike','player-crown-strike'].map(name=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{art.images[name]=img;resolve();};img.onerror=()=>reject(new Error(name));img.src=`assets/approved-a/${name}.png`;
  }))).then(()=>{
    for(const side of ['enemy','player'])for(let hand=0;hand<3;hand++){
      const img=art.images[side+'-rps'];
      // The near actor's back reaches a cell edge. Exclude the tiny sliver
      // from the previous cell without changing the authored pose scale.
      const cell=img.naturalWidth/3,inset=side==='player'?24:0;
      art.sprites[side+'Rps'+hand]={image:img,inset,rect:[hand*cell+inset,0,cell-inset,img.naturalHeight]};
    }
    for(const side of ['enemy','player'])for(let i=0;i<6;i++){
      const img=art.images[side+'-stills'],w=img.naturalWidth/3,h=img.naturalHeight/2;
      const inset=side==='player'?24:6;
      art.sprites[side+'Still'+i]={image:img,inset,rect:[i%3*w+inset,Math.floor(i/3)*h+2,w-inset-6,h-6]};
    }
    art.ready=true;
  }).catch(()=>{art.failed=true;});
})();
