/**
 * Generates the favicon set + /og.jpg fallback from public/favicon.svg.
 *   npm install && npm run icons
 * Outputs (in /public): favicon-16.png, favicon-32.png, favicon.ico (16/32/48),
 * apple-touch-icon.png (180), icon-192.png, icon-512.png,
 * icon-maskable-192.png, icon-maskable-512.png, og.jpg (1200×630).
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const out = f => path.join(root, f);
const svg = await readFile(out('favicon.svg'));

// Monogram paths shared by the maskable icon and the OG image
const MONO = `<path d="M13 15.5 15.5 7l5 5L24 4.5 27.5 12l5-5 2.5 8.5Z"/><path d="M11 41V21l12 20V21"/><path d="M28 21v20M38 21 28.5 31.5 38.5 41"/>`;
const GOLD = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset=".45" stop-color="#F1C96B"/><stop offset="1" stop-color="#C8963E"/></linearGradient>`;

const png = (input, size) => sharp(input, { density: 72 * size / 48 * 2 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// Standard icons (rounded square from favicon.svg)
for (const [name, size] of [['favicon-16.png', 16], ['favicon-32.png', 32], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await writeFile(out(name), await png(svg, size));
}
// Apple touch icon: full-bleed square (iOS rounds it)
const square = (scale) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B2FA3"/><stop offset=".6" stop-color="#0B1C6E"/><stop offset="1" stop-color="#050A24"/></linearGradient>${GOLD}</defs><rect width="48" height="48" fill="url(#b)"/><g transform="translate(${24 - 24 * scale} ${23.6 - 24 * scale}) scale(${scale})" fill="none" stroke="url(#g)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${MONO}</g></svg>`);
await writeFile(out('apple-touch-icon.png'), await png(square(0.72), 180));
// Maskable: monogram inside the 80% safe zone
await writeFile(out('icon-maskable-192.png'), await png(square(0.6), 192));
await writeFile(out('icon-maskable-512.png'), await png(square(0.6), 512));

// favicon.ico: ICO container with embedded PNGs (16, 32, 48)
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map(s => png(svg, s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(imgs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += imgs[i].length;
});
await writeFile(out('favicon.ico'), Buffer.concat([header, ...imgs]));

// og.jpg fallback (1200×630): gradient, aurora glows, monogram, name + titles
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B2FA3"/><stop offset=".5" stop-color="#0B1C6E"/><stop offset="1" stop-color="#050A24"/></linearGradient>
  <radialGradient id="r1" cx=".85" cy=".15" r=".6"><stop offset="0" stop-color="#FF6FAE" stop-opacity=".45"/><stop offset="1" stop-color="#FF6FAE" stop-opacity="0"/></radialGradient>
  <radialGradient id="r2" cx=".1" cy=".95" r=".7"><stop offset="0" stop-color="#8B6CFF" stop-opacity=".55"/><stop offset="1" stop-color="#8B6CFF" stop-opacity="0"/></radialGradient>
  <radialGradient id="r3" cx=".78" cy=".55" r=".35"><stop offset="0" stop-color="#F1C96B" stop-opacity=".35"/><stop offset="1" stop-color="#F1C96B" stop-opacity="0"/></radialGradient>
  ${GOLD}
  <linearGradient id="gt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C8963E"/><stop offset=".5" stop-color="#FFF1C9"/><stop offset="1" stop-color="#F1C96B"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#r1)"/><rect width="1200" height="630" fill="url(#r2)"/><rect width="1200" height="630" fill="url(#r3)"/>
<g fill="none" stroke="#F1C96B" stroke-opacity=".5"><circle cx="940" cy="330" r="210" stroke-dasharray="3 10"/><circle cx="940" cy="330" r="178" stroke="#FF6FAE" stroke-opacity=".35"/></g>
<g transform="translate(820 205) scale(5)" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${MONO}</g>
<path d="M72 70h26M72 70v26M1128 560h-26M1128 560v-26" stroke="#F1C96B" stroke-width="2" fill="none"/>
<text x="80" y="200" font-family="Syne, Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="6" fill="#F1C96B">MRS. INDIA PLANET 2022</text>
<text x="80" y="300" font-family="Syne, 'DejaVu Sans', Arial, sans-serif" font-size="92" font-weight="800" fill="#FFFFFF">Dr. Navjot</text>
<text x="80" y="398" font-family="Syne, 'DejaVu Sans', Arial, sans-serif" font-size="92" font-weight="800" fill="url(#gt)">Kaur</text>
<text x="80" y="468" font-family="Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="30" fill="#DDE1FF">Educationist · Author · Keynote Speaker</text>
<text x="80" y="512" font-family="Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="30" fill="#DDE1FF">Global Education Leader</text>
<text x="80" y="570" font-family="'Instrument Serif', 'DejaVu Serif', Georgia, serif" font-style="italic" font-size="34" fill="#FFE9B0">Beauty with purpose.</text>
</svg>`);
await sharp(og).jpeg({ quality: 86, mozjpeg: true }).toFile(out('og.jpg'));
console.log('Icons + og.jpg generated in /public');
