(() => {
  'use strict';
  const {C}=WGG;
  WGG.render=(ctx,m,options={})=>{
    const art=WGG.art;
    if(!art?.ready){ctx.fillStyle='#1b282e';ctx.fillRect(0,0,1200,720);ctx.fillStyle='#eee7d7';ctx.font='24px sans-serif';ctx.fillText(art?.failed?'이미지를 불러오지 못했습니다. 새로고침해 주세요.':'정지 포즈를 불러오는 중…',80,340);return;}
    const t=m.time,age=['resolve','end'].includes(m.phase)?Math.max(0,t-m.resolvedAt):9999;
    const ep=options.preview?(options.preview.near?'idle':options.preview.state):WGG.stillPose(m,false),pp=options.preview?(options.preview.near?options.preview.state:'idle'):WGG.stillPose(m,true);
    ctx.save();ctx.clearRect(0,0,1200,720);
    ctx.drawImage(art.images.office,0,0,1200,720);
    ctx.fillStyle='#e9dfcf1a';ctx.fillRect(0,0,1200,720);
    // Every action uses the same stage coordinates; contact never zooms the scene.
    function drawActor(state,near){actor(state,near);}
    function sprite(name,x,y,w,h){const s=art.sprites[name];ctx.drawImage(s.image,...s.rect,x,y,w,h);}
    function actor(state,near){
      if(state==='rps'){rpsActor({value:near?m.player:m.enemy},near);return;}
      if(state==='hammer-strike'){
        const img=art.images[(near?'player':'enemy')+'-crown-compact'],scale=near?.72:.65;
        const contact=near?C.enemyCrown:C.playerCrown,source=near?[130,306]:[1116,300];
        ctx.drawImage(img,contact.x-source[0]*scale,contact.y-source[1]*scale,img.naturalWidth*scale,img.naturalHeight*scale);return;
      }
      const frames=['hammer-pickup','hammer-lift','hammer-strike','pot-pickup','pot-wear','idle'],i=frames.indexOf(state);
      const anchors=near?[[315,170],[288,175],[301,172],[315,150],[288,175],[315,170]]:[[315,165],[315,190],[300,190],[315,125],[320,160],[290,165]];
      const scale=near?1.45:1.15,head=near?C.playerHead:C.enemyHead;
      const dx=state==='hammer-strike'?(near?-40:220):0,dy=near&&state==='hammer-pickup'?-45:!near&&state==='hammer-lift'?25:0;
      const name=(near?'player':'enemy')+'Still'+i,inset=art.sprites[name].inset;
      sprite(name,head.x+dx+(inset-anchors[i][0])*scale,head.y+dy+(2-anchors[i][1])*scale,(506-inset)*scale,506*scale);
    }
    function rpsActor(p,near){
      const anchors=near?[430,404.5,389]:[420,392.5,382],scale=near?.94:.65;
      const head=near?C.playerHead:C.enemyHead;
      const name=(near?'player':'enemy')+'Rps'+p.value,inset=art.sprites[name].inset;
      sprite(name,head.x+(inset-anchors[p.value])*scale,near?105:80,(724-inset)*scale,724*scale);
    }
    function line(p,c,w=2){ctx.beginPath();ctx.moveTo(...p[0]);p.slice(1).forEach(q=>ctx.lineTo(...q));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke();}
    function oval(x,y,rx,ry,fill,stroke=null){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
    function text(s,x,y,size=16,color='#342e28'){ctx.font=`600 ${size}px "Malgun Gothic",sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s,x,y);}
    function hammer(p,angle=C.hammerHomeAngle){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle+Math.PI/2);ctx.scale(1.25,1.25);
      line([[0,12],[0,-C.hammerLength]],'#8e692f',15);line([[-2,10],[-2,-C.hammerLength]],'#e8c267',10);
      const red=ctx.createLinearGradient(-46,0,46,0);red.addColorStop(0,'#9b2f25');red.addColorStop(.25,'#e56445');red.addColorStop(.6,'#d34d37');red.addColorStop(1,'#9b3027');
      ctx.fillStyle=red;ctx.strokeStyle='#783c31';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-45,-C.hammerLength-25,90,50,12);ctx.fill();ctx.stroke();
      for(const x of [-36,-27,27,36])line([[x,-C.hammerLength-18],[x,-C.hammerLength+18]],'#812c284d',2);
      oval(-43,-C.hammerLength,7,21,'#b44030','#893c30');oval(43,-C.hammerLength,7,21,'#d8593d','#893c30');ctx.restore();
    }
    function pot(p){
      // The right handle remains at the input anchor as the bowl grows.
      ctx.save();ctx.translate(p.x-C.potOffset*1.25,p.y);ctx.scale(1.25,1.25);
      const steel=ctx.createLinearGradient(-65,0,65,0);steel.addColorStop(0,'#7b7771');steel.addColorStop(.17,'#d7d5cb');steel.addColorStop(.3,'#9c9a91');steel.addColorStop(.53,'#f1eee0');steel.addColorStop(.8,'#aaa89e');steel.addColorStop(1,'#686963');
      ctx.beginPath();ctx.moveTo(-63,-7);ctx.lineTo(-55,50);ctx.quadraticCurveTo(0,71,55,50);ctx.lineTo(63,-7);ctx.closePath();ctx.fillStyle=steel;ctx.fill();ctx.strokeStyle='#5d5b56';ctx.lineWidth=2;ctx.stroke();
      oval(0,-7,64,16,'#d7d6cd','#65645c');oval(0,-8,56,11,'#8d8b83');line([[-44,-10],[-20,-15],[20,-14]],'#efebdb',2);
      line([[59,-1],[80,0]],'#666861',8);line([[61,-2],[79,-2]],'#e3e0d3',3);line([[-60,-1],[-79,-1]],'#666861',8);line([[-62,-2],[-78,-2]],'#e3e0d3',3);ctx.restore();
    }
    drawActor(ep,false);
    // The long back edge is level at y=540; only the short sides recede.
    ctx.drawImage(art.images['table-horizontal'],0,165,1200,605);
    if(!ep.startsWith('hammer')&&!pp.startsWith('hammer')){
      oval(C.hammerHome.x-48,C.hammerHome.y+24,90,13,'#4f38242c');hammer(C.hammerHome);
    }
    if(!ep.startsWith('pot')&&!pp.startsWith('pot')){
      oval(C.potHome.x-C.potOffset*1.25,C.potHome.y+78,92,13,'#4f382438');pot(C.potHome);
    }
    // Repaint the same complete drawing over the tabletop only at the hand/prop
    // region; torso remains behind it. No limb is transformed independently.
    if(ep.endsWith('pickup')){
      ctx.save();ctx.beginPath();
      const contours=ep.startsWith('pot')?[
        [[245,450],[390,450],[390,525],[368,540],[352,565],[305,570],[268,551],[245,534]],
        [[345,470],[620,470],[620,525],[575,525],[575,600],[550,615],[430,615],[380,603],[380,525],[345,525]]
      ]:[
        [[277,500],[390,500],[407,550],[375,596],[317,604],[279,575]],
        [[395,532],[480,518],[490,550],[400,571]],
        [[467,495],[480,480],[522,478],[536,490],[554,568],[547,584],[493,594],[481,585]]
      ];
      for(const points of contours){ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();}
      ctx.clip();actor(ep,false);ctx.restore();
    }
    drawActor(pp,true);
    function energyBar(near){
      const value=m.energy[near?'player':'enemy'];
      const overhead=(near?pp:ep)==='pot-wear'||(near?ep:pp)==='hammer-strike';
      const x=overhead?(near?720:200):(near?C.playerHead.x:C.enemyHead.x);
      const y=overhead?12:(near?68:12),w=220,h=16;
      ctx.fillStyle='#15252be8';ctx.fillRect(x-w/2-4,y-4,w+8,h+8);
      ctx.fillStyle='#46535a';ctx.fillRect(x-w/2,y,w,h);
      ctx.fillStyle=value>50?'#69b99b':value>25?'#e6bc65':'#df6a59';ctx.fillRect(x-w/2,y,w*value/C.maxEnergy,h);
      ctx.strokeStyle='#e9dfc2';ctx.lineWidth=1;ctx.strokeRect(x-w/2,y,w,h);
      ctx.fillStyle='#15252be8';ctx.fillRect(x-70,y+h+4,140,21);
      text((near?'도전자':'최주임')+' · '+value+'/'+C.maxEnergy,x,y+h+20,14,'#f4e8ce');
    }
    energyBar(false);energyBar(true);
    if(!options.preview&&!m.held&&['select','react'].includes(m.phase))for(const [p,label]of [[C.hammerHome,'망치'],[C.potHome,'냄비']]){
      oval(p.x,p.y,23,23,'#ffedbe0c','#d5bd8c');text(label,p.x,p.y+42,13,'#3d3329');
    }
    if(m.phase==='react'){
      const hands=['가위','바위','보'];text('최주임 · '+hands[m.enemy],C.enemyHead.x,70,15);text('내 패 · '+hands[m.player],C.playerHead.x,127,15);
      line([[380,699],[800,699]],'#4b3e2c44',4);line([[380,699],[380+420*Math.max(0,1-(t-m.reactAt)/C.reactMs),699]],'#f2d292',4);
    }
    if(m.phase==='resolve')text(({hit:'뿅!',hurt:'뿅!',block:'깡!',guarded:'깡!',foul:'파울',tie:'재경기',miss:'휙…'})[m.result],650,ep==='hammer-strike'?90:130,34,'#5e3728');
    if(options.countdown){
      oval(600,270,75,75,'#15252be8','#e0c28a');
      text(String(options.countdown),600,293,68,'#f6dca4');
      text('가위 · 바위 · 보',600,382,22,'#f6dca4');
    }
    ctx.restore();
  };
})();
