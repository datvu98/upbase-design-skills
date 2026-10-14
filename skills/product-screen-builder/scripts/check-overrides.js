// ─────────────────────────────────────────────────────────────────────────────
// Layout-override check for a built screen. Read-only. Run it with walk-integrity.js.
//
//   const screen = await figma.getNodeByIdAsync('<screen id>');
//   return await checkOverrides(screen);
//
// Why: an instance property set locally is an override, and Figma never syncs an
// overridden property from the library again. A CENTER alignment set on table cells
// (Xuất nhập 07, then copied by cloning to Kiểm kho 07/08 and Xuất nhập 10) survived
// the user's upstream fix UpBase → kit → product, and walk-integrity passed it.
//
// Checks every instance *placed on the screen* — directly in a frame, or as content
// of a SLOT at any depth — against its main component, on the layout fields below.
// Instance internals (a component's own sublayers) are not checked: those belong to
// the component. Sizes are not checked: widths and FILL/HUG are set per screen on
// purpose (column widths, fields).
//
//   diverged — instances whose field differs from the main. Each one is either a
//              defect (reset it to the main's value) or a deliberate exception the
//              user asked for; say which in the handover. Pass `allow` to silence a
//              known exception: { 'Action Cell': ['counterAxisAlignItems'] } by name.
// ─────────────────────────────────────────────────────────────────────────────

const OVERRIDE_FIELDS = [
  'layoutMode', 'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'layoutWrap',
];

async function checkOverrides(root, { allow = {}, limit = 40 } = {}) {
  const diverged = []; const byField = {}; let checked = 0;
  const mains = new Map();
  const mainOf = async inst => {
    if (!mains.has(inst.id)) mains.set(inst.id, await inst.getMainComponentAsync());
    return mains.get(inst.id);
  };
  const check = async inst => {
    let main; try { main = await mainOf(inst); } catch (e) { return; }
    if (!main) return;
    checked++;
    for (const f of OVERRIDE_FIELDS) {
      if (!(f in inst) || !(f in main)) continue;
      if ((allow[inst.name] || []).includes(f)) continue;
      if (inst[f] !== main[f]) {
        byField[f] = (byField[f] || 0) + 1;
        if (diverged.length < limit) diverged.push({ id: inst.id, name: inst.name, component: main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.name : main.name, field: f, instance: inst[f], main: main[f] });
      }
    }
  };
  // placed = this node was put here by the screen, not by a component's own structure
  const walk = async (n, placed) => {
    let kids; try { kids = 'children' in n ? n.children : []; } catch (e) { return; }
    for (const c of kids) {
      if (c.type === 'SLOT') { await walk(c, true); continue; }
      if (c.type === 'INSTANCE') { if (placed) await check(c); await walk(c, false); continue; }
      await walk(c, placed);
    }
  };
  await walk(root, true);
  const total = Object.values(byField).reduce((a, b) => a + b, 0);
  return {
    screen: root.name, instancesChecked: checked, overrides: total, byField,
    diverged,
    verdict: total ? `REVIEW — ${total} layout override(s); reset each to the main's value unless the user asked for it` : 'pass',
  };
}
