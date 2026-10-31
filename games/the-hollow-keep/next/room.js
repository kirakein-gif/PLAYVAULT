// Shared by the browser and simulation playtests so terrain checks use the actual room.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HKRoom = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  return {
    width:960, height:540, pit:{left:470,right:555},
    solids:[{x:-20,y:0,w:20,h:560},{x:960,y:0,w:20,h:560},
      {x:0,y:490,w:470,h:70},{x:555,y:490,w:405,h:70},
      {x:220,y:420,w:90,h:16},{x:330,y:350,w:100,h:16},{x:440,y:210,w:95,h:16},
      {x:680,y:380,w:140,h:20},{x:915,y:340,w:25,h:150}],
    dummies:[{id:'near',x:162,y:430,w:30,h:60,hp:1000},{id:'far',x:850,y:430,w:30,h:60,hp:1000}],
    labels:[{x:215,y:411,text:'낮음 · +70'},{x:327,y:340,text:'중간 · +70'},
      {x:430,y:198,text:'높음 · +140 / Noah'},{x:482,y:475,text:'85px 구덩이'},
      {x:686,y:368,text:'낮은 천장'},{x:898,y:328,text:'벽'},
      {x:120,y:517,text:'가까운 표적'},{x:820,y:517,text:'먼 표적'}]
  };
});
