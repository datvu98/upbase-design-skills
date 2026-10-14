# Mode: Source — authoring in UpBase Design System

> **Scope: Source mode** — building or changing components *inside* the source library,
> `BoGaG48v9BfY7LkMtFs4zh`. Everything resolves **locally** here — look variables and styles up by
> name, never import by key. If the target is a product kit instead, stop and read
> `references/kit/mode.md`.

## Read these first

Source mode reads **six** files, this one included. Load them now rather than mid-build; the ones
that prevent silent failure are no use once the write has landed.

| # | Read | For |
|---|---|---|
| 1 | this file | the seven phases, reuse gates, build and binding rules |
| 2 | `references/figma-api-gotchas.md` | the traps that fail silently — **before** any plugin code |
| 3 | `references/tokens.md` | every token: antd's meaning, UpBase's actual value, and the deviations (Phase 2 and Phase 3) |
| 4 | `references/source/foundations.md` | what else exists: collections & modes, styles, component inventory, known gaps |
| 5 | `references/source/page-template.md` | the page layout — the page is part of the deliverable |
| 6 | `references/upbase-known-issues.md` | measured defects already on record — the to-do list, and what not to re-discover |

Then `references/verification.md` at Phase 5. Source mode never reads anything under
`references/kit/` or `scripts/kit/`; those invert these rules — **except the Step 0 kit table in
SKILL.md**, which is the list of consumers a breaking change reaches (SKILL.md › *A Source change
that breaks a consumer must say so*).

Preamble is `scripts/source/helpers.js`. Using the kit's `scripts/kit/resolve-remote.js` here
resolves nothing and says so quietly.

**Contents** — Refactoring · The one file · Two targets · Phase 0a Exists? · Phase 0b Scope ·
Phase 0c Platform · Phase 1 Enumerate · Phase 2 Colour · Phase 3 Build · Phase 4 Properties ·
Phase 5 Verify · Phase 6 Document · Handing over · Reference files

Building a component in this library is mostly **derivation, not invention**. The library already
decides radius, spacing, type, elevation, control heights, and the state vocabulary. Your job is to
find those decisions and obey them — then spend your judgement only on what genuinely isn't decided
yet.

Three failure modes cause almost all rework here, and all three are cheap to avoid:

1. **Building something that already exists.** The library has 353 non-icon components and 829
   icons. If the user says "floater action", there is a `FloatButton` with 24 variants. Reuse beats
   create, every time.
2. **Turning a platform difference into a new component when it is a token, a mode, or a variant
   axis.** Most of what separates web from native here is *measurement*, and measurement belongs to
   variables — see *Phase 0a*.
3. **Hardcoding values that have tokens.** A hardcoded shadow, border width, or line-height doesn't
   just offend tidiness — the Dimensions and Typography collections carry a **Compact** mode, so
   unbound spacing means the component silently refuses to respond to density. A raw colour is worse
   still: it is invisible to every audit and never moves when the palette does.

Work through the phases below in order. Phase 1 is the one people skip and always regret.

### Refactoring an existing page, not building a new one

The phases still apply, but the *first* question changes. Building asks "does this already exist?".
Refactoring asks the reverse: **"what in this page is hand-drawing something that already exists?"**
Nobody spots that by reading the canvas — a hand-built search field looks exactly like a real one.

Run **`scripts/audit-reuse.js`** before anything else. It reports two halves that have to be read
together:

- **A — hand-built**: raw frames drawing a component the library already ships.
- **B — too weak**: library components below standard, which is *why* people hand-build.

Both return non-zero on this library today — run it for the current list rather than assuming a
page is clean.

**Read B before acting on A.** Swapping a hand-built element for a library component that is worse
than it ships the regression, and the audit will happily tell you to do it. Fix B, then A.

Then continue at Phase 5 (verify) as normal.

---

## The one file

Everything lives in **UpBase Design System**, `BoGaG48v9BfY7LkMtFs4zh` — variables, styles, icons,
and the components for every platform. It is published as one library; product kits and design
files subscribe to it.

```
UpBase Design System ──publish──▶ product kits ──▶ product design files
```

