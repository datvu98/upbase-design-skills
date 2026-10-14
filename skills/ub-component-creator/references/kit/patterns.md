# Kit patterns — what holds in any kit

> **Scope: Kit mode, every kit.** Lessons learned building UpS UI Kit that are about *being a kit
> over UpBase*, not about UpS. Each was measured, usually after the plausible alternative failed.
> The UpS-specific record they came from is `references/kit/ups.md` — read it for the full story,
> but rely on this file for the rule. API-level traps are in `references/figma-api-gotchas.md`;
> this file is one level up — how kit components are put together.

**Contents** — Before you build · Wrapper sizing · Exposure · Properties and variant count ·
Slots · Overrides and the upstream rule · Moving things · Reaching UpBase from a kit ·
Composing tables · Audit flags that are expected

## Before you build

- **Enumerate the kit first, then UpBase.** A kit holds far more than its build log says (UpS:
  ~72 published components against a 13-row status table). A composition must nest the **kit's
  wrapper**, not the UpBase original it wraps — UpS's `PageHeader` was first built on five UpBase
  atoms the kit already wrapped. Check provenance with `(await n.getMainComponentAsync()).remote`:
  `false` = kit component, `true` = you reached past the kit into UpBase.

  ```js
  for (const p of figma.root.children) {
    if (p.name.startsWith('_')) continue;
    for (const n of p.findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })) {
      if (n.type === 'COMPONENT' && n.parent.type === 'COMPONENT_SET') continue;
      console.log(p.name, n.name, n.id);
    }
  }
  ```

- **Search by need, not by name.** "No empty-state component" was wrong in UpS because it only
  matched published names; `IllustratedMessage` was on its own page. Check the page that matches
  the need, and translate antd vocabulary (`references/source/mode.md` Phase 0b).
- **Probe sizing combinations in a throwaway frame** before committing a component structure.
  Every sizing trap below was found by probe; reasoning about them gave the wrong answer twice.

## Wrapper sizing

- **Mirror-the-source is the wrong default for anything meant to stretch.** `make-wrapper` copies
  the source's sizing; FIXED/FIXED gave UpS a `Chart` that could not grow past 648. Use **FIXED
  wrapper + FILL nested instance** — the pairing `audit-wrappers` permits.
- **When an exposed axis swaps the long axis** (`Orientation = Horizontal · Vertical`), the nested
  instance must FILL **both** axes. A wrapper cannot vary its sizing per exposed variant.
- **A wrapper's height follows the variant it was made from.** Switching the nested instance to a
  taller variant (UpBase `Divider` Dashed is 2px, Solid is 1px) leaves it clipped. After the switch,
  in this order: `inst.layoutSizingHorizontal = 'FILL'` → `inner.layoutSizingVertical = 'FILL'` →
  `inst.layoutSizingVertical = 'FIXED'` → `inst.resize(inst.width, newHeight)`, then re-read.
- **An inert `Size` axis is a sizing bug.** UpS `Avatar`'s wrapper and nested instance were both
  FIXED 32, so `Size=Small` still measured 32 and the avatar didn't shrink at Compact. A nested
  instance whose size should follow its variants wants HUG.
- **A fixed width that equals the sum of a fixed and a token-driven sibling is a coincidence, not a
  constraint.** It holds at Default and drifts at Compact (UpS `CardTable`: 19px column drift).
  Wrap the pair in a FIXED frame and let the token-driven part FILL.

## Exposure

- **Exposure is wholesale** — every axis of the nested component shows, and none can be hidden or
  renamed. Narrowing the API means a curated set of wrapper variants (`wrapper-pattern.md`).
- **Nesting a kit wrapper inside a kit composition exposes two levels**, all or nothing: exposing
  only the grandchild throws *"Can only expose primary instances"*, and un-exposing the outer one
  hides both. The panel then shows two groups per nested wrapper, both labelled by layer name.
  **Rename the grandchild to the outer layer's name** (`c.children[0].name = c.name`) so the panel
  reads `Label / Label / Value / Value` — redundant but unambiguous.
