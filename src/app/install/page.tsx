import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Install Fanimate",
  description:
    "Download and install Fanimate on Windows, macOS or Linux, check the download, add FFmpeg for more video formats, and keep Fanimate up to date.",
  alternates: { canonical: "/install" },
};

const RELEASES = "https://github.com/toonittmedia/fanimate/releases";

export default function InstallPage() {
  return (
    <article className="wrap doc">
      <p className="eyebrow">Download</p>
      <h1>Install Fanimate</h1>
      <p className="sub">
        Every release has an installer for each desktop platform, a portable archive and a browser build. Fanimate
        needs no account and no network connection. It is a closed alpha: keep backups of your work.
      </p>
      <p>
        <a className="button primary" href={`${RELEASES}/latest`}>
          Latest release on GitHub
        </a>{" "}
        <a className="button" href={RELEASES}>
          All releases
        </a>
      </p>

      <ul className="toc" aria-label="On this page">
        <li><a href="#installers">Installers</a></li>
        <li><a href="#windows">Windows</a></li>
        <li><a href="#macos">macOS</a></li>
        <li><a href="#linux">Linux</a></li>
        <li><a href="#unsigned">Not signed yet</a></li>
        <li><a href="#checksums">Check a download</a></li>
        <li><a href="#ffmpeg">FFmpeg (optional)</a></li>
        <li><a href="#updates">Updates</a></li>
        <li><a href="#offline">Working offline</a></li>
        <li><a href="#uninstall">Uninstalling</a></li>
      </ul>

      <section id="installers" data-reveal>
        <h2>Installers</h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>File</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Windows 10 and 11 (64-bit)</td>
              <td><code>Fanimate-&lt;version&gt;-windows-x64-setup.exe</code></td>
              <td>Installs for your user account only, so no administrator rights are needed</td>
            </tr>
            <tr>
              <td>macOS 13 or later (Apple silicon)</td>
              <td><code>Fanimate-&lt;version&gt;-macos-arm64.dmg</code></td>
              <td>Drag Fanimate to Applications</td>
            </tr>
            <tr>
              <td>Linux (any distribution, x86-64)</td>
              <td><code>Fanimate-&lt;version&gt;-linux-x86_64.AppImage</code></td>
              <td>Make it executable and run it</td>
            </tr>
            <tr>
              <td>Debian, Ubuntu and derivatives</td>
              <td><code>fanimate_&lt;version&gt;_amd64.deb</code></td>
              <td>Installs to <code>/opt/fanimate</code>, with a menu entry</td>
            </tr>
            <tr>
              <td>Flatpak</td>
              <td><code>Fanimate-&lt;version&gt;-linux-x86_64.flatpak</code></td>
              <td>Install with <code>flatpak install --user</code></td>
            </tr>
            <tr>
              <td>Any (portable)</td>
              <td><code>fanimate-&lt;version&gt;-&lt;platform&gt;.zip</code> or <code>.tar.gz</code></td>
              <td>Unpack and run <code>fanimate</code>; nothing is installed</td>
            </tr>
          </tbody>
        </table>
        <p className="fine">
          Rhubarb (used for lip sync) comes with every package. FFmpeg does not: see <a href="#ffmpeg">below</a>.
        </p>
      </section>

      <section id="windows" data-reveal>
        <h2>Windows</h2>
        <ol className="steps">
          <li>Download <code>Fanimate-&lt;version&gt;-windows-x64-setup.exe</code> from the release.</li>
          <li>
            Run it. If Windows says &quot;Windows protected your PC&quot;, choose <strong>More info</strong>, then{" "}
            <strong>Run anyway</strong> (<a href="#unsigned">why</a>).
          </li>
          <li>Start Fanimate from the Start menu. Uninstall it any time from Settings, Apps.</li>
        </ol>
      </section>

      <section id="macos" data-reveal>
        <h2>macOS</h2>
        <ol className="steps">
          <li>Download <code>Fanimate-&lt;version&gt;-macos-arm64.dmg</code> (macOS 13 or later, Apple silicon).</li>
          <li>Open it and drag Fanimate to Applications.</li>
          <li>
            The first time, right-click Fanimate in Applications, choose <strong>Open</strong>, then{" "}
            <strong>Open</strong> again (<a href="#unsigned">why</a>). This is needed once.
          </li>
        </ol>
      </section>

      <section id="linux" data-reveal>
        <h2>Linux</h2>
        <h3>AppImage (any distribution)</h3>
        <CodeBlock label="Terminal" code={"chmod +x Fanimate-*-linux-x86_64.AppImage\n./Fanimate-*-linux-x86_64.AppImage"} />
        <h3>Debian and Ubuntu</h3>
        <CodeBlock label="Terminal" code={"sudo apt install ./fanimate_*_amd64.deb"} />
        <h3>Flatpak</h3>
        <CodeBlock label="Terminal" code={"flatpak install --user Fanimate-*.flatpak"} />
      </section>

      <section id="unsigned" data-reveal>
        <h2>Not signed yet</h2>
        <p>
          Releases are not yet signed with an Apple Developer ID or a Windows code-signing certificate. That is
          planned before 1.0. Until then your system warns you the first time:
        </p>
        <ul>
          <li>
            <strong>Windows</strong> may show &quot;Windows protected your PC&quot; for the installer: choose{" "}
            <strong>More info</strong>, then <strong>Run anyway</strong>.
          </li>
          <li>
            <strong>macOS</strong> says the app &quot;cannot be opened because the developer cannot be
            verified&quot;: right-click Fanimate in Applications, choose <strong>Open</strong>, then{" "}
            <strong>Open</strong> again.
          </li>
        </ul>
        <p>
          If you want to be sure a file is the one the release workflow built, check it against the release&apos;s
          checksums first.
        </p>
      </section>

      <section id="checksums" data-reveal>
        <h2>Check a download</h2>
        <p>
          Each release lists SHA-256 checksums in <code>SHA256SUMS.txt</code>. Work out the checksum of your file and
          compare it with the line for that file.
        </p>
        <h3>Windows (PowerShell)</h3>
        <CodeBlock
          label="PowerShell"
          code={"Get-FileHash -Algorithm SHA256 .\\Fanimate-*-windows-x64-setup.exe"}
        />
        <h3>macOS</h3>
        <CodeBlock label="Terminal" code={"shasum -a 256 Fanimate-*-macos-arm64.dmg"} />
        <h3>Linux</h3>
        <CodeBlock label="Terminal" code={"sha256sum --ignore-missing -c SHA256SUMS.txt"} />
        <p className="fine">
          On Linux, put <code>SHA256SUMS.txt</code> in the same folder as the download; the command checks every file
          it finds there and prints OK for each one that matches.
        </p>
      </section>

      <section id="ffmpeg" data-reveal>
        <h2>More video formats with FFmpeg (optional)</h2>
        <p>Fanimate exports these with nothing else installed:</p>
        <ul>
          <li>MP4 (H.264) with sound, made by Windows&apos; or macOS&apos;s own video encoder</li>
          <li>MP4 (AV1), uncompressed AVI, animated GIF and animated PNG</li>
          <li>PNG, TIFF and OpenEXR picture sequences</li>
        </ul>
        <p>
          <a href="https://ffmpeg.org">FFmpeg</a> is a free program that adds H.265, WebM, MKV, ProRes 4444, ProRes
          422, DNxHR and animated WebP, and MP4 (H.264) on Linux. Fanimate never ships or downloads FFmpeg: it runs
          your own copy as a separate program, and finds it by itself once it is installed.
        </p>
        <h3>Windows</h3>
        <CodeBlock label="Terminal" code={"winget install Gyan.FFmpeg"} />
        <h3>macOS (Homebrew)</h3>
        <CodeBlock label="Terminal" code={"brew install ffmpeg"} />
        <h3>Ubuntu and Debian</h3>
        <CodeBlock label="Terminal" code={"sudo apt install ffmpeg"} />
        <p>
          Then open <strong>Edit, Preferences</strong> in Fanimate. Under <strong>Video formats</strong> it says
          which FFmpeg it found. If it found none, choose <strong>Look again</strong> (needed after installing while
          Fanimate is open) or <strong>Choose FFmpeg…</strong> to pick the program yourself. The Flatpak can only use
          an FFmpeg inside your home folder.
        </p>
      </section>

      <section id="updates" data-reveal>
        <h2>Updates</h2>
        <ul>
          <li>
            With <strong>Check for updates automatically</strong> on (Edit, Preferences, or the first-run dialog),
            Fanimate asks GitHub for the list of releases a few seconds after it starts. Nothing about you or your
            work is sent. <strong>Help, Check for Updates</strong> checks at any time.
          </li>
          <li>
            Nothing is downloaded until you choose <strong>Download</strong>, and nothing is installed until you
            choose <strong>Restart and Update</strong>. Fanimate asks you to save first.
          </li>
          <li>
            <strong>Updates are signed.</strong> Every download is checked against the release&apos;s signature; a file
            that does not match is deleted, never run.
          </li>
          <li>
            The Windows installer, the macOS app and the AppImage update themselves. Flatpak and .deb update
            through your system&apos;s software tools, and portable copies link to the download page.
          </li>
        </ul>
      </section>

      <section id="offline" data-reveal>
        <h2>Working offline, and locking Fanimate down</h2>
        <p>
          Fanimate works fully without a network or an account. <strong>Work offline</strong> in Edit, Preferences
          stops the update check, the only thing that uses the network today. For a whole computer, a school lab or a
          studio, a policy file does the same:
        </p>
        <CodeBlock label="fanimate-policy.json" code={'{ "offline": true, "ai": false }'} />
        <p>
          Put <code>fanimate-policy.json</code> beside the program to apply it to everyone, or <code>policy.json</code>{" "}
          in your Fanimate settings folder. <code>offline</code> stops all network use, <code>ai</code> set to{" "}
          <code>false</code> turns off every AI tool, and <code>cloud</code> set to <code>false</code> turns off cloud
          services. The stricter file wins, and a file that cannot be read locks everything.
        </p>
      </section>

      <section id="uninstall" data-reveal>
        <h2>Uninstalling</h2>
        <ul>
          <li><strong>Windows:</strong> Settings, Apps, Fanimate, Uninstall.</li>
          <li><strong>macOS:</strong> move Fanimate from Applications to the Bin.</li>
          <li><strong>AppImage and portable copies:</strong> delete the file or folder.</li>
          <li>
            <strong>.deb:</strong> <code>sudo apt remove fanimate</code>. <strong>Flatpak:</strong>{" "}
            <code>flatpak uninstall io.github.toonittmedia.Fanimate</code>.
          </li>
        </ul>
        <p className="fine">
          Settings, crash recovery files and the render queue live in your user data folder (
          <code>%APPDATA%\Fanimate</code> on Windows, <code>~/Library/Application Support/Fanimate</code> on macOS,{" "}
          <code>~/.local/share/fanimate</code> on Linux). Delete it to remove everything.
        </p>
      </section>

      <div className="note" data-reveal>
        <p>
          Something did not work? <a href="https://github.com/toonittmedia/fanimate/issues">Open an issue on GitHub</a>{" "}
          with your system and what you saw. See <a href="/whats-new">what&apos;s new</a> in the latest release.
        </p>
      </div>
    </article>
  );
}
