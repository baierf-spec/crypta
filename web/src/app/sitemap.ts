import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return [
    { url: `${base}/`, priority: 0.8 },
    { url: `${base}/dashboard`, priority: 0.6 },
    { url: `${base}/blog`, priority: 0.6 },
  ];
}


