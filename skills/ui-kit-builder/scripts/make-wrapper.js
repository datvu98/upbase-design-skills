// ─────────────────────────────────────────────────────────────────────────────
// make-wrapper — generate a kit wrapper around a UpBase component.
//
// Run via figma_execute with the KIT's fileKey (from references/kit/<kit>.md).
// Edit CONFIG, run, read the returned report. It creates nothing until every
// precondition passes, and it reads everything back before returning.
//
// The pattern it builds — see references/wrapper-pattern.md:
//
//   COMPONENT  "<upsName>"                   local, published by the kit
//   └── INSTANCE "<nestedLayerName>"         remote main from UpBase
//       isExposedInstance = true
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  // UpBase component set OR standalone component key. Get it from a plugin-side
  // search of BoGaG48v9BfY7LkMtFs4zh — never from REST search, which matches
  // descriptions and returns silent empties when the token lapses.
  sourceKey: 'a0b8f7e08632a9e38b1ca402519adaff112a5ce6',   // Button / Basic

  // What the kit calls it (the field is named upsName for history — any kit).
  // Product context decides — it may or may not match UpBase.
  upsName: 'Button',

  // The consumer's exposed property group is labelled with THIS, not upsName.
  // Leave it null to reuse upsName, which is almost always what you want.
  nestedLayerName: null,

  // Page to build on. Must already exist — this script never creates pages.
  page: '❖ Button',

  // Optional: pick a specific starting variant, e.g. { Type: 'Primary', Size: 'Default' }.
  // Null uses the set's own default variant.
  variant: null,

  // One-line summary. The Source block is appended automatically.
  summary: 'The primary action control, in five types and three sizes.',

  // Everything after the summary, in the house format. See
  // _shared/references/conventions.md › The component description. Leave '' to fill in later —
  // scripts/audit-wrappers.js will flag it as missing.
  body: '',

  dryRun: false,   // true = report what it would do, create nothing
};

// ─────────────────────────────────────────────────────────────────────────────

const report = { config: { ...CONFIG }, steps: [], warnings: [], created: null };
const step = (name, detail) => report.steps.push({ name, ...detail });

await figma.loadAllPagesAsync();

// ── Preconditions ────────────────────────────────────────────────────────────

// Any kit is fine; the source library is not — a wrapper there duplicates what it wraps.
if (figma.fileKey === 'BoGaG48v9BfY7LkMtFs4zh') {
  return { ...report, fatal: 'Active file is UpBase Design System (the library itself). Wrappers belong in a kit — re-pin and pass fileKey explicitly.' };
}

const page = figma.root.children.find(p => p.name === CONFIG.page);
if (!page) {
  return { ...report, fatal: `Page "${CONFIG.page}" not found. Pages: ` +
    figma.root.children.map(p => p.name).join(' | ') };
}

