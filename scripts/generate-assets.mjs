/**
 * Generates the local /og.jpg social-share fallback (1200×630).
 *   npm install && npm run og
 * Favicons are served from Cloudinary (the gold NK logo on black); see index.html.
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const out = f => path.join(root, f);
const MONO = `<path d="M13 15.5 15.5 7l5 5L24 4.5 27.5 12l5-5 2.5 8.5Z"/><path d="M11 41V21l12 20V21"/><path d="M28 21v20M38 21 28.5 31.5 38.5 41"/>`;
const GOLD = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset=".45" stop-color="#F1C96B"/><stop offset="1" stop-color="#C8963E"/></linearGradient>`;
// og.jpg fallback (1200×630): gradient, aurora glows, monogram, name + titles
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2330"/><stop offset=".55" stop-color="#1E1924"/><stop offset="1" stop-color="#110E15"/></linearGradient>
  <radialGradient id="r1" cx=".85" cy=".15" r=".6"><stop offset="0" stop-color="#B7797A" stop-opacity=".30"/><stop offset="1" stop-color="#B7797A" stop-opacity="0"/></radialGradient>
  <radialGradient id="r2" cx=".1" cy=".95" r=".7"><stop offset="0" stop-color="#B8924F" stop-opacity=".22"/><stop offset="1" stop-color="#B8924F" stop-opacity="0"/></radialGradient>
  <radialGradient id="r3" cx=".78" cy=".55" r=".35"><stop offset="0" stop-color="#F1C96B" stop-opacity=".35"/><stop offset="1" stop-color="#F1C96B" stop-opacity="0"/></radialGradient>
  ${GOLD}
  <linearGradient id="gt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C8963E"/><stop offset=".5" stop-color="#FFF1C9"/><stop offset="1" stop-color="#F1C96B"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#r1)"/><rect width="1200" height="630" fill="url(#r2)"/><rect width="1200" height="630" fill="url(#r3)"/>
<g fill="none" stroke="#F1C96B" stroke-opacity=".5"><circle cx="940" cy="330" r="210" stroke-dasharray="3 10"/><circle cx="940" cy="330" r="178" stroke="#D9BC84" stroke-opacity=".25"/></g>
<g transform="translate(820 205) scale(5)" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${MONO}</g>
<path d="M72 70h26M72 70v26M1128 560h-26M1128 560v-26" stroke="#F1C96B" stroke-width="2" fill="none"/>
<text x="80" y="200" font-family="Syne, Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="7" fill="#D9BC84">KEYNOTE SPEAKER · AUTHOR</text>
<text x="80" y="300" font-family="'Cormorant Garamond', 'DejaVu Serif', Georgia, serif" font-size="96" font-weight="600" fill="#FFFFFF">Dr. Navjot</text>
<text x="80" y="398" font-family="'Cormorant Garamond', 'DejaVu Serif', Georgia, serif" font-size="96" font-weight="600" fill="url(#gt)">Kaur</text>
<text x="80" y="468" font-family="Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="30" fill="#DDE1FF">Educationist · Founder of global forums</text>
<text x="80" y="512" font-family="Manrope, 'DejaVu Sans', Arial, sans-serif" font-size="30" fill="#DDE1FF">Author of Cosmic Map of Answers</text>
<text x="80" y="570" font-family="'Instrument Serif', 'DejaVu Serif', Georgia, serif" font-style="italic" font-size="34" fill="#FFE9B0">Beauty with purpose.</text>
</svg>`);
await sharp(og).jpeg({ quality: 86, mozjpeg: true }).toFile(out('og.jpg'));
console.log('og.jpg generated in /public');
