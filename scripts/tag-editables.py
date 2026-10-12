"""
Tags every editable text in public/index.html with a stable key (data-e="group.n")
and every external link with data-l="link.n", so the /admin editor can change them.
Idempotent: existing keys are kept; new elements get the next free number.
    python3 scripts/tag-editables.py
"""
import re, sys
from html.parser import HTMLParser

PATH = sys.argv[1] if len(sys.argv) > 1 else 'public/index.html'
src = open(PATH, encoding='utf-8').read()

TEXT_TAGS = {'h1','h2','h3','h4','p','li','blockquote','figcaption','b','small','span','a','button','cite','strong','em','label'}
INLINE_OK = {'em','i','b','strong','br','span','small','cite','sup','sub'}
VOID = {'br','img','input','meta','link','source','hr','wbr','area','base','col','embed','param','track'}
SKIP_IDS = {'drawer','lightbox','year','craftedBy','stageYear'}
SKIP_CLASSES = {'sr-only','sy-ghost','splash','stamp'}
GROUP_CLASSES = ['ribbon','numbers','footer','splash','tabbar','topbar']

line_starts = [0]
for m in re.finditer('\n', src): line_starts.append(m.end())
def off(pos): return line_starts[pos[0]-1] + pos[1]

class Node:
    def __init__(self, tag, attrs, start, parent):
        self.tag, self.attrs, self.start, self.parent = tag, dict(attrs), start, parent
        self.children, self.runs, self.tag_end = [], [], src.index('>', start) + 1
        cls = set((self.attrs.get('class') or '').split())
        self.skip = (parent is not None and parent.skip) or tag in ('script','style','svg','select','option','textarea','form') \
            or self.attrs.get('id') in SKIP_IDS or bool(cls & SKIP_CLASSES) or 'data-cfg-text' in self.attrs \
            or 'data-slot' in self.attrs or 'data-slot-caption' in self.attrs or 'data-count' in self.attrs and False
        g = None
        if self.attrs.get('id') and tag in ('section','header','nav','div','footer'): g = self.attrs['id']
        for c in GROUP_CLASSES:
            if c in cls or tag == c: g = c
        self.group = g or (parent.group if parent else 'site')
    def add_text(self, a, b, raw):
        if self.runs and self.runs[-1][1] == a: self.runs[-1] = (self.runs[-1][0], b, self.runs[-1][2] + raw)
        else: self.runs.append((a, b, raw))

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node('#root', [], 0, None); self.root.tag_end = 0; self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, off(self.getpos()), self.stack[-1]); self.stack[-1].children.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        n = Node(tag, attrs, off(self.getpos()), self.stack[-1]); self.stack[-1].children.append(n)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag: del self.stack[i:]; break
    def _t(self, raw):
        a = off(self.getpos()); self.stack[-1].add_text(a, a + len(raw), raw)
    def handle_data(self, d): self._t(d)
    def handle_entityref(self, n): self._t('&%s;' % n)
    def handle_charref(self, n): self._t('&#%s;' % n)

p = P(); p.feed(src)

def has_text(n): return any(r[2].strip() for r in n.runs)
def inline_ok(n):
    if n.skip or n.tag not in INLINE_OK: return False
    return all(inline_ok(c) for c in n.children)

edits = []   # (offset, kind, payload)
used = {}
for m in re.finditer(r'data-e="([\w-]+)\.(\d+)"', src): used[m.group(1)] = max(used.get(m.group(1), 0), int(m.group(2)))
cands = []   # (offset, group, insert-kind, node/run)

def walk(n):
    if n.skip: return
    if 'data-e' in n.attrs: return
    if n.tag in TEXT_TAGS and has_text(n):
        if all(inline_ok(c) for c in n.children):
            cands.append((n.start, n.group, 'attr', n)); return
        for r in n.runs:
            if r[2].strip(): cands.append((r[0], n.group, 'wrap', r))
    for c in n.children: walk(c)
walk(p.root)

def link_walk(n):
    if n.tag == 'a' and not n.skip and re.match(r'https?://', n.attrs.get('href') or '') and 'data-cfg-href' not in n.attrs and 'data-l' not in n.attrs:
        cands.append((n.start, 'link', 'link', n))
    for c in n.children: link_walk(c)
link_walk(p.root)

cands.sort(key=lambda c: c[0])
for o, g, kind, x in cands:
    used[g] = used.get(g, 0) + 1
    key = '%s.%d' % (g, used[g])
    if kind == 'attr': edits.append((x.tag_end - 1, 'ins', ' data-e="%s"' % key))
    elif kind == 'link': edits.append((x.tag_end - 1, 'ins', ' data-l="%s"' % key))
    else:
        a, b, raw = x; lead = len(raw) - len(raw.lstrip()); trail = len(raw) - len(raw.rstrip())
        edits.append((a + lead, 'ins', '<span data-e="%s">' % key)); edits.append((b - trail, 'ins', '</span>'))
out = src
for o, _, s in sorted(edits, key=lambda e: e[0], reverse=True): out = out[:o] + s + out[o:]
open(PATH, 'w', encoding='utf-8').write(out)
print('tagged', sum(1 for c in cands if c[2] != 'link'), 'texts and', sum(1 for c in cands if c[2] == 'link'), 'links')
