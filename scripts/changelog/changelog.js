// ─────────────────────────────────────────────────────────────────────────────
// Changelog builder for the three UpBase files. Paste into figma_execute (pass
// fileKey), then call addChangelogEntry() at the bottom.
//
//   UpBase Design System  BoGaG48v9BfY7LkMtFs4zh  page "_Changelog"
//   UpS UI Kit            9c052aEvpV7gYLhwdatf6g  page "_Changelog"
//   UpS Product 2026      9FAdrUvuA7q0VExwsAxNu6  page "Changelog"
//
//   return await addChangelogEntry({
//     date: '2026-10-13',                       // ISO; shown as "13 Oct 2026"
//     title: 'Form Actions bar, sticky footer rule',
//     author: 'Dat Vu · with Claude',
//     status: 'pending',                        // 'pending' | 'published' | null (product files)
//     sections: {                               // Added · Changed · Fixed · Deprecated · Removed
//       Added: [{ name: 'Form Actions', text: 'new component (slot + Pinned)', node: '481:43096' }],
//     },
//     related: [{ name: 'UpBase changelog', text: 'Button focus ring fix', url: CL_LINKS.upbase }],
//     saveVersion: true,                        // also saves a named version in File › Version history
//   });
//
// Re-running with the same date + title replaces that entry instead of duplicating it, so to
// add items later in a session, re-run with the full list (and saveVersion: false).
// setChangelogStatus('2026-10-13', 'Form Actions bar, sticky footer rule', 'published') flips the tag.
//
// What goes in (agreed 2026-10-13):
//   - One entry per working session per file, written in the file the change landed in.
//     A change that crosses files (UpBase fix → kit sync → product screen) gets an entry in
//     each, cross-linked under `related` with CL_LINKS.
//   - Items name the component/section, say what changed in plain words, and link `node`
//     when it still exists. Changes to the Changelog page itself, scratch frames and
//     Playground experiments are not logged.
//   - status: 'pending' in UpBase and the kit until the user publishes; then flip it with
//     setChangelogStatus. Product files take null.
//   - Author: 'Dat Vu · with Claude'.
//
// Timeouts: figma_execute caps at 30s. A run that "times out" can still finish in the
// background — re-read the Entries frame before retrying, or you get a duplicate entry and
// a second named version.
//
// Every fill, stroke, gap, padding and radius is bound to an UpBase variable and every
// text node uses an UpBase text style. UpBase resolves them locally; the product file
// imports them by key; the kit can't (imports hang there), so it harvests ids from
// nodes already bound to them. Results are cached in root plugin data, so only the
// first run in a file is slow. The token list is limited to what the kit can reach —
// check there before adding one.
//
// The status tag is a real Tag instance: UpBase `Tag / Status` locally, the kit's `Tag`
// wrapper (Type=Status) in the kit and in product files.
// ─────────────────────────────────────────────────────────────────────────────

