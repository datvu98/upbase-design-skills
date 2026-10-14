---
name: product-screen-builder
description: Rebuild, annotate or redesign product screens in UpBase product design files — UpS Product 2026 (`9FAdrUvuA7q0VExwsAxNu6`, consuming UpS UI Kit) and any other product file registered under `references/products/` — assembled only from kit component instances. Use this whenever the user wants to recreate or redraw a screen from a screenshot or reference image, "build the screen under Kho hàng", map a screen's anatomy to kit components, draw callouts naming the components on a screenshot, rebuild a flow's variants (error states, modal states, tabs), or make an improved / "tasteful" / proposal version of an existing screen with Mobbin references — even if they only paste a Figma link to a product file or name a module (Kho hàng, Đơn hàng, Tồn kho…). Also use it to log where the kit can't match a product screen. Do NOT use it to create or change components themselves — that is `ub-component-creator`, which this skill hands off to.
---

# Product screen builder

Paths in this skill are relative to its own directory, `${CLAUDE_SKILL_DIR}`. It needs
`ub-component-creator` installed beside it (same `skills/` folder): the changelog script and the gap
log template live there, at `${CLAUDE_SKILL_DIR}/../ub-component-creator/`.

Screens in a product file are **compositions of kit instances**, never components. The kit
decides how every part looks; this skill decides which parts, how they're configured, and how
they're arranged — and records every place the kit can't do what the screen needs.

```
UpBase Design System ──▶ <product> UI Kit ──▶ <product> design file   ← this skill writes here
      (source)               (kit)               (product file)
e.g.                        UpS UI Kit          UpS Product 2026
```

If the work means **changing a component** (adding a slot, a variant, a property), stop and hand
it to `ub-component-creator` with a written proposal. Building a screen around a kit limitation by
hand-drawing the missing part is the one thing this skill must not do — the drawing is invisible
to every other screen and silently drifts from the kit.

## Step 0 — Resolve the product and the mode

**Product** comes from the file key of the write target, not from the module name.

| File key | Product | Consumes | Read |
|---|---|---|---|
| `9FAdrUvuA7q0VExwsAxNu6` | UpS Product 2026 | UpS UI Kit `9c052aEvpV7gYLhwdatf6g` | `references/products/ups-product-2026.md`, `references/kit-maps/ups.md` |
A product file is **registered by its data file**: a file in `references/products/` (other than
`_template.md`) whose **File key** row holds the target key — `grep -l "<file key>"
${CLAUDE_SKILL_DIR}/references/products/*.md`. The table above lists the ones known when this skill
was written; a team adds a product by adding one file (and a kit map under `references/kit-maps/` if
it consumes a different kit), and those files survive updates. **A file key with no data file is
not registered** — stop and ask the user to register it (README › *Registering your kit*) rather than
borrowing UpS's data file; UpS's keys, ids and harvested tokens are wrong in any other file.

The UpS files are the **worked example**: when a template field is unclear, look at how the UpS
data file fills it.

**Mode** comes from what the user asked for:

| Mode | The user says | Output | Rules |
|---|---|---|---|
| **Anatomy** | "draw the anatomy", "point out the components", "which components is this" | Callout labels + leader lines on a copy of the reference image | Below, *Anatomy mode* |
| **Rebuild** | "rebuild / recreate / redraw this screen", "build the screens under X" | A faithful screen made of kit instances | `references/rebuild-mode.md` |
| **Proposal** | "improve", "make it tasteful", "redesign", "proposal version", "what can we do better" | An improved screen in the product's **Proposal** section, next to the faithful one | `references/proposal-mode.md` |

Unsure between Rebuild and Proposal? Ask — they have opposite rules about matching the reference.

**In both Rebuild and Proposal, content comes from the reference and form comes from the
component.** Keep every word, value and state the reference shows, but let each kit component keep
its own parts and styles: a dialog the product shipped without a title gets a title written from
context; ALL-CAPS button text takes the button's own sentence case; a form label keeps its ":".
Never hide or restyle a component's structural parts to look more like the screenshot — list the
difference in the handover instead.

## Step 1 — Pin and preflight

```
figma_list_open_files                    → is the product file connected?
figma_navigate <product url>, lock:true  → pin it
```

If the product file isn't in the list, the Desktop Bridge plugin isn't open in it — ask the user to
open it (Plugins → Development → Figma Desktop Bridge). You can still read reference images through
the claude.ai Figma connector (`get_screenshot`) while you wait.

Pass `fileKey` on **every** `figma_execute`. Several files are connected at once and the active one
moves on its own; a write into the kit or UpBase is silent and expensive.

Then run `scripts/preflight-product.js` as the first `figma_execute`, with `kitProbeKey` from the
product data file's **Kit probe key** row. It proves the file, that the
kit library actually resolves, and that nothing with the target screen name already exists (a
timed-out call usually finished anyway — see `references/build-mechanics.md`).

## Step 2 — Read the reference

Screenshot the reference node at a scale where text is legible (`figma_capture_screenshot`, scale
≈1.2–2 on a ~1340px image). Work out the **exact** content: every label, placeholder, count, state,
which toggle is on, which radio is checked, which fields are in error and what the error text says.
Screens in one module are usually variants of each other — diff them against the ones already built
before planning from scratch.

