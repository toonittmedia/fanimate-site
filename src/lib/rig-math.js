// The maths behind the hero rig: easing, looping keyframes, two-bone inverse
// kinematics and the skeleton of the character. Pure functions with no DOM, so
// the same file runs in the browser and in the tests.
//
// Space: x to the right, y DOWN, like Fanimate's documents. Frames are whole
// numbers from START to END and the animation loops.

export const START = 1;
export const END = 48;
export const PERIOD = END - START + 1;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- easing

const bounceOut = (t) => {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

/** Named easings, each maps 0..1 to 0..1 (overshoot and bounce leave the range on the way). */
export const EASINGS = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  overshoot: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  bounce: bounceOut,
};

export const EASING_NAMES = Object.keys(EASINGS);

export function ease(name, t) {
  const f = EASINGS[name] ?? EASINGS.smooth;
  return f(clamp(t, 0, 1));
}

// -------------------------------------------------------------- channels

/**
 * A channel is a sorted list of keys, `{ f, v }`, where `v` is an array of
 * numbers (one for a plain value, two for a position). The animation loops, so
 * after the last key the value runs on to the first key, one period later.
 */
export function evalChannel(keys, frame, easing = 'smooth') {
  if (keys.length === 0) return [];
  if (keys.length === 1) return keys[0].v.slice();
  const first = keys[0];
  const last = keys[keys.length - 1];
  // frames before the first key belong to the wrap segment
  let f = frame;
  if (f < first.f) f += PERIOD;
  let a = last;
  let b = { f: first.f + PERIOD, v: first.v };
  for (let i = 0; i < keys.length - 1; i++) {
    if (f >= keys[i].f && f < keys[i + 1].f) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = b.f - a.f;
  const t = span === 0 ? 0 : (f - a.f) / span;
  const e = ease(easing, t);
  return a.v.map((x, i) => lerp(x, b.v[i], e));
}

/** Put a key on `frame`, replacing the one already there. Returns the channel. */
export function setKey(keys, frame, v) {
  const at = keys.findIndex((k) => k.f === frame);
  if (at >= 0) keys[at] = { f: frame, v: v.slice() };
  else {
    keys.push({ f: frame, v: v.slice() });
    keys.sort((p, q) => p.f - q.f);
  }
  return keys;
}

/** Remove the key on `frame`, never the last one (a channel keeps a value). Returns whether it did. */
export function removeKey(keys, frame) {
  const at = keys.findIndex((k) => k.f === frame);
  if (at < 0 || keys.length <= 1) return false;
  keys.splice(at, 1);
  return true;
}

export const hasKey = (keys, frame) => keys.some((k) => k.f === frame);

/** The frame `by` steps from `frame`, wrapping inside START..END. */
export function wrapFrame(frame, by = 0) {
  return ((((frame - START + by) % PERIOD) + PERIOD) % PERIOD) + START;
}

// ------------------------------------------------------------------- IK

/**
 * Two bones from `root` that reach for `target`. Returns the middle joint and
 * the end, which is the target unless it is out of reach (then the limb
 * straightens towards it) or too close (then it is held at the shortest
 * reach). `bend` is +1 or -1 and says which way the middle joint bends.
 */
export function solveTwoBone(root, target, l1, l2, bend = 1) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const base = Math.atan2(dy, dx);
  const reach = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const cos = clamp((l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach), -1, 1);
  const angle = base + bend * Math.acos(cos);
  return {
    mid: { x: root.x + l1 * Math.cos(angle), y: root.y + l1 * Math.sin(angle) },
    end: { x: root.x + reach * Math.cos(base), y: root.y + reach * Math.sin(base) },
  };
}

// ------------------------------------------------------------- the rig

export const STAGE = { width: 640, height: 400, ground: 352 };
const HIP = { x: 320, y: 224 };
const TORSO = 88;
const SHOULDER_DX = 32;
const SHOULDER_DY = 12;
const HIP_DX = 16;
const ARM = [56, 54];
const LEG = [62, 62];
const HEAD_RISE = 36;

