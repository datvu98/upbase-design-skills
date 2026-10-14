// ─────────────────────────────────────────────────────────────────────────────
// Reuse audit — the two halves of one problem.
//
//   A. handBuilt   — raw frames drawing something the library already ships.
//   B. tooWeak     — library components below the standard, which is *why*
//                    people hand-build instead of instancing them.
//
// Reporting them apart is what makes the result actionable: A alone says
// "someone was lazy", which is usually wrong. The Badge case on the Chat page
// was B — the hand-built pill was better than `Badge / Basic`, so swapping it in
// would have been a downgrade. Fix B first, then A.
//
// Paste into figma_execute. Read-only. Set PAGE_MATCH to narrow.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_MATCH = null;   // e.g. /chat/i — leave null for the whole file

// Layout scaffolding, never a missed reuse. Keeps the signal readable.
const SCAFFOLD = /^(content|wrapper|body|row|column|container|frame|group|holder|inner|outer|stack|slot|spacer|mask|bg|background|layout|header|footer|main|left|right|top|bottom|item|list|grid|section|_.*)$/i;

// Names that don't match a component name but mean one. This is where the
// vocabularies collide — Ant web, Ant Design Mobile, SAP Fiori, and whatever a
// designer typed. Add to it whenever a new synonym costs someone an hour.
const SYNONYMS = {
  chip: 'Tag / Checkable · Segmented',
  pill: 'Tag · Badge / Basic',
  search: 'Input / Input Item / Outlined (Icon Left), not Input / Search',
  searchbar: 'Input / Input Item / Outlined',
  count: 'Badge / Basic',
  unread: 'Badge / Basic',
  dot: 'Badge / Basic (Type=Dot)',
  toast: 'Message',
  spinner: 'Spin',
  loader: 'Spin',
  stepper: 'InputNumber',
  accordion: 'Collapse',
  combobox: 'Select',
  picker: 'Select',
  fab: 'FloatButton',
  snackbar: 'Message',
  banner: 'Alert',
  noticebar: 'Alert',
  emptystate: 'Empty · Result',
  breadcrumbs: 'Breadcrumb',
  thumbnail: 'Avatar · Image',
  chiplist: 'Segmented',
  toggle: 'Switch',
  slider: 'Slider',
  progressbar: 'Progress',
};

// Head nouns too generic to mean a component on their own. Without these,
// `Message Text` reads as the `Message` component and `Sender Name` as a name
// field, and the real findings drown.
const HEAD_STOP = /^(text|label|title|name|value|icon|state|status|view|panel|box|area|field|line|dot|bar|image|caption|time|date|count|number)$/;

// Interactive concepts that should carry a State axis. Deliberately narrow:
// an earlier version included `item|row|cell` and flagged 56 components,
// most of them separators, group titles and placeholders that have no states.
// A check nobody can trust gets ignored, which is worse than not having it.
const INTERACTIVE = /\b(button|input|select|checkbox|radio|switch|tab|link|option)\b/i;
const NOT_INTERACTIVE = /separator|divider|title|placeholder|group|caption|label|arrow|icon|logo|mask|track|rail|bar$/i;

// Required of anything interactive. `Focused` is on the list because it is a
// keyboard-accessibility requirement, and it is the one most often dropped.
const REQUIRED_STATES = ['Default', 'Hover', 'Focused', 'Disabled'];

// `Pressed` is required only of things you actually press. Demanding it
// everywhere flagged 36 sets, most of them wrongly: a `Checkbox` has no distinct
// pressed state and an `Input` uses `Typing`/`Filled` instead. A check that cries
// wolf gets ignored, which is worse than not having it.
const PRESSABLE = /\b(button|link|option|tab)\b/i;

