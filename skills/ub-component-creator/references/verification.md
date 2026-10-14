# Verification procedure

> **Scope: both modes.** Everything here applies whether you are authoring UpBase or composing a
> kit. Two of the scripts it names do not: `scripts/source/audit-system.js` is Source-only and
> `scripts/kit/audit-wrappers.js` is Kit-only, and each is marked where it appears.

Components that look right in a screenshot routinely fail at Compact density, at a narrow width, or
with real content. Each step below exists because it caught something a visual check had passed.

## 1. Screenshot every set

```
figma_capture_screenshot with the set's nodeId
```

Use this rather than the REST-backed tools — it reads live plugin state, so it reflects changes you
just made, and it doesn't need an access token.

Look for the specific failures that show up as *plausible* renders:

- Solid filled squares where icons should be (fill-walk painted the container)
- Text that reads as truncated placeholder ("Avat" instead of "AC") — an instance override was lost
- Two states that look identical (4% vs 6% black is not a distinguishable hover/selected pair)
- Elements that lose alignment when a sibling is hidden
- Something invisible because it's white-on-white — check the set's own frame fill

## 2. Sweep the density mode

Reasoning about density response does not work. Test it. Build a frame with instances and pin the
mode explicitly on them:

**Don't throw this frame away.** It becomes the `Density scale` section of the component page —
full-size instances at Default and Compact — and it is the component's published density
documentation, not just a proof. See `references/source/page-template.md`, which also carries the delta table and the
rule that density is a mode and never a variant axis. Building it there in the first place means the
sweep and the documentation are the same piece of work. The deltas themselves go in the component
description under `Raw values`, not in a note on the canvas.

Density has **two modes, `Default / Compact`**, both pointer-device densities. A component that only
ships to mobile renders no Compact version at all (`references/source/page-template.md` carries that rule) — for
those, `Density scale` is a single Default instance and there is nothing to sweep.

```js
const cols   = await figma.variables.getLocalVariableCollectionsAsync();
const dimCol = cols.find(c => c.name.includes('Dimensions'));
const typCol = cols.find(c => c.name.includes('Typography'));

// pin Dimensions AND Typography together
for (const col of [dimCol, typCol]) {
  const mode = col.modes.find(m => m.name === 'Compact');
  inst.setExplicitVariableModeForCollection(col, mode.modeId);
}
```

**Pin both collections or neither.** Dimensions alone gives tightened controls still holding
Default-sized text — a state that exists nowhere in the system and reads as a rendering bug.

**Anything that fails to move is an unbound value.** Compact should visibly tighten type, padding and
control heights. If Compact looks identical to Default, spacing isn't bound and the component is
broken in a way no screenshot of Default mode will reveal.

The snippet works because the collections are **local**. If `getLocalVariableCollectionsAsync()`
returns `[]`, the target drifted to another file — re-pin it rather than working around it.

The sweep matters *most* on a component that nests other components. Nested instances respond to
modes on their own, so a screenshot in Default mode looks convincing while the handful of parts you
built yourself are the ones silently unbound.

## 2b. Sweep the breakpoints you declared

Two halves: a measurement, then a look.

**Measure first — `scripts/check-reflow.js`.** It narrows a throwaway instance across the
component's own width range, then re-runs at the design width with realistic text. **Every
`overflowPx` must be 0.** A non-zero result names the offending node, and a constant
`width + overflow` across the sweep means that node has a hard minimum it never goes below.

Probe the component's own widths, **not screen breakpoints** — a 380px support widget never
experiences 767px, so probing it there proves nothing and hides the defect.

**Then look.** For each breakpoint in the declaration, resize the example frame to just under it and
screenshot:

| Declared | What must actually happen |
|---|---|
| `stack` | The horizontal group becomes vertical. Not "wraps" — stacks |
| `collapse` | Labels drop, icons remain, the control keeps its function |
| `scroll-x` | The container holds its width and the content scrolls inside it — the page body must not scroll sideways |
| `swap → X` | The example frame shows `X`, not a squeezed version of this component |
| `dock` | The element is pinned to an edge, full-bleed |
| `hide` | Gone, and nothing below it has a gap where it was |
| `truncate` | Ellipsis appears at the *narrowest* declared width, not just the widest |
| `paginate` | Controls for moving between pages/steps are present and reachable |

Two failures this catches that nothing else does:

- **A declaration nobody implemented.** Auto-layout does not stack on its own; something has to be
  set to wrap or a variant has to be swapped. Writing `stack` doesn't make it happen.
- **A breakpoint declared at the wrong value.** `<768 stack` on a component that actually breaks at
  920 means every consumer inherits a layout bug at 800.

