'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useToast } from './Toast';

export default function DeleteButton({ id, redirect = '/dashboard' }: { id: string; redirect?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn danger"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) return;
        setBusy(true);
        const r = await fetch(`/api/pastes/${id}`, { method: 'DELETE' });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return toast('err', j.error ?? 'Não foi possível excluir.');
        toast('ok', 'Publicação excluída.');
        router.push(redirect);
        router.refresh();
      }}
    >
      <Trash2 size={16} /> {busy ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
