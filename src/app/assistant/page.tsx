import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "The Fanimate Assistant (in development, coming in 0.5) edits your open project through the same API as scripts: every change is a card you can undo, nothing is sent until you press Send, and you bring your own model.",
  alternates: { canonical: "/assistant" },
};

const faq: { q: string; a: string }[] = [
  {
    q: "Does it need the internet?",
    a: "Only if the model you choose is on the internet. Point the Assistant at a server on your own computer, such as Ollama or LM Studio, and nothing leaves the machine. The rest of Fanimate never needs a network.",
  },
  {
    q: "What does it send?",
    a: "Your message, the conversation so far, and a short context line shown under the message box: the project's size, the playhead and the selected layers. When the model asks for more (a list of layers, say), the answer goes back to it as part of the conversation. Nothing is sent until you press Send.",
  },
  {
    q: "Can I trust the output?",
    a: "Treat it like a quick helper, not an expert. Every change appears as a card with Undo, each request is one undo step, and what it creates is ordinary layers and keys you can edit, labelled in the file as made by a tool. Look before you keep it.",
  },
  {
    q: "Can I turn it off?",
    a: "It is off until you set it up. The \"Turn off all AI features\" switch hides the panel and Ctrl+K and closes the link for other programs. A policy file with \"ai\": false turns AI off for a whole computer, a lab or a studio.",
  },
  {
    q: "Which models?",
    a: "Anthropic's models directly, any model on OpenRouter, or any server that speaks the OpenAI-style chat API, including Ollama and LM Studio. Results depend on the model: larger models follow the tools far better than small local ones.",
  },
];

