'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AssistantIcon } from './FeatureIcons';
import styles from './Chat.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ASK = 'Fade the title in over the first half second.';

// A picture of the Assistant panel, not a working one. Everything is in the markup, so it reads the
// same without JavaScript; the script only hides the steps and plays them back once it is on screen.
export default function Chat() {
  const root = useRef<HTMLDivElement>(null);
  const typed = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const text = typed.current;
      if (!el || !text) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', el);
      const card = el.querySelector<HTMLElement>('[data-changes]');
      el.classList.add(styles.armed);
      gsap.set(steps, { autoAlpha: 0, y: 10 });
      text.textContent = '';

      const typing = { n: 0 };
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.35, ease: 'power2.out' },
        onComplete: () => el.classList.remove(styles.armed),
      });
      tl.to(steps[0], { autoAlpha: 1, y: 0 })
        .to(typing, {
          n: ASK.length,
          duration: ASK.length * 0.03,
          ease: 'none',
          onUpdate: () => {
            text.textContent = ASK.slice(0, Math.round(typing.n));
          },
        })
        .add(() => el.classList.remove(styles.armed));
      for (const step of steps.slice(1)) tl.to(step, { autoAlpha: 1, y: 0 }, '+=0.35');
      if (card) {
        tl.fromTo(
          card,
          { boxShadow: '0 0 0 0 var(--accent)' },
          { boxShadow: '0 0 0 3px var(--accent)', duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' },
          '-=0.1',
        );
      }

      const st = ScrollTrigger.create({ trigger: el, start: '40% bottom', once: true, onEnter: () => tl.play() });
      // a page opened already scrolled past the panel shows it finished
      if (st.progress >= 1) tl.progress(1);
    },
    { scope: root },
  );

  return (
    <div className={styles.panel} ref={root}>
      <div className={styles.head}>
        <AssistantIcon className={styles.icon} />
        <span>Assistant</span>
        <span className={styles.model}>your key</span>
      </div>
      <div className={styles.log}>
        <div className={`${styles.bubble} ${styles.user}`} data-step>
          <span ref={typed}>{ASK}</span>
          <span className={styles.caret} aria-hidden="true" />
        </div>
        <div className={styles.bubble} data-step>
          The title now starts see-through on frame 1 and is fully visible by frame 12. Undo takes both
          changes back in one step.
        </div>
        <div className={styles.changes} data-step data-changes>
          <div className={styles.changesHead}>2 changes, one undo step</div>
          <ul>
            <li>Set opacity on &ldquo;Title&rdquo;</li>
            <li>Set opacity on &ldquo;Title&rdquo; at frame 12</li>
          </ul>
          <div className={styles.actions}>
            <button type="button" className="button small" tabIndex={-1}>
              Undo
            </button>
            <button type="button" className="button small" tabIndex={-1}>
              Show
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles.foot} mono`}>Context: Title, frame 1</div>
    </div>
  );
}