// Refuse to make a second wrapper with the same name on this page.
const clash = page.findOne(n =>
  (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') && n.name === CONFIG.upsName);
if (clash) {
  return { ...report, fatal: `"${CONFIG.upsName}" already exists on ${CONFIG.page} (${clash.id}). ` +
    `Edit it, or choose another name — do not create a second.` };
}

// ── Import the source ────────────────────────────────────────────────────────

// Try the VARIANT first: importComponentSetByKeyAsync on a large set can blow the
// 30s execute budget on a cold cache and never return, while a single variant of
// the same set imports in ~140ms warm / ~7s cold. Only fall back to the set.
let src = null, isSet = false;
try { src = await figma.importComponentByKeyAsync(CONFIG.sourceKey); }
catch (e) {
  try { src = await figma.importComponentSetByKeyAsync(CONFIG.sourceKey); isSet = true; }
  catch (e2) {
    return { ...report, fatal: `Could not import ${CONFIG.sourceKey} as a component or a set. ` +
      `Is UpBase enabled on this file, and is the component published? ${String(e2.message || e2)}` };
  }
}

// Axes live on the SET. When a variant key was imported, read them off its parent
// so the Source block still records the real axis list for drift detection.
const axisOwner = isSet ? src
  : (src.parent && src.parent.type === 'COMPONENT_SET' ? src.parent : null);
const axes = axisOwner ? Object.entries(axisOwner.variantGroupProperties || {})
  .map(([k, v]) => ({ axis: k, options: v.values })) : [];
step('import', { name: src.name, isSet, remote: src.remote,
  variants: isSet ? src.children.length : 1, axes: axes.map(a => `${a.axis} (${a.options.length})`) });

// ── Choose the starting variant ──────────────────────────────────────────────

let variant;
if (!isSet) variant = src;
else if (CONFIG.variant) {
  const want = Object.entries(CONFIG.variant);
  variant = src.children.find(c => {
    const parts = Object.fromEntries(c.name.split(',').map(s => {
      const [k, v] = s.split('='); return [k.trim(), (v || '').trim()];
    }));
    return want.every(([k, v]) => parts[k] === v);
  });
  if (!variant) {
    return { ...report, fatal: `No variant matches ${JSON.stringify(CONFIG.variant)}. ` +
      `Axes: ${JSON.stringify(Object.fromEntries(axes.map(a => [a.axis, a.options])))}` };
  }
} else variant = src.defaultVariant || src.children[0];
step('variant', { name: variant.name });

if (CONFIG.dryRun) return { ...report, dryRun: true };

// ── Build ────────────────────────────────────────────────────────────────────

const trash = [];
let wrapper = null;
try {
  const inst = variant.createInstance();
  trash.push(inst);

  wrapper = figma.createComponent();
  wrapper.name = CONFIG.upsName;
  // A wrapper with no auto-layout can't mirror FILL, and hug is the wrong default
  // for anything that stretches — so always give it one.
  wrapper.layoutMode = (inst.layoutMode && inst.layoutMode !== 'NONE') ? inst.layoutMode : 'HORIZONTAL';
  wrapper.primaryAxisSizingMode = 'AUTO';
  wrapper.counterAxisSizingMode = 'AUTO';
  wrapper.fills = [];
  page.appendChild(wrapper);
  trash.push(wrapper);

  wrapper.appendChild(inst);

  // Mirror the source's sizing. Must happen AFTER appendChild — layoutSizing*
  // throws on a node that isn't in an auto-layout parent yet.
  const srcSizing = { h: inst.layoutSizingHorizontal, v: inst.layoutSizingVertical };
  for (const [axis, prop] of [['h', 'layoutSizingHorizontal'], ['v', 'layoutSizingVertical']]) {
    try { wrapper[prop] = srcSizing[axis]; }
    catch (e) { report.warnings.push(`Could not set wrapper ${prop}=${srcSizing[axis]}: ${e.message}`); }
  }
  step('sizing', { source: srcSizing,
    wrapper: { h: wrapper.layoutSizingHorizontal, v: wrapper.layoutSizingVertical } });

  // The two moves that make it usable downstream.
  inst.name = CONFIG.nestedLayerName || CONFIG.upsName;
  inst.isExposedInstance = true;
  step('expose', { layerName: inst.name, isExposedInstance: inst.isExposedInstance,
    forwardedProps: Object.keys(inst.componentProperties || {}).length });

  // ── Description, with the Source block audit-wrappers.js reads ───────────────
  const axisLine = isSet
    ? `${axes.length} ${axes.length === 1 ? 'axis' : 'axes'} (${axes.map(a => a.axis).join(' · ')})`
    : 'no variants';
  const instanceProps = Object.keys(inst.componentProperties || {})
    .filter(k => k.includes('#')).length;
  const sourceBlock =
    `\n\n**Properties**\n\nSource\n\n` +
    `- UpBase \`${src.name}\` (key ${CONFIG.sourceKey})\n` +
    `  exposed nested instance · ${axisLine} · ${instanceProps} instance properties\n`;

  wrapper.description = (CONFIG.summary || '').trim() + (CONFIG.body ? '\n\n' + CONFIG.body.trim() : '') + sourceBlock;
  if (!CONFIG.body) report.warnings.push('CONFIG.body empty — description has no When to use / Responsive / Search metadata yet.');

  // Position clear of anything already on the page.
  const others = page.children.filter(c => c !== wrapper);
  wrapper.x = 0;
  wrapper.y = others.length ? Math.max(...others.map(c => c.y + c.height)) + 160 : 0;

  trash.length = 0;   // success — keep everything
} catch (e) {
  for (const n of trash.reverse()) { try { n.remove(); } catch (_) {} }
  return { ...report, fatal: `Build failed and was rolled back: ${String(e && e.message || e)}` };
}

// ── Read back — never trust a silent write ───────────────────────────────────

const check = await figma.getNodeByIdAsync(wrapper.id);
const nested = check.children[0];
const main = await nested.getMainComponentAsync();

report.created = {
  id: check.id,
  name: check.name,
  key: check.key,
  page: CONFIG.page,
  ownPropertyDefinitions: Object.keys(check.componentPropertyDefinitions || {}),  // [] is expected
  nested: {
    layerName: nested.name,
    isExposedInstance: nested.isExposedInstance,
    forwardedProps: Object.keys(nested.componentProperties || {}),
    mainRemote: main ? main.remote : null,
    mainSet: main && main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.name : (main ? main.name : null),
  },
  sizing: { h: check.layoutSizingHorizontal, v: check.layoutSizingVertical },
  descriptionChars: (check.description || '').length,
};

// The five checks from the review checklist, evaluated here so a bad wrapper
// can't be reported as a good one.
report.checklist = {
  exposed:        nested.isExposedInstance === true,
  layerRenamed:   nested.name === (CONFIG.nestedLayerName || CONFIG.upsName),
  sizingMirrored: check.layoutSizingHorizontal === nested.layoutSizingHorizontal &&
                  check.layoutSizingVertical === nested.layoutSizingVertical,
  hasDescription: (check.description || '').trim().length > 0,
  hasSourceBlock: /Source\s*\n/.test(check.description || '') && (check.description || '').includes(CONFIG.sourceKey),
};
report.pass = Object.values(report.checklist).every(Boolean);

return report;
