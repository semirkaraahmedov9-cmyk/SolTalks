/**
 * Builds a URL to a file in /public. Needed because the site lives under
 * /SolTalks/ on GitHub Pages, so a plain "/brand/logo.png" would 404.
 */
export function publicUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}
