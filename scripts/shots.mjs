// Screenshots of the site in headless Chrome, at three widths and in the three themes.
//
//   node scripts/shots.mjs [base-url]      (default http://localhost:3000)
//   SHOTS_PAGES=home SHOTS_WIDTHS=1360 SHOTS_THEMES=night  limit what is shot
//
// Chrome is found at CHROME or the usual Windows path. It is driven over its
// DevTools websocket with Node's built-in WebSocket, so there is nothing to
// install. PNGs go to ./shots/<page>-<width>-<theme>.png. Console errors and
// failed requests are collected per page; the script exits non-zero if any
// console error was seen.

import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const CHROME =
  process.env.CHROME ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => existsSync(p));
const PAGES = [
  ["home", "/"],
  ["install", "/install"],
  ["assistant", "/assistant"],
  ["whats-new", "/whats-new"],
];
const pick = (name, all, parse = (x) => x) => (process.env[name] ? process.env[name].split(",").map(parse) : all);
const WIDTHS = pick("SHOTS_WIDTHS", [390, 820, 1360], Number);
const THEMES = pick("SHOTS_THEMES", ["night", "studio-grey", "day"]);
const OUT = join(process.cwd(), "shots");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** Waits for Chrome's debugging endpoint and returns the browser websocket address. */
async function browserUrl(port) {
  for (let i = 0; i < 300; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      const { webSocketDebuggerUrl } = await response.json();
      if (webSocketDebuggerUrl) return webSocketDebuggerUrl;
    } catch {
      /* not listening yet */
    }
    await sleep(100);
  }
  throw new Error("Chrome did not start (its debugging port never answered)");
}

/** A minimal CDP client over one browser websocket with flattened sessions. */
class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Set();
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(typeof e.data === "string" ? e.data : e.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const l of this.listeners) l(msg);
      }
    };
  }
  open() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error("websocket error"));
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 60000);
    });
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function main() {
  if (!CHROME) throw new Error("Chrome not found: set CHROME to its path");
  mkdirSync(OUT, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), "fanimate-shots-"));
  const port = await freePort();
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const report = [];
  let cdp;
  try {
    cdp = new Cdp(await browserUrl(port));
    await cdp.open();
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const s = (method, params) => cdp.send(method, params, sessionId);
    await s("Page.enable");
    await s("Runtime.enable");
    await s("Network.enable");
    await s("Log.enable");

    let inflight = 0;
    let lastActivity = Date.now();
    let current = null;
    cdp.on((msg) => {
      if (msg.sessionId !== sessionId) return;
      const p = msg.params || {};
      switch (msg.method) {
        case "Network.requestWillBeSent":
          inflight++;
          lastActivity = Date.now();
          break;
        case "Network.loadingFinished":
          inflight = Math.max(0, inflight - 1);
          lastActivity = Date.now();
          break;
        case "Network.loadingFailed":
          inflight = Math.max(0, inflight - 1);
          lastActivity = Date.now();
          if (current && !p.canceled) current.failed.add(`${p.errorText} (${p.type || "request"})`);
          break;
        case "Network.responseReceived":
          if (current && p.response && p.response.status >= 400)
            current.failed.add(`${p.response.status} ${p.response.url}`);
          break;
        case "Runtime.consoleAPICalled":
          if (current && p.type === "error")
            current.errors.add((p.args || []).map((a) => a.value ?? a.description ?? "").join(" "));
          break;
        case "Runtime.exceptionThrown":
          if (current)
            current.errors.add(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || "exception");
          break;
        case "Log.entryAdded":
          if (current && p.entry?.level === "error") current.errors.add(`${p.entry.text} ${p.entry.url || ""}`.trim());
          break;
      }
    });

    async function networkIdle(quiet = 1500, max = 15000) {
      const start = Date.now();
      while (Date.now() - start < max) {
        if (inflight === 0 && Date.now() - lastActivity >= quiet) return;
        await sleep(100);
      }
    }

    async function load(url) {
      const loaded = new Promise((resolve) => {
        const off = cdp.on((msg) => {
          if (msg.sessionId === sessionId && msg.method === "Page.loadEventFired") {
            off();
            resolve();
          }
        });
      });
      lastActivity = Date.now();
      await s("Page.navigate", { url });
      await Promise.race([loaded, sleep(20000)]);
      await networkIdle();
    }

    const evaluate = (expression) =>
      s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }).then((r) => r.result?.value);

    for (const [name, path] of PAGES.filter(([n]) => !process.env.SHOTS_PAGES || process.env.SHOTS_PAGES.split(",").includes(n))) {
      current = { page: name, errors: new Set(), failed: new Set() };
      report.push(current);
      for (const width of WIDTHS) {
        await s("Emulation.setDeviceMetricsOverride", {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: width < 600,
        });
        for (const theme of THEMES) {
          await load(BASE + path);
          await evaluate(`try { localStorage.setItem('fanimate-theme', ${JSON.stringify(theme)}) } catch (e) {}`);
          await load(BASE + path);
          await evaluate(`(() => {
            const st = document.createElement('style');
            st.textContent = 'html, body { scroll-behavior: auto !important; }';
            document.head.appendChild(st);
          })()`);
          // Walk down the page so scroll-triggered reveals run, then back to the top.
          await evaluate(`(async () => {
            const step = Math.max(200, Math.floor(innerHeight * 0.6));
            for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
              scrollTo({ top: y, behavior: 'instant' });
              await new Promise((r) => setTimeout(r, 120));
            }
            scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 400));
            scrollTo({ top: 0, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 300));
          })()`);
          await networkIdle();
          const metrics = await s("Page.getLayoutMetrics");
          const size = metrics.cssContentSize || metrics.contentSize;
          const height = Math.min(Math.ceil(size.height), 16000);
          const { data } = await s("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            clip: { x: 0, y: 0, width, height, scale: 1 },
          });
          const file = join(OUT, `${name}-${width}-${theme}.png`);
          writeFileSync(file, Buffer.from(data, "base64"));
          console.log(`saved ${file} (${width}x${height})`);
        }
      }
    }
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    await sleep(500);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  }

  let errors = 0;
  console.log("\nSummary");
  for (const r of report) {
    errors += r.errors.size;
    console.log(`  ${r.page}: ${r.errors.size} console errors, ${r.failed.size} failed requests`);
    for (const e of r.errors) console.log(`    error: ${e}`);
    for (const f of r.failed) console.log(`    failed: ${f}`);
  }
  return errors;
}

main()
  .then((errors) => process.exit(errors > 0 ? 1 : 0))
  .catch((e) => {
    console.error(e.message || e);
    process.exit(2);
  });
