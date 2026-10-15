// ─────────────────────────────────────────────────────────────────────────────
// Preflight for a product file — paste at the top of the FIRST figma_execute of
// any build, before a single node is created. Read-only except for one
// component import (which only caches the kit component; nothing lands on canvas).
// Typical run: 1–5 s. The import is raced at 8 s, so a hung import no longer times the call out.
//
//   const pf = await preflightProduct({
//     fileKey: '9FAdrUvuA7q0VExwsAxNu6',           // the product file you intend to write to
//     kitProbeKey: 'ad019f17…',                     // any published kit component — from upbase/<product>/product-file.md
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

async function preflightProduct({ fileKey, screenName = null, kitProbeKey = null } = {}) {
  const out = { blocked: false, checks: [], warnings: [] };
  const fail = (name, detail) => { out.blocked = true; out.checks.push({ name, ok: false, detail }); };
  const pass = (name, detail) => out.checks.push({ name, ok: true, detail });

  if (!fileKey) { fail('fileKey', 'pass the product fileKey you intend to write to'); return out; }
  // Each product file consumes its own kit, so the probe comes from upbase/<product>/product-file.md ("Kit probe key").
  // UpS Product 2026 → UpS `Button / Basic` 'ad019f1790ab546845e50debf54d2bc5a710a6bf'.
  if (!kitProbeKey) { fail('kitProbeKey', 'pass kitProbeKey — the "Kit probe key" row of upbase/<product>/product-file.md'); return out; }

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
  // The import can hang without resolving or throwing (seen in UpS Product 2026, 2026-10-15), which used to
  // time the whole call out. Race it; on a hang, fall back to proving the kit is already resident in the file.
  const t0 = Date.now();
  const race = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r('__timeout'), ms))]);
  let probe;
  try { probe = await race(figma.importComponentByKeyAsync(kitProbeKey), 8000); }
  catch (e) { fail('kit reachable', `kit probe import failed: ${e.message}. Is the kit library enabled in this file and published?`); }
  if (probe && probe !== '__timeout') pass('kit reachable', `imported "${probe.name}" in ${Date.now() - t0}ms`);
  else if (probe === '__timeout') {
    // Any instance on this page whose main is a remote kit component shows the kit is resident.
    let resident = null, looked = 0;
    for (const inst of figma.currentPage.findAllWithCriteria({ types: ['INSTANCE'] })) {
      if (++looked > 60) break;
      const m = await inst.getMainComponentAsync();
      if (m && m.remote && !m.name.startsWith('_')) { resident = m.name; break; }
    }
    if (resident) { pass('kit reachable', `probe import hung (8s); kit is resident — e.g. "${resident}"`); out.warnings.push('Kit probe import hung. Reach kit components through existing instances (getMainComponentAsync().parent) rather than importing by key.'); }
    else out.warnings.push('Kit probe import hung (8s) and no kit instance was found on this page — kit reachability is unproven. Check the kit library is enabled in this file.');
  }

  // 3. Leftovers — on every page, at page level and inside sections (where screens live).
  // Searching only figma.currentPage passed whenever the user happened to be on another page.
  const probes = [], found = [];
  for (const pg of figma.root.children) {
    await pg.loadAsync();
    const tops = pg.children.flatMap(n => n.type === 'SECTION' ? [n, ...n.children] : [n]);
    for (const n of tops) {
      if (n.name === '_probe') probes.push(n.id);
      if (screenName && n.type === 'FRAME' && n.name.startsWith(screenName)) found.push({ id: n.id, name: n.name, page: pg.name.trim(), parent: n.parent.name });
    }
  }
  if (probes.length) out.warnings.push(`${probes.length} "_probe" frame(s) left behind: ${probes.join(', ')} — remove them`);
  if (screenName) {
    if (found.length) { out.warnings.push(`${found.length} frame(s) already named "${screenName}…" — a prior call may have built it, or it exists on purpose; check existing[] before building a second copy`); out.existing = found; }
    else pass('no leftovers', `no frame named "${screenName}…" on any page`);
  }

  out.summary = out.blocked ? 'BLOCKED — fix the failing check; create nothing' : `ready (${out.warnings.length} warning${out.warnings.length === 1 ? '' : 's'})`;
  return out;
}
