"use client";

import { useEffect, useState } from "react";

type Theme = "night" | "studio-grey" | "day";

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: "night", label: "Night theme", color: "#15111F" },
  { id: "studio-grey", label: "Studio Grey theme", color: "#2B2B2B" },
  { id: "day", label: "Day theme", color: "#FAF8FF" },
];

const KEY = "fanimate-theme";

function isTheme(v: unknown): v is Theme {
  return v === "night" || v === "studio-grey" || v === "day";
}

function setMetaColor(color: string) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
}

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (isTheme(current)) {
      setTheme(current);
      const t = THEMES.find((x) => x.id === current);
      if (t) setMetaColor(t.color);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "day" : "night");
    }
  }, []);

  function choose(t: (typeof THEMES)[number]) {
    document.documentElement.setAttribute("data-theme", t.id);
    try {
      localStorage.setItem(KEY, t.id);
    } catch {
      // Storage can be blocked; the theme still applies for this page.
    }
    setMetaColor(t.color);
    setTheme(t.id);
  }

  return (
    <div className="theme-switch" role="group" aria-label="Colour theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-dot theme-${t.id}`}
          aria-pressed={theme === t.id}
          aria-label={t.label}
          title={t.label}
          onClick={() => choose(t)}
        />
      ))}
    </div>
  );
}
