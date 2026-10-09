import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Pencil, Eye, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Meu painel', robots: { index: false, follow: false } };

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/dashboard');

  const { data: pastes } = await supabase
    .from('pastes')
    .select('id,slug,title,language,is_public,is_listed,views,expires_at,updated_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="row between">
        <h1>Minhas publicações</h1>
        <Link className="btn primary" href="/new">
          <Plus size={16} /> Nova
        </Link>
      </div>
      <p className="hint">Conectado como {user.email}</p>
      {!pastes || pastes.length === 0 ? (
        <p className="hint">Você ainda não publicou nada. Crie sua primeira publicação.</p>
      ) : (
        <ul className="list">
          {pastes.map((p) => (
            <li key={p.id} className="item">
              <div>
                <Link href={`/p/${encodeURIComponent(p.slug)}`}>
                  <strong>{p.title}</strong>
                </Link>
                <span className="hint">
                  /{p.slug} · {p.language === 'xml' ? 'html' : p.language} · <Eye size={12} /> {Number(p.views)}
                  {!p.is_public && (
                    <>
                      {' '}· <Lock size={12} /> privada
                    </>
                  )}
                  {p.is_public && !p.is_listed && ' · fora da busca'}
                  {p.expires_at && ` · expira ${new Date(p.expires_at).toLocaleDateString('pt-BR')}`}
                </span>
              </div>
              <div className="row">
                <Link className="btn" href={`/edit/${encodeURIComponent(p.slug)}`}>
                  <Pencil size={16} /> Editar
                </Link>
                <DeleteButton id={p.id} redirect="/dashboard" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
