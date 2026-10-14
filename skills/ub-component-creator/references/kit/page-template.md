# In-page structure for a **kit** component page

> **Scope: Kit mode only.** This **replaces** `references/source/page-template.md`, which describes
> the source library's pages and does not apply here. The two differ by more than detail — see
> *What a kit page is not* below.

The reference implementation is **`❖ Form`** in UpS UI Kit (`9c052aEvpV7gYLhwdatf6g`, page `5:20`),
approved as the kit template on 2026-09-11. When a detail below is ambiguous, read that page.

Tokens and styles are **remote** here — import by key, never look up locally. Use
`scripts/kit/resolve-remote.js`, not `scripts/source/helpers.js`.

## What a kit page is not

A kit page is **not** a smaller copy of a source-library page. Four things that are mandatory in
`references/source/page-template.md` are deliberately absent:

| Source library has | Kit page |
|---|---|
| A 1440 **doc frame** wrapping everything | **None.** The sections sit directly on the page |
| A **Playground** with a Light / Dark pair | **None.** Colour binding is proven in the source library, not re-proven per wrapper |
| `_Docs / Page Footer` | **Does not exist in the kit.** Don't fake one |
| Space Mono `#7B61FF` labels | Plain text on UpBase type styles — see *Labels* |

The Light/Dark pair is the one worth arguing about, so state the reason: a kit wrapper owns no
colour of its own. Every fill inside it belongs to the UpBase component it nests, which the source
library already proves in both themes. A second proof in the kit tests nothing the kit can break.

## The page

```
_Docs / Page Header          ← direct page child, NOT inside a frame
SECTION "Components"
SECTION "Density scale"
SECTION "Example Screens"
```

| Node | Placement |
|---|---|
| `_Docs / Page Header` instance | `x` = the Components section's `x`; `y` such that it sits **77px above** the section's top edge (on Form: section at `y = 0`, header at `y = -395`, height 318) |
| The three sections | Left to right, **300px gaps**, all at `y = 0` |

Re-check the gaps after any section resize — a section grows when you re-space a block, and the
gap silently closes.

### Corner radius is 36 everywhere on the page

Sections and the `_Docs / Page Header` already carry **36**, and every page-level frame must match
it — the device canvases in Example Screens included. They arrive at `0`, which reads as a square
box sitting among rounded ones; set them explicitly.

```js
for (const f of exampleSection.children.filter(c => c.type === 'FRAME')) f.cornerRadius = 36;
```

36 is **page chrome, not component geometry**. A card, tile or surface *inside* a component keeps
its own token radius (`borderRadius`, `borderRadiusLG`) — do not push 36 down into them. Component
sets keep Figma's default 5; that is canvas chrome and is not yours to change.

### Content starts at 120 in *both* axes

The section padding of 120 is a padding, not a left margin. Every section's first content sits at
**`y = 120` as well as `x = 120`** — `Density scale` and `Example Screens` get this right by
construction, and the Components section is the one that gets missed, because block tops are
naturally computed from 0.

**Start the first block at `top = 120`, not `0`.** Charts and TableToolbar were both built with the
first block title flush against the section's top edge and had to be shifted afterwards.

```js
let top = 120;                       // NOT 0
for (const block of blocks) { … top += 70 + node.height + 280; }
```

### The header has no component properties

Every field is a **nested text override**, reached by layer name. The kit's header is
`_Docs / Page Header` on page `_Docs` — id `31:48804`, key
`6a5d39f53ddeeb00d95534ca62b64dd1c8218f53`, 1440×318.

```
Nav Wrapper › Nav › Component        → "Components"
                  › Component name   → the component name
Text Wrapper › Component name        → the component name   (Heading/1)
             › Description           → one line             (Text Base/Normal)
```

**The kit breadcrumb is two segments, not three.** UpBase's header has a `Section / Page / Frame`
trio; this one has `Component / Component name`. Writing three segments here fails silently.

Nothing validates, so **read every override back** after setting it.

## `SECTION "Components"`

One section holds everything: the published components and one demonstration block per component.

### Geometry

| Constant | Value |
|---|---|
| Section padding | 120 — **both axes** |
| First block `top` | **120**, never 0 |
| Published components | top-left of the section, from `x = 120`, `y = 120` |
| Block title `x` | 120 |
| Axis hint `x` | 120, `y` = title + 36 |
| Row label `x` | 140 |
| Variant column `x` | **520 + i × 600** — 520 leaves a 400px gutter for row labels |
| Column label `y` | block top + 40 |
| First variant row `y` | block top + 70 |
| Row pitch | tallest instance in the row **+ 120** |
| Gap between blocks | 280 |

**Pitch 600 for 360-wide variants** — a 240px gap. An earlier 384 pitch (24px gap) was rejected as
too tight. Derive the row pitch from the row's own tallest instance; a fixed step crowds the tall
types (`Textarea`, `Drag and Drop`, `Checkbox Group`).

### The published components go at the top

The wrapper components themselves sit at the **top-left of the section**, above the first block.
They are the artefact the page publishes; the blocks below are documentation of them. They carry
no label group of their own.

### Labels

One **`GROUP` named "Namings and Labels"** per block, holding every label for that block. The name
comes from the reference the kit is modelled on; keep it exact.

