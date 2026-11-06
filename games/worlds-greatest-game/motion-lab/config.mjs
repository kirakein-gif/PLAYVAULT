// Metres, seconds, degrees. Elbow flexion = 180 - measured inner angle.
export const C = {
  version: '0.2',
  upper: .34, fore: .33, clavicle: .16,
  limits: { elbow: [0, 145], wristFlex: [-70, 70], wristSide: [-20, 30],
    shoulderYaw: [-100, 100], shoulderLift: [-15, 150], spine: [0, 16], spineTwist: [-12, 12], neck: [0, 22] },
  springOmega: 65, // exact critically damped step: 90% in 59.8ms
  toolLag: .025, gripSeconds: .1, hammerLength: .38,
  input: { maxTargetMetersPerPixel: .006, steerDegreesPerPixel: .065,
    maxSteerDegrees: 12, minGuideSegmentPixels:140, loadProgress: .46, peakProgress: .78, loadTolerance: .025,
    snapMax: 8, snapGain: 5 },
  swing: { minSpeed: .75, minTravel: .22, minDown: .08, radius: .065 },
  equip: { radius: .14, maxTilt: 20, seconds: .07 },
  timing: { pump: .45, reveal: .22, hold: .5, return: .25,
    lift: .2, load: .2, extend: .15, strike: .18,
    potOne: .285, potTwo: .365, potReturn: .325,
    enemyStart: .32, enemyReach: .20, enemyGuard: 1.10, reactionEnd: 1.70, hitstop: .065 },
  tableY: .84, seatZ: .49,
  poses: { smallPump: [50,75], smallShow:80, smallLift:62.5,
    largeShow:130, largeLift:55,
    hammerLift:[83,59], hammerLoad:[77,92], hammerPeak:[165,108], hammerHit:[165,95],
    potOne:[55,75],potTwo:[65,100] },
  homes: { hammer: [-.31, .91, -.03], pot: [-.05, .91, .15] },
};
export const DURATIONS = {
  get small(){return C.timing.pump * 2 + C.timing.reveal + C.timing.hold + C.timing.return;},
  get large(){return this.small;},
  hammer: C.timing.lift + C.timing.load + C.timing.extend + C.timing.strike,
  one: C.timing.potOne, two: C.timing.potTwo,
};
export const REFERENCE = [
  ['작게 흔들기 1회', .45, .50, C.timing.pump],
  ['내기', .20, .25, C.timing.reveal],
  ['유지', .50, .50, C.timing.hold],
  ['복귀', .20, .30, C.timing.return],
  ['망치 잡기 → 충돌', .65, .80, DURATIONS.hammer],
  ['마지막 내려치기', .15, .20, C.timing.strike],
  ['냄비 한 손', .27, .30, DURATIONS.one],
  ['냄비 두 손', .33, .40, DURATIONS.two],
  ['냄비 내려놓기', .30, .35, C.timing.potReturn],
];
