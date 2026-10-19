(() => {
  'use strict';
  const art=WGG.art={ready:false,failed:false,images:{},sprites:{},loading:null};
  const layout={
    enemyHead:['characters',0,0,2,2],enemyBody:['characters',1,0,2,2],
    playerHead:['characters',0,1,2,2],playerBody:['characters',1,1,2,2],
    beigeUpper:['limbs',0,0,4,2],beigeFore:['limbs',1,0,4,2],
    navyUpper:['limbs',2,0,4,2],navyFore:['limbs',3,0,4,2],
    rock:['limbs',0,1,4,2],scissors:['limbs',1,1,4,2],
    paper:['limbs',2,1,4,2],grip:['limbs',3,1,4,2]
  };
  art.loading=Promise.all(['characters','limbs','office','enemy-bust','enemy-bust-hurt'].map(name=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{art.images[name]=img;resolve();};img.onerror=()=>reject(new Error(name));img.src=`assets/approved-a/${name}.png`;
  }))).then(()=>{
    for(const [name,[sheet,col,row,cols,rows]]of Object.entries(layout)){
      const img=art.images[sheet],w=img.naturalWidth/cols,h=img.naturalHeight/rows;
      const authored=WGG.ART_BOUNDS?.[name];
      art.sprites[name]={image:img,rect:authored||[col*w+w*.075,row*h+h*.075,w*.85,h*.85]};
    }
    for(const [name,file]of [['enemyBust','enemy-bust'],['enemyBustHurt','enemy-bust-hurt']]){
      const img=art.images[file];
      art.sprites[name]={image:img,rect:WGG.ART_BOUNDS[name]||[0,0,img.naturalWidth,img.naturalHeight]};
    }
    art.ready=true;
  }).catch(()=>{art.failed=true;});
})();
