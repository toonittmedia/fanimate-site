'use client';
import type { ReactNode } from 'react';

import { RELEASES_PAGE, filesFor, checksums, webBuild, formatSize, versionLabel } from '@/lib/releases';
import { useRelease } from './useRelease';

type Found = { label: string; main: boolean; url: string; size: number; name: string };

export default function Downloads() {
  const { status, release, mine } = useRelease();

  let body: ReactNode;
  if (status === 'loading') {
    body = <p className="sub">Looking up the latest release…</p>;
  } else if (status === 'empty') {
    body = (
      <p className="sub">
        No release is published yet. Follow the <a href={RELEASES_PAGE}>GitHub releases page</a> for the first one.
      </p>
    );
  } else if (status !== 'ready' || !release) {
    body = (
      <p className="sub">
        The release list could not be loaded just now. Every installer is on the{' '}
        <a href={RELEASES_PAGE}>GitHub releases page</a>.
      </p>
    );
  } else {
    const platforms = filesFor(release).filter((p) => p.found.length > 0);
    platforms.sort((a, b) => Number(b.id === mine) - Number(a.id === mine));
    const sums = checksums(release);
    const web = webBuild(release);
    body = (
      <>
        <p className="sub">
          Version {versionLabel(release.tag_name)}, an alpha. Free, for Windows, macOS and Linux.
        </p>
        {platforms.length === 0 ? (
          <p className="sub">
            This release has no installers yet. Older ones are on the{' '}
            <a href={RELEASES_PAGE}>GitHub releases page</a>.
          </p>
        ) : (
          <div className="platforms">
            {platforms.map((p) => {
              const suggested = p.id === mine;
              const found = p.found as Found[];
              const main = found.find((f) => f.main);
              return (
                <div key={p.id} className={suggested ? 'platform suggested' : 'platform'}>
                  {suggested && <span className="badge">For this computer</span>}
                  <h3>{p.name}</h3>
                  <p className="fine">{p.note}</p>
                  <ul>
                    {found.map((f) => (
                      <li key={f.name}>
                        <a className={f.main ? 'button primary small' : undefined} href={f.url}>
                          {f.label}
                        </a>{' '}
                        {formatSize(f.size) && <span className="size mono">{formatSize(f.size)}</span>}
                      </li>
                    ))}
                  </ul>
                  {!main && <p className="fine">No installer in this release; use a portable build.</p>}
                </div>
              );
            })}
          </div>
        )}
        <p className="fine">
          {sums && (
            <>
              <a href={sums}>SHA-256 checksums</a>
              {' · '}
            </>
          )}
          {web && (
            <>
              <a href={web}>Browser build</a> (a player that opens and plays projects)
              {' · '}
            </>
          )}
          <a href={RELEASES_PAGE}>All releases</a>
        </p>
      </>
    );
  }

  return (
    <>
      <div aria-live="polite">{body}</div>
      <div className="callout" data-reveal>
        <strong>Not signed yet.</strong> The installers are not code-signed during the alpha, so Windows
        SmartScreen and macOS Gatekeeper warn the first time you open Fanimate. The app updates itself with
        downloads that are checked against our own signature. <a href="/install#unsigned">How to open it anyway</a>.
      </div>
    </>
  );
}
