import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  checksums, compareVersions, detectPlatform, filesFor, formatSize, isSafeUrl, latest, parseVersion, versionLabel, webBuild,
} from '../src/lib/releases.js';

const url = (name) => `https://github.com/toonittmedia/fanimate/releases/download/v0.4.1/${name}`;
const asset = (name, size = 1000) => ({ name, size, browser_download_url: url(name) });
const release = (tag, names = [], extra = {}) => ({ tag_name: tag, draft: false, prerelease: true, assets: names.map((n) => asset(n)), ...extra });

test('versions parse and compare as numbers, not text', () => {
  assert.deepEqual(parseVersion('v0.10.2'), [0, 10, 2]);
  assert.deepEqual(parseVersion('1.2.3-beta'), [1, 2, 3]);
  assert.equal(parseVersion('nightly'), null);
  assert.ok(compareVersions('v0.10.0', 'v0.9.9') > 0);
  assert.ok(compareVersions('v0.4.1', 'v0.4.1') === 0);
  assert.ok(compareVersions('junk', 'v0.0.1') < 0);
  assert.equal(compareVersions('a', 'b'), 0);
});

test('the latest release is the highest version, drafts and damage skipped, pre-releases kept', () => {
  const list = [
    release('v0.4.0'),
    release('v0.5.0', [], { draft: true }),
    release('v0.4.10', [], { prerelease: true }),
    release('v0.4.9'),
    null,
    { tag_name: 5 },
    { tag_name: 'v9.9.9' },
  ];
  assert.equal(latest(list).tag_name, 'v0.4.10');
  assert.equal(latest([]), null);
  assert.equal(latest('oops'), null);
  assert.equal(latest(null), null);
});

test('each platform finds its files by the release workflow\'s names', () => {
  const names = [
    'Fanimate-0.4.1-windows-x64-setup.exe', 'fanimate-0.4.1-windows-x64.zip',
    'Fanimate-0.4.1-macos-arm64.dmg',
    'Fanimate-0.4.1-linux-x86_64.AppImage', 'fanimate_0.4.1_amd64.deb', 'Fanimate-0.4.1-linux-x86_64.flatpak',
    'SHA256SUMS.txt', 'fanimate-0.4.1-web.zip',
  ];
  const r = release('v0.4.1', names);
  const by = Object.fromEntries(filesFor(r).map((p) => [p.id, p.found]));
  assert.equal(by.windows.length, 2);
  assert.equal(by.windows[0].main, true);
  assert.equal(by.macos.length, 1, 'no portable archive for macOS in this release');
  assert.deepEqual(by.linux.map((f) => f.label), ['AppImage', 'Debian and Ubuntu (.deb)', 'Flatpak']);
  assert.ok(checksums(r).endsWith('SHA256SUMS.txt'));
  assert.ok(webBuild(r).endsWith('-web.zip'));
});

test('a release with no files for a platform lists none, and a bare release is safe', () => {
  const r = release('v0.1.0', ['Fanimate-0.1.0-windows-x64-setup.exe']);
  const by = Object.fromEntries(filesFor(r).map((p) => [p.id, p.found]));
  assert.equal(by.macos.length, 0);
  assert.equal(by.linux.length, 0);
  assert.equal(checksums(r), null);
  assert.equal(webBuild(r), null);
  assert.equal(filesFor(null).every((p) => p.found.length === 0), true);
  assert.equal(filesFor({ assets: 'x' }).every((p) => p.found.length === 0), true);
});

test('only GitHub download links are ever used', () => {
  assert.equal(isSafeUrl('https://github.com/a/b/releases/download/v1/x.exe'), true);
  assert.equal(isSafeUrl('https://objects.githubusercontent.com/x'), true);
  for (const bad of ['http://github.com/x', 'https://evil.example/github.com', 'https://github.com.evil.example/x', 'javascript:alert(1)', 'data:text/html,x', '', null, undefined, 42]) {
    assert.equal(isSafeUrl(bad), false, String(bad));
  }
  const r = { tag_name: 'v1.0.0', assets: [{ name: 'Fanimate-1.0.0-windows-x64-setup.exe', size: 1, browser_download_url: 'https://evil.example/setup.exe' }] };
  assert.equal(filesFor(r).find((p) => p.id === 'windows').found.length, 0, 'a link to somewhere else is dropped');
});

test('the visitor\'s platform is read from the browser, and phones are not offered a desktop download', () => {
  const ua = (userAgent, platform) => ({ userAgent, userAgentData: platform ? { platform } : undefined });
  assert.equal(detectPlatform(ua('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')), 'windows');
  assert.equal(detectPlatform(ua('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')), 'macos');
  assert.equal(detectPlatform(ua('Mozilla/5.0 (X11; Linux x86_64)')), 'linux');
  assert.equal(detectPlatform(ua('x', 'Windows')), 'windows');
  assert.equal(detectPlatform(ua('Mozilla/5.0 (Linux; Android 14)')), null);
  assert.equal(detectPlatform(ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')), null);
  assert.equal(detectPlatform(ua('Mozilla/5.0 (X11; CrOS x86_64)')), null);
  assert.equal(detectPlatform({}), null);
  assert.equal(detectPlatform(undefined), null);
});

test('sizes and version labels read well', () => {
  assert.equal(formatSize(0), '');
  assert.equal(formatSize(NaN), '');
  assert.equal(formatSize(300), '1 KB');
  assert.equal(formatSize(2048), '2 KB');
  assert.equal(formatSize(5.5 * 1024 * 1024), '5.5 MB');
  assert.equal(formatSize(250 * 1024 * 1024), '250 MB');
  assert.equal(versionLabel('v0.4.1'), '0.4.1');
  assert.equal(versionLabel('0.4.1'), '0.4.1');
});