- **An exposed nested variant switch resizes the parent** when the nested component is an
  auto-layout HUG frame, and switching the parent's own variant **keeps** the nested override. That
  makes an exposed nested set the way to offer "pick one of N illustrations/icons per size" — an
  INSTANCE_SWAP can't (below).

## Properties and variant count

The kit's owner tracks the variant count. Put the before → after arithmetic in every proposal.

- **Only colour and text alignment genuinely need a variant.** Optional parts → BOOLEAN; icons
  and alternatives → INSTANCE_SWAP or an exposed nested set; text → TEXT; variable content → SLOT.
  Each costs zero variants. Size is usually the density mode, not an axis.
- **A behaviour change to existing variants beats a new axis**, even when it moves every instance.
  Lead with the zero-variant option and state its cost.
- **Two parts in either order → no `Order` axis.** Keep the primary part fixed, give the optional
  one a `Show X` boolean, add a SLOT for the alternative placement.
- **Every property default is set-wide.** A BOOLEAN can't default true on Web and false on Mobile;
  an INSTANCE_SWAP default changes on every variant when you `swapComponent()` on one. When a
  default must differ per platform, **put the boolean on the child and the platform on the parent**,
  and set the per-variant value as an instance override in the parent's variants (UpS
  `RichTextEditor` toolbar).
- **A swapped-in instance takes its main's natural size**, and aspect-lock doesn't survive a swap.
  Per-size art through a swap means size-matched parts by hand; an exposed HUG set avoids it.
- **Coupled booleans must be documented or merged.** A header `Action` toggle and a row `Action`
  toggle that must both be off are two switches for one decision — say so in both descriptions, or
  replace them with slot content.
- **Platform differences**: variable/mode first, a `Platform` axis (Web · Mobile only) second, a
  separate component third. Never iOS vs Android.

## Slots

- **Variable counts are slots.** Rows, columns, cells, menu items: if a count is fixed, propose a
  SLOT rather than a boolean per item. Composing inside a slot is normal use, not a kit gap.
- **Create a slot with `set.addComponentProperty(name, 'SLOT', '')` + `componentPropertyReferences
  = { slotContentId }`** (or `figma_add_slot_property` on an existing direct-child frame). Bind the
  other variants by setting `slotContentId`, merged with any existing `visible` reference.
- **A slot must be a direct child of the component and cannot nest** — content inside a scroll
  frame can't be slotted without lifting it out first.
- **Test a slot from a fresh instance, never from the main.** A slot inside a nested instance reads
  as FRAME from inside the parent's main and as SLOT in an instance.
- **Product files can't insert UpBase atoms into a kit slot** (they subscribe to the kit only).
  Duplicate an existing child inside the slot instead, and design slot defaults so there is always
  one of each kind to duplicate.
- **Reparenting into a slot keeps instance overrides** — moving existing layers into a new slot
  frame preserved every canvas instance's content in UpS.

## Overrides and the upstream rule

- **Fix atoms upstream, not in the kit.** An indent, padding or colour that belongs to a UpBase
  component is changed in UpBase (a token alias or variant binding). An override on nested remote
  instances in the kit doesn't survive a swap, re-add or reset in a product file — the default
  still comes from UpBase. UpS learned this on 132 sidebar items. Until the UpBase publish lands,
  say the kit shows the old value.
- **Clear a mistaken override with `resetOverrides()`, then re-apply only content** (`Text`,
  `State`, `visible`) — and fingerprint the visible text before and after.
- **There is no per-property reset.** Setting a property back to the main's value still counts as
  overridden; `resetOverrides()` on an instance holding slot content wipes the slot (UpS: 305 → 21
  nodes). When you can't un-override, bind the override to the same token/style as the main and say
  so.
