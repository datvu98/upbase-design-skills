---
name: ui-kit-builder
description: Build and change components in a product's UI kit — the Figma library a product team (UpS UI Kit, or any kit registered under kits/) publishes on top of the UpBase Design System. Use it to wrap a UpBase component into the kit ("add Select to our kit", "wrap Button"), compose a product component from several UpBase parts ("build the filter bar", "a KPI card for the dashboard", "table toolbar"), fix or extend an existing kit component, lay out a kit page, check a kit component after accepting a UpBase update, or register a new kit. Use it whenever someone pastes a kit file link or names a component they want in their kit, even without saying "kit". Do not use it for the UpBase Design System file itself (that is design-system-builder) or for product screens (that is product-screen-builder).
---

# UI kit builder

A product UI kit is a Figma library that **consumes** UpBase and re-publishes it in the product's
own terms. Almost everything in a kit is one of two things:

- a **wrapper**: one UpBase component, re-published under the kit's name;
- a **composition**: a product-specific arrangement of several UpBase or kit components.

Radius, spacing, type and colour were decided upstream. The judgement here is *which of the two
shapes* a thing is, what it's called, and how few variants it can get away with.

```
UpBase Design System ──publish──▶ product UI kit ──publish──▶ product design files
design-system-builder              ui-kit-builder              product-screen-builder
```

| The request is about… | Skill |
|---|---|
| a component every product needs, a token, a style, or how a UpBase atom looks | `design-system-builder`, after talking to the UpBase owner |
| a component in **this product's kit** | **this skill** |
| a screen in a product file | `product-screen-builder` |

Paths below are relative to this skill's folder (`${CLAUDE_SKILL_DIR}`). Files shared with the other
skills are in `${CLAUDE_SKILL_DIR}/../_shared/`, shortened here to `_shared/`.

## Step 0: Which kit?

The kit is identified by the **file key** of the write target, the 22 characters after
`figma.com/design/`. Find its data file:

```
grep -l "<file key>" ${CLAUDE_SKILL_DIR}/kits/*.md
```

- **One match**: read it now. It holds the kit's key, pages, platform reach, owner, and the
  decisions this kit has made (naming, page shape). Where it records a decision, it beats any example
  in this skill.
- **No match**: the kit isn't registered. Stop, and offer to register it with the user. Copy
  `kits/_template.md` to `kits/<kit-slug>.md` and fill it **with their answers**. The *Decisions to
  make once* table is theirs to decide. Never borrow `kits/ups-ui-kit.md` for another kit: its node
  ids and conventions are wrong anywhere else.
- **The key is UpBase's own (`BoGaG48v9BfY7LkMtFs4zh`)**: wrong skill. Use `design-system-builder`.

## Step 1: Pin the file and run preflight

Two or more files are usually connected to the Desktop Bridge, and the active one moves on its own. A
write that lands in the wrong file is silent.

```
figma_list_open_files                  → is the kit connected? Is UpBase connected too (Step 2 needs it)?
figma_navigate <kit url>, lock: true   → pin the kit
```

Pass `fileKey` on **every** `figma_execute`, even when pinned. Then run `_shared/scripts/preflight.js`
as the first call:

```js
const pf = await preflight({ mode: 'kit', fileKey: '<kit key>', building: '<component name>' });
if (pf.blocked) return pf;   // create nothing; fix what it names
```

It proves you're in the kit, that UpBase is reachable as a library, and that a timed-out earlier call
didn't already build this. `figma_execute` stops at 30s, but **a timeout is not a rollback**: the
plugin usually finishes, so a blind retry duplicates the work. Read
`_shared/references/figma-api-gotchas.md` › *A timeout is not a rollback* before your first write.

## Step 2: Find what already exists (read-only)

**Kit first, then UpBase.** A kit holds far more than its status table says, and a composition must
nest the kit's own wrappers, not the UpBase originals behind them. Enumerate the kit (snippet in
`references/patterns.md` › *Before you build*), then search UpBase **through the plugin**, with
UpBase's file key:

