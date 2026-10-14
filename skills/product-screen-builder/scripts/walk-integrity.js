// ─────────────────────────────────────────────────────────────────────────────
// Integrity + provenance walk for a built screen. Read-only. Run it last.
//
//   const screen = await figma.getNodeByIdAsync('<screen id>');
//   return await walkIntegrity(screen);
//
// Reports:
//   nodes     — how many layers were reachable
//   broken    — layers whose handle throws on access (the stale-handle trap in
//               build-mechanics.md). Must be 0; otherwise re-create those instances.
//   topLevel  — the component behind every instance that isn't inside another
//               instance, with counts. Should list only kit components. Anything
//               unexpected (an UpBase atom placed directly, a leftover probe) shows here.
//   clippingFrames — structural frames (outside instances) that clip. The screen
//               frame clips on purpose; anything else here is worth a look — a
//               clipping row frame hides absolutely positioned counters/captions.
//
// Walks recursively, passing state down, so it stays fast on 2000+ layer screens.
// If it still times out, run it per region (e.g. the GridTable alone).
// ─────────────────────────────────────────────────────────────────────────────

async function walkIntegrity(root) {
  let nodes = 0; const broken = []; const topLevel = {}; const clipping = [];
  const walk = async (n, insideInstance) => {
    let kids;
    try { kids = 'children' in n ? n.children : []; } catch (e) { broken.push(n.id); return; }
    for (const c of kids) {
      nodes++;
      try { c.name; } catch (e) { broken.push(c.id); continue; }
      if (c.type === 'INSTANCE' && !insideInstance) {
        let label = '?';
        try { const m = await c.getMainComponentAsync(); const top = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m; label = top ? top.name : 'MISSING MAIN'; } catch (e) { label = 'ERR ' + e.message.slice(0, 40); }
        topLevel[label] = (topLevel[label] || 0) + 1;
      }
      if (c.type === 'FRAME' && !insideInstance && c.clipsContent && c !== root) clipping.push(c.name);
      await walk(c, insideInstance || c.type === 'INSTANCE');
    }
  };
  await walk(root, false);
  return {
    screen: root.name, size: `${Math.round(root.width)}×${Math.round(root.height)}`,
    nodes, broken: broken.length, brokenIds: broken.slice(0, 20), topLevel,
    clippingFrames: clipping,
    verdict: broken.length ? 'FAIL — stale handles; re-create those instances in a separate call' : 'pass',
  };
}
