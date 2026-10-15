// ─────────────────────────────────────────────────────────────────────────────
// Responsive-declaration audit. Paste into figma_execute. Read-only.
//
// This validates declarations that EXIST — vocabulary, breakpoint values, and
// whether an example frame was actually drawn at each declared breakpoint. It
// does not decide whether a component *should* declare anything: that comes from
// the ask, not from a rule. A component with no declaration is not a defect.
//
// The unit is the ROOT component, not the component set — sub-parts inherit, and
// counting sets would inflate everything ~5x. See `SKILL.md` Phase 0c and Phase 6.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_MATCH = null;   // ← set to /regex/ to narrow, or leave null for the whole file

const VERBS = ['stack', 'collapse', 'scroll-x', 'swap', 'dock', 'hide', 'truncate', 'paginate'];
const SIZE_CLASSES = ['Compact', 'Medium', 'Expanded'];
const BREAKPOINTS = [480, 576, 768, 992, 1200, 1600];

await figma.loadAllPagesAsync();

// `❖` marks BOTH foundation pages and hand-built component pages (`❖ Chat`,
// `❖ Video player`, `❖ List`…), so skipping the prefix wholesale silently
// excluded every custom component from this audit. Skip by name instead.
const SKIP_EXACT = /^(cover|helpers?|icons?|assets?|foundation|illustrations|focus state|platform|-- (web|mobile|tablet)|updated components|ant components|ant design x)$/i;
const skipPage = p => {
  const n = p.name.trim().replace(/^[❖📋]\s*/, '');
  return SKIP_EXACT.test(n) || p.name.trim().includes('- - - -') || n === '';
};

const pages = figma.root.children.filter(p => !skipPage(p) && (!PAGE_MATCH || PAGE_MATCH.test(p.name)));

// ── collect every non-internal set ───────────────────────────────────────────
//
// Not "one root per page". That heuristic existed to size a retrofit backlog,
// which no longer exists — and it under-reports badly on a page holding a family
// rather than a single component: on `❖ Chat` it read 1 declaration of 10.
// Declarations are opt-in now, so read every set and report what declared.

const sets = [];
for (const page of pages) {
  const walk = n => {
    for (const c of (n.children || [])) {
      if (c.type === 'COMPONENT_SET') { if (!c.name.trim().startsWith('_')) sets.push({ page, set: c }); }
      else if (['SECTION', 'FRAME', 'GROUP'].includes(c.type)) walk(c);
    }
  };
  walk(page);
}

// ── validate whatever was declared ───────────────────────────────────────────

const lineOf = (text, label) => {
  const m = (text || '').match(new RegExp(`^\\s*${label}:\\s*(.+)$`, 'mi'));
  return m ? m[1].trim() : null;
};

// An example screen is a frame inside a SECTION named for examples — the
// convention `design-system-builder/references/page-template.md` already sets. Inferring it from "any frame
// outside a component" matched 5,109 frames library-wide, most of them layout
// scaffolding, so the breakpoint check passed on almost any busy page.
const exampleFramesOn = page => {
  const out = [];
  for (const sec of (page.children || [])) {
    if (sec.type !== 'SECTION' || !/example/i.test(sec.name)) continue;
    const walk = n => {
      for (const c of (n.children || [])) {
        if (c.type === 'FRAME') out.push(c);
        else if (['SECTION', 'GROUP'].includes(c.type)) walk(c);
      }
    };
    walk(sec);
  }
  return out;
};

const report = {
  setsScanned: sets.length,
  declared: 0,
  invalidVocab: [], reflowWritten: [], breakpointWithoutFrame: [], frameWidthNotBound: [],
  platformMismatch: [],
  declarations: [],
};

