(function (root) {
  'use strict';
  const config = {
    width: 1200, height: 720,
    revealMs: 650, reactMs: 3000, recoverMs: 1250,
    enemyGuardMs: 2250, enemyStrikeMs: 2100, tieMs: 1200,
    swingMinLength: 105, swingMinSpeed: 460, hammerRadius: 29,
    equipRadius: 43, equipMs: 130, snapMs: 160,
    hitstopMs: 85, targetScore: 3,
    playerHead: { x: 255, y: 405, r: 57 },
    enemyHead: { x: 795, y: 215, r: 56 },
    shoulder: { x: 385, y: 540 }, upperArm: 250, forearm: 260,
    hammerHome: { x: 520, y: 570 }, potHome: { x: 835, y: 570 },
    hammerLength: 95, potOffset: 80, grabRadius: 35
  };
  if (typeof module === 'object') module.exports = config;
  else root.WGG_CONFIG = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
