(function (root) {
  'use strict';
  const config = {
    width: 1200, height: 720,
    revealMs: 0, reactMs: 1700, recoverMs: 300,
    enemyGuardMs: 1100, enemyStrikeMs: 1050, tieMs: 450,
    swingMinLength: 90, swingMinSpeed: 460, hammerRadius: 29,
    equipRadius: 38, equipMs: 70, snapMs: 90,
    hitstopMs: 85, targetScore: 3,
    playerHead: { x: 850, y: 400, r: 85 },
    enemyHead: { x: 490, y: 210, r: 76 },
    shoulder: { x: 730, y: 500 }, upperArm: 155, forearm: 160,
    enemyShoulder: { x: 555, y: 370 }, enemyUpperArm: 165, enemyForearm: 175,
    hammerHome: { x: 560, y: 515 }, potHome: { x: 740, y: 535 },
    enemyRps: { x: 650, y: 365 }, playerRps: { x: 695, y: 450 },
    table: [{x:390,y:480},{x:1000,y:450},{x:1090,y:600},{x:350,y:630}],
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
