/**
 * Zarvis design themes. Each theme is a complete art direction:
 * colour tokens, a font trio (display / label / body) and shape language.
 * The engine's CSS is written against these variables only.
 */
export const THEMES = {
  luxe: {
    name: 'Editorial Luxe',
    note: 'Ivory, aubergine and champagne gold. Serif elegance for authors, speakers and leaders.',
    c: { bg: '#F7F2EA', paper: '#FBF8F3', sand: '#EFE6D8', ink: '#15121A', ink2: '#1E1924', text: '#1B1720', muted: '#5B5260', textL: '#F4EEE6', mutedL: '#BFB5AB', accent: '#8A6830', accent2: '#D9BC84', onAccent: '#15121A' },
    fonts: { display: ['Cormorant Garamond', 'ital,wght@0,500;0,600;1,400;1,500'], label: ['Bebas Neue', ''], body: ['Jost', 'wght@300;400;500'] },
    t: { displayWeight: 500, labelTransform: 'uppercase', labelSpacing: '.16em', labelSize: '1.05rem', bodyWeight: 300, radius: '4px', arch: true, titleScale: 1 }
  },
  noir: {
    name: 'Noir Cinema',
    note: 'Black, bone and vermilion. High-contrast, cinematic and bold.',
    c: { bg: '#EDE8E0', paper: '#F5F2EC', sand: '#E2DBD0', ink: '#0B0B0C', ink2: '#151517', text: '#111112', muted: '#55524E', textL: '#EDE8E0', mutedL: '#A8A29A', accent: '#C2410C', accent2: '#FF7A45', onAccent: '#0B0B0C' },
    fonts: { display: ['Bodoni Moda', 'ital,opsz,wght@0,6..96,500;0,6..96,700;1,6..96,500'], label: ['Oswald', 'wght@400;500'], body: ['Inter', 'wght@300;400;500'] },
    t: { displayWeight: 600, labelTransform: 'uppercase', labelSpacing: '.18em', labelSize: '.86rem', bodyWeight: 300, radius: '0px', arch: false, titleScale: 1 }
  },
  swiss: {
    name: 'Swiss Precision',
    note: 'White, black and electric blue. Tight grotesk type and strict rhythm.',
    c: { bg: '#FAFAF7', paper: '#FFFFFF', sand: '#EFEFEA', ink: '#0A0A0A', ink2: '#161616', text: '#0A0A0A', muted: '#55555A', textL: '#F4F4F0', mutedL: '#A3A3A8', accent: '#1F3FE0', accent2: '#8FA2FF', onAccent: '#FFFFFF' },
    fonts: { display: ['Inter Tight', 'ital,wght@0,600;0,800;1,600'], label: ['JetBrains Mono', 'wght@400;500'], body: ['Inter', 'wght@300;400;500'] },
    t: { displayWeight: 800, labelTransform: 'uppercase', labelSpacing: '.08em', labelSize: '.8rem', bodyWeight: 400, radius: '0px', arch: false, titleScale: .92, tight: true }
  },
  terra: {
    name: 'Terracotta Warmth',
    note: 'Cream, forest green and terracotta. Warm, human and grounded.',
    c: { bg: '#F4EDE3', paper: '#FAF6EF', sand: '#EADFCF', ink: '#1F3A2E', ink2: '#264536', text: '#1F2A24', muted: '#5C645E', textL: '#F4EDE3', mutedL: '#C4CBBF', accent: '#B4531F', accent2: '#F0A77A', onAccent: '#1F3A2E' },
    fonts: { display: ['Fraunces', 'ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400'], label: ['DM Sans', 'wght@400;500;600'], body: ['DM Sans', 'wght@400;500;600'] },
    t: { displayWeight: 500, labelTransform: 'uppercase', labelSpacing: '.14em', labelSize: '.8rem', bodyWeight: 400, radius: '18px', arch: true, titleScale: 1 }
  },
  aurora: {
    name: 'Midnight Aurora',
    note: 'Deep midnight with mint and violet light. Futuristic but restrained.',
    c: { bg: '#EEF1F8', paper: '#F7F8FC', sand: '#E3E7F2', ink: '#0A0F1F', ink2: '#111829', text: '#0E1426', muted: '#4E5670', textL: '#E8ECF8', mutedL: '#9AA3BF', accent: '#4F46E5', accent2: '#7CF2C8', onAccent: '#0A0F1F' },
    fonts: { display: ['Syne', 'wght@600;700;800'], label: ['Space Grotesk', 'wght@500'], body: ['Manrope', 'wght@300;400;500'] },
    t: { displayWeight: 700, labelTransform: 'uppercase', labelSpacing: '.14em', labelSize: '.78rem', bodyWeight: 400, radius: '14px', arch: false, titleScale: .9, tight: true }
  },
  blush: {
    name: 'Blush Couture',
    note: 'Blush, plum and soft gold. Fashion-editorial femininity.',
    c: { bg: '#FBF3F0', paper: '#FFF9F7', sand: '#F4E4DF', ink: '#2A1B22', ink2: '#35232C', text: '#2A1B22', muted: '#6E5A62', textL: '#FBF3F0', mutedL: '#CDB6BD', accent: '#A4485E', accent2: '#E8B4A4', onAccent: '#2A1B22' },
    fonts: { display: ['Playfair Display', 'ital,wght@0,500;0,600;1,400;1,500'], label: ['Montserrat', 'wght@300;400;500;600'], body: ['Montserrat', 'wght@300;400;500;600'] },
    t: { displayWeight: 500, labelTransform: 'uppercase', labelSpacing: '.2em', labelSize: '.74rem', bodyWeight: 300, radius: '6px', arch: true, titleScale: 1 }
  }
};

export const HERO_LAYOUTS = {
  fullbleed: 'Full-bleed image with animated name',
  split: 'Split: text left, portrait right',
  centered: 'Centered statement over image'
};

export const MOTION_LEVELS = {
  subtle: 'Subtle: gentle fades only',
  standard: 'Standard: word reveals, image wipes, moving rows',
  cinematic: 'Cinematic: letter-by-letter hero, pinned rails, parallax'
};

/** Google Fonts CSS2 URL for a theme */
export function fontsUrl(theme) {
  const fam = [...new Map(Object.values(theme.fonts).map(([n, a]) => [n, a])).entries()]
    .map(([n, a]) => `family=${n.replace(/ /g, '+')}${a ? ':' + a : ''}`).join('&');
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}
