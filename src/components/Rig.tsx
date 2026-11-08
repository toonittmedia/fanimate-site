'use client';

// The hero demo: a tiny Fanimate in the page. A two-bone IK character you pose
// by dragging handles, a timeline of keys, onion skin and playback. The maths
// lives in rig-math.js (tested); this file is the React and GSAP side.

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  CHANNELS,
  EASING_NAMES,
  END,
  PERIOD,
  STAGE,
  START,
  clamp,
  defaultKeys,
  evalChannel,
  evalPose,
  handles,
  removeKey,
  setKey,
  skeleton,
  valueFromDrag,
  wrapFrame,
} from '@/lib/rig-math';
import styles from './Rig.module.css';

gsap.registerPlugin(useGSAP);

type Key = { f: number; v: number[] };
type Keys = Record<string, Key[]>;
type Pt = { x: number; y: number };
type Skel = ReturnType<typeof skeleton>;
type View = 'art' | 'both' | 'bones';
type Sel = { ch: string; f: number };
type Menu = Sel & { x: number; y: number };

const FPS = 24;
const STEP = 1 / FPS;
const NUDGE = 5;
const PAUSED_MSG = 'Paused to edit. In Fanimate nothing is edited while the animation plays.';
const HINT = 'Drag a teal handle to pose. Space plays, arrows nudge a handle, Delete removes a key.';
const LABEL: Record<string, string> = Object.fromEntries(CHANNELS.map((c) => [c.id, c.label]));
const HANDLE_LABEL: Record<string, string> = {
  handL: 'left hand', handR: 'right hand', footL: 'left foot', footR: 'right foot', body: 'body', head: 'head',
};
const lower = (id: string) => LABEL[id].toLowerCase();
const pos = (f: number) => `${((f - START + 0.5) / PERIOD) * 100}%`;
const seconds = (f: number) => ((f - START) / FPS).toFixed(2);
const TICKS = [START, ...Array.from({ length: Math.floor(END / 6) }, (_, i) => (i + 1) * 6)];

// ------------------------------------------------------------ drawing helpers

