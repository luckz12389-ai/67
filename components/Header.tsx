import Link from 'next/link';
import { Plus, Search, LayoutDashboard, LogIn, Terminal } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from './SignOutButton';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <Terminal size={20} /> HelloBin
      </Link>
      <input id="nav-toggle" type="checkbox" className="nav-toggle" aria-label="Abrir menu" />
      <label htmlFor="nav-toggle" className="burger" aria-hidden="true">
        <span />
        <span />
        <span />
      </label>
      <nav className="nav">
        <Link href="/search" className="btn ghost">
          <Search size={16} /> Buscar
        </Link>
        <Link href="/new" className="btn primary">
          <Plus size={16} /> Nova publicação
        </Link>
        {user ? (
          <>
            <Link href="/dashboard" className="btn ghost">
              <LayoutDashboard size={16} /> Painel
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="btn ghost">
            <LogIn size={16} /> Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
