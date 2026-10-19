(function(root){
  'use strict';
  const {C,clamp,reach,ik}=root.WGG;
  const names=['가위','바위','보'];
  // Every wrist, including AI and free hands, has a fixed-length two-bone arm.
  function armPose(shoulder,target,a,b,bend=1){
    const wrist=reach(target,shoulder,a,b);
    return {shoulder,wrist,elbow:ik(shoulder,wrist,a,b,bend),a,b};
  }
  function enemyPose(m){
    const elapsed=m.phase==='react'?m.time-m.reactAt:C.enemyStrikeMs;
    const resolving=m.phase==='resolve'||m.phase==='end';
    const age=resolving?Math.max(0,m.time-m.resolvedAt):0;
    const recovery=clamp(age/260,0,1),rest={x:555,y:650};
    let kind=null,target=rest,mode='idle';
    const mix=(a,b,p)=>({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p});
    if(m.phase==='react'&&m.rule==='lose'||resolving&&['hurt','block'].includes(m.result)){
      mode='tool';kind='hammer';const pickup=450,wind=clamp((elapsed-pickup)/(C.enemyStrikeMs-260-pickup),0,1),swing=clamp((elapsed-C.enemyStrikeMs+260)/260,0,1);
      const blocked=m.result==='block'||m.phase==='react'&&m.equipped;
      target={x:C.hammerHome.x+(610-C.hammerHome.x)*wind+(C.playerHead.x-610)*swing,y:C.hammerHome.y+(155-C.hammerHome.y)*wind+((blocked?C.playerHead.y-C.playerHead.r+7:C.playerHead.y)+C.hammerLength-155)*swing};
      if(!resolving&&elapsed<pickup){kind=null;mode=elapsed<220?'rps':'reach';target=elapsed<220?C.enemyRps:mix(C.enemyRps,C.hammerHome,clamp((elapsed-220)/(pickup-220),0,1));}
    }else if(m.phase==='react'&&m.rule==='win'||resolving&&m.result==='guarded'){
      const start=C.enemyGuardMs-600,pickup=C.enemyGuardMs-370;
      if(!resolving&&elapsed<pickup){mode=elapsed<start?'rps':'reach';target=elapsed<start?C.enemyRps:mix(C.enemyRps,C.potHome,clamp((elapsed-start)/(pickup-start),0,1));}
      else{kind='pot';mode='tool';const p=resolving?1:clamp((elapsed-pickup)/(C.enemyGuardMs-pickup),0,1);target=mix(C.potHome,{x:C.enemyHead.x+C.potOffset,y:C.enemyHead.y-C.enemyHead.r+7},p);}
    }else if(m.phase==='react'){mode='rps';target=C.enemyRps;}
    if(resolving){
      if(mode!=='idle'){target=mix(target,rest,recovery);mode=recovery===1?'idle':'recover';}
      if(recovery===1)kind=null;
    }
    return {...armPose(C.enemyShoulder,target,C.enemyUpperArm,C.enemyForearm,1),kind,mode,visible:mode!=='idle',value:mode==='rps'?m.enemy:null};
  }
  function playerPose(m){
    const age=Math.max(0,m.time-m.resolvedAt),frozen=['resolve','end'].includes(m.phase)&&age<240?m.frozenTool:null;
    let mode='idle',target={x:810,y:665},kind=null,angle=-Math.PI/2;
    if(m.held){mode='tool';target={...m.tool};kind=m.held;angle=m.tool.angle;
      if(kind==='pot'&&m.equipped){const p=clamp((m.time-m.readyAt)/C.snapMs,0,1);target={x:m.snapFrom.x+(C.playerHead.x+C.potOffset-m.snapFrom.x)*p,y:m.snapFrom.y+(C.playerHead.y-C.playerHead.r+7-m.snapFrom.y)*p};}
    }else if(frozen){mode='recover';kind=frozen.kind;angle=frozen.angle;const p=clamp(age/240,0,1);target={x:frozen.x+(810-frozen.x)*p,y:frozen.y+(665-frozen.y)*p};}
    else if(m.phase==='react'){mode='rps';target=C.playerRps;}
    const pose=armPose(C.shoulder,target,C.upperArm,C.forearm,kind==='pot'?1:-1);
    return {...pose,kind,angle,mode,visible:mode!=='idle',value:mode==='rps'?m.player:null};
  }
  function render(ctx,m,options={}){
    const t=m.time,age=['resolve','end'].includes(m.phase)?Math.max(0,t-m.resolvedAt):9999;
    const impact=['hit','hurt','block','guarded'].includes(m.result)&&age<360;
    const idle=Math.sin(t/650)*1.3,hit=m.result==='hit'?Math.sin(clamp(age/420,0,1)*Math.PI):0,hurt=m.result==='hurt'?Math.sin(clamp(age/420,0,1)*Math.PI):0;
    ctx.save();ctx.fillStyle='#213237';ctx.fillRect(0,0,1200,720);
    if(impact&&!options.reduced){const p=1-age/360;ctx.translate(Math.sin(age/17)*4*p,Math.cos(age/21)*2*p);}
    function path(points,fill,stroke='#172b31',width=4){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}}
    function line(points,color,width){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
    function oval(x,y,rx,ry,fill,stroke='#1a3035',width=3){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}}
    function rect(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
    function text(s,x,y,size=16,color='#f0dfb7',align='center'){ctx.font=`600 ${size}px "Malgun Gothic",sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
    function arm(p,color,width=44){
      const {shoulder:s,elbow:e,wrist:w}=p;
      line([[s.x,s.y],[e.x,e.y],[w.x,w.y]],'#182e34',width+7);line([[s.x,s.y],[e.x,e.y]],color,width);line([[e.x,e.y],[w.x,w.y]],color,width-6);line([[s.x+3,s.y-8],[e.x+3,e.y-8]],'#ffffff16',4);
      const dx=w.x-e.x,dy=w.y-e.y,d=Math.hypot(dx,dy)||1;
      line([[w.x-dx/d*20-dy/d*13,w.y-dy/d*20+dx/d*13],[w.x-dx/d*20+dy/d*13,w.y-dy/d*20-dx/d*13]],'#dedfcb',8);
    }
    function hand(x,y,value,scale=1,angle=0){
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);oval(0,0,24,29,'#d9ad86');
      const fingers=value===0?[[-10,-54],[8,-58]]:value===2?[[-21,-45],[-8,-59],[6,-62],[20,-51]]:[];
      for(const [dx,dy]of fingers){line([[dx*.7,-13],[dx,dy]],'#1b3035',14);line([[dx*.7,-13],[dx,dy]],'#ddb18b',9);}
      line([[-19,8],[-30,-4]],'#c99470',13);if(value===1||value===null)for(let i=0;i<3;i++)line([[-13+i*10,-14],[-13+i*10,-2]],'#a4785d',2);ctx.restore();
    }
    function hammer(w,a=-Math.PI/2){
      ctx.save();ctx.translate(w.x,w.y);ctx.rotate(a+Math.PI/2);line([[0,12],[0,-C.hammerLength]],'#25383a',17);line([[0,12],[0,-C.hammerLength]],'#c9a56a',10);
      ctx.beginPath();ctx.roundRect(-45,-C.hammerLength-24,90,48,9);ctx.fillStyle='#b34337';ctx.fill();ctx.strokeStyle='#26383a';ctx.lineWidth=4;ctx.stroke();line([[-32,-C.hammerLength-15],[-32,-C.hammerLength+12]],'#ed9b67',5);line([[30,-C.hammerLength-15],[30,-C.hammerLength+12]],'#87382f',5);ctx.restore();
    }
    function pot(w,worn=false,metalHit=false){
      const x=w.x-C.potOffset,y=w.y+(metalHit?Math.sin(age/15)*Math.max(0,1-age/260)*3:0);ctx.save();ctx.translate(x,y);
      ctx.beginPath();ctx.moveTo(-72,8);ctx.quadraticCurveTo(-65,-51,0,-53);ctx.quadraticCurveTo(65,-51,72,8);ctx.closePath();ctx.fillStyle='#bacac5';ctx.fill();ctx.strokeStyle='#2b4449';ctx.lineWidth=4;ctx.stroke();oval(0,8,76,9,'#789393');line([[-49,-20],[-26,-37],[15,-38]],'#eff0d9',5);line([[65,0],[80,0]],'#273f45',12);line([[-67,0],[-87,0]],'#273f45',10);if(worn)line([[-66,12],[66,12]],'#e0e8d4',3);ctx.restore();
    }
    const bg=ctx.createLinearGradient(0,0,1200,650);bg.addColorStop(0,'#6e8177');bg.addColorStop(1,'#263f44');ctx.fillStyle=bg;ctx.fillRect(0,0,1200,720);
    for(const x of [55,920]){rect(x,0,220,550,'#263e40');rect(x+10,0,200,538,'#9ba793');for(let j=0;j<4;j++)rect(x+20+j*48,280-j*27,33,258+j*27,'#758b81');line([[x+110,0],[x+110,540]],'#3c5556',7);line([[x+10,160],[x+210,160]],'#3c5556',7);}
    rect(332,27,310,66,'#2e4648');line([[332,27],[642,27]],'#c0aa72',2);text('公 正 · 均 衡',487,56,20);text('사내 공인 신입 연수장',487,79,11,'#a7b9ac');rect(0,550,1200,170,'#2a3c3e');
    // Left opponent is waist-up and turned toward the foreground player.
    path([[355,720],[327,456],[370,379],[445,354],[513,355],[576,397],[624,720]],'#b6b79e');path([[370,379],[441,355],[457,415],[415,451]],'#d1d0b6');path([[513,355],[548,380],[501,453],[472,415]],'#e1ddc0');
    path([[453,382],[475,386],[487,418],[471,441],[496,586],[470,622],[451,588],[459,441],[444,419]],'#795047');line([[354,478],[370,635]],'#93977f',4);line([[548,474],[576,642]],'#8d947c',4);path([[451,301],[448,372],[470,391],[504,361],[509,301]],'#bd906c');
    const ex=C.enemyHead.x+hit*15,ey=C.enemyHead.y+idle-hit*10;ctx.save();ctx.translate(ex,ey);ctx.rotate(hit*.12);oval(0,0,76+hit*3,99-hit*6,'#dab28c');path([[19,-72],[64,-49],[77,12],[56,62],[15,88],[24,38],[36,5]],'#b98767',null);path([[-74,-10],[-83,-57],[-60,-94],[-13,-110],[40,-100],[77,-68],[67,-33],[31,-59],[-7,-67],[-45,-41]],'#293638');line([[-57,-61],[-22,-80],[27,-77]],'#52605b',4);oval(-69,15,12,22,'#bd916e');path([[46,-12],[82,23],[48,30]],'#bd8a65','#6e5a49',2);line([[-40,-21],[-12,-29]],'#293638',6);line([[17,-26],[43,-17]],'#293638',6);
    if(hit){line([[-40,0],[-16,13],[-35,22]],'#293638',4);line([[17,0],[38,14],[20,22]],'#293638',4);oval(1,56,16,23,'#674b40');}else{oval(-27,3,16,10,'#eee6cc','#5d5c4c',2);oval(29,7,11,9,'#eee6cc','#5d5c4c',2);oval(-20,3,5,8,'#33474a',null);oval(33,7,4,7,'#33474a',null);line([[-22,58],[14,61],[31,55]],'#6d5042',3);}line([[-31,39],[-18,43]],'#b48464',2);ctx.restore();
    // Long edges run across the screen; actors retain their diagonal positions.
    const corners=C.table.map(p=>[p.x,p.y]);
    const [ta,tb,tc,td]=corners;
    path(corners,'#9d8158');
    path([td,tc,[tc[0],tc[1]+22],[td[0],td[1]+22]],'#725c3d');
    path([ta,td,[td[0],td[1]+22],[ta[0],ta[1]+22]],'#806844');
    line([[ta[0]+5,ta[1]+2],[tb[0]-5,tb[1]+2]],'#d3b98a',4);
    line([[td[0]+8,td[1]-5],[tc[0]-8,tc[1]-5]],'#d3b98a',4);
    line([[td[0]+25,td[1]+22],[td[0]+18,720]],'#443e32',12);
    line([[tc[0]-25,tc[1]+22],[tc[0]-18,720]],'#443e32',12);
    const ep=enemyPose(m),pp=playerPose(m);
    if(ep.kind!=='hammer'&&pp.kind!=='hammer')hammer(C.hammerHome);
    if(ep.kind!=='pot'&&pp.kind!=='pot')pot(C.potHome);
    // Foreground is strictly the back of the head and jacket: no facial plane or ear.
    path([[752,720],[755,595],[755,532],[739,498],[803,515],[900,509],[994,550],[1090,623],[1164,720]],'#2d4652');
    path([[807,469],[805,528],[844,549],[899,526],[896,466]],'#b78f6f');
    path([[739,498],[805,520],[847,546],[899,519],[959,536],[908,565],[844,577],[789,549]],'#bfcab6');
    line([[844,580],[870,648],[889,720]],'#203943',5);line([[994,568],[1040,689]],'#57707a',4);line([[774,590],[773,689]],'#203943',4);
    ctx.save();ctx.translate(C.playerHead.x-hurt*11,C.playerHead.y+idle+hurt*9);ctx.rotate(-.12-hurt*.07);
    oval(0,0,89,113-hurt*5,'#263941');
    path([[-85,-20],[-77,-72],[-34,-108],[17,-115],[65,-84],[88,-30],[76,45],[51,94],[25,102],[2,91],[-23,101],[-55,81],[-79,37]],'#283b43');
    line([[-60,-56],[-27,-84],[16,-93],[51,-72]],'#43565d',5);
    line([[62,-49],[69,-9],[61,39]],'#354b53',4);
    line([[-51,70],[-24,84],[1,77],[23,88],[47,77]],'#1b3038',4);ctx.restore();
    function actorArm(p,color,width){
      if(!p.visible)return;
      arm(p,color,width);
      if(p.kind==='hammer')hammer(p.wrist,p.angle);
      if(p.kind==='pot')pot(p.wrist,m.equipped,m.result==='block'||m.result==='guarded');
      hand(p.wrist.x,p.wrist.y,p.value,p.mode==='rps'?1:.64,p.mode==='rps'?.05:0);
    }
    actorArm(ep,'#afb097',42);actorArm(pp,'#3e5c69',46);
    if(m.phase==='react'){text('최주임 · '+names[m.enemy],490,100,16);text('도전자 · '+names[m.player],850,255,16);}
    if(['select','react'].includes(m.phase))for(const [p,label]of [[C.hammerHome,'망치 손잡이'],[C.potHome,'냄비 테두리']]){oval(p.x,p.y,23,23,'#f1d89b14','#deca99',1.5);text(label,p.x,p.y+49,13);}
    if(m.held==='hammer'&&m.trace.length>1){for(let i=1;i<m.trace.length;i++){ctx.globalAlpha=i/m.trace.length*.45;line([[m.trace[i-1].x,m.trace[i-1].y],[m.trace[i].x,m.trace[i].y]],'#ffda82',3);}ctx.globalAlpha=1;}
    if(impact&&m.contact)for(let i=0;i<8;i++){const a=i*Math.PI/4,p=age/360;ctx.globalAlpha=1-p;line([[m.contact.x+Math.cos(a)*(50+p*30),m.contact.y+Math.sin(a)*(50+p*30)],[m.contact.x+Math.cos(a)*(65+p*80),m.contact.y+Math.sin(a)*(65+p*80)]],m.result==='block'?'#e1f4e9':'#ffdb87',4);}ctx.globalAlpha=1;
    if(m.phase==='react'){rect(482,687,445,4,'#455d58');rect(482,687,445*Math.max(0,1-(t-m.reactAt)/C.reactMs),4,'#ddbf7c');}
    if(m.phase==='resolve'){const copy={hit:'뿅!',hurt:'뿅!',block:'깡!',guarded:'깡!',miss:'휙…',foul:'파울',tie:'재경기'};text(copy[m.result],770,110,38,m.result==='foul'?'#ffab7f':'#f4d695');}ctx.restore();
  }
  root.WGG.render=render;root.WGG.armPose=armPose;root.WGG.enemyPose=enemyPose;root.WGG.playerPose=playerPose;
})(globalThis);
