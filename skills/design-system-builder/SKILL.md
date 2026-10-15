---
name: design-system-builder
description: Build and change components, tokens and styles in the UpBase Design System Figma file (`BoGaG48v9BfY7LkMtFs4zh`), the one library every UpBase product kit consumes. Use it to add a component to UpBase ("add a stepper to UpBase", "we need a file uploader in the design system"), fix or extend an existing UpBase component ("Badge needs a min-width", "add a Border option to Avatar"), retune or add variables, decide whether a platform difference is a token, a variant axis or a separate component, audit token and style binding, or work out why a UpBase component looks off at Compact density or a narrow width. Use it whenever the target is the UpBase Design System file, even if the user only names the component. Do not use it for a product's UI kit (that is ui-kit-builder) or for product screens (that is product-screen-builder).
---

# Design system builder

The **UpBase Design System** file (`BoGaG48v9BfY7LkMtFs4zh`) holds the variables, styles, icons and
components for every platform. It is published as one library, and every product kit builds on it:

```
UpBase Design System ──publish──▶ product UI kits ──publish──▶ product design files
design-system-builder               ui-kit-builder              product-screen-builder
```

A change here reaches **every** product that uses UpBase. That is why this skill is stricter about
duplicates and about announcing breaking changes than the kit skill is.

| The request is about… | Skill |
|---|---|
| a component every product needs, a token, a style, how a UpBase atom looks | **this skill** |
| a component only one product needs | `ui-kit-builder` |
| a screen | `product-screen-builder` |

Paths below are relative to this skill's folder (`${CLAUDE_SKILL_DIR}`). Shared files are in
`${CLAUDE_SKILL_DIR}/../_shared/`, shortened here to `_shared/`. The phase-by-phase detail is in
`references/workflow.md`. This file is the route through it.

## Step 0: Confirm the file

The write target must be `BoGaG48v9BfY7LkMtFs4zh`. Any other key belongs to another skill: a
registered kit → `ui-kit-builder`, a product file → `product-screen-builder`. If the user hasn't said
which file, ask. "Fix Badge's min-width" is UpBase work; "build our filter bar" is kit work; "add a
stepper" could be either.

```
figma_list_open_files                    → is the UpBase file connected?
figma_navigate <UpBase url>, lock: true  → pin it
```

Pass `fileKey: 'BoGaG48v9BfY7LkMtFs4zh'` on **every** `figma_execute`, even when pinned.

## Step 1: Preflight

Run `_shared/scripts/preflight.js` as the first call:

```js
const pf = await preflight({ mode: 'design-system', fileKey: 'BoGaG48v9BfY7LkMtFs4zh', building: '<root name>' });
if (pf.blocked) return pf;
```

It proves the file, proves local lookup works (**zero** local collections here means you drifted to
another file, so re-pin and create nothing), and finds leftovers from a call that timed out but kept
running. Read `_shared/references/figma-api-gotchas.md` › *A timeout is not a rollback* before your
first write.

## Step 2: Check it doesn't already exist (read-only)

`references/workflow.md` › *Phase 0a–0c*. In short:

- Search with the user's own word and antd's (`_shared/references/upbase-library.md` › *What UpBase
  calls things*). The library has ~350 non-icon components; assume it exists until the search says
  otherwise.
- **Exists but weaker than needed → fix the original**, never build a second one.
  `_shared/scripts/audit-reuse.js` finds this class.
- **No two components share a name.** If the honest name is taken, extend that set.
- Ask for **platform reach** and narrow-width behaviour if the request doesn't say
  (`_shared/references/conventions.md` › *Platforms*).

Then enumerate what exists (`scripts/audit-system.js`) and read the nearest sibling's bindings.

## Step 3: Propose, then stop

Post the proposal **in chat** and wait for approval before creating anything. Creating a helper
component or changing an existing one as a side effect is never allowed: name it in the proposal.

