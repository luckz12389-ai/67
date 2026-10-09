import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get('slug') ?? '').trim();
  const exclude = searchParams.get('exclude');
  const err = validateSlug(slug);
  if (err) return NextResponse.json({ available: false, error: err });
  const uuid = /^[0-9a-f-]{36}$/i;
  const supabase = createClient();
  const { data, error } = await supabase.rpc('slug_available', {
    p_slug: slug,
    p_exclude: exclude && uuid.test(exclude) ? exclude : null,
  });
  if (error) return NextResponse.json({ available: false, error: 'Não foi possível verificar agora.' }, { status: 500 });
  return NextResponse.json({ available: data === true });
}