Two earlier *platform* kits (`UpBase Web UI Kit`, `UpBase IOS/Android UI Kit`) are retired; if a
note, a page name, or an old script still points at their keys, that reference is stale — build
here instead.

Product kits are a different thing and are **not** retired: they consume this library rather than
splitting it by platform. They are never built in Source mode — see `references/kit/mode.md`.

**Everything is local.** `getLocalVariableCollectionsAsync()`, `getLocalTextStylesAsync()` and style
lookup by name all work normally. Look assets up **by name**; never import by key.

### Two targets: Web · Mobile

**iOS and Android are one target.** One design, one set, one description — the same components ship
to both. There is no per-OS exception list, and a `Platform` axis never splits iOS from Android.

Earlier versions of this skill sanctioned five iOS-vs-Android splits — `Switch`, `Alert Dialog`,
`Date Picker`, touch feedback, elevation. **That list is retired.** Each of those renders one way on
both platforms now. An OS convention that merely *suggests* a difference is not grounds to fork a
component; if one ever genuinely blocks shipping, raise it as a conversation rather than splitting
the set on the page. A set still carrying a `Platform=iOS/Android` axis predates this rule — it is a
merge candidate, not a pattern to copy.

**Web vs mobile is still a real question**, and it is the decision the architecture turns on,
replacing the old "which file?" routing. It is answered in one of three ways:

| The difference is… | Handle it with | Example |
|---|---|---|
| **Measurement only** — height, radius, type size, spacing | a **variable**, resolved by mode | `controlHeight` 32 at Default vs 28 at Compact |
| **Anatomy** — same concept, genuinely different construction | a **`Platform` variant axis** on that set | `Select` as a web dropdown popover vs a mobile bottom sheet |
| **Concept** — exists on one platform only | a **separate component**, its own name and page | `Tab Bar`, `Action Sheet`, `Swipe Action` · `Menu`, `Breadcrumb`, `Anchor` |

Prefer the row above the one you're reaching for. A `Platform` axis multiplies the variant count, so
it is only affordable on small sets — `Button / Basic` already has 7 axes and **960 variants** and
must stay in row 1. Never add a `Platform` axis to a set over ~100 variants. Where one is warranted
its options are **`Web` and `Mobile`** — never `iOS` or `Android`.

> **Density has two modes only: `Default / Compact`**, on `2. Dimensions` and `3. Typography`. There
> is no touch-density mode, so a native control that needs a 44pt target carries that number as a
> raw value with a stated reason — see the raw-value rule in Phase 3. Row 1 still applies to
> everything density *does* cover.

---

## Phase 0a — Check it doesn't already exist, and decide its shape

Search first, whatever the user asked for, then apply this test:

| What you found | What to do |
|---|---|
| It already exists and needs no change | **Nothing.** Designers use it directly. Say so and stop. |
| It exists but the ask is a size, colour or spacing difference | An **instance override**, or a mode. Not a new component. |
| It exists but the ask is a genuinely different construction | Extend that set — new variant option, or a `Platform` axis if warranted |
| **It exists but is weaker than what you need** | **Fix the original, then instance it.** Not a second component, and not a reluctant reuse that ships the weakness downstream |
| It doesn't exist and composes ≥2 existing components | A new set that **nests instances** of them — don't rebuild their internals |
| It doesn't exist and nothing to build on | A new set, built from variables and styles |

That fourth row is the one people skip, and skipping it is how the library grows duplicates. The
Chat page hand-built an unread pill because `Badge / Basic` had **no min-width floor**, so a
single-digit count collapsed — its hand-built version was *better* than the library component.
Reusing would have been a downgrade; duplicating was a tax. The only right answer was to fix
`Badge / Basic` first. **`scripts/audit-reuse.js` finds this class** — and it is not a one-off; the
same gap sits in a double-figure number of components today.

**Never build a second component that duplicates an existing one under a different name.** Asset
search spans the whole library, so two near-identical results is a permanent tax on every designer
who searches. If you find yourself justifying a new component on a size difference, stop: size is an
instance override.

### Stop-gate: a second component is never a side effect

