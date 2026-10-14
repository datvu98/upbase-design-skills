# Tokens — which one to reach for, and what it actually is

> **Shared by every skill.** Token meanings and values are the same wherever you build. Only the
> lookup differs: the UpBase file resolves these names locally, a kit imports the same tokens by key
> (`_shared/references/upbase-library.md`). Picking the right one is this file either way.

`_shared/scripts/audit-coverage.js` measures whether a value is **bound**. Nothing measures whether it is
bound to the **right** token — and a wrong-but-bound token scores 100%. A `Popover` that binds
`colorBgContainer` for its surface passes every check in `_shared/references/verification.md` and renders
identically to the correct `colorBgElevated`, so nothing anyone can look at will catch it.

This file is the missing half, and it carries **both halves of every token fact**:

| | |
|---|---|
| **antd says** | antd's own description, verbatim — what the token is *for* |
| **UpBase has** | the value actually in `BoGaG48v9BfY7LkMtFs4zh` |
| **deviation** | where the two differ, and whether that is deliberate |

Keeping those together is deliberate. They were split across two files until 2026-09-14 and drifted
within a day of each other — `controlHeightLG` was documented as antd's 40 while the file had been
raised to 44. A token's meaning and its value are one fact; they live on one line.

Scope is the three global collections (233 + 65 + 22 = **320 variables**). `4. Components` is out of
scope on purpose — the rule is to bind up to these tiers, not into that one. For what the component
tier contains and why you shouldn't add to it, see `design-system-builder/references/foundations.md`.

> **Ported into Figma 2026-08-26.** All 320 global variables carry this guidance in their
> `description` field, so a designer hovering a token in the Variables panel sees it. Dimension and
> Typography descriptions also carry their resolved `Default / Compact` values. This file and those
> descriptions must stay in sync — change one, change the other.
>
> Not yet published, so consumers won't see the descriptions until the library is republished.

## Contents

