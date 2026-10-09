export const SITE_NAME = 'HelloBin';

export function siteUrl(): string {
  const custom = process.env.NEXT_PUBLIC_SITE_URL;
  if (custom) return custom.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export function safeNext(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  return next;
}