> If finishing the component you were asked for requires **creating another component**, or
> **changing one that already exists**, stop. Name it, say why nothing existing serves, and wait for
> approval. This is a gate, not a note.

Both halves matter. Creating a helper set quietly is how the library grows things nobody chose.
Changing an existing one is worse: fixing `Badge / Basic` reaches **913 instances across 8 pages**,
and that is not a decision to take midway through building something else.

Then **confirm you are actually in this file** before any write:

```
figma_list_open_files          → which files have the Desktop Bridge plugin open
figma_navigate url, lock:true  → switch the active target and pin it
```

The active target moves on its own — new plugin connections and the user's own page changes in
another file can steal it. Pin it. Product design files are often open at the same time, and a write
that lands in one of them is silent.

Then **run `scripts/preflight.js` as your first `figma_execute`**, before any node exists:

```js
const pf = await preflight({ mode: 'source', fileKey: 'BoGaG48v9BfY7LkMtFs4zh', building: '<root name>' });
if (pf.blocked) return pf;   // do not create anything
```

It proves the file, proves local resolution works (zeros here mean you drifted — see Phase 1), and
reports anything already on canvas matching the name, which is what a timed-out prior call leaves
behind. All three are silent failures; none is visible on the canvas afterwards.

## Phase 0b — Scope it

Ask at most three questions. Everything else you can infer or decide:

- **What context does it serve?** (which page group / section it belongs in)
- **What are its variant axes, and which interaction states does it need?**
- **Does it have sub-parts that should be their own components?**

Then, before designing anything:

```
figma_search_components with the obvious names, plus synonyms
```

Also read the page list. Take the user's own words as a specification — if they say "floater",
"drawer", "chip", "stepper", search for that word first.

**Translate the vocabulary before concluding anything is missing.** A name you can't find is usually
the same thing under a name this library doesn't use:

| You are looking for | It is called |
|---|---|
| Busy Indicator · Activity Indicator · Loading · Spinner | `Spin` |
| Step Input · Stepper · Numeric Input | `InputNumber` |
| Rating Indicator · Star Rating | `Rate` |
| Combobox · Multi Combobox · Picker | `Select` |
| Illustrated Message · Empty State | `Result` / `Empty` |
| Toast · Snackbar | `Message` |
| Back to top · Floating Action · FAB | `FloatButton` |
| Segmented Control | `Segmented` |
| Notice Bar · Banner | `Alert` |
| Accordion · Panel | `Collapse` |
| Image Picker · File Upload · Attachment | `Upload` |

Names with **no** entry above — `Tab Bar`, `Action Sheet`, `Swipe Action`, `Search Bar`,
`Picker View` — are the real gaps.

When you do reuse, `Avatar`, `Badge / Status`, `Badge / Basic`, `Tag / Status`, `Alert`, `Progress`,
`Spin` and `FloatButton` cover a lot of ground. See `references/source/foundations.md` for the
reusable inventory and the full component list.

## Phase 0c — Platform reach and responsive behaviour

**Both come from the ask, not from a rule you apply.** If the request names a platform or a
breakpoint behaviour, use it verbatim. If it doesn't, ask — one question, at Phase 0b, alongside the
other scoping questions. Do not infer either from the component's shape.

Two things to settle:

- **Which platforms it ships to** — web, mobile, or both. Mobile is one answer, not two: a component
  that ships to mobile ships to iOS and Android alike.
- **What it does at a narrow width**, if anything. Most components do nothing: they reflow, and
  reflow is never written down.

Whatever you settle goes into the component description in the fixed format — see **Phase 6**, which
owns that format because the description is where it lives.

**The unit is the root component, not the set.** 353 sets, ~68 roots. Sub-parts inherit their root's
declaration; `Slider / Slider Handle` has no platform reach of its own. Declare on the root only.

> **There is no per-component platform lookup.** Nothing in this repo records which platforms a
> given component reaches, so there is nothing to go and read. Ask the user. If such a table is
> ever written, it belongs here at Phase 0c.

## Phase 1 — Enumerate the system before you build

Run `scripts/source/audit-system.js` through `figma_execute`. It lists every effect style, text style, paint
style, grid style, variable collection and mode, so you are never guessing what exists.