## Step 3 — Map the anatomy to kit components

Region by region, name the kit component, the variant/property settings, and the content.
The kit map (`references/kit-maps/<kit>.md`) has the mapping, keys, property keys and known limits for every
component used so far. Enumerate the kit before concluding something is missing — most "missing"
things are a slot fill, a variant, or a component under another name.

Anything the kit genuinely can't express is a **gap**. Check the kit's gap log first — it may
already be logged with an agreed workaround. Its path is the **Gap log** row of the product data
file (UpS: `docs/kit-gaps/ups.md` in the design repo; a new kit starts from the plugin's
`${CLAUDE_SKILL_DIR}/../ub-component-creator/references/kit/gap-log-template.md`).

## Step 4 — Proposal, then stop

Post a proposal in chat (not a doc or artifact) and wait for approval before building. The user may
waive this for a batch ("no need to run proposal, build it straight") — the waiver covers that
batch only. Template:

```
**Target** — frame name · size · section · position
**Reuse** — which built screen it's cloned from, and what changes
**Anatomy** — region → kit component (settings) · content, one line each
**Layout** — structure and the spacing tokens it binds
**Gaps** — each place the kit can't match, the workaround, and GAP id (new or existing)
**Needs a kit change?** — anything that should go to ub-component-creator instead
**Questions** — only real decisions, with a recommendation
```

If a new deviation turns up mid-build that the proposal didn't cover, stop and ask rather than
deciding.

## Step 5 — Build in stages

Read `references/build-mechanics.md` before the first write. The short version of why staging
matters: a node created in the same call as the frame it goes into, then appended into a slot of an
instance, gets a stale handle that crashes every later traversal. So:

1. Shell (clone a finished screen of the same module when one exists — it carries header, sidebar,
   alert and FloatButton already configured).
2. Empty structural frames inside slots.
3. Instances into those frames, one region per call.
4. Content, states, truncation.

Use `scripts/helpers.js` for property setting with error collection, form fields, error states and
text truncation. Bind every spacing value you set to a harvested token (`scripts/harvest-tokens.js`
lists what's reachable); the product file cannot import variables.

## Step 6 — Verify

- `scripts/walk-integrity.js` on the new screen: **0 unreadable nodes**, and the top level lists
  only kit components.
- `scripts/check-overrides.js` on the new screen: **0 layout overrides**, or each one named in the
  handover as something the user asked for. An overridden property never syncs from the library
  again, so a stray override silently blocks the next upstream fix — and cloning copies it to every
  sibling. Reset defects to the main component's value.
- Screenshot the result next to the reference and compare region by region — text, states, counts,
  alignment, and anything overlapping (the FloatButton is the usual offender).
- Say what you compared; don't report "matches" from the tree alone.

## Step 7 — Log gaps and hand over

Append every new gap to the kit's gap log using its entry format, and update the status of
existing ones you hit. Then report, in this order:

1. **Where** — screen name, size, section.
2. **What's there** — region by region, briefly.
3. **Verified** — the checks from Step 6, with numbers.
4. **Differs from the reference** — every deviation and why (gap id). Include the ones inherited
   from the screen you cloned.
5. **Decisions for the user** — only real ones.

Update the screen register in the product data file (screen → node id → status).

Then log the session on the product file's `Changelog` page: paste
`${CLAUDE_SKILL_DIR}/../ub-component-creator/scripts/changelog/changelog.js` into `figma_execute` with the product `fileKey` and call
`addChangelogEntry({ …, status: null, saveVersion: true })`. Name each screen or Global rules
section you added or changed and link its node. If the work sent a fix upstream to the kit or
UpBase, cross-link that file's entry under `related`. Anatomy-only sessions that change no
nodes aren't logged.

## Anatomy mode

Draw on a **copy** of the reference image in its own section — never on the original.

- Section named `Anatomy / <Module> <nn>`, placed where it doesn't overlap existing sections; copy
  the style of any existing example section on the page (UpS has one: `Example` on
  `↳ Specifications` — look it up by name; ids change when the file is reorganised). A product
  with none yet: copy UpS's style and say so.
- Labels: the kit component's exact name (`Menu / Sidebar / Rail`, `GridTable / Stacked Cell`),
  24px bold, one colour; 1px leader lines ending in an arrow at the target
  (`setVectorNetworkAsync` — the sync setter throws).
- Label slot compositions as `Table Cell (Content slot): Text + Tooltip + Switch` — composing inside
  a slot is not a gap.
- Keep lines straight and parallel to an edge; stagger labels so no line crosses another label.

Then list what you labelled, what you deliberately didn't (and why), and any mapping that's a
judgement call.

## Boundaries

- **Components** are `ub-component-creator`'s. This skill never creates a component, detaches an
  instance, or rebuilds a component's internals to get a look.
- **UpBase-direct instances** are allowed only for icons swapped through a kit component's own
  instance-swap property (the kit publishes no icons). Say so in the handover.
- **Publishing** is always the user's action. If a build needs a kit component that isn't published
  (import says "Could not find a published component"), check its publish status in the kit and ask
  the user to publish; don't work around it.
