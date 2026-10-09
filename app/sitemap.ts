import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const items: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'weekly', priority: 1 }];
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await supabase
      .from('public_listing')
      .select('slug,updated_at')
      .order('updated_at', { ascending: false })
      .limit(5000);
    for (const p of data ?? []) {
      items.push({ url: `${base}/p/${encodeURIComponent(p.slug)}`, lastModified: new Date(p.updated_at), changeFrequency: 'monthly', priority: 0.6 });
    }
  } catch {
    /* devolve ao menos a home */
  }
  return items;
}