This matters because the names are not what you'd predict. The heading styles are `Heading/4`, not
"Heading 4" — a plausible pattern match misses them. There are **zero paint styles**, so colour is
variables-only. There are 10 effect styles, and every floating surface in the library uses
`boxShadowSecondary`.

Then read the **nearest existing sibling** and copy its binding conventions:

```js
// what does the closest component actually bind?
const n = await figma.getNodeByIdAsync('<sibling variant id>');
// walk boundVariables on the node, and on each fill/stroke paint
```

`references/source/foundations.md` records the current inventory — read it, but re-run the audit
anyway, because the file changes.

### Everything is local here — bind by name

All three asset types resolve locally:

| Asset | How |
|---|---|
| **Variables** | `getLocalVariableCollectionsAsync()` → `getVariableByIdAsync(id)`, or look up by name |
| **Text / effect / grid styles** | `getLocalTextStylesAsync()` / `getLocalEffectStylesAsync()` / `getLocalGridStylesAsync()`, matched by name |
| **Components to nest** | `figma_search_components`, then `createInstance()` on the main component |

If `scripts/source/audit-system.js` ever reports **zeros**, the active target drifted to another file — it is not a
configuration problem. Re-check `figma_list_open_files` and re-pin; do not react by creating
anything.

> This diagnostic is **Source-mode only**. In a product kit, zeros are the correct and healthy
> result, because imported assets are remote rather than local. Applying this rule there will stall
> the work — that is why the mode gate exists.

## Phase 2 — Measure before you commit to a colour

Any time text or an icon sits on a coloured fill, compute the contrast **before** building it. This
library's brand orange fails WCAG AA with white text (3.24:1), and so does Ant's default blue at
step 6 (4.10:1) — neither is obvious by eye, and both look fine in a screenshot.

Use `scripts/source/helpers.js` → `contrast()`. Thresholds: **4.5:1** for text, **3:1** for icons and other
graphical objects.

Then pick the token by **meaning, not by appearance**. Read
`references/tokens.md` — it carries antd's own description for every global token,
keyed to this file's variable paths, and it exists because coverage auditing cannot catch a
wrong-but-bound token. The pairs that actually go wrong: `colorBgContainer` vs `colorBgElevated`,
`colorBorder` vs `colorSplit`, `borderRadius` vs `borderRadiusSM` (Button and Input take SM),
`colorIcon` vs `colorText` for icons, and the four `colorFill*` levels.

**Several of those pairs render identically today.** `colorBgContainer` and `colorBgElevated` are
byte-identical, and so are the two border tokens on a plain surface. That is precisely why the pick
has to come from meaning: nothing you can look at will tell you it was wrong, and no audit will
either.

Two habits that save a lot of rework:

- **Look for an existing semantic token before creating one.** A tinted chat bubble needed a
  light-blue surface; `colorInfoBg` was already `#e6f4ff` and gives 15.05:1 with `colorText`. Zero
  new variables. Search the Colors collection before proposing an addition to Foundations.
- **When no semantic token clears contrast, bind the palette step directly** — and say so, and why.
  A stated palette binding is honest; a semantic token that fails AA is a defect wearing the right
  name.

## Phase 3 — Build

**Naming**, following the file's existing scheme:

```
Component                       root, e.g. "Segmented"
Component / Variant             style variant, e.g. "Tabs / Card"
Component / Part Name           sub-part, e.g. "Slider / Slider Handle"
Component / Part / Style        sub-part variant
_Component / Thing              internal, not for designers
```

**No two components may share a name.** With one library, asset search returns exactly one result
per name and that property is worth protecting: `Data Table` not a second `Table`, `Tag Input` not
`Multi Input`, `Button Group` not `Buttons`. If the honest name for what you're building is already
taken, that is strong evidence you should be extending that set rather than adding one — go back to
Phase 0a.

Platform-only components take the platform's own vocabulary, which conveniently never collides:
`Tab Bar` beside `Tabs`, `Stepper` beside `InputNumber`, `Notice Bar` beside `Alert`. Don't
disambiguate with a suffix (`Tabs (Mobile)`) — asset search sorts those next to each other and the
designer still has to guess.

