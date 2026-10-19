(() => {
  'use strict';
  const {C,clamp,dist}=WGG,fallback=WGG.render;
  WGG.render=(ctx,m,options={})=>{
    const art=WGG.art;
    if(!art?.ready){fallback(ctx,m,options);return;}
    const t=m.time,age=['resolve','end'].includes(m.phase)?Math.max(0,t-m.resolvedAt):9999;
    const impact=['hit','hurt','block','guarded'].includes(m.result)&&age<360;
    const breathe=Math.sin(t/800)*1.2,ep=WGG.enemyPose(m),pp=WGG.playerPose(m);
    const eLean=ep.shoulder.x-C.enemyShoulder.x;
    const pLean=pp.kind==='hammer'?{x:pp.shoulder.x-C.shoulder.x,y:pp.shoulder.y-C.shoulder.y}:{x:0,y:0};
    ctx.save();ctx.clearRect(0,0,1200,720);
    if(impact&&!options.reduced){const q=1-age/360;ctx.translate(Math.sin(age/17)*4*q,Math.cos(age/21)*2*q);}
    ctx.drawImage(art.images.office,0,0,1200,720);
    ctx.fillStyle='#e9dfcf1a';ctx.fillRect(0,0,1200,720);
    function sprite(name,x,y,w,h){const s=art.sprites[name];ctx.drawImage(s.image,...s.rect,x,y,w,h);}
    function poly(points,fill,stroke='#594a3b',width=2){ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
    function line(p,c,w=2){ctx.beginPath();ctx.moveTo(...p[0]);p.slice(1).forEach(q=>ctx.lineTo(...q));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke();}
    function oval(x,y,rx,ry,fill,stroke=null){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
    function text(s,x,y,size=16,color='#342e28'){ctx.font=`600 ${size}px "Malgun Gothic",sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s,x,y);}
    function segment(name,a,b,width){const length=dist(a,b);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);sprite(name,-width/2,-8,width,length+16);ctx.restore();}
    function hammer(p,angle=C.hammerHomeAngle){
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle+Math.PI/2);
      line([[0,12],[0,-C.hammerLength]],'#8e692f',15);line([[-2,10],[-2,-C.hammerLength]],'#e8c267',10);
      const red=ctx.createLinearGradient(-46,0,46,0);red.addColorStop(0,'#9b2f25');red.addColorStop(.25,'#e56445');red.addColorStop(.6,'#d34d37');red.addColorStop(1,'#9b3027');
      ctx.fillStyle=red;ctx.strokeStyle='#783c31';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-45,-C.hammerLength-25,90,50,12);ctx.fill();ctx.stroke();
      for(const x of [-36,-27,27,36])line([[x,-C.hammerLength-18],[x,-C.hammerLength+18]],'#812c284d',2);
      oval(-43,-C.hammerLength,7,21,'#b44030','#893c30');oval(43,-C.hammerLength,7,21,'#d8593d','#893c30');ctx.restore();
    }
    function pot(p,flip=0,metal=false,near=false){
      const frame=near?WGG.potFrame(p):{offset:C.potOffset,scale:1};
      const x=p.x-frame.offset,y=p.y+(metal?Math.sin(age/13)*Math.max(0,1-age/280)*3:0);
      ctx.save();ctx.translate(x,y);ctx.scale(frame.scale,(1-2*flip||.01)*frame.scale);
      const steel=ctx.createLinearGradient(-65,0,65,0);steel.addColorStop(0,'#7b7771');steel.addColorStop(.17,'#d7d5cb');steel.addColorStop(.3,'#9c9a91');steel.addColorStop(.53,'#f1eee0');steel.addColorStop(.8,'#aaa89e');steel.addColorStop(1,'#686963');
      ctx.beginPath();ctx.moveTo(-63,-7);ctx.lineTo(-55,50);ctx.quadraticCurveTo(0,71,55,50);ctx.lineTo(63,-7);ctx.closePath();ctx.fillStyle=steel;ctx.fill();ctx.strokeStyle='#5d5b56';ctx.lineWidth=2;ctx.stroke();
      oval(0,-7,64,16,'#d7d6cd','#65645c');oval(0,-8,56,11,'#8d8b83');line([[-44,-10],[-20,-15],[20,-14]],'#efebdb',2);
      line([[59,-1],[80,0]],'#666861',8);line([[61,-2],[79,-2]],'#e3e0d3',3);line([[-60,-1],[-79,-1]],'#666861',8);line([[-62,-2],[-78,-2]],'#e3e0d3',3);ctx.restore();
    }
    // A continuous bust keeps jaw, neck and collar connected during recoil.
    const recoil=m.result==='hit'?Math.sin(clamp(age/430,0,1)*Math.PI):0;
    ctx.save();ctx.translate(420+eLean,495+breathe);ctx.rotate(recoil*.025);
    sprite(m.result==='hit'&&age<430?'enemyBustHurt':'enemyBust',-225,-420,420,502);ctx.restore();
    // Authored tabletop perspective, warm grain, bevel and contact shadows.
    const corners=C.table.map(p=>[p.x,p.y]),[a,b,c,d]=corners;
    ctx.save();ctx.beginPath();ctx.moveTo(...a);corners.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.clip();
    const wood=ctx.createLinearGradient(0,390,1200,720);wood.addColorStop(0,'#c4a27a');wood.addColorStop(.55,'#ae865f');wood.addColorStop(1,'#c4a17a');ctx.fillStyle=wood;ctx.fillRect(0,390,1200,330);
    for(let i=0;i<65;i++){const y=402+i*5.5;ctx.beginPath();ctx.moveTo(-100,y+95);ctx.bezierCurveTo(300,y+56+Math.sin(i)*5,700,y+8,1300,y-24);ctx.strokeStyle=i%4?'#5b3c2515':'#f3d0a135';ctx.lineWidth=i%4?.7:1.5;ctx.stroke();}
    ctx.restore();poly([d,c,[c[0],c[1]+20],[d[0],d[1]+20]],'#765b40');line([a,b],'#ddc09a',4);line([d,c],'#6f533a',3);
    for(const [p,rx]of [[C.hammerHome,75],[C.potHome,70]])oval(p.x-(p===C.potHome?C.potOffset:38),p.y+18,rx,12,'#4f382421');
    if(ep.kind!=='hammer'&&pp.kind!=='hammer')hammer(C.hammerHome);
    if(ep.kind!=='pot'&&pp.kind!=='pot')pot(C.potHome);
    // Near actor: separate painted nape and navy jacket retain the approved A camera.
    sprite('playerBody',640+pLean.x,372+pLean.y+breathe,660,422);
    const hurt=m.result==='hurt'?Math.sin(clamp(age/430,0,1)*Math.PI):0;
    ctx.save();ctx.translate(C.playerHead.x+pLean.x-hurt*8,C.playerHead.y+pLean.y+breathe+hurt*8);ctx.rotate(-.07-hurt*.06);sprite('playerHead',-160,-140,320,315);ctx.restore();
    function drawArm(p,near){
      if(!p.visible)return;
      const prefix=near?'navy':'beige',w=near?58:48;
      const name=p.mode==='rps'?['scissors','rock','paper'][p.value]:'grip',s=art.sprites[name];
      const scale=(near?.26:.22)*(near&&p.kind==='pot'?WGG.potFrame(p.wrist).scale:1),width=s.rect[2]*scale,height=s.rect[3]*scale;
      segment(prefix+'Upper',p.shoulder,p.elbow,w);
      const grip=p.kind!==null,angle=grip&&p.kind==='hammer'?(p.angle??-Math.PI/2)+Math.PI/2:0;
      const base=grip?{x:p.wrist.x-Math.sin(angle)*height*.48,y:p.wrist.y+Math.cos(angle)*height*.48}:p.wrist;
      segment(prefix+'Fore',p.elbow,base,w*.76);
      if(p.kind==='hammer')hammer(p.wrist,p.angle??-Math.PI/2);
      if(p.kind==='pot'){
        const target={x:C.playerHead.x,y:C.playerHead.y-C.playerHead.r+7};
        const center={x:p.wrist.x-(near?WGG.potFrame(p.wrist).offset:C.potOffset),y:p.wrist.y};
        const flip=near?clamp(1-dist(center,target)/200,0,1):clamp((C.potHome.y-p.wrist.y)/240,0,1);
        pot(p.wrist,flip,m.result==='block'||m.result==='guarded',near);
      }
      ctx.save();ctx.translate(p.wrist.x,p.wrist.y);ctx.rotate(angle);
      sprite(name,-width/2,grip?-height*.45:-height*.94,width,height);ctx.restore();
    }
    drawArm(ep,false);drawArm(pp,true);
    if(['select','react'].includes(m.phase))for(const [p,label]of [[C.hammerHome,'망치'],[C.potHome,'냄비']]){
      oval(p.x,p.y,23,23,'#ffedbe0c','#d5bd8c');text(label,p.x,p.y+42,13,'#3d3329');
    }
    if(m.phase==='react'){
      const hands=['가위','바위','보'];text('최주임 · '+hands[m.enemy],C.enemyHead.x,66,15);text('내 패 · '+hands[m.player],C.playerHead.x,68,15);
      line([[380,699],[800,699]],'#4b3e2c44',4);line([[380,699],[380+420*Math.max(0,1-(t-m.reactAt)/C.reactMs),699]],'#f2d292',4);
    }
    if(m.held==='hammer')for(let i=1;i<m.trace.length;i++){ctx.globalAlpha=i/m.trace.length*.38;line([[m.trace[i-1].x,m.trace[i-1].y],[m.trace[i].x,m.trace[i].y]],'#ffe0a0',3);}ctx.globalAlpha=1;
    if(impact&&m.contact){const q=age/360;for(let i=0;i<9;i++){const ang=i*Math.PI/4.5;ctx.globalAlpha=1-q;line([[m.contact.x+Math.cos(ang)*(45+q*35),m.contact.y+Math.sin(ang)*(45+q*35)],[m.contact.x+Math.cos(ang)*(65+q*80),m.contact.y+Math.sin(ang)*(65+q*80)]],m.result==='block'?'#edf4e0':'#ffdf95',4);}ctx.globalAlpha=1;}
    if(m.phase==='resolve')text(({hit:'뿅!',hurt:'뿅!',block:'깡!',guarded:'깡!',foul:'파울',tie:'재경기',miss:'휙…'})[m.result],650,130,34,'#5e3728');
    ctx.restore();
  };
})();
