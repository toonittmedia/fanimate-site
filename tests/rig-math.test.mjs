import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CHANNELS, END, PERIOD, START, STAGE, defaultKeys, ease, evalChannel, evalPose, handles, removeKey, setKey,
  skeleton, solveTwoBone, valueFromDrag, wrapFrame, hasKey,
} from '../src/lib/rig-math.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} is not near ${b}`);

test('every easing starts at 0 and ends at 1, and the unknown name is smooth', () => {
  for (const name of ['linear', 'smooth', 'overshoot', 'bounce']) {
    near(ease(name, 0), 0, 1e-9);
    near(ease(name, 1), 1, 1e-9);
  }
  near(ease('nonsense', 0.5), ease('smooth', 0.5));
  // out of range input is held
  near(ease('linear', -1), 0);
  near(ease('linear', 5), 1);
  // overshoot goes past 1 on the way, bounce comes back from it
  assert.ok(ease('overshoot', 0.7) > 1);
  assert.ok(ease('smooth', 0.25) < 0.25);
});

test('a channel is its key on the key and between keys on the way', () => {
  const keys = [{ f: 1, v: [0] }, { f: 11, v: [100] }];
  near(evalChannel(keys, 1, 'linear')[0], 0);
  near(evalChannel(keys, 6, 'linear')[0], 50);
  near(evalChannel(keys, 6, 'smooth')[0], 50);
  near(evalChannel(keys, 3, 'smooth')[0], 100 * ease('smooth', 0.2));
});

test('after the last key the value runs round to the first, so the loop has no jump', () => {
  const keys = [{ f: 1, v: [0] }, { f: 25, v: [48] }];
  // from frame 25 to frame 49 (= frame 1) it returns from 48 to 0
  near(evalChannel(keys, 25, 'linear')[0], 48);
  near(evalChannel(keys, 37, 'linear')[0], 24);
  near(evalChannel(keys, END, 'linear')[0], 48 - (23 / 24) * 48, 1e-9);
  // and frames before the first key are on the same wrap segment
  const late = [{ f: 10, v: [0] }, { f: 30, v: [10] }];
  near(evalChannel(late, 1, 'linear')[0], evalChannel(late, 1 + PERIOD, 'linear')[0]);
  const a = evalChannel(late, END, 'linear')[0];
  const b = evalChannel(late, START, 'linear')[0];
  assert.ok(Math.abs(a - b) < 2, 'neighbouring frames across the loop are close');
});

test('positions interpolate each number, and an empty or single channel is safe', () => {
  const keys = [{ f: 1, v: [0, 100] }, { f: 3, v: [20, 0] }];
  const [x, y] = evalChannel(keys, 2, 'linear');
  near(x, 10);
  near(y, 50);
  assert.deepEqual(evalChannel([], 5), []);
  assert.deepEqual(evalChannel([{ f: 7, v: [3, 4] }], 40), [3, 4]);
});

test('setting a key replaces one on the frame and keeps the keys in order', () => {
  const keys = [{ f: 1, v: [0] }, { f: 20, v: [5] }];
  setKey(keys, 10, [9]);
  assert.deepEqual(keys.map((k) => k.f), [1, 10, 20]);
  setKey(keys, 10, [4]);
  assert.equal(keys.length, 3);
  assert.deepEqual(keys[1].v, [4]);
  // the value is copied, so a later change to the caller's array cannot reach in
  const v = [1];
  setKey(keys, 30, v);
  v[0] = 99;
  assert.equal(keys.at(-1).v[0], 1);
  assert.ok(hasKey(keys, 30) && !hasKey(keys, 31));
});

test('a key can be removed, but never the last one', () => {
  const keys = [{ f: 1, v: [0] }, { f: 20, v: [5] }];
  assert.equal(removeKey(keys, 99), false);
  assert.equal(removeKey(keys, 20), true);
  assert.equal(removeKey(keys, 1), false, 'the channel keeps one key');
  assert.equal(keys.length, 1);
});

test('frames wrap inside the range', () => {
  assert.equal(wrapFrame(END, 1), START);
  assert.equal(wrapFrame(START, -1), END);
  assert.equal(wrapFrame(10, 0), 10);
  assert.equal(wrapFrame(10, PERIOD * 3 + 2), 12);
  assert.equal(wrapFrame(START, -PERIOD * 5 - 1), END);
});

test('two-bone IK puts the end on a reachable target, with the right limb lengths', () => {
  const root = { x: 100, y: 100 };
  for (const bend of [1, -1]) {
    const target = { x: 150, y: 170 };
    const { mid, end } = solveTwoBone(root, target, 60, 50, bend);
    near(end.x, 150, 1e-6);
    near(end.y, 170, 1e-6);
    near(Math.hypot(mid.x - root.x, mid.y - root.y), 60, 1e-6);
    near(Math.hypot(end.x - mid.x, end.y - mid.y), 50, 1e-6);
  }
  // the two bends are mirror images across the line to the target
  const up = solveTwoBone(root, { x: 100, y: 190 }, 60, 50, 1).mid;
  const down = solveTwoBone(root, { x: 100, y: 190 }, 60, 50, -1).mid;
  near(up.x - 100, -(down.x - 100), 1e-6);
});

