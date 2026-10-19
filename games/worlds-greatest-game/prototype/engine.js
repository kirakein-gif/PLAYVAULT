(function (root) {
  'use strict';
  const C = typeof module === 'object' ? require('./config.js') : root.WGG_CONFIG;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const outcome = (a, b) => a === b ? 'tie' : (a + 2) % 3 === b ? 'win' : 'lose';
  class Match {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset() {
      this.phase = 'select'; this.time = 0; this.round = 1;
      this.player = null; this.enemy = null; this.result = null;
      this.score = { player: 0, enemy: 0 }; this.events = [];
      this.clearTools();
    }
    clearTools() {
      this.held = null; this.pointerId = null; this.equipped = false;
      this.tool = null; this.trace = []; this.pathLength = 0;
      this.alignSince = null; this.readyAt = null;
    }
    choose(hand) {
      if (this.phase !== 'select' || !Number.isInteger(hand) || hand < 0 || hand > 2) return false;
      this.player = hand; this.enemy = Math.floor(this.random() * 3);
      this.rule = outcome(this.player, this.enemy);
      this.phase = 'reveal'; this.phaseAt = this.time; this.events.push('cue');
      return true;
    }
    tick(now) {
      this.time = Math.max(this.time, now);
      if (this.phase === 'reveal' && this.time - this.phaseAt >= C.revealMs) {
        this.phase = 'react'; this.reactAt = this.time;
      }
    }
    drainEvents() { return this.events.splice(0); }
  }
  const api = { Match, C, dist, clamp, outcome };
  if (typeof module === 'object') module.exports = api;
  else root.WGG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
