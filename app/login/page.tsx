import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return <AuthForm next={searchParams.next} linkError={searchParams.error === 'link'} />;
}