export default function AssistantPage() {
  return (
    <>
      <section className="wrap" data-reveal>
        <p className="eyebrow">In development, coming in 0.5</p>
        <h1>
          An assistant that edits your project, <span className="gradient-text">not your trust.</span>
        </h1>
        <p className="sub">
          Ask for a change in plain words. The Assistant makes it through the same API as scripts, shows you
          every change as a card, and lets you take it back in one step. You choose the model, and nothing leaves
          your computer until you press Send.
        </p>
        <p className="fine">
          The Assistant and the MCP bridge are being built for Fanimate 0.5, which is not released yet. This page
          describes what is in the code today; details may still change.
        </p>
      </section>

      <section className="wrap" data-reveal>
        <p className="kicker">How it works</p>
        <h2>Beside the canvas, never in the way</h2>
        <div className="cards">
          <div className="card" data-reveal>
            <h3>A docked panel</h3>
            <p>
              The Assistant is a column beside the canvas. Press <kbd className="keycap">Ctrl</kbd>+
              <kbd className="keycap">K</kbd> or the <strong>Ask</strong> chip in the title bar to start typing.
              Enter sends, Shift+Enter is a new line.
            </p>
          </div>
          <div className="card" data-reveal>
            <h3>You see what is sent</h3>
            <p>
              A context line under the message box shows exactly what goes with your message: the project&apos;s
              size, the playhead and the selected layers.
            </p>
          </div>
          <div className="card" data-reveal>
            <h3>Every change is a card</h3>
            <p>
              What the model changed is listed in plain words (&quot;Set opacity on Title at frame 12&quot;), with{" "}
              <strong>Undo</strong> and <strong>Show</strong> to select the layers it touched.
            </p>
          </div>
          <div className="card" data-reveal>
            <h3>One undo step</h3>
            <p>
              Each change runs as a transaction on the open project, so Ctrl+Z takes it back as one step, however
              many edits it made.
            </p>
          </div>
          <div className="card" data-reveal>
            <h3>Labelled in the file</h3>
            <p>
              Layers the Assistant creates carry a provenance record saying a tool made them, so a studio can always
              tell what was generated.
            </p>
          </div>
          <div className="card" data-reveal>
            <h3>Nothing behind your back</h3>
            <p>
              Requests run on the window&apos;s own editor, never from another thread, with the same permissions a
              script gets. Nothing is edited while the animation plays.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap split" data-reveal>
        <div>
          <p className="kicker">Providers</p>
          <h2>Bring your own model</h2>
          <p>
            Fanimate sells no credits and runs no servers. Set up the provider you already use in the panel itself
            (no dialog), and change it any time from the gear.
          </p>
        </div>
        <ul className="points">
          <li>
            <strong>Anthropic</strong>, with your own API key.
          </li>
          <li>
            <strong>OpenRouter</strong>, for any model it offers.
          </li>
          <li>
            <strong>Any OpenAI-compatible server</strong>: Ollama, LM Studio, OpenAI itself or a studio&apos;s own
            gateway. A local address needs no key.
          </li>
          <li>
            Keys are kept in their own file, readable only by your account, never in the settings, a project or a
            log. Or supply them with <code>ANTHROPIC_API_KEY</code>, <code>OPENROUTER_API_KEY</code> or{" "}
            <code>OPENAI_API_KEY</code>, which always win and are never saved.
          </li>
        </ul>
      </section>

      <section className="wrap" data-reveal>
        <p className="kicker">Privacy and control</p>
        <h2>Off until you say otherwise</h2>
        <ul className="points">
          <li>The Assistant does nothing until you set it up.</li>
          <li>
            Before the first message goes to a destination, Fanimate asks you to allow that destination. A new
            provider or address asks again.
          </li>
          <li>
            Nothing is sent until you press Send. There is no background analysis of your projects.
          </li>
          <li>
            <strong>Turn off all AI features</strong> hides the panel and Ctrl+K and closes the link for other
            programs.
          </li>
          <li>
            <strong>Work offline</strong> and policy files (<code>&quot;ai&quot;: false</code>) switch AI off for a
            whole computer, a school lab or a studio. See <a href="/install#offline">Install</a>.
          </li>
          <li>
            Fanimate never uses your projects to train models. What a provider does with the messages you send is
            under that provider&apos;s terms, so a local server is the choice when nothing may leave the machine.
          </li>
        </ul>
      </section>

      <section className="wrap" data-reveal>
        <p className="kicker">Use your own agent</p>
        <h2>Claude Code, Codex and Antigravity can drive Fanimate</h2>
        <p>
          <code>fanimate-cli mcp</code> is a Model Context Protocol server. With <code>--app</code> it carries an
          agent&apos;s calls to the Fanimate window over a local link (this computer only, with a random token), so
          the agent works on the project in front while you watch, and Ctrl+Z still works.
        </p>
        <ol className="steps">
          <li>
            In Fanimate, turn on <strong>Let other programs control Fanimate</strong> in the Assistant&apos;s
            settings.
          </li>
          <li>Add Fanimate to your agent with one of these:</li>
        </ol>
        <CodeBlock label="Claude Code" code="claude mcp add --scope user fanimate -- fanimate-cli mcp --app" />
        <CodeBlock label="Codex" code="codex mcp add fanimate -- fanimate-cli mcp --app" />
        <CodeBlock label="Antigravity" code="agy mcp add fanimate fanimate-cli mcp --app" />
        <p>
          Other programs can change the open project but not save or close it, and what they add is labelled in the
          file like the Assistant&apos;s work. Their changes show as cards in the Assistant panel too.
        </p>
        <h3>With no window</h3>
        <p>
          On a server, leave out <code>--app</code> and give a project file. An editor inside{" "}
          <code>fanimate-cli</code> works on it and saves after each change.
        </p>
        <CodeBlock label="Headless" code="fanimate-cli mcp project.fnm" />
      </section>

      <section className="wrap band" data-reveal>
        <p className="kicker">Under the hood</p>
        <h2>The same API as scripts</h2>
        <p>
          The Assistant, the MCP server and <code>fanimate-cli script</code> share one call table. The tools a model
          sees, about 60 of them, are generated from that table with their full parameter text, so a model can do
          exactly what a script can do, with the same permissions. Each call is a transaction: one undo step, and a
          call that fails leaves the project as it was. Requests to providers go through your system&apos;s{" "}
          <code>curl</code>, with the key kept off its command line.
        </p>
        <p>
          <a className="button small" href="https://github.com/toonittmedia/fanimate/blob/main/docs/scripting.md">
            Read the scripting guide
          </a>
        </p>
      </section>

      <section className="wrap doc" data-reveal>
        <h2>Questions</h2>
        {faq.map((item) => (
          <div key={item.q} data-reveal>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
        <div className="callout" data-reveal>
          <p>
            Want to try it before 0.5? Fanimate is a closed alpha for testers and animators. The current release,
            without the Assistant, is on the <a href="/install">install page</a>.
          </p>
        </div>
      </section>
    </>
  );
}