**Page naming:** 5-space indent under a `Category - - - -` divider; `❖` only in Foundation. Read the
page list before adding one, and put a platform-only component under the category it belongs to by
function, not in a "Mobile" catch-all.

**Variant axes are for what a designer switches visually** — typically Type, Size, State. Everything
else belongs in instance properties: booleans for optional elements, `INSTANCE_SWAP` for icons
(named `<Thing> Name` per convention), `TEXT` for content.

### The State vocabulary is fixed

Anything a user can interact with carries a `State` axis with **all four** of:

```
Default · Hover · Focused · Disabled
```

plus **`Pressed`** when the thing is actually pressed — a button, link, tab or menu option.
`Button / Basic` carries all five across its 960 variants and is the anchor the rest of the library
is measured against.

Dropping `Focused` is the common shortcut and it is a **keyboard-accessibility gap**, not a
simplification — 25 sets in this library are currently missing one of the four. But don't over-apply
either: a `Checkbox` has no distinct pressed state and an `Input` uses `Typing` / `Filled` instead,
so `Pressed` is not demanded of them.

Extend only where the component genuinely has more:

| Component kind | Add |
|---|---|
| Text entry | `Typing` · `Filled` |
| Anything asynchronous | `Loading` |
| Selectable | `Selected` — or `Active` for a persistent on/off |
| Navigation | `Current` — "you are here" |

**`Pressed` and `Active` are not the same thing and must not be merged.** `Pressed` is transient —
the pointer is down right now — and is what `Button`, `Dropdown`, `Pagination`, `Slider`, `Switch`
and `Upload` use. `Active` is persistent — this item *is* the selected or switched-on one — and is
what `Radio / Radio Button` and `X / Sender` use. A component can legitimately have both.

Coining a new state value is a decision to raise, not to make on the page: the library already
carries 30 distinct values across 106 sets, including one typo that shipped.

This restraint is not stylistic. `Button / Basic` in this library has 7 axes and **960 variants**,
which is why its sibling `Button / Variant (optional)` shipped with a single-value State axis —
nobody wanted to multiply it further. Making a status indicator a *swapped component* rather than a
fifth axis kept one component at 8 variants instead of 40.

### Before you draw anything: the reuse checkpoint

List every element you are about to draw — the search field, the filter chips, the count pill, the
avatar, the empty state — and run **`scripts/audit-reuse.js`** against the names. Anything it
matches, **stop and instance instead**. This runs *here*, before the first frame, not at Phase 5:
discovering it afterwards means the work is already done and the temptation is to keep it.

A visual review will not catch this: a hand-built search field looks exactly like a real one. The
audit is the only thing that sees the difference.

If the audit says a component exists but it is **weaker than what you need**, that is the stop-gate
in Phase 0a — fix the original, don't fork it, and don't silently accept the weakness.

**Build sub-parts first, then the root composing instances of them.** That is how `Slider`, `Table`
and `ColorPicker` are built, and it is what makes the anatomy legible.

**Bind as you go** — retrofitting is far more expensive:

| Property | Bind to |
|---|---|
| Fills, strokes | Colors variables (never a raw hex) |
| Text | a text style (`Text Base/Normal`, `Text SM/Normal`, `Heading/4`…) |
| Shadows | an effect style (`boxShadowSecondary` for floating surfaces) |
| Padding, gaps | `Space/Padding/*` |
| Radius | `Border Radius/*` |
| Stroke weight | `Size/Line Width/lineWidth` |
| Control/avatar sizes | `Size/Height/controlHeight*` |

The table says *which tier*; `references/tokens.md` says *which token in it*. A
floating surface is `colorBgElevated` + `boxShadowSecondary`, never `colorBgContainer`; a separator
is `colorSplit`, never `colorBorder`. Check there before binding anything you haven't bound before.

Bind to **`Components/<YourComponent>/*`**, which aliases the global tiers — that is what all 61
existing groups do, and what a new component is expected to do. The table above names the tier the
alias points *at*; the layer binds the component token.

