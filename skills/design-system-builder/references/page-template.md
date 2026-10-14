# In-page structure for a **source-library** component page

> **Scope: design-system-builder only.** In a product UI Kit, read `ui-kit-builder/references/page-template.md` instead. A kit page has no
> doc frame, no Playground, no Light/Dark pair and no footer, and its labels are plain text rather
> than Space Mono `#7B61FF` — so applying this file there is wrong in four visible ways.

A component page is a document, not a parking space. Apply this layout when building any new
component. Everything lives in one file, `BoGaG48v9BfY7LkMtFs4zh` — pass it as `fileKey` on every
`figma_execute` call so a write can't land in a product file that happens to be open.

Tokens and styles are **local** here: look them up by name, don't import by key.

The reference implementation is the **Button** page (`368:430`) — 70 pages in this file follow it.
`❖ Chat` (`28308:142518`) is the same shape rebuilt with the current rules; read it when a detail
below is ambiguous.

## The page

Four nodes, left to right, laid out at **x = 0 with a 300px gap** between each.

```
FRAME "<Component>"  1440w          SECTION "Components"
├─ _Docs / Page Header                per set:  bold axis heading
├─ FRAME "Container"  1200w                     column value labels
│   ├─ TEXT "Playground"                        [ the component set ]
│   ├─ FRAME "Light Mode"                       row value labels
│   └─ FRAME "Dark Mode"
└─ _Docs / Page Footer              SECTION "Density scale"
                                      Default | Compact, full size
                                    SECTION "Example Screens"
                                      1440 + one per declared band
```

The **doc frame** is the published artefact — what a reader opens. The **sections** are the working
area: sets, density evidence, and context screens. Sections collapse in the layer panel and survive
canvas reorganisation, which is why they are `SECTION` nodes and not frames.

There is **no Info Card** and **no `_Docs / Axis Label`**. Both are retired; the Page Header carries
identity, and the label layer described below carries the axes.

## The doc frame

| Node | Spec |
|---|---|
| `FRAME "<Component>"` | 1440 fixed · `VERTICAL` · gap 80 · align `CENTER` · fill `colorBgContainer` |
| `_Docs / Page Header` (`3739:13678`) | instance, sizing `FIXED` at 1440 |
| `FRAME "Container"` | 1200 fixed · `VERTICAL` · gap 24 · no fill |
| `TEXT "Playground"` | text style `Heading/3` |
| `FRAME "Light Mode"` | `FILL` width · pad 128 · gap 64 · align `CENTER` · fill `colorBgContainer` |
| `FRAME "Dark Mode"` | identical |
| `_Docs / Page Footer` (`3739:13679`) | instance, `FIXED` at 1440 · fill `colorBgLayout` |

### The header has no component properties

Every field is a **nested text override**, reached by node name:

```
Nav Wrapper › Nav › Section   → "Components"
                  › Page      → the category, e.g. "Data Display"
                  › Frame     → the component name
Text Wrapper › [0]            → the component name        (Heading/1)
             › [1]            → one-line description      (Text Base/Normal)
```

Because nothing is a property, nothing validates. **The `Page` segment reads "Typography" on all 70
existing pages** — a copy-paste nobody caught. Set all three segments explicitly and read them back.

## Playground: the Light / Dark pair

Two frames holding the **identical** instance list, each pinning `1. Colors` to its own mode:

```js
const cols  = await figma.variables.getLocalVariableCollectionsAsync();
const color = cols.find(c => c.name === '1. Colors');
frame.setExplicitVariableModeForCollection(color, color.modes.find(m => m.name === 'Light').modeId);
```

Build Light first, then `light.clone()` for Dark — that guarantees the two lists match, which is the
whole point. Swap the trailing marker: **Light ends with `Icon / SunOutlined`, Dark with
`Icon / MoonOutlined`**.

This pair is the colour-binding proof. A hardcoded hex is invisible in Light and unmissable in Dark —
it sits there as a pale rectangle while everything around it inverts. Nothing else on the page catches
that.

Stack instances flat, one per configuration worth showing. The only exception: parts too small to
read stacked — icon-sized things like `Delivery Status` — go in a transparent horizontal `Row` frame.

**Theme is a mode here; density is a mode in `Density scale`.** Never pin both on the same frame.

## `SECTION "Components"`

One section holds **every** set for the component, including its parts. Do not split into
`Master Component` / `Subcomponents` / per-surface sections — Button keeps `Button / Basic`,
`Button / Variant`, `Button Group Compact` and its two internal parts in one section, and Chat keeps
all ten. Naming carries the hierarchy: `Chat / Message Item`, `Chat / Messenger / Thread`,
`Chat / Widget / Panel`.

