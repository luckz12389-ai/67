'use client';
import { Copy, Link2, Share2, FileText } from 'lucide-react';
import { useToast } from './Toast';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export default function PasteActions({ slug, title }: { slug: string; title: string }) {
  const toast = useToast();
  const enc = encodeURIComponent(slug);
  const pageUrl = () => `${location.origin}/p/${enc}`;

  return (
    <div className="actions">
      <button
        className="btn"
        onClick={async () => {
          try {
            const r = await fetch(`/raw/${enc}`);
            if (!r.ok) throw new Error();
            const ok = await copy(await r.text());
            toast(ok ? 'ok' : 'err', ok ? 'Código copiado.' : 'Não foi possível copiar.');
          } catch {
            toast('err', 'Não foi possível copiar o código.');
          }
        }}
      >
        <Copy size={16} /> Copiar código
      </button>
      <button
        className="btn"
        onClick={async () => {
          const ok = await copy(`${location.origin}/raw/${enc}`);
          toast(ok ? 'ok' : 'err', ok ? 'Link RAW copiado.' : 'Não foi possível copiar.');
        }}
      >
        <Link2 size={16} /> Copiar link RAW
      </button>
      <a className="btn" href={`/raw/${enc}`} target="_blank" rel="noopener noreferrer">
        <FileText size={16} /> Abrir RAW
      </a>
      <button
        className="btn"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url: pageUrl() });
            } catch {
              /* cancelado */
            }
          } else {
            const ok = await copy(pageUrl());
            toast(ok ? 'ok' : 'err', ok ? 'Link copiado.' : 'Não foi possível copiar.');
          }
        }}
      >
        <Share2 size={16} /> Compartilhar
      </button>
    </div>
  );
}