const line = (...p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('');

/** A Fanimate bone: a long kite from `a` to `b`, widest near the root. */
function kite(a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const w = Math.min(7, len * 0.14);
  const nx = (-dy / len) * w;
  const ny = (dx / len) * w;
  const mx = a.x + dx * 0.2;
  const my = a.y + dy * 0.2;
  return line(a, { x: mx + nx, y: my + ny }, b, { x: mx - nx, y: my - ny }) + 'Z';
}

function bonesOf(sk: Skel): [Pt, Pt][] {
  return [
    [sk.hip, sk.neck],
    [sk.neck, sk.head],
    [sk.shoulderL, sk.armL.mid], [sk.armL.mid, sk.armL.end],
    [sk.shoulderR, sk.armR.mid], [sk.armR.mid, sk.armR.end],
    [sk.hipL, sk.legL.mid], [sk.legL.mid, sk.legL.end],
    [sk.hipR, sk.legR.mid], [sk.legR.mid, sk.legR.end],
  ];
}

const GRID = (
  <g className={styles.grid} aria-hidden>
    {Array.from({ length: STAGE.width / 32 + 1 }, (_, i) => (
      <line key={`x${i}`} x1={i * 32} y1={0} x2={i * 32} y2={STAGE.height} />
    ))}
    {Array.from({ length: Math.floor(STAGE.height / 32) + 1 }, (_, i) => (
      <line key={`y${i}`} x1={0} y1={i * 32} x2={STAGE.width} y2={i * 32} />
    ))}
  </g>
);

function Character({ sk, pupilL, pupilR }: { sk: Skel; pupilL: (el: SVGCircleElement | null) => void; pupilR: (el: SVGCircleElement | null) => void }) {
  const { hip, neck, head, armL, armR, legL, legR } = sk;
  const limb = (root: Pt, l: { mid: Pt; end: Pt }) => line(root, l.mid, l.end);
  const torso =
    `M${hip.x - 30} ${hip.y + 14}L${neck.x - 36} ${neck.y + 16}Q${neck.x} ${neck.y - 12} ${neck.x + 36} ${neck.y + 16}` +
    `L${hip.x + 30} ${hip.y + 14}Q${hip.x} ${hip.y + 26} ${hip.x - 30} ${hip.y + 14}Z`;
  return (
    <g className={styles.art}>
      <g data-pop><ellipse cx={hip.x} cy={STAGE.ground + 4} rx={72} ry={8} fill="#000" opacity={0.16} /></g>
      <g data-pop>
        <path d={limb(sk.hipR, legR)} className={styles.limb} stroke="#2b2660" strokeWidth={18} />
        <path d={limb(sk.hipL, legL)} className={styles.limb} stroke="#332d72" strokeWidth={18} />
        <ellipse cx={legR.end.x + 7} cy={legR.end.y - 4} rx={15} ry={8} fill="#ffd23f" />
        <ellipse cx={legL.end.x - 7} cy={legL.end.y - 4} rx={15} ry={8} fill="#ffcb1f" />
      </g>
      <g data-pop>
        <path d={limb(sk.shoulderR, armR)} className={styles.limb} stroke="#6a4ee6" strokeWidth={15} />
        <circle cx={armR.end.x} cy={armR.end.y} r={9} fill="#eab78e" />
      </g>
      <g data-pop><path d={torso} fill="#7c5cff" /><path d={line({ x: hip.x - 29, y: hip.y + 4 }, { x: hip.x + 29, y: hip.y + 4 })} stroke="#5b3fd9" strokeWidth={5} /></g>
      <g data-pop>
        <path d={limb(sk.shoulderL, armL)} className={styles.limb} stroke="#8a6cff" strokeWidth={15} />
        <circle cx={armL.end.x} cy={armL.end.y} r={9} fill="#f4c7a1" />
      </g>
      <g data-pop>
        <g transform={`translate(${head.x.toFixed(1)} ${head.y.toFixed(1)}) rotate(${((head.tilt * 180) / Math.PI).toFixed(2)})`}>
          <circle r={34} fill="#f4c7a1" />
          <path d="M-35 -2A35 35 0 0 1 35 -2Q24 -20 4 -15Q-14 -24 -35 -2Z" fill="#3a2418" />
          <ellipse cx={-12} cy={0} rx={7} ry={8.5} fill="#fff" />
          <ellipse cx={12} cy={0} rx={7} ry={8.5} fill="#fff" />
          <circle ref={pupilL} cx={-12} cy={1} r={3.6} fill="#1d1b2e" />
          <circle ref={pupilR} cx={12} cy={1} r={3.6} fill="#1d1b2e" />
          <circle cx={-21} cy={12} r={5} fill="#ff8fa3" opacity={0.6} />
          <circle cx={21} cy={12} r={5} fill="#ff8fa3" opacity={0.6} />
          <path d="M-8 15Q0 22 8 15" fill="none" stroke="#7a3b2e" strokeWidth={3} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Bones({ sk }: { sk: Skel }) {
  const bones = bonesOf(sk);
  return (
    <g className={styles.bones} aria-hidden>
      {bones.map(([a, b], i) => <path key={i} d={kite(a, b)} />)}
      {bones.map(([a], i) => <circle key={`j${i}`} cx={a.x} cy={a.y} r={3} />)}
    </g>
  );
}

function Ghost({ sk, future }: { sk: Skel; future?: boolean }) {
  return (
    <g className={future ? styles.ghostFuture : styles.ghostPast} aria-hidden>
      {bonesOf(sk).slice(2).map(([a, b], i) => <path key={i} d={line(a, b)} />)}
      <path d={line(sk.hip, sk.neck)} />
      <circle cx={sk.head.x} cy={sk.head.y} r={30} />
    </g>
  );
}

const ICON: Record<string, ReactNode> = {
  first: <path d="M3.5 3v10M13 3.5 6 8l7 4.5z" />,
  prev: <path d="M11.5 3.5 4.5 8l7 4.5z" />,
  play: <path d="M5 3l8 5-8 5z" />,
  pause: <path d="M5 3.5v9M11 3.5v9" />,
  next: <path d="M4.5 3.5 11.5 8l-7 4.5z" />,
  last: <path d="M12.5 3v10M3 3.5 10 8l-7 4.5z" />,
};
const Icon = ({ name }: { name: string }) => <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden>{ICON[name]}</svg>;

// ---------------------------------------------------------------- component

export default function Rig() {
  const [keys, setKeys] = useState<Keys>(() => defaultKeys() as Keys);
  const [frame, setFrame] = useState(START);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<View>('both');
  const [onion, setOnion] = useState(false);
  const [easing, setEasing] = useState('smooth');
  const [sel, setSel] = useState<Sel | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [drag, setDrag] = useState<{ id: string; v: number[] } | null>(null);
  const [status, setStatus] = useState('Drag a handle to pose the character. Each pose sets a key.');

  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const visible = useRef(true);
  const pulse = useRef<gsap.core.Tween | null>(null);
  const pupils = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc }[]>([]);
  const pupilEls = useRef<(SVGCircleElement | null)[]>([null, null]);

  const pose = useMemo(
    () => evalPose(keys, frame, easing, drag ? { [drag.id]: drag.v } : {}),
    [keys, frame, easing, drag],
  );
  const sk = useMemo(() => skeleton(pose), [pose]);
  const ghosts = useMemo(
    () => (onion ? [-6, -3, 3].map((d) => ({ d, sk: skeleton(evalPose(keys, wrapFrame(frame, d), easing)) })) : []),
    [onion, keys, frame, easing],
  );

  // ------------------------------------------------------------- GSAP setup

  useGSAP(
    () => {
      pupils.current = pupilEls.current.map((el) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' }),
      }));
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ delay: 0.1 });
        tl.from('[data-pop]', {
          opacity: 0, scale: 0.4, y: 14, transformOrigin: '50% 100%', duration: 0.55,
          stagger: 0.07, ease: 'back.out(1.9)', clearProps: 'transform,opacity',
        }).from('[data-handle]', {
          opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.35,
          stagger: 0.05, ease: 'back.out(2.6)', clearProps: 'transform,opacity',
        }, '-=0.15');
        pulse.current = gsap.fromTo(
          '[data-pulse]',
          { attr: { r: 8 }, opacity: 0.75 },
          { attr: { r: 21 }, opacity: 0, duration: 1.3, ease: 'power2.out', repeat: -1, repeatDelay: 1.1, delay: tl.duration() },
        );
        setPlaying(true);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const firstTouch = useCallback(() => {
    if (!pulse.current) return;
    pulse.current.kill();
    pulse.current = null;
    if (root.current) gsap.set(root.current.querySelectorAll('[data-pulse]'), { opacity: 0 });
  }, []);

  // Playback: the GSAP ticker accumulates real time and steps whole frames at 24 fps.
  useEffect(() => {
    let acc = 0;
    const tick = (_t: number, dt: number) => {
      if (!playingRef.current || !visible.current || document.hidden) {
        acc = 0;
        return;
      }
      acc += Math.min(dt, 100) / 1000;
      let steps = 0;
      while (acc >= STEP) {
        acc -= STEP;
        steps++;
      }
      if (steps) setFrame((f) => wrapFrame(f, steps));
    };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (root.current) io.observe(root.current);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  // Close the context menu on an outside press.
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const away = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [menu]);

  // ---------------------------------------------------------------- editing

  /** Editing pauses playback, as in the app. Returns whether it had to. */
  const pauseForEdit = () => {
    if (!playingRef.current) return false;
    setPlaying(false);
    setStatus(PAUSED_MSG);
    return true;
  };

  const commit = (id: string, v: number[], at: number) => {
    setKeys((k) => ({ ...k, [id]: setKey(k[id].slice(), at, v) }));
    setSel({ ch: id, f: at });
    setStatus(`Keyed ${lower(id)} on frame ${at}.`);
  };

  const toStage = (e: { clientX: number; clientY: number }): Pt => {
    const m = svg.current?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const onHandleDown = (id: string) => (e: ReactPointerEvent<SVGGElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    firstTouch();
    setMenu(null);
    if (!pauseForEdit()) setStatus(`Posing the ${HANDLE_LABEL[id]}.`);
    setDrag({ id, v: evalChannel(keys[id], frame, easing) });
  };

  const onHandleMove = (id: string) => (e: ReactPointerEvent<SVGGElement>) => {
    if (!drag || drag.id !== id) return;
    setDrag({ id, v: valueFromDrag(id, toStage(e), drag.v) });
  };

  const onHandleUp = (id: string) => (e: ReactPointerEvent<SVGGElement>) => {
    if (!drag || drag.id !== id) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    commit(id, drag.v, frame);
    setDrag(null);
  };

  const onHandleKey = (id: string, at: Pt) => (e: ReactKeyboardEvent<SVGGElement>) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    firstTouch();
    pauseForEdit();
    const cur = evalChannel(keys[id], frame, easing);
    // the head handle maps x to tilt about the stage centre, so nudge in that space
    const from = id === 'head' ? { x: STAGE.width / 2 + cur[0] * 120, y: at.y } : at;
    commit(id, valueFromDrag(id, { x: from.x + d[0] * NUDGE, y: from.y + d[1] * NUDGE }, cur), frame);
  };

  const deleteKey = (s: Sel) => {
    if (keys[s.ch].length <= 1) {
      setStatus(`A channel always keeps one key, so the last ${lower(s.ch)} key stays.`);
      return;
    }
    pauseForEdit();
    setKeys((k) => {
      const next = k[s.ch].slice();
      removeKey(next, s.f);
      return { ...k, [s.ch]: next };
    });
    setSel(null);
    setStatus(`Deleted the ${lower(s.ch)} key on frame ${s.f}.`);
  };

  const goTo = (f: number, pause = true) => {
    if (pause) setPlaying(false);
    setFrame(clamp(f, START, END));
  };

  const togglePlay = () => {
    setPlaying((p) => !p);
    setMenu(null);
  };

  const reset = () => {
    setKeys(defaultKeys() as Keys);
    setSel(null);
    setMenu(null);
    goTo(START);
    setStatus('Back to the starting animation.');
  };

  const allKeyFrames = useMemo(
    () => [...new Set(Object.values(keys).flatMap((k) => k.map((q) => q.f)))].sort((a, b) => a - b),
    [keys],
  );

  // ------------------------------------------------------------- timeline

  const frameAt = (e: { clientX: number }, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return clamp(Math.floor(((e.clientX - r.left) / r.width) * PERIOD) + START, START, END);
  };

  const onRulerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setMenu(null);
    goTo(frameAt(e, e.currentTarget));
  };

  const onRulerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) goTo(frameAt(e, e.currentTarget));
  };

  const onRulerKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const to: Record<string, number> = {
      ArrowLeft: wrapFrame(frame, -1), ArrowRight: wrapFrame(frame, 1), PageUp: wrapFrame(frame, -6),
      PageDown: wrapFrame(frame, 6), Home: START, End: END,
    };
    if (!(e.key in to)) return;
    e.preventDefault();
    e.stopPropagation();
    goTo(to[e.key]);
  };

  const openMenu = (s: Sel) => (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const box = root.current?.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX || r.left + r.width / 2;
    const cy = e.clientY || r.bottom;
    setSel(s);
    const x = cx - (box?.left ?? 0);
    setMenu({ ...s, x: clamp(x, 4, (box?.width ?? 400) - 180), y: cy - (box?.top ?? 0) });
  };

  const onRootKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'SELECT' || t.tagName === 'INPUT') return;
    if (e.key === 'Escape' && menu) {
      setMenu(null);
    } else if (e.key === ' ' && !t.dataset.play) {
      e.preventDefault();
      togglePlay();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) {
      e.preventDefault();
      setMenu(null);
      deleteKey(sel);
    }
  };

  // ----------------------------------------------------------------- render

  const hs = handles(sk);
  const menuLast = menu ? keys[menu.ch].length <= 1 : false;

  return (
    <div ref={root} className={styles.rig} onKeyDown={onRootKey} onKeyUp={(e) => e.key === ' ' && e.preventDefault()}>
      <div className={styles.toolbar}>
        <div className={styles.title}>
          <strong>Try it</strong>
          <span>Drag the teal handles, then press play.</span>
        </div>
        <div className={styles.controls}>
          <div className={styles.segmented} role="group" aria-label="Show">
            {(['art', 'both', 'bones'] as View[]).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
                {v === 'art' ? 'Art' : v === 'both' ? 'Art and bones' : 'Bones'}
              </button>
            ))}
          </div>
          <button type="button" className={styles.toggle} aria-pressed={onion} onClick={() => setOnion((o) => !o)}>
            Onion skin
          </button>
          <label className={styles.select}>
            <span>Interpolation</span>
            <select value={easing} onChange={(e) => setEasing(e.target.value)}>
              {EASING_NAMES.map((n) => <option key={n} value={n}>{n[0].toUpperCase() + n.slice(1)}</option>)}
            </select>
          </label>
          <button type="button" className={styles.button} onClick={reset}>Reset</button>
        </div>
      </div>

      <div className={styles.stage}>
        <svg
          ref={svg}
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          role="group"
          aria-label="Character stage"
          data-view={view}
          onPointerMove={(e) => {
            const p = toStage(e);
            const dx = p.x - sk.head.x;
            const dy = p.y - sk.head.y;
            const d = Math.hypot(dx, dy) || 1;
            const k = (Math.min(1, d / 90) * 3.2) / d;
            const c = Math.cos(-sk.head.tilt);
            const s = Math.sin(-sk.head.tilt);
            for (const q of pupils.current) {
              q.x((dx * c - dy * s) * k);
              q.y((dx * s + dy * c) * k);
            }
          }}
          onPointerLeave={() => pupils.current.forEach((q) => (q.x(0), q.y(0)))}
        >
          {GRID}
          <line className={styles.ground} x1={0} y1={STAGE.ground} x2={STAGE.width} y2={STAGE.ground} />
          {ghosts.map((g) => <Ghost key={g.d} sk={g.sk} future={g.d > 0} />)}
          <Character sk={sk} pupilL={(el) => void (pupilEls.current[0] = el)} pupilR={(el) => void (pupilEls.current[1] = el)} />
          {view !== 'art' && <Bones sk={sk} />}
          {hs.map((h) => (
            <g key={h.id} transform={`translate(${h.at.x.toFixed(1)} ${h.at.y.toFixed(1)})`}>
              <g
                data-handle
                className={styles.handle}
                data-active={drag?.id === h.id || undefined}
                tabIndex={0}
                role="button"
                aria-label={`Move the ${HANDLE_LABEL[h.id]}. Arrow keys nudge it and set a key.`}
                onPointerDown={onHandleDown(h.id)}
                onPointerMove={onHandleMove(h.id)}
                onPointerUp={onHandleUp(h.id)}
                onPointerCancel={onHandleUp(h.id)}
                onKeyDown={onHandleKey(h.id, h.at)}
              >
                <circle r={18} className={styles.hit} />
                <circle r={8} data-pulse className={styles.pulse} />
                <circle r={13} className={styles.ring} />
                <circle r={7} className={styles.dot} />
              </g>
            </g>
          ))}
        </svg>
      </div>

      <div className={styles.timeline}>
        <div className={styles.transport}>
          <button type="button" aria-label="First frame" onClick={() => goTo(START)}><Icon name="first" /></button>
          <button type="button" aria-label="Previous frame" onClick={() => goTo(wrapFrame(frame, -1))}><Icon name="prev" /></button>
          <button type="button" data-play="1" className={styles.play} aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          <button type="button" aria-label="Next frame" onClick={() => goTo(wrapFrame(frame, 1))}><Icon name="next" /></button>
          <button type="button" aria-label="Last frame" onClick={() => goTo(END)}><Icon name="last" /></button>
          <span className={styles.counter}>
            Frame {frame} of {END}<span className={styles.secs}>{seconds(frame)} s</span>
          </span>
          <span className={styles.pill}>Loop</span>
        </div>
        <div className={styles.grid2} style={{ gridTemplateRows: `28px repeat(${CHANNELS.length}, 26px)` }}>
          <div className={styles.corner} />
          <div
            className={styles.ruler}
            role="slider"
            tabIndex={0}
            aria-label="Playhead"
            aria-valuemin={START}
            aria-valuemax={END}
            aria-valuenow={frame}
            aria-valuetext={`Frame ${frame}`}
            onPointerDown={onRulerDown}
            onPointerMove={onRulerMove}
            onKeyDown={onRulerKey}
          >
            {TICKS.map((t) => <span key={t} className={styles.tick} style={{ left: pos(t) }}>{t}</span>)}
          </div>
          {CHANNELS.map((c) => (
            <Fragment key={c.id}>
              <div className={styles.label}>{c.label}</div>
              <div className={styles.track}>
                {keys[c.id].map((k) => {
                  const on = sel?.ch === c.id && sel.f === k.f;
                  return (
                    <button
                      key={k.f}
                      type="button"
                      className={styles.key}
                      style={{ left: pos(k.f) }}
                      aria-pressed={on}
                      aria-label={`${c.label} key on frame ${k.f}`}
                      onClick={() => { setSel({ ch: c.id, f: k.f }); setMenu(null); goTo(k.f); }}
                      onContextMenu={openMenu({ ch: c.id, f: k.f })}
                    />
                  );
                })}
              </div>
            </Fragment>
          ))}
          <div className={styles.playLayer} aria-hidden>
            <div className={styles.playhead} style={{ left: pos(frame) }} data-key={allKeyFrames.includes(frame) || undefined} />
          </div>
        </div>
        {menu && (
          <div ref={menuRef} className={styles.menu} role="menu" style={{ left: menu.x, top: menu.y }}>
            <button type="button" role="menuitem" onClick={() => { goTo(menu.f); setMenu(null); }}>
              Go to this key
            </button>
            <button type="button" role="menuitem" disabled={menuLast} onClick={() => { deleteKey(menu); setMenu(null); }}>
              Delete key<kbd>Del</kbd>
            </button>
          </div>
        )}
      </div>

      <div className={styles.statusbar}>
        <p role="status">{status}</p>
        <p className={styles.hint}>{HINT}</p>
      </div>
    </div>
  );
}
