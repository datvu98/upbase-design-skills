# Mode: Kit — composing in a product UI Kit

> **Scope: Kit mode** — building components in a library that *consumes* UpBase
> (`BoGaG48v9BfY7LkMtFs4zh`) rather than authoring it. Everything resolves **remotely** here —
> import by key; local lookup returns empty and that is correct. If the target is UpBase itself,
> stop and read `references/source/mode.md`.

## Read these first

Kit mode reads **eight** files, this one included. Load them now rather than mid-build; the ones
that prevent silent failure are no use once the write has landed.

| # | Read | For |
|---|---|---|
| 1 | `references/kit/<kit>.md` | **the kit's data file — read before this one.** File key, page list, naming, platform reach, the kit's own decisions. UpS: `references/kit/ups.md`. No data file for this key → stop (SKILL.md Step 0) |
| 2 | this file | the seven steps, and the four rules that invert from Source |
| 3 | `references/kit/patterns.md` | lessons that hold in any kit — sizing, exposure chains, slots, overrides |
| 4 | `references/kit/wrapper-pattern.md` | the recipe in full, exposure semantics, the curation fork |
| 5 | `references/kit/subscription.md` | file keys, 4 collection keys, 32 style keys — remote resolution |
| 6 | `references/figma-api-gotchas.md` | the traps that fail silently — **before** any plugin code |
| 7 | `references/upbase-known-issues.md` | UpBase defects every kit inherits — so you don't report them as yours, or "fix" them in the kit |
| 8 | `references/kit/page-template.md` | the kit page layout — **not** the source library's |

Then `references/verification.md` at Step 6, and `references/tokens.md` whenever you
bind a token you haven't bound before. Kit mode reads nothing under `references/source/` or
`scripts/source/` **except** `references/source/mode.md`, and only for the four conventions named
below — never for its build rules.

Preamble is `scripts/kit/resolve-remote.js`. Using the source's `scripts/source/helpers.js` here
resolves nothing and says so quietly.

**Contents** — Tools · Rules that invert from Source mode · Step 1 Pin · Step 2 Find the source ·
Step 3 Wrap or compose · Step 4 Compositions · Step 5 Resolve remotely · Step 6 Verify ·
Step 7 Document · Handing over

A product kit is a **consuming library**. A component here is either a UpBase component wrapped so
the kit owns its name and API, or a product-specific arrangement of several UpBase components —
almost never something drawn from scratch. Spend judgement on which of those two it is and what
it's called; radius, spacing, type and colour were decided upstream.

Examples below use UpS because it is the first kit; substitute the key, page names and
conventions from the kit's own data file. Where the data file records a decision (naming, page
shape), it beats an example here.

```
UpBase Design System ──publish──▶ UpS UI Kit ──publish──▶ UpS product files
BoGaG48v9BfY7LkMtFs4zh           9c052aEvpV7gYLhwdatf6g
```

## Tools

| Call | Use for |
|---|---|
| `figma_list_open_files` | Confirm both files are connected before anything else |
| `figma_navigate` url, `lock:true` | Pin the kit as the active target |
| `figma_execute` + `fileKey` | Everything. Always pass `fileKey` explicitly, even when pinned. **Caps at 30s; a timeout is not a rollback** — chunk the work, warm the import cache in its own call, and guard every build against duplicates (`references/figma-api-gotchas.md`) |
| `figma_capture_screenshot` | Visual check — reads live plugin state, unlike REST export |
| ~~`figma_search_components`~~ with `libraryFileKey` | **Avoid.** Matches descriptions as well as names, and returns `success: true, results: []` when the REST token lapses. Search UpBase through the plugin instead — Step 2 |

| Script | Run it |
|---|---|
| `scripts/preflight.js` | **First call of any build** — file, mode, library reachability, leftovers |
| `scripts/kit/resolve-remote.js` | As the preamble to any build call — replaces `scripts/source/helpers.js` |
| `scripts/kit/make-wrapper.js` | Step 3, to generate a wrapper |
| `scripts/kit/audit-wrappers.js` | Step 6, and after every UpBase update you accept |
| `scripts/check-reflow.js` | Step 6 — every `overflowPx` must be 0 |
| `scripts/audit-coverage.js` | Step 6 — token coverage, exclude instances |
| `scripts/audit-platform.js` | Step 6 — responsive declaration vocabulary |

