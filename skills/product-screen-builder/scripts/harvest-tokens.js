// ─────────────────────────────────────────────────────────────────────────────
// Harvest design tokens reachable in a product file. Read-only.
//
// A product file can't import variables (the kit publishes none), but every kit
// instance carries UpBase variables and getVariableByIdAsync resolves them. This
// lists every bound variable under `root` whose name matches `pattern`, so you can
// bind your own frames to real tokens instead of raw numbers.
//
//   const root = await figma.getNodeByIdAsync('<a built screen id>');
//   return await harvestTokens(root, /colorBg|padding|margin|Space\//);
//
// Record new ids in the product data file's "Harvested tokens" table.
// ─────────────────────────────────────────────────────────────────────────────

async function harvestTokens(root, pattern = /./) {
  const ids = new Set();
  const grab = bv => {
    for (const v of Object.values(bv || {})) {
      if (Array.isArray(v)) v.forEach(x => x && x.id && ids.add(x.id));
      else if (v && v.id) ids.add(v.id);
    }
  };
  for (const n of [root, ...root.findAll(() => true)]) {
    grab(n.boundVariables);
    if ('fills' in n && Array.isArray(n.fills)) n.fills.forEach(f => grab(f.boundVariables));
    if ('strokes' in n && Array.isArray(n.strokes)) n.strokes.forEach(f => grab(f.boundVariables));
  }
  const out = {};
  for (const id of ids) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v && pattern.test(v.name)) out[v.name] = id;
  }
  return { scanned: ids.size, matched: Object.keys(out).length, tokens: out };
}
