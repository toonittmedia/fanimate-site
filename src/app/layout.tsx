import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";
import "./globals.css";

const description =
  "Fanimate is a free, open-source 2D character animation app for Windows, macOS and Linux: bone rigging, Smart Bones, vector drawing and frame-by-frame in one fast, GPU-rendered editor.";

export const metadata: Metadata = {
  metadataBase: new URL("https://fanimate.org"),
  title: {
    template: "%s | Fanimate",
    default: "Fanimate: free, open-source 2D character animation",
  },
  description,
  applicationName: "Fanimate",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://fanimate.org",
    siteName: "Fanimate",
    title: "Fanimate: free, open-source 2D character animation",
    description,
    images: [{ url: "/brand/social-card.png", width: 1200, height: 630, alt: "Fanimate: Rig it. Draw it. Move it." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanimate: free, open-source 2D character animation",
    description,
    images: ["/brand/social-card.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#15111F" },
    { media: "(prefers-color-scheme: light)", color: "#FAF8FF" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before paint: marks JS as available (so reveal styles apply) and restores the saved theme.
const boot = `(function(){var d=document.documentElement;d.className='js';try{var t=localStorage.getItem('fanimate-theme');if(t==='night'||t==='studio-grey'||t==='day'){d.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/brand/themes.css" />
        <link rel="preload" href="/brand/Inter-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Motion />
      </body>
    </html>
  );
}
