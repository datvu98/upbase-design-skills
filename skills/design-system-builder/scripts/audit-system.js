// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — enumerate what the file actually has, before building anything.
// Paste into figma_execute. Run this FIRST, every time.
//
// The point is to stop guessing. Style names are not what you'd predict
// ("Heading/4", not "Heading 4"), there may be zero paint styles, and the token
// that solves your problem often already exists.
// ─────────────────────────────────────────────────────────────────────────────

await figma.loadAllPagesAsync();

const cols  = await figma.variables.getLocalVariableCollectionsAsync();
const vars  = await figma.variables.getLocalVariablesAsync();
const texts = await figma.getLocalTextStylesAsync();
const effs  = await figma.getLocalEffectStylesAsync();
const paints= await figma.getLocalPaintStylesAsync();
const grids = await figma.getLocalGridStylesAsync();

const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
              + (c.a !== undefined && c.a < 1 ? ` @${c.a.toFixed(2)}` : '');

async function resolve(v, modeId, d) {
  if (!v || (d || 0) > 8) return null;
  let x = v.valuesByMode[modeId];
  if (x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS')
    return resolve(await figma.variables.getVariableByIdAsync(x.id), modeId, (d || 0) + 1);
  return x;
}

// ── collections, modes, and how variables are grouped
const collections = [];
for (const c of cols) {
  const groups = {};
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (!v) continue;
    const head = v.name.includes('/') ? v.name.split('/').slice(0, 2).join('/') : '(ungrouped)';
    groups[head] = (groups[head] || 0) + 1;
  }
  collections.push({
    name: c.name,
    modes: c.modes.map(m => m.name),
    variables: c.variableIds.length,
    groups: Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 12),
  });
}

// ── numeric tokens indexed by value, so you can look up "what token is 12?"
const dimCol = cols.find(c => c.name.includes('Dimensions'));
const numericByValue = {};
if (dimCol) {
  const defId = dimCol.modes[0].modeId;
  for (const v of vars) {
    if (!/^(Size|Space|Border Radius)\//.test(v.name)) continue;
    const val = await resolve(v, defId);
    if (typeof val === 'number') (numericByValue[val] = numericByValue[val] || []).push(v.name);
  }
}

// ── styles
const textStyles = texts.map(s => ({
  name: s.name, size: s.fontSize, weight: s.fontName && s.fontName.style,
  bound: Object.keys(s.boundVariables || {}),
}));
const effectStyles = effs.map(s => ({
  name: s.name,
  layers: s.effects.map(e => `${e.type} y${e.offset ? e.offset.y : 0} blur${e.radius} spread${e.spread || 0}`),
}));

// ── which effect style do existing floating surfaces use? copy that convention.
const conventions = {};
for (const [label, id] of Object.entries({
  Dropdown: '376:10633', Popover: '411:0', FloatButton: '1722:40493', Modal: '2914:74904',
})) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { conventions[label] = 'not found'; continue; }
  const first = n.type === 'COMPONENT_SET' ? n.children[0] : n;
  const hits = [];
  for (const x of [first, ...first.findAll(() => true)].slice(0, 60))
    if ('effects' in x && x.effects && x.effects.length) {
      const st = x.effectStyleId ? effs.find(e => e.id === x.effectStyleId) : null;
      hits.push(`${x.name}: ${st ? st.name : '(raw)'}`);
    }
  conventions[label] = hits.slice(0, 3);
}

// ── breakpoints
const screens = {};
if (dimCol) {
  const defId = dimCol.modes[0].modeId;
  for (const v of vars)
    if (/^Size\/Screen Size\/screen(XS|SM|MD|LG|XL|XXL)$/.test(v.name))
      screens[v.name.split('/').pop()] = await resolve(v, defId);
}

// ── pages, so you match the current naming convention rather than assuming
const pages = figma.root.children.map((p, i) => ({ i, name: p.name, children: p.children.length }));

return {
  counts: { collections: cols.length, variables: vars.length, textStyles: texts.length,
            effectStyles: effs.length, paintStyles: paints.length, gridStyles: grids.length },
  collections,
  textStyles,
  effectStyles,
  paintStyleNames: paints.map(s => s.name),
  gridStyleNames: grids.map(s => s.name),
  shadowConventions: conventions,
  breakpoints: screens,
  numericByValue,
  pages,
};
