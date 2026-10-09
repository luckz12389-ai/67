import type { Metadata, Viewport } from 'next';
import 'highlight.js/styles/github-dark.css';
import './globals.css';
import Header from '@/components/Header';
import { ToastProvider } from '@/components/Toast';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'HelloBin: publique código e texto com links personalizados', template: '%s | HelloBin' },
  description:
    'HelloBin é um serviço gratuito para publicar e compartilhar código e texto, com link RAW personalizado, publicações públicas ou privadas e busca.',
  openGraph: { siteName: 'HelloBin', type: 'website', locale: 'pt_BR' },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
};

export const viewport: Viewport = { themeColor: '#0f1115', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <Header />
          <main className="page">{children}</main>
          <footer className="foot">HelloBin: o conteúdo publicado nunca é executado pelo site.</footer>
        </ToastProvider>
      </body>
    </html>
  );
}