test('out of reach the limb straightens towards the target; too close it stays bent', () => {
  const root = { x: 0, y: 0 };
  const far = solveTwoBone(root, { x: 1000, y: 0 }, 60, 50, 1);
  near(far.end.x, 110, 0.01);
  near(far.mid.y, 0, 0.5);
  const same = solveTwoBone(root, { x: 0, y: 0 }, 60, 50, 1);
  assert.ok(Number.isFinite(same.mid.x) && Number.isFinite(same.end.x));
  const near_ = solveTwoBone(root, { x: 1, y: 0 }, 60, 50, 1);
  assert.ok(Math.hypot(near_.end.x, near_.end.y) >= 10 - 0.01, 'held at the shortest reach');
});

test('hostile numbers never make a NaN joint', () => {
  for (const t of [{ x: NaN, y: 0 }, { x: Infinity, y: 5 }, { x: 1e308, y: -1e308 }]) {
    const r = solveTwoBone({ x: 0, y: 0 }, t, 60, 50, 1);
    if ([t.x, t.y].every(Number.isFinite)) {
      assert.ok(Number.isFinite(r.mid.x) && Number.isFinite(r.end.y));
    }
  }
});

test('the default animation is a loop: the last frame is next to the first', () => {
  const keys = defaultKeys();
  for (const c of CHANNELS) {
    assert.ok(keys[c.id].length >= 1, c.id);
    for (const k of keys[c.id]) {
      assert.equal(k.v.length, c.size, `${c.id} key on ${k.f}`);
      assert.ok(k.f >= START && k.f <= END, `${c.id} key on ${k.f} is inside the range`);
    }
    const sorted = keys[c.id].every((k, i, a) => i === 0 || a[i - 1].f < k.f);
    assert.ok(sorted, `${c.id} keys are in order and unique`);
    // no jump across the loop point: the pose changes little from END to START
    const a = evalChannel(keys[c.id], END, 'smooth');
    const b = evalChannel(keys[c.id], START, 'smooth');
    a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) < 25, `${c.id} jumps ${Math.abs(x - b[i])} across the loop`));
  }
});

test('the skeleton keeps its limb lengths on every frame, and the feet stay on or above the ground', () => {
  const keys = defaultKeys();
  for (let f = START; f <= END; f++) {
    const pose = evalPose(keys, f, 'smooth');
    const sk = skeleton(pose);
    near(Math.hypot(sk.armL.mid.x - sk.shoulderL.x, sk.armL.mid.y - sk.shoulderL.y), 56, 1e-6);
    near(Math.hypot(sk.legR.mid.x - sk.hipR.x, sk.legR.mid.y - sk.hipR.y), 62, 1e-6);
    assert.ok(sk.legL.end.y <= STAGE.ground + 1e-6, `left foot below the ground on ${f}`);
    assert.ok(sk.legR.end.y <= STAGE.ground + 1e-6, `right foot below the ground on ${f}`);
    for (const j of [sk.armL.mid, sk.armR.end, sk.legL.mid, sk.head]) {
      assert.ok(Number.isFinite(j.x) && Number.isFinite(j.y));
    }
  }
});

test('an override replaces a channel while it is dragged, and nothing else', () => {
  const keys = defaultKeys();
  const base = evalPose(keys, 5, 'smooth');
  const dragged = evalPose(keys, 5, 'smooth', { handL: [300, 120] });
  assert.deepEqual(dragged.handL, { x: 300, y: 120 });
  assert.deepEqual(dragged.handR, base.handR);
  assert.equal(dragged.body, base.body);
});

test('drags are held to what the character can do', () => {
  assert.deepEqual(valueFromDrag('handL', { x: -500, y: 9999 }, null), [40, STAGE.ground]);
  const foot = valueFromDrag('footR', { x: 320, y: 0 }, null);
  assert.equal(foot[1], STAGE.ground - 90);
  assert.ok(valueFromDrag('body', { x: 0, y: -999 }, null)[0] >= -34);
  assert.ok(Math.abs(valueFromDrag('head', { x: 9999, y: 0 }, null)[0]) <= 0.6);
  assert.equal(valueFromDrag('unknown', { x: 1, y: 1 }, 'kept'), 'kept');
});

test('there is a handle for each thing that can be posed', () => {
  const sk = skeleton(evalPose(defaultKeys(), 1, 'smooth'));
  assert.deepEqual(handles(sk).map((h) => h.id).sort(), ['body', 'footL', 'footR', 'handL', 'handR', 'head']);
});
