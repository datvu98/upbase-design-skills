// ─────────────────────────────────────────────────────────────────────────────
// audit-wrappers — health of every kit wrapper, and drift against its UpBase source.
//
// Run via figma_execute with the KIT's fileKey (from references/kit/<kit>.md).
// Read-only: creates nothing, changes nothing.
//
// Run it after building, and again after every UpBase update you accept —
// drift is invisible on the canvas. A wrapper whose source gained an axis looks
// exactly the same as one that didn't.
// ─────────────────────────────────────────────────────────────────────────────

const ONLY_PAGE = null;   // e.g. '❖ Button' to audit one page; null = whole file

await figma.loadAllPagesAsync();

const results = [];
const summary = { wrappers: 0, compositions: 0, clean: 0, withIssues: 0, drifted: 0 };

for (const page of figma.root.children) {
  if (ONLY_PAGE && page.name !== ONLY_PAGE) continue;

  const roots = [
    ...page.findAllWithCriteria({ types: ['COMPONENT_SET'] }),
    ...page.findAllWithCriteria({ types: ['COMPONENT'] })
      .filter(c => !c.parent || c.parent.type !== 'COMPONENT_SET'),
  ];

  for (const root of roots) {
    if (root.name.startsWith('_')) continue;   // local _Docs scaffolding

    const desc = root.description || '';
    // Classify across EVERY variant, not just the first. A set whose variants
    // differ in structure — some with a label, some without — is a composition,
    // and judging it from children[0] alone reports it as a broken wrapper and
    // emits a cascade of false positives. (Found by the FilterBar build.)
    const shells = root.type === 'COMPONENT_SET' ? root.children : [root];
    const shellInfo = [];
    for (const sh of shells) {
      const remote = [];
      for (const i of (sh.children || []).filter(n => n.type === 'INSTANCE')) {
        const m = await i.getMainComponentAsync();
        if (m && m.remote) remote.push({ inst: i, main: m });
      }
      shellInfo.push({ shell: sh, remote, childCount: (sh.children || []).length });
    }

    // A wrapper is one remote instance and nothing else — in EVERY variant.
    const isWrapper = shellInfo.length > 0 &&
      shellInfo.every(s => s.remote.length === 1 && s.childCount === 1);
    const remoteTop = shellInfo[0] ? shellInfo[0].remote : [];
    const shell = shellInfo[0] ? shellInfo[0].shell : root;

    const entry = {
      page: page.name,
      name: root.name,
      id: root.id,
      kind: isWrapper ? 'wrapper' : 'composition',
      issues: [],
    };

    if (!isWrapper) {
      summary.compositions++;
      entry.remoteInstances = remoteTop.length;
      entry.totalChildren = (shell.children || []).length;
      if (remoteTop.length === 0 && root.type !== 'COMPONENT_SET') {
        entry.issues.push('No remote UpBase instance anywhere — is this hand-built? It may belong in UpBase.');
      }
      if (!desc.trim()) entry.issues.push('Description empty — Figma asset search matches description text.');
      entry.issues.length ? summary.withIssues++ : summary.clean++;
      results.push(entry);
      continue;
    }

    summary.wrappers++;
    const { inst, main } = remoteTop[0];
    const sourceSet = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : null;

    entry.source = {
      set: sourceSet ? sourceSet.name : main.name,
      key: sourceSet ? sourceSet.key : main.key,   // the component-set key
      variantKey: main.key,                         // the key of the exact variant nested
      liveAxes: sourceSet ? Object.keys(sourceSet.variantGroupProperties || {}) : [],
    };
    entry.nested = {
      layerName: inst.name,
      isExposedInstance: inst.isExposedInstance,
      forwardedProps: Object.keys(inst.componentProperties || {}).length,
    };
    // Sizing lives on the VARIANT, never on the set — a COMPONENT_SET has no
    // auto-layout, so comparing root.layoutSizing* to the child always reports
    // a mismatch. Check each variant against its own nested instance.
    entry.sizing = shellInfo.map(s => ({
      variant: s.shell.name,
      wrapper: { h: s.shell.layoutSizingHorizontal, v: s.shell.layoutSizingVertical },
      nested:  { h: s.remote[0].inst.layoutSizingHorizontal, v: s.remote[0].inst.layoutSizingVertical },
    }));

    // ── 1. exposure — required on every variant, not just the first ──────────
    const unexposed = shellInfo.filter(s => !s.remote[0].inst.isExposedInstance);
    if (unexposed.length) {
      entry.issues.push(`NOT EXPOSED on ${unexposed.length}/${shellInfo.length} variant(s) ` +
        `(${unexposed.map(s => s.shell.name).join(', ')}) — consumers get an empty properties ` +
        `panel. Set isExposedInstance = true on the nested instance.`);
    }

    // ── 2. layer name is the public API ──────────────────────────────────────
    if (inst.name === entry.source.set) {
      entry.issues.push(`Nested layer still named "${inst.name}" — the exposed property group ` +
        `shows UpBase's vocabulary. Rename it to the product-facing word.`);
    }

    // ── 3. sizing: flag only the pairing that actually breaks ────────────────
    // Exact equality is the wrong test. FIXED wrapper + FILL child is correct —
    // the child fills a wrapper pinned to its natural width. The defect this rule
    // exists for is a HUG wrapper capping a child that wants to FILL, because the
    // wrapper then never grows and the child is silently pinned to its minimum.
    const caps = (w, n) => w === 'HUG' && n === 'FILL';
    const badSizing = entry.sizing.filter(s =>
      caps(s.wrapper.h, s.nested.h) || caps(s.wrapper.v, s.nested.v));
    if (badSizing.length) {
      entry.issues.push(`HUG wrapper caps a FILL child on ${badSizing.length} variant(s): ` +
        badSizing.map(s => `${s.variant} ${s.wrapper.h}/${s.wrapper.v} vs child ${s.nested.h}/${s.nested.v}`).join(' · ') +
        `. Mirror the source's sizing, or set the wrapper FIXED.`);
    }

    // ── 4. description and Source block ──────────────────────────────────────
    if (!desc.trim()) {
      entry.issues.push('Description empty — not findable by asset search, no Source record.');
    } else {
      const hasSource = /(^|\n)\s*Source\s*\n/.test(desc);
      if (!hasSource) {
        entry.issues.push('Description has no Source block — nothing records what this wraps.');
      } else {
        // Either key is valid: a wrapper usually cites the component-SET key,
        // while a composition cites the exact VARIANT key it instanced. Accept
        // both, and only complain when neither appears.
        const cited = desc.match(/[0-9a-f]{40}/gi) || [];
        const ok = cited.includes(entry.source.key) || cited.includes(entry.source.variantKey);
        if (!ok) {
          entry.issues.push(`Source block cites no key matching the nested instance — ` +
            `found ${cited.length ? cited.join(', ') : '(none)'}; expected the set key ` +
            `${entry.source.key} or the variant key ${entry.source.variantKey}.`);
        }
      }
    }

    // ── 5. axis drift ────────────────────────────────────────────────────────
    // The description records the axes at build time; the source is live. If
    // UpBase has added or removed one since, the wrapper's docs are now wrong
    // and a curated set (if that's what this is) is missing combinations.
    const axisMatch = desc.match(/\((\d+)\s+ax[ei]s\s*\(([^)]*)\)/i) ||
                      desc.match(/(\d+)\s+ax[ei]s\s*\(([^)]*)\)/i);
    if (axisMatch && entry.source.liveAxes.length) {
      const recorded = axisMatch[2].split('·').map(s => s.trim()).filter(Boolean);
      const live = entry.source.liveAxes;
      const added   = live.filter(a => !recorded.includes(a));
      const removed = recorded.filter(a => !live.includes(a));
      if (added.length || removed.length) {
        summary.drifted++;
        entry.drift = { recorded, live, added, removed };
        entry.issues.push(`AXIS DRIFT since this wrapper was made — ` +
          (added.length ? `UpBase added ${added.join(', ')}. ` : '') +
          (removed.length ? `UpBase removed ${removed.join(', ')}. ` : '') +
          `Update the Source block, and regenerate if this is a curated set.`);
      }
    } else if (entry.source.liveAxes.length && !axisMatch) {
      entry.issues.push('Source block records no axis list — drift cannot be detected for this wrapper.');
    }

    entry.issues.length ? summary.withIssues++ : summary.clean++;
    results.push(entry);
  }
}

// Worst first — an unexposed wrapper is more urgent than a missing keyword.
const weight = e => (e.issues.some(i => i.startsWith('NOT EXPOSED')) ? 0
                  : e.issues.some(i => i.startsWith('AXIS DRIFT')) ? 1
                  : e.issues.length ? 2 : 3);
results.sort((a, b) => weight(a) - weight(b) || a.name.localeCompare(b.name));

return {
  file: figma.root.name,
  summary,
  ok: summary.withIssues === 0,
  results,
};
