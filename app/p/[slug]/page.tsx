import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, Eye, Lock, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/site';
import CodeView from '@/components/CodeView';
import PasteActions from '@/components/PasteActions';

export const dynamic = 'force-dynamic';

async function load(rawSlug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('pastes')
    .select('id,slug,title,content,language,tags,is_public,is_listed,views,owner_id,expires_at,created_at,updated_at')
    .eq('slug_lower', decodeURIComponent(rawSlug).toLowerCase())
    .maybeSingle();
  if (!data || (data.expires_at && new Date(data.expires_at) < new Date())) return { supabase, paste: null };
  return { supabase, paste: data };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { paste } = await load(params.slug);
  if (!paste) return { title: 'Publicação não encontrada', robots: { index: false, follow: false } };
  const desc = paste.content.replace(/\s+/g, ' ').trim().slice(0, 150) || 'Publicação no HelloBin';
  const url = `${siteUrl()}/p/${encodeURIComponent(paste.slug)}`;
  const indexable = paste.is_public && paste.is_listed;
  if (!paste.is_public) return { title: paste.title, robots: { index: false, follow: false } };
  return {
    title: paste.title,
    description: desc,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title: paste.title, description: desc, url, siteName: 'HelloBin', type: 'article' },
    twitter: { card: 'summary', title: paste.title, description: desc },
  };
}

export default async function PastePage({ params }: { params: { slug: string } }) {
  const { supabase, paste } = await load(params.slug);
  if (!paste) notFound();

  if (paste.is_public) await supabase.rpc('increment_views', { p_slug: paste.slug });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === paste.owner_id;
  const date = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <article>
      <div className="row between">
        <h1>{paste.title}</h1>
        {isOwner && (
          <Link className="btn" href={`/edit/${encodeURIComponent(paste.slug)}`}>
            <Pencil size={16} /> Editar
          </Link>
        )}
      </div>
      <div className="meta">
        <span className="badge">{paste.language === 'xml' ? 'html' : paste.language}</span>
        {!paste.is_public && (
          <span className="badge warn">
            <Lock size={12} /> Privada
          </span>
        )}
        {paste.expires_at && (
          <span className="badge">
            <Clock size={12} /> Expira em {date(paste.expires_at)}
          </span>
        )}
        <span>
          <Eye size={14} /> {Number(paste.views).toLocaleString('pt-BR')} visualizações
        </span>
        <span>Criado em {date(paste.created_at)}</span>
        <span>Atualizado em {date(paste.updated_at)}</span>
      </div>
      {paste.tags.length > 0 && (
        <div className="tags">
          {paste.tags.map((t: string) => (
            <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="tag">
              #{t}
            </Link>
          ))}
        </div>
      )}
      <PasteActions slug={paste.slug} title={paste.title} />
      <CodeView content={paste.content} language={paste.language} />
    </article>
  );
}
