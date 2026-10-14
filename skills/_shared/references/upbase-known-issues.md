# UpBase known issues

> **Shared by every skill.** Measured defects and deliberate behaviour changes in UpBase Design System
> (`BoGaG48v9BfY7LkMtFs4zh`) that every consumer inherits. In **ui-kit-builder** and **product-screen-builder**, read it so you don't
> report one of these as your own bug, or "fix" it with overrides in the kit — raise it upstream
> instead. In **design-system-builder**, it is the to-do list; when you fix one, move it to *Resolved* with
> the date and add a changelog item.
>
> Every entry carries the date it was measured. UpBase moves; re-measure before quoting a number in
> a description or a proposal.

**Contents** — Contrast · Effects and rendering · Tokens · Components · Behaviour changes
consumers should know · Resolved

## Contrast

**Status colours fail 3:1 on white** (2026-09-23, Light, on `colorBgContainer`):

| Token | Hex | vs white |
|---|---|---|
| `colorSuccess` = `colorSuccessText` | `#52c41a` | **2.27** |
| `colorWarning` = `colorWarningText` | `#faad14` | **1.90** |
| `colorError` = `colorErrorText` | `#ff4d4f` | 3.27 |
| `colorInfo` = `colorInfoText` | `#1677ff` | 4.10 |

The `…Text` variants are byte-identical to the base tokens, so there is no semantic escape. Bind the
palette step directly and say so in the description:

| Need | Success | Warning | Error |
|---|---|---|---|
| 3:1 — large text, icons, dots | `Colors/Base/Green/7` `#389e0d` (3.46) | `Colors/Base/Gold/8` `#ad6800` (4.41) | `colorError` |
| 4.5:1 — normal text (12–16px) | `Colors/Base/Green/8` `#237804` (5.59) | `Colors/Base/Gold/8` | `Colors/Base/Red/7` `#cf1322` (5.57) |

`Badge / Status` still ships `Success` at 2.27:1. Ant's warning icon on its own tint
(`colorWarning` on `colorWarningBg`) is 1.83:1; the `…Active` step is the accessible alternative.

**`colorTextDescription` fails AA for text** — black at 45%, **3.35:1** on `colorBgContainer`. Use
`colorTextSecondary` (65%, 6.98:1) for secondary text.

**No neutral hairline reaches 3:1.** `colorBorder` #D9D9D9 is 1.41:1, `colorBorderSecondary` 1.14:1.
Accepted for decorative frames (WCAG 1.4.11 covers graphics needed to understand content); don't
rely on a border alone to convey state.

**The categorical chart palette fails validation** (measured with the `dataviz` skill's
`validate_palette.js`, 2026-09-11 and 2026-09-22). `Colors/Chart/Categorical/1…8`:

| Pair | Problem |
|---|---|
| 6 ↔ 8 gold/lime | ΔE 0.9 under deuteranopia — indistinguishable |
| 3 ↔ 8 green/lime | ΔE 5.6 under **normal** vision (floor 15) |
| 4 ↔ 5 magenta/teal | below the CVD floor |
| 1 ↔ 3 | fails under deuteranopia — and `Chart` State=Default ships series 1, 2, 3 |

Dark mode: 5 of 8 steps outside the lightness band; series 7 is 2.23:1 on `colorBgContainer`. **Safe
3-series set: 1, 2, 4.** Always show a legend; direct-label ≤4 series. No re-ordering of the 8 hues
fixes more than 3 series — the fix is new hues (UpBase file work, plus re-rendering the chart plots).

## Effects and rendering

**The focus style renders on nothing frame-based.** `Component/Input/activeShadow` is a
DROP_SHADOW with `radius: 0`, and a radius-0 drop shadow paints on a RECTANGLE but **never on a
FRAME** (isolated 2026-09-24). Bounds still grow by the spread, so geometry checks report it present.
For a focus state on a frame, use a **2px INSIDE stroke** bound to `Components/<Comp>/Global/
colorPrimary` (`colorError` for danger), weight bound to a `lineWidthBold` alias — no geometry
jump. Screenshot it; don't trust bounds.

**An INNER_SHADOW on a transparent fill paints nothing.** Scroll shadows (antd ping-left/right) are
built as a bound linear gradient instead (`Table / Scroll Shadow`).

**Every effect style casts downward** — there is no upward shadow. A pinned bottom bar uses a top
divider, not a shadow.

**The canvas casts a parent's shadow from its descendants' geometry, transparent layers included.**
A square transparent child under a rounded card gives the shadow square corners. Plugin
`exportAsync` doesn't reproduce it — look at the canvas, or ask the user to.

## Tokens

**`Text Base/Strong` binds `Components/Alert/Global/fontSize`** instead of
`Typography/Font Size/fontSize` (2026-09-21). Visually identical (it aliases straight through), but
every component using the style shows up in `audit-reuse` as *"binds another component's tokens"*
— 16 sets on 6 pages. One-line fix; it's a shared asset, so it needs a proposal.

