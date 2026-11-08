# fanimate.org

The website for [Fanimate](https://github.com/toonittmedia/fanimate), the free, open-source 2D character animation app. It has the home page with a live bone-rig demo, the install guide, the Assistant page (a feature in development for 0.5) and the release notes.

## Stack

- [Next.js](https://nextjs.org) 16 with the App Router, React 19 and TypeScript (strict)
- [GSAP](https://gsap.com) with `@gsap/react` for the scroll reveals and the rig demo
- Plain CSS: one design system in `src/app/globals.css`, CSS Modules for component styles
- No runtime dependencies beyond those; the brand assets are copied in from the app repository

## Working on it

Needs Node 20.9 or later and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # node --test tests/ (rig maths, release parsing)
pnpm typecheck    # tsc --noEmit
pnpm build        # production build
```

Other scripts:

- `pnpm sync-brand` copies colours, logos and fonts from a clone of the Fanimate repository at `../fanimate` (or a path given as an argument, or `FANIMATE_REPO`) into `public/brand/`. Fonts are subset to WOFF2, which needs Python with `pip install fonttools brotli`. The output is committed, so a deploy never needs the app repository.
- `pnpm shots [base-url]` starts headless Chrome (found at `CHROME` or the usual install path), screenshots `/`, `/install`, `/assistant` and `/whats-new` at 390, 820 and 1360 px wide in the Night, Studio Grey and Day themes into `shots/`, and prints the console errors and failed requests of each page. It exits non-zero if any page logged a console error. Run it against `pnpm dev` or `pnpm start`. It uses Node's built-in WebSocket, so it needs nothing installed.

## Layout

```
src/
  app/              Routes (App Router): page.tsx (home), install/, assistant/, whats-new/,
                    layout.tsx (header, footer, theme boot script), globals.css (design system),
                    robots.ts, sitemap.ts, not-found.tsx
  components/       Header, Footer, ThemeSwitch, Motion (scroll reveals for [data-reveal]),
                    Rig (the bone-rig demo), Chat, Downloads, CodeBlock (commands with a Copy button)
  lib/
    rig-math.js     The demo rig's maths: easing, looping keys, two-bone IK, no DOM (tested)
    releases.js     Reads the latest GitHub release and picks the download for each platform (tested)
tests/              node:test suites for lib/
scripts/            sync-brand.mjs, shots.mjs
public/brand/       Brand assets copied by sync-brand (do not edit by hand)
```

The demo rig's maths lives in `src/lib/rig-math.js` and is covered by `tests/rig-math.test.mjs`; keep the component (`src/components/Rig.tsx`) to drawing and input, and put any new maths in the library with a test.

Themes are Night, Studio Grey and Day, from the app's brand tokens. The choice is kept in `localStorage` under `fanimate-theme` and applied before paint by the boot script in `layout.tsx`.

## Writing for the site

- Describe only what exists in a released Fanimate. A feature that is still being built is labelled with the release that brings it ("In development, coming in 0.5").
- No em dashes in any text. Plain, short, sentence case.
- Colours come from the brand tokens through CSS variables; do not hard-code them in components.

## Deploying to Vercel

1. In Vercel, import this repository. The framework preset is **Next.js**; the defaults for the build command and output need no change.
2. Under **Settings, Domains**, add `fanimate.org` and `www.fanimate.org`.
3. At the domain's DNS provider, add:

   | Name | Type | Value |
   |---|---|---|
   | `@` (apex) | A | `76.76.21.21` |
   | `www` | CNAME | `cname.vercel-dns.com` |

   Vercel shows the exact records it expects for your project on the Domains page; confirm them there, as they can differ.
4. Each push to `main` deploys; pull requests get preview deployments.

Security headers and caching for `/brand/` are set in `next.config.mjs`.

## Contributing

Issues and pull requests are welcome. Before opening one, run `pnpm typecheck`, `pnpm test` and `pnpm build`, and for visual changes `pnpm shots` and look at the three widths and themes. The clean-room rule of the app applies here too: no artwork, icons or text from other animation products.

## Licence

The site's code is available under either the [MIT](LICENSE-MIT) or the [Apache 2.0](LICENSE-APACHE) licence, at your option. The fonts, Inter and JetBrains Mono, are under the SIL Open Font License. The Fanimate name and logo are covered by the app repository's brand rules.