If a declared behaviour doesn't happen, fix **one of the two** — the component or the declaration —
and say which. Silently changing the line to match the bug is how the vocabulary loses its meaning.

## 3. Stress the content

Real data breaks components that lorem ipsum flatters. Run these against every text-bearing component:

| Case | What it catches |
|---|---|
| ~300-character string | Does it wrap at max-width, or stretch the container? Do pinned elements stay pinned? |
| Single character | Minimum width sane, or a lopsided box? |
| Emoji only | Line-height and vertical centring |
| Long unbroken URL | Overflow vs break |
| `99+` in a count | **Fixed-width badges clip here** — needs hug with a min-width floor |
| Longest realistic label | Truncation with ellipsis, at the *narrowest* container width |
| Empty / zero state | Is there one at all? |

Apply via `setProperties` with the real `#id` keys. If the content doesn't change, the override failed
— don't assume it worked.

## 4. Coverage audit

Run `scripts/audit-coverage.js`. Aim for **100% on fills, text styles, effect styles and stroke
width** — those have no legitimate exceptions. Padding, gaps and radius will land lower because some
values genuinely have no token.

Interpreting the remainder honestly matters more than the number:

- **Legitimate raw**: pill radius (must be height ÷ 2), a 2px optical gap, negative overlap, 6px inset,
  component-set container radius of 5 (Figma's own default), layout widths with no token.
- **Not legitimate**: any raw colour, any unbound text property, a shadow that isn't a style, a border
  width that isn't `lineWidth`, or a spacing value that *does* have a token.

Exclude instances — see `references/figma-api-gotchas.md`.

## 4b. Semantic spot-check — the thing coverage can't see

Coverage tells you a value is bound. It cannot tell you it is bound to the **right** token, and a
wrong-but-bound token scores 100%. Walk this list against what you built, using
`references/tokens.md` for anything not on it:

| If the component has… | It must bind |
|---|---|
| a surface that floats above the page (popup, dropdown, menu, modal, tooltip) | `colorBgElevated` + effect style `boxShadowSecondary` — **not** `colorBgContainer` |
| a line separating two things | `colorSplit` — not `colorBorder` / `colorBorderSecondary` |
| an outline around a shape | `colorBorder` |
| a control-sized corner (button, input, select) | `borderRadiusSM` — not `borderRadius` |
| a card or modal corner | `borderRadiusLG` |
| a dismissal or `allowClear` icon | `colorIcon` / `colorIconHover` |
| a meaningful icon | the same token as the text it belongs to — not `colorIcon` |
| a label sitting on a coloured fill | `colorTextLightSolid` (and a measured contrast ratio) |
| hover on an item inside a dropdown/menu/table | `controlItemBgHover` — not a `colorFill*` level |
| a checkbox/radio box | `controlInteractiveSize` — not a `controlHeight*` |
| two adjacent unselected states | levels that skip one — `colorFillQuaternary` + `colorFillSecondary`; 4% vs 6% is invisible |

Anything binding `colorBgBase`, `colorTextBase`, `sizeStep` or `sizeUnit` is a **defect** — those are
seed tokens, and antd's own doc says not to use them directly.

## 4c. Account for every raw value

The standard is **not "no raw values"** — some genuinely have no token, and `2. Dimensions` has none
for 2, 6, 7 or 10, nor any touch-density mode for a 44pt target. The standard is that **none is
unexplained**.

Take `remainingRaw` from `scripts/audit-coverage.js` and check each entry appears in the component's
`Raw values` block with a reason. Anything in the report but not in the description is a defect;
anything in the description but not the report is stale and should be removed.

Legitimate, when stated: pill radius (height ÷ 2), a 2px optical gap, negative overlap, a panel
width, a native touch target. Not legitimate, ever: a raw colour, an unstyled text node, a shadow
that isn't a style, a border width that isn't `lineWidth`, or a spacing value that *does* have a token.

## 5. Read back your own claims

Before reporting anything as fixed, re-read it in the same call and return the evidence. Stroke-weight
binding in particular reports success and does nothing when per-side weights are set.

## 6. Screenshot-iterate, then stop

Three rounds maximum. Past that you're guessing at things that need the user's eye. Timebox canvas
layout tidying especially — two attempts, then hand it over.

## Handover template

```
Verified
- <coverage numbers, contrast ratios, modes tested, stress cases run>
- <breakpoints swept, and whether each declared behaviour actually happened>
- <platform reach + the block 11 declaration, or why the component declares nothing>

Deliberately raw or omitted
- <value + why, so it doesn't read as an oversight>

Judgement calls for you
- <optical nudges, whether a colour reads right, anything needing an eye>

Yours to do
- Publish Ant Design Components — descriptions and changes don't reach consumers until you do,
  then product files accept the update. One hop.
```
