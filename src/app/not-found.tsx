import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="hero not-found">
      <div className="wrap">
        <p className="eyebrow">
          <i /> Frame 404
        </p>
        <h1>
          This frame is <span className="gradient-text">empty</span>.
        </h1>
        <p className="sub">
          The page you asked for is not here. It may have moved, or the link may have a typo.
        </p>
        <div className="cta">
          <Link href="/" className="button primary">
            Back to the start
          </Link>
          <Link href="/install" className="button">
            Install Fanimate
          </Link>
        </div>
      </div>
    </section>
  );
}
