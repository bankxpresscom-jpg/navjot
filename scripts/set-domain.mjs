/**
 * Replaces the placeholder domain everywhere it is used.
 *   npm run set-domain -- https://www.your-domain.com
 */
import { readFile, writeFile } from 'node:fs/promises';
const PLACEHOLDER = 'https://drnavjotkaur.example';
const domain = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) { console.error('Usage: npm run set-domain -- https://www.your-domain.com'); process.exit(1); }
for (const f of ['public/index.html', 'public/assets/app.js', 'public/robots.txt', 'public/sitemap.xml', 'public/site.webmanifest']) {
  const s = await readFile(f, 'utf8');
  if (s.includes(PLACEHOLDER)) { await writeFile(f, s.split(PLACEHOLDER).join(domain)); console.log('updated', f); }
}
