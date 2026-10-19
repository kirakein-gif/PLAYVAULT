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
    shoulder: { x: 805, y: 520 }, upperArm: 170, forearm: 180,
    enemyShoulder: { x: 520, y: 330 }, enemyUpperArm: 180, enemyForearm: 190,
    rpsUpperArm: 130, rpsForearm: 150,
    potUpperArm: 220, potForearm: 235, potWearOffset: 160,
    hammerHome: { x: 530, y: 600 }, potHome: { x: 675, y: 540 },
    hammerHomeAngle: -2.9,
    enemyRps: { x: 650, y: 445 }, playerRps: { x: 635, y: 485 },
    table: [{x:50,y:555},{x:840,y:465},{x:1250,y:720},{x:-100,y:790}],
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
