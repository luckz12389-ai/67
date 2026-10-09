import type { Metadata } from 'next';
import PasteForm from '@/components/PasteForm';

export const metadata: Metadata = { title: 'Nova publicação', robots: { index: false, follow: false } };

export default function NewPage() {
  return (
    <>
      <h1>Nova publicação</h1>
      <PasteForm />
    </>
  );
}