`4. Components` has a single mode, and that costs nothing **as long as every token is an alias**:
Figma resolves an alias in the *consumer's* mode context, so a component token pointing at
`Colors/*` still swaps Light/Dark and one pointing at `2. Dimensions` still swaps Default/Compact.
Verified on this file — `Components/Chat/Component/bubbleBgIncoming` resolves black-4% in Light and
white-8% in Dark; `Components/Chat/Global/paddingSM` gives 12 at Default and 8 at Compact.

What *is* theme-blind is a **raw value** in that collection. So raw is permitted for dimensions with
a stated reason (`bubbleMaxWidth = 296`), and never for colour.

The group follows antd's own token map, in two halves:

```
Components/<Comp>/Global/<globalToken>       1:1 alias — the global tokens the component depends on
Components/<Comp>/Component/<semanticName>   the component's own roles — alias, or a reasoned raw value
```

Keep the `Global/` entry even when a `Component/` token supersedes it — `Card` carries both
`Global/colorBgContainer` and `Component/actionsBg`, and that group is the component's dependency
record.

Two things stay outside the component group, because they are owned elsewhere:

- **Typography** — text styles hold the `fontSize` / `fontFamily` / `lineHeight` / `fontWeight`
  bindings. Apply the style; never rebind those fields on the layer.
- **Nested instances** — a `Button` inside your component keeps `Components/Button/*`. Only an
  override you deliberately make is yours.

`scripts/source/helpers.js` provides `paintVar()`, `bindNum()`, `icon()` and `applyTextStyle()` so you
aren't re-deriving these each time. **Use `paintVar()` for every fill** — binding an alpha colour
naively produces solid black, because the variable's alpha does not transfer to the paint's opacity.

### The raw-value rule: nothing raw that isn't explained

Some values genuinely have no token — a pill radius that must be height ÷ 2, a 2px optical gap, a
negative overlap, a panel width, a 44pt touch target on a native control. `2. Dimensions` has no
token for 2, 6, 7 or 10, and no touch-density mode, so forcing a semantically wrong token
(`borderRadiusXS` used as a gap because both equal 2) is worse than an honest raw value.

So the standard is **not "no raw values"** — it is:

> **No raw value without a stated reason.** Every one goes in the `Raw values` block of the
> component description, with the value and why no token fits.

That is what makes the distinction auditable. An unexplained raw value is a defect; an explained one
is a decision, and `scripts/audit-coverage.js` reports the remainder so you can account for each.

### Build it so it can be made narrow

A component is "responsive" here when its contents stay inside its own bounds at any width it might
be given, and with real content rather than placeholder. Three rules, each from a defect this
library actually shipped:

| Rule | What it prevents |
|---|---|
| **No fixed width on anything that must shrink** — use `FILL`, or `HUG` with a bound `maxWidth` | An inner frame with a hard minimum: `Chat / Widget / Panel` has one at 355px, so at any width below that its content spills out |
| **A `maxWidth` in px is wider than some container it will live in** — express the cap as a ratio of the parent, or size the child `FILL` | `Chat / Message Item` caps its bubble at 432px; dropped into a 380px panel it overflows |
| **Every frame in an auto-layout chain hugs its main axis** unless deliberately fixed | A parent whose height stops counting its children |

Prove it with `scripts/check-reflow.js` at Phase 5 — it is the only thing that catches these, because
all three look correct at the width the component was drawn at.

**Keep a bottom-docked input sticky at every size.** A composer, search bar or action bar pinned to
the bottom edge stays pinned as the container narrows — it does not scroll away with the content.

**Reserve slots for deferred scope.** If a later phase will add a status chip, add the hidden,
boolean-toggled frame now. It costs nothing and prevents a rebuild.

## Phase 4 — Component properties

Add properties on the **component set**, then bind references on the matching layer in each variant.
Read `references/figma-api-gotchas.md` first — property keys carry a `#id` suffix, and switching a
variant resets overrides, both of which fail silently.

Judgement calls worth making deliberately:

- **Don't expose a text property when the label *is* the variant.** A lifecycle chip whose variants
  are Open/Pending/Resolved should not let someone put "Pending" on the Resolved variant.
