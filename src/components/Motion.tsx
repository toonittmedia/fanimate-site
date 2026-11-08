"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Make every reveal element visible, whatever state the animation left it in. */
function showAll() {
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

/** Scroll reveals and light parallax for the whole site. Renders nothing. */
export default function Motion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      try {
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
          // CSS already hides these under .js; GSAP takes over the same start state.
          gsap.set(items, { opacity: 0, y: 24 });
          ScrollTrigger.batch(items, {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.08,
                overwrite: true,
              }),
          });

          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const amount = Number(el.dataset.parallax) || 0;
            if (!amount) return;
            gsap.fromTo(
              el,
              { y: -amount },
              {
                y: amount,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          });
        });
        mm.add("(prefers-reduced-motion: reduce)", () => {
          showAll();
        });
      } catch {
        showAll();
      }

      let cancelled = false;
      document.fonts?.ready
        .then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        })
        .catch(() => {});

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  // Safety net: if reveals have not run after a few seconds (blocked script, odd layout), show everything.
  useEffect(() => {
    const t = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && getComputedStyle(el).opacity === "0") {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 3000);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