// Everything a component may legitimately add on top. Anything outside this list
// is either a typo that shipped (`Focused (Filled))` did) or a new concept that
// should be raised rather than coined on the page.
const KNOWN_STATES = [
  ...REQUIRED_STATES,
  'Typing', 'Filled',      // text entry
  'Loading',               // asynchronous
  'Selected', 'Active',    // selectable — Active is persistent, Pressed is transient
  'Current',               // navigation: you are here
  'Error',                 // validation
];

await figma.loadAllPagesAsync();

const skipPage = p => /^(cover|icons?|📋)/i.test(p.name.trim()) || p.name.trim().includes('- - - -');
const pages = figma.root.children.filter(p => !skipPage(p) && (!PAGE_MATCH || PAGE_MATCH.test(p.name)));

// ── build the lexicon from the component names that actually exist ───────────
const allSets = [];
for (const p of figma.root.children)
  for (const n of p.findAll(x => x.type === 'COMPONENT_SET'))
    allSets.push({ page: p.name.trim(), name: n.name, node: n });

const lexicon = new Map();          // token → component names offering it
for (const s of allSets) {
  if (s.name.startsWith('_')) continue;
  for (const part of s.name.split('/')) {
    const t = part.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (t.length < 3 || SCAFFOLD.test(t)) continue;
    if (!lexicon.has(t)) lexicon.set(t, new Set());
    lexicon.get(t).add(s.name);
  }
}

const insideInstance = n => {
  let p = n.parent;
  while (p) { if (p.type === 'INSTANCE') return true; p = p.parent; }
  return n.type === 'INSTANCE';
};

// ── A. hand-built elements ───────────────────────────────────────────────────
const handBuilt = [];
const seen = new Set();

for (const { page, name, node } of allSets) {
  if (PAGE_MATCH && !PAGE_MATCH.test(page)) continue;
  if (skipPage({ name: page })) continue;
  const own = new Set(name.toLowerCase().split('/').map(x => x.trim().replace(/[^a-z0-9]/g, '')));

  for (const n of node.findAll(x => ['FRAME', 'GROUP'].includes(x.type))) {
    if (insideInstance(n)) continue;
    const raw = n.name.trim();
    if (SCAFFOLD.test(raw)) continue;
    const key = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key || own.has(key)) continue;          // a part named after its own component

    // `Unread Badge` is invisible to a whole-string match but is obviously a
    // Badge; matching only the head noun instead flags every `Message Text`.
    // SYNONYMS is hand-curated, so every word can be probed against it safely.
    // The lexicon is generated from 353 names and is far noisier, so it only
    // gets the whole name and the head noun, and the head noun has a stoplist.
    const words = raw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const head = words[words.length - 1];

    let candidate = null;
    for (const w of [key, ...words]) if (SYNONYMS[w]) { candidate = SYNONYMS[w]; break; }
    if (!candidate && lexicon.has(key)) candidate = [...lexicon.get(key)].slice(0, 3).join(' · ');
    if (!candidate && head && head !== key && !HEAD_STOP.test(head) && lexicon.has(head))
      candidate = [...lexicon.get(head)].slice(0, 3).join(' · ');
    if (!candidate) continue;

    const id = `${name}::${raw}`;
    if (seen.has(id)) continue;
    seen.add(id);
    handBuilt.push({ page, set: name, node: raw,
      size: `${Math.round(n.width)}×${Math.round(n.height)}`,
      children: (n.children || []).length, useInstead: candidate });
  }
}

// ── B. library components too weak to reuse ──────────────────────────────────
const tooWeak = [];
const note = (set, issue, detail) => tooWeak.push({ set, issue, detail });