- **Partial binding is legitimate.** If outgoing messages should always read "You" while incoming
  need an editable name, bind the text property only on the incoming variants. Figma allows this and
  the control still appears.
- **A shared property flattens per-variant defaults.** If four presence variants carry tailored copy,
  a single Subtitle property replaces all four with one default. Text on an instance is editable
  without a property — the property only adds discoverability, so weigh that against what it costs.

## Phase 5 — Verify (this is not optional)

Skipping this is how "done" becomes wrong. Read `references/verification.md` for the full procedure.
The short version:

1. **Screenshot every set** with `figma_capture_screenshot` (it reads live plugin state, unlike the
   REST export). Look at it. Fix what's obviously wrong before moving on.
2. **Pin the density mode explicitly** — Dimensions **and** Typography → Compact via
   `setExplicitVariableModeForCollection` on a temporary instance, together or not at all. Anything
   that fails to move is an unbound value. Reasoning about this instead of testing it does not work.
3. **Run `scripts/check-reflow.js`.** It narrows a throwaway instance across the component's own
   width range and re-runs it with realistic text. **Every `overflowPx` must be 0.** Then resize the
   example frame to each breakpoint you declared and check the behaviour matches the verb you wrote —
   a `Web:` line nobody tested is a guess written in a permanent place.
4. **Stress the content**: longest realistic string, single character, emoji-only, unbroken URL,
   `99+` in a count, empty state, narrowest container. This routinely finds real bugs that visual
   review passes — a fixed-width badge that clips `99+`, a property default that overrides a
   per-variant label.
5. **Run the three audits.** `scripts/audit-coverage.js` for token/style coverage — exclude
   instances, since an instance's values belong to its main component. `scripts/audit-platform.js`
   to confirm the Phase 0c declaration is present, uses the nine allowed verbs, and matches the
   declared platform reach. `scripts/audit-reuse.js` to catch anything you hand-drew that the library
   already ships, and any component you leaned on that is too weak to be leaned on.
6. **Read back anything you claim to have fixed, in the same call.** Silent failure is the norm with
   this API, not the exception.

Screenshot-iterate at most three rounds, then hand over the judgement calls you couldn't make.

## Phase 6 — Document

**The description is the only place metadata lives.** Identity is on canvas once, in the page
header; everything else a reader or an audit needs — including the changelog — is here. One place,
so there is nothing to keep in sync.

Every set ships with this, in this order:

```
<One-line summary of what it is.>

**When to use**

- <guidance, and when to reach for something else instead>

**Properties**

Variants

- Axis — Option · Option · Option

Instance properties

- Name — text
- Show Thing — boolean, default true

**Responsive**

Web: <992 stack · <768 swap → List View
Native: Compact stack

Reviewed: yes — <one line on what actually changes, or why nothing does>

**Raw values**

- 10 — pill radius, must be height ÷ 2; no token
- 44 — native touch target; no touch-density mode exists

**Search metadata**

<keywords — the alternative names from the vocabulary table in Phase 0b>
```

Four rules that keep it machine-checkable:

- **Generate the Properties block** from `componentPropertyDefinitions` rather than typing it, so it
  can't drift — `scripts/source/helpers.js` → `propsBlock()`.
- **Omit `Responsive` lines that say nothing.** `reflow` is the silent default; only write a
  breakpoint where something changes. `Reviewed:` is always present, including when there is nothing
  above it — that is what separates "looked at it" from "nobody has".
- **Use only these nine verbs.** Free prose is unreadable across 68 components and uncheckable by
  any script. If a behaviour doesn't fit one, raise it and extend this list rather than inventing a
  phrase no script will match:

  | Verb | Means |
  |---|---|
  | `reflow` | Layout holds, container narrows — **the implicit default, never written** |
  | `stack` | Horizontal → vertical |
  | `collapse` | Full → icon-only or summary |
  | `scroll-x` | Content scrolls horizontally, container stays put |
  | `swap → <Component>` | Replaced by a different component entirely |
  | `dock` | Moves to a fixed edge — bottom or top |
  | `hide` | Removed |
  | `truncate` | Ellipsised |
  | `paginate` | Split across pages or steps |

  Web breakpoints are written `<N` or `≥N` using only the six Ant values (480 · 576 · 768 · 992 ·
  1200 · 1600). A `Native:` line uses window size class names — `Compact` (<600) · `Medium`
  (600–840) · `Expanded` (>840) — never pixels. Separator is ` · ` throughout;
  `scripts/audit-platform.js` parses on it. For a `swap →` target, name the
  replacement component explicitly; there is no lookup table for this.
