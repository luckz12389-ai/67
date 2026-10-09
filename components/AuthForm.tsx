'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { safeNext } from '@/lib/site';
import { useToast } from './Toast';

type Mode = 'login' | 'signup' | 'forgot';

export default function AuthForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const dest = safeNext(next);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    const supabase = createClient();
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return toast('err', 'E-mail ou senha incorretos.');
        router.push(dest);
        router.refresh();
      } else if (mode === 'signup') {
        if (password.length < 8) return toast('err', 'A senha precisa ter pelo menos 8 caracteres.');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(dest)}` },
        });
        if (error) return toast('err', error.message.includes('registered') ? 'Esse e-mail já tem conta.' : 'Não foi possível criar a conta.');
        if (data.session) {
          router.push(dest);
          router.refresh();
        } else {
          setInfo('Conta criada. Abra o e-mail de confirmação neste mesmo navegador e toque no link.');
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) return toast('err', 'Não foi possível enviar o e-mail agora.');
        setInfo('Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha. Abra-o neste mesmo navegador.');
      }
    } finally {
      setBusy(false);
    }
  }

  const label = mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link';
  return (
    <div className="card narrow">
      <h1>{mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Recuperar acesso'}</h1>
      {linkError && <p className="bad">O link expirou ou já foi usado. Peça um novo.</p>}
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>E-mail</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {mode !== 'forgot' && (
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              required
              minLength={mode === 'signup' ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
        )}
        <button className="btn primary big" disabled={busy}>
          {busy && <Loader2 size={18} className="spin" />} {label}
        </button>
      </form>
      {info && <p className="good">{info}</p>}
      <div className="links">
        {mode !== 'login' && <button className="link" onClick={() => setMode('login')}>Já tenho conta</button>}
        {mode !== 'signup' && <button className="link" onClick={() => setMode('signup')}>Criar conta</button>}
        {mode !== 'forgot' && <button className="link" onClick={() => setMode('forgot')}>Esqueci a senha</button>}
      </div>
    </div>
  );
}