## Rules that invert from Source mode

Four of Source mode's load-bearing rules are **inverted** here, and each would tell you to refuse
the correct move:

| Source mode says | Kit mode |
|---|---|
| Never build a second component that duplicates an existing one | Wrapping an existing UpBase component **is** the deliverable |
| No two components may share a name | Kit names come from **product context**; may match UpBase or not |
| Everything is local — look up by name, never import by key | Everything is **remote**. Import by key is the only way |
| Zeros from the audit mean you drifted into the wrong file — create nothing | **Zeros are correct here.** `getLocalVariableCollectionsAsync()` returns `[]` even after importing |

What carries over unchanged — read it there, don't copy it here: the State vocabulary, the raw-value
rule, the nine responsive verbs, contrast thresholds, the description format, and every API trap.

## Workflow

### Step 1 — Pin the target

Both files are usually connected and the active target moves on its own; a write landing in UpBase
is silent and expensive.

```
figma_list_open_files                     → confirm both connected
figma_navigate <kit url>, lock:true       → pin
```

Then pass the kit's `fileKey` (from its data file; UpS: `'9c052aEvpV7gYLhwdatf6g'`) on every
`figma_execute` anyway. The pin protects the
default; `fileKey` protects the call.

Then **run `scripts/preflight.js` as your first `figma_execute`**, before any node exists:

```js
const pf = await preflight({ mode: 'kit', fileKey: '<kit file key>', building: '<kit component name>' });
if (pf.blocked) return pf;   // do not create anything
```

Beyond proving the file, the kit run adds one check the source doesn't need: that **UpBase is
actually reachable** in the team library. A wrapper built against an unreachable library looks
correct and binds nothing.

### Step 2 — Find the UpBase source

Search the UpBase file **through the plugin**, never REST:

```js
// figma_execute with fileKey: 'BoGaG48v9BfY7LkMtFs4zh'
await figma.loadAllPagesAsync();
const hits = [];
for (const p of figma.root.children)
  for (const s of p.findAllWithCriteria({ types: ['COMPONENT_SET'] }))
    if (/searchterm/i.test(s.name))
      hits.push({ page: p.name, name: s.name, key: s.key,
                  variants: s.children.length, axes: Object.keys(s.variantGroupProperties || {}) });
return hits;
```

UpBase publishes 293 component sets, 1,841 standalone components (1,779 of them icons) and 8,900
components in total. Assume the thing exists until the plugin search says otherwise.

Translate the vocabulary before concluding anything is missing — the full table is in
`references/source/mode.md` Phase 0b. The two that matter constantly here:

| You want | UpBase calls it |
|---|---|
| `addonBefore` — a select or unit welded to the left of a field | **`Pre Tab`** |
| `addonAfter` — welded to the right | **`Post Tab`** |

So a scoped search field is not a new component: it's `Input / Search` or `Input / Pre Post Tab`
with the addon set to `Type=Select, Tab=Pre`.

### Step 3 — Decide the shape, propose, then build it

**Nothing new is built without an approved proposal.** Run Steps 1–2 (read-only), then post a
proposal in chat and stop until the kit's owner (data file › **Owner**) approves it. Cover:

- the shape (row of the table below) and why nothing in the kit or UpBase already serves;
- name and page, following the data file's naming decision;
- anatomy, with the **variant count multiplied out** — before → after, per set and in total.
  Minimising variants is the goal: booleans, instance swaps, slots and text cost zero variants; only
  colour and text alignment genuinely need one;
