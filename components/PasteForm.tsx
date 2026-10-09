'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { LANGUAGES } from '@/lib/languages';
import { MAX_CONTENT } from '@/lib/validate';
import { validateSlug } from '@/lib/slug';
import { useToast } from './Toast';

type Paste = {
  id: string;
  slug: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  is_public: boolean;
  is_listed: boolean;
  expires_at: string | null;
};

export default function PasteForm({ paste }: { paste?: Paste }) {
  const router = useRouter();
  const toast = useToast();
  const edit = !!paste;
  const [title, setTitle] = useState(paste?.title ?? '');
  const [content, setContent] = useState(paste?.content ?? '');
  const [language, setLanguage] = useState(paste?.language ?? 'plaintext');
  const [slug, setSlug] = useState(paste?.slug ?? '');
  const [tags, setTags] = useState((paste?.tags ?? []).join(', '));
  const [isPublic, setIsPublic] = useState(paste?.is_public ?? true);
  const [isListed, setIsListed] = useState(paste?.is_listed ?? true);
  const [expires, setExpires] = useState(edit ? 'keep' : 'never');
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState('');
  const [slugState, setSlugState] = useState<{ kind: 'idle' | 'checking' | 'ok' | 'bad'; msg?: string }>({ kind: 'idle' });
  const seq = useRef(0);

  useEffect(() => setOrigin(location.origin), []);

  useEffect(() => {
    const s = slug.trim();
    if (!s || (paste && s === paste.slug)) return setSlugState({ kind: 'idle' });
    const err = validateSlug(s);
    if (err) return setSlugState({ kind: 'bad', msg: err });
    setSlugState({ kind: 'checking' });
    const n = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ slug: s });
        if (paste) q.set('exclude', paste.id);
        const r = await fetch(`/api/slug-check?${q}`);
        const j = await r.json();
        if (n !== seq.current) return;
        setSlugState(j.available ? { kind: 'ok', msg: 'Nome disponível.' } : { kind: 'bad', msg: j.error ?? 'Esse nome já está em uso.' });
      } catch {
        if (n === seq.current) setSlugState({ kind: 'bad', msg: 'Não foi possível verificar agora.' });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [slug, paste]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (slugState.kind === 'bad') return toast('err', slugState.msg ?? 'Corrija o nome do link.');
    setBusy(true);
    try {
      const r = await fetch(edit ? `/api/pastes/${paste!.id}` : '/api/pastes', {
        method: edit ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, content, language, slug, tags, is_public: isPublic, is_listed: isListed, expires }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast('err', j.error ?? 'Erro ao salvar.');
        return;
      }
      toast('ok', edit ? 'Alterações salvas.' : 'Publicado.');
      router.push(`/p/${encodeURIComponent(j.slug)}`);
      router.refresh();
    } catch {
      toast('err', 'Sem conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  const shown = slug.trim() || (edit ? paste!.slug : 'código-aleatório');

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span>Título</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Ex.: Script de login" />
      </label>

      <label className="field">
        <span>Conteúdo</span>
        <textarea
          className="editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          rows={16}
          placeholder="Cole seu texto ou código aqui"
        />
        <small className={content.length > MAX_CONTENT ? 'bad' : 'hint'}>
          {content.length.toLocaleString('pt-BR')} / {MAX_CONTENT.toLocaleString('pt-BR')} caracteres
        </small>
      </label>

      <div className="grid2">
        <label className="field">
          <span>Linguagem</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tags (separadas por vírgula)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="roblox, script" />
        </label>
      </div>

      <div className="field">
        <label htmlFor="slug">Nome do link</label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={edit ? '' : 'Deixe vazio para gerar um nome aleatório'}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={64}
        />
        <div className="preview">
          <code>{origin}/raw/{shown}</code>
          <code>{origin}/p/{shown}</code>
        </div>
        {slugState.kind === 'checking' && <small className="hint">Verificando disponibilidade...</small>}
        {slugState.kind === 'ok' && <small className="good">{slugState.msg}</small>}
        {slugState.kind === 'bad' && <small className="bad">{slugState.msg}</small>}
        {edit && <small className="hint">Ao mudar o nome, o link antigo deixa de funcionar.</small>}
      </div>

      <div className="grid2">
        <label className="field">
          <span>Expiração</span>
          <select value={expires} onChange={(e) => setExpires(e.target.value)}>
            {edit && <option value="keep">Manter como está</option>}
            <option value="never">Nunca</option>
            <option value="1h">1 hora</option>
            <option value="1d">1 dia</option>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
          </select>
        </label>
        <div className="field">
          <span>Visibilidade</span>
          <label className="check">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Pública (qualquer pessoa com o link vê)
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={isPublic && isListed}
              disabled={!isPublic}
              onChange={(e) => setIsListed(e.target.checked)}
            />
            Aparecer na busca, nas recentes e no Google
          </label>
        </div>
      </div>

      <button className="btn primary big" type="submit" disabled={busy || slugState.kind === 'checking'}>
        {busy ? <Loader2 size={18} className="spin" /> : <Save size={18} />} {busy ? 'Salvando...' : edit ? 'Salvar alterações' : 'Publicar'}
      </button>
    </form>
  );
}
