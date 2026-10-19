(function (root) {
  'use strict';
  const { C } = root.WGG;
  const names = ['가위', '바위', '보'];
  function render(ctx, m, options = {}) {
    const t = m.time, idle = Math.sin(t / 600) * 2;
    ctx.save();
    ctx.fillStyle = '#344b50'; ctx.fillRect(0, 0, 1200, 720);
    function rect(x,y,w,h,fill,stroke='#172d32',lw=3) { ctx.beginPath();ctx.rect(x,y,w,h);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke(); }
    function oval(x,y,rx,ry,fill,stroke='#172d32',lw=4) {ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
    function line(points,color,width) {ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
    function text(s,x,y,size=16,color='#eee1be',align='center') {ctx.fillStyle=color;ctx.font=`bold ${size}px "Malgun Gothic",sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y);}
    const bg=ctx.createLinearGradient(0,0,0,720);bg.addColorStop(0,'#557371');bg.addColorStop(1,'#24383e');ctx.fillStyle=bg;ctx.fillRect(0,0,1200,720);
    for(let i=0;i<3;i++){const x=70+i*400;rect(x,25,280,285,'#243f46','#8faaa1',5);rect(x+12,37,256,260,'#9cae9d');for(let j=0;j<6;j++)rect(x+20+j*42,205-(j*37+i*13)%85,30,90+(j*37+i*13)%85,'#5e7a7a','#5e7a7a');line([[x+140,38],[x+140,298]],'#3a5658',7);line([[x+12,142],[x+268,142]],'#3a5658',7);}
    rect(475,33,250,78,'#263f43','#b5aa7a',2);text('公 正 · 均 衡',600,68,23);text('사내 공인 신입 연수장',600,94,12,'#b1c1b5');
    // Opponent in three-quarter view: far arm behind torso, asymmetrical face planes.
    const reaction=m.phase==='resolve'?Math.max(0,1-(t-m.resolvedAt)/650):0;
    const hit=reaction*(m.result==='hit'?1:0), ex=795+Math.sin(reaction*Math.PI)*24*hit;
    oval(812,470,125,22,'#182b3080');
    line([[865,320+idle],[906,370],[881,416]],'#20363b',45);
    ctx.beginPath();ctx.moveTo(730,298+idle);ctx.lineTo(841,286+idle);ctx.lineTo(884,460);ctx.lineTo(704,460);ctx.closePath();ctx.fillStyle='#b8b99e';ctx.fill();ctx.strokeStyle='#172d32';ctx.lineWidth=5;ctx.stroke();
    line([[779,300],[801,367],[779,435]],'#f0dfbd',16);line([[797,319],[812,373]],'#794d45',15);
    oval(ex,215+idle-hit*14,55+hit*7,70-hit*15,'#d7ad84');
    ctx.beginPath();ctx.moveTo(ex-55,207);ctx.quadraticCurveTo(ex-71,120,ex+21,139);ctx.quadraticCurveTo(ex+71,145,ex+47,185);ctx.lineTo(ex-15,171);ctx.closePath();ctx.fillStyle='#293336';ctx.fill();
    ctx.beginPath();ctx.moveTo(ex+22,184);ctx.lineTo(ex+53,224);ctx.lineTo(ex+21,241);ctx.fillStyle='#af7b5e';ctx.fill();
    line([[ex-36,193],[ex-12,188]],'#2b3537',5);line([[ex+9,188],[ex+29,195]],'#2b3537',5);
    if(hit){line([[ex-31,211],[ex-14,224],[ex-30,232]],'#27363a',4);line([[ex+12,211],[ex+28,224],[ex+12,232]],'#27363a',4);oval(ex+1,257,12,17,'#664642');}
    else {oval(ex-22,213,11,7,'#e8debc', '#29383a',2);oval(ex+19,214,8,7,'#e8debc','#29383a',2);oval(ex-19,213,3,5,'#23343a','#23343a',1);oval(ex+19,214,3,5,'#23343a','#23343a',1);line([[ex-12,257],[ex+17,254]],'#6e4e41',3);}
    // Perspective table and foreground shoulder silhouette.
    ctx.beginPath();ctx.moveTo(420,440);ctx.lineTo(1120,440);ctx.lineTo(1200,720);ctx.lineTo(300,720);ctx.closePath();ctx.fillStyle='#9e835e';ctx.fill();ctx.strokeStyle='#28383a';ctx.lineWidth=6;ctx.stroke();
    line([[413,470],[1126,470]],'#c5ab7c',3);line([[330,678],[1185,678]],'#735f47',6);
    ctx.beginPath();ctx.moveTo(85,720);ctx.quadraticCurveTo(92,520,207,495+idle);ctx.lineTo(298,488+idle);ctx.quadraticCurveTo(415,503,454,720);ctx.closePath();ctx.fillStyle='#29424e';ctx.fill();ctx.strokeStyle='#142c34';ctx.lineWidth=7;ctx.stroke();
    oval(255,405+idle,57,70,'#26363d');oval(303,422+idle,13,20,'#ca9d77');
    line([[207,471],[248,501],[285,478]],'#c5cfbc',12);line([[180,535],[150,635]],'#496575',6);
    // Both hands use identical reveal progress. Labels never disclose the rule outcome.
    const show=m.phase!=='select', revealing=m.phase==='reveal';
    const p=revealing?Math.min(1,(t-m.phaseAt)/C.revealMs):1;
    function hand(x,y,value,label,enemy) {
      const bounce=revealing?Math.sin(p*Math.PI*3)*14*(1-p):0;
      line(enemy?[[730,326],[660,365],[x,y+bounce]]:[[160,550],[145,473],[x,y+bounce]],enemy?'#a4a68e':'#385461',32);
      oval(x,y+bounce,29,27,'#dfb78f');
      if(value!==null){
        const fingers=value===0?[[-10,-53],[9,-56]]:value===2?[[-22,-45],[-8,-59],[6,-60],[20,-48]]:[];
        fingers.forEach(([dx,dy])=>line([[x+dx*.7,y-12+bounce],[x+dx,y+dy+bounce]],'#dfb78f',12));
      }
      text(label,x,y+58,12,'#e9d8b0');
      if(value!==null)text(names[value],x,y+81,18);
    }
    hand(158,367,show&&p>.75?m.player:null,'내 손',false);
    hand(654,309,show&&p>.75?m.enemy:null,'최주임의 손',true);
    text('내 머리',255,310,14,'#ede1be');
    if(root.WGG.drawTools)root.WGG.drawTools(ctx,m,{rect,oval,line,text},options);
    if(m.phase==='react'){const progress=Math.max(0,1-(t-m.reactAt)/C.reactMs);rect(475,698,650,5,'#445c5b','#445c5b',0);rect(475,698,650*progress,5,'#e4c37d','#e4c37d',0);}
    if(m.phase==='reveal')text('가위 · 바위 · 보',600,160,22);
    ctx.restore();
  }
  root.WGG.render=render;
})(globalThis);
