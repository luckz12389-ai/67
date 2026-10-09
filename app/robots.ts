import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/raw/', '/edit/', '/dashboard', '/login', '/new', '/reset-password', '/auth/', '/search'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