**Card's header and body padding are density-blind** (2026-09-22). `Components/Card/Component/
headerHeight` (56), `headerHeightSM` (38), `headerPadding` (24), `headerPaddingSM` (12) and
`bodyPadding` (24) are **raw numbers** in `4. Components`, not aliases, so they don't move at
Compact. `Size=Small`'s body tightens vertically (alias) but not horizontally (raw). Any wrapper over
`Card / Basic` inherits this — don't call a Cards page density-clean without saying so.

**`Components/<X>/*` is one mode.** Anything defined there as a raw value is theme-blind and will be
platform-blind once platform modes exist. Alias the global tiers.

**Avatar's `colorBorderBg` and `groupBorderColor` are white** (`colorBgContainer`) — antd's ring for
overlapping avatars. On a white surface they render nothing. Use `Components/Avatar/Global/
colorBorder` for an edge.

## Components

**Icons stranded on generic `colorIcon`** — a recurring class: an icon's vector stays on
`Colors/Neutral/Icon/colorIcon` while its label carries the real token. Fixed in Button, Tag, Alert,
Menu (2026-09). Still open as of 2026-09-08 (~145 variants): AutoComplete 62, Upload 33,
Ant Design X 24, Steps 9, Statistic 5 (trend arrows grey), Video Player 13, Dropdown menu item 3,
Breadcrumb 1, plus AudioPlayer / TabBar / BottomSheet. Affordance icons (chevrons, clear ✕, calendar,
password eye) are neutral **by design** — not defects.

**`Form / Form Item / Horizontal` hangs its label outside its own bounds** — ABSOLUTE at
**x = −120**. Any container needs ≥120px left padding or the label is clipped; put the gutter on the
field list, not the card. `Vertical` and `Inline` have no gutter. Inherited minimum widths (measured
in a kit): Radio Group 500, Radio Buttons 440, Checkbox Group 440, Date/TimePicker 300, Rate 280.

**`Table / Table cell`** (2026-09-20):
- cannot truncate — its TEXT nodes HUG inside a FILL wrapper, so a narrow cell overflows silently.
  Override `textAutoResize = 'HEIGHT'` + `layoutSizingHorizontal = 'FILL'` per cell;
- cells hug their own height, so row borders come out ragged — set the row's cells to FILL vertically;
- the image slot is a circle (`Avatar` at radius 999); there is no square-image `Type`. Bind the
  avatar's radius per instance.

**`Table`** squeezes its columns instead of overflowing when narrowed (text overlaps at ~700px), and
the scroll shadow also covers the footer row.

**`Typography / Text` has no `Link` type** (Default · Secondary · Success · Warning · Danger · Mark ·
Disabled). For link-coloured text, use the `Link` component, or clone the `Action` text out of
`Table / Table cell` `Type=Action`, which binds `Components/Button/Global/colorPrimary`.

**A flush text link is `Link`, never `Button` Type=Link with padding zeroed.** Button Type=Link keeps
antd's 16px padding; a padding override forces developers to repeat it on every screen.

**Orphaned main components.** Figma keeps a main alive while an instance references it, even after
removal from the tree: `parent === null`, on no page. It renders identically and every audit misses
it. Found on `❖ Chart` (2026-09-22). Detect by climbing each instance's main to a PAGE.

## Behaviour changes consumers should know

UpBase changes that move existing instances when a kit accepts the publish. Check the UpBase
`_Changelog` page for anything newer — entries marked **⚠ Breaking** need action.

| Date | Change | What a consumer sees |
|---|---|---|
| 2026-09-17 | `Table / Table cell` `Text 2` binds `colorTextSecondary`; `Type=Text` gained `Inline Tag` and `Trailing Icon` (+ swaps); all 18 Text variants carry both lines | A cell used directly with `Text 2` left at default shows a second, grey line |
| 2026-09-20 | `Avatar` gained a `Border` boolean (default off) + `Components/Avatar/Global/colorBorder` | Nothing until turned on; INSIDE stroke, so no size change |
| 2026-09-24 | `Button / Basic` Type=Default is **neutral filled, borderless** (was white with border); Danger is a red tint; `Dashed`, `Ghost`, `Danger` and the optional Button sets moved to their own tokens | Every Default button changes look |
| 2026-10-01 | `Menu` level-2 items indent via `paddingXL` (32); `itemSelectedBg` → `colorFillSecondary` (was brand orange) | Selected menu items go neutral; leaves sit 8px deeper |
| 2026-10-08 | Token `Size/Layout/contentMaxWidth` = 1440 | New token, nothing moves |
| 2026-10-11 | `Table / Scroll Shadow` + `Scroll shadow start/end` booleans on `Table` | Nothing until turned on |
| 2026-10-13 | `Card / Basic` head top and Content bottom radii bound to `borderRadiusLG` | Fixes square shadow corners |
| 2026-10-14 | `Button` Default disabled gets a `colorBorder` outline (Danger disabled stays borderless) | Disabled Default buttons gain a 1px border |

## Resolved

| Date | Issue | Fix |
|---|---|---|
| 2026-09-05 | `Chart / Plot` axis labels unstyled | All 165 carry `Text SM/Normal` |
