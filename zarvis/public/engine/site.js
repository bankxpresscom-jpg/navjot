/* =============================================================================
   Zarvis site runtime v2. Reads #site-data and brings the page to life:
   splash, smooth scroll, menu, tab bar, reveals, hero text effects, counters,
   scroll-lit statements, marquees, hover-image lists, spotlight, magnetic
   buttons, parallax, horizontal pinning, sliders, lightbox, video, forms,
   cursor, cookie consent, analytics and chat. Optional libraries (GSAP,
   ScrollTrigger, Lenis) are used when present; everything works without them.
   ========================================================================== */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function init() {
window.__zr = true;
const html = document.documentElement;
let SITE = {};
try { SITE = JSON.parse($('#site-data').textContent); } catch (e) { SITE = {}; }
const F = SITE.f || {}, M = SITE.motion || {};
const ZP = window.__ZP || null;                       // studio preview
let postT = 0;
const mq = q => window.matchMedia(q);
const reduced = mq('(prefers-reduced-motion: reduce)').matches;
const fine = mq('(hover: hover) and (pointer: fine)').matches;
const level = reduced ? 'none' : (M.level || 'standard');
const moving = level !== 'none';
const gsap = window.gsap, ST = window.ScrollTrigger;
const G = !!(gsap && ST) && (level === 'standard' || level === 'cinematic');
if (G) gsap.registerPlugin(ST);
if (!moving) html.classList.remove('anim');
$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- splash ---------- */
const splash = $('.splash');
const splashOn = splash && !html.classList.contains('no-splash') && !ZP;
try { sessionStorage.setItem('z-splash', '1'); } catch (e) { /* blocked */ }
if (splashOn) {
  const c = $('[data-sp-count]', splash);
  if (c) { const t0 = performance.now(); const tick = t => { const p = Math.min(1, (t - t0) / 1050); c.textContent = Math.round(p * p * (3 - 2 * p) * 100); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  setTimeout(() => splash.remove(), 2200);
} else if (splash) splash.remove();
const heroDelay = splashOn ? 1250 : 80;

/* ---------- smooth scroll ---------- */
let lenis = null;
if (F.smooth && moving && window.Lenis && !ZP) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  if (G) { lenis.on('scroll', ST.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
const lock = on => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
function goTo(t) {
  if (!t) return;
  if (lenis) lenis.scrollTo(t, { duration: 1.2, offset: t.id === 'home' ? 0 : -10 });
  else t.scrollIntoView({ behavior: moving ? 'smooth' : 'auto' });
  setTimeout(() => { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }, 900);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href').slice(1); if (!id) return;
  const t = document.getElementById(id); if (!t) return;
  e.preventDefault();
  if (Menu.open) { Menu.close(false); setTimeout(() => goTo(t), 450); } else goTo(t);
  try { history.replaceState(null, '', id === 'home' ? location.pathname : '#' + id); } catch (err) { /* sandboxed */ }
});

/* ---------- focus trap ---------- */
const FOC = 'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])';
function trap(e, nodes) {
  if (e.key !== 'Tab') return;
  const f = nodes.flatMap(n => (n.matches(FOC) ? [n] : $$(FOC, n))).filter(el => el.offsetParent !== null || el === document.activeElement);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------- menu ---------- */
const Menu = { open: false, close() {} };
{
  const el = $('#menu'), btn = $('.burger');
  if (el && btn) {
    const media = $('.menu-media', el);
    const links = $$('.menu-nav a', el);
    links.forEach((a, i) => a.style.setProperty('--mi', i));
    let built = false;
    const show = src => { if (!media) return; $$('img', media).forEach(i => i.classList.toggle('on', i.dataset.src === src)); };
    const build = () => {
      if (built || !media || getComputedStyle(media).display === 'none') return; built = true;
      [...new Set(links.map(a => a.dataset.img).filter(Boolean))].forEach(src => { const im = new Image(); im.src = src; im.alt = ''; im.dataset.src = src; im.decoding = 'async'; im.onerror = () => im.remove(); media.appendChild(im); });
    };
    Menu.openMenu = () => {
      build();
      Menu.open = true; html.classList.add('menu-open'); el.classList.add('is-open'); $('#top').classList.remove('is-hidden');
      btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu'); lock(true);
      const cur = links.find(a => a.dataset.img) || links[0]; if (cur) show(cur.dataset.img);
      setTimeout(() => links[0] && links[0].focus({ preventScroll: true }), moving ? 450 : 0);
    };
    Menu.close = (restore = true) => {
      Menu.open = false; html.classList.remove('menu-open'); el.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); lock(false);
      if (restore) btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', () => (Menu.open ? Menu.close() : Menu.openMenu()));
    el.addEventListener('keydown', e => trap(e, [btn, el]));
    btn.addEventListener('keydown', e => { if (Menu.open) trap(e, [btn, el]); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && Menu.open) Menu.close(); });
    el.addEventListener('click', e => { if (e.target === el || e.target.classList.contains('menu-in')) Menu.close(); });
    links.forEach(a => { const f = () => a.dataset.img && show(a.dataset.img); a.addEventListener('pointerenter', f); a.addEventListener('focus', f); });
  }
}

/* ---------- header, progress, to-top, tab bar ---------- */
{
  const top = $('#top'), bar = $('.progress span'), toTop = $('.to-top'), ann = $('.ann');
  if (ann) html.style.setProperty('--ann-h', ann.offsetHeight + 'px');
  let lastY = scrollY, ticking = false, docH = 1;
  const measure = () => { docH = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  measure(); addEventListener('resize', measure, { passive: true }); new ResizeObserver(measure).observe(document.body);
  const update = () => {
    const y = scrollY;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, y / docH)})`;
    if (top && !Menu.open) { top.classList.toggle('is-hidden', y > lastY + 2 && y > 240); if (y < lastY - 2 || y < 240) top.classList.remove('is-hidden'); top.classList.toggle('is-solid', y > 40); }
    if (toTop) toTop.classList.toggle('is-on', y > innerHeight * 1.2);
    lastY = y; ticking = false;
    if (ZP) postY(y);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
  if (toTop) toTop.addEventListener('click', () => goTo($('#home') || document.body));
  const tabbar = $('#tabbar');
  if (tabbar) {
    const tabs = $$('[data-tab]', tabbar), keys = tabs.map(t => t.dataset.tab);
    const set = k => { const i = keys.indexOf(k); tabbar.classList.toggle('no-active', i < 0); tabs.forEach((t, j) => t.setAttribute('aria-current', String(j === i))); if (i >= 0) tabbar.style.setProperty('--ti', i); };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(e.target.dataset.section); }), { rootMargin: '-45% 0px -54% 0px' });
    $$('[data-section]').forEach(s => io.observe(s)); set('home');
  }
}

/* ---------- text splitting ---------- */
function splitWords(el, chars = false) {
  let wi = 0, ci = 0;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const i = document.createElement('span'); i.className = 'wi'; i.style.setProperty('--wi', wi++);
        if (chars) [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--ci', ci++); i.appendChild(c); });
        else i.textContent = part;
        w.appendChild(i); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
  });
  walk(el);
  return el;
}

/* ---------- hero headline effects ---------- */
{
  const h = $('h1[data-hero]');
  if (h) {
    const kind = h.dataset.hero;
    const run = () => {
      if (!moving) { h.classList.add('go'); return; }
      if (kind === 'typewriter' || kind === 'scramble' || kind === 'glitch') {
        const parts = $$('.hl', h).map(p => ({ el: p, text: p.textContent }));
        h.setAttribute('aria-label', parts.map(p => p.text).join(' '));
        parts.forEach(p => { p.el.setAttribute('aria-hidden', 'true'); p.el.textContent = kind !== 'typewriter' ? p.text.replace(/\S/g, ' ') : ''; });
        h.classList.add('go');
        if (kind === 'typewriter') {
          const caret = document.createElement('span'); caret.className = 'tw-caret';
          let k = 0;
          const next = () => {
            if (k >= parts.length) { setTimeout(() => caret.remove(), 2400); return; }
            const p = parts[k]; p.el.appendChild(caret); let i = 0;
            const t = setInterval(() => { i++; p.el.textContent = p.text.slice(0, i); p.el.appendChild(caret); if (i >= p.text.length) { clearInterval(t); k++; setTimeout(next, 180); } }, 45);
          };
          next();
        } else {
          const glyphs = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          parts.forEach((p, k) => {
            const L = p.text.length, start = performance.now() + k * 260, dur = 900 + L * 22;
            const frame = t => {
              const pr = Math.max(0, Math.min(1, (t - start) / dur));
              let out = '';
              for (let i = 0; i < L; i++) { const ch = p.text[i]; out += ch === ' ' || i / L < pr ? ch : glyphs[(Math.random() * glyphs.length) | 0]; }
              p.el.textContent = out;
              if (pr < 1) requestAnimationFrame(frame); else { p.el.textContent = p.text; if (kind === 'glitch') { p.el.dataset.text = p.text; h.classList.add('glitching'); } }
            };
            requestAnimationFrame(frame);
          });
        }
      } else {
        splitWords(h, kind === 'wave');
        requestAnimationFrame(() => h.classList.add('go'));
      }
    };
    setTimeout(run, heroDelay);
  }
}

/* ---------- reveals ---------- */
const heads = $$('[data-a="head"]'), words = $$('[data-words]');
heads.forEach(el => splitWords(el));
words.forEach(el => splitWords(el));
$$('[data-a="stagger"]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--si', Math.min(i, 8))));
{
  const els = $$('[data-a]');
  if (!moving || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); e.target.classList.add('in');
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    // clipped elements never intersect, so watch their parent instead
    const groups = new Map();
    const pio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      pio.unobserve(e.target); (groups.get(e.target) || []).forEach(x => x.classList.add('in'));
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    els.forEach(el => {
      const p = el.parentElement;
      if ((el.dataset.a === 'img' || el.dataset.a === 'head') && p) { if (!groups.has(p)) { groups.set(p, []); pio.observe(p); } groups.get(p).push(el); }
      else io.observe(el);
    });
  }
}

/* ---------- scroll-lit statements ---------- */
if (words.length && moving) {
  let tick = false;
  const light = () => {
    tick = false;
    words.forEach(el => {
      const r = el.getBoundingClientRect(); const ws = el.__w || (el.__w = $$('.wi', el));
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * ws.length); ws.forEach((w, i) => w.classList.toggle('lit', i < n));
    });
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(light); } }, { passive: true }); light();
} else words.forEach(el => $$('.wi', el).forEach(w => w.classList.add('lit')));

/* ---------- counters ---------- */
{
  const run = el => {
    const end = parseFloat(el.dataset.count); if (!isFinite(end)) return;
    const dec = (String(el.dataset.count).split('.')[1] || '').length;
    if (!moving) { el.textContent = el.dataset.count; return; }
    const t0 = performance.now(), dur = 1800;
    const f = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = (end * e).toFixed(dec); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } }), { threshold: 0.3 });
  $$('[data-count]').forEach(el => { if (moving) el.textContent = '0'; io.observe(el); });
}

/* ---------- rotating words ---------- */
setTimeout(() => {
  $$('.rot').forEach(wrap => {
    const items = $$('span', wrap); if (items.length < 2 || !moving) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const prev = items[i]; prev.classList.remove('is-on'); prev.classList.add('is-out'); setTimeout(() => prev.classList.remove('is-out'), 900);
      i = (i + 1) % items.length; items[i].classList.add('is-on');
    }, 2600);
  });
}, heroDelay + 1400);

/* ---------- marquees ---------- */
$$('[data-mq]').forEach(m => {
  const track = $('.mq-track', m), set = $('.mq-set', m); if (!track || !set) return;
  if (!moving) { m.style.overflowX = 'auto'; return; }
  const base = set.innerHTML; let g = 0;
  while (set.scrollWidth < innerWidth * 1.2 && g++ < 8) set.insertAdjacentHTML('beforeend', base);
  const clone = set.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); $$('a,button', clone).forEach(b => { b.tabIndex = -1; });
  track.appendChild(clone);
  track.style.setProperty('--mq-dur', Math.max(18, set.scrollWidth / (m.classList.contains('mq-giant') ? 110 : 70)) + 's');
});

/* ---------- marquees lean with scroll speed (kinetic styles) ---------- */
if (M.skew && moving && !reduced) {
  const tracks = $$('[data-mq]'); let last = scrollY, sk = 0;
  const tick = () => { const v = scrollY - last; last = scrollY; sk += (Math.max(-12, Math.min(12, v * 0.35)) - sk) * 0.12; tracks.forEach(t => { t.style.transform = `skewX(${(-sk).toFixed(2)}deg)`; }); requestAnimationFrame(tick); };
  if (tracks.length) requestAnimationFrame(tick);
}

/* ---------- videos (lazy, in view only) ---------- */
{
  const vids = $$('video[data-auto]');
  if (vids.length && !(navigator.connection && navigator.connection.saveData)) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }), { threshold: 0.15 });
    const go = () => vids.forEach(v => io.observe(v));
    if (document.readyState === 'complete') setTimeout(go, 200); else addEventListener('load', () => setTimeout(go, 200), { once: true });
  }
}

/* ---------- hover image lists ---------- */
if (fine && moving) {
  $$('[data-hover-list]').forEach(list => {
    const rows = $$('[data-img]', list); if (!rows.length) return;
    const box = document.createElement('div'); box.className = 'hover-img'; box.setAttribute('aria-hidden', 'true');
    const img = new Image(); img.alt = ''; box.appendChild(img); document.body.appendChild(box);
    let x = 0, y = 0, cx = 0, cy = 0, on = false, raf = 0;
    const loop = () => { cx += (x - cx) * 0.16; cy += (y - cy) * 0.16; box.style.left = cx + 'px'; box.style.top = cy + 'px'; if (on || Math.abs(x - cx) > 0.5) raf = requestAnimationFrame(loop); else raf = 0; };
    list.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    rows.forEach(r => {
      r.addEventListener('pointerenter', e => { img.src = r.dataset.img; on = true; if (!cx) { cx = e.clientX; cy = e.clientY; } box.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('pointerleave', () => { on = false; box.classList.remove('on'); });
    });
  });
}

/* ---------- spotlight cards ---------- */
if (fine && document.body.classList.contains('spot')) {
  document.addEventListener('pointermove', e => { const c = e.target.closest && e.target.closest('[data-spot]'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });
}

/* ---------- magnetic buttons ---------- */
if (fine && moving && M.magnetic !== false) {
  $$('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); b.style.transform = `translate(${dx * 0.22}px,${dy * 0.3}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- hero collage depth ---------- */
{
  const cl = $$('.collage [data-depth]');
  if (cl.length && fine && moving) {
    addEventListener('pointermove', e => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; cl.forEach(c => { const d = parseFloat(c.dataset.depth); c.style.translate = `${-nx * 40 * d}px ${-ny * 40 * d}px`; }); }, { passive: true });
  }
}

/* ---------- scroll-linked motion (GSAP) ---------- */
if (G) {
  const cine = level === 'cinematic';
  const hero = $('.hero');
  if (hero) {
    const hi = $('.hero-in, .hero-c, .hero-type, .hero-copy', hero);
    if (hi) gsap.to(hi, { yPercent: cine ? -14 : -6, opacity: cine ? 0.3 : 0.7, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    const bg = $('.hero-bg img, .hero-bg video, .hero-bg .art', hero);
    if (bg) gsap.fromTo(bg, { scale: 1.08, yPercent: 0 }, { scale: 1.2, yPercent: cine ? 10 : 4, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
  const frame = $('[data-tilt] figure.m');
  if (frame) gsap.fromTo(frame, { rotateX: 22, scale: 0.92 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 30%', scrub: true } });
  if (cine) $$('[data-parallax]').forEach(el => { if (el.closest('.hero')) return; gsap.fromTo(el, { yPercent: -7, scale: 1.14 }, { yPercent: 7, scale: 1.14, ease: 'none', scrollTrigger: { trigger: el.closest('figure') || el, start: 'top bottom', end: 'bottom top', scrub: true } }); });
  // stacking cards shrink as the next one covers them
  $$('[data-stack]').forEach((c, i, all) => { if (i === all.length - 1) return; gsap.to(c, { scale: 0.94, opacity: 0.6, ease: 'none', scrollTrigger: { trigger: all[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } }); });
  // horizontal pinned galleries (desktop)
  gsap.matchMedia().add('(min-width: 901px)', () => {
    const made = [];
    $$('[data-hscroll]').forEach(hs => {
      const track = $('.hs-track', hs); if (!track) return;
      hs.classList.add('is-pinned');
      const dist = () => Math.max(0, track.scrollWidth - hs.clientWidth + 40);
      if (dist() < 60) { hs.classList.remove('is-pinned'); return; }
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: hs, start: 'center center', end: () => '+=' + dist(), pin: hs.closest('section') || hs, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
      made.push(() => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(track, { clearProps: 'transform' }); hs.classList.remove('is-pinned'); });
    });
    return () => made.forEach(f => f());
  });
  const refresh = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ST.refresh(), 250); }; })();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  let lastH = 0; new ResizeObserver(() => { const h = document.body.scrollHeight; if (Math.abs(h - lastH) > 2) { lastH = h; refresh(); } }).observe(document.body);
}

/* ---------- testimonial sliders ---------- */
$$('[data-slider]').forEach(sl => {
  const slides = $$('.sl', sl), dots = $$('.sl-dots i', sl); if (slides.length < 2) return;
  let i = 0, timer = 0;
  const go = n => { slides[i].classList.remove('is-on'); dots[i] && dots[i].classList.remove('is-on'); i = (n + slides.length) % slides.length; slides[i].classList.add('is-on'); dots[i] && dots[i].classList.add('is-on'); };
  const auto = () => { clearInterval(timer); if (moving) timer = setInterval(() => { if (!document.hidden) go(i + 1); }, 6500); };
  $('[data-prev]', sl).addEventListener('click', () => { go(i - 1); auto(); });
  $('[data-next]', sl).addEventListener('click', () => { go(i + 1); auto(); });
  sl.addEventListener('pointerenter', () => clearInterval(timer)); sl.addEventListener('pointerleave', auto);
  let sx = null; sl.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  sl.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); auto(); } sx = null; });
  auto();
});

/* ---------- lightbox ---------- */
{
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb); let list = [], at = 0, opener = null;
    const show = n => { at = (n + list.length) % list.length; img.src = list[at]; };
    const open = (l, n, from) => { list = l; opener = from; show(n); lb.classList.add('is-open'); lock(true); setTimeout(() => $('.lb-x', lb).focus(), 60); };
    const close = () => { lb.classList.remove('is-open'); lock(false); if (opener) opener.focus({ preventScroll: true }); };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-lb]'); if (!b || b.disabled) return;
      const sec = b.closest('section'); let l = [];
      try { l = JSON.parse($('.lb-data', sec).textContent); } catch (err) { return; }
      if (l.length) open(l, +b.dataset.lb % l.length, b);
    });
    $('.lb-x', lb).addEventListener('click', close);
    $('.lb-p', lb).addEventListener('click', () => show(at - 1));
    $('.lb-n', lb).addEventListener('click', () => show(at + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); trap(e, [lb]); });
  }
}