for (const { page, name, node } of allSets) {
  if (name.startsWith('_')) continue;
  const props = node.componentPropertyDefinitions || {};
  const axes = Object.entries(props).filter(([, d]) => d.type === 'VARIANT').map(([k]) => k.split('#')[0]);
  const hasText = Object.values(props).some(d => d.type === 'TEXT');

  if (!(node.descriptionMarkdown || node.description || '').trim())
    note(name, 'no description', 'ships undocumented; asset search matches descriptions');

  if (INTERACTIVE.test(name) && !NOT_INTERACTIVE.test(name)) {
    const stateAxis = Object.entries(props)
      .find(([k, d]) => d.type === 'VARIANT' && /^state$/i.test(k.split('#')[0]));
    if (!stateAxis) {
      note(name, 'no State axis', `axes: ${axes.join(', ') || 'none'}`);
    } else {
      const have = stateAxis[1].variantOptions || [];
      const need = PRESSABLE.test(name) ? [...REQUIRED_STATES, 'Pressed'] : REQUIRED_STATES;
      const missing = need.filter(s => !have.includes(s));
      if (missing.length)
        note(name, 'incomplete State axis', `missing ${missing.join(' · ')} — has ${have.join(' · ')}`);
      const unknown = have.filter(o => !KNOWN_STATES.includes(o));
      if (unknown.length)
        note(name, 'unrecognised State value', unknown.join(' · '));
    }
  }

  for (const v of node.children) {
    // a count/number pill with no min-width floor collapses on one digit and
    // clips on `99+` — references/verification.md calls this out and it is what made the
    // Chat page hand-build its own Unread Badge
    const t = v.findOne(x => x.type === 'TEXT' && /^\d{1,3}\+?$/.test(String(x.characters).trim()));
    if (t && v.layoutSizingHorizontal === 'HUG' && !v.minWidth) {
      note(name, 'count with no min-width', `${v.name} — one digit collapses, 99+ needs the floor`);
      break;
    }
  }

  // Only the ambiguous band. A radius at or above the height (9999, 999, 100)
  // is the deliberate "clamp to a pill" idiom and is correct — an earlier
  // version flagged all 13 of those and zero real defects. What is wrong is a
  // radius *between* half the height and the height: too round to be a corner,
  // too square to be a pill, and it drifts the moment the height changes.
  for (const v of node.children) {
    const r = v.topLeftRadius, h = v.height;
    if (typeof r === 'number' && h > 0 && r > h / 2 + 0.5 && r < h) {
      note(name, 'radius between half-height and height',
        `${v.name}: r=${r} h=${Math.round(h)} — pick ${Math.round(h / 2)} for a pill, or ≥${Math.round(h)} to clamp`);
      break;
    }
  }

  // binding another component's tier is a dependency nobody expects
  const foreign = new Set();
  for (const n of node.findAll(() => true)) {
    if (insideInstance(n)) continue;
    for (const [, val] of Object.entries(n.boundVariables || {})) {
      const arr = Array.isArray(val) ? val : [val];
      for (const a of arr) {
        if (!a || !a.id) continue;
        const v = await figma.variables.getVariableByIdAsync(a.id);
        if (!v || !v.name.startsWith('Components/')) continue;
        const owner = v.name.split('/')[1];
        if (!name.toLowerCase().includes(owner.toLowerCase())) foreign.add(v.name);
      }
    }
  }
  if (foreign.size) note(name, 'binds another component\'s tokens', [...foreign].slice(0, 3).join(' · '));
}

// text styles are library-wide; one bad binding reaches every component
const styleDefects = [];
for (const s of await figma.getLocalTextStylesAsync()) {
  for (const [k, ref] of Object.entries(s.boundVariables || {})) {
    const v = await figma.variables.getVariableByIdAsync(ref.id);
    if (v && v.name.startsWith('Components/'))
      styleDefects.push(`${s.name} [${k}] → ${v.name}`);
  }
}

const cap = (a, n) => { const t = a.length; const o = a.slice(0, n);
  if (t > n) o.push(`…and ${t - n} more`); return o; };

return {
  scanned: { pages: pages.length, componentSets: allSets.length, lexiconTerms: lexicon.size },
  A_handBuilt: { count: handBuilt.length, items: cap(handBuilt, 30) },
  B_tooWeak: { count: tooWeak.length, items: cap(tooWeak, 30) },
  textStyleDefects: styleDefects,
};
