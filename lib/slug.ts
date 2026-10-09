export const SLUG_RE = /^[A-Za-z0-9_-]{3,64}$/;

export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return 'Use de 3 a 64 caracteres: letras, números, hífen (-) ou underscore (_).';
  return null;
}

export function randomSlug(len = 8): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
