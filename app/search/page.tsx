import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Buscar publicações', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
  const q = (searchParams.q ?? '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  const tag = (searchParams.tag ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);

  const supabase = createClient();
  let query = supabase
    .from('public_listing')
    .select('slug,title,language,tags,views,created_at')
    .order('created_at', { ascending: false })
    .limit(30);
  if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,content.ilike.%${q}%`);
  if (tag) query = query.contains('tags', [tag]);
  const { data, error } = await query;

  return (
    <>
      <h1>Buscar publicações</h1>
      <form className="searchbar" action="/search" method="get">
        <input name="q" defaultValue={q} placeholder="Título, nome do link ou trecho do conteúdo" maxLength={60} />
        <button className="btn primary">
          <Search size={16} /> Buscar
        </button>
      </form>
      {tag && <p className="hint">Filtrando pela tag #{tag}</p>}
      {error && <p className="bad">Não foi possível buscar agora. Tente novamente.</p>}
      {!error && data?.length === 0 && <p className="hint">Nenhuma publicação pública encontrada.</p>}
      <ul className="list">
        {data?.map((p) => (
          <li key={p.slug}>
            <Link href={`/p/${encodeURIComponent(p.slug)}`}>
              <strong>{p.title}</strong>
              <span className="hint">
                /{p.slug} · {p.language === 'xml' ? 'html' : p.language} · {Number(p.views)} visualizações
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