- states, instance properties, the `Web:` / `Native:` lines (from the data file's platform reach);
- non-obvious token picks with measured contrast, and every raw value you foresee;
- anything that should be a UpBase change instead (the Step 3 gate below).

Ask about platform reach and breakpoint behaviour rather than inferring them. Reuse, instance
overrides and mode changes build nothing and need no proposal.

| What the kit needs | Build | How |
|---|---|---|
| One UpBase component, kit name, full API | **Wrapper** | `scripts/kit/make-wrapper.js` |
| One UpBase component with **fewer** axes than UpBase offers | **Curated set** | One wrapper variant per combination — price it first |
| An arrangement of ≥2 UpBase components the product repeats | **Composition** | Step 4 |
| Something UpBase genuinely doesn't have | **Stop** | It probably belongs in UpBase — raise it |

That last row is a gate, not a note: a generic control invented in one kit is invisible to every
other product and gets rebuilt elsewhere. Raise it with the UpBase owner (README › *Who owns
what*) with the gap, the screen that needs it and a proposed shape. If the kit ships one anyway as a
deliberate stopgap, say so in the description so it reads as a decision, and log it in the kit's
gap log.

The same goes for **an atom that needs to look different** — an indent, a padding, a colour that
belongs to a UpBase component. That is a UpBase change, never an override on nested remote
instances in the kit (`references/kit/patterns.md` › *Fix atoms upstream*).

**The wrapper pattern** — a local component owning a remote instance, nested instances exposed:

```
COMPONENT  "<kit name>"                   local · componentPropertyDefinitions stays []
└── INSTANCE "<kit-facing layer name>"    remote main from UpBase
    isExposedInstance = true              ← without this the consumer gets NO properties
```

Four things the recipe exists to get right, each verified on `Button / Basic`:

| Rule | What goes wrong without it |
|---|---|
| `isExposedInstance = true` | Consumer's property panel is **empty** — all 12 controls exist on the child, none surface |
| Rename the nested layer | The exposed group is labelled with **that layer's** name, so designers read UpBase's vocabulary inside a component the kit deliberately renamed |
| Mirror the source's sizing | A HUG wrapper silently caps a child meant to FILL — fine on `Button`, wrong on `Input`, `Table`, `Drawer` |
| Carry the description | Figma asset search matches description text; an empty one is unfindable |

Full recipe, exposure semantics and the curation fork: `references/kit/wrapper-pattern.md`.

### Step 4 — Compositions

A product component (`TableToolbar`, `FilterBar`, `PageHeader`, `UserMenu`) nests **instances** of
UpBase components and arranges them. Never rebuild an atom's internals to get a variation — if the
atom can't do what the product needs, that's the Step 3 gate.

- **Nested UpBase instances keep their own tokens.** A `Button` inside your toolbar stays bound to
  `Components/Button/*`. Only a deliberate override belongs to the kit.
- **Bind your own layers to imported UpBase variables and styles** — never a raw hex, never a local
  kit variable that merely copies a UpBase value.

### Step 5 — Resolve tokens and styles remotely

`getLocalVariableCollectionsAsync()` and `getLocalTextStylesAsync()` return **empty in a kit even
after importing** — imported assets are remote, not local. Every name-based local lookup silently
finds nothing. That is this file's healthy state, not a symptom.

Use `scripts/kit/resolve-remote.js` as the preamble instead of `scripts/source/helpers.js`:

```js
const R = await upsResolve();
const bg = await R.v('Colors/Neutral/Bg/colorBgContainer');
frame.fills = [await R.paintVar(bg)];
R.bindNum(frame, 'paddingLeft', await R.v('Space/Padding/paddingSM'));
await R.applyTextStyle(textNode, 'Text Base/Normal');
```

| Verified | Consequence |
|---|---|
| Aliases stay theme-transparent across files — `255,255,255` Light, `20,20,20` Dark | Light/Dark and Default/Compact keep working; a wrapper that ignores Compact is a real defect |
| UpBase colour tokens are **themselves aliases** | Reading `valuesByMode` directly returns an alias object, not a colour — follow the chain |
| `importStyleByKeyAsync` + `setTextStyleIdAsync` / `setEffectStyleIdAsync` work | A kit needs **no** local copies of the 20 text / 10 effect / 2 grid styles. Keys in `references/kit/subscription.md` |
| A kit cannot *re-publish* UpBase styles | A product file applying `Text Base/Normal` to its own free text still needs UpBase. Components built here are unaffected — the style travels inside the instance |

### Step 6 — Verify

Run the shared procedure in `references/verification.md`, then the four
scripts in the Tools table. Three of them work here unchanged because none touches local lookup.

`scripts/kit/audit-wrappers.js` is the one specific to this file — it checks exposure, sizing match, description,
Source-key match, and **axis drift** (whether UpBase added or removed an axis since the wrapper was
made). Drift is invisible on the canvas, so run it after every UpBase update you accept, not only
when building.

The density sweep still applies: pin `2. Dimensions` **and** `3. Typography` to Compact together on
a throwaway instance. Anything that fails to move is unbound.

### Step 7 — Document and lay out the page

Use the description format from `references/source/mode.md` Phase 6 verbatim. Which of the `Web:`
and `Native:` lines are in scope comes from the data file's **Platform reach** (UpS ships to both).

One addition specific to a wrapper, under `**Properties**`:

```
Source

- UpBase `Button / Basic` (key a0b8f7e08632a9e38b1ca402519adaff112a5ce6)
  exposed nested instance · 7 axes (Type · Size · State · Content · Ghost · Danger · Shape) · 5 instance properties
```

`scripts/kit/audit-wrappers.js` parses that block for drift detection — keep the key exact and the axis list
current, or drift becomes undetectable.

**Lay the page out with `references/kit/page-template.md`, not `references/source/page-template.md`.** The kit has its own page
shape and the two differ by more than detail: a kit page has **no doc frame, no Playground,
no Light/Dark pair and no footer**, its labels are plain text rather than Space Mono `#7B61FF`, and
its column labels carry bare values rather than `Property=Value`. Applying the source-library
template here produces a page that is wrong in four visible ways.

The reference implementation is `❖ Form` in UpS (`5:20`), approved as the kit template 2026-09-11.
Another kit uses the template page named in its own data file, and UpS's until it has one.

UpBase's `_Docs / *` components are unpublished by design and cannot be imported; don't ask for
them to be published, since the `_` prefix is what keeps documentation out of every subscriber's
Assets panel. Each kit owns its own `_Docs / Page Header` (UpS: `31:48804`; others: the data
file's *Local scaffolding*). A new kit without one builds it first, as a local unpublished
component. A kit page does not need a footer.

## Handing over

Separate what's verified (with evidence), what's deliberately raw or omitted, and the judgement
calls you couldn't make. Then state the chain, because it has two hops and people forget the second:

```
UpBase edited → publish UpBase → kit accepts → publish kit → product files accept
```

Publishing is the user's action at both hops. A kit wrapper doesn't see a UpBase fix until the kit
accepts that update, so a wrapper can be silently one version behind while looking correct. Say
which hops are outstanding.

## Reference files

| File | Contents |
|---|---|
| `references/kit/<kit>.md` | The kit's data file — copy `_template.md` for a new kit |
| `references/kit/patterns.md` | Lessons that hold in any kit |
| `references/upbase-known-issues.md` | UpBase defects every kit inherits |
| `references/kit/wrapper-pattern.md` | The recipe, exposure semantics, curation fork, worked example, checklist |
| `references/kit/subscription.md` | File keys, 4 collection keys, all 32 style keys, resolution rules |
| `references/figma-api-gotchas.md` | Silent-failure traps — read before writing plugin code |
| `references/verification.md` | Mode sweep, stress cases, audit procedure |
| `references/tokens.md` | Which token means what |
| **`references/kit/page-template.md`** | **Kit page structure — use this one.** Modelled on `❖ Form` in UpS |
| `references/source/page-template.md` | Source-library page structure. **Does not apply in Kit mode** |
| `references/source/mode.md` | State vocabulary, raw-value rule, nine responsive verbs, description format |
