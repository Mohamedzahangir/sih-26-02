/**
 * Resolves a public/ asset path against the configured Vite base URL,
 * so images work at the domain root or under a sub-path deployment.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
