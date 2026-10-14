---
name: product-screen-builder
description: Build, annotate or redesign product screens in a UpBase product design file (UpS Product 2026, or any product registered under references/products/), assembled only from the product's UI kit instances. Use it to recreate a screen from a screenshot or reference image ("rebuild this screen", "build the screens under Kho hàng"), rebuild a flow's states (errors, modals, tabs), map a screen's anatomy to kit components or draw callouts naming them, make an improved / "tasteful" / proposal version of an existing screen with Mobbin references, or log where the kit can't match a screen. Use it whenever someone pastes a product file link or names a product module, even without saying "screen". Do not use it to create or change components: kit components are ui-kit-builder, UpBase components are design-system-builder.
---

# Product screen builder

Screens in a product file are **compositions of kit instances**, never components. The kit decides
how every part looks. This skill decides which parts, how they're configured and arranged, and
records every place the kit can't do what the screen needs.

```
UpBase Design System ──publish──▶ product UI kit ──publish──▶ product design files
design-system-builder               ui-kit-builder              product-screen-builder
```

| The request is about… | Skill |
|---|---|
| a screen, a flow, an anatomy, a redesign | **this skill** |
| a component the kit lacks, or a kit component that needs a slot, variant or property | `ui-kit-builder` |
| how a UpBase atom looks | `design-system-builder` |

**Never hand-draw what the kit is missing.** The drawing is invisible to every other screen and
silently drifts from the kit. Log it as a gap and hand the component change to `ui-kit-builder`.

Paths below are relative to this skill's folder (`${CLAUDE_SKILL_DIR}`). Shared files are in
`${CLAUDE_SKILL_DIR}/../_shared/`, shortened here to `_shared/`.

## Step 0: Which product, which mode?

The product is identified by the **file key** of the write target, never by a module name. Find its
data file:

```
grep -l "<file key>" ${CLAUDE_SKILL_DIR}/references/products/*.md
```

- **One match**: read it, then the kit map it names (`references/kit-maps/<kit>.md`). The data file
  holds the pages and sections, the screen register, the shared shell, harvested tokens and the gap
  log path. UpS Product 2026 (`9FAdrUvuA7q0VExwsAxNu6`) → `products/ups-product-2026.md` +
  `kit-maps/ups-ui-kit.md`.
- **No match**: not registered. Stop and offer to register it with the user from
  `references/products/_template.md` (and `kit-maps/_template.md` for a new kit). Never borrow UpS's
  data: its node ids, keys and harvested tokens are wrong in any other file.
- **A kit or the UpBase key**: wrong skill (table above).

**The mode** comes from what the user asked for. Unsure between Rebuild and Proposal? Ask: they have
opposite rules about matching the reference.

| Mode | The user says | Output | Read |
|---|---|---|---|
| **Rebuild** | "rebuild / recreate / redraw this screen", "build the screens under X" | a faithful screen of kit instances | `references/rebuild-mode.md` |
| **Proposal** | "improve", "make it tasteful", "redesign", "what can we do better" | an improved screen beside the faithful one | `references/proposal-mode.md` |
| **Anatomy** | "draw the anatomy", "which components is this" | labelled callouts on a copy of the reference | `references/anatomy-mode.md` |

**In every mode, content comes from the reference and form comes from the component.** Keep every
word, value and state the reference shows. Each kit component keeps its own parts and styles: a
dialog shipped without a title gets one written from context, ALL-CAPS button text takes the
button's sentence case, a form label keeps its ":". List each difference in the handover instead of
hiding a component's parts to match the screenshot.

## Step 1: Pin the file and run preflight

```
figma_list_open_files                      → is the product file connected?
figma_navigate <product url>, lock: true   → pin it
```

If the file isn't listed, the Desktop Bridge plugin isn't open in it. Ask the user to open it
(Plugins → Development → Figma Desktop Bridge). Pass `fileKey` on **every** `figma_execute`: several
files are connected at once, and a write into the kit or UpBase is silent and expensive.

Run `scripts/preflight-product.js` first, with `kitProbeKey` from the data file's **Kit probe key**
row. It proves the file, that the kit library resolves, and that a timed-out earlier call didn't
already build this screen.

## Step 2: Read the reference (read-only)

