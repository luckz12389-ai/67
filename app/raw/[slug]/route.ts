import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function text(body: string, status: number, extra: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex',
      ...extra,
    },
  });
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const supabase = createClient();
  const { data } = await supabase
    .from('pastes')
    .select('content,is_public,expires_at')
    .eq('slug_lower', slug.toLowerCase())
    .maybeSingle();

  if (!data || (data.expires_at && new Date(data.expires_at) < new Date())) return text('Not found', 404);

  return text(data.content, 200, {
    'cache-control': data.is_public ? 'public, s-maxage=30, stale-while-revalidate=60' : 'private, no-store',
  });
}
