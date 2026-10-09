import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="big404">404</div>
      <h1>Essa publicação não existe</h1>
      <p>O link pode ter sido digitado errado, trocado pelo dono, excluído, expirado ou ser privado.</p>
      <div className="row center-row">
        <Link className="btn primary" href="/new">Criar publicação</Link>
        <Link className="btn" href="/search">Buscar publicações</Link>
      </div>
    </div>
  );
}
