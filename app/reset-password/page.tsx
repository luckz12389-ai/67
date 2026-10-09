'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

export default function ResetPassword() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast('err', 'A senha precisa ter pelo menos 8 caracteres.');
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return toast('err', 'Não foi possível trocar a senha. Peça um novo link.');
    toast('ok', 'Senha alterada.');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="card narrow">
      <h1>Nova senha</h1>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Nova senha</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </label>
        <button className="btn primary big" disabled={busy}>{busy ? 'Salvando...' : 'Salvar senha'}</button>
      </form>
    </div>
  );
}
