# Build mechanics — Figma plugin traps when composing screens

> **Scope:** all modes. Every item here cost real rework while building UpS screens, and most fail
> **silently** — the call succeeds, the report looks fine, and the canvas (or the next call) is
> wrong. Read before the first write. The component-level traps (making slots, variants, wrappers)
> live in `ub-component-creator`'s `references/figma-api-gotchas.md`; this file is what matters when
> you only *use* components.

## Contents

- [Calls, timeouts and partial writes](#calls-timeouts-and-partial-writes)
- [Stale handles inside nested slots](#stale-handles-inside-nested-slots)
- [Slots in instances](#slots-in-instances)
- [Properties and variants](#properties-and-variants)
- [Text](#text)
- [Layout](#layout)
- [Tokens and styles in a product file](#tokens-and-styles-in-a-product-file)
- [Imports and icons](#imports-and-icons)
- [Screenshots and reading](#screenshots-and-reading)
- [Cleanup](#cleanup)

## Calls, timeouts and partial writes

- **`figma_execute` caps at 30s** (pass `timeout: 30000` for builds). Chunk by region.
- **A timeout is not a rollback** — the plugin usually finishes after the client gives up. Re-read
  before retrying, and give every build call an existence guard as its first act
  (`if (parent.findChild(n => n.name === 'X')) return { fatal: 'exists' }`).
- **A thrown error is not atomic either.** A call that failed on an unloaded font had already cloned
  five rows and set one cell. After any error, re-read the state that call touched and make the
  retry idempotent (skip what exists) instead of assuming nothing happened.
- **"Unable to establish connection to Figma after 10 seconds"** on a call that walks many nodes
  with an ancestor check per node usually means the call is too heavy, not that the bridge is down.
  Probe with `return figma.root.name`; if that works, split the walk (one screen per call) and use
  a recursive walk that passes a `hidden` flag down instead of walking up from every node.
- `figma_capture_screenshot` can also hit the 10s connection error while the product file isn't
  connected — check `figma_list_open_files`.
- **The preflight's kit probe (`importComponentByKeyAsync`) and its page-wide `findAll` can hang
  past 30s** on the large `↳ Specifications` page (2026-10-08). Guard on the target section's
  children instead, and take components from resident instances (`getMainComponentAsync()`).
- **`getNodeByIdAsync` on a deep instance-path id (`I145:80242;170:44281;…`) can stall the
  bridge.** Reach nested layers by walking from a top-level id (`card.findAll(n => n.type ===
  'SLOT')`, `.children`) — that is fast.

## Stale handles inside nested slots

The expensive one. If you **create a frame, create instances, put the instances in the frame and
append the frame into a slot of an instance — all in one call**, the instances get short ids
(`20:24173`) whose children resolve to paths that don't exist (`I20:24173;106:30810`). The canvas
renders correctly, but every later `.children`, `.name` or `findAll` that reaches them throws
*"The node (instance sublayer or table cell) with id … does not exist"* — so every audit crashes.

Avoid it by staging:

1. Call A: create the empty structural frames and append them into the slot.
2. Call B (later): create instances and append them into those already-slotted frames.
3. Moving *existing* instances into a frame that was created in an earlier call is fine.

If it happened anyway: remove each affected instance and re-create it in place (same parent, same
index, same properties) in a separate call. Then prove it with `scripts/walk-integrity.js`.

## Slots in instances

- A slot's children can be removed, appended, reordered (`insertChild`), cloned and **resized** —
  at any depth (a cell inside a row inside a table's `Rows` slot). That's what makes column widths
  settable.
- A slot's **own layout mode** can't be overridden: `slot.layoutMode = 'HORIZONTAL'` is silently
  ignored. For side-by-side content (row actions), put a HORIZONTAL frame in the slot and the items
  in the frame (staged, as above).
- Deeper layers that are **not** slot content can't be resized from the API (`resize()` does
  nothing, no error): e.g. the textarea inside a Form field inside a Card slot stays 52 tall.
- A slot reads `FRAME` from inside a parent's main component but `SLOT` in an instance — judge a
  slot by trying to append into it, never by `type`.
- Duplicating a row keeps its own editable `Cells` slot; clone one fully-configured row and then
  edit the copies.

## Properties and variants

- **Set properties on the nested instance** (`inst.children[0]`) for kit wrappers. Keys carry
  `#id` suffixes — read them, don't guess.
- **Collect errors instead of swallowing them.** A wrong key throws; a bare `try/catch` makes a
  failed run look like success. `scripts/helpers.js` › `makeSetter()` returns `set()` + `errs`.
- **An override stops library sync for that property — permanently.** Setting a layout field on an
  instance (`counterAxisAlignItems`, padding, spacing) pins it; later upstream fixes to that field
  never arrive. A CENTER set on table cells survived the user's UpBase → kit → product fix on five
  screens, spread by cloning. Don't set layout fields on kit instances to tune a look; run
  `scripts/check-overrides.js` before handover.
- **Changing a variant resets text overrides on that instance.** Set variants first, content
  second — two `setProperties` calls. When you change a variant on something that already has
  content (e.g. `Status=Error` on a filled-in input), read the content first and re-apply it.
- Instance-swap properties take a **component node id** (`icon.id` after import, or the id of a
  component already resident in the file).
- A visibility override on a layer with no property is technically clean (nothing detaches), but
  use it only to remove the kit's **placeholder content** (a Card head's demo "More" button,
  unused tab or menu items). Don't use it to hide a component's structural parts — title, close
  button, colon, icons — to match a screenshot; the component's structure wins (SKILL.md).
- A Table cell's `Type` variant only changes its chrome; all types share one `Content` slot, so
  switching `Type=Badge` does not give you a badge.

## Text

- **Load fonts before touching text**, including `textAutoResize`, `textAlignHorizontal` and
  `characters`: `await figma.loadFontAsync(node.fontName)`. UpS uses Roboto Regular / SemiBold.
- Text that must wrap inside a cell: text instance `layoutSizingHorizontal = 'FILL'`, its TEXT node
  `layoutSizingHorizontal = 'FILL'` + `textAutoResize = 'HEIGHT'`. A HUG text node with a fixed
  width (e.g. a label that inherited 144px) pushes its siblings out of view — set it
  `WIDTH_AND_HEIGHT`.
- **Truncation needs an order:** `layoutSizingVertical = 'HUG'` → `textAutoResize = 'HEIGHT'` →
  `textTruncation = 'ENDING'` → `maxLines = n`. Setting `maxLines` first collapses to one line;
  skipping HUG leaves it `null`. `maxLines` can read back stale in the same call.
- `Tag / Status` has no text property — set the TEXT node's `characters`.

## Measuring what you built

- **Measure the node you mean.** In a table cell, the first TEXT under `Content` is the hidden
  inline Tag ("Tag", 20px) — `cell.findOne(n => n.type === 'TEXT')` returns it and every height
  check "passes". Go through the named instance: `Text Wrapper › Text › TEXT`. Checking wrapping by
  text height (22 = one line, 44 = two) only works on the right node.
- Heights read inside the call that changed widths can be stale; re-read in a separate call.
- `findOne` by a generic name (`Left`, `Right`, `Header`, `Content`) can match inside the
  PageHeader or another instance first. Scope lookups to the region (`card.findOne(...)`).
- **Measure edges after restructuring a cloned frame.** A clone's padding is tuned to its *original*
  first and last child; reorder or swap children and the edges drift (UpS: a bulk button moved to
  the top sat flush against the card edge, and 28px opened above a table where siblings had 12).
  Integrity, override and screenshot checks all pass. Return each child's box relative to its
  container next to the same numbers from one or two sibling screens, and fix the differences
  before the screenshot.

## Layout

- **A node moved from a horizontal container into a vertical HUG frame keeps `FILL` height** (it
  picked it up as a stretched child) and collapses to almost nothing. Set
  `layoutSizingVertical = 'HUG'` after moving.
- Moving a frame that holds instances created in the same call can still leave those instances
  with stale handles — run the integrity walk after any move, and re-create what it flags.
- **Moving a *cloned* instance out of a slot breaks it.** An instance that lives in a slot of a
  cloned screen is addressed by its path inside that slot; `insertChild` it into a plain frame and
  the parent lists a node that no longer resolves (every later `findChild` on that parent throws).
  Moving an instance that was *created* in that slot works. So to restructure a family of clones,
  fix the base screen once and **re-clone** the siblings from it, then re-apply their differences —
  don't move nodes out of slots in each clone.

- **`figma.createFrame()` clips by default.** Every structural frame you create: `fills = []`,
  `clipsContent = false`. A clipping row frame hid a Textarea's absolutely positioned counter.
- `layoutSizing*` only works after the node is inside an auto-layout parent — append first.
- `resize()` resets a frame's primary-axis sizing to FIXED; set HUG after resizing.
- ABSOLUTE children (FloatButton, overlay, modal) don't contribute to HUG. Position them after the
  frame's final height is known, and **re-position after anything changes the height** — a clone
  keeps the source screen's y. Check overlap with `absoluteBoundingBox` of the FloatButton against
  the bottom-right controls.
- Section children use coordinates relative to the section.
- An auto-layout frame with a single child can't right-align that child except through the
  parent's `counterAxisAlignItems` (which moves every non-FILL child) — wrap it or use
  `SPACE_BETWEEN` rows.
- Overlay for a modal: an ABSOLUTE rectangle at `(0,0)`, screen size, constraints STRETCH, black
  fill at `opacity = 1` on the paint and **layer** `opacity = 0.45`. Z-order: content → overlay →
  modal → FloatButton.

## Tokens and styles in a product file

- `getLocalVariableCollectionsAsync()` is empty and the kit publishes no variables, so nothing can
  be imported. But every kit instance carries UpBase variables, and `getVariableByIdAsync(id)`
  resolves them — **harvest** ids from bound variables (`scripts/harvest-tokens.js`) and bind with
  `setBoundVariable` / `setBoundVariableForPaint`. The product data file lists the ones found so far.
- Bind every spacing you set (`itemSpacing`, padding). `0` gaps between flush items are fine raw.
- If a needed token isn't reachable (e.g. `colorBgMask`), use the antd value raw and log a gap.

## Imports and icons

- `importComponentByKeyAsync(key)` with a **variant** key for sets. ~1–2s cold each.
- "Could not find a published component with the key …" means the component isn't in the kit's
  last publish (check `getPublishStatusAsync()` in the kit: `UNPUBLISHED`) — ask the user to
  publish; never rebuild it locally.
- Icons: first look for one already resident (`getMainComponentAsync()` on any instance named like
  the icon). Otherwise find it in the UpBase file by name through the plugin (read-only) and import
  its key — the one allowed UpBase-direct import, swapped through the kit component's own property.

## Screenshots and reading

- `figma_capture_screenshot` reads live plugin state — use it for verification. Scale caps at
  1568px on the long side; for a 1440 screen scale 1 is fine, for detail capture a sub-node.
- To read a reference while the bridge isn't connected, the claude.ai Figma connector's
  `get_screenshot` works on any node.
- When a result "doesn't show" something, check `visible` up the ancestor chain, clipping on
  ancestors, and ABSOLUTE positioning before touching sizing.

## Cleanup

- Probe on a throwaway `_probe` frame and `remove()` it in `finally`.
- Delete partial artefacts before retrying. Delete by explicit id or exact name, never by filtering
  a parent's children broadly.
- Resize sections around their content when done.
