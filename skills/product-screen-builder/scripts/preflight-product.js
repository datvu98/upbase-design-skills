// ─────────────────────────────────────────────────────────────────────────────
// Preflight for a product file — paste at the top of the FIRST figma_execute of
// any build, before a single node is created. Read-only except for one
// component import (which only caches the kit component; nothing lands on canvas).
//
//   const pf = await preflightProduct({
//     fileKey: '9FAdrUvuA7q0VExwsAxNu6',           // the product file you intend to write to
//     screenName: 'Kho hàng 03',                    // prefix of the frame you're about to build
//   });
//   if (pf.blocked) return pf;                       // STOP — create nothing
//   return pf;                                       // otherwise read the warnings, then build
//
// Each check catches a failure that is silent and that no screenshot reveals:
//   1. wrong file     — the active target drifts between connected files
//   2. kit unreachable — imports fail or resolve stale; a screen built on a failed
//                        import has holes where components should be
//   3. leftovers      — a timed-out call usually finished; building again duplicates
// ─────────────────────────────────────────────────────────────────────────────

async function preflightProduct({ fileKey, screenName = null, kitProbeKey = 'ad019f1790ab546845e50debf54d2bc5a710a6bf' /* UpS Button / Basic */ } = {}) {
  const out = { blocked: false, checks: [], warnings: [] };
  const fail = (name, detail) => { out.blocked = true; out.checks.push({ name, ok: false, detail }); };
  const pass = (name, detail) => out.checks.push({ name, ok: true, detail });

  if (!fileKey) { fail('fileKey', 'pass the product fileKey you intend to write to'); return out; }

  // 1. File identity
  const actual = typeof figma.fileKey === 'string' ? figma.fileKey : null;
  if (actual && actual !== fileKey) fail('file identity', `WRONG FILE: intended ${fileKey}, in ${actual} ("${figma.root.name}"). Re-pin with figma_navigate lock:true and pass fileKey on every call.`);
  else pass('file identity', actual ? `${actual} ("${figma.root.name}")` : `unproven — root "${figma.root.name}"`);

  // Product files hold no design-system collections of their own. Finding UpBase's four here means
  // you're in the source library, not a product file.
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  if (['Colors','Dimensions','Typography','Components'].every(n => cols.some(c => c.name.includes(n))))
    fail('file role', 'UpBase collections are local here — this is the source library, not a product file');
  else pass('file role', `${cols.length} local collections (0 is normal for a product file)`);

  // 2. Kit reachable
  const t0 = Date.now();
  try { const c = await figma.importComponentByKeyAsync(kitProbeKey); pass('kit reachable', `imported "${c.name}" in ${Date.now() - t0}ms`); }
  catch (e) { fail('kit reachable', `kit probe import failed: ${e.message}. Is the kit library enabled in this file and published?`); }

  // 3. Leftovers on the current page
  out.page = figma.currentPage.name;
  const probes = figma.currentPage.findAll(n => n.name === '_probe');
  if (probes.length) out.warnings.push(`${probes.length} "_probe" frame(s) left behind: ${probes.map(p => p.id).join(', ')} — remove them`);
  if (screenName) {
    const found = figma.currentPage.findAll(n => n.type === 'FRAME' && n.name.startsWith(screenName)).map(n => ({ id: n.id, name: n.name, parent: n.parent.name }));
    if (found.length) { out.warnings.push(`${found.length} frame(s) already named "${screenName}…" — a prior call may have built it; edit or delete rather than build a second copy`); out.existing = found; }
    else pass('no leftovers', `nothing named "${screenName}…" on "${out.page}"`);
  }

  out.summary = out.blocked ? 'BLOCKED — fix the failing check; create nothing' : `ready (${out.warnings.length} warning${out.warnings.length === 1 ? '' : 's'})`;
  return out;
}