```js
// figma_execute with fileKey: 'BoGaG48v9BfY7LkMtFs4zh'
await figma.loadAllPagesAsync();
const hits = [];
for (const p of figma.root.children)
  for (const s of p.findAllWithCriteria({ types: ['COMPONENT_SET'] }))
    if (/searchterm/i.test(s.name))
      hits.push({ page: p.name, name: s.name, key: s.key, variants: s.children.length,
                  axes: Object.keys(s.variantGroupProperties || {}) });
return hits;
```

Don't use `figma_search_components` for this. It matches descriptions too, and it returns an empty
success when the access token has expired, which reads as "doesn't exist".

UpBase uses antd's names, so **translate before concluding something is missing**: Spinner → `Spin`,
Stepper → `InputNumber`, Combobox → `Select`, Empty state → `Result` / `Empty`, Toast → `Message`,
addon before/after a field → `Pre Tab` / `Post Tab` on `Input`. The full table is in
`_shared/references/upbase-library.md`.

## Step 3: Decide the shape

| What the kit needs | Shape | Built with |
|---|---|---|
| One UpBase component under the kit's name, full API | **Wrapper** (exposed) | `scripts/make-wrapper.js` |
| One UpBase component with **fewer** axes than UpBase offers | **Curated set**: price the variants first | `references/wrapper-pattern.md` › Decision 1 |
| An arrangement of ≥2 components the product repeats | **Composition** | Step 5 |
| Something generic UpBase doesn't have, or an atom that should look different | **Not here.** Raise it with the UpBase owner → `design-system-builder` | — |
| Something only a screen needs once | **Not a component.** It's screen work → `product-screen-builder` | — |

The fourth row is a gate. A generic control invented in one kit is invisible to every other product
and gets rebuilt elsewhere. An atom's padding, colour or indent overridden on nested UpBase instances
doesn't survive in product files (`references/patterns.md` › *Fix atoms upstream*). If the kit ships
a stopgap anyway, say so in its description and log it in the kit's gap log.

## Step 4: Propose, then stop

Post the proposal **in chat** and wait for the kit owner's approval before creating anything:

```
**Shape**: wrapper / curated set / composition, and why nothing existing serves
**Name and page**: following the kit's naming decision
**Anatomy**: parts → which kit or UpBase component each one is
**Variants**: axes × options = N per set; before → after, total. Push everything else into
  booleans, swaps, slots and text: they cost zero variants
**Properties**: booleans, swaps, slots, text
**Platform**: Web / Native lines (from the data file), any breakpoint behaviour
**Tokens**: non-obvious picks with measured contrast; every raw value you foresee, with the reason
**Upstream**: anything that should be a UpBase change instead
**Questions**: real decisions only, each with a recommendation
```

The rules behind the variant count, states, contrast and tokens are in
`_shared/references/conventions.md`. Read the relevant section while you write the proposal, not
after. Reuse, instance overrides and mode changes build nothing and need no proposal.

If something new comes up mid-build that the proposal didn't cover, stop and ask.

## Step 5: Build

Read before the first write:

- `references/wrapper-pattern.md`, for a wrapper: the four rules and the exposure semantics.
- `references/patterns.md`: sizing, exposure chains, slots, overrides, moving things, reaching
  UpBase from a kit. Every item cost a rebuild once.
- `_shared/references/figma-api-gotchas.md`: the API traps that fail silently.

**Everything from UpBase is remote here.** Local lookups (`getLocalVariableCollectionsAsync`,
`getLocalTextStylesAsync`) return empty in a kit, even after importing. That is healthy, not a bug.
Resolve by key with `scripts/resolve-remote.js` (`kitResolve()`). Styles import by the keys in
`_shared/references/upbase-library.md`. Variable and component imports can hang in a kit; when they
do, **harvest** from nodes already bound in the file (`patterns.md` › *Reaching UpBase from a kit*).