const CL_VARS = {
  colorText: '0d6779c26b1c712fa2a5bd182a09c1be43fabb7e',
  colorTextSecondary: 'de53d83ac301be366eedeac5b3a8dbd976b32b65',
  colorTextTertiary: 'c928e4fe3f43cca9d2338d6f9dcc3b6d51f570d3',
  colorLink: '9a0a247bee7187df82988a9ad148c00a73d69f55',
  colorBgContainer: 'f7dba0e0eaed43561a550d8d0add1c2754eaf040',
  colorBorderSecondary: 'f0d79c429e8041b5a5efa375e3ec3f45e8775ea2',
  paddingXXS: '7ff7d85b96892f3473c31906d851a722f751f679',
  paddingLG: '83b8885d301391906322ff84fa7a00f9bed12eae',
  marginXS: '5e0fcee84e18f070cf475c56d0e3405913f47687',
  marginSM: 'f777334c00d9911f72580af64f1114bda5b80ff9',
  margin: 'd0c137b62282e0b100d1fa0684f929e56a4785d8',
  marginXL: '15d219dba8ae59322ff0e94368070eddefcb4764',
  borderRadiusLG: '2dddf5e1ba73829ea22e616a56b70e24c80560b7',
  lineWidth: 'cc6d84601b6886ec76ce78dc0504d27d193712f1',
};
const CL_STYLES = {
  'Heading/1': 'ddbb7109eca5fca3b262028aea2014a060942f72',
  'Heading/4': '244d76fc458a3409cc5b7fffb7115740fb4b96e9',
  'Heading/5': 'b40b02cdb40caef06e5a16d11c2de6ff1caff385',
  'Text LG/Normal': 'e3c6a733172287b902ee6fac996bcbdb562e399e',
  'Text Base/Normal': 'd226bd288d31ed1dcc34b811f1a7295df71d6641',
  'Text SM/Normal': '1bf86738999bebe0f2556e6a677649939d6d17d4',
  'Text SM/Strong': 'e7db5851d52b6cd8f2cb78ed050723b18e0cab75',
};
// UpBase `Tag / Status` and the kit `Tag` wrapper: key, plus node id in its home file.
const CL_TAG = {
  upbase: { key: 'e917fa2e56ba0624fd76bba31db852310324efca', id: '412:13527' },
  kit: { key: '4f5b550a663280ed3321cef6a0af9285df8b7e0a', id: '241:10169' },
};
const CL_LINKS = {
  upbase: 'https://www.figma.com/design/BoGaG48v9BfY7LkMtFs4zh?node-id=28483-445',
  kit: 'https://www.figma.com/design/9c052aEvpV7gYLhwdatf6g?node-id=0-1',
  product: 'https://www.figma.com/design/9FAdrUvuA7q0VExwsAxNu6?node-id=214-220882',
};
const CL_ORDER = ['Added', 'Changed', 'Fixed', 'Deprecated', 'Removed'];
const CL_CACHE = 'changelog-tokens-v1';

const clRace = (p, ms) => Promise.race([p.catch(() => null), new Promise(r => setTimeout(() => r(null), ms))]);

