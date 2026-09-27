/**
 * Curated Google Fonts. `w` lists weights that exist for the family (static fonts
 * reject weights they do not have), `i` = italic available.
 */
export const FONTS = [
  // serif / editorial
  { n: 'Cormorant Garamond', c: 'serif', w: [300, 400, 500, 600], i: 1 },
  { n: 'Playfair Display', c: 'serif', w: [400, 500, 700, 900], i: 1 },
  { n: 'Fraunces', c: 'serif', w: [300, 400, 600, 800], i: 1 },
  { n: 'Bodoni Moda', c: 'serif', w: [400, 500, 700], i: 1 },
  { n: 'DM Serif Display', c: 'serif', w: [400], i: 1 },
  { n: 'Instrument Serif', c: 'serif', w: [400], i: 1 },
  { n: 'EB Garamond', c: 'serif', w: [400, 500, 600], i: 1 },
  { n: 'Lora', c: 'serif', w: [400, 500, 600], i: 1 },
  { n: 'Newsreader', c: 'serif', w: [300, 400, 600], i: 1 },
  { n: 'Source Serif 4', c: 'serif', w: [400, 600], i: 1 },
  { n: 'Gloock', c: 'serif', w: [400], i: 0 },
  { n: 'Young Serif', c: 'serif', w: [400], i: 0 },
  { n: 'Italiana', c: 'serif', w: [400], i: 0 },
  // sans
  { n: 'Inter', c: 'sans', w: [300, 400, 500, 600, 700, 800], i: 0 },
  { n: 'Inter Tight', c: 'sans', w: [400, 500, 600, 700, 800], i: 1 },
  { n: 'Manrope', c: 'sans', w: [300, 400, 500, 600, 700, 800], i: 0 },
  { n: 'Sora', c: 'sans', w: [300, 400, 500, 600, 700], i: 0 },
  { n: 'Space Grotesk', c: 'sans', w: [300, 400, 500, 600, 700], i: 0 },
  { n: 'DM Sans', c: 'sans', w: [400, 500, 700], i: 1 },
  { n: 'Jost', c: 'sans', w: [300, 400, 500, 600], i: 1 },
  { n: 'Outfit', c: 'sans', w: [300, 400, 500, 600, 700, 800], i: 0 },
  { n: 'Plus Jakarta Sans', c: 'sans', w: [400, 500, 600, 700, 800], i: 1 },
  { n: 'Work Sans', c: 'sans', w: [300, 400, 500, 600, 700], i: 1 },
  { n: 'Archivo', c: 'sans', w: [400, 500, 600, 700, 800, 900], i: 1 },
  { n: 'Syne', c: 'sans', w: [400, 500, 600, 700, 800], i: 0 },
  { n: 'Unbounded', c: 'sans', w: [300, 400, 500, 700, 900], i: 0 },
  { n: 'Bricolage Grotesque', c: 'sans', w: [400, 500, 600, 700, 800], i: 0 },
  { n: 'Instrument Sans', c: 'sans', w: [400, 500, 600, 700], i: 1 },
  { n: 'Montserrat', c: 'sans', w: [300, 400, 500, 600, 700, 800], i: 1 },
  { n: 'Poppins', c: 'sans', w: [300, 400, 500, 600, 700], i: 1 },
  { n: 'Figtree', c: 'sans', w: [300, 400, 500, 600, 700, 800], i: 1 },
  { n: 'Nunito', c: 'sans', w: [400, 600, 700, 800], i: 1 },
  { n: 'Raleway', c: 'sans', w: [300, 400, 500, 600, 700], i: 1 },
  { n: 'Lexend', c: 'sans', w: [300, 400, 500, 600, 700], i: 0 },
  { n: 'Rubik', c: 'sans', w: [300, 400, 500, 700, 900], i: 1 },
  { n: 'IBM Plex Sans', c: 'sans', w: [300, 400, 500, 600, 700], i: 1 },
  // display
  { n: 'Bebas Neue', c: 'display', w: [400], i: 0 },
  { n: 'Anton', c: 'display', w: [400], i: 0 },
  { n: 'Oswald', c: 'display', w: [300, 400, 500, 600, 700], i: 0 },
  { n: 'Big Shoulders Display', c: 'display', w: [500, 700, 900], i: 0 },
  { n: 'Archivo Black', c: 'display', w: [400], i: 0 },
  { n: 'Dela Gothic One', c: 'display', w: [400], i: 0 },
  { n: 'Righteous', c: 'display', w: [400], i: 0 },
  { n: 'Shrikhand', c: 'display', w: [400], i: 0 },
  { n: 'Abril Fatface', c: 'display', w: [400], i: 0 },
  { n: 'Bungee', c: 'display', w: [400], i: 0 },
  { n: 'Rubik Mono One', c: 'display', w: [400], i: 0 },
  // mono
  { n: 'JetBrains Mono', c: 'mono', w: [400, 500, 700], i: 0 },
  { n: 'IBM Plex Mono', c: 'mono', w: [400, 500, 600], i: 1 },
  { n: 'Space Mono', c: 'mono', w: [400, 700], i: 1 },
  { n: 'DM Mono', c: 'mono', w: [300, 400, 500], i: 1 },
  // script
  { n: 'Caveat', c: 'script', w: [400, 500, 600, 700], i: 0 },
  { n: 'Pinyon Script', c: 'script', w: [400], i: 0 }
];
export const FONT_NAMES = FONTS.map(f => f.n);
const byName = Object.fromEntries(FONTS.map(f => [f.n.toLowerCase(), f]));
export const fontInfo = n => byName[String(n || '').toLowerCase()] || null;
export const fontStack = (n, cat) => {
  const c = cat || fontInfo(n)?.c || 'sans';
  const fb = c === 'serif' ? 'Georgia,"Times New Roman",serif' : c === 'mono' ? 'ui-monospace,Menlo,Consolas,monospace' : c === 'script' ? 'cursive' : 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  return `"${String(n).replace(/["\\]/g, '')}",${fb}`;
};

