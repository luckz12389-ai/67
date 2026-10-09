import { LANGUAGE_IDS } from './languages';
import { validateSlug } from './slug';

export const MAX_CONTENT = 200_000;

export type PasteFields = {
  slug: string | null; // null = gerar aleatório
  title: string;
  content: string;
  language: string;
  tags: string[];
  is_public: boolean;
  is_listed: boolean;
  expires_at: string | null | undefined; // undefined = manter (somente edição)
};

const EXPIRY_MS: Record<string, number> = {
  '1h': 3_600_000,
  '1d': 86_400_000,
  '7d': 604_800_000,
  '30d': 2_592_000_000,
};

export function parsePaste(
  body: any,
  mode: 'create' | 'edit'
): { ok: true; value: PasteFields } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Requisição inválida.' };

  const title = String(body.title ?? '').trim() || 'Sem título';
  if (title.length > 120) return { ok: false, error: 'O título pode ter no máximo 120 caracteres.' };

  const content = typeof body.content === 'string' ? body.content : '';
  if (content.trim().length === 0) return { ok: false, error: 'O conteúdo não pode ficar vazio.' };
  if (content.length > MAX_CONTENT)
    return { ok: false, error: `O conteúdo passou do limite de ${MAX_CONTENT.toLocaleString('pt-BR')} caracteres.` };

  const language = String(body.language ?? 'plaintext');
  if (!LANGUAGE_IDS.includes(language)) return { ok: false, error: 'Linguagem inválida.' };

  const rawTags = Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',');
  const tags = Array.from(
    new Set(
      rawTags
        .map((t: unknown) => String(t).trim().toLowerCase())
        .filter((t: string) => /^[a-z0-9_-]{1,20}$/.test(t))
    )
  ).slice(0, 8) as string[];

  let slug: string | null = String(body.slug ?? '').trim();
  if (slug === '') {
    if (mode === 'edit') return { ok: false, error: 'O slug não pode ficar vazio ao editar.' };
    slug = null;
  } else {
    const err = validateSlug(slug);
    if (err) return { ok: false, error: err };
  }

  const is_public = body.is_public !== false;
  const is_listed = is_public && body.is_listed !== false;

  let expires_at: string | null | undefined = null;
  const exp = String(body.expires ?? 'never');
  if (exp === 'keep' && mode === 'edit') expires_at = undefined;
  else if (exp in EXPIRY_MS) expires_at = new Date(Date.now() + EXPIRY_MS[exp]).toISOString();

  return { ok: true, value: { slug, title, content, language, tags, is_public, is_listed, expires_at } };
}
