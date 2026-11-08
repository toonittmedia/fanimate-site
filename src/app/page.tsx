import type { Metadata } from 'next';
import Rig from '@/components/Rig';
import Chat from '@/components/Chat';
import Downloads from '@/components/Downloads';
import HeroCta, { HeroVersion } from '@/components/HeroCta';
import {
  AssistantIcon,
  DrawIcon,
  ImportIcon,
  RigIcon,
  ScriptIcon,
  TextSoundIcon,
} from '@/components/FeatureIcons';

export const metadata: Metadata = {
  title: { absolute: 'Fanimate: free 2D character animation' },
  description:
    'Fanimate is a free, open-source 2D character animation app for Windows, macOS and Linux. Bones, Smart Bones, vector drawing, lip sync and a published file format. Alpha.',
};

const FEATURES = [
  {
    icon: RigIcon,
    title: 'Rig',
    text: 'Bones with inverse kinematics, smooth binding, Smart Bones, actions and master controllers. Spring physics bakes down to ordinary keys you can edit.',
  },
  {
    icon: DrawIcon,
    title: 'Draw',
    text: 'Pressure-sensitive vector brushes, booleans and point keyframes. Frame-by-frame layers with onion skin and an X-sheet when a shot needs drawing by hand.',
  },
  {
    icon: TextSoundIcon,
    title: 'Text and sound',
    text: 'Text in Latin, Arabic, Hebrew, Devanagari and Thai with per-character animators. Captions, audio layers and lip sync.',
  },
  {
    icon: ImportIcon,
    title: 'Bring your files',
    text: 'Open Moho and Animate projects, PSD, SVG and OpenRaster. Export MP4, GIF, image sequences, Lottie and sprite sheets.',
  },
  {
    icon: ScriptIcon,
    title: 'Script it',
    text: 'A JSON-RPC scripting API, a Python client and an MCP server, so agents such as Claude Code, Codex or Antigravity can drive a project.',
  },
] as const;

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <p className="eyebrow">
          <i />
          Alpha, <HeroVersion />
        </p>
        <h1>
          Rig it. Draw it. <span className="gradient-text">Move it.</span>
        </h1>
        <p className="sub lead">
          Fanimate is a free, open-source 2D character animation app for Windows, macOS and Linux. Moho&rsquo;s
          rigging, Harmony&rsquo;s drawing and pipeline, Animate&rsquo;s ease of use, with nothing locked away.
        </p>
        <div className="cta">
          <HeroCta />
          <a className="button" href="/install">
            How to install
          </a>
        </div>
        <p className="fine">No account. No telemetry. Works offline.</p>
        <div data-reveal>
          <Rig />
        </div>
      </section>

      <section id="features" className="wrap">
        <p className="kicker" data-reveal>
          What it does
        </p>
        <h2 data-reveal>Everything a character animator needs, in one app</h2>
        <p className="sub" data-reveal>
          These are built and in testers&rsquo; hands today. It is an alpha: expect rough edges, and tell us
          about them.
        </p>
        <div className="cards">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article className="card" key={title} data-reveal>
              <span className="ico">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
          <article className="card" data-reveal>
            <span className="ico">
              <AssistantIcon />
            </span>
            <h3>Assistant</h3>
            <p>
              Ask for a change in plain words, with your own Anthropic, OpenRouter or local model. Every change is
              one undo step. New in 0.5.
            </p>
            <a className="tag" href="/assistant">
              Optional, off by default
            </a>
          </article>
        </div>
      </section>

      <section id="why" className="band">
        <div className="wrap">
          <p className="kicker" data-reveal>
            Why Fanimate
          </p>
          <h2 data-reveal>How it compares</h2>
          <div className="table-wrap" data-reveal>
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Moho Pro</th>
                  <th scope="col">Toon Boom Harmony</th>
                  <th scope="col">Fanimate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Price</th>
                  <td>One-time purchase</td>
                  <td>Subscription</td>
                  <td className="yes">Free</td>
                </tr>
                <tr>
                  <th scope="row">Runs on</th>
                  <td>Windows, macOS</td>
                  <td>Windows, macOS, Linux</td>
                  <td className="yes">Windows, macOS, Linux, plus a browser player</td>
                </tr>
                <tr>
                  <th scope="row">Rigging</th>
                  <td>Bones, Smart Bones</td>
                  <td>Deformers</td>
                  <td className="yes">Bones, IK, Smart Bones, controllers, springs</td>
                </tr>
                <tr>
                  <th scope="row">Scripting</th>
                  <td>Lua</td>
                  <td>JavaScript, Python</td>
                  <td className="yes">JSON-RPC, Python, MCP</td>
                </tr>
                <tr>
                  <th scope="row">File format</th>
                  <td>Closed</td>
                  <td>Closed</td>
                  <td className="yes">Published spec</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="fine" data-reveal>
            Fanimate follows Moho&rsquo;s layout and workflow, never its look or code, and uses nothing from closed
            products.
          </p>
        </div>
      </section>

      <section id="assistant" className="wrap split">
        <div>
          <p className="kicker" data-reveal>
            New in 0.5
          </p>
          <h2 data-reveal>An assistant that keeps out of the way</h2>
          <p className="sub" data-reveal>
            Describe a change and the Assistant makes it through the same commands you use. It is not released yet
            and it is off until you turn it on.
          </p>
          <ul className="points" data-reveal>
            <li>Bring your own key: Anthropic, OpenRouter or a model on your computer.</li>
            <li>Every change is one undo step, listed so you can see what it did.</li>
            <li>What it made is labelled in the file.</li>
            <li>One switch hides every AI feature.</li>
          </ul>
          <a className="button" href="/assistant" data-reveal>
            About the Assistant
          </a>
        </div>
        <div data-reveal>
          <Chat />
        </div>
      </section>

      <section id="promises" className="band">
        <div className="wrap">
          <p className="kicker" data-reveal>
            Promises
          </p>
          <h2 data-reveal>What you can count on</h2>
          <div className="promises">
            <div data-reveal>
              <h3>Your work is safe</h3>
              <p>Saves are atomic, crashes are recovered, and files from any released version always open.</p>
            </div>
            <div data-reveal>
              <h3>Private</h3>
              <p>No telemetry, no account. Everything works offline.</p>
            </div>
            <div data-reveal>
              <h3>Fast</h3>
              <p>The target is 60 fps playback for a 40-bone rig with Smart Bones on a mid-range laptop.</p>
            </div>
            <div data-reveal>
              <h3>Open</h3>
              <p>MIT or Apache-2.0, and the .fnm project format is published.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="download" className="wrap">
        <p className="kicker" data-reveal>
          Download
        </p>
        <h2 data-reveal>Get Fanimate</h2>
        <Downloads />
      </section>
    </>
  );
}
