import type { MetadataRoute } from "next";

const BASE = "https://fanimate.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/install`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/assistant`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/whats-new`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