- **Every entry under `Raw values` must match something `scripts/audit-coverage.js` reports.** An unlisted
  raw value is a defect; a listed one is a decision.
- **`Search metadata` is not decoration.** Figma's asset search matches descriptions, so this is what
  makes `Spin` findable by "activity indicator" and stops someone building a second one.

Insert new sections **before** any `**Code example**` block, not after — Figma eats the newline after
a closing code fence and the block welds onto it. See `references/figma-api-gotchas.md`.

### The page is part of the deliverable

A component ships with its page laid out, not just its set built. Read
`references/source/page-template.md` and follow it — a 1440 doc frame (page header, a Light/Dark
playground, page footer) beside three sections: `Components`, `Density scale`, `Example Screens`.
The **Button** page (`368:430`) is the reference implementation; 70 pages in the file follow it.

Three things about that template are worth knowing before you start, because each one is a decision
that looks like a mistake from the outside:

- **`_Docs / *` components stay `UNPUBLISHED`.** The `_` prefix means internal, and dropping it
  would push documentation scaffolding into the Assets panel of every product file that subscribes
  to this library. Keep the prefix; keep them unpublished.
- **The Light/Dark playground is not decoration.** It is the only check that catches a hardcoded
  colour — invisible in Light, unmissable in Dark. Build the two frames from one `clone()` so their
  contents cannot drift.
- **`Search metadata` carries the synonyms.** Figma's asset search matches descriptions, so this is
  what makes `Spin` findable by someone typing "busy indicator" or "activity indicator". It is the
  reason not to duplicate a component just to match a name someone expects.

The `Density scale` section keeps the Phase 5 mode sweep instead of discarding it — build the sweep
there in the first place and you get verification and documentation from one piece of work.

## Handing over

Report honestly, and separate these three:

- **What's verified** — with the evidence (coverage numbers, contrast ratios, modes tested).
- **What's deliberately raw or omitted** — and why, so it doesn't read as an oversight.
- **Judgement calls you couldn't make** — optical nudges, whether a colour reads right, anything
  needing the user's eye.

Publishing is always the user's action; you cannot publish, and descriptions don't reach consumers
until they do. The chain is now one hop:

```
library edited → publish UpBase Design System → product files accept the update
```

Say plainly that nothing you built is visible to any product designer until that publish happens,
and that a rename or a description change needs it just as much as a visual one.

## Reference files

- `references/source/foundations.md` — current token collections, styles, breakpoints, reusable components, component inventory
- `references/tokens.md` — **which token to reach for**: antd's own description per global token, keyed to this file's paths, plus the confusable pairs
- `references/source/page-template.md` — in-page structure for a component page: doc frame, playground, label layer, density scale
- `references/figma-api-gotchas.md` — the API traps that fail silently; read before writing plugin code
- `references/verification.md` — mode sweep, breakpoint sweep, stress cases, coverage audit procedure
- `scripts/preflight.js` — **run first, before any node**: proves the file, the mode and that no timed-out call left work behind
- `scripts/source/helpers.js` — paste-in preamble: `paintVar`, `bindNum`, `icon`, `contrast`, `propsBlock`
- `scripts/source/audit-system.js` — enumerate all styles, collections and modes
- `scripts/audit-coverage.js` — token/style coverage report for a page
- `scripts/audit-platform.js` — validates responsive declarations: vocabulary, breakpoint values, and whether an example frame proves each one
- `scripts/check-reflow.js` — **writes then cleans up**: narrows a component and stresses its text to find content that escapes its own bounds
- `scripts/audit-reuse.js` — **hand-built elements a component already covers, and components too weak to reuse**; run it first when refactoring an existing page
