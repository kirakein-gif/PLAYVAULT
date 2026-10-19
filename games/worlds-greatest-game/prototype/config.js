(function (root) {
  'use strict';
  const config = {
    width: 1200, height: 720,
    revealMs: 0, reactMs: 1700, recoverMs: 300,
    countdownMs: 3000, autoNextMs: 900,
    enemyGuardMs: 1100, enemyStrikeMs: 1050, tieMs: 450,
    swingMinLength: 90, swingMinSpeed: 460, hammerRadius: 29,
    equipRadius: 38, equipMs: 70, snapMs: 90,
    hitstopMs: 85, targetScore: 4, maxEnergy: 100, hitDamage: 25,
    playerHead: { x: 920, y: 270, r: 110 },
    enemyHead: { x: 420, y: 210, r: 76 },
    enemyCrown: { x: 420, y: 85, r: 26 },
    playerCrown: { x: 920, y: 140, r: 32 },
    shoulder: { x: 925, y: 495 }, upperArm: 210, forearm: 220,
    enemyShoulder: { x: 210, y: 390 }, enemyUpperArm: 210, enemyForearm: 220,
    enemyMaxLean: 240,
    rpsUpperArm: 130, rpsForearm: 150,
    potUpperArm: 220, potForearm: 235, potWearOffset: 160,
    hammerHome: { x: 480, y: 610 }, potHome: { x: 675, y: 540 },
    hammerHomeAngle: -2.9,
    enemyRps: { x: 400, y: 425 }, playerRps: { x: 755, y: 470 },
    table: [{x:96,y:540},{x:1104,y:540},{x:1420,y:800},{x:-220,y:800}],
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
