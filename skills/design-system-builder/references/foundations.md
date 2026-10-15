# UpBase Design System foundations

> **Scope: design-system-builder** (`BoGaG48v9BfY7LkMtFs4zh`). This is the inventory of the source library and
> every lookup below is **local**. A kit reads it for *what exists*, but must import by key rather
> than look up by name — see `_shared/references/upbase-library.md`.

**One file holds everything**: `BoGaG48v9BfY7LkMtFs4zh` — variables, styles, icons, and the
components for every platform. There are no kit files; the two earlier ones
(`C4pJEoUAImDj5fAnTqrhYq`, `cwinjcxF5Sxfz1vWVqXOfv`) are retired, and any reference to them is stale.

Because it is one file, everything below resolves **locally**: `getLocalVariableCollectionsAsync()`,
`getLocalTextStylesAsync()`, and style lookup by name all work. **Re-run `scripts/audit-system.js`
anyway** — this is a map, not the territory, and the file changes.

Platform differences are handled inside this file — by variable and mode where the difference is
only measurement, by a `Platform` variant axis where the anatomy genuinely differs, and by a
separately named component where the concept exists on one platform only. See *The one file* in
`SKILL.md`.

## Contents

- [Variable collections and modes](#variable-collections-and-modes)
- [The architectural rule that follows from the modes](#the-architectural-rule-that-follows-from-the-modes)
- [Tokens live in `_shared/references/tokens.md`](#tokens-live-in-referencestokensmd)
- [Text styles](#text-styles)
- [Effect styles](#effect-styles)
- [Grid styles](#grid-styles)
- [Component inventory](#component-inventory)
- [Components worth reusing](#components-worth-reusing)
- [Known gaps in the library](#known-gaps-in-the-library)

## Variable collections and modes

| Collection | Vars | Modes |
|---|---|---|
| `1. Colors` | 233 | Light / Dark — **Dark is not in use** |
| `2. Dimensions` | 65 | **Default / Compact** |
| `3. Typography` | 22 | **Default / Compact** |
| `4. Components` | 1958 | Value (single mode) |

**Dark is dormant, not deleted.** The product has no dark-theme requirement, so nothing renders,
documents or verifies against it: pages carry no Dark column, and the Phase 5 sweep is density only.
The mode stays in the collection because the values are already correct and removing it would throw
them away. Treat Light as the only mode there is until that changes.

**Modes are a flat list per collection, not multiple axes.** A collection cannot carry
`Default/Compact` *and* `Web/Mobile` as independent dimensions — any second dimension has to be
spelled out combinatorially in the same list. That is why platform is never a mode here: it is a
variant axis, or a separate component. (Platform has exactly two values: **iOS and Android are one
target, `Mobile`** — see *Two targets* in `SKILL.md`.)

`4. Components` is named `Components/{Component}/{Global|Component}/{token}`, covering 61 components.
`Global/*` entries are aliases pointing up to the global tiers; `Component/*` entries are
component-specific and about 9% hold raw values.

## The architectural rule that follows from the modes

`4. Components` has **one mode**, so a component-tier token can only inherit mode variation through
its aliases. Binding straight to `Colors/*`, `Space/*`, `Size/*`, `Border Radius/*` and
`Typography/*` gives a component native Default/Compact response with no extra indirection.

**Create a `Components/<YourComponent>/*` group for every new component.** This reverses an earlier
rule in this file that said not to — see *How the component-tier decision actually went* below. The
group is the component's dependency record and the one place its surface can be retuned.

### What the collection actually contains — audited 2026-08-26

| | Count | |
|---|---|---|
| Aliases pointing up to the global tiers | **1773** | 90.5% — these inherit Default/Compact correctly |
| Raw numbers | 162 | Density-irrelevant; see the platform note below |
| Raw colours | **23** | 13 deliberate, **10 defects** — see [Known gaps](#known-gaps-in-the-library) |

So the collection is in **good shape**, and existing components reach the right global token through
one alias hop rather than by binding it directly. `Components/Modal/Component/contentBg` →
`colorBgElevated`; every `Components/*/Global/colorBgElevated` → `colorBgElevated`. Do not read a
component binding `contentBg` or `itemBg` as a mistake — resolve the alias before judging.

### How the component-tier decision actually went

This file used to argue the opposite — that a component antd has no spec for has nothing to
transcribe, so it should bind the global tiers directly. **That was overruled, and the work is
already done.** The user's standing decision is component-level tokens throughout, so a component's
surface is readable and retunable in one place instead of scattered across global bindings.

- **2026-09-05** — the 9 components under `🟢 Updated Components` were migrated off global-tier
  bindings: Chat (45 tokens), then Chart, VideoPlayer, MediaScrubber, IllustratedMessage,
  AnnouncementBanner, BottomSheet, AudioPlayer, TabBar — ~1,250 rebinds.
- **`Timestamp` (2026-09-05)**, **`Label` (2026-09-10)** and **`ScrollBar` (2026-09-21)** were each
  built with their own group from the start.

So the pattern for a new component is the Chat precedent: `Global/<leaf>` 1:1 aliases for every
global token it consumes, plus `Component/<semanticName>` for its own roles and for raw values with
no token. Keep the `Global/` entry even when a `Component/` one supersedes it.

**Propose the token table and wait for approval before creating any variable** — the group is a
permanent surface, and eight of them is a decision, not a detail.

Two things that stay out of the group: **typography** (text styles own `fontSize`/`lineHeight`/
`fontWeight` — apply the style, never rebind the field) and **nested instances** (a `Button` inside
your component keeps `Components/Button/*`).

### Density modes: two, and no plans for a third

`2. Dimensions` and `3. Typography` carry **`Default / Compact` only**. Density does not vary by
platform, and there is **no touch-density mode**, nor a plan for one.

Consequences worth knowing before you design around them:

- A native control needing a ~44pt touch target **carries that number raw**, with a reason in the
  component's `Raw values` block. No token expresses it and none is coming.
- Compact is a **pointer-device** density. At Compact, `controlInteractiveSize` is 14 — under WCAG
  2.2 §2.5.8's 24px floor — so a component that only ships to mobile has no reason to render a
  Compact version at all.
- Do not propose moving `controlHeight` into a separate `5. Platform` collection. **1804 aliases**
  point at it where it is, and modes are a flat list per collection, so a platform × density grid
  would have to be spelled out combinatorially.

**What follows the modes and what doesn't.** The **1804 aliases** in `4. Components` inherit
Default/Compact with no component edit — that is the whole return on binding to the global tiers.
The **131 remaining raw numbers** do not; they are layout widths and values with no global
equivalent, listed as legitimate in the audit.

## Tokens live in `_shared/references/tokens.md`

Colour, radius, spacing, heights, line widths, typography and breakpoint **tokens** — what each one
means, what value it actually holds here, and where UpBase departs from antd — are in
`_shared/references/tokens.md`, which every skill shares.

They were in this file until 2026-09-14, duplicated against the token reference, and the two copies
drifted: `controlHeightLG` was documented as antd's 40 in one and this file's actual 44 in the
other. A token's meaning and its value are one fact and now have one owner.

**What stays here** is everything that is not a token: the collections and their modes, the styles,
the component inventory, and where this library is known to be wrong.


## Text styles

20 styles, all variable-bound (they carry `fontSize` + `fontFamily` + `lineHeight` + `fontWeight`), so
applying a style gives Compact response for free. Prefer them over binding `fontSize` per node.

```
Text Base/Normal   Text Base/Strong   Text Base/Underline  Text Base/Delete  Text Base/Italic
Text SM/Normal     Text SM/Strong     Text SM/Underline    Text SM/Delete    Text SM/Italic
Text LG/Normal     Text LG/Strong     Text LG/Underline    Text LG/Delete    Text LG/Italic
Heading/1  Heading/2  Heading/3  Heading/4  Heading/5
```

Note the slash: **`Heading/4`**, not "Heading 4". A pattern match on the latter silently misses all five.

Typical mapping: body → `Text Base/Normal`; names and emphasis → `Text Base/Strong`; metadata,
timestamps, captions → `Text SM/Normal`; counts and badges → `Text SM/Strong`; section titles →
`Heading/4`.

## Effect styles

10 styles. There are **no paint styles** — colour is variables-only.

| Style | Use |
|---|---|
| `boxShadow` | Modal-level elevation |
| **`boxShadowSecondary`** | **Floating surfaces — Dropdown, Popover, FloatButton all use this** |
| `boxShadowTertiary` | Subtle lift |
| `Component/Button/{default,primary,danger}Shadow` | Button-specific |
| `Component/Input/{active,errorActive,warningActive}Shadow` | **Input focus ring — use this, not a thick stroke** |
| `Component/Switch/handleShadow` | Switch handle |

## Grid styles

`1440px - 12 col`, `1440px - 24 col`. Apply to 1440-wide example frames.

## Component inventory

91 pages, 68 of them holding components, grouped by Ant category. Check any proposed component
against this list **first** — if the name appears here, it exists, and Phase 0a says extend it
rather than add a second one.

This inventory is **Ant Design web's vocabulary**, because that is what the file was seeded from. A
native-only component you can't find here — `Tab Bar`, `Action Sheet`, `Swipe Action`, `Search Bar`,
`Picker View`, `Notice Bar`, `Stepper` — is a real gap rather than a naming mismatch. Translate the
name first (Phase 0b) before concluding that.

| Category | Component pages |
|---|---|
| General | Button, FloatButton, Icon, Typography |
| Layout | Divider, Flex, Grid, Layout, Masonry, Space, Splitter |
| Navigation | Anchor, Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs |
| Data Entry | AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mentions, Radio, Rate, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload |
| Data Display | Avatar, Badge, Calendar, Card, Carousel, Collapse, Descriptions, Empty, Image, Popover, QRCode, Segmented, Statistic, Table, Tag, Timeline, Tooltip, Tour, Tree |
| Feedback | Alert, Drawer, Message, Modal, Notification, Popconfirm, Progress, Result, Skeleton, Spin, Watermark |
| Other | Affix, ConfigProvider, Assets |
| Ant Design X | 36 sets — Bubble, Conversations, Welcome, Prompt, Attachment, Sender, ThoughtChain, Think, Sources, File Card, CodeHighlighter |
| Deprecated | `List / *` — still present, marked deprecated; confirm intent before instancing or rebuilding |
| 🟢 Updated Components | Non-antd additions, each with its own token group: Chat, Chart, VideoEmbed, IllustratedMessage, BottomSheet, AudioPlayer, Timestamp (Data Display) · **ScrollBar** (Layout) · TabBar (Navigation) |

**`ScrollBar` is not an antd component** — antd ships scrollbar *tokens*
(`Components/Table/Component/stickyScrollBarBg` and `…BorderRadius`) but no component. It was added
2026-09-21 under a new `Layout - - - - - - - -` divider inside `🟢 Updated Components`, and binds
the same #000 25% those tokens already resolve to.

Sub-parts follow `Component / Part` naming, so a page typically holds one root set plus its parts —
`Table` has 10 sets, `ColorPicker` 14, `Progress` 11, `Input` 12. Internal helpers live on the
`Helpers` page prefixed `_`.

**353 sets, ~68 roots.** That gap matters whenever you are counting work: the unit of documentation —
description, page, platform reach, responsive declaration — is the **root component**, and
sub-parts inherit it. `Slider / Slider Handle` has no platform reach of its own. Anything scoped
"per component" means per root, so estimate against 68, not 353.

## Components worth reusing

| Need | Component | Notes |
|---|---|---|
| Avatar | `Avatar` | `Type=Icon\|Image\|Text`, `Size`, `Shape`, plus a `Badge` boolean. Internal 7px icon inset is its own. |
| Presence dot | `Badge / Status` | `Default\|Error\|Processing\|Success\|Warning` + `Label` boolean — **turn Label off for a bare dot** |
| Count badge | `Badge / Basic` | `Default\|Small\|Dot` |
| Status chip | `Tag / Status` | |
| Floating action | `FloatButton` | 24 variants: Type, State, Shape, Badge, plus `Icon Name` swap. **A chat launcher is this, not a new component.** |
| System banner | `Alert` | |
| Progress, loading | `Progress`, `Spin` | |
| Icons | 829 on the Icon page | `Icon / <Name>Outlined`; already carry keyword descriptions |
| AI/chat surfaces | Ant Design X (36 components) | Bubble, Sender, Conversations, ThoughtChain, Think, Sources, CodeHighlighter |

## Known gaps in the library

Worth knowing so you don't design around them silently, and don't duplicate a component to work
around one:

- **No Loading state on any Button set**, though Ant documents `loading` as standard.
- **`Button / Variant (optional)` ships `State = Default` only** — no Hover, Focused, Pressed or
  Disabled, so the newer Variant/Color API loses every interaction state.
- **`Switch` has no Hover or Focused.** **`FloatButton` has no Pressed.**
- **10 raw colours in `4. Components` are defects** (audited 2026-08-26). Six still carry **Ant blue
  in an orange-brand system** — the library rebranded and these were missed:

  | Variable | Value | Should be |
  |---|---|---|
  | `Steps/Global/finishIconBorderColor` | `#1677ff` | `colorPrimary` — this is Ant blue-6 exactly |
  | `Slider/Component/handleActiveOutlineColor` | `#1677ff @20%` | a primary-derived outline |
  | `DatePicker/Component/cellHoverWithRangeBg` | `#cbe0fd` | `colorPrimaryBg` |
  | `DatePicker/Component/cellRangeBorderColor` | `#82b4f9` | `colorPrimaryBorder` |
  | `TimePicker/Component/cellHoverWithRangeBg` | `#c8dfff` | `colorPrimaryBg` |
  | `TimePicker/Component/cellRangeBorderColor` | `#7cb3ff` | `colorPrimaryBorder` |

  Two more have an exact token equivalent already present:
  `AutoComplete/Component/optionActiveBg` and `Button/Component/dashedBgDisabled` are both
  `#000 @4%`, which **is** `colorFillTertiary`. Two are likely:
  `Slider/Component/handleColorDisabled` `#bfbfbf` and `Tour/Component/primaryNextBtnHoverBg`
  `#f0f0f0`.

- The other **13 raw colours are deliberate** — don't "fix" them: `Layout/{header,sider,trigger}Bg`
  and the six `Menu/dark*` tokens are antd's literal dark-chrome values (Menu dark is a *variant*,
  not a mode), and `Image/previewOperation*` plus `Tour/primaryPrevBtnBg` are white-on-overlay
  values that must not follow the theme.

The State-axis inconsistency spans at least three components and reads as one library-wide audit
rather than three tickets.