/** Channels of the rig, in the order the timeline lists them. */
export const CHANNELS = [
  { id: 'body', label: 'Body', size: 1 },
  { id: 'head', label: 'Head', size: 1 },
  { id: 'handL', label: 'Left hand', size: 2 },
  { id: 'handR', label: 'Right hand', size: 2 },
  { id: 'footL', label: 'Left foot', size: 2 },
  { id: 'footR', label: 'Right foot', size: 2 },
];

/** The keys the rig starts with: a wave and a march on the spot. */
export function defaultKeys() {
  const k = (f, ...v) => ({ f, v });
  return {
    body: [k(1, 0), k(7, -5), k(13, 3), k(19, -1), k(25, 0), k(31, -5), k(37, 3), k(43, -1)],
    head: [k(1, 0), k(13, 0.07), k(25, 0), k(37, -0.07)],
    handL: [k(1, 262, 262), k(10, 232, 104), k(16, 266, 92), k(22, 232, 104), k(28, 266, 92), k(34, 232, 104), k(40, 266, 92)],
    handR: [k(1, 372, 262), k(13, 380, 250), k(25, 372, 262), k(37, 364, 250)],
    footL: [k(1, 296, STAGE.ground), k(7, 290, STAGE.ground - 24), k(13, 296, STAGE.ground)],
    footR: [k(25, 344, STAGE.ground), k(31, 350, STAGE.ground - 24), k(37, 344, STAGE.ground)],
  };
}

/** Every channel at `frame`, as a pose. `override` replaces channels (a drag in progress). */
export function evalPose(keys, frame, easing = 'smooth', override = {}) {
  const at = (id) => override[id] ?? evalChannel(keys[id], frame, easing);
  const [body] = at('body');
  const [head] = at('head');
  const pt = (id) => {
    const [x, y] = at(id);
    return { x, y };
  };
  return { body, head, handL: pt('handL'), handR: pt('handR'), footL: pt('footL'), footR: pt('footR') };
}

/** Where every joint of the character is for a pose. */
export function skeleton(pose) {
  const hip = { x: HIP.x, y: HIP.y + pose.body };
  const neck = { x: hip.x, y: hip.y - TORSO };
  const shoulderL = { x: neck.x - SHOULDER_DX, y: neck.y + SHOULDER_DY };
  const shoulderR = { x: neck.x + SHOULDER_DX, y: neck.y + SHOULDER_DY };
  const hipL = { x: hip.x - HIP_DX, y: hip.y + 8 };
  const hipR = { x: hip.x + HIP_DX, y: hip.y + 8 };
  const armL = solveTwoBone(shoulderL, pose.handL, ARM[0], ARM[1], 1);
  const armR = solveTwoBone(shoulderR, pose.handR, ARM[0], ARM[1], -1);
  const legL = solveTwoBone(hipL, pose.footL, LEG[0], LEG[1], 1);
  const legR = solveTwoBone(hipR, pose.footR, LEG[0], LEG[1], -1);
  // the head turns about the neck
  const tilt = pose.head;
  const head = {
    x: neck.x + Math.sin(tilt) * HEAD_RISE,
    y: neck.y - Math.cos(tilt) * HEAD_RISE,
    tilt,
  };
  return { hip, neck, head, shoulderL, shoulderR, hipL, hipR, armL, armR, legL, legR };
}

/** The handles a person can drag, with what each one edits. */
export function handles(sk) {
  return [
    { id: 'handL', at: sk.armL.end },
    { id: 'handR', at: sk.armR.end },
    { id: 'footL', at: sk.legL.end },
    { id: 'footR', at: sk.legR.end },
    { id: 'body', at: sk.hip },
    { id: 'head', at: sk.head },
  ];
}

/** A drag to stage position `p` as the value of the handle's channel. */
export function valueFromDrag(id, p, current) {
  switch (id) {
    case 'handL':
    case 'handR':
      return [clamp(p.x, 40, STAGE.width - 40), clamp(p.y, 30, STAGE.ground)];
    case 'footL':
    case 'footR':
      // feet stay on or above the ground
      return [clamp(p.x, 200, 440), clamp(p.y, STAGE.ground - 90, STAGE.ground)];
    case 'body':
      return [clamp(p.y - HIP.y, -34, 14)];
    case 'head':
      return [clamp((p.x - 320) / 120, -0.6, 0.6)];
    default:
      return current;
  }
}
