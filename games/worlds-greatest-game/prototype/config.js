(function (root) {
  'use strict';
  const config = {
    width: 1200, height: 720,
    revealMs: 0, reactMs: 1700, recoverMs: 300,
    enemyGuardMs: 1100, enemyStrikeMs: 1050, tieMs: 450,
    swingMinLength: 90, swingMinSpeed: 460, hammerRadius: 29,
    equipRadius: 38, equipMs: 70, snapMs: 90,
    hitstopMs: 85, targetScore: 3,
    playerHead: { x: 850, y: 330, r: 85 },
    enemyHead: { x: 490, y: 230, r: 76 },
    shoulder: { x: 760, y: 480 }, upperArm: 155, forearm: 160,
    enemyShoulder: { x: 555, y: 390 }, enemyUpperArm: 165, enemyForearm: 175,
    hammerHome: { x: 650, y: 600 }, potHome: { x: 970, y: 600 },
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