async function clResolve() {
  const vars = {}, styles = {};
  const byKey = Object.fromEntries(Object.entries(CL_VARS).map(([n, k]) => [k, n]));
  const styleByKey = Object.fromEntries(Object.entries(CL_STYLES).map(([n, k]) => [k, n]));
  const varsDone = () => Object.keys(CL_VARS).every(n => vars[n]);
  const stylesDone = () => Object.keys(CL_STYLES).every(n => styles[n]);
  const done = () => varsDone() && stylesDone();

  // 1. Cache from an earlier run (validated — a stale id resolves to null).
  let cache = {};
  try { cache = JSON.parse(figma.root.getPluginData(CL_CACHE) || '{}'); } catch (e) {}
  for (const [n, id] of Object.entries(cache.vars || {})) { if (!CL_VARS[n]) continue; const v = await figma.variables.getVariableByIdAsync(id); if (v) vars[n] = v; }
  for (const [n, id] of Object.entries(cache.styles || {})) { if (!CL_STYLES[n]) continue; const s = await figma.getStyleByIdAsync(id); if (s) styles[n] = s; }

  // 2. Local (UpBase itself). Each scan runs only if something is missing — they are slow in UpBase.
  if (!stylesDone()) for (const s of await figma.getLocalTextStylesAsync()) if (styleByKey[s.key] && !styles[styleByKey[s.key]]) styles[styleByKey[s.key]] = s;
  if (!varsDone()) for (const v of await figma.variables.getLocalVariablesAsync()) if (byKey[v.key] && !vars[byKey[v.key]]) vars[byKey[v.key]] = v;

  // 3. Import by key, raced and in parallel — works in product files (~8s for all,
  //    30s+ one by one, which times figma_execute out), hangs in the kit.
  if (!done()) {
    const probe = await clRace(figma.variables.importVariableByKeyAsync(CL_VARS.colorText), 4000);
    if (probe) {
      await Promise.all([
        ...Object.keys(CL_VARS).filter(n => !vars[n]).map(async n => { const v = await clRace(figma.variables.importVariableByKeyAsync(CL_VARS[n]), 12000); if (v) vars[n] = v; }),
        ...Object.keys(CL_STYLES).filter(n => !styles[n]).map(async n => { const s = await clRace(figma.importStyleByKeyAsync(CL_STYLES[n]), 12000); if (s) styles[n] = s; }),
      ]);
    }
  }

  // 4. Harvest from bound nodes, following one alias hop (kit). ~15s in the kit.
  if (!done()) {
    const seenV = new Set(), seenS = new Set();
    const take = async id => {
      if (!id || seenV.has(id)) return; seenV.add(id);
      const v = await figma.variables.getVariableByIdAsync(id); if (!v) return;
      if (byKey[v.key]) { vars[byKey[v.key]] = vars[byKey[v.key]] || v; return; }
      for (const val of Object.values(v.valuesByMode)) if (val && val.type === 'VARIABLE_ALIAS') {
        const t = await figma.variables.getVariableByIdAsync(val.id);
        if (t && byKey[t.key]) vars[byKey[t.key]] = vars[byKey[t.key]] || t;
      }
    };
    const grab = async bv => { for (const v of Object.values(bv || {})) for (const x of [].concat(v)) await take(x && x.id); };
    for (const page of figma.root.children) {
      if (done()) break;
      await page.loadAsync();
      const nodes = page.findAll(n => (n.boundVariables && Object.keys(n.boundVariables).length) || n.type === 'TEXT'
        || (Array.isArray(n.fills) && n.fills.some(f => f.boundVariables && f.boundVariables.color)));
      for (const n of nodes) {
        await grab(n.boundVariables);
        if (Array.isArray(n.fills)) for (const f of n.fills) await grab(f.boundVariables);
        if (Array.isArray(n.strokes)) for (const f of n.strokes) await grab(f.boundVariables);
        if (n.type === 'TEXT' && typeof n.textStyleId === 'string' && n.textStyleId && !seenS.has(n.textStyleId)) {
          seenS.add(n.textStyleId);
          const s = await figma.getStyleByIdAsync(n.textStyleId);
          if (s && styleByKey[s.key]) styles[styleByKey[s.key]] = styles[styleByKey[s.key]] || s;
        }
      }
    }
  }

  const missing = [...Object.keys(CL_VARS).filter(n => !vars[n]), ...Object.keys(CL_STYLES).filter(n => !styles[n])];
  if (missing.length) throw new Error('Changelog: unresolved tokens/styles: ' + missing.join(', '));
  figma.root.setPluginData(CL_CACHE, JSON.stringify({
    ...cache,
    vars: Object.fromEntries(Object.entries(vars).map(([n, v]) => [n, v.id])),
    styles: Object.fromEntries(Object.entries(styles).map(([n, s]) => [n, s.id])),
  }));
  for (const s of Object.values(styles)) await figma.loadFontAsync(s.fontName);
  return { vars, styles };
}

function clPaint(v) { return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v); }

function clFrame(name, T, { dir = 'VERTICAL', gap, pad, fill, stroke, radius } = {}) {
  const f = figma.createFrame();
  f.name = name; f.layoutMode = dir; f.fills = [];
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  if (gap) f.setBoundVariable('itemSpacing', T.vars[gap]);
  if (pad) for (const k of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) f.setBoundVariable(k, T.vars[pad]);
  if (fill) f.fills = [clPaint(T.vars[fill])];
  if (stroke) { f.strokes = [clPaint(T.vars[stroke])]; f.strokeAlign = 'INSIDE'; f.setBoundVariable('strokeWeight', T.vars.lineWidth); }
  if (radius) for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, T.vars[radius]);
  return f;
}

