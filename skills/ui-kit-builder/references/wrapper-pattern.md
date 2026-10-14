# The wrapper pattern

A local component owning a remote instance, with nested instances exposed. Every atom a kit
re-publishes is built this way. (Measured in UpS UI Kit.)

```
COMPONENT  "<kit name>"                   local · published by the kit · componentPropertyDefinitions stays []
└── INSTANCE "<kit-facing layer name>"    remote main from UpBase
    isExposedInstance = true
```

Everything here was measured on `Button / Basic` — 960 variants, 7 axes (Type 5 · Size 3 · State 5 ·
Content 2 · Ghost 2 · Danger 2 · Shape 2) plus 5 instance properties.

## Decision 1 — expose, or build a curated set?

This is the only structural choice in a wrapper. Make it before building.

| | **Exposed wrapper** | **Curated set** |
|---|---|---|
| Build | one component, one flag | one wrapper variant **per combination** |
| Consumer sees | every axis the source has, in one group | only the axes the kit chose, under its names |
| Hide an axis the kit doesn't want | **no** — exposure is wholesale | yes |
| Rename an axis | **no** | yes |
| UpBase adds an axis later | appears automatically | must be regenerated |
| Cost for Button | 1 component | 75 variants for Type × Size × State; **960** for all seven |

**Default to exposed.** Promote to a curated set only when someone can name the axes the kit wants
removed and why — "the product never ships a ghost button" is a reason; "it feels cleaner" isn't.

## Decision 2 — what is the nested layer called?

> Record the answer in the kit's data file (*Decisions to make once*). UpS chose to keep UpBase's
> exact name for both wrapper and layer, and accepts the `audit-wrappers` flag that follows.

The consumer's exposed property group is labelled with the **nested instance layer's name**, not the
wrapper's. This is the whole of the kit's naming control over an exposed wrapper, and it's set once.

| Layer name | What a product designer reads |
|---|---|
| `Button / Basic` (as imported) | UpBase's antd vocabulary, inside a component the kit deliberately renamed |
| `Button` | the kit's vocabulary |

## The four rules

Each one is a defect that ships silently — nothing on the canvas reveals any of them.

| Rule | Measured consequence of skipping it |
|---|---|
| `isExposedInstance = true` on the nested instance | `wrapper.componentPropertyDefinitions` is `[]` and always will be, so the consumer's panel is **empty**. All 12 controls sit on the child, unreachable except by deep-select |
| Rename the nested layer | Property group carries UpBase's name — see Decision 2 |
| Never HUG on an axis where the child FILLs | A HUG wrapper caps a child meant to FILL and pins it to its minimum. Correct for `Button`, wrong for `Input`, `Table`, `Drawer`. **FIXED + FILL is fine** — the child fills a wrapper pinned to its natural width |
| Carry the description, with a `Source` block | Figma asset search matches description text, so an empty one is unfindable; and `scripts/audit-wrappers.js` parses `Source` for drift detection |

One API asymmetry worth knowing, because it looks like a bug: `exposedInstances` reads `[]` on the
**main component** and populated on an **instance** of it. Check exposure with
`inst.isExposedInstance`, never with `wrapper.exposedInstances`.

## Worked example — the same wrapper, wrong and right

Both wrap `Button / Basic`. Both look identical on the canvas.

**Wrong** — what a first attempt actually produced:

```
❖ Button
└── COMPONENT "Button / Basic"            ← inherits UpBase's name, incl. antd's "Basic"
    └── INSTANCE "Button / Basic"         ← isExposedInstance: false
                                             description: ""
```

| Symptom | Cause |
|---|---|
| Consumer's property panel is empty | not exposed |
| Only one configuration reachable — Primary/Default/Default | not exposed; the other 959 need the child |
| Doesn't appear when a designer searches "cta" | no description |
| Nothing records what it wraps | no `Source` block |

**Right:**

```
❖ Button
└── COMPONENT "Button"                    ← product-context name
    HUG/HUG, mirrored from the source
    └── INSTANCE "Button"                 ← isExposedInstance: true → 12 props forwarded
```

```
The primary action control, in five types and three sizes.

**When to use**

- Any action the user takes on a page. Use `Link` for navigation that isn't an action.

**Properties**

Source

- UpBase `Button / Basic` (key a0b8f7e08632a9e38b1ca402519adaff112a5ce6)
  exposed nested instance · 7 axes (Type · Size · State · Content · Ghost · Danger · Shape) · 5 instance properties

**Responsive**

Reviewed: yes — reflows; no breakpoint behaviour of its own.

**Search metadata**

cta, primary action, submit, call to action
```

Verified on the right-hand version: consumer reports
`exposedInstances: [{ name: "Button", props: 12 }]`, and `setProperties({ Size: "Large" })` drives
the nested variant from the wrapper.

## Building it

Use `scripts/make-wrapper.js` — it does all of the above, refuses to create a duplicate name,
rolls back on failure, and reads the result back before reporting. Hand-building means owning the
four rules yourself.

Two API notes that fail *silently* and so are worth stating; the rest of the sequence throws loudly
enough to discover by trying:

- **Set `layoutSizing*` after `appendChild`,** not before — it throws on a node that isn't yet in an
  auto-layout parent, and a wrapper with no `layoutMode` can't mirror FILL at all.
- **A key is either a set or a standalone component.** `importComponentSetByKeyAsync` and
  `importComponentByKeyAsync` each throw on the other's key; try both.

## Checklist

`scripts/audit-wrappers.js` checks all five.

- [ ] `isExposedInstance === true` on the nested instance
- [ ] nested layer renamed to the product-facing word
- [ ] wrapper does not HUG on an axis where the child wants to FILL (FIXED + FILL is fine)
- [ ] description non-empty and carries a `Source` block with the real key
- [ ] axis list in the description matches the source's current axes
