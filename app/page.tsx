import Link from 'next/link';
import { Plus, Link2, ShieldCheck, Search as SearchIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();
  const { data: recent } = await supabase
    .from('public_listing')
    .select('slug,title,language,views,created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <>
      <section className="hero">
        <h1>Publique código e texto. Escolha o nome do link.</h1>
        <p>
          O HelloBin guarda seu texto ou código e entrega uma página bonita e um link RAW que você nomeia, como{' '}
          <code>/raw/Hello1</code>. Dá para trocar o nome depois sem perder o conteúdo.
        </p>
        <div className="row center-row">
          <Link href="/new" className="btn primary big">
            <Plus size={18} /> Criar publicação
          </Link>
          <Link href="/search" className="btn big">
            <SearchIcon size={18} /> Buscar
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <Link2 size={22} />
          <h3>Link RAW com o nome que você quiser</h3>
          <p>Letras, números, hífen e underscore. O site avisa na hora se o nome já está em uso.</p>
        </div>
        <div className="card">
          <ShieldCheck size={22} />
          <h3>Público ou privado</h3>
          <p>Publicações privadas só abrem para você, mesmo que alguém descubra o link.</p>
        </div>
        <div className="card">
          <SearchIcon size={22} />
          <h3>Busca e expiração</h3>
          <p>Encontre publicações públicas e defina quando a sua deve sair do ar.</p>
        </div>
      </section>

      <section>
        <h2>Publicações recentes</h2>
        {!recent || recent.length === 0 ? (
          <p className="hint">Ainda não há publicações públicas. Seja a primeira pessoa a publicar.</p>
        ) : (
          <ul className="list">
            {recent.map((p) => (
              <li key={p.slug}>
                <Link href={`/p/${encodeURIComponent(p.slug)}`}>
                  <strong>{p.title}</strong>
                  <span className="hint">
                    {p.language === 'xml' ? 'html' : p.language} · {new Date(p.created_at).toLocaleDateString('pt-BR')} · {Number(p.views)} visualizações
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