| Tier | Style | Colour | Content |
|---|---|---|---|
| Block title | `Heading/4` | `colorText` | the component name, e.g. `Form / Horizontal` |
| Axis hint | `Text SM/Normal` | `colorTextSecondary` | `Type →` · `Type →  ·  Size ↓` |
| Column label | `Text SM/Normal` | `colorText` | the **bare value** — `Text`, not `Type=Text` |
| Row label | `Text SM/Normal` | `colorTextSecondary` | the bare value — `Default`, `Large`, `Small` |

**Bare values, not `Property=Value`.** The axis is already named in the hint directly above, so the
pair reads unambiguously. This is the opposite of `references/source/page-template.md`'s rule, and it is deliberate.

Bind both colours to the UpBase variables. Never the raw `#7B61FF` — that is source-library chrome.

### Derive the labels, never type them

Read the value off each instance's exposed properties, so a label cannot drift from what it labels:

```js
const ex = inst.exposedInstances[0];
const val = label => {
  const k = Object.keys(ex.componentProperties).find(x => x.split('#')[0] === label);
  return k ? ex.componentProperties[k].value : null;
};
val('Type');   // → "Select"
```

### Verify the labels per block, not across the page

Every block shares the same column x-coordinates, so a check that looks for "the nearest instance
at this x" matches the wrong block and reports nonsense. Scope to the nearest variant **below** the
label:

```js
const below = all.filter(i => i.x === relX && i.y > relY);
const gap = Math.min(...below.map(i => i.y)) - relY;   // want ~30
```

This cost two false-positive rounds on the Form build. So did comparing against `Math.min` over
every block at once.

## `SECTION "Density scale"`

Default and Compact columns, instances at full size. Density is a **mode**, never a variant axis.

```js
for (const col of [dimCol, typCol])
  inst.setExplicitVariableModeForCollection(col, col.modes.find(m => m.name === 'Compact').modeId);
```

**Pin both `2. Dimensions` and `3. Typography`, or neither.** Dimensions alone gives 28px controls
holding 14px text — a state that exists nowhere and reads as a rendering bug.

Column labels are `Heading/4` on `colorText`, matching the block titles.

Compact must **visibly** differ. If it doesn't, the component is unbound — fix the binding rather
than accepting the column. On Form: 62→52, 32→28, 32→28.

Columns carry a `paddingLeft` where a nested component hangs a label into a left gutter — see
*Gutters* below.

A **native-only** component renders the Default column alone: at Compact, `controlInteractiveSize`
is 14, below WCAG 2.2 §2.5.8's 24px minimum.

## `SECTION "Example Screens"`

Device canvases — 1440 desktop (grid style applied) and 390 mobile — each with a caption above it
on `Text SM/Normal`, `colorTextSecondary`, saying what the frame proves.

Add a band-edge frame bound to `Size/Screen Size/screen*Max` **only** when a `Web:` line claims
behaviour the device widths don't already show. 390 is below 768, so it proves `<768` by itself.

## Gutters — check before laying anything out

A nested UpBase component may position part of itself **outside its own bounds**. `Form Item /
Horizontal` hangs its label `ABSOLUTE` at `x = −120`, which is what lets a column of rows align
their labels without a grid.

Any container holding such a component — a density column, an example card, a block — must supply
that much left padding, or the part is clipped with no error. On Form this hid the label entirely
in the density columns until `paddingLeft: 120` was added.

Put the gutter on an **inner field-list frame**, not the card, or the card's title indents past the
label column it should align with.

Detect it rather than assuming: compare each child's `absoluteBoundingBox` to the parent's, and
treat a **constant** overflow that does not change with width as a gutter, not a reflow failure.

## Checklist for a finished kit page

**Page**

- [ ] Four nodes: header instance + three sections. **No doc frame, no Playground, no footer**
- [ ] Header at the Components section's `x`, 77px above it, all four overrides written and read back
- [ ] Breadcrumb is **two** segments
- [ ] Sections at 300px gaps — re-checked after the last resize
- [ ] Every section and page-level frame at **radius 36**, device canvases included
- [ ] Every section's first content at **`y = 120`**, not 0 — check the Components section especially
- [ ] No loose nodes outside a section

**Components**

- [ ] Published components at the section's top-left
- [ ] One block per component; column pitch 600; row pitch from the row's tallest instance + 120
- [ ] One `GROUP "Namings and Labels"` per block, holding all of its labels
- [ ] Title `Heading/4`; hint, column and row labels `Text SM/Normal`; colours bound, never raw
- [ ] Column labels carry **bare values**, derived from the instances
- [ ] Every column label ~30px above its column, verified **per block**
- [ ] Column pitch clears the widest label

**Density scale**

- [ ] Default + Compact; both collections pinned on every Compact instance
- [ ] Compact visibly differs
- [ ] Gutter padding where a nested component needs one
- [ ] Native-only component carries no Compact column

**Example Screens**

- [ ] 1440 and 390 canvases, each captioned
- [ ] Band-edge frames only where a declared breakpoint needs proving, bound to `screen*Max`
- [ ] Zero overflow measured in every card, hidden subtrees pruned from the measurement

**Descriptions** — see `references/kit/wrapper-pattern.md` and `references/kit/mode.md` Step 7 for the `Source` block and the
house format.
