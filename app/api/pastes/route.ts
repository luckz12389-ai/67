import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parsePaste } from '@/lib/validate';
import { randomSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Entre na sua conta para publicar.' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
  const parsed = parsePaste(body, 'create');
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;
  const custom = v.slug !== null;

  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = v.slug ?? randomSlug();
    const { data, error } = await supabase
      .from('pastes')
      .insert({
        slug,
        title: v.title,
        content: v.content,
        language: v.language,
        tags: v.tags,
        is_public: v.is_public,
        is_listed: v.is_listed,
        expires_at: v.expires_at ?? null,
        owner_id: user.id,
      })
      .select('slug')
      .single();
    if (!error && data) return NextResponse.json({ slug: data.slug });
    if (error?.code === '23505') {
      if (custom) return NextResponse.json({ error: 'Esse nome de link já está em uso. Escolha outro.' }, { status: 409 });
      continue;
    }
    if (error?.message?.includes('rate_limit'))
      return NextResponse.json({ error: 'Muitas publicações em pouco tempo. Aguarde um minuto.' }, { status: 429 });
    return NextResponse.json({ error: 'Não foi possível salvar. Tente novamente.' }, { status: 500 });
  }
  return NextResponse.json({ error: 'Não foi possível gerar um link livre. Tente novamente.' }, { status: 500 });
}
