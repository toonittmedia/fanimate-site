import Link from "next/link";

const GH = "https://github.com/toonittmedia/fanimate";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-about">
          <Link href="/" className="brand">
            <img src="/brand/fanimate-icon-small.svg" alt="" width={24} height={24} />
            <span>Fanimate</span>
          </Link>
          <p className="fine">
            Free and open source under the MIT or Apache-2.0 licence, at your choice. Fanimate uses no code,
            artwork or text from Moho, Adobe Animate or Toon Boom Harmony. Those names belong to their owners
            and are used only to describe compatibility.
          </p>
        </div>
        <nav aria-label="Get Fanimate" className="footer-col">
          <h2>Get it</h2>
          <Link href="/install">Install</Link>
          <Link href="/assistant">Assistant</Link>
          <Link href="/whats-new">What&apos;s new</Link>
        </nav>
        <nav aria-label="Learn" className="footer-col">
          <h2>Learn</h2>
          <a href={`${GH}/tree/main/docs`}>Documentation</a>
          <a href={GH}>GitHub source</a>
          <a href={`${GH}/issues/new/choose`}>Report a bug</a>
        </nav>
        <nav aria-label="Community" className="footer-col">
          <h2>Community</h2>
          <a href={`${GH}/blob/main/CODE_OF_CONDUCT.md`}>Code of conduct</a>
          <a href={`${GH}/blob/main/SECURITY.md`}>Security</a>
        </nav>
      </div>
      <div className="wrap footer-base fine">
        <span>Rig it. Draw it. Move it.</span>
        <span className="mono">fanimate.org</span>
      </div>
    </footer>
  );
}
