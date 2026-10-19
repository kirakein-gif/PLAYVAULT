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
    let kind=null,target=rest;
    if(m.phase==='react'&&m.rule==='lose'||resolving&&['hurt','block'].includes(m.result)){
      kind='hammer';const wind=clamp(elapsed/(C.enemyStrikeMs-260),0,1),swing=clamp((elapsed-C.enemyStrikeMs+260)/260,0,1);
      const blocked=m.result==='block'||m.phase==='react'&&m.equipped;
      target={x:640-30*wind+(C.playerHead.x-610)*swing,y:300-145*wind+((blocked?C.playerHead.y-C.playerHead.r+7:C.playerHead.y)+C.hammerLength-155)*swing};
    }else if(m.phase==='react'&&m.rule==='win'&&elapsed>C.enemyGuardMs-260||resolving&&m.result==='guarded'){
      kind='pot';const p=resolving?1:clamp((elapsed-C.enemyGuardMs+260)/260,0,1);
      target={x:640+(C.enemyHead.x+C.potOffset-640)*p,y:550+(C.enemyHead.y-C.enemyHead.r+7-550)*p};
    }
    if(resolving){target={x:target.x+(rest.x-target.x)*recovery,y:target.y+(rest.y-target.y)*recovery};if(recovery===1)kind=null;}
    return {...armPose(C.enemyShoulder,target,C.enemyUpperArm,C.enemyForearm,1),kind};
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
    // Right foreground head and shoulders face left, with neck and side profile.
    path([[652,720],[665,542],[737,464],[793,446],[899,440],[1007,481],[1095,574],[1177,720]],'#2d4652');path([[741,472],[785,446],[810,480],[784,513]],'#d3d8c4');path([[899,440],[937,454],[906,507],[855,481]],'#c6cfba');path([[805,397],[803,467],[835,484],[892,454],[898,388]],'#be9574');line([[1007,505],[1051,637]],'#58717a',4);line([[722,552],[694,650]],'#1b343e',4);
    ctx.save();ctx.translate(C.playerHead.x-hurt*11,C.playerHead.y+idle+hurt*9);ctx.rotate(-hurt*.07);oval(0,0,89,113-hurt*5,'#263941');path([[-72,-35],[-86,-5],[-99,18],[-79,28],[-73,68],[-45,93],[-24,74],[-40,23],[-34,-39]],'#c19a78');path([[-71,-56],[-38,-105],[24,-115],[72,-83],[89,-28],[54,-46],[12,-67],[-30,-45]],'#263941');line([[11,-91],[55,-65],[69,-31]],'#43555a',4);oval(59,23,16,26,'#c19a78');line([[60,11],[52,22],[63,30]],'#916b54',3);line([[-80,2],[-65,-4]],'#263941',4);ctx.restore();
    const open=m.player!==null,bounce=m.phase==='react'?Math.sin(clamp((t-m.phaseAt)/100,0,1)*Math.PI)*5:0;
    const eh=open?{x:635,y:435-bounce}:{x:390,y:555},ph=open?{x:714,y:488-bounce}:{x:1000,y:650};
    arm(armPose({x:390,y:404},eh,145,150,1),'#abad94',38);hand(eh.x,eh.y,open?m.enemy:null,1.08,.12);arm(armPose({x:1000,y:505},ph,150,155,-1),'#3a5563',43);hand(ph.x,ph.y,open?m.player:null,1.04,-.12);if(open){text(names[m.enemy],620,510,18);text(names[m.player],712,555,18);}
    // Narrow equipment shelf, at the actors' waist rather than a distant table.
    path([[430,577],[1124,577],[1200,720],[348,720]],'#947850');line([[436,585],[1127,585]],'#cfb281',5);line([[356,705],[1190,705]],'#66533b',8);
    const frozen=['resolve','end'].includes(m.phase)&&age<280?m.frozenTool:null,kind=m.held||frozen?.kind;
    if(kind!=='hammer')hammer(C.hammerHome);if(kind!=='pot')pot(C.potHome);
    let wrist=m.held?{...m.tool}:frozen?{...frozen}:{x:922,y:555};
    if(m.held==='pot'&&m.equipped){const p=clamp((t-m.readyAt)/C.snapMs,0,1);wrist={x:m.snapFrom.x+(C.playerHead.x+C.potOffset-m.snapFrom.x)*p,y:m.snapFrom.y+(C.playerHead.y-C.playerHead.r+7-m.snapFrom.y)*p};}
    if(frozen){const p=clamp(age/280,0,1);wrist={x:wrist.x+(922-wrist.x)*p,y:wrist.y+(555-wrist.y)*p};}
    const ep=enemyPose(m);arm(ep,'#afb097',42);if(ep.kind==='hammer')hammer(ep.wrist);if(ep.kind==='pot')pot(ep.wrist,true,m.result==='guarded');hand(ep.wrist.x,ep.wrist.y,null,.68);
    const pp=armPose(C.shoulder,wrist,C.upperArm,C.forearm);arm(pp,'#3e5c69',46);if(kind==='hammer'&&age<280||m.held==='hammer')hammer(pp.wrist,m.tool?.angle??frozen?.angle??-Math.PI/2);if(kind==='pot'&&age<280||m.held==='pot')pot(pp.wrist,m.equipped,m.result==='block');hand(pp.wrist.x,pp.wrist.y,null,.64);
    if(['select','react'].includes(m.phase))for(const [p,label]of [[C.hammerHome,'망치 손잡이'],[C.potHome,'냄비 테두리']]){oval(p.x,p.y,23,23,'#f1d89b14','#deca99',1.5);text(label,p.x,684,13);}
    if(m.held==='hammer'&&m.trace.length>1){for(let i=1;i<m.trace.length;i++){ctx.globalAlpha=i/m.trace.length*.45;line([[m.trace[i-1].x,m.trace[i-1].y],[m.trace[i].x,m.trace[i].y]],'#ffda82',3);}ctx.globalAlpha=1;}
    if(impact&&m.contact)for(let i=0;i<8;i++){const a=i*Math.PI/4,p=age/360;ctx.globalAlpha=1-p;line([[m.contact.x+Math.cos(a)*(50+p*30),m.contact.y+Math.sin(a)*(50+p*30)],[m.contact.x+Math.cos(a)*(65+p*80),m.contact.y+Math.sin(a)*(65+p*80)]],m.result==='block'?'#e1f4e9':'#ffdb87',4);}ctx.globalAlpha=1;
    if(m.phase==='react'){rect(433,709,690,4,'#455d58');rect(433,709,690*Math.max(0,1-(t-m.reactAt)/C.reactMs),4,'#ddbf7c');}
    if(m.phase==='resolve'){const copy={hit:'뿅!',hurt:'뿅!',block:'깡!',guarded:'깡!',miss:'휙…',foul:'파울',tie:'재경기'};text(copy[m.result],770,110,38,m.result==='foul'?'#ffab7f':'#f4d695');}ctx.restore();
  }
  root.WGG.render=render;root.WGG.armPose=armPose;root.WGG.enemyPose=enemyPose;
})(globalThis);
