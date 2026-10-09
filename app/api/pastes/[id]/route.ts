import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parsePaste } from '@/lib/validate';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'Publicação inválida.' }, { status: 400 });
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Entre na sua conta.' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
  const parsed = parsePaste(body, 'edit');
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  const update: Record<string, unknown> = {
    slug: v.slug,
    title: v.title,
    content: v.content,
    language: v.language,
    tags: v.tags,
    is_public: v.is_public,
    is_listed: v.is_listed,
  };
  if (v.expires_at !== undefined) update.expires_at = v.expires_at;

  const { data, error } = await supabase
    .from('pastes')
    .update(update)
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .select('slug');

  if (error?.code === '23505')
    return NextResponse.json({ error: 'Esse nome de link já está em uso. Escolha outro.' }, { status: 409 });
  if (error) return NextResponse.json({ error: 'Não foi possível salvar. Tente novamente.' }, { status: 500 });
  if (!data || data.length === 0)
    return NextResponse.json({ error: 'Publicação não encontrada ou sem permissão.' }, { status: 404 });
  return NextResponse.json({ slug: data[0].slug });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'Publicação inválida.' }, { status: 400 });
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Entre na sua conta.' }, { status: 401 });

  const { data, error } = await supabase
    .from('pastes')
    .delete()
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .select('id');
  if (error) return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 500 });
  if (!data || data.length === 0)
    return NextResponse.json({ error: 'Publicação não encontrada ou sem permissão.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