### Geometry

| Constant | Value |
|---|---|
| Section padding | 120 |
| Axis heading `x` | 120 |
| Row label `x` | 140 |
| Set `x` | 520 — leaves a 400px gutter for row labels |
| Heading `y` | block top |
| Column label `y` | heading + 40 |
| Set `y` | heading + 70 |
| Gap between blocks | 200 |

### The label layer

Per set, one **locked `FRAME " "`** (a single space — Button's convention) holding all its labels,
sibling to the set. Locked so it never gets dragged while arranging variants.

| Tier | Font | Content |
|---|---|---|
| Axis heading | Space Mono **Bold 20**, `#7B61FF` | `Unread, Type →  ·  State ↓` |
| Value labels | Space Mono **Regular 16**, `#7B61FF` | `Unread=False, Type=Direct` above each column; one per row down the left |

`#7B61FF` is Figma's own component purple — the labels read as editor chrome rather than design.

**Write `Property=Value`, not the bare value.** `Layout=Mobile, Empty=True` is unambiguous where
`Mobile, True` needs the heading to decode. The exception is a property whose values are already
self-describing: **`State` prints bare** — `Default · Hover · Focused · Active · Disabled`. Keep that
list short; every addition costs a reader the property name.

### Derive the labels, never type them

Read them off the variants' real coordinates, so a label cannot drift from the grid it sits on:

```js
const vs = set.children.map(v => ({ x: Math.round(v.x), y: Math.round(v.y),
  p: Object.fromEntries(v.name.split(', ').map(t => t.split('='))) }));
const xs = [...new Set(vs.map(v => v.x))].sort((a,b) => a-b);
const ys = [...new Set(vs.map(v => v.y))].sort((a,b) => a-b);
const props = Object.keys(vs[0].p);

// a property belongs to an axis only if it is constant along every line of that axis
const colConst = props.filter(pr => xs.every(x =>
  new Set(vs.filter(v => v.x === x).map(v => v.p[pr])).size === 1));
const rowConst = props.filter(pr => ys.every(y =>
  new Set(vs.filter(v => v.y === y).map(v => v.p[pr])).size === 1));
```

`colConst` and `rowConst` give both the heading and, read off any variant in that column or row, the
value labels.

### Two things this analysis will catch

**A set that isn't a matrix.** If a property lands in neither `colConst` nor `rowConst`, Figma's
auto-arrangement has it varying in both directions and no honest label exists. `Chat / Message Item`
arrived as 2 columns × 4 rows with `Position` scattered across both; re-gridded to 4 × 2
(`Position →`, `Direction ↓`) it labels cleanly. **Re-grid the set, don't fudge the label.** Moving
variants inside a set changes no variant name, so no instance breaks.

**A column pitch too tight for its label.** Space Mono 16 runs ≈ 9.6px per character, so
`Status=Delivered` needs ~178px while `Delivery Status`'s variants sat at a 46px pitch — five labels
collapsed into mush. Check it and re-space:

```js
const need = Math.ceil(widestLabel.length * 9.6) + 24;
if (pitch < need) /* re-space at Math.max(need, variantWidth + 24) */;
```

Three of Chat's ten sets needed this. Run the check every time labels change length — switching a
property to `Property=Value` form is exactly such a change.

Re-spacing alters a **published component's** canvas size. Harmless to instances, worth saying out
loud in the changelog.

## `SECTION "Density scale"`

Density is a **mode**, not a variant. There is exactly one component set; each density version is
that same set with two collection modes pinned on the instance. `Space/*`, `Size/*` and all 20 text
styles alias into `2. Dimensions` and `3. Typography`, which is what makes this work.

The scale has **two points: `Default` and `Compact`**, both pointer-device densities. There is no
touch density — see `references/foundations.md` § *Density modes*.

**Do not add a `Density` variant axis.** A `Density = Default | Compact` property doubles the variant
count, forces every value to be hand-set twice, and immediately drifts from core. If the two versions
differ by anything a mode can't express, the component is unbound — fix the binding, don't add an axis.

### Layout

A `Grid` frame, one column per density point, each labelled, instances at **full size** — this is the
artefact someone opens to decide whether Compact is usable for their screen, so it has to be readable.

| Column | How it is rendered | Present when |
|---|---|---|
| **Default** | set at page default — nothing pinned | always |
| **Compact** | pin `2. Dimensions` **and** `3. Typography` → Compact | component reaches web |

**No delta note on canvas.** What moved between densities, and what deliberately didn't, belongs in
the component description under `Raw values` — one place, nothing to keep in sync. The canvas shows
the two columns and lets them speak.

```js
const cols   = await figma.variables.getLocalVariableCollectionsAsync();
const dimCol = cols.find(c => c.name.includes('Dimensions'));
const typCol = cols.find(c => c.name.includes('Typography'));

for (const col of [dimCol, typCol]) {
  inst.setExplicitVariableModeForCollection(col, col.modes.find(m => m.name === 'Compact').modeId);
}
```

**Pin both or neither.** Dimensions alone gives 28px controls still holding 14px text — a state that
exists nowhere in the system and will read as a rendering bug.

For reference, the deltas the modes carry:

| Token | Default → Compact |
|---|---|
| `controlHeight` / `LG` / `SM` | 32→28 · 40→35 · 24→21 |
| `controlInteractiveSize` | 16→14 |
| `padding` · `paddingSM` · `paddingXS` | 16→8 · 12→8 · 8→4 |
| `paddingContentVertical` / `Horizontal` | 12→8 · 16→12 |
| `fontSize` · `fontSizeSM` · `lineHeight` | 14→12 · 12→10 · 22→20 |
| radii · line widths · breakpoints | **unchanged** |

### Which density columns a page carries

The rule keys off the **component's platform reach**, settled at Phase 0c:

| Component reaches | Density columns |
|---|---|
| **Web only**, or **web + native** | Default + **Compact** |
| **Native only** (`Tab Bar`, `Action Sheet`, `Swipe Action`…) | Default only |

**Never Compact on a native-only component.** At Compact, `controlInteractiveSize` is 14 and
`controlHeightXS` is 14 — below WCAG 2.2 §2.5.8's 24px minimum and far below the touch target Apple
and Material both hold to. Density switches on input device, and a phone has no pointer. A
native-only page renders the Default column alone, and the description says Compact does not apply.

**A cross-platform component still renders one Compact pair.** Compact is a pointer-device density,
so it documents the web rendering; nothing about it is per-platform.

## `SECTION "Example Screens"`

The component in a realistic context, at the widths where its declared responsive behaviour actually
changes something. Each frame gets a `Caption` text node above it saying what it proves.

**Example Screens stay Default**, with one exception: data-dense components — `Table`,
`Descriptions`, `Tree`, list-like patterns — get a second 1440 frame at Compact, because the dense
screen *is* the argument for the mode. For everything else an extra density screen is a duplicate
that will rot.

### Screen sizes

Two kinds of frame live here and they follow **opposite** rules. Mixing them up is what makes an
example section either unreadable or unprovable.

| Kind | Width | Bind `width` to |
|---|---|---|
| **Device canvas** — what the thing actually looks like to a person | 1440 desktop (grid style applied) · **390 mobile** · tablet at the device you design for | **nothing.** These are real device widths, not breakpoints |
| **Band-edge frame** — exists only to prove a declared breakpoint | the band's widest pixel | `Size/Screen Size/screen*Max` |
| **Native** | `Compact` 393×852 and `Expanded` 1194×834 | nothing |

A page usually wants device canvases; it wants a band-edge frame only when a `Web:` line makes a
claim that the device widths don't already demonstrate. **390 is below 768, so it proves `<768` on
its own** — adding a 767 frame beside it is a second mobile screen nobody asked for.

**When you do build a band-edge frame, bind to `screen*Max`, not `screen*`.** To show what
`<768 stack` does you need the widest pixel *still inside* the narrow band — `screenSMMax` = **767**.
Binding to `screenSM` (576) lands you on a boundary, the one place where it is ambiguous which side
you are demonstrating.

| Declared | Frame binds | = |
|---|---|---|
| `<576` | `screenXSMax` | 575 |
| `<768` | `screenSMMax` | 767 |
| `<992` | `screenMDMax` | 991 |
| `<1200` | `screenLGMax` | 1199 |
| `<1600` | `screenXLMax` | 1599 |

Binding rather than typing the number buys three things: the frame is **provably** in the band, every
example frame moves if Ant ever changes a breakpoint, and `_shared/scripts/audit-platform.js` can check the binding
instead of comparing a number that happens to be close.

A component whose declaration is empty needs only the device canvases.

## Everything else lives in the component description

There is no card, no on-canvas doc block, no `_Docs / Variable Item` list. Description, properties,
responsive behaviour, raw values, **changelog** and search metadata all live in the **component
description**, which every set already carries and which is what Figma asset search actually matches.

One place, so there is nothing to keep in sync. **Add something to the canvas only when it genuinely
cannot live in the description** — anything that duplicates it will drift and nobody will notice
which copy is stale.

### Search synonyms

Under `**Search metadata**` in the description. Figma's asset search matches descriptions, so keywords
there make a component findable by words that aren't its name. Designers arrive from several
vocabularies, and the name in use is only one of them.

| Component | Synonyms worth carrying |
|---|---|
| `Spin` | busy indicator, loading, spinner, **activity indicator** |
| `InputNumber` | step input, numeric input, **stepper** |
| `Rate` | rating indicator, star rating |
| `Message` | toast, snackbar |
| `Result` / `Empty` | illustrated message, empty state |
| `Select` | combobox, multi combobox, **picker** |
| `FloatButton` | back to top, floating action, fab |
| `Collapse` | panel, **accordion** |
| `Segmented` | **segmented control** |
| `Alert` | **notice bar**, banner |
| `Upload` | **image picker**, file upload, attachment |
| `Statistic` | KPI, metric |
| `Chat` | messenger, conversation, thread, **support widget** |

Bold entries are what a native designer will type. Carrying them is what stops someone building a
second `Activity Indicator` next to `Spin`.

## Plugin API notes

The file runs with `documentAccess: dynamic-page`. Four things bite:

- `await figma.loadAllPagesAsync()` before touching anything off the current page
- `figma.setCurrentPageAsync(page)` — the `currentPage` setter throws
- `node.getMainComponentAsync()` — the `mainComponent` getter throws
- `figma.loadFontAsync()` **before** setting `characters`, including `Inter Regular`, which a freshly
  created text node adopts before you restyle it

`strokeWeight` and `cornerRadius` return `figma.mixed` (a symbol) on mixed nodes and will fail
`postMessage` serialisation — coerce before returning them.

## Checklist for a finished page

**Doc frame**

- [ ] 1440 frame present, gap 80, filled `colorBgContainer`
- [ ] Page Header and Page Footer instances, both `FIXED` at 1440
- [ ] Breadcrumb `Section / Page / Frame` all three set — **not** the inherited "Typography"
- [ ] Title and one-line description written; title matches the component name
- [ ] `Playground` heading on `Heading/3`
- [ ] Light Mode and Dark Mode hold the **identical** instance list
- [ ] Each pins `1. Colors` to its own mode; Sun closes Light, Moon closes Dark
- [ ] Nothing in the pair looks unchanged between themes — if it does, a colour is hardcoded

**Components section**

- [ ] One section, every set in it, hierarchy carried by `Parent / Child` naming
- [ ] Every set is a real matrix — each property constant along a column or a row
- [ ] One locked `FRAME " "` per set holding its labels
- [ ] Bold 20 axis heading with `→` / `↓`; Regular 16 values, `#7B61FF` Space Mono throughout
- [ ] Values written `Property=Value`, except `State`, which prints bare
- [ ] Labels derived from variant coordinates, not typed
- [ ] Column pitch clears the widest label; sets re-spaced where it didn't
- [ ] No `Density` variant axis on any set

**Density scale**

- [ ] Columns match platform reach — native-only pages carry no Compact column
- [ ] Every Compact instance has **both** `2. Dimensions` and `3. Typography` pinned
- [ ] Compact visibly differs from Default — if it doesn't, spacing or type is unbound
- [ ] No delta note on canvas; the deltas are in the description

**Example Screens**

- [ ] Right sizes; each declared band's frame bound to its `screen*Max`
- [ ] Every frame captioned with what it proves
- [ ] Declared breakpoints actually tested, not just written (`_shared/references/verification.md` §2b)

**Page**

- [ ] Four nodes, 300px gaps, no overlaps — **re-check after any section resize**
- [ ] No loose nodes outside a section or the doc frame

**Component description**

- [ ] `Responsive` lines match what was actually asked for — no line invented, none omitted
- [ ] No `Native:` line unless the component ships to mobile
- [ ] Only the nine verbs used, and no line says `reflow`
- [ ] `Reviewed:` present — including when the component declares nothing
- [ ] Every raw value from `_shared/scripts/audit-coverage.js` appears under `Raw values` with a reason
- [ ] Changelog entry written for this build
- [ ] Search metadata carries the synonyms from the table above, if any apply
- [ ] Interactive component carries all five states: `Default · Hover · Focused · Pressed · Disabled`
- [ ] Component name doesn't collide with anything already in the library