```
**Shape**: new set / extend <set> / fix <set>, and why nothing existing serves
**Name and page**
**Anatomy**: sub-parts, and which existing components it nests
**Variants**: axes × options = N; before → after for every set touched
**States**: from the fixed vocabulary
**Properties**: booleans, swaps, slots, text
**Platform**: Web / Native lines
**Tokens**: new Components/<Name>/* tokens, non-obvious picks with measured contrast, every raw value
**Reach**: instances and pages affected if an existing component changes
**Breaking?**: yes/no, against the list in Step 6
**Questions**: real decisions only, each with a recommendation
```

Rules for the variant count, states, contrast, tokens and raw values:
`_shared/references/conventions.md`. Rules specific to this file (naming, `Components/<Name>/*`
token groups, binding by name): `references/workflow.md` › *Phase 1–4*.

## Step 4: Build

`references/workflow.md` › *Phase 3–4*. Everything resolves **locally**: look variables and styles
up by name, never import by key. Use `scripts/helpers.js` (`paintVar`, `bindNum`, `icon`,
`applyTextStyle`, `contrast`, `propsBlock`). Build sub-parts first, then the root composing
instances of them. Bind as you go. Bind `Components/<Name>/*` tokens that alias the global tiers.
Build in small calls, read back, and guard against duplicates.

## Step 5: Verify, document, lay out

- Verify: `_shared/references/verification.md`. Screenshots, the Default/Compact sweep (pin
  Dimensions **and** Typography), reflow, stress content, coverage, platform, reuse.
- Describe: `_shared/references/conventions.md` › *The component description*.
- Page: `references/page-template.md`, which is the UpBase page (doc frame, Light/Dark playground,
  `Components` · `Density scale` · `Example Screens`).

## Step 6: Breaking changes, changelog, hand over

**Every product kit consumes this file, and their owners aren't in your session.** A change is
**breaking** if it:

- renames or removes a component, variant, property or slot, or changes a variant axis;
- changes a component's **key** (deleted and re-created instead of edited);
- renames, removes or re-points a token or style to a different meaning;
- changes a default in a way that moves existing instances (size, visibility, content).

1. **Changelog.** Paste `_shared/scripts/changelog/changelog.js` into `figma_execute` and call
   `addChangelogEntry({ date, title, author: '<your name> · with Claude', status: 'pending', sections, saveVersion: true })`.
   Prefix each breaking item with **`⚠ Breaking —`** and say what kit owners must do when they accept
   the publish. The `_Changelog` page is how other teams learn what changed.
2. **Known issues.** If you fixed something in `_shared/references/upbase-known-issues.md`, move it
   to *Resolved*. If you changed behaviour that moves instances, add a row to *Behaviour changes*.
3. **Report**: verified (with numbers), deliberately raw or omitted, judgement calls. For a breaking
   change, list every product with a kit as affected: the folders under `upbase/` in this repo
   (`ls upbase/*/kit-build.md`), plus any other team you know consumes UpBase. Then the publish
   chain:

   ```
   UpBase edited → publish UpBase → kits accept → publish kits → product files accept
   ```

   Nothing here reaches a product designer until each hop is published. Publishing is a person's
   action in Figma.

## Reference map

| File | Open it at |
|---|---|
| `references/workflow.md` | Steps 2–4: phases 0a–6 in detail |
| `_shared/references/conventions.md` | Step 3: variants, states, contrast, tokens, raw values, description |
| `_shared/references/upbase-library.md` | Step 2: antd vocabulary |
| `references/foundations.md` | Step 2: collections, styles, inventory |
| `_shared/references/tokens.md` | binding a token you haven't bound before |
| `_shared/references/figma-api-gotchas.md` | before the first write |
| `_shared/references/verification.md` | Step 5 |
| `references/page-template.md` | Step 5 |
| `_shared/references/upbase-known-issues.md` | Step 2 (what's already known) and Step 6 |
