"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitch from "./ThemeSwitch";

const LINKS: { href: string; label: string; extra?: boolean }[] = [
  { href: "/#features", label: "Features", extra: true },
  { href: "/assistant", label: "Assistant", extra: true },
  { href: "/install", label: "Install" },
  { href: "https://github.com/toonittmedia/fanimate/tree/main/docs", label: "Docs", extra: true },
  { href: "https://github.com/toonittmedia/fanimate", label: "Source" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="brand" aria-label="Fanimate home">
          <img src="/brand/fanimate-icon-small.svg" alt="" width={28} height={28} />
          <span>Fanimate</span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          {LINKS.map((l) => {
            const external = l.href.startsWith("http");
            const current = !external && !l.href.includes("#") && pathname === l.href;
            const cls = l.extra ? "nav-extra" : undefined;
            return external ? (
              <a key={l.href} href={l.href} className={cls} rel="noopener">
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className={cls} aria-current={current ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <ThemeSwitch />
      </div>
    </header>
  );
}
