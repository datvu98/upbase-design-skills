// ─────────────────────────────────────────────────────────────────────────────
// UpBase component helpers — paste this block at the top of a figma_execute call.
//
// figma_execute has no module system, so this is a copy-paste preamble rather
// than an import. Paste what you need; each helper is independent apart from
// the shared lookups at the top.
//
// Call `await initUB()` first — it populates V, S, MODES and the token maps.
// ─────────────────────────────────────────────────────────────────────────────

let UB = {};

async function initUB() {
  await figma.loadAllPagesAsync();
  const cols  = await figma.variables.getLocalVariableCollectionsAsync();
  const vars  = await figma.variables.getLocalVariablesAsync();
  const texts = await figma.getLocalTextStylesAsync();
  const effs  = await figma.getLocalEffectStylesAsync();
  const grids = await figma.getLocalGridStylesAsync();

  const colorCol = cols.find(c => c.name.includes('Colors'));
  const dimCol   = cols.find(c => c.name.includes('Dimensions'));
  const typCol   = cols.find(c => c.name.includes('Typography'));
  const mode = (col, name) => col && col.modes.find(m => m.name === name);

  UB = {
    cols, vars, texts, effs, grids,
    colorCol, dimCol, typCol,
    MODES: {
      // Colors also carries a Dark mode; it is dormant and nothing renders against it.
      light:   mode(colorCol, 'Light'),
      dimDef:  mode(dimCol, 'Default'),
      dimCmp:  mode(dimCol, 'Compact'),
      typDef:  mode(typCol, 'Default'),
      typCmp:  mode(typCol, 'Compact'),
    },
    // variable by exact name
    V: n => vars.find(v => v.name === n),
    // style id by exact name
    T: n => { const s = texts.find(x => x.name === n); return s ? s.id : null; },
    E: n => { const s = effs.find(x => x.name === n);  return s ? s.id : null; },
    G: n => { const s = grids.find(x => x.name === n); return s ? s.id : null; },
  };
  // numeric token maps, so a raw number can be swapped for the right token
  UB.SPACE = {
    4:  UB.V('Space/Padding/paddingXXS'),
    8:  UB.V('Space/Padding/paddingXS'),
    12: UB.V('Space/Padding/paddingSM'),
    16: UB.V('Space/Padding/padding'),
    20: UB.V('Space/Padding/paddingMD'),
    24: UB.V('Space/Padding/paddingLG'),
    32: UB.V('Space/Padding/paddingXL'),
  };
  UB.RADIUS = {
    2: UB.V('Border Radius/borderRadiusXS'),
    4: UB.V('Border Radius/borderRadiusSM'),
    6: UB.V('Border Radius/borderRadius'),
    8: UB.V('Border Radius/borderRadiusLG'),
  };
  UB.LINE_WIDTH = UB.V('Size/Line Width/lineWidth');
  UB.CONTROL    = { 24: UB.V('Size/Height/controlHeightSM'), 32: UB.V('Size/Height/controlHeight'),
                    40: UB.V('Size/Height/controlHeightLG') };
  return Object.keys(UB.MODES).filter(k => UB.MODES[k]);
}

// ── Colour ───────────────────────────────────────────────────────────────────

// Follow a VARIABLE_ALIAS chain to a concrete RGBA in the given mode.
async function resolveVar(v, modeId, depth) {
  if (!v || (depth || 0) > 8) return null;
  const id = modeId || (UB.MODES.light && UB.MODES.light.modeId);
  let x = v.valuesByMode[id];
  if (x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS') {
    return resolveVar(await figma.variables.getVariableByIdAsync(x.id), id, (depth || 0) + 1);
  }
  return x;
}

// Bound paint that keeps the variable's alpha. Use this for EVERY fill/stroke —
// binding an alpha colour without setting opacity renders solid black.
async function paintVar(v, modeId) {
  const c = await resolveVar(v, modeId);
  if (!c || typeof c !== 'object' || !('r' in c)) return { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  const p = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b },
              opacity: c.a !== undefined ? c.a : 1 };
  return figma.variables.setBoundVariableForPaint(p, 'color', v);
}

