(function (root) {
  'use strict';
  const config = {
    width: 1200, height: 720,
    revealMs: 0, reactMs: 1700, recoverMs: 300,
    enemyGuardMs: 1100, enemyStrikeMs: 1050, tieMs: 450,
    swingMinLength: 90, swingMinSpeed: 460, hammerRadius: 29,
    equipRadius: 38, equipMs: 70, snapMs: 90,
    hitstopMs: 85, targetScore: 3,
    playerHead: { x: 920, y: 270, r: 110 },
    enemyHead: { x: 420, y: 210, r: 76 },
    shoulder: { x: 805, y: 520 }, upperArm: 155, forearm: 165,
    enemyShoulder: { x: 535, y: 365 }, enemyUpperArm: 165, enemyForearm: 175,
    rpsUpperArm: 85, rpsForearm: 105,
    potUpperArm: 220, potForearm: 235, potWearOffset: 160,
    hammerHome: { x: 530, y: 540 }, potHome: { x: 715, y: 480 },
    hammerHomeAngle: -2.9,
    enemyRps: { x: 620, y: 350 }, playerRps: { x: 650, y: 430 },
    table: [{x:80,y:485},{x:840,y:395},{x:1200,y:650},{x:0,y:720}],
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