/** Google Fonts CSS2 URL for a set of { name, weights[], italic } requests (deduplicated per family). */
export function fontsUrl(reqs) {
  const fam = new Map();
  for (const r of reqs) {
    if (!r || !r.name) continue;
    const info = fontInfo(r.name);
    const name = info ? info.n : String(r.name).trim();
    if (!/^[\w \-]{2,60}$/.test(name)) continue;
    const cur = fam.get(name) || { w: new Set(), ital: false, info };
    const avail = info ? info.w : [400]; // unknown family: 400 is the only safe weight
    for (const w of r.weights || [400]) {
      // pick the nearest weight the family really has
      const near = avail.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a, avail[0]);
      cur.w.add(near);
    }
    if (r.italic && (!info || info.i)) cur.ital = true;
    fam.set(name, cur);
  }
  if (!fam.size) return '';
  const parts = [...fam].map(([name, v]) => {
    const ws = [...v.w].sort((a, b) => a - b);
    const fam = 'family=' + encodeURIComponent(name).replace(/%20/g, '+');
    if (v.ital) return `${fam}:ital,wght@${[...ws.map(w => `0,${w}`), ...ws.map(w => `1,${w}`)].join(';')}`;
    if (ws.length === 1 && ws[0] === 400) return fam;
    return `${fam}:wght@${ws.join(';')}`;
  });
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}

/** Hand-picked display/body pairings used by "Shuffle design" */
export const PAIRS = [
  ['Playfair Display', 'Inter'], ['Fraunces', 'Manrope'], ['Syne', 'Inter'], ['Unbounded', 'Manrope'], ['DM Serif Display', 'DM Sans'],
  ['Bebas Neue', 'Work Sans'], ['Instrument Serif', 'Inter'], ['Bodoni Moda', 'Jost'], ['Gloock', 'Figtree'], ['Space Grotesk', 'Space Grotesk'],
  ['Outfit', 'Outfit'], ['Big Shoulders Display', 'Inter'], ['Young Serif', 'Plus Jakarta Sans'], ['Italiana', 'Raleway'], ['Dela Gothic One', 'Manrope'],
  ['Cormorant Garamond', 'Montserrat'], ['Archivo', 'Archivo'], ['Sora', 'Lexend'], ['Oswald', 'Lora'], ['EB Garamond', 'Inter Tight'], ['Abril Fatface', 'Poppins'], ['Bricolage Grotesque', 'Nunito']
];
