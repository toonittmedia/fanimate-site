// Copy the brand assets this site uses from a clone of the Fanimate repository,
// so the site and the app share one source for colours, logos and fonts.
//
//   node scripts/sync-brand.mjs [path-to-fanimate-repo]
//
// The repository is found at ../fanimate unless a path (or FANIMATE_REPO) is
// given. Fonts are subset to the characters the site uses and written as WOFF2
// (needs Python with `pip install fonttools brotli`); the originals are OFL.
// The output goes to public/brand/ and is committed, so a deploy needs no
// access to the app repository.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(process.argv[2] ?? process.env.FANIMATE_REPO ?? path.join(root, '..', 'fanimate'));
const brand = path.join(repo, 'brand');
const out = path.join(root, 'public', 'brand');

if (!existsSync(path.join(brand, 'tokens', 'tokens.json'))) {
  console.error(`sync-brand: ${brand} is not the Fanimate brand folder (no tokens/tokens.json)`);
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const copies = [
  ['tokens/themes.css', 'themes.css'],
  ['tokens/tokens.json', 'tokens.json'],
  ['logo/fanimate-icon.svg', 'fanimate-icon.svg'],
  ['logo/fanimate-icon-small.svg', 'fanimate-icon-small.svg'],
  ['logo/fanimate-mark-violet.svg', 'fanimate-mark-violet.svg'],
  ['logo/fanimate-lockup-dark.svg', 'fanimate-lockup-dark.svg'],
  ['logo/fanimate-lockup-light.svg', 'fanimate-lockup-light.svg'],
  ['app-icon/favicon.svg', 'favicon.svg'],
  ['app-icon/fanimate-512.png', 'fanimate-512.png'],
  ['social/social-card.png', 'social-card.png'],
  ['fonts/Inter-OFL.txt', 'Inter-OFL.txt'],
  ['fonts/JetBrainsMono-OFL.txt', 'JetBrainsMono-OFL.txt'],
];
for (const [from, to] of copies) {
  copyFileSync(path.join(brand, from), path.join(out, to));
  console.log(`copied ${from}`);
}

// Latin, Latin-1, the punctuation the pages use, and a few arrows and signs.
const unicodes = 'U+0020-007E,U+00A0-00FF,U+2018-201D,U+2022,U+2026,U+2190-2193,U+00B7,U+00D7,U+2713';
const fonts = [
  ['fonts/Inter-Variable.ttf', 'Inter-Variable.woff2'],
  ['fonts/JetBrainsMono-Regular.ttf', 'JetBrainsMono-Regular.woff2'],
];
for (const [from, to] of fonts) {
  const result = spawnSync(
    'python',
    [
      '-m', 'fontTools.subset', path.join(brand, from),
      `--unicodes=${unicodes}`, '--flavor=woff2', '--layout-features=*',
      `--output-file=${path.join(out, to)}`,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    console.error('sync-brand: subsetting failed (pip install fonttools brotli)');
    process.exit(1);
  }
  console.log(`subset ${from}`);
}

// Record where the files came from.
let commit = 'unknown';
const git = spawnSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
if (git.status === 0) commit = git.stdout.trim();
writeFileSync(
  path.join(out, 'SOURCE.txt'),
  `Copied from the Fanimate repository (brand/) at ${commit} by scripts/sync-brand.mjs.\n` +
    'Do not edit these files here: change them in the Fanimate repository and sync.\n' +
    'Inter and JetBrains Mono are under the SIL Open Font License (see the *-OFL.txt files).\n',
);
console.log(`done (${readFileSync(path.join(out, 'SOURCE.txt'), 'utf8').split('\n')[0]})`);
