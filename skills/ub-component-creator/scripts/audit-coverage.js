// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 — token/style coverage for one page's component sets.
// Paste into figma_execute and set PAGE_MATCH below.
//
// Instances are excluded on purpose: an instance's padding, radius and fills
// reflect its MAIN component, so counting them measures someone else's work and
// sends you chasing values you never wrote.
//
// Targets: fills, text styles, effect styles and stroke width should all be
// 100% — they have no legitimate exceptions. Padding/gap/radius land lower
// because some values genuinely have no token; the `remainingRaw` breakdown
// lets you justify each one rather than hand-wave the percentage.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_MATCH = /chat/i;   // ← set to the page you're auditing

await figma.loadAllPagesAsync();
const page = figma.root.children.find(p => PAGE_MATCH.test(p.name));
if (!page) return { error: 'page not found — check PAGE_MATCH', pages: figma.root.children.map(p => p.name) };
await figma.setCurrentPageAsync(page);

const tally = { fills: [0, 0], text: [0, 0], effects: [0, 0], stroke: [0, 0],
                padding: [0, 0], gaps: [0, 0], radius: [0, 0] };
const remainingRaw = { gap: {}, padding: {}, radius: {} };
const rawColours = [], rawShadows = [], unstyledText = [];

const insideInstance = n => {
  if (n.type === 'INSTANCE') return true;
  let p = n.parent;
  while (p) { if (p.type === 'INSTANCE') return true; p = p.parent; }
  return false;
};

// Recursive: a two-level scan silently misses any set nested one frame deeper,
// and reports a clean bill of health for a page it never opened.
const sets = [];
const collect = (node, section) => {
  for (const c of (node.children || [])) {
    if (c.type === 'COMPONENT_SET') sets.push({ section, set: c });
    else if (['SECTION', 'FRAME', 'GROUP'].includes(c.type)) collect(c, section);
  }
};
for (const sec of page.children) collect(sec, sec.name);

for (const { set } of sets) {
  for (const n of [set, ...set.findAll(() => true)]) {
    if (insideInstance(n)) continue;
    const bv = n.boundVariables || {};

    if ('fills' in n && Array.isArray(n.fills))
      for (const f of n.fills)
        if (f.type === 'SOLID') {
          const bound = f.boundVariables && f.boundVariables.color;
          tally.fills[bound ? 0 : 1]++;
          if (!bound) rawColours.push(`${set.name} → ${n.name}`);
        }

    if (n.type === 'TEXT') {
      const styled = n.textStyleId && n.textStyleId !== '';
      tally.text[styled ? 0 : 1]++;
      if (!styled) unstyledText.push(`${set.name} → ${n.name}: "${String(n.characters).slice(0, 28)}"`);
    }

    if ('effects' in n && n.effects && n.effects.length) {
      tally.effects[n.effectStyleId ? 0 : 1]++;
      if (!n.effectStyleId) rawShadows.push(`${set.name} → ${n.name}`);
    }

    // COMPONENT_SET carries Figma's own dashed boundary at weight 2 — canvas
    // chrome, not geometry you authored. Counting it reported 78% on a page that
    // was actually at 100%, once per set. Same exclusion as radius below.
    if (n.type !== 'COMPONENT_SET' && 'strokes' in n && Array.isArray(n.strokes) && n.strokes.length) {
      // strokeWeight is unbindable once per-side weights differ — accept any side
      const bound = ['strokeWeight','strokeTopWeight','strokeBottomWeight',
                     'strokeLeftWeight','strokeRightWeight'].some(k => bv[k]);
      tally.stroke[bound ? 0 : 1]++;
    }

    // Same exclusion as radius and stroke below: a COMPONENT_SET container carries
    // Figma's own padding around the variants and its own gap between them. Counting
    // them reported 0–57% padding on seven pages that were all actually at 100%, and
    // filled `remainingRaw` with 40s and 16s nobody wrote and nobody can bind.
    if (n.type !== 'COMPONENT_SET') {
      for (const k of ['paddingLeft','paddingRight','paddingTop','paddingBottom'])
        if (typeof n[k] === 'number' && n[k] > 0) {
          if (bv[k]) tally.padding[0]++;
          else { tally.padding[1]++; remainingRaw.padding[n[k]] = (remainingRaw.padding[n[k]] || 0) + 1; }
        }

      if (typeof n.itemSpacing === 'number' && n.itemSpacing > 0) {
        if (bv.itemSpacing) tally.gaps[0]++;
        else { tally.gaps[1]++; remainingRaw.gap[n.itemSpacing] = (remainingRaw.gap[n.itemSpacing] || 0) + 1; }
      }
    }

    // component-set containers carry Figma's default 5px radius — canvas chrome, not geometry
    if (n.type !== 'COMPONENT_SET')
      for (const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])
        if (typeof n[k] === 'number' && n[k] > 0) {
          if (bv[k]) tally.radius[0]++;
          else { tally.radius[1]++; remainingRaw.radius[n[k]] = (remainingRaw.radius[n[k]] || 0) + 1; }
        }
  }
}

const fmt = ([a, b]) => `${a}/${a + b}` + (a + b ? ` (${Math.round(a / (a + b) * 100)}%)` : '');

return {
  page: page.name,
  sets: sets.map(s => ({ section: s.section, name: s.set.name,
    variants: s.set.children.length,
    props: Object.keys(s.set.componentPropertyDefinitions).filter(k => k.includes('#')).length,
    described: (s.set.descriptionMarkdown || '').length > 0 })),
  coverage: {
    fills: fmt(tally.fills), textStyles: fmt(tally.text), effectStyles: fmt(tally.effects),
    strokeWidth: fmt(tally.stroke), padding: fmt(tally.padding), gaps: fmt(tally.gaps),
    radius: fmt(tally.radius),
  },
  // these three should always be empty — investigate anything listed
  mustBeEmpty: {
    rawColours: [...new Set(rawColours)].slice(0, 10),
    rawShadows: [...new Set(rawShadows)].slice(0, 10),
    unstyledText: [...new Set(unstyledText)].slice(0, 10),
  },
  // Every entry here must appear under `Raw values` in the component description
  // with a reason. Unexplained is a defect; explained is a decision.
  remainingRaw,
};
