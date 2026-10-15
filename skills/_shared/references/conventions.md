# UpBase conventions

> **Shared by every skill.** The rules a component follows wherever it is built: in the UpBase
> Design System file or in a product's UI kit. Each skill's SKILL.md tells you when to open this
> file. You don't need to read it end to end.

**Contents**: Platforms · Variant count · The State vocabulary · Contrast · Choosing a token ·
The raw-value rule · The component description · Responsive declarations

## Platforms: two targets, Web and Mobile

**iOS and Android are one target, `Mobile`.** One design, one set, one description. Never ask "iOS or
Android?" and never split a set by OS. A set still carrying `Platform=iOS/Android` predates this rule
and is a merge candidate.

A web-vs-mobile difference is handled in exactly one of three ways. Prefer the earlier row:

| The difference is… | Handle it with | Example |
|---|---|---|
| **Measurement only**: height, radius, type size, spacing | a **variable**, resolved by mode | `controlHeight` 32 vs 28 at Compact |
| **Anatomy**: same concept, different construction | a **`Platform` axis**, options `Web` · `Mobile` only | `Select` as a popover vs a bottom sheet |
| **Concept**: exists on one platform only | a **separate component** with the platform's own name | `Tab Bar` beside `Tabs`, never `Tabs (Mobile)` |

A `Platform` axis multiplies the variant count, so it is only affordable on small sets. Never add one
to a set over ~100 variants.

**Platform reach comes from the user, never from inference.** Ask which platforms a component ships
to if the request doesn't say. Nothing records it per component.

**Density has two modes, `Default` and `Compact`**, on `2. Dimensions` and `3. Typography`. It is a
mode and **never a variant axis**. There is no touch-density mode, so a 44pt native target is a raw
value with a stated reason.

## Variant count is the constraint

The product teams' Figma files got messy because variants multiplied. Keeping the count low is a
goal in itself, not a tidiness preference.

- **Only colour and text alignment genuinely need a variant.** Everything else is an instance
  property and costs zero variants: an optional part → BOOLEAN, an icon or alternative → INSTANCE_SWAP
  (named `<Thing> Name`), content → TEXT, variable content → SLOT. `Size` is usually the density
  mode, once text is bound to styles.
- **A behaviour change to existing variants beats a new axis**, even when it moves every instance.
  Lead with the zero-variant option and state its cost.
- **Two parts in either order → no `Order` axis.** Keep the primary part fixed, give the optional one
  a `Show X` boolean, and add a SLOT for the alternative placement.
- **Every proposal states the arithmetic**: before → after, per set, with a total. Check it before
  reporting it.

## The State vocabulary

Anything a user can interact with carries a `State` axis with **all four** of
`Default · Hover · Focused · Disabled`, plus **`Pressed`** when the thing is actually pressed (button,
link, tab, menu option). Dropping `Focused` is a keyboard-accessibility gap, not a simplification.

Extend only where the component genuinely has more:

| Component kind | Add |
|---|---|
| Text entry | `Typing` · `Filled` (instead of `Pressed`) |
| Anything asynchronous | `Loading` |
| Selectable | `Selected`, or `Active` for a persistent on/off |
| Navigation | `Current`, meaning "you are here" |

`Pressed` is transient (the pointer is down now). `Active` is persistent (this item *is* the selected
one). Don't merge them. Coining a new state value is a decision to raise, not to make on the page.

**Focus renders as a 2px INSIDE stroke**, not the `activeShadow` effect style, which is invisible on
frames (`upbase-known-issues.md`).

## Contrast

Measure before you commit a colour: **4.5:1** for text, **3:1** for icons and graphical objects.
Several UpBase tokens fail on white. `colorSuccess` is 2.27, `colorWarning` is 1.90 and
`colorTextDescription` is 3.35 for text. The working replacements are in `upbase-known-issues.md` ›
*Contrast*. When no semantic token clears the bar, bind the palette step directly and say so. A
stated palette binding is honest; a semantic token that fails is a defect wearing the right name.

## Choosing a token

Pick by **meaning**, not appearance: `tokens.md` has antd's own description for every token.
Several confusable pairs render identically today, so nothing on the canvas or in an audit will tell
you the pick was wrong:

