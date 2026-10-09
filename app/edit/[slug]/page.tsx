import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PasteForm from '@/components/PasteForm';
import DeleteButton from '@/components/DeleteButton';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Editar publicação', robots: { index: false, follow: false } };

export default async function EditPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: paste } = await supabase
    .from('pastes')
    .select('id,slug,title,content,language,tags,is_public,is_listed,expires_at')
    .eq('slug_lower', decodeURIComponent(params.slug).toLowerCase())
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!paste) notFound();
  return (
    <>
      <div className="row between">
        <h1>Editar publicação</h1>
        <DeleteButton id={paste.id} />
      </div>
      <PasteForm paste={paste} />
    </>
  );
}
