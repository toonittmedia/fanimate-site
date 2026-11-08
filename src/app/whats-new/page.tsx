import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's new",
  description:
    "What changed in Fanimate 0.4.0 and 0.4.1: animated text, captions, scripting, easing, the graph editor, installed fonts and keys you can tell apart. Plus what is coming in 0.5.",
  alternates: { canonical: "/whats-new" },
};

const RELEASES = "https://github.com/toonittmedia/fanimate/releases";

export default function WhatsNewPage() {
  return (
    <article className="wrap doc">
      <p className="eyebrow">Release notes</p>
      <h1>What&apos;s new</h1>
      <p className="sub">
        Fanimate is a closed alpha for testers and animators. Keep backups, and please{" "}
        <a href="https://github.com/toonittmedia/fanimate/issues">report what goes wrong</a>. Full notes and downloads
        are on <a href={RELEASES}>GitHub releases</a>.
      </p>

      <ul className="toc" aria-label="On this page">
        <li><a href="#next">Coming in 0.5</a></li>
        <li><a href="#v0-4-1">0.4.1</a></li>
        <li><a href="#v0-4-0">0.4.0</a></li>
      </ul>

      <aside id="next" className="callout" data-reveal>
        <p className="eyebrow">In development, coming in 0.5</p>
        <h2>The Assistant and the MCP server</h2>
        <p>Being built now, not in any release yet:</p>
        <ul>
          <li>
            <strong>Assistant panel:</strong> ask for a change in plain words; every change is a card you can undo as
            one step. Bring your own model (Anthropic, OpenRouter, Ollama, LM Studio and other OpenAI-compatible
            servers).
          </li>
          <li>
            <strong>Ctrl+K</strong> and an <strong>Ask</strong> chip in the title bar open it from anywhere.
          </li>
          <li>
            <strong>MCP server:</strong> <code>fanimate-cli mcp</code> lets Claude Code, Codex and Antigravity work on
            the open project, with the same permissions as scripts.
          </li>
        </ul>
        <p>
          <a href="/assistant">More about the Assistant</a>
        </p>
      </aside>

      <section id="v0-4-1" data-reveal>
        <h2>Fanimate 0.4.1</h2>
        <p>
          The project file format is unchanged (version 7): projects open in 0.4.0 and 0.4.1 alike. Fanimate 0.4.0
          offers this update itself.
        </p>
        <h3>Fonts installed on your computer</h3>
        <ul>
          <li>The Font menu lists every installed font, under a search box, below the fonts Fanimate ships.</li>
          <li>Exports, the render queue and the command line use the same fonts as the editor.</li>
          <li>
            A missing font is set in Inter with its name kept, so the project looks right again on a computer that
            has it.
          </li>
        </ul>
        <h3>Keys you can tell apart</h3>
        <ul>
          <li>
            Every kind of key has its own colour and picture on the timeline: smooth is amber, linear a blue
            diamond, step a red square, eases green circles and overshoot, bounce, elastic and custom curves purple
            circles.
          </li>
        </ul>
        <h3>Captions and pictures</h3>
        <ul>
          <li>
            <strong>Restyle All Captions</strong> makes every caption in a set look like the selected one, in one
            undo step.
          </li>
          <li>OpenRaster (<code>.ora</code>) files from Krita, MyPaint and GIMP import with their layers and groups.</li>
        </ul>
        <h3>Scripting</h3>
        <ul>
          <li>
            <strong>Expressions that bake to keys</strong> (<code>bake_expression</code>), with random functions that
            give the same answer on every computer.
          </li>
          <li>
            <strong>Permissions and plugin manifests:</strong> a script host can give a client only{" "}
            <code>read</code>, <code>edit</code> or <code>save</code>.
          </li>
          <li>New calls: <code>fonts</code>, <code>restyle_captions</code>, <code>import_ora</code>, <code>bake_expression</code>.</li>
        </ul>
      </section>

      <section id="v0-4-0" data-reveal>
        <h2>Fanimate 0.4.0</h2>
        <p>
          The first release of Phase 2. Projects are saved as <strong>file format version 7</strong>, which earlier
          versions of Fanimate cannot open, so keep a copy of anything you still need in 0.3.x.
        </p>
        <h3>Text</h3>
        <ul>
          <li>Text layers with real shaping, kerning, right-to-left order and Unicode line breaking.</li>
          <li>Text animators by character, word or line, with ready-made fade in, typewriter, rise in, pop in and wave.</li>
          <li>Text on a path, and Convert Text to Shapes.</li>
          <li>Arabic, Hebrew, Devanagari and Thai fonts bundled (Noto Sans).</li>
        </ul>
        <h3>Rigging</h3>
        <ul>
          <li>Master controllers: sliders and pads that play actions.</li>
          <li>Secondary motion on a spring, with gravity and wind, baked to keys.</li>
          <li>Pose library with mirroring, and Copy to Rig to reuse an action on another character.</li>
        </ul>
        <h3>Captions</h3>
        <ul>
          <li>Import and export SubRip (<code>.srt</code>) and WebVTT (<code>.vtt</code>) captions as text layers.</li>
        </ul>
        <h3>Export for the web and games</h3>
        <ul>
          <li>Export a frame as SVG, the animation as Lottie, or a packed sprite sheet with a JSON atlas.</li>
          <li>Each export says what it could not carry instead of dropping it silently.</li>
        </ul>
        <h3>Animation</h3>
        <ul>
          <li>A graph editor for the selected layer&apos;s keys, with custom curves.</li>
          <li>Ease in and out, overshoot, bounce, elastic and Bezier keys.</li>
          <li>Simple mode: a workspace with only the basic tools, for a first hour with Fanimate.</li>
        </ul>
        <h3>Scripting</h3>
        <ul>
          <li>
            <code>fanimate-cli script</code> answers JSON-RPC 2.0 requests on standard input and output; every call is
            one undo step. The API is labelled 0.1.0-unstable until 1.0.
          </li>
          <li>Work offline, and policy files that let an organisation switch off network, AI and cloud features.</li>
        </ul>
      </section>

      <div className="note" data-reveal>
        <p>
          <a className="button primary" href={`${RELEASES}/latest`}>
            Download the latest release
          </a>{" "}
          <a className="button" href="/install">
            Install guide
          </a>
        </p>
      </div>
    </article>
  );
}
