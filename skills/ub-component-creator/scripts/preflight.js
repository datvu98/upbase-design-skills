// ─────────────────────────────────────────────────────────────────────────────
// Preflight — paste at the top of the FIRST figma_execute call of any build,
// in either mode, before a single node is created.
//
// Every check here exists because the failure it catches is SILENT: the call
// succeeds, the report says fine, and the damage is discovered later. None of
// these is caught by reading the canvas, and none is caught by any audit script,
// because the audits run after the work.
//
//   const pf = await preflight({
//     mode: 'source',                        // or 'kit'
//     fileKey: 'BoGaG48v9BfY7LkMtFs4zh',     // what you INTENDED to write to
//     building: 'Segmented',                 // root name you are about to create
//   });
//   if (pf.blocked) return pf;               // STOP — do not create anything
//   return pf;                               // otherwise read the warnings, then build
//
// `blocked` means a check failed that makes every subsequent write wrong. Do not
// work around it; re-pin, re-read the mode file, or ask. A warning is yours to
// weigh — leftover nodes usually mean a prior call timed out and kept going.
// ─────────────────────────────────────────────────────────────────────────────

async function preflight({ mode, fileKey, building = null } = {}) {
  const out = { mode, blocked: false, checks: [], warnings: [] };
  const fail = (name, detail) => { out.blocked = true; out.checks.push({ name, ok: false, detail }); };
  const pass = (name, detail) => out.checks.push({ name, ok: true, detail });

  if (mode !== 'source' && mode !== 'kit') {
    fail('mode', `mode must be 'source' or 'kit', got ${JSON.stringify(mode)} — resolve it from the target file key first`);
    return out;
  }
  if (!fileKey) {
    fail('fileKey', 'pass the fileKey you intend to write to; without it this check is worthless');
    return out;
  }

  await figma.loadAllPagesAsync();

  // ── 1. Am I actually in the file I think I am? ──────────────────────────────
  // The active target moves on its own. A write into the wrong open file is silent.
  const actualKey = typeof figma.fileKey === 'string' ? figma.fileKey : null;
  if (actualKey === null) {
    out.warnings.push(`figma.fileKey unavailable — could not prove the file. Root is "${figma.root.name}". Verify by eye before writing.`);
    pass('file identity', `unproven; root name "${figma.root.name}"`);
  } else if (actualKey !== fileKey) {
    fail('file identity', `WRONG FILE. Intended ${fileKey}, actually in ${actualKey} ("${figma.root.name}"). Re-pin with figma_navigate lock:true and pass fileKey on every call.`);
  } else {
    pass('file identity', `${actualKey} ("${figma.root.name}")`);
  }

  // ── 2. Does the file behave like the mode says it should? ───────────────────
  // Source resolves locally; a kit's local collections are empty even after
  // importing. Zeros are a red alert in one mode and correct in the other —
  // which is exactly why picking the wrong preamble fails quietly.
  const localCols = await figma.variables.getLocalVariableCollectionsAsync();
  const localTexts = await figma.getLocalTextStylesAsync();
  const names = localCols.map(c => c.name);
  const hasSourceCollections = ['Colors', 'Dimensions', 'Typography', 'Components']
    .every(n => names.some(c => c.includes(n)));

  if (mode === 'source') {
    if (localCols.length === 0) {
      fail('mode coherence', 'Source mode but ZERO local variable collections — the target drifted to another file. Do not create anything; re-pin.');
    } else if (!hasSourceCollections) {
      fail('mode coherence', `Source mode but the four collections are not all present. Found: ${names.join(' · ')}`);
    } else {
      pass('mode coherence', `${localCols.length} local collections, ${localTexts.length} local text styles — local lookup works, use scripts/source/helpers.js`);
    }
  } else {
    if (hasSourceCollections) {
      fail('mode coherence', `Kit mode but UpBase's own collections are LOCAL here (${names.join(' · ')}) — you are in the source library, not a kit. Read references/source/mode.md.`);
    } else {
      pass('mode coherence', `${localCols.length} local collections — empty/foreign is correct in a kit; resolve by key with scripts/kit/resolve-remote.js`);
    }
  }

  // ── 3. Can a kit actually reach the library it consumes? ────────────────────
  // A wrapper built against an unreachable library looks right and binds nothing.
  if (mode === 'kit' && !out.blocked) {
    try {
      const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      const upbase = cols.filter(c => c.libraryName && /upbase/i.test(c.libraryName));
      if (upbase.length === 0) {
        fail('library reachable', `No UpBase collection in the team library. Available: ${cols.map(c => c.libraryName).join(' · ') || '(none)'}. The kit is not subscribed, or the library is unpublished — importing by key will fail silently.`);
      } else {
        pass('library reachable', `${upbase.length} UpBase collection(s) available for import`);
      }
    } catch (e) {
      fail('library reachable', `teamLibrary lookup threw: ${e.message}`);
    }
  }

  // ── 4. Did a previous call time out and keep going? ─────────────────────────
  // figma_execute caps at 30s, and a timeout is NOT a rollback — the plugin
  // usually finishes anyway. Re-running the same build then duplicates it.
  if (building) {
    const needle = String(building).toLowerCase();
    const found = [];
    for (const p of figma.root.children) {
      for (const n of p.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET', 'FRAME'] })) {
        if (n.name.toLowerCase().includes(needle)) {
          found.push({ page: p.name, name: n.name, type: n.type, id: n.id });
          if (found.length >= 25) break;
        }
      }
      if (found.length >= 25) break;
    }
    if (found.length) {
      out.warnings.push(`${found.length} node(s) already match "${building}". If a prior call timed out, these are its output — reuse or delete them rather than building a second copy.`);
      out.existing = found;
    } else {
      pass('no leftovers', `nothing on canvas matches "${building}"`);
    }
  }

  out.summary = out.blocked
    ? 'BLOCKED — do not create anything; fix the failing check first.'
    : `ready (${out.warnings.length} warning${out.warnings.length === 1 ? '' : 's'})`;
  return out;
}