// WCAG contrast. 4.5 for text, 3.0 for icons/graphics.
function relLum(c) {
  const f = x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrast(fg, bg) {
  const l1 = relLum(fg), l2 = relLum(bg);
  return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
}
// Composite a translucent foreground over a background before comparing.
function over(fg, alpha, bg) {
  return { r: fg.r * alpha + bg.r * (1 - alpha),
           g: fg.g * alpha + bg.g * (1 - alpha),
           b: fg.b * alpha + bg.b * (1 - alpha) };
}
// Contrast of one colour variable on another, in a given mode.
async function contrastVars(fgVar, bgVar, modeId) {
  const fg = await resolveVar(fgVar, modeId), bg = await resolveVar(bgVar, modeId);
  if (!fg || !bg) return null;
  const eff = fg.a !== undefined && fg.a < 1 ? over(fg, fg.a, bg) : fg;
  return contrast(eff, bg);
}
function hex(c) {
  const f = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return '#' + f(c.r) + f(c.g) + f(c.b) + (c.a !== undefined && c.a < 1 ? ` @${c.a.toFixed(2)}` : '');
}

// ── Binding ──────────────────────────────────────────────────────────────────

// Bind a numeric property, returning success so you can count bindings.
function bindNum(node, prop, v) {
  if (!v) return false;
  try { node.setBoundVariable(prop, v); return true; } catch (e) { return false; }
}

// Swap raw numbers for tokens across padding / gap / radius on one node.
// Skips values with no token — forcing a wrong-semantic token is worse than raw.
function tokenizeNode(node) {
  let n = 0;
  for (const p of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'])
    if (typeof node[p] === 'number' && UB.SPACE[node[p]] && bindNum(node, p, UB.SPACE[node[p]])) n++;
  if (typeof node.itemSpacing === 'number' && node.itemSpacing > 0 && UB.SPACE[node.itemSpacing])
    if (bindNum(node, 'itemSpacing', UB.SPACE[node.itemSpacing])) n++;
  for (const p of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'])
    if (typeof node[p] === 'number' && UB.RADIUS[node[p]] && bindNum(node, p, UB.RADIUS[node[p]])) n++;
  // strokeWeight becomes unbindable once per-side weights are set — bind each side
  if (Array.isArray(node.strokes) && node.strokes.length)
    for (const s of ['strokeTopWeight', 'strokeBottomWeight', 'strokeLeftWeight', 'strokeRightWeight'])
      if (typeof node[s] === 'number' && node[s] > 0 && bindNum(node, s, UB.LINE_WIDTH)) n++;
  return n;
}

async function applyTextStyle(node, styleName) {
  const id = UB.T(styleName);
  if (!id) return false;
  await node.setTextStyleIdAsync(id);
  return true;
}

// ── Building ─────────────────────────────────────────────────────────────────

const VECTORISH = new Set(['VECTOR','BOOLEAN_OPERATION','STAR','ELLIPSE','POLYGON','LINE','RECTANGLE']);

// Icon instance, recoloured correctly: vectors get the paint, containers AND the
// instance root get cleared. Painting everything yields a solid square.
async function icon(iconName, size, colorVar) {
  const page = figma.root.children.find(p => /^\s*(❖\s*)?Icon\s*$/.test(p.name));
  const comp = page && page.findAllWithCriteria({ types: ['COMPONENT'] })
                          .find(c => c.name === 'Icon / ' + iconName);
  if (!comp) return null;
  const inst = comp.createInstance();
  inst.resize(size, size);
  const paint = await paintVar(colorVar);
  const stack = [inst];
  while (stack.length) {
    const n = stack.pop();
    if ('fills' in n && Array.isArray(n.fills)) {
      if (n !== inst && VECTORISH.has(n.type)) n.fills = [paint];
      else n.fills = [];
    }
    if ('children' in n) stack.push(...n.children);
  }
  return inst;
}

// Text node with a style and a bound fill, in one call.
async function txt(chars, styleName, colorVar, fontStyle) {
  const t = figma.createText();
  const fn = { family: 'Be Vietnam Pro', style: fontStyle || 'Regular' };
  await figma.loadFontAsync(fn);
  t.fontName = fn;
  t.characters = chars;
  if (styleName) await applyTextStyle(t, styleName);
  if (colorVar) t.fills = [await paintVar(colorVar)];
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

// Auto-layout frame with a bound gap.
function frame(name, dir, gap) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = gap || 0;
  f.fills = [];
  if (gap && UB.SPACE[gap]) bindNum(f, 'itemSpacing', UB.SPACE[gap]);
  return f;
}

// Fixed-width slot so hiding its contents preserves the layout indent.
function slot(name, w, h) {
  const s = figma.createFrame();
  s.name = name;
  s.resize(w, h === undefined ? w : h);
  s.fills = [];
  s.clipsContent = false;
  return s;
}

// ── Component properties ─────────────────────────────────────────────────────

// Real property keys carry a #id suffix. Never guess them.
function propKeys(set) {
  const keys = Object.keys(set.componentPropertyDefinitions);
  return { all: keys, of: label => keys.find(k => k.split('#')[0] === label) };
}

// Add properties on a set, then bind references per variant.
// map: [{ prop, layer|match, on: 'characters'|'visible'|'mainComponent' }]
// `layer` matches by name; `match` is a predicate for trickier cases.
// Returns { made, bound, expected } — compare bound vs expected, because a
// name mismatch binds nothing and raises no error.
function addProps(set, props, map) {
  const made = {}, errs = [];
  for (const p of props) {
    try { made[p.name] = set.addComponentProperty(p.name, p.type, p.def); }
    catch (e) { errs.push(`${p.name}: ${e.message}`); }
  }
  let bound = 0;
  for (const v of set.children) {
    for (const m of map) {
      const id = made[m.prop];
      if (!id) continue;
      const layer = m.match ? v.findOne(m.match) : v.findOne(n => n.name === m.layer);
      if (!layer) continue;
      // a variant that hides a layer by design keeps its own value
      if (m.on === 'visible' && m.skipHidden && layer.visible === false) continue;
      layer.componentPropertyReferences = { ...(layer.componentPropertyReferences || {}), [m.on]: id };
      bound++;
    }
  }
  return { made, bound, expected: set.children.length * map.length, errs };
}

// Generate the **Properties** block for a description from live definitions,
// so the docs can't drift from the component.
function propsBlock(set) {
  const d = set.componentPropertyDefinitions || {};
  const variants = [], others = [];
  for (const [k, v] of Object.entries(d)) {
    if (v.type === 'VARIANT') variants.push(`- ${k} — ${v.variantOptions.join(' · ')}`);
    else {
      const name = k.split('#')[0];
      const t = v.type === 'INSTANCE_SWAP' ? 'icon swap'
              : v.type === 'BOOLEAN' ? `boolean, default ${v.defaultValue}`
              : v.type === 'TEXT' ? 'text' : v.type.toLowerCase();
      others.push(`- ${name} — ${t}`);
    }
  }
  let s = '';
  if (variants.length) s += '\nVariants\n\n' + variants.join('\n') + '\n';
  if (others.length)   s += '\nInstance properties\n\n' + others.join('\n') + '\n';
  return s ? '\n\n**Properties**\n' + s : '';
}

// ── Audit hygiene ────────────────────────────────────────────────────────────

// True if the node is an instance or lives inside one. Skip these when auditing:
// their values belong to their main component, not to yours.
function insideInstance(node) {
  if (node.type === 'INSTANCE') return true;
  let p = node.parent;
  while (p) { if (p.type === 'INSTANCE') return true; p = p.parent; }
  return false;
}