async function clText(name, chars, style, color, T) {
  const t = figma.createText();
  t.name = name;
  await t.setTextStyleIdAsync(T.styles[style].id);
  t.characters = chars;
  t.fills = [clPaint(T.vars[color])];
  return t;
}

function clFill(n) { n.layoutSizingHorizontal = 'FILL'; if (n.type === 'TEXT') n.textAutoResize = 'HEIGHT'; }

// One row per item: a "•" then the text, so wrapped lines hang. Not a Figma list —
// its bullets take the colour of the node's first character, which is a link.
// Each item's name links to its node (same file) or URL.
async function clList(name, items, T) {
  const list = clFrame(name, T, { gap: 'paddingXXS' });
  for (const it of items) {
    const row = clFrame('Item', T, { dir: 'HORIZONTAL', gap: 'marginXS' });
    list.appendChild(row); clFill(row);
    row.appendChild(await clText('Bullet', '•', 'Text Base/Normal', 'colorTextTertiary', T));
    const t = await clText('Text', it.text ? `${it.name} — ${it.text}` : it.name, 'Text Base/Normal', 'colorText', T);
    row.appendChild(t); clFill(t);
    const node = it.node && await figma.getNodeByIdAsync(it.node); // a deleted node drops its link
    const link = node ? { type: 'NODE', value: it.node } : it.url ? { type: 'URL', value: it.url } : null;
    if (link) { t.setRangeHyperlink(0, it.name.length, link); t.setRangeFills(0, it.name.length, [clPaint(T.vars.colorLink)]); }
  }
  return list;
}

// The Tag set to instantiate: UpBase `Tag / Status` if local, else the kit `Tag` wrapper
// (local in the kit, imported in product files).
// By node id, not by loading `❖ Tag` — that page load alone times out in UpBase.
async function clTagSet() {
  for (const t of [CL_TAG.upbase, CL_TAG.kit]) {
    const local = await figma.getNodeByIdAsync(t.id);
    if (local && local.type === 'COMPONENT_SET' && local.key === t.key) return local;
  }
  const set = await clRace(figma.importComponentSetByKeyAsync(CL_TAG.kit.key), 8000);
  if (!set) throw new Error('Changelog: cannot reach the Tag component in ' + figma.root.name);
  return set;
}

async function clTag(status) {
  const set = await clTagSet();
  const k = status === 'pending' ? 'Warning' : 'Success';
  let inst;
  if (set.key === CL_TAG.upbase.key) {
    inst = set.defaultVariant.createInstance();
    inst.setProperties({ Status: k, Type: 'Outlined' });
  } else {
    inst = set.children.find(c => c.name === 'Type=Status').createInstance();
    const nested = inst.exposedInstances.find(e => e.name === 'Tag / Status');
    nested.setProperties({ Status: k, Type: 'Outlined' });
  }
  inst.name = 'Status';
  const label = inst.findOne(n => n.type === 'TEXT');
  // Family + style only: Tag's fontName carries variationSettings, and loading that never resolves in UpBase.
  await figma.loadFontAsync({ family: label.fontName.family, style: label.fontName.style });
  label.characters = status === 'pending' ? 'Pending publish' : 'Published';
  return inst;
}

function clDateLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]} ${y}`;
}

async function clPage() {
  // Page nodes are listed without loadAllPagesAsync, which takes ~30s in UpBase.
  const page = figma.root.children.find(p => p.type === 'PAGE' && /^_?Changelog$/.test(p.name.trim()));
  if (!page) throw new Error('Changelog: no "Changelog" / "_Changelog" page in ' + figma.root.name);
  await page.loadAsync();
  return page;
}

async function clRoot(T) {
  const page = await clPage();
  let root = page.children.find(n => n.getPluginData('changelog') === 'root');
  if (root) return root.children.find(n => n.name === 'Entries');
  root = clFrame('Changelog', T, { gap: 'marginXL' });
  root.setPluginData('changelog', 'root');
  root.counterAxisSizingMode = 'FIXED'; root.resize(960, root.height); root.x = 0; root.y = 0;
  page.appendChild(root);
  const head = clFrame('Header', T, { gap: 'marginXS' });
  root.appendChild(head); clFill(head);
  const h = await clText('Title', 'Changelog', 'Heading/1', 'colorText', T); head.appendChild(h); clFill(h);
  const d = await clText('Description', `Every change to ${figma.root.name}, newest first. Each entry matches a named version in File › Show version history.`, 'Text LG/Normal', 'colorTextSecondary', T);
  head.appendChild(d); clFill(d);
  const entries = clFrame('Entries', T, { gap: 'marginXL' });
  root.appendChild(entries); clFill(entries);
  return entries;
}

async function addChangelogEntry(e) {
  const T = await clResolve();
  const entries = await clRoot(T);
  const id = `${e.date} ${e.title}`;
  const old = entries.children.find(n => n.getPluginData('entry') === id);

  const card = clFrame(`${e.date} · ${e.title}`, T, { gap: 'margin', pad: 'paddingLG', fill: 'colorBgContainer', stroke: 'colorBorderSecondary', radius: 'borderRadiusLG' });
  card.setPluginData('entry', id);
  card.setPluginData('status', e.status || '');
  entries.insertChild(old ? entries.children.indexOf(old) : clInsertAt(entries, e.date), card);
  clFill(card);

  const top = clFrame('Heading', T, { gap: 'marginXS' }); card.appendChild(top); clFill(top);
  const row = clFrame('Date row', T, { dir: 'HORIZONTAL', gap: 'marginSM' }); row.counterAxisAlignItems = 'CENTER';
  top.appendChild(row); clFill(row);
  const date = await clText('Date', clDateLabel(e.date), 'Heading/4', 'colorText', T); row.appendChild(date); clFill(date);
  if (e.status) row.appendChild(await clTag(e.status));
  const title = await clText('Summary', e.title, 'Heading/5', 'colorText', T); top.appendChild(title); clFill(title);
  const by = await clText('Author', `By ${e.author || 'Dat Vu · with Claude'}`, 'Text SM/Normal', 'colorTextTertiary', T); top.appendChild(by); clFill(by);

  const groups = [...CL_ORDER.filter(k => e.sections && e.sections[k] && e.sections[k].length).map(k => [k, e.sections[k]]),
                  ...(e.related && e.related.length ? [['Related', e.related]] : [])];
  for (const [label, items] of groups) {
    const g = clFrame(label, T, { gap: 'marginXS' }); card.appendChild(g); clFill(g);
    const l = await clText('Label', label.toUpperCase(), 'Text SM/Strong', 'colorTextTertiary', T); g.appendChild(l); clFill(l);
    const list = await clList('Items', items, T); g.appendChild(list); clFill(list);
  }
  if (old) old.remove();

  let version = null;
  if (e.saveVersion) {
    const desc = groups.map(([k, items]) => `${k}: ${items.map(i => i.name).join(', ')}`).join('\n');
    version = await clRace(figma.saveVersionHistoryAsync(`${clDateLabel(e.date)} · ${e.title}`, desc), 8000);
  }
  return { file: figma.root.name, entry: card.id, replaced: !!old, version: version && version.id };
}

// Newest first: before the first entry with an earlier (or equal) date.
function clInsertAt(entries, date) {
  const i = entries.children.findIndex(n => (n.getPluginData('entry') || '').slice(0, 10) <= date);
  return i < 0 ? entries.children.length : i;
}

async function setChangelogStatus(date, title, status) {
  const page = await clPage();
  const card = page.findOne(n => n.getPluginData('entry') === `${date} ${title}`);
  if (!card) throw new Error('Changelog: no entry ' + date + ' ' + title);
  const row = card.findOne(n => n.name === 'Date row');
  const old = row.findOne(n => n.name === 'Status'); if (old) old.remove();
  if (status) row.appendChild(await clTag(status));
  card.setPluginData('status', status || '');
  return { entry: card.id, status };
}