/* ---------- video players ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-video]'); if (!b) return;
  const box = b.closest('.vid'); const src = b.dataset.video;
  let el;
  if (b.dataset.kind === 'embed') { el = document.createElement('iframe'); el.src = src; el.allow = 'autoplay; fullscreen; picture-in-picture'; el.allowFullscreen = true; el.title = 'Video'; }
  else { el = document.createElement('video'); el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true; }
  box.appendChild(el); b.remove();
});

/* ---------- forms ---------- */
$$('form[data-form]').forEach(form => {
  const note = $('.form-note', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = ['name', 'email', 'message'].find(k => !String(d[k] || '').trim() || (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d[k])));
    if (bad) { note.textContent = bad === 'email' ? 'Please enter a valid email address.' : 'Please fill in every field.'; form.elements[bad].focus(); return; }
    const text = `Hello! I'm ${d.name} (${d.email}).\n\n${d.message}`;
    if (F.formEndpoint) {
      note.textContent = 'Sending…';
      try { const r = await fetch(F.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); form.reset(); note.textContent = 'Thank you! Your message has been sent.'; }
      catch (err) { note.textContent = 'Sorry, that did not send. Please email us directly.'; }
      return;
    }
    const a = document.createElement('a');
    if (SITE.wa) { a.href = `https://wa.me/${SITE.wa}?text=${encodeURIComponent(text)}`; a.target = '_blank'; a.rel = 'noopener'; }
    else if (SITE.email) a.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Message from ' + d.name)}&body=${encodeURIComponent(text)}`;
    else { note.textContent = 'No contact channel is set up yet.'; return; }
    document.body.appendChild(a); a.click(); a.remove();
    note.textContent = SITE.wa ? 'WhatsApp opened with your message. Press send there.' : 'Your email app opened with the message.';
  });
});
$$('form[data-nl]').forEach(form => form.addEventListener('submit', e => {
  e.preventDefault(); const em = form.querySelector('input').value.trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { form.querySelector('input').focus(); return; }
  if (SITE.email) { const a = document.createElement('a'); a.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Newsletter sign-up')}&body=${encodeURIComponent('Please add ' + em + ' to the newsletter.')}`; document.body.appendChild(a); a.click(); a.remove(); }
  form.innerHTML = '<p>Thank you! You are on the list.</p>';
}));

/* ---------- share ---------- */
if (F.share) {
  const host = $('.foot-top');
  if (host) {
    const box = document.createElement('div'); box.className = 'share';
    const u = location.href.split('#')[0], t = document.title;
    const add = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', fn); box.appendChild(b); };
    if (navigator.share) add('Share', () => navigator.share({ title: t, url: u }).catch(() => {}));
    add('WhatsApp', () => { const a = document.createElement('a'); a.href = `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); });
    add('Copy link', e => { (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { e.target.textContent = 'Copied!'; }).catch(() => { e.target.textContent = u; }); });
    host.appendChild(box);
  }
}

/* ---------- cursor ---------- */
if (SITE.cursor && SITE.cursor !== 'none' && fine && moving) {
  const cur = $('.cursor');
  if (cur) {
    html.classList.add('has-cursor');
    const dot = $('span', cur);
    let x = -100, y = -100, cx = -100, cy = -100;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('a,button,[data-cursor],summary,label,input,textarea');
      cur.classList.toggle('is-hover', !!t);
      const lab = t && t.closest('[data-cursor]');
      cur.classList.toggle('is-label', !!lab); dot.textContent = lab ? lab.dataset.cursor : '';
    });
    document.addEventListener('pointerleave', () => { cur.style.opacity = 0; }); document.addEventListener('pointerenter', () => { cur.style.opacity = 1; });
  }
}

/* ---------- analytics, consent, chat (late, for speed) ---------- */
const loadScript = (src, attrs = {}) => { const s = document.createElement('script'); s.src = src; s.async = true; Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v)); document.head.appendChild(s); };
const startAnalytics = () => {
  if (F.ga4) { window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', F.ga4); loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(F.ga4)}`); }
  if (F.plausible) loadScript('https://plausible.io/js/script.js', { 'data-domain': F.plausible, defer: '' });
};
const late = fn => { if (document.readyState === 'complete') setTimeout(fn, 1500); else addEventListener('load', () => setTimeout(fn, 1500), { once: true }); };
if (!ZP && (F.ga4 || F.plausible)) {
  const box = $('.cookie');
  let c = null; try { c = localStorage.getItem('z-consent'); } catch (e) { /* blocked */ }
  if (F.cookie && box) {
    if (c === 'yes') late(startAnalytics);
    else if (c !== 'no') {
      box.hidden = false;
      $$('[data-cookie]', box).forEach(b => b.addEventListener('click', () => { const yes = b.dataset.cookie === 'yes'; try { localStorage.setItem('z-consent', yes ? 'yes' : 'no'); } catch (e) { /* blocked */ } box.hidden = true; if (yes) startAnalytics(); }));
    }
  } else late(startAnalytics);
}
if (!ZP && F.chat) late(() => {
  if (F.chat.p === 'tawk') { window.Tawk_API = window.Tawk_API || {}; loadScript(`https://embed.tawk.to/${F.chat.id.replace(/[^\w/]/g, '')}`, { crossorigin: '*' }); }
  if (F.chat.p === 'crisp') { window.$crisp = []; window.CRISP_WEBSITE_ID = F.chat.id; loadScript('https://client.crisp.chat/l.js'); }
});

/* ---------- studio preview bridge ---------- */
function postY(y) { clearTimeout(postT); postT = setTimeout(() => { try { parent.postMessage({ zarvis: 'scroll', y }, '*'); } catch (e) { /* ignore */ } }, 120); }
if (ZP) {
  if (ZP.y) { html.style.scrollBehavior = 'auto'; scrollTo(0, ZP.y); }
  const chip = document.createElement('button'); chip.type = 'button'; chip.textContent = '✎ Edit';
  chip.style.cssText = 'position:fixed;z-index:999;display:none;padding:6px 12px;border-radius:999px;border:0;background:#C6FF3D;color:#0B0C10;font:600 12px/1 system-ui;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35)';
  document.body.appendChild(chip);
  let cur = null, hov = null, ht = 0;
  const place = b => {
    cur = b; const r = b.getBoundingClientRect(); chip.style.display = 'block'; chip.style.left = '12px'; chip.style.top = Math.max(70, Math.min(innerHeight - 50, r.top + 12)) + 'px';
    $$('[data-zp-hl]').forEach(x => { x.style.outline = ''; x.removeAttribute('data-zp-hl'); });
    b.style.outline = '2px dashed rgba(198,255,61,.8)'; b.style.outlineOffset = '-6px'; b.setAttribute('data-zp-hl', '');
  };
  document.addEventListener('pointerover', e => {
    if (e.target === chip) { clearTimeout(ht); return; }
    const b = e.target.closest && e.target.closest('[data-block]'); if (!b || b === hov) return; hov = b;
    clearTimeout(ht); ht = setTimeout(() => place(b), cur ? 180 : 0);   // settle before moving, so the chip can be reached
  });
  document.addEventListener('dblclick', e => { const b = e.target.closest && e.target.closest('[data-block]'); if (b) parent.postMessage({ zarvis: 'select', id: b.dataset.block }, '*'); });
  chip.addEventListener('click', () => { if (cur) parent.postMessage({ zarvis: 'select', id: cur.dataset.block }, '*'); });
  addEventListener('message', e => {
    const m = e.data || {};
    if (m.zarvis === 'scrollTo') { const t = $(`[data-block="${CSS.escape(m.id)}"]`); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
}
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