| If it has… | Bind |
|---|---|
| a floating surface (popup, menu, modal, tooltip) | `colorBgElevated` + effect style `boxShadowSecondary`, **not** `colorBgContainer` |
| a line separating two things | `colorSplit`, not `colorBorder` |
| an outline around a shape | `colorBorder` |
| a control-sized corner (button, input) | `borderRadiusSM`; a card or modal corner → `borderRadiusLG` |
| a meaningful icon | the token of the text it belongs to, not `colorIcon` |
| a dismissal / clear icon | `colorIcon` / `colorIconHover` |
| a label on a coloured fill | `colorTextLightSolid`, with a measured ratio |

Typography is always a **text style** (`Text Base/Normal`, `Heading/4`…), never raw font fields.
Shadows are always an **effect style**. Colour is always a **variable**; UpBase has no paint styles.
Seed tokens (`colorBgBase`, `colorTextBase`, `sizeStep`, `sizeUnit`) are never bound directly.

## The raw-value rule

The standard is **not "no raw values"**. It is: **no raw value without a stated reason.** Some values
genuinely have no token: a pill radius (height ÷ 2), a 2px optical gap, a negative overlap, a panel
width, a 44pt touch target. Forcing a semantically wrong token because the number matches is worse
than an honest raw value.

Every raw value goes in the description's `Raw values` block with the reason. `audit-coverage.js`
reports the remainder, and the two lists must match. A raw **colour**, an unstyled text node, a
shadow that isn't a style, or a border width that isn't `lineWidth` is never legitimate.

## The component description

The description is the only place a component's metadata lives, and Figma's asset search matches
it. Every component ships with this, in this order:

```
<One-line summary of what it is.>

**When to use**

- <guidance, and when to reach for something else instead>

**Properties**

Source                                   ← kit wrappers only (ui-kit-builder)

- UpBase `Button / Basic` (key a0b8f7e0…)
  exposed nested instance · 7 axes (Type · Size · State · …) · 5 instance properties

Variants

- Axis — Option · Option · Option

Instance properties

- Name — text
- Show Thing — boolean, default true

**Responsive**

Web: <992 stack · <768 swap → List View
Native: Compact stack

Reviewed: yes — <one line on what changes, or why nothing does>

**Raw values**

- 10 — pill radius, must be height ÷ 2; no token

**Search metadata**

<keywords: synonyms someone might search for>
```

- Generate the Properties block from `componentPropertyDefinitions` rather than typing it.
- Keep the `Source` key exact and its axis list current. `audit-wrappers.js` parses it for drift.
- `Reviewed:` is always present, including when nothing is declared above it. That line separates
  "looked at it" from "nobody has".
- `Search metadata` is how `Spin` is found by "activity indicator". It is what stops someone building
  a second one.
- Insert new sections **before** any `**Code example**` block. Figma eats the newline after a closing
  code fence (`figma-api-gotchas.md`).

## Responsive declarations

Only write a breakpoint where something changes. `reflow` (layout holds, container narrows) is the
silent default and is never written. Use only these verbs, so `audit-platform.js` can check them:

| Verb | Means |
|---|---|
| `stack` | horizontal → vertical |
| `collapse` | full → icon-only or summary |
| `scroll-x` | content scrolls horizontally; the container stays put |
| `swap → <Component>` | replaced by a different, named component |
| `dock` | moves to a fixed edge |
| `hide` | removed |
| `truncate` | ellipsised |
| `paginate` | split across pages or steps |

`Web:` breakpoints are `<N` or `≥N` using only antd's values: 480 · 576 · 768 · 992 · 1200 · 1600.
`Native:` uses size classes: `Compact` (<600) · `Medium` (600–840) · `Expanded` (>840), never pixels.
Separate entries with ` · `. Declare on the **root** component only; sub-parts inherit.

If a behaviour doesn't fit a verb, raise it rather than inventing a phrase no script can match.

A platform the component deliberately doesn't ship to is written as an opt-out, which
`audit-platform.js` skips: `Native: not in scope — Web only by decision (<date>)`.