for (const { page, set } of sets) {
  const desc = set.descriptionMarkdown || set.description || '';
  const web = lineOf(desc, 'Web');
  const native = lineOf(desc, 'Native');
  // `Native: not in scope — Web only by decision` is a deliberate opt-out, not a declaration to
  // validate. Counting it as "no known verb" and a platform mismatch flagged correct components.
  const optOut = v => typeof v === 'string' && /^\s*not in scope\b/i.test(v);
  const has = v => typeof v === 'string' && v.trim() !== '' && !optOut(v);
  if (!has(web) && !has(native)) continue;

  report.declared++;
  report.declarations.push({ set: set.name, web: web || null, native: native || null });

  // iOS and Android are one target — `Mobile` is the word to write. `iOS`/`Android`
  // stay accepted because descriptions written before that rule still carry them;
  // they mean the same thing and aren't worth a library-wide rewrite to retire.
  const mobile = /^\s*Platforms?:.*\b(Mobile|Native|iOS|Android)\b/mi.test(desc);
  const frames = exampleFramesOn(page);
  const frameWidths = frames.map(n => Math.round(n.width));

  for (const [label, line] of [['Web', web], ['Native', native]]) {
    if (!has(line)) continue;
    for (const clause of line.split('·').map(s => s.trim()).filter(Boolean)) {
      if (/\breflow\b/i.test(clause))
        report.reflowWritten.push(`${set.name} → ${label}: "${clause}" — reflow is the silent default`);

      if (!clause.split(/\s+/).some(w => VERBS.includes(w.toLowerCase())))
        report.invalidVocab.push(`${set.name} → ${label}: "${clause}" uses no known verb`);

      if (label === 'Native') {
        if (!SIZE_CLASSES.some(c => clause.includes(c)))
          report.invalidVocab.push(`${set.name} → Native: "${clause}" names no window size class`);
        continue;
      }

      const n = clause.match(/[<≥](\d+)/);
      if (!n) continue;
      const bp = +n[1];
      if (!BREAKPOINTS.includes(bp))
        report.invalidVocab.push(`${set.name} → Web: ${bp} is not an Ant breakpoint`);

      // A tolerance window is the wrong test: `<768 stack` is demonstrated by a
      // frame NARROWER than 768, not one near it. An 834 frame shows the
      // un-stacked state and proves nothing.
      const below = clause.includes('<');
      const shown = frames.filter(f => below ? f.width < bp : f.width >= bp);
      if (!shown.length) {
        report.breakpointWithoutFrame.push(
          `${set.name} → declares ${clause} but no example frame ${below ? 'below' : 'at or above'} ${bp}px (page has ${
            [...new Set(frameWidths)].sort((x, y) => y - x).slice(0, 5).join(', ') || 'none'})`);
      } else if (!shown.some(f => f.boundVariables && f.boundVariables.width) &&
                 shown.every(f => Math.abs(f.width - bp) <= 48)) {
        // Only a frame sitting ON the band edge needs its width bound — that is the
        // one whose whole purpose is to prove the boundary, and an unbound one
        // proves it by coincidence.
        //
        // A DEVICE canvas does not: 390 is a phone, 1440 is a desktop, and both are
        // real widths a person sees rather than markers for a breakpoint. Demanding a
        // binding there pushed the Chat page towards a 767px "mobile" screen that no
        // device has, purely to satisfy this check. The band is already proven by 390
        // being under 768.
        report.frameWidthNotBound.push(
          `${set.name} → ${clause}: example frame "${shown[0].name}" sits on the ${bp}px edge at ${Math.round(shown[0].width)}px raw — bind width to the matching Size/Screen Size/screen*Max`);
      }
    }
  }

  if (has(native) && !mobile)
    report.platformMismatch.push(`${set.name}: Native line but no Mobile in Platforms`);
}

const cap = (a, n) => { const t = a.length; const o = a.slice(0, n);
  if (t > n) o.push(`…and ${t - n} more`); return o; };
for (const k of ['invalidVocab', 'reflowWritten', 'breakpointWithoutFrame', 'frameWidthNotBound', 'platformMismatch'])
  report[k] = cap(report[k], 25);
report.declarations = cap(report.declarations, 25);

return report;
