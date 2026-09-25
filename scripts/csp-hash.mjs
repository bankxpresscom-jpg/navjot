/**
 * Recomputes the sha256 of the inline boot <script> in public/index.html
 * and writes it into the Content-Security-Policy in public/_headers.
 *   npm run csp-hash
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) throw new Error('Inline boot script not found');
const hash = `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`;
const headers = await readFile('public/_headers', 'utf8');
const next = headers.replace(/'sha256-[A-Za-z0-9+/=]+'/, hash);
await writeFile('public/_headers', next);
console.log('CSP boot hash:', hash);
