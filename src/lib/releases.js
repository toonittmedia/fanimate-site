// Turning GitHub's list of releases into what the download section shows.
// Pure functions with no DOM, tested in tests/releases.test.mjs.
//
// Asset names are the ones the Fanimate release workflow makes (see
// docs/install.md in the app repository):
//   Fanimate-<version>-windows-x64-setup.exe
//   Fanimate-<version>-macos-arm64.dmg
//   Fanimate-<version>-linux-x86_64.AppImage
//   fanimate_<version>_amd64.deb
//   Fanimate-<version>-linux-x86_64.flatpak
//   fanimate-<version>-<platform>.zip | .tar.gz   (portable)
//   fanimate-<version>-web.zip                    (the browser build)
//   SHA256SUMS.txt

export const RELEASES_PAGE = 'https://github.com/toonittmedia/fanimate/releases';
export const FEED = 'https://api.github.com/repos/toonittmedia/fanimate/releases?per_page=20';

export const PLATFORMS = [
  {
    id: 'windows',
    name: 'Windows',
    note: 'Windows 10 and 11, 64-bit. Installs for your user account, no administrator rights needed.',
    files: [
      { label: 'Installer', test: /windows-x64-setup\.exe$/i, main: true },
      { label: 'Portable (.zip)', test: /windows-x64\.zip$/i },
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    note: 'macOS 13 or later on Apple silicon. Open the disk image and drag Fanimate to Applications.',
    files: [
      { label: 'Disk image', test: /macos-arm64\.dmg$/i, main: true },
      { label: 'Portable (.tar.gz)', test: /macos-arm64\.tar\.gz$/i },
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    note: 'Any distribution on x86-64. Make the AppImage executable and run it.',
    files: [
      { label: 'AppImage', test: /linux-x86_64\.AppImage$/i, main: true },
      { label: 'Debian and Ubuntu (.deb)', test: /_amd64\.deb$/i },
      { label: 'Flatpak', test: /linux-x86_64\.flatpak$/i },
      { label: 'Portable (.tar.gz)', test: /linux-x86_64\.tar\.gz$/i },
    ],
  },
];

/** Which platform a visitor is on, from the browser's own report. */
export function detectPlatform(nav = globalThis.navigator) {
  const hint = nav?.userAgentData?.platform ?? '';
  const ua = nav?.userAgent ?? '';
  const text = `${hint} ${ua}`.toLowerCase();
  // phones and tablets cannot run it: show everything, suggest nothing
  if (/android|iphone|ipad|ipod|cros/.test(text)) return null;
  if (/win/.test(text) && !/darwin/.test(text)) return 'windows';
  if (/mac/.test(text)) return 'macos';
  if (/linux|x11|bsd/.test(text)) return 'linux';
  return null;
}

/** The newest release, pre-releases included (every release is one while Fanimate is below 1.0). Drafts are never listed. */
export function latest(releases) {
  if (!Array.isArray(releases)) return null;
  const real = releases.filter((r) => r && !r.draft && typeof r.tag_name === 'string' && Array.isArray(r.assets));
  real.sort((a, b) => compareVersions(b.tag_name, a.tag_name));
  return real[0] ?? null;
}

/** `v1.2.3` as numbers, or null for anything else. */
export function parseVersion(tag) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(tag).trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x && !y) return 0;
  if (!x) return -1;
  if (!y) return 1;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** The files of a release for each platform, in the order PLATFORMS lists them. A file the release lacks is left out. */
const assetsOf = (release) => (Array.isArray(release?.assets) ? release.assets : []);

export function filesFor(release) {
  const assets = assetsOf(release).filter((a) => typeof a?.name === 'string' && isSafeUrl(a.browser_download_url));
  return PLATFORMS.map((p) => ({
    ...p,
    found: p.files
      .map((f) => {
        const asset = assets.find((a) => f.test.test(a.name));
        return asset ? { label: f.label, main: Boolean(f.main), url: asset.browser_download_url, size: asset.size, name: asset.name } : null;
      })
      .filter(Boolean),
  }));
}

export const checksums = (release) => {
  const a = assetsOf(release).find((x) => /^SHA256SUMS\.txt$/i.test(x?.name) && isSafeUrl(x.browser_download_url));
  return a ? a.browser_download_url : null;
};

export const webBuild = (release) => {
  const a = assetsOf(release).find((x) => /-web\.zip$/i.test(x?.name) && isSafeUrl(x.browser_download_url));
  return a ? a.browser_download_url : null;
};

/** Only links to GitHub's own download hosts are ever put on the page. */
export function isSafeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ['github.com', 'objects.githubusercontent.com', 'release-assets.githubusercontent.com'].includes(u.hostname);
  } catch {
    return false;
  }
}

export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 100 * 1024 * 1024 ? 1 : 0)} MB`;
}

/** `v0.4.1` as `0.4.1`. */
export const versionLabel = (tag) => String(tag).replace(/^v/i, '');