- [Never bind these](#never-bind-these)
- [The brand is orange](#the-brand-is-orange) ← and the path that fails silently
- [Backgrounds](#backgrounds) ← the most common wrong pick
- [Borders and separators](#borders-and-separators)
- [Fills](#fills)
- [Text](#text)
- [Icons](#icons)
- [The status colour grid](#the-status-colour-grid)
- [Control interaction states](#control-interaction-states)
- [Contrast, measured](#contrast-measured)
- [Radius](#radius)
- [Heights and interactive size](#heights-and-interactive-size)
- [Line widths](#line-widths)
- [Spacing](#spacing)
- [Typography](#typography)
- [Breakpoints](#breakpoints)
- [Tokens that do not exist here](#tokens-that-do-not-exist-here)

---

## Never bind these

Three variables in `Colors/Neutral/` are **Seed tokens** — inputs to antd's derivation algorithm,
not values meant for a layer. antd's own doc on `colorBgBase` says it outright:

> "Used to derive the base variable of the background color gradient. In v5, we added a layer of
> background color derivation algorithm to produce map token of background color. But **PLEASE DO
> NOT USE this Seed Token directly in the code!**"

| Variable | Bind this instead |
|---|---|
| `Colors/Neutral/colorBgBase` | `colorBgContainer` / `colorBgLayout` / `colorBgElevated` |
| `Colors/Neutral/colorTextBase` | `colorText` and the rest of the text ramp |
| `Size/sizeStep`, `Size/sizeUnit` | any real `Space/*` or `Size/*` token |

Figma will happily let you bind them and nothing will warn you. `Colors/Neutral/transparent` is
fine to use; it is not a seed.

---

## The brand is orange

**Not Ant blue.** The library was seeded from Ant Design and rebranded; anything still resolving to
`#1677ff` is a leftover, not a decision — see *Known gaps* in `design-system-builder/references/foundations.md`.

The full path is **`Colors/Brand/Primary/colorPrimary`** — not `Colors/Brand/colorPrimary`. A lookup
on the shorter name returns null and **fails silently**.

| Token | Resolves to |
|---|---|
| `colorPrimary` | `Colors/Base/Orange/6` = `#f95838` |
| `colorPrimaryHover` / `colorPrimaryActive` | Orange/5 / Orange/7 |
| `colorSuccess` / `colorWarning` / `colorInfo` | Green/6 / Gold/6 / Blue/6 |
| `colorError` | `#ff4d4f` |
| `colorText` → Quaternary | `#000` @ .88 / .65 / .45 / .25 |
| `colorBgContainer` / `colorBgLayout` | `#ffffff` / `#f5f5f5` |
| `colorBorder` / `colorBorderSecondary` | `#d9d9d9` / `#f0f0f0` |
| `colorFillSecondary` / `Tertiary` / `Quaternary` | `#000` @ .06 / .04 / .02 |
| `colorTextLightSolid` | white — use for text on a coloured fill |

---

## Backgrounds

The single most common wrong pick in this library. All live under `Colors/Neutral/Bg/`.

| Token | antd description | Use it for |
|---|---|---|
| `colorBgContainer` | "Container background color, e.g: default button, input box, etc." | Cards, inputs, default buttons, table rows — anything **sitting on** the page |
| `colorBgElevated` | "Container background color of the popup layer, **in dark mode the color value of this token will be a little brighter**" | Anything **floating above** the page: Popover, Dropdown, Modal, Tooltip surface, Select menu, DatePicker panel |
| `colorBgLayout` | "This color is used for the background color of the overall layout of the page." | The page/canvas behind everything. Not a component surface |
| `colorBgSpotlight` | "This color is used to draw the user's strong attention to the background color" | Inverse surfaces — Tooltip body, spotlight callouts |
| `colorBgMask` | "The background color of the mask, used to cover the content below the mask" | Modal/Drawer scrim only |
| `colorBgContainerDisabled` | "Control the background color of container in disabled state" | Disabled inputs and controls |
| `colorBgSolid` / `Hover` / `Active` | "Solid background color, **currently only used for the default solid button**" | Nothing except the solid Button variant. Don't generalise it |
| `colorBgTextHover` / `colorBgTextActive` | "Control the background color of text in hover / active state." | Hover wash behind a text/link button |
| `colorBorderBg` | — | The fill *behind* a bordered element in wireframe mode. Rarely what you want |

**Decision rule:** does the element cast a shadow / sit in a layer above the page? → `colorBgElevated`.
Otherwise → `colorBgContainer`. Pair `colorBgElevated` with `boxShadowSecondary`; the two travel
together for every floating surface in this library.

**Why this one is worth its own rule** — both resolve to `colorBgBase` (`#ffffff`), so they are
**byte-identical on screen**. The wrong pick is invisible in every screenshot, every review, and
every coverage report; the only thing that separates them is what they *mean*. This is the exact
failure profile this file exists for, and the reason the rule is "pick by meaning" rather than
"check it looks right".

Same shape in the border family: `colorSplit` is `#000 @6%` and composites over whatever sits
behind it, while opaque `colorBorderSecondary` (`#f0f0f0`) does not — so on a tinted surface the two
diverge, and on a white one they do not.

---

## Borders and separators

| Token | antd description | Use it for |
|---|---|---|
| `Colors/Neutral/Border/colorBorder` | "Default border color, used to separate different elements" | Input, Select, Card outlines — a real edge |
| `Colors/Neutral/Border/colorBorderSecondary` | "Slightly lighter than the default border color" | Softer edges: Card inner dividers, Table cell borders |
| `Colors/Neutral/Border/colorSplit` | "Used as the color of separator, **this color is the same as `colorBorderSecondary` but with transparency**" | Divider, List item separator, Menu group split |

**Decision rule:** an *edge that outlines a shape* → `colorBorder`. A *line that separates two
things* → `colorSplit`. The transparency is the point: `colorSplit` composites correctly over any
surface, `colorBorderSecondary` does not.

---

## Fills

Four levels, all under `Colors/Neutral/Fill/`. antd distinguishes them by **how much attention they
should attract**, not by opacity number:

| Token | antd description | UpBase has |
|---|---|---|
| `colorFill` | "The darkest fill color is used to distinguish between the second and third level of fill color" | `#000` @ 15% |
| `colorFillSecondary` | "The second level of fill color **can outline the shape of the element more clearly**" | `#000` @ 6% |
| `colorFillTertiary` | "The third level of fill color is used to **outline the shape of the element**" | `#000` @ 4% |
| `colorFillQuaternary` | "The weakest level of fill color is suitable for **color blocks that are not easy to attract attention**" | `#000` @ 2% |

**4% vs 6% black is not a distinguishable hover/selected pair.** If a component needs two adjacent
non-selected states, skip a level — `colorFillQuaternary` for hover and `colorFillSecondary` for
selected — rather than using Tertiary and Secondary side by side.

Also present: `colorFillContent`, `colorFillContentHover`, `colorFillAlter`, `colorFillAlterSolid`,
`colorFilledHandleBg`. These are antd's aliases for filled-variant inputs and the Slider handle —
use them only for those, not as a general fill ramp.

---

## Text

Two families, and picking from the wrong one is the usual mistake.

**The neutral ramp** — pick by *visual weight*:

| Token | antd description | UpBase has |
|---|---|---|
| `colorText` | "Default text color which comply with W3C standards, and this color is also the darkest neutral color." | `#000` @ 88% |
| `colorTextSecondary` | "The second level of text color is generally used in scenarios where text color is not emphasized" | `#000` @ 65% |
| `colorTextTertiary` | "The third level of text color is generally used for descriptive text" | `#000` @ 45% |
| `colorTextQuaternary` | "The fourth level of text color is the lightest text color" | `#000` @ 25% |

**The semantic names** — pick by *what the text is*. Prefer these when one fits; they alias into the
ramp anyway, and they survive a future re-tuning of the ramp:

| Token | antd description |
|---|---|
| `colorTextHeading` | "Control the font color of heading." |
| `colorTextLabel` | "Control the font color of text label." |
| `colorTextDescription` | "Control the font color of text description." |
| `colorTextPlaceholder` | "Control the color of placeholder text." |
| `colorTextDisabled` | "Control the color of text in disabled state." |

**Text on a coloured fill** — three near-identical-looking options, only one is usually right:

| Token | When |
|---|---|
| `colorTextLightSolid` | "Control the highlight color of text with background color, such as the text in Primary Button" — **this is the default choice** for a label on a brand/status fill |
| `colorWhite` | "Pure white color **don't changed by theme**" — only when the value must stay literally white whatever the theme does |
| `solidTextColor` | Button's own component token, leaked into this collection. Don't reach for it outside Button |

Never assume white passes contrast on a fill — brand orange is **3.24:1** with white. Measure with
`design-system-builder/scripts/helpers.js` → `contrast()` first (Phase 2), and see
[Contrast, measured](#contrast-measured).

---

## Icons

| Token | antd description |
|---|---|
| `Colors/Neutral/Icon/colorIcon` | "Weak action. Such as `allowClear` or Alert close button" |
| `Colors/Neutral/Icon/colorIconHover` | "Weak action hover color. Such as `allowClear` or Alert close button" |

These are for **secondary/dismissal icons only**. Verified in this file: `colorIcon` aliases
`colorTextTertiary` in both modes — antd's "third level … generally used for descriptive text". So
binding a meaningful icon to `colorIcon` silently demotes it to tertiary weight and makes it read as
disabled. A meaningful icon takes the same token as the text it belongs to (`colorText`,
`colorTextSecondary`…).

---

## The status colour grid

Primary, Success, Warning, Error and Info each expose the **same 10-token grid** under
`Colors/Brand/<Name>/`. Learn the grid once and it applies to all five:

| Suffix | Role |
|---|---|
| `colorX` | The base colour. Solid fills, meaningful icons |
| `colorXHover` / `colorXActive` | Interaction states of that solid fill |
| `colorXBg` / `colorXBgHover` | "Light background color of X" — tinted surfaces: Tag, Alert, selected rows |
| `colorXBorder` / `colorXBorderHover` | Stroke on a tinted surface |
| `colorXText` / `colorXTextHover` / `colorXTextActive` | Text **in** that colour on a neutral surface — not text on the fill |

Two specifics worth knowing:

- `colorPrimaryBorder` — "the stroke color under the main color gradient, **used on the stroke of
  components such as Slider**". It is a stroke token, not a light border for anything primary.
- `colorInfoBg` is `#e6f4ff` and gives **15.05:1** against `colorText` — a ready-made tint. Check
  for an existing token like this before proposing a new one.

`Colors/Brand/Link/` carries only `colorLink` / `colorLinkHover` / `colorLinkActive`.

Outline tokens live here too: `colorErrorOutline`, `colorWarningOutline`, and
`Colors/Brand/Control/controlOutline` — these are the **focus ring wash**, not a border. In this
library the focus ring is an effect style (`Component/Input/activeShadow`), so prefer that; the
effect-style inventory is in `design-system-builder/references/foundations.md`.

---

## Control interaction states

Under `Colors/Brand/Control/`. These are for **items inside a control** (Select option, Menu item,
Table row, Cascader node) — not for buttons.

| Token | antd description |
|---|---|
| `controlItemBgHover` | "Control the background color of control component item when hovering." |
| `controlItemBgActive` | "Control the background color of control component item when active." |
| `controlItemBgActiveHover` | Hover state of an already-active item |
| `controlItemBgActiveDisabled` | Active + disabled |
| `controlOutline` / `controlTmpOutline` | Focus ring wash on inputs |

A hover on a **button** uses the button's own state colours (`colorPrimaryHover`, or
`colorBgTextHover` for text buttons). A hover on a **list item inside a dropdown** uses
`controlItemBgHover`. Mixing these is why some menus feel unlike the rest of the system.

---

## Contrast, measured

Compute contrast **before** committing to a colour, not after. Neither brand orange nor Ant blue-6
passes AA with white text, and neither failure is visible by eye.

| Fill | White text | `colorText` @88% |
|---|---|---|
| Orange/5 `#ff8161` | 2.45 ✗ | 7.56 ✓ |
| Orange/6 `#f95838` (brand) | **3.24 ✗** | 5.87 ✓ |
| Orange/7 `#d43b24` | 4.72 ✓ | 4.14 ✗ |
| Blue/1 `#e6f4ff` | 1.12 ✗ | **15.05 ✓** |
| Blue/6 `#1677ff` | **4.10 ✗** | 4.71 ✓ |
| Blue/7 `#0958d9` | 6.16 ✓ | 3.21 ✗ |

Thresholds: **4.5:1** for text, **3:1** for icons and other graphical objects. Icons only need 3:1,
so white on Orange/6 is acceptable for an icon but not for a label.

---

## Radius

| Token | antd description | UpBase has |
|---|---|---|
| `Border Radius/borderRadiusXS` | "XS size border radius, used in some small border radius components" | 2 |
| `Border Radius/borderRadiusSM` | "SM size border radius, **used in small size components, such as Button, Input, Select**" | 4 |
| `Border Radius/borderRadius` | "Border radius of base components" | 6 |
| `Border Radius/borderRadiusLG` | "LG size border radius, used in some large border radius components, **such as Card, Modal**" | 8 |

**The counterintuitive one:** Button, Input and Select take `borderRadiusSM` (4), not the base
`borderRadius` (6), despite the base name sounding like the default for controls. Cards and Modals
take LG. Check the sibling component before assuming.

A pill radius (height ÷ 2) has no token and never will — leave it raw and record it in the
component's `Raw values` block. Never borrow `borderRadiusXS` because it happens to equal a 2px gap.

---

## Heights and interactive size

| Token | antd description | UpBase has (Default / Compact) |
|---|---|---|
| `Size/Height/controlHeightXS` | "XS component height" | 16 / 14 |
| `Size/Height/controlHeightSM` | "SM component height" | 24 / 21 |
| `Size/Height/controlHeight` | "The height of the basic controls such as buttons and input boxes" | 32 / 28 |
| `Size/Height/controlHeightLG` | "LG component height" | ⚠️ **44 / 35** — see below |
| `Size/controlInteractiveSize` | "Control the interactive size of control component." | 16 / 14 |

> ⚠️ **`controlHeightLG` deviates from antd.** antd ships 40; this file has **44**, verified
> 2026-08-27. Its Compact value of 35 is 40 × 0.875, so the Default was raised at some point and
> Compact was not followed through. **Treat the pair as suspect before relying on it.** Note that 44
> already equals Apple's touch-target floor, which may be why it was raised.

`controlInteractiveSize` is the **Checkbox / Radio square**, not a height. At Compact it is **14** —
below WCAG 2.2 §2.5.8's 24px minimum, which is why `design-system-builder/references/page-template.md` excludes
Compact from native-only pages, and why a component that only ships to mobile has no reason to
render a Compact version at all.

`Size/Base/size*` (XXS → XXL) is the generic size ramp these derive from; prefer the named
`controlHeight*` when you mean a control.

Bind control heights to these tokens wherever one fits. Where none does — a ~44pt native touch
target, for instance — leave the number raw and record it in the component's `Raw values` block.
There is **no touch-density mode and no plan for one**; see *Density modes* in
`design-system-builder/references/foundations.md`.

---

## Line widths

| Token | antd description | UpBase has |
|---|---|---|
| `Size/Line Width/lineWidth` | "Border width of base components" | 1 |
| `Size/Line Width/lineWidthBold` | "The default line width of the outline class components, such as Button, Input, Select" | 2 |
| `Size/Line Width/lineWidthFocus` | "Control the width of the line when the component is in focus state" | 4 |
| `Size/Line Width/controlOutlineWidth` | Width of the focus ring wash | — |

Stroke-weight binding **reports success and does nothing** when per-side weights are set — read it
back (`_shared/references/figma-api-gotchas.md`).

---

## Spacing

antd separates spacing by **what it is spacing**, and the distinction is real:

| Family | antd description | Use for |
|---|---|---|
| `Space/Padding/padding*` (XXS → XL) | "Control the … padding of the element." | Inside a container |
| `Space/Margin/margin*` (XXS → XXL) | "Control the margin of an element, with a … size." | Between siblings — in Figma, auto-layout **gap** |
| `Space/Padding/paddingContentVertical` / `Horizontal` (+ SM/LG) | "Control the vertical / horizontal padding of **content** element." | Text-bearing content blocks, not controls |
| `Space/Padding/controlPaddingHorizontal` (+ SM) | "Control the horizontal padding of an element." | Inside a control — Input, Select, Button |

`Space/Padding/*` and `Space/Margin/*` alias into Size, so they respond to Compact:

| Value | Token |
|---|---|
| 4 | `paddingXXS` |
| 8 | `paddingXS` |
| 12 | `paddingSM`, `controlPaddingHorizontal` |
| 16 | `padding` |
| 20 | `paddingMD` |
| 24 | `paddingLG` |
| 32 | `paddingXL` |

**No token exists for 2, 6, 7 or 10.** Leave those raw rather than borrowing a radius token that
happens to match — and record them in the `Raw values` block.

---

## Typography

Font is **Be Vietnam Pro** (all 18 weights available).

| Token | antd description | UpBase has (Default / Compact) |
|---|---|---|
| `Typography/Font Size/fontSize` | "The most widely used font size in the design system" | 14 / 12 |
| `Typography/Font Size/fontSizeSM` | "Small font size" | 12 / 10 |
| `Typography/Font Size/fontSizeLG` | "Large font size" | 16 / 14 |
| `Typography/Font Size/fontSizeXL` | — | 20 / 16 |
| `fontSizeHeading1`–`5` | Font sizes for h1–h5 | `Heading4` = 20 / 16 |
| `fontSizeIcon` | Icon-sized type | — |
| `Typography/Line Height/lineHeight` (+ SM/LG/Heading1–5) | "Line height of text." | 22 / 20 |
| `Typography/Font Weight/fontWeightStrong` | "Control the font weight of heading components (such as h1, h2, h3) or selected item." | — |
| `Typography/Font Family/fontFamily` | "The font family … prioritizes the default interface font of the system" | **Be Vietnam Pro** |
| `Typography/Font Family/fontFamilyCode` | "Code font, used for code, pre and kbd elements in Typography" | — |

**In practice, don't bind these per node.** The 20 text styles already carry `fontSize` +
`fontFamily` + `lineHeight` + `fontWeight` bound to these variables, so applying `Text Base/Normal`
gives Compact response for free and keeps the pairing correct. Bind a raw `fontSize` only when no
text style fits, and say why. The style list is in `design-system-builder/references/foundations.md`.

**Designing a mobile form:** iOS Safari **auto-zooms when an input under 16px takes focus**, and no
density mode compensates — an input meant for mobile web needs 16px set deliberately.

---

## Breakpoints

`Size/Screen Size/screen{XS,SM,MD,LG,XL,XXL}` — Ant standard **480 / 576 / 768 / 992 / 1200 / 1600**
— plus a `Max` and `Min` for each. Don't create new breakpoint tokens.

**Which of the three you bind matters:**

| | Is | Bind it to |
|---|---|---|
| `screenMD` | 768 — the boundary itself | a media-query threshold, if you were writing CSS. Rarely the right choice on canvas |
| **`screenSMMax`** | **767 — the widest pixel below it** | **an example frame proving `<768` behaviour** |
| `screenMDMin` | an alias | — |

An example frame at 768 sits in the *wide* band and demonstrates nothing about `<768`. The `Max`
variables exist for exactly this and are the ones to reach for; `design-system-builder/references/page-template.md`
§ *Example screen sizes* has the full mapping.

What a component *does* at each breakpoint is recorded in its description — `design-system-builder/references/workflow.md`
Phase 6 owns that format and the nine allowed verbs.

## Layout

`Size/Layout/contentMaxWidth` — **1440**, same at Default and Compact (added 2026-10-08, UpBase-only;
antd has no equivalent). The cap on an app shell's **page content column**, not a breakpoint: header
and side navigation stay full-bleed, the column fills the space beside them up to this width, then
centres. CSS `var(--contentMaxWidth)` with `width: 100%; margin-inline: auto`.

On canvas it goes on a `Content` frame inside the screen's `Main` (FILL, `maxWidth` bound to this), with
`Main` set to counter-axis CENTER. Worked example: UpS Product 2026 › `↳ Specifications` ›
`Layout / Content max width`.

---

## Tokens that do not exist here

Present in antd, absent from this file — don't go looking, and don't invent them:

- **All motion tokens** — `motionDurationFast/Mid/Slow`, `motionEaseInOut`, `motionUnit`. Figma has
  no motion variable tier here. Animation intent belongs in the handover, not on a layer.
- **All z-index tokens** — `zIndexBase`, `zIndexPopupBase`. Layer order carries this in Figma.
- **`colorHighlight`**, **`wireframe`**, **`focusOutline`**, **`opacityImage`** — behaviour switches
  and one-offs with no Figma equivalent.

Two tokens exist here that are really **component tokens leaked into the global tiers**:
`Colors/Neutral/Bg/defaultBg` and `Colors/Neutral/Text/solidTextColor`, both from Button. Leave them
alone; don't add more of this kind, and don't treat them as general-purpose.