Screenshot the reference at a scale where text is legible (`figma_capture_screenshot`, scale ≈1.2–2
on a ~1340px image). Write down the **exact** content: every label, placeholder, count and state,
which toggle is on, which radio is checked, which fields are in error and what the error says.
Screens in one module are usually variants of each other, so diff against the screens already built
(the data file's *Screen register*) before planning from scratch.

## Step 3: Map the anatomy to kit components

Region by region: the kit component, its variant and property settings, and the content. The kit
map has the mapping, keys, property keys and agreed configurations. **Established usage beats the
reference**: configure a component the way the other screens do, and list the difference
(`references/rebuild-mode.md`).

Enumerate the kit before concluding something is missing. Most "missing" things are a slot fill, a
variant, or a component under another name (`_shared/references/upbase-library.md` › *What UpBase
calls things*). What the kit genuinely can't express is a **gap**. Check the kit's gap log first
(path in the data file), because it may already have an agreed workaround.

## Step 4: Propose, then stop

Post the proposal **in chat** and wait for approval before building. The user may waive this for a
batch ("build it straight"). The waiver covers that batch only.

```
**Target**: frame name · size · section · position
**Reuse**: which built screen it's cloned from, and what changes
**Anatomy**: region → kit component (settings) · content, one line each
**Layout**: structure and the spacing tokens it binds
**Gaps**: each place the kit can't match, the workaround, and the GAP id (new or existing)
**Needs a kit change?**: anything that should go to ui-kit-builder or design-system-builder instead
**Questions**: real decisions only, each with a recommendation
```

If a deviation turns up mid-build that the proposal didn't cover, stop and ask.

## Step 5: Build in stages

Read `references/build-mechanics.md` before the first write. Build in this order, one stage per
call, because a node created in the same call as the slot it goes into gets a stale handle that
crashes later traversals:

1. **Shell**: clone a finished screen of the same module when one exists. It carries the header,
   navigation, banners and floating buttons already configured (the data file's *Shell*).
2. Empty structural frames inside slots.
3. Instances into those frames, one region per call.
4. Content, states, truncation.

Use `scripts/helpers.js` for property setting with error collection, form fields, error states and
truncation. Bind every spacing value to a harvested token (`scripts/harvest-tokens.js`), because a
product file can't import variables. UpBase-direct instances are allowed only for icons swapped
through a kit component's own instance-swap property.

## Step 6: Verify

- `scripts/walk-integrity.js`: **0 unreadable nodes**, and the top level lists only kit components.
- `scripts/check-overrides.js`: **0 layout overrides**, or each one named in the handover as
  something the user asked for. An overridden property never syncs from the kit again, so a stray
  override silently blocks the next upstream fix, and cloning copies it to every sibling.
- **Measure edges** after restructuring a cloned frame, against the same region on a sibling screen
  (`build-mechanics.md` › *Measuring what you built*).
- Screenshot the result next to the reference and compare region by region: text, states, counts,
  alignment, overlaps (floating buttons are the usual offender). Say what you compared. Don't report
  "matches" from the tree alone.

## Step 7: Log and hand over

1. **Gap log**: append every new gap in its entry format, and update the status of ones you hit.
2. **Screen register**: update the data file (screen → node id → notes). A configuration rule the
   user agreed on goes in the kit map.
3. **Changelog**: paste `_shared/scripts/changelog/changelog.js` into `figma_execute` with the product
   `fileKey`, then call
   `addChangelogEntry({ date, title, author: '<your name> · with Claude', status: null, sections, saveVersion: true })`.
   Name and link each screen you added or changed. Cross-link any kit or UpBase entry the work sent
   upstream. Anatomy-only sessions aren't logged.
4. **Report**, in this order:
   1. **Where**: screen name, size, section.
   2. **What's there**: region by region, briefly.
   3. **Verified**: the Step 6 checks, with numbers.
   4. **Differs from the reference**: every deviation and why (gap id), including ones inherited
      from the screen you cloned.
   5. **Decisions for the user**: real ones only.

If a build needs a kit component that isn't published ("Could not find a published component"),
check its publish status in the kit and ask the user to publish. Don't work around it. Publishing is
always a person's action.

## Reference map

| File | Open it at |
|---|---|
| `references/products/<product>.md` | Step 0, always |
| `references/kit-maps/<kit>.md` | Steps 0 and 3 |
| `references/products/_template.md` · `kit-maps/_template.md` | registering a product |
| `references/rebuild-mode.md` · `proposal-mode.md` · `anatomy-mode.md` | Step 0, for the mode |
| `_shared/references/upbase-library.md` | Step 3: antd vocabulary |
| `references/build-mechanics.md` | before the first write (Step 5) |
| `_shared/references/figma-api-gotchas.md` | when a plugin call behaves oddly |
| `_shared/references/upbase-known-issues.md` | when something in the kit looks wrong and might be UpBase's |
