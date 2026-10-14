// ─────────────────────────────────────────────────────────────────────────────
// Does this component survive a narrower container and longer content?
//
// ⚠️ This one WRITES: it creates a throwaway instance, resizes it, edits text,
// measures, and removes it. It cleans up on every path including failure.
// Everything else in scripts/ is read-only.
//
// WHAT IT PROBES, AND WHY NOT BREAKPOINTS
// A screen breakpoint is a property of the page, not of the component. A 380-wide
// support widget never experiences 767px, so probing it there proves nothing and
// hides the real defect. What matters is the component's OWN width range, plus
// whether real content fits at its design width.
//
// Two axes, because the failures split cleanly between them:
//   1. width sweep    — catches a hard floor inside that never shrinks
//   2. content stress — catches a px maxWidth wider than its own container
//
// `Chat / Widget / Panel` fails both: it holds at 380 with placeholder text, and
// overflows 104px at that same 380 once a message is a realistic length.
// ─────────────────────────────────────────────────────────────────────────────

const SET_MATCH = /Widget \/ Panel/;   // ← the component set to probe
const LONG = 'Sure, I can drive and I have room for three more people if anyone still needs a lift on Saturday morning.';

await figma.loadAllPagesAsync();

let target = null, host = null;
for (const page of figma.root.children) {
  const found = page.findOne(n => n.type === 'COMPONENT_SET' && SET_MATCH.test(n.name));
  if (found) { target = found; host = page; break; }
}
if (!target) return { error: 'no component set matched SET_MATCH' };

await figma.setCurrentPageAsync(host);
const master = target.defaultVariant || target.children[0];
const natural = Math.round(master.width);

// Relative to the component's own width, floored at 240 — narrower than that is
// not a realistic container. A component under ~200px wide has no width range
// worth sweeping at all: a Tag or a Badge is sized by content, not by container.
const widths = natural < 200 ? []
  : [...new Set([natural, Math.round(natural * 0.9), Math.round(natural * 0.75),
                 Math.round(natural * 0.6), Math.max(240, Math.round(natural * 0.5))])]
      .filter(w => w >= 200).sort((a, b) => b - a);

const probe = figma.createFrame();
probe.name = '_TEMP reflow probe';
probe.x = -20000; probe.y = -20000;
probe.fills = []; probe.clipsContent = false;
host.appendChild(probe);

// Overflow = how far the worst descendant sticks out past the instance's own
// bounds. Hidden nodes render nothing, so they cannot overflow.
//
// Visibility must be checked up the whole ancestor chain, not just on the node.
// Figma still lays out and reports an absoluteBoundingBox for a node inside a
// hidden parent, and that box is wherever auto-layout last left it — routinely
// outside the instance. Checking only `n.visible` reported a 12px overflow on a
// `Badge` that renders nowhere, on every variant with an optional element
// switched off. That is most of them.
// A node also cannot overflow the instance if something between it and the root
// CLIPS: it is cut off there, so nothing escapes and nothing renders outside.
// That is the normal state of a scrolling list — `Chat / Messenger / Thread`
// reported a 71px "failure" that was its message list correctly scrolling a
// longer conversation under a fixed-height frame. Counting it made a passing
// component look broken and buried the one real defect on the page.
const rendered = (n, root) => {
  // The ROOT's own clipping counts too, and omitting it is a blind spot for any
  // single-level component: the loop below stops AT the root, so a root that clips
  // was never checked and every child read as escaping. `ScrollBar` reported a 40px
  // overflow on all four variants for exactly this reason — its thumb is cut at the
  // track end by design, which is the component working, not failing.
  if (root.clipsContent) return false;
  let q = n;
  while (q && q !== root) {
    if (!q.visible) return false;
    if (q !== n && q.clipsContent) return false;
    q = q.parent;
  }
  return true;
};

const measure = inst => {
  const box = inst.absoluteBoundingBox;
  let worst = 0, who = null, axis = null;
  for (const n of inst.findAll(() => true)) {
    if (!rendered(n, inst)) continue;
    const b = n.absoluteBoundingBox;
    if (!b) continue;
    const right  = (b.x + b.width)  - (box.x + box.width);
    const bottom = (b.y + b.height) - (box.y + box.height);
    if (right  > worst) { worst = right;  who = n.name; axis = 'right'; }
    if (bottom > worst) { worst = bottom; who = n.name; axis = 'bottom'; }
  }
  return { overflowPx: Math.round(worst), node: who, axis };
};

const widthSweep = [], contentStress = [];
try {
  for (const w of widths) {
    const i = master.createInstance();
    probe.appendChild(i);
    try { i.resize(w, i.height); } catch (e) { /* fixed-size: measure as-is */ }
    const m = measure(i);
    widthSweep.push({ width: w, actual: Math.round(i.width), ...m, pass: m.overflowPx <= 0 });
    i.remove();
  }

  // Stress only text that is already free-form. Overwriting every string —
  // a ticket reference, a timestamp, a status label — reports a 852px overflow
  // that no real content could cause, and buries the honest finding.
  const i = master.createInstance();
  probe.appendChild(i);
  let edited = 0;
  const freeText = i.findAll(n => n.type === 'TEXT' && String(n.characters).trim().length >= 20);
  for (const t of freeText.slice(0, 6)) {
    try { await figma.loadFontAsync(t.fontName); t.characters = LONG; edited++; } catch (e) {}
  }
  const m = measure(i);
  contentStress.push({ width: natural, textNodesEdited: edited, ...m, pass: m.overflowPx <= 0 });
  i.remove();
} finally {
  probe.remove();
}

// A constant `width + overflow` across the sweep is the signature of a hard
// minimum inside the component — that sum is the floor it refuses to go below.
const sums = [...new Set(widthSweep.filter(r => r.overflowPx > 0).map(r => r.width + r.overflowPx))];
const hardFloor = sums.length === 1 ? sums[0] : null;

const failures = [...widthSweep, ...contentStress].filter(r => !r.pass);
return {
  set: target.name, page: host.name.trim(), naturalWidth: natural,
  widthSweep, contentStress,
  hardFloor: hardFloor ? `${failures[0] && failures[0].node} never shrinks below ${hardFloor}px` : null,
  failures: failures.length,
  verdict: failures.length ? 'FAILS — see failures above' : 'passes both axes',
};
