'use client';

import { filesFor, versionLabel } from '@/lib/releases';
import { useRelease } from './useRelease';

const NAMES = { windows: 'Windows', macos: 'macOS', linux: 'Linux' } as const;

export default function HeroCta() {
  const { status, release, mine } = useRelease();
  let href = '#download';
  let label = 'Download Fanimate';
  if (status === 'ready' && release && mine) {
    const platform = filesFor(release).find((p) => p.id === mine);
    const main = platform?.found.find((f) => f?.main);
    if (main) {
      href = main.url;
      label = `Download for ${NAMES[mine]}`;
    }
  }
  return (
    <a className="button primary" href={href}>
      {label}
    </a>
  );
}

export function HeroVersion() {
  const { status, release } = useRelease();
  if (status === 'ready' && release) return <>version {versionLabel(release.tag_name)}</>;
  return <>free for everyone</>;
}
