"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CodeBlock.module.css";

type Props = {
  /** The text to show and copy. */
  code: string;
  /** A short label above the code, such as "PowerShell". */
  label?: string;
};

/** A block of commands with a Copy button. */
export default function CodeBlock({ code, label }: Props) {
  const [copied, setCopied] = useState<"" | "ok" | "failed">("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    let state: "ok" | "failed" = "ok";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      state = "failed";
    }
    setCopied(state);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className={styles.block}>
      <div className={styles.bar}>
        <span className={styles.label}>{label ?? ""}</span>
        <button type="button" className={styles.copy} onClick={copy} aria-label={label ? `Copy ${label} commands` : "Copy"}>
          {copied === "ok" ? "Copied" : copied === "failed" ? "Select and copy" : "Copy"}
        </button>
      </div>
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
      <span className={styles.live} aria-live="polite">
        {copied === "ok" ? "Copied" : copied === "failed" ? "Could not copy: select the text and copy it" : ""}
      </span>
    </div>
  );
}
