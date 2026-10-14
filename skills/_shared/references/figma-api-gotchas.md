# Figma plugin API traps

> **Shared by every skill.** These are properties of the Figma plugin API, not of any one file. Read
> this before writing plugin code, whichever skill you are in.

Every item here cost real rework in practice. Most of them **fail silently** — the call succeeds, the
report says fine, and the canvas is wrong. That is why Phase 5 insists on reading back.

## Contents

- [A timeout is not a rollback](#a-timeout-is-not-a-rollback) ← read this before any build
- [Silent failures](#silent-failures) ← the expensive ones
- [Async-only APIs](#async-only-apis)
- [Colour and alpha](#colour-and-alpha)
- [`importStyleByKeyAsync` can start hanging mid-session](#importstylebykeyasync-can-start-hanging-mid-session)
- [`isExposedInstance` needs a component parent — set it last](#isexposedinstance-needs-a-component-parent--set-it-last)
- [A SLOT cannot be cloned — slot-ness lives in a component property](#a-slot-cannot-be-cloned--slot-ness-lives-in-a-component-property)
- [Moving variants does not resize the COMPONENT_SET](#moving-variants-does-not-resize-the-component_set)
- [Icons](#icons)
- [Auto-layout ordering](#auto-layout-ordering)
- [Component properties](#component-properties)
- [Variant sets](#variant-sets)
- [Destructive operations](#destructive-operations)
- [Variable modes](#variable-modes)
- [SECTION children use coordinates relative to the section](#section-children-use-coordinates-relative-to-the-section)
- [Changing `layoutMode` drops a bound width](#changing-layoutmode-drops-a-bound-width)
- [A hidden child breaks HUG silently — check `visible` first](#a-hidden-child-breaks-hug-silently--check-visible-first)
- [`maxLines` needs three preconditions and an order](#maxlines-needs-three-preconditions-and-an-order)
- [A styled text range survives instancing but not a text override](#a-styled-text-range-survives-instancing-but-not-a-text-override)
- [`layoutWrap: WRAP` does not give you inline text flow](#layoutwrap-wrap-does-not-give-you-inline-text-flow)
- [`descriptionMarkdown` normalises whitespace](#descriptionmarkdown-normalises-whitespace)
- [Hug-to-a-cap text can't live inside an instance](#hug-to-a-cap-text-cant-live-inside-an-instance)
- [`resize()` on an auto-layout frame flips it to FIXED](#resize-on-an-auto-layout-frame-flips-it-to-fixed)
- [Fixed-ratio art with a token-bound height](#fixed-ratio-art-with-a-token-bound-height)
- [Equal-height cards per row need GRID with HUG rows](#equal-height-cards-per-row-need-grid-with-hug-rows)
- [Auditing without false positives](#auditing-without-false-positives)

## A timeout is not a rollback

**`figma_execute` caps at 30 seconds**, whatever `timeout` you pass — the schema's maximum is
`30000` and larger values are silently clamped. So every build has to be chunked.

The dangerous half is what happens next. When the call times out, **the MCP client gives up but the
plugin keeps running and usually finishes.** The tool reports failure; the canvas gets the work
anyway.

Two consequences, both observed while building `FilterBar`:

- **Reading the page straight after a timeout can show nothing**, because the plugin hasn't
  committed yet. A later read showed the full 14-variant set the "failed" call had created.
- **Retrying produces duplicates.** A retried chunk left 6 orphan components beside the set that the
  first, "failed" call had already built.

So after any timeout: **wait, re-read, and reconcile before retrying.** Never assume the work didn't
land. Give every build script an existence guard as its first act, so a retry refuses rather than
duplicates:

```js
if (page.findOne(n => n.type === 'COMPONENT_SET' && n.name === TARGET))
  return { fatal: `${TARGET} already exists — edit it instead` };
```

Note this contradicts the older advice below that "a failed `figma_execute` is atomic". That holds
for a **thrown error** — the plugin unwinds and nothing is written. It does **not** hold for a
timeout, which is a client-side give-up.

**A timeout is not all-or-nothing either.** One call that timed out had already committed its
`setCurrentPageAsync` — the page really had changed — while the node edits after it were lost. So
"did it land?" has to be answered per effect, not per call. Re-read before retrying.

### A thrown error can unwind more than its own call

Observed twice while building `RichTextEditor`. Two calls had already succeeded and been
**read back**: one set `layoutWrap = 'WRAP'` and removed a child, the next added nine component
properties and returned their keys. Two later calls then threw (an unloaded font, then an illegal
`isExposedInstance`). Afterwards the toolbar had `NO_WRAP`, **zero** properties, and the removed
child was back — the two verified calls had been rolled back with the failing ones.

The practical rule: **a verified result is not durable until a later, separate call re-reads it.**
After any thrown error, re-check the work that came *before* it, not just the work that failed.
Re-applying is cheap; discovering it three steps later is not.

### Import one variant, not a whole set

`importComponentSetByKeyAsync` on a large set can exceed the 30s budget on a cold cache and never
return. `importComponentByKeyAsync` on a single **variant** of the same set took ~140ms warm and
~7s cold. A wrapper only ever nests one variant, so import the variant key.

Cold imports are also much slower than warm ones. On a big build, warm the cache in its own call
first — ten variants imported in 4.7s once warm, having individually cost seconds cold.

## Silent failures

**Never wrap plugin calls in a bare `try/catch` that swallows the error.** This is the single biggest
source of wasted time: `setProperties` with a wrong key throws, the catch eats it, and the run reports
success while nothing changed. Collect errors and return them:

```js
const errs = [];
try { inst.setProperties({ [key]: value }); }
catch (e) { errs.push(`${inst.name}: ${e.message}`); }
return { errs };   // return it — don't discard it
```

**Verify counts, not just absence of errors.** Expected 2 variants × 5 properties = 10 bindings but
got 8? Something didn't match. A name-pattern assumption failing quietly is the usual cause — an
instance is often named after its **component set**, not its variant (`Chat / Widget / Conversation
Status`, not `Status=Open`).

**Read back anything you report as fixed, in the same call.** A binding that "succeeded" may not have
taken (see stroke weight below).

**If `design-system-builder/scripts/audit-system.js` reports all zeros, the active target drifted to another file.** It is not a
configuration problem. Re-check `figma_list_open_files` and re-pin — never "fix" it by creating
local variables or styles.

## Async-only APIs

With `documentAccess: dynamic-page`, these throw if you use the sync form:

| Wrong | Right |
|---|---|
| `figma.currentPage = page` | `await figma.setCurrentPageAsync(page)` |
| `instance.mainComponent` | `await instance.getMainComponentAsync()` |
| — | `await figma.loadAllPagesAsync()` before touching other pages |
| — | `await node.setTextStyleIdAsync(id)`, `setEffectStyleIdAsync`, `setGridStyleIdAsync` |

Also load every font before setting `characters`: `await figma.loadFontAsync(node.fontName)`.

## Colour and alpha

**A bound colour variable's alpha does not transfer to the paint's opacity.** Bind
`colorFillTertiary` (black @ 4%) naively and you get **solid black**. Resolve the variable through
its aliases and set `opacity` explicitly — `paintVar()` in `design-system-builder/scripts/helpers.js` does this:

```js
const rgba = await resolveVar(v);                    // follow VARIABLE_ALIAS chain
const p = { type:'SOLID', color:{r:rgba.r,g:rgba.g,b:rgba.b},
            opacity: rgba.a !== undefined ? rgba.a : 1 };
return figma.variables.setBoundVariableForPaint(p, 'color', v);
```

### A bound paint cannot carry a custom opacity into an instance

This one has two layers and cost four iterations. Building light-on-dark chrome (video controls,
overlays, scrims) means wanting a **bound** colour at a **custom alpha** — white at 30%. That is not
directly possible.

**First trap:** `setBoundVariableForPaint` discards an `opacity` set on the paint you hand it. Assign
the fill, then read-modify-write, and the main component looks right:

```js
node.fills = [figma.variables.setBoundVariableForPaint(base, 'color', v)];
node.fills = node.fills.map(p => ({ ...p, opacity: 0.30 }));   // sticks on the main component ONLY
```

**Second trap, the expensive one:** that opacity is **re-resolved to the variable's own alpha in every
instance**. Measured directly — main component `0.30`, fresh instance `1`. So a 30%-white rail is
correct on the component and solid white everywhere it is used, which is invisible until you screenshot
a composition rather than the set.

The rule: **paint opacity survives instancing only when it equals the variable's own alpha.**
`colorBgMask` is 45% black, so a scrim at `opacity: 0.45` is stable. `colorTextLightSolid` is opaque, so
white at any alpha < 1 is not.

**Fix — put the alpha on the layer, not the paint:**

```js
node.fills = node.fills.map(p => ({ ...p, opacity: 1 }));  // paint stays bound, fully opaque
node.opacity = 0.30;                                        // layer alpha, inherited by instances
```

If the node has children that must stay at full strength (an icon inside a hover chip), the layer
opacity would dim them too — add a dedicated absolutely-positioned `Backdrop` child behind them and put
the alpha on that instead.

**Always verify through a throwaway `createInstance()`, not the component.** Checking the main
component is what makes this bug survive review.

## `importStyleByKeyAsync` can start hanging mid-session

In a kit, style import is not reliably repeatable. During one `RichTextEditor` session
`figma.importStyleByKeyAsync('1bf8…')` returned in **13ms**, and twenty minutes later the identical
call never returned — three consecutive 20–28s timeouts, with `figma_get_status` reporting a healthy
bridge and `loadAllPagesAsync()` completing in 0ms. It is the same failure mode already recorded for
`importVariableByKeyAsync` in a kit; variable import kept working throughout, so the two fail
independently.

Bisect before believing a hang is "the plugin being slow": return timings from inside the call, then
halve it. A hang reports nothing, so the only way to locate it is to make the call small enough that
what's left is the culprit.

**The workaround is to stop importing and start harvesting.** A published style is already applied
somewhere in the file, so read it off a node that has it and apply the id directly:

```js
const src = labelGroup.children.find(c => c.type === 'TEXT' && c.characters === 'Type →');
await myText.setTextStyleIdAsync(src.textStyleId);   // no import, no network
```

Better still for a label, **`clone()` the existing node**: it carries the text style *and* the
bound-variable fill, so the copy cannot drift from the page it is modelled on. That is how
`❖ RichTextEditor`'s label groups were built after style import stopped responding — cloned from
`❖ Form`, the approved template page. The same trick works for effect and grid styles
(`gridStyleId` + `setGridStyleIdAsync`).

## `isExposedInstance` needs a component parent — set it last

`inst.isExposedInstance = true` throws *"Instance must be contained within a component or component
set to be exposed"* if the instance is still inside a plain FRAME. The usual build order —
frame, append children, `createComponentFromNode` — therefore cannot set exposure inline:

```js
const comp = figma.createComponentFromNode(root);        // FIRST
comp.children.find(c => c.name === 'Toolbar').isExposedInstance = true;   // THEN
```

Related, and already true of wrappers: read exposure back from an **instance**
(`inst.exposedInstances`), never from the main component, where it reports `[]`.

## A SLOT cannot be cloned — slot-ness lives in a component property

**There is no `figma.createSlot()`** — it is `undefined`. The obvious workaround, cloning an existing
slot from another component, produces a node that **reports `type === 'SLOT'` and is not a slot**.
Nothing warns you, and on the main component side it is indistinguishable from the real thing.

Measured on `Card / Basic`, against genuine slots in `Modal / Basic` and `Table / Table cell`:

| | main component | inside an instance | `appendChild` from an instance |
|---|---|---|---|
| Genuine slot | `SLOT` | `SLOT` | allowed |
| Cloned slot | `SLOT` | **`FRAME`** | **"Cannot move node. New parent is an instance…"** |

Cloning the whole **component** degrades it too — the copy's slot is already a `FRAME` before you
touch it. So no duplication route works.

What actually distinguishes them is one field:

```js
real.componentPropertyReferences  // { slotContentId: "Content Wrapper#28372:0" }
mine.componentPropertyReferences  // {}
```

A slot is backed by a **component property of type `SLOT`** on the set. Create that, point the node
at it, and the node becomes a real slot:

```js
// defaultValue must be a string/boolean — null and {} both fail validation
const key = set.addComponentProperty('Content', 'SLOT', '');
slotNode.componentPropertyReferences = { slotContentId: key };
```

A `SLOT` property may be referenced by only *some* variants, which is what lets one set carry a
slotted body on four variants and a nested `Tabs` instance on the other four.

**Verify functionally, never by `type`.** The acceptance test is: instantiate, then `remove()` the
default content and `appendChild()` a real component. Reading `type === 'SLOT'` passes on a node that
does nothing.

**Adding a variant axis by cloning variants drops more than slots** (measured on `Card / Basic`,
2026-10-08): every clone lost its slot references *and* the title's `{ characters: 'Title#…' }`
text-property reference — the instance's Title control still showed, but setting it changed
nothing. After cloning, diff `componentPropertyReferences` across the whole tree of each old/new
variant pair and re-point what's missing, then prove it by setting each property on a fresh
instance.

**`maxWidth` cannot be bound to a variable on a TEXT node** (`setBoundVariable('maxWidth', …)` →
"invalid field for text node"). Frames accept it, but a frame carrying the cap around a FILL text
freezes its width (see [Hug-to-a-cap text can't live inside an instance](#hug-to-a-cap-text-cant-live-inside-an-instance)), so a text cap is a raw value, listed under the
description's `Raw values`.

## Moving variants does not resize the COMPONENT_SET

Re-gridding a set — the Phase 3 "re-grid the set, don't fudge the label" move — leaves the set's own
frame at its **old** size, so every variant outside it is clipped on canvas. Nothing errors.

Worse, the stale size is what you read back *in the same call and in the next one*: after moving 64
variants out to a 2008×1014 extent, `set.width/height` still reported **230×106** across two separate
`figma_execute` calls. So this is not the usual read-back-in-a-later-call fix — the set genuinely has
not resized, and any layout arithmetic done from `set.height` silently places the next block on top
of it.

Resize it yourself from the variants' own extent, and normalise their origin while you are there:

```js
const pad = 24;
const minX = Math.min(...set.children.map(c => c.x));
const minY = Math.min(...set.children.map(c => c.y));
for (const c of set.children) { c.x = c.x - minX + pad; c.y = c.y - minY + pad; }
set.resizeWithoutConstraints(
  Math.max(...set.children.map(c => c.x + c.width))  + pad,
  Math.max(...set.children.map(c => c.y + c.height)) + pad);
```

Then re-derive any block position that depended on the set's height — and re-check the page's 300px
section gaps, because a section grown around the new set closes the gap to its neighbour silently.

## Icons

An icon component is a container plus vector geometry. Painting everything makes a **solid filled
square**. Paint only vector-type nodes, clear the containers, and clear the instance root — which
keeps its own fill from the source component:

```js
const VECTORISH = new Set(['VECTOR','BOOLEAN_OPERATION','STAR','ELLIPSE','POLYGON','LINE','RECTANGLE']);
// vector nodes → the paint; everything else including the instance root → fills = []
```

## Instance descendants cannot be resized from the plugin API

`resize()` and `resizeWithoutConstraints()` on a node **inside an instance** throw nothing and change
nothing. Proven directly: a nested bar stayed at its main component's 140px through both calls, while
the identical call on a `detachInstance()` copy gave 51.2px. The Figma **UI** allows this resize and
creates an override — only automation is blocked.

**Exception — slot content.** A node inside a SLOT of an instance *can* be resized, at any depth:
measured 2026-09-28 in UpS Product 2026, a header cell in `GridTable`'s `Columns` slot and a cell in
the `Cells` slot of a row inside the `Rows` slot both took `resize(120, h)`. Slot content is owned
by the instance, so the lock does not apply — which is what makes column widths settable at all.

**Stale handles inside nested slots.** A node created in the same call as the frame it goes into
and then appended into a slot of an instance keeps a short id (`20:24173`) whose children resolve to
`I20:24173;106:30810` — a path that **does not exist**. It renders correctly, but every later
traversal (`findAll`, `.children`, `.name`) throws *"The node (instance sublayer…) does not
exist"*, so every audit crashes on it. A node inserted into an **already-slotted** frame in a later
call gets a full path id and is fine. Fix: remove and re-create the affected instances in a separate
call, then walk the whole tree catching per-node errors to prove zero remain.

This matters whenever a component expresses state as a **width**: progress bars, scrubbers, meters,
volume levels. You cannot bake several preset fill levels into variants that nest a shared bar
component.

- Need one default the designer adjusts by hand → nest the instance, set the default in the main.
- Need N different levels baked into N variants → **draw the bars in that component**, don't nest.

Related trap: a child with `constraints.horizontal = 'SCALE'` has a *derived* width, so even in the UI
its size follows the parent. Use `MIN` plus an explicit width for anything meant to be set.

## Auto-layout ordering

Order of operations matters and the errors are confusing:

- `layoutSizingHorizontal` / `layoutSizingVertical` only work **after** the node is appended to an
  auto-layout parent. Setting them earlier throws "must be an auto-layout frame or a child of one".
- `resize()` **resets** `primaryAxisSizingMode` to FIXED. If you want hug, set sizing modes *after*
  resizing, or the frame collapses to the height you passed.
- Negative `itemSpacing` is allowed and is the clean way to overlap (e.g. a double-check glyph).
- A hidden child collapses its space. To keep an indent when an avatar is toggled off, wrap it in a
  fixed-width **slot** frame and toggle the child inside, not the slot.

## Component properties

- **Property keys carry a `#id` suffix.** `setProperties({'Message Text': ...})` fails; you need
  `'Message Text#28248:0'`. Always read the real keys:
  ```js
  const keys = Object.keys(set.componentPropertyDefinitions);
  const K = label => keys.find(k => k.split('#')[0] === label);
  ```
- **Switching a variant resets overrides.** Set variant properties first, then content properties, in
  two separate `setProperties` calls — otherwise the text override is discarded.
- If an instance's content still won't stick, set the inner text node's `characters` directly. That is
  a legitimate override and always works.
- `INSTANCE_SWAP` defaults take a **node id** string.
- **Every property default is set-wide — INSTANCE_SWAP included.** `swapComponent()` on one
  variant's bound instance rewrites the property's `defaultValue`, and every other variant follows.
  Different illustrations per variant are impossible; pick one default (IllustratedMessage, 2026-10-01).
- **A nested instance keeps the size baked into its parent's main — unless its component is
  auto-layout HUG.** Switching a non-auto-layout variant (`Empty / Image`, 184×117 → 184×152)
  resizes a loose instance but squashes a nested one. Wrap the art in a HUG auto-layout frame and
  the nested switch resizes properly (72×72 → 125×147 → 184×117). That is how
  `IllustratedMessage / Illustration` scales per size.
- Add properties on the **component set**, then set `componentPropertyReferences` on the matching
  layer inside each variant (`characters`, `visible`, `mainComponent`).
- A property may be referenced by only *some* variants. Useful when one variant needs its own fixed
  default.

## Variant sets

- Build components, then `figma.combineAsVariants(comps, parent)`, then set the set's name.
- Variant component names are the axis string: `"Direction=Outgoing, Position=Single"`.
- Component-set container frames carry a default **5px radius** — that's canvas chrome, not component
  geometry. Don't "fix" it, and exclude it from radius audits.
- The set's own frame fill is presentational. Giving it a dark fill is a legitimate way to make
  white-on-colour icons visible on canvas.

## Stroke weight

Binding `strokeWeight` **silently does nothing** when per-side weights are set (which happens as soon
as you set `strokeTopWeight = 0` for a single-edge border), because the value becomes mixed. Bind each
side that is non-zero:

```js
for (const side of ['strokeTopWeight','strokeBottomWeight','strokeLeftWeight','strokeRightWeight'])
  if (node[side] > 0) node.setBoundVariable(side, lineWidthVar);
```

## Destructive operations

**Never delete by filtering a parent's children.** `page.children.filter(n => n.type !== 'SECTION')
.forEach(n => n.remove())` looks safe and deleted three sections in practice. Delete by explicit id,
and check what you're about to remove.

Orphaned nodes survive removal from a parent (`node.parent === null`, `removed === false`), so a
mis-deleted component set can usually be re-appended rather than rebuilt.

## Variable modes

### `addMode` seeds from the LAST mode, not the first

Adding `Touch` to a collection whose modes read `Default / Compact` copies **Compact's** values into
it, so every token you don't set by hand starts at its tightest value — and the new mode comes out
*smaller* than Default. Nothing warns you. Spot-checking a control height won't catch it either,
because those are exactly the tokens you set explicitly; it's the untouched padding that ends up
wrong.

After `addMode`, copy the Default value into the new mode for every token you are not setting
yourself, then read back that nothing differs from Default except what you meant to change:

```js
const d = col.modes.find(m => m.name === 'Default').modeId;
const t = col.addMode('Touch');
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v || EXPLICIT.has(v.name.split('/').pop())) continue;
  const dv = v.valuesByMode[d];
  if (dv === undefined) continue;
  v.setValueForMode(t, (dv && typeof dv === 'object' && dv.type === 'VARIABLE_ALIAS')
    ? figma.variables.createVariableAlias(await figma.variables.getVariableByIdAsync(dv.id))
    : dv);
}
```

Note the alias branch: copying `valuesByMode` straight across turns an alias into a dead reference.

## SECTION children use coordinates relative to the section

A page's direct children are positioned in page space, so `node.x` reads like an absolute
coordinate. **A section's children are not** — their `x`/`y` are relative to the section origin.
Writing `child.x = section.x + 60` therefore places the child at `2 × section.x + 60`, which at a
section sitting 29,330px out lands it 30,000px away with no error.

The trap is that arithmetic on `x`/`y` still *validates*: a containment check written in the same
coordinate space returns `true` while the canvas shows the content nowhere near its section. Two
screenshots looked identical before this surfaced.

- Inside a section, set `child.x = 60`, not `section.x + 60`.
- **Verify placement with `absoluteBoundingBox`, never with `x`/`y`.** It is the only reading that
  crosses coordinate spaces correctly.
- Place children first, then `resizeWithoutConstraints` the section around them.

## Changing `layoutMode` drops a bound width

Switching a frame between `HORIZONTAL` and `VERTICAL` resets its sizing modes, and a width binding
does not survive that: the frame silently reverts to `HUG` and the bound variable is gone. No error.

For a `VERTICAL` frame the horizontal axis is the **counter** axis, so the order that works is:

```js
f.layoutMode = 'VERTICAL';
f.counterAxisSizingMode = 'FIXED';        // must be fixed before a width bind will hold
f.resize(767, f.height);
f.setBoundVariable('width', screenSMMax);
for (const k of f.children) k.layoutSizingHorizontal = 'FILL';
```

Re-read `boundVariables.width` afterwards — it is the only way to know the bind took.

## A hidden child breaks HUG silently — check `visible` first

A frame with `visible: false` renders nothing **and contributes nothing to its parent's HUG height**.
The result looks exactly like a broken auto-layout: content sits outside the parent's bounds, the
parent's height is short by exactly the hidden child's height, and every sizing property you inspect
reads correct.

The tell is the geometry itself: the child's `y` is **correct in flow** (`padding + sibling + gap`)
while the parent's height is not. Positions that consistent are not a layout bug.

**When a child overflows its auto-layout parent, check `visible` on the child and its ancestors before
touching any sizing mode.**

## `maxLines` needs three preconditions and an order

Assigning `node.maxLines = 3` **silently does nothing** unless the node is already in the right
state, and the assignment order matters. All four of these were observed on the same node while
building `ExpandableText`:

| Precondition | Symptom when missing |
|---|---|
| `layoutSizingVertical = 'HUG'` | The node has a fixed height, `textAutoResize` reads the legacy value `'TRUNCATE'`, and `maxLines` stays `null` however often you set it |
| `textAutoResize = 'HEIGHT'` | Same — `maxLines` will not hold |
| `textTruncation = 'ENDING'` set **before** `maxLines` | Setting `maxLines` first and truncation second collapses the node to **one line**. This looks like a working truncation, so it passes a glance and fails the design |

```js
t.layoutSizingVertical = 'HUG';   // 1
t.textAutoResize = 'HEIGHT';      // 2
t.textTruncation = 'ENDING';      // 3 — before maxLines, not after
t.maxLines = 3;                   // 4
```

**Changing `layoutMode` on the parent drops the truncation**, the same way it drops a bound width.
Re-apply steps 3–4 afterwards and read `maxLines` back **in a separate `figma_execute`** — it reads
stale within the call that set it (the `Line Item` case in `ui-kit-builder/kits/ups-ui-kit.md` hit the same thing).

## A styled text range survives instancing but not a text override

`setRangeFills(start, end, [paint])` accepts a paint carrying a bound variable, and the binding is
real: it survives `createInstance()` intact — measured, the instance's range still reported
`Components/Typography/Global/colorLink`.

**It does not survive a write to `characters`.** Setting the instance's text — through a component
TEXT property or directly — resets the whole node to its base fill, so the styled range silently
reverts to `colorText`. Measured: tail range `{r:0,g:0,b:0}` bound to `colorText` immediately after
the override.

So a mixed-fill range is only safe for text **nobody will edit**. Any component whose purpose is
editable copy cannot carry its accent colour as a range — it needs a separate node, which in
practice means a nested component instance and therefore its own line or column.

## `layoutWrap: WRAP` does not give you inline text flow

A wrap container wraps **items**, not words, so it cannot put a trailing element after the last line
of a wrapping paragraph. Both ways of sizing the text child fail, in opposite directions — measured
at a container resized 360 → 600:

| Text child | At its design width | After the consumer resizes |
|---|---|---|
| `HUG` + `maxWidth` | Correct — short text keeps the sibling inline | **Does not reflow.** Text stays at `maxWidth`, leaving 240px of dead space |
| `HUG`, no `maxWidth` | Runs to its full unwrapped width | **Overflows by 904px** — Figma does not cap a HUG child to the container |
| `FILL` | Fills only the *remaining space on the line*, so the sibling stays on line 1 and the text wraps into a narrow column beside it | same |

A component that must survive an arbitrary container width therefore uses a **`VERTICAL`** parent
with the text at `FILL`, and accepts the trailing element on its own line. See also
*A trailing glyph after a wrapping text run* in the hug/maxWidth notes.

## `descriptionMarkdown` normalises whitespace

Two behaviours that will mangle an appended block:

- **Newlines directly after a closing code fence are collapsed.** Appending `"\n\n---"` to a
  description ending in ` ``` ` yields ` ```--- ` — the fence never closes, the count goes odd, and
  Figma may add a stray fence of its own. Insert **before** the code example instead of appending
  after it.
- **Runs of spaces collapse to one.** `Web:    <768 stack` is stored as `Web: <768 stack`, so don't
  align columns with spaces and don't write a parser that depends on them (`^\s*Web:\s*` is fine).
- **A backtick span inside a `**bold**` run gets its adjacent spaces escaped to `&#32;`.** Writing
  ``**Leave the chart's own `Show Legend` on**`` stores
  ``**Leave the chart's own&#32;`Show Legend`&#32;on**``, which renders the entity literally. Keep
  code spans *outside* bold runs — `**Leave Show Legend on**` or ``leave its `Show Legend` on`` are
  both fine. Note a string replace written with normal spaces will then fail to match the stored
  line; fix it by index instead.
- **Leading indentation is stripped.** A two-space continuation line under a list item (the
  `Source` block's axis line, for example) comes back flush left. Harmless for the audits, which
  match on content, but don't build a parser that needs the indent.

Always read `descriptionMarkdown` back after setting it and check the fence count is even.

## Filling a slot on a *remote* component's instance — clone, never insert

Seen 2026-10-12 swapping 33 hand-built bars for UpS `Form Actions` in UpS Product 2026, where the
component is remote. Two ways of putting content into its `Actions` SLOT look fine and are broken:

- **Moving an existing node in** (`slot.appendChild(nodeFromElsewhere)`) or **inserting a fresh
  instance** (`btnMain.createInstance()` → `slot.appendChild`). The canvas renders correctly and the
  outer instance's `findAll(TEXT)` reads the right labels, but the inserted node's own subtree is
  dead to the API: `.children`, `.exposedInstances`, `.visible` all throw *"The node (instance
  sublayer…) with id I<id>;… does not exist"*. Any later `findAll` or plugin screenshot over that
  screen crashes. Re-fetching by id does not help.
- **What works:** keep the slot's **default** children and `clone()` one of them inside the slot
  (`slot.insertChild(k, slot.children[0].clone())`), then set properties on the clones. Those stay
  fully addressable. Same rule as the kit note on product files: duplicate inside the slot.

In the kit, where the component is local, `createInstance()` + `appendChild` into the slot worked,
so test in the consuming file, not in the library.

## Hug-to-a-cap text can't live inside an instance

**`maxWidth` written to a node inside an instance is silently ignored** (measured 2026-09-24).
`inst.maxWidth = 240` on the instance itself takes; the same write on its nested instance or on the
TEXT inside reads back `null`. So text that must **hug up to a cap, then ellipsise** can't be
expressed through a wrapper component at all:

- without truncation, the wrapper caps but the text keeps its natural width and escapes;
- with `textTruncation = 'ENDING'` + `maxLines = 1`, the text falls back to the width of the *source
  component's placeholder* (88px for "This is a text") and ellipsises there whatever the container.
  That fallback width is the tell.

The plausible workaround — a plain frame carrying `maxWidth` around the instance at FILL — is a
**frozen width**: with every child on FILL the frame has nothing to hug and keeps whatever width it
had at construction. It looks right when built.

**Rule:** FILL-bounded text (a table cell, a fixed column) migrates to a wrapper cleanly;
hug-with-a-cap text stays a raw TEXT node until the source component exposes its own cap. Decide per
node. **Test widths by mutating text on an already-built node** — separately constructed short/long
cases bake their width in at construction and fake a pass. An overflow probe scores the shrunken
case as a pass too.

**Trailing glyph that stays adjacent and still truncates** (a colon, a unit): root auto-layout HUG +
`maxWidth` + the text child at `layoutSizingHorizontal = 'FILL'`. A FIXED root instead floats the
glyph to the right edge. A trailing glyph after a *wrapping* run is impossible (no inline flow); a
*leading* marker (required `*`) survives wrapping with `counterAxisAlignItems = 'MIN'`.

## `resize()` on an auto-layout frame flips it to FIXED

`frame.resize(w, h)` silently sets `primaryAxisSizingMode = 'FIXED'`, and a frame resized after
`layoutMode` was set then clips its children to that height. Set `layoutSizingVertical = 'HUG'`
**after** populating, innermost frame first, and `clipsContent = false` — `figma.createFrame()` clips
by default, so the collapse is invisible until you screenshot.

## Fixed-ratio art with a token-bound height

To size a non-square asset (logo lockup, illustration) from a density token without distortion, so
it tracks Compact automatically:

```js
c.layoutMode = 'HORIZONTAL';
c.primaryAxisSizingMode = 'AUTO';    // hug width
c.counterAxisSizingMode = 'FIXED';   // fixed height
c.resize(c.width, H);
c.setBoundVariable('height', controlHeightVar);
r.resize(nativeW, nativeH);          // child: native ratio first
r.lockAspectRatio();
r.layoutSizingVertical = 'FILL';     // width now derives from height
```

Order: append → size child → set sizing modes → resize parent → bind (`resize()` resets the sizing
mode, and `layoutSizing*` throws on a node not yet in an auto-layout parent). Binding height plus a
raw width distorts at Compact; `scaleMode: 'FIT'` letterboxes. Aspect-lock does **not** survive an
instance swap.

## Equal-height cards per row need GRID with HUG rows

HORIZONTAL + WRAP can't stretch siblings to the row's tallest card. Grid auto-layout can, including
inside an instance's SLOT:

```js
g.layoutMode = 'GRID'; g.gridColumnCount = 3; g.gridRowCount = Math.ceil(n / 3);
g.setBoundVariable('gridColumnGap', v); g.setBoundVariable('gridRowGap', v);
g.gridRowSizes = g.gridRowSizes.map(() => ({ type: 'HUG' }));   // NOT the default
child.setGridChildPosition(row, col);
child.layoutSizingHorizontal = child.layoutSizingVertical = 'FILL';
```

New rows default to `{ type: 'FLEX' }`, which makes **every** row as tall as the tallest card in the
grid. HUG sizes per row.

## Auditing without false positives

**Exclude instances and their subtrees.** An instance's padding, radius and fills reflect its main
component — counting them as "raw" measures someone else's component. A 7px padding traced back to the
library's own `Avatar` icon inset after a fruitless hunt.

```js
if (node.type === 'INSTANCE') continue;
let p = node.parent, inside = false;
while (p) { if (p.type === 'INSTANCE') { inside = true; break; } p = p.parent; }
if (inside) continue;
```

**Overflow probes need two more exclusions**, or nearly every probe "fails":

1. **Hidden nodes keep their geometry.** Prune the whole subtree on `n.visible === false` — return,
   don't just skip the node, or its children are still measured.
2. **Absolutely positioned children sit outside on purpose** (`Form Item / Horizontal`'s label at
   x = −120). Subtract the known gutter rather than counting it.

And never stress-test by writing a long string into *every* TEXT node — placeholders and unit
suffixes hug and blow out, masking the real result. Stress only the node under test. (One sweep
went from 204 "failures" to 37 real findings with these applied.)

## Screenshots

`figma_capture_screenshot` uses the plugin's `exportAsync`, reflects **current** state, and needs no
REST token — prefer it. `figma_get_component_image` and `figma_take_screenshot` fall back to the REST
API and will 403 on an expired `FIGMA_ACCESS_TOKEN`.

**`figma_capture_screenshot` caches per node id** — after changing a node, a re-capture can return
the old image. Recreate the node (or capture its parent) for a fresh one.

Scale is capped so the longest side stays ≤1568px; the minimum accepted `scale` is 0.5. For a wide
component set, screenshot individual variants instead of fighting the cap.

## Bridge connection

The Desktop Bridge plugin drops out (Figma suspends plugins when the tab loses focus). Symptom:
"Cannot connect to Figma Desktop". Ask the user to reopen Plugins → Development → Figma Desktop
Bridge; nothing is lost, since a failed `figma_execute` is atomic. On long builds, tell them to keep
the plugin window visible.