- **`swapComponent()` carries the old instance's overrides** (padding, size, radius). Reset after a
  swap and re-set only the content.
- **Replacing a hand-built node with an instance: copy `componentPropertyReferences` across**, or a
  boolean that used to hide it stops working and a stray element floats when toggled.

## Moving things

- **Rename and reparent freely; never delete and re-create.** Reparenting a component keeps its key,
  so every instance survives (UpS moved 9 Report variants between sets: 0 broken instances).
- **Moved variants bring their property *definitions* as orphans and lose their *references*.**
  Rewire each moved variant to the destination set's property keys, then walk every variant's
  `componentPropertyReferences`, diff against `componentPropertyDefinitions`, and delete what nothing
  references — an unused property blocks publishing.
- After a move, also fix the page's label group, both sets' descriptions and both `Components`
  sections. None of it is automatic.

## Reaching UpBase from a kit

Imports from a kit are flaky in ways the source never is (`references/figma-api-gotchas.md` has the
API detail):

- **Variable import hangs; style import mostly doesn't.** `importVariableByKeyAsync` can stall past
  the 30s ceiling in a kit. **Harvest instead**: collect `boundVariables[*].id` off an existing
  page, `getVariableByIdAsync` each (instant), follow one `VARIABLE_ALIAS` hop to the global tier,
  and `getVariableCollectionByIdAsync(v.variableCollectionId).variableIds` reaches the whole
  collection. `importStyleByKeyAsync` with the keys in `subscription.md` usually works.
- **Component import hangs per key, not per family.** Race each attempt against ~4.5s
  (`Promise.race`) and try several keys in one call; try another variant of the same set and the
  family's simplest standalone component — any one that lands makes the whole set resident. Import
  a **variant** key, never the set key.
- **Anything already used in the file is reachable by node id, instantly**:
  `(await inst.getMainComponentAsync()).parent` is the remote set with every variant. One existing
  wrapper drags in its whole dependency tree.
- `getPublishStatusAsync()` on the UpBase node rules out a publish gap first: `CURRENT` means the
  hang is flakiness, not the two-hop chain. Only then ask the user to drag the component in from
  the Assets panel.

## Composing tables

UpBase `Table` is **column-major** (`Table → Columns → Column → [Header, cell…]`, no row
container), so a row-major kit table (a card per record, a band spanning a row) assembles
`Table / Table cell` instances row-major instead of nesting `Table`. Rules learned on UpS
`GridTable / Row`:

1. **Cells own all the padding — the row has none.** Otherwise content insets twice and the
   selection column drifts from the header's.
2. **One rule per row.** The row draws the hairline; zero every cell's border.
3. **Size-match every nested instance to the row's Size variant.** Reusing one cell variant across
   sizes is silent until padding is removed.
4. **Use `Table / Table Item / Row Control` for the checkbox**, so header and row align by
   construction. It fills `colorBgContainer`, not `headerBg` — override it in header rows (copy
   the header's own paint so the binding comes along) until UpBase ships a header variant.
5. **Header and row carry the same column widths.** Auto-layout has no grow factor; fix the
   secondary columns and let the primary one FILL.
6. **Every column, the action column included, aligns with its own header** (`MIN`, not `MAX`).

## Audit flags that are expected

- `audit-wrappers` → *"Nested layer still named …"*: expected when the kit's naming decision is to
  keep UpBase's name (UpS). Record the decision in the data file and leave it.
- `audit-wrappers` → *"No remote UpBase instance anywhere — is this hand-built?"* on a composition
  built entirely from kit wrappers: expected and correct. The check looks one level down.
- `audit-reuse` → *"binds another component's tokens → Components/Alert/Global/fontSize"*: the
  `Text Base/Strong` style defect (`references/upbase-known-issues.md`), not your binding.
- An overflow probe passing on hug-to-a-cap text is not proof — the text may have shrunk to the
  source's placeholder width. Mutate long and short text on the built node and read its width.