Build in small calls: one structure per call, read back what you wrote, guard every create against a
duplicate. In a composition, nested instances keep their own tokens. Bind your own layers to UpBase
variables and styles, never a raw hex, and never a local variable that merely copies a UpBase value.

## Step 6: Verify

Follow `_shared/references/verification.md`, then run:

| Script | Pass when |
|---|---|
| `scripts/audit-wrappers.js` | exposure, sizing, description and `Source` block are clean, with no axis drift. Flags the data file lists as accepted are fine |
| `_shared/scripts/check-reflow.js` | every `overflowPx` is 0 |
| `_shared/scripts/audit-coverage.js` | fills, text styles, effects and stroke width are at 100%; every other raw value is listed in the description |
| `_shared/scripts/audit-platform.js` | the responsive lines use the allowed verbs and are proven by an example frame |

**Density sweep**: pin `2. Dimensions` **and** `3. Typography` to Compact together on a throwaway
instance. In a kit, get each collection through a variable you've already bound
(`getVariableCollectionByIdAsync(v.variableCollectionId)`). Anything that doesn't move is unbound.
Screenshot with `figma_capture_screenshot`. It caches per node id, so recreate the node for a fresh
image after a change.

## Step 7: Document and lay out the page

- **Description**: the format in `_shared/references/conventions.md` › *The component description*,
  including the `Source` block for a wrapper.
- **Page**: `references/page-template.md`, which is the kit layout, **not** UpBase's. Follow the page
  shape your data file recorded (UpS: a wrapped atom gets 2 nodes, a composition gets the full
  template). Each kit owns its own `_Docs / Page Header`. UpBase's `_Docs / *` can't be imported.

## Step 8: Log and hand over

1. **Changelog.** Paste `_shared/scripts/changelog/changelog.js` into `figma_execute` with the kit's
   `fileKey`, then call
   `addChangelogEntry({ date, title, author: '<your name> · with Claude', status: 'pending', sections, saveVersion: true })`.
   One entry per session. Cross-link a related UpBase entry under `related`.
2. **Data file.** Update the kit's *Status* table and *Notes* in `kits/<kit>.md`. A lesson that would
   hold in *any* kit goes to `references/patterns.md` instead, via a pull request to the skills repo.
3. **Gap log.** Update any gap this work opened or closed (path in the data file).
4. **Report** in three parts: **verified** (with numbers), **deliberately raw or omitted** (and why),
   and **judgement calls** for the user. Then state the publish chain and which hops are outstanding:

   ```
   UpBase edited → publish UpBase → kit accepts → publish kit → product files accept
   ```

   Publishing is always a person's action in Figma. A kit wrapper doesn't see a UpBase fix until the
   kit accepts that update, so it can look right while being one version behind.

## After accepting a UpBase update

Read the UpBase `_Changelog` page for what changed. Items marked **⚠ Breaking** say what to do. Then
run `scripts/audit-wrappers.js` across the kit: axis drift is invisible on the canvas.
`_shared/references/upbase-known-issues.md` lists behaviour changes that move instances on accept.

## Reference map

| File | Open it at |
|---|---|
| `kits/<kit>.md` | Step 0, always |
| `kits/_template.md` · `kits/_gap-log-template.md` | registering a kit |
| `_shared/references/upbase-library.md` | Step 2 (vocabulary) and Step 5 (keys, resolution) |
| `_shared/references/conventions.md` | Step 4: variants, states, contrast, tokens, description format |
| `references/wrapper-pattern.md` | Step 5, wrappers |
| `references/patterns.md` | Steps 2 and 5 |
| `_shared/references/figma-api-gotchas.md` | before the first write |
| `_shared/references/verification.md` | Step 6 |
| `_shared/references/tokens.md` | binding a token you haven't bound before |
| `_shared/references/upbase-known-issues.md` | when something in UpBase looks wrong, and after an update |
| `references/page-template.md` | Step 7 |
| `kits/ups-ui-kit.md` | a filled-in example, when a template field is unclear |
