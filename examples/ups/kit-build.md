# Kit build notes: UpS UI Kit

> **Example: UpS's own data, in the v0.4 layout.** In a team's repo this file lives at
> `upbase/ups/kit-build.md`. To use it for UpS, copy the whole `examples/ups/` folder to `upbase/ups/` in
> the repo where you run Claude (the UpBase Design System repo), and move the gap log there as
> `gap-log.md`. Another team never copies these values; they start from
> `skills/_shared/product-template/`.

| | |
|---|---|
| **File key** | `9c052aEvpV7gYLhwdatf6g` |
| **File name** | UpS UI Kit |
| **Consumes** | UpBase Design System, `BoGaG48v9BfY7LkMtFs4zh` |
| **Published as a library** | Yes — UpS product design files subscribe to it |
| **Product files subscribe to** | **UpS UI Kit only** (governance decision, 2026-09-09) |
| **Platform reach** | Web **and** mobile — both `Web:` and `Native:` lines are in scope |
| **Naming** | Product context decides. A UpS name **may** match a UpBase name; that is not duplication |

## Page list

Not copied here: the skill re-reads it from the file (`figma.root.children.map(p => p.name)`),
because a copy goes stale. On 2026-10-14 the kit had 73 pages, and most of them now carry UpBase's
own names (`❖ Segmented`, `❖ Radio`, `❖ Spin`…). Older notes below still use earlier product names
(`SegmentedButton`, `RadioButton`, `Loading`…) for the same pages.

## Gaps found by product screens

Product screens are built by the `product-screen-builder` skill, which logs every place this kit
can't do what a screen needs in **`gap-log.md`** in this folder (today still `docs/kit-gaps/ups.md` in the UpBase Design System repo). Read it before proposing a
kit change — the gap, the screen that hit it, the workaround in use and a proposed fix are there —
and update an entry's status when a change lands (`in kit` → `published`).

## Page triage

> Written 2026-09 with the earlier page names; see *Page list*. The wrap / compose split still
> holds, but re-run the Step 2 search before trusting a row.

Which pages wrap an existing UpBase atom and which are genuinely product-specific. Wrapping is the
default; only the third group is built from parts.

**Wraps a UpBase component of the same name** (14) — the source exists, use it:

`Table` · `Breadcrumb` · `Button` · `Calendar` · `Avatar` · `Checkbox` · `Form` ·
`IllustratedMessage` · `Input` · `Tag` · `Drawer` · `Switch` · `ScrollBar` ·
`Link` (on UpBase's `❖ Typography`)

**Wraps a UpBase component under a different name** (12) — translate before concluding it's missing:

| UpS page | UpBase source |
|---|---|
| `TabGroup` | `Tabs` |
| `Loading` | `Spin` |
| `Combobox` | `Select` |
| `SegmentedButton` | `Segmented` |
| `ProgressIndicator` | `Progress` |
| `RatingIndicator` | `Rate` |
| `FileUploader` | `Upload` |
| `Cards` | `Card` |
| `NavigationMenu` | `Menu` |
| `SubMenuDropdown` | `Dropdown` |
| `Dialogs/Popups` | `Modal` / `Popover` |
| `RadioButton` | `Radio` |

**Product-specific — compose from ≥2 UpBase components** (12):

`TableToolbar` · `FilterBar` · `PageHeader` · `GridTable` · `CardTable` · `ExpandableText` ·
`CalendarDateInterval` · `ListItem` · `UserMenu` · `Charts` · `PDF Viewer` · `RichTextEditor`

**This triage goes stale as UpBase grows.** `ScrollBar` sat in the product-specific group until
UpBase shipped one on 2026-09-21, at which point the correct move inverted from *compose* to *wrap*.
Re-run the Step 2 plugin search before trusting a row here.

Before adding a page outside these three groups, apply the Step 3 gate in `SKILL.md`: a generic
control invented in a kit is invisible to every other product and gets rebuilt elsewhere.

## Local scaffolding

- **`_Docs / Page Header`** — page `_Docs`, id `31:48804`, 1440×318. No component properties; fields
  are nested text overrides, and the breadcrumb is **two** segments (`Component / Component name`),
  not UpBase's three.
  **Instance it by node id** — `getNodeByIdAsync('31:48804').createInstance()`. It is a *local,
  unpublished* component, so `importComponentByKeyAsync` throws
  *"Cannot import component with key … since it is unpublished"*. The key
  `6a5d39f53ddeeb00d95534ca62b64dd1c8218f53` identifies it but cannot be imported.
- **There is no `_Docs / Page Footer`,** and a kit page does not use one.

UpBase's own `_Docs / *` components are unpublished by design and cannot be imported — confirmed
against a working REST token. That is why the kit has its own.

## Page layout

Follow **`references/page-template.md`**, not `design-system-builder/references/page-template.md`. The reference implementation is
`❖ Form` (page `5:20`), approved as the kit template on 2026-09-11: a `_Docs / Page Header`
instance as a direct page child, then `Components` · `Density scale` · `Example Screens` sections
at 300px gaps. No doc frame, no Playground, no Light/Dark pair.

Also on `Playground`: the section **"Inspiration"** (`31:65136`) — the SAP Fiori Form page the
user chose as the model for kit pages. Read it when a layout question isn't settled by the
template.

## Status

As of 2026-09-21, ten pages are built:

| Page | Holds | Kind |
|---|---|---|
| `❖ Form` | `Form / Vertical` · `Form / Horizontal` · `Form / Inline` · `Form Actions` (`481:43096`, added 2026-10-12) | wrappers over UpBase's three `Form / Form Item / *` sets — **and the template page**. `Form Actions` is a composition: 1 node, `Actions` SLOT of kit `Button / Basic` + `Pinned` BOOLEAN (top divider), Web only; sticky behaviour is specified in UpS Product 2026 › Global rules › `Layout / Form Actions` |
| `❖ FilterBar` | `FilterBar` · `FilterBar / Filter Field` · `FilterDialog` | compositions |
| `❖ TableToolbar` | `TableToolbar` (4 variants: Layout × Container) · `TableToolbar / Sort Control` · `TableToolbar / Status Line` | compositions |
| `❖ Charts` | `Chart` (`199:40245`, wrapper over UpBase `Chart`) · `Charts / Metric Tile` (Series 1–8 × Selected) · `Charts / Metric Selector` | 1 wrapper + 2 compositions — see *Chart wrapper* below |
| `❖ Cards` | `Card / Basic` (wrapper over UpBase `Card / Basic`) · `Card / KPI` (Status × 3) | `Card / KPI` moved here from `❖ Charts` 2026-09-22 — see *Cards vs Charts* below |
| `❖ Typography` | `Text` — wrapper over UpBase `Text` | wrapper — 1 component, 2 page nodes |
| `❖ GridTable` | `GridTable` (Platform × **Mode** × Size, 12) · `GridTable / Row` (Platform × Size × Surface, 12) · `GridTable / Stacked Cell` (3) · `GridTable / Report Row` (Level × Emphasis, 9) · `GridTable / Column Group Header` (3) | compositions — 39 variants. Example Screens carries **four** frames: the two originals, the stacked-cell desktop (`161:33606`) and the Report desktop (`120:54539`) |
| `❖ CardTable` | `CardTable` (Platform × Size, 6) · `CardTable / Group` (6) · `CardTable / Group Band` (6) · `CardTable / Line Item` (3) | compositions — 21 variants |
| `❖ ExpandableText` | `ExpandableText` (State = Minimized · Expanded, 2) | composition — nests UpBase `Link`, exposed |
| `❖ PageHeader` | `PageHeader` (`166:40833`) — no variants, 8 booleans | composition — the global app bar |
| `❖ RichTextEditor` | `RichTextEditor` (Platform × 2, `179:46504`) · `RichTextEditor / Toolbar` (1 component, 9 booleans, `179:45421`) | compositions — 26 kit instances, 2 UpBase-direct |
| `❖ ScrollBar` | `ScrollBar` (`239:36425`) — wrapper over UpBase `ScrollBar` | wrapper — see *ScrollBar* below |
| `❖ IllustratedMessage` | `IllustratedMessage` (`338:39479`, Size XS · S · M · L) · `IllustratedMessage / Illustration` (`344:46013`, Type 8 × Size 4 = 32) | composition — replaces the old `Result` wrapper; see *IllustratedMessage* below |
| `❖ FloatButton` | `FloatButton Dock` (`485:43269`, State = Default · Hover · Collapsed, added 2026-10-12) | composition — `Buttons` SLOT (Zalo + Mascot placeholder frames, kit `FloatButton` Chat) + kit `FloatButton` Toggle (Hover only) + hand-drawn `Expand Tab` (Collapsed, flush right). Prototype-wired. Web only. Page built to the full template 2026-10-13 (block pitch 400, Density Default/Compact, two 1440 screens over a `GridTable`). Chat still carries `file-text`: `message-circle-more` (`34188ead…`) import hung 3× — swap it in the UI |
| `❖ Cards` | `Product Card` (`417:42996`, key `544a9100…`, Selected × 2) — added 2026-10-07 as `Card / Product`, renamed by the user before publishing; in use in UpS Product 2026's quick-add stock modal (`63:35778`) | composition of kit `Checkbox` + `Image`; plain text nodes with TEXT props (Name · SKU · Variant) + 3 booleans. Extracted from the hand-built tiles in the quick-add stock modal (UpS Product 2026 `63:35778`). `Card / KPI` is no longer in the kit |

> ### The Status table is not the kit's inventory
>
> It lists what **this skill** built. The kit actually holds **~72 published components** — `Logo`,
> `Avatar`, `Breadcrumb`, `Button / Basic`, `Badge / Basic`, `Tag / Basic`, `Select`, `Modal`,
> `Menu / Sidebar`, `Image`, `Divider Horizontal` and many more, most of them predating this skill
> and absent from the table above and from the *Page triage* lists.
>
> **So before composing anything, enumerate the kit's own components first** — a composition must
> nest the kit's wrapper, not the UpBase original it wraps:
>
> ```js
> for (const p of figma.root.children) {
>   if (p.name.startsWith('_')) continue;
>   for (const n of p.findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })) {
>     if (n.type === 'COMPONENT' && n.parent.type === 'COMPONENT_SET') continue;
>     console.log(p.name, n.name, n.id);
>   }
> }
> ```
>
> `PageHeader` was first built nesting UpBase `Breadcrumb`, `Button / Basic`, `Badge / Basic` and
> `Avatar` directly, plus two hand-cropped logo images — every one of which the kit already
> published. Searching UpBase (Step 2) is for finding a *source to wrap*; it is the wrong first
> move when composing. Check provenance with `await n.getMainComponentAsync()` and read `.remote`:
> **`false` means a kit component, `true` means you reached past the kit into UpBase.**

### Chart wrapper, 2026-09-22 — and a version lag worth knowing

`Chart` (`199:40245`, key `34a16b36a92f1b581da91a34085e540e7e2735c8`) wraps UpBase `Chart`
(`a48d7707fef9384c6ca3837c5a6b298c5e30b91c`), exposed, 1 axis (State) · 5 instance properties.

**Import the VARIANT key, not the set key.** `importComponentSetByKeyAsync('a48d7707…')` hung past the
30s budget; `importComponentByKeyAsync('5729f71b…')` on the `State=Default` variant returned in
**147ms**. Chart's set is only 4 variants but each carries ~40 plot vectors, so "large" here means
heavy content, not variant count. The family is also already **resident**, and both routes resolve to
the same node:

| Resident in UpS | node id |
|---|---|
| `Chart` | `197:1769` |
| `Chart / Plot` | `32:67250` |
| `Chart / Legend` | `32:67786` |
| `Chart / Legend Item` | `32:67761` |

Find them with `getMainComponentAsync().parent` off any existing instance — never by import.

**UpS's accepted copy is an older version of UpBase `Chart`, and the gap is large:**

| | UpS holds | UpBase has now |
|---|---|---|
| Width | 648 | 600 |
| Surface | its **own card** — `colorBgContainer`, `colorBorderSecondary` hairline, radius 8, 24px padding | **none** — transparent, built for `Card / Basic`'s `Content` slot |
| `State` | Default · Loading · Empty · **Error** | Default · Loading · Empty |
| `Show Header` | absent | present, default false |

Accepting that update is a **visible breaking change**: every instance loses its surface and must be
moved into a Card, and any instance on `State=Error` has nowhere to land. It is also the point of the
Cards/Charts split below — UpBase deliberately stripped Chart's surface so the Card could own it.
Do it as a decision, not a routine update.

`audit-wrappers` flags the nested layer as *"still named Chart — shows UpBase vocabulary"*. That is
the accepted convention here (wrappers keep UpBase's exact name), not a defect.

**Sizing: FIXED wrapper + FILL child.** `make-wrapper` mirrors the source exactly, which gave
FIXED/FIXED and a wrapper that could not stretch past its natural 648 — the example screens use it
at 1392. Setting the *nested* instance to `FILL` horizontally fixes it, and is the pairing
`audit-wrappers` explicitly permits ("FIXED + FILL is fine"). Verified: resize to 1392 → nested
follows, 0 overflow. **Mirror-the-source is the wrong default for anything meant to stretch.**

**Example Screens updated 2026-09-22.** The two charts on `Desktop 1440` nested UpBase `Chart`
directly; both now nest the kit wrapper (`remote: false`), with Title, Subtitle, Plot `Type` and the
3-series legend carried across. A **`Mobile 390`** canvas was added beside it — it exists to prove the
`<768 swap → Chart / Plot Width=Narrow` line in the description, which nothing previously
demonstrated. Both canvases: radius 36, 0 overflow, captioned.

Still missing on this page: `Chart` has no `Density scale` entry.

### IllustratedMessage, 2026-10-01

One component for empty states **and** operation results: Illustration → Text (Title · Message) →
Actions. `Size` = **XS · S · M · L** (inline · card/table/panel · dialog/modal · screen) is the only
variant axis on the component. **The illustration decides the status** — but through an
**exposed nested set**, not a swap: `IllustratedMessage / Illustration` (Type 8 × Size 4 = 32),
whose `Type` dropdown surfaces in the component's panel. Booleans `Show Title` · `Show Actions`,
plus an `Actions` SLOT (default one kit `Button / Basic`, Small at XS).

| | XS | S | M | L |
|---|---|---|---|---|
| Width | 240 | 360 | 480 | 720 |
| Empty art | 64×41 | 128×81 | 184×117 | 280×178 |
| Icon | 32 `sizeXL` | 48 `sizeXXL` | 64 raw | 72 `Result iconFontSize` |
| 403·404·500 | ×0.2 | ×0.4 | ×0.6 | ×1 |
| Title | Text Base/Strong | Heading/5 | Heading/4 | Result heading3 vars |
| Gap | marginXS | marginSM | margin | Result paddingLG |

**Built in place of `Result`.** The old wrapper node (`106:29956`) is now `Size=L`, so its key
`89eb4d05…` survived and the one product instance (Kho hàng, which faked an empty state with
`Custom icon`) keeps resolving; on accept it shows `Type=Empty`.

**Why an exposed set and not an INSTANCE_SWAP** — the first build (2 sizes) used a swap with nine
standalone parts. Going to four sizes broke it, and the reasons are the reusable part:

- **An INSTANCE_SWAP default is set-wide.** `swapComponent()` on one variant's bound instance
  rewrote `defaultValue` and every variant followed — no per-size default illustration.
- **A swapped-in instance takes its main's natural size**, so per-size art needs per-size parts
  (9 × 4 = 36) that designers must size-match by hand.
- **Aspect-lock does not survive a swap** — `targetAspectRatio` reads `null` on the swapped-in
  instance, and the lock did not even derive width on an instance in the main (251×48).
- **An exposed nested variant switch DOES resize** when the nested component is an **auto-layout
  HUG** frame: 72×72 → 125×147 → 184×117. (`Empty / Image` itself is not auto-layout, which is
  why its Image=2 squashed inside a component and is not offered.) And switching the parent's Size
  **keeps the nested Type override** — verified XS·403 → L·403.
- **`rescale()` works on a nested UpBase instance** — that is how 403/404/500 get their four sizes.

Cost of exposure: the illustration's own `Size` shows in the panel too (exposure is wholesale); the
description says to leave it alone.

Each illustration variant wraps its art in an auto-layout HUG frame: Empty = UpBase `Empty / Image`
Image=1 resized (its vectors carry SCALE constraints); icons recoloured Green/7 · Result colorInfo ·
Gold/8 · Result colorError (an icon's colour is an instance override, so it is baked per variant);
403/404/500 = UpBase `Result` Status=N with text + buttons hidden, padding 0, rescaled.

Tokens are UpBase `Result`'s own (`Components/Result/Global/*`). The L title binds
`fontSizeHeading3` · `lineHeightHeading3` · `fontWeightStrong` instead of `Heading/3` — that style is
used nowhere in the kit and its import hung, so it could not be harvested. Message is
`colorTextSecondary`, not Result's `colorTextDescription` (3.35:1).

Example Screens: empty `GridTable` with S in its `Rows` slot (1440 and 390), and M inside the kit
`Modal / Basic` — **set the modal's inner `Type=Slot` first**; at `Type=Text` the `Content Wrapper`
is a plain FRAME whose children cannot be removed. The modal body is 472, so M (480) is set to FILL.

Verified: 40 reflow probes (4 sizes × 3 widths × Empty/icon/403, plus long text) — 0px overflow.
Coverage 100% on fills, text, padding, gaps. Compact: XS 127 → 112, S 187 → 171, M 239 → 209,
L 320 → 290.

**Import flakiness hit hard here.** `Empty / Image` (published, `CURRENT`) hung on every key for
~20 minutes — both variants, the set and `Empty / Menu` — then landed on a later retry. Variable
and text-style import hung throughout; everything was harvested off resident nodes instead.

### Menu / Sidebar width, 2026-10-01

Both modes are now **240** total: Rail + Panel = 56 + 184 (was 80 + 264 = 344), Expanded = 240
(was 264). The content column gets 104px back. Widths are fixed, not FILL-with-a-cap — the menu
never grows, and `maxWidth` can't be set inside an instance anyway. Variants unchanged (2 · 2 · 2).

- **Truncation was already wired.** UpBase's item labels are `TRUNCATE` + `ENDING` + FILL; they
  only never truncated because the columns were wide. Nothing was added to make them ellipsise.
- **The level-2 indent is fixed in UpBase, not the kit** (2026-10-01). UpBase's 18 `Level=2`
  `Navigation Item` variants carried a raw 48. They now bind `paddingLeft` →
  `Components/Menu/Global/paddingXL` (32), and 366 UpBase instances moved with them. The
  `Submenu Title` keeps `paddingLG` (24), so a leaf sits **8px deeper** and the level reads by
  alignment. (Binding `paddingLG` to both was tried first; titles and leaves lined up exactly.)
- **Why not in the kit:** the kit first bound `paddingXL` as an override on 132 nested UpBase
  items. An override on a remote instance doesn't survive a swap, a re-add or a reset in a product
  file, because the item's default still came from UpBase. Those overrides were removed with
  `resetOverrides()` + re-applying `State`, `Text` and `visible` (fingerprints identical before and
  after). The kit reads **48 until it accepts the UpBase publish**. **Rule: an indent, padding or
  colour that belongs to a UpBase atom is fixed in UpBase, never overridden in the kit.**
- **Two costs of `paddingXL`, both measured:** it is **32 in Compact too**, so the step widens from
  8 to 16 at Compact while the title moves in. And the label box is **128px**, which cuts off the
  reference's own `Xử lý theo danh sách` (130px natural) by 2px. The alternative is title →
  `Space/Padding/padding` (16) with the leaf back on `paddingLG` (24): same 8px step, 136px of
  label, and both values follow density.
- Collapsed rail items have horizontal padding **0**; `CENTER` alignment does the centring.
- **The Panel master now carries the product's real navigation** (2026-10-01). It used to hold 5
  groups with placeholder labels, while all 12 product instances overrode it to 11 groups (Sản phẩm
  … Website), with Kho hàng expanded and its "Kho hàng" item selected. The master's `Items` slot now
  matches that.
- **The disconnect was the selected item's colour.** The kit faked a neutral selection with a fill
  override (`colorFillSecondary` + `borderRadius` 6) on a single item. A product file that switched a
  different item to `State=Active` got UpBase's orange `itemSelectedBg` back. Fixed upstream instead
  (UpBase source edit, 2026-10-01): **`Components/Menu/Component/itemSelectedBg` → `Colors/Neutral/
  Fill/colorFillSecondary`** (was `Colors/Brand/Control/controlItemBgActive`). The master now uses no
  fill override, so it shows orange **until UpS accepts that UpBase publish**. The radius is UpBase's
  `itemBorderRadius` (8). Two things are still open: selected now has the **same** background as
  hover (`colorBgTextHover`, 6% / 12%), so only the orange label sets it apart; and `itemActiveBg`
  (pressed) still aliases the brand `controlItemBgActive`.
- **Panel right border**: the Rail's paint, copied over (`Colors/Neutral/Border/colorSplit`,
  `INSIDE`, right weight bound to `Size/Line Width/lineWidth`), on both `Content` variants.
- **The tooltip is a usage rule, not a layer.** A component can't respond to hover, so the
  descriptions say: kit `Tooltip`, `Placement=Right`, on hover and focus, only on truncated labels.
  It's demonstrated in `Example Screens › Truncated label` (`352:41922`). The kit `Tooltip`'s nested
  instance is FIXED 250, so a short tooltip carries dead space on the right. That's a defect in `❖ Tooltip`.
- The page still has no `Density scale` section, and Example Screens has no 1440/390 canvases.

### ScrollBar, 2026-09-23

`ScrollBar` (`239:36425`, key `e7ac4b878124fe1e1e06aa31ca11b335aadd58dd`) wraps UpBase `ScrollBar`
(`1d631a664bdbfca860cb282a620954b777ddeefe`), exposed, 2 axes (Orientation · State) · 1 instance
property (`Track`, default false). Imported by the **variant** key (`3e1b77e4…`, 1.45s), not the set
key — the same rule the Chart wrapper established.

**An exposed Orientation axis forces FILL on *both* axes.** The source is FIXED + FIXED, so
`make-wrapper`'s mirror-the-source default would have produced a bar that cannot take the length of
what it is pinned to. FIXED wrapper + FILL child is the fix, but the usual one-axis version is not
enough here: the same component must stretch vertically at `Orientation=Vertical` and horizontally
at `Horizontal`, and a wrapper cannot vary its sizing per exposed variant. Generalises: **when an
axis of the nested component swaps its long axis, the nested instance FILLs both.**

Verified 60–1200px in both orientations, 13 cases, 0 overflow. The misconfiguration case — a thumb
longer than its track — is clipped by the nested instance rather than escaping, so it reads as
visibly wrong instead of silently overflowing.

**Density is a deliberate no-op.** Both of ScrollBar's dimensions (12px thickness, pill radius) are
raw values upstream, because a pointer drag target must not shrink with density. The `Density scale`
section carries two identical columns, both mode-pinned, to record that the mode was tested — a
missing column would read as untested. Measured: thumb 12 in both.

`audit-wrappers` flags the nested layer as *"still named ScrollBar"*. Accepted convention, as with
`Chart`.

**Page built to the full three-section template**, not to `❖ Button` (`50:6695`). `❖ Button` is a
thin page — a header and a single component, no labels, first block at `(177, 140)` — so it models
the page *shape* but not its content. Where the two disagree, `references/page-template.md`
wins.

One deviation from that template, deliberate: **column pitch 400, not 600.** The 600 constant is
derived for 360-wide variants; these are 12 and 240 wide, and 600 left a bar adrift in half a
screen of whitespace. The checklist's actual requirement — the pitch clears the widest label — is
met. Row pitch is the template's own rule (tallest instance + 120 = 360).

### Cards vs Charts — where a metric component belongs (2026-09-22)

Both pages hold things that look like "a card with a number in it", so the boundary is decided by
**what the component binds**, not by where it happens to be used:

| Binds | Is | Page |
|---|---|---|
| `borderRadiusLG` + `colorBgContainer` + a header | a **card surface** | `❖ Cards` |
| `borderRadius` (the control radius) + `Colors/Chart/Categorical/*` | a **chart control** | `❖ Charts` |

The behavioural form of the same test: **remove the plot and see what survives.** `Card / KPI` still
means something alone. `Charts / Metric Tile` does not — its colour *is* the series colour, so
without a chart beneath it the tint signifies nothing.

`Charts / KPI Card` was renamed **`Card / KPI`** and moved to `❖ Cards` on this rule. Its key is
unchanged (`766074e4a3fc29781b49f3a4c8f714b6bedbf24e`) — reparenting is the same node, so its 5
instances survived; they now sit cross-page on `❖ Charts` (2 in `Density scale › Grid`, 3 in the
`Desktop 1440` dashboard), which is deliberate: that screen demonstrates a *dashboard*, not this
component.

**`Analytical` is a page section, not a component name.** The reference frame called
`Analytical/Statistics card` covers six distinct patterns; naming one component after it would leave
the divided stat grid (`Vận hành` 4×2, `Số lượng lệch` 1×6) nowhere to go.

Still open on `Card / KPI`: it draws its **own** card surface rather than nesting the kit
`Card / Basic`, which duplicates a published surface. The fix is to move the readout into
`Card / Basic`'s `Content` slot and the info icon into `Actions` — blocked until UpS accepts the
slotted `Card / Basic` from UpBase.

### ❖ Cards page is not built yet

As of 2026-09-22 it carries **four** `_Docs / Page Header` instances ("Analytical Cards", "List
Card", "Table Card", "Timeline Card") where the template specifies one, a `Components` section whose
first block sits at `(177, 140)` rather than `(120, 120)`, and **no `Density scale` or
`Example Screens` sections at all**. Deliberately deferred so the page gets laid out once, after the
remaining Cards components exist, rather than twice.

### PageHeader, 2026-09-21

The app shell top bar, **not** a page-title header: product mark · route breadcrumb · right-hand
utilities (locale flag, announcements, help, store switcher, tenant avatar).

**Composed entirely from kit components** — `Logo` `Type=Logotype, Size=Default` (`139:28248`) ·
`Breadcrumb` (`106:27678`) · `Button / Basic` ×3 (`50:6733`) · `Badge / Basic` `Type=Dot`
(`98:17400`) · `Avatar` `Type=Image` (`106:29382`). The **only** node reaching UpBase directly is
`Flag` `Name=Vietnam` — the kit publishes no Flag wrapper.

**Web only, by decision** — a 390px bar cannot hold a breadcrumb plus five utilities, so no
`Platform` axis. Configuration is eight BOOLEANs (`Announce Badge` default false, the rest true),
which cost no variants — the same lesson as CardTable's `Thao tác` column.

Two things worth knowing:

- **UpBase's `Flag` assets are circular** and the reference chip is a rounded square. Clipping a
  circle to one leaves empty corners, so the wrapper takes a backplate painted with the flag's
  **own** red (`#D80027`, copied off its outer Vector). The component's one raw colour, deliberate
  — a national flag colour is not themeable.
- **The kit `Avatar` wrapper's `Size` axis is inert.** Wrapper root and nested instance are both
  `FIXED` 32×32, so the nested `Size=Small` still measures 32 and `Tenant` is the one part that
  does not shrink in Compact (everything else does: bar 57→49, buttons and `Logo` 32→28,
  breadcrumb 22→20). That is a wrapper-pattern defect in `❖ Avatar`, not in `PageHeader` — the
  nested instance wants `HUG`. Fixing it reaches every `Avatar` consumer, so it needs its own pass.

### RichTextEditor, 2026-09-21

Modelled on the SAP Fiori `Rich Text Editor` the user pasted at `179:43880` on `_Playground`. Two of
its axes do **not** survive translation, and saying why is most of the value here:

| Fiori | UpS | Why |
|---|---|---|
| `Form Factor` = Compact · Cozy | the **density mode** | Density is a mode, never a variant axis |
| `Resolution` = 1440 · 1024 · 601 · 414 | `Platform` = Web · Mobile **+ group booleans** | Two targets only; four frozen widths cannot reflow |

That takes 4 variants to 2, and makes the tool set configurable rather than baked in.

**Tool groups are nine BOOLEANs on the toolbar, all default true** — zero variant cost, the same
lesson as CardTable's `Thao tác`. `Format · Align · Paragraph · Font · Color · Lists · Insert ·
Clipboard · Overflow`, where `Font` drives both the family and size selects.

**The toolbar has no `Platform` axis, deliberately.** It was built with one and then collapsed,
because a BOOLEAN default is **set-wide**: with `Paragraph` defaulting true, the `Platform=Mobile`
variant showed all nine groups and overflowed 390. A property cannot carry a per-variant default. So
the toolbar is one component, and `RichTextEditor`'s Mobile variant sets the six extra groups false
as **instance overrides** — which *are* per-variant. Generalises: when a boolean needs a different
default per platform, the boolean lives on the child and the platform lives on the parent.

**`layoutWrap: WRAP` rather than a spacer.** The first build pinned the overflow control right with
a `FILL` spacer; that cannot survive a wrap container, and without wrapping the toolbar overflowed
any width under ~1130. Wrapping costs the right-pinned `…` and buys 0px overflow at every width —
measured 1200 → 234. The reference's right-aligned overflow is the one visual thing not reproduced.

**Two UpBase-direct instances, by decision** — `Input / Textarea` (the editing surface) is nested
straight from UpBase because the kit publishes no Textarea wrapper. Same category as PageHeader's
`Flag`. `Input / Textarea` carries `Show Count`, so the reference's character counter came free, and
its `State` axis covers Focused/Disabled — exposing that instance is why the set needs no `State`
axis of its own. A `Divider Vertical` dependency was designed out: the Fiori toolbar separates its
clusters by spacing, not rules, so the group frames do that instead.

`audit-wrappers` flags the toolbar with *"No remote UpBase instance anywhere — is this hand-built?"*.
That is **expected and correct**: every one of its 24 controls is a kit wrapper (`Button / Basic`,
`Select`), which is exactly what the *Status table is not the kit's inventory* note demands. The
check looks for a remote instance one level down and a fully kit-sourced composition has none.

### ExpandableText, 2026-09-21

Truncated body text plus a reveal action. A **`VERTICAL`** frame — text `FILL` + `maxLines: 3` +
`ENDING`, then an exposed UpBase `Link` instance named `Action`.

The reference (`166:38623` on `_Playground`) shows the action welded **inline** after the ellipsis.
That was ruled out by measurement, not taste: the only way to get it is a mixed-fill text range, and
a range loses its colour the moment `characters` is written — which is the one thing an
editable-copy component must allow. Both wrap-layout alternatives fail a consumer resize (overflow
by 904px, or 240px of dead space). Written up in `_shared/references/figma-api-gotchas.md`; don't
re-litigate them from the canvas.

`maxLines` is deliberately **not** a variant axis — it is a per-instance override, so the set stays
at 2 variants. Verified 240–800px in both states: zero overflow; coverage 100% on fills, text styles
and gaps; no raw values.

### CardTable audit, 2026-09-21

Two findings fixed, one bug found while fixing them. The rest of the audit is still open —
see **CardTable still open** below.

- **Summary cells carried placeholder text** in all 180 instances (the slot-accept loss). Filled at
  the `CardTable / Group` master, so every instance inherits: `Tổng tiền` · `Kho xử lý` · `Xử lý` ·
  `Vận chuyển` · `Người nhận`, with the reference's real values. On **Mobile** the five cells now
  carry a label/value stack (label `Secondary/SM`, value `Default/Base/Strong`, optional secondary
  sub-line) — that page's whole premise is "summary becomes label and value", and with placeholders
  there were no labels at all, so the mobile card was unreadable rather than merely unfinished.
  Hidden nodes counted too: `Cell 2`'s `Text 2` is off by default and still held placeholder text,
  which would surface the moment anyone toggled it. Sweep for `Table cell text` including
  `visible === false`, not just what renders.
- **`Thao tác` column added.** FIXED 130px, Web + Document only, with a `Chọn` Button carrying
  `Icon End` = chevron-down (`21:22395`). The header is an `Action` BOOLEAN on `CardTable`, the cell
  an `Action` BOOLEAN on `CardTable / Group`, both default true. **They are coupled** — turn both
  off or the header sits over an empty column. `GridTable / Row` has the same latent coupling
  (`Action` on the row, no matching header toggle) and should get the same treatment.
  On Mobile the action is not a column: it is a full-width button below the summary.
- **Column alignment broke in Compact — pre-existing.** `Lines` was hard-coded 480px, while the
  header's `Header Control` HUGs a variable-driven padding and measures 48 at Default but **30 in
  Compact**. So the header's product column was 462 against the group's 480, and every data column
  drifted — up to **19px**. Fixed by wrapping `Header Control` + `Header 1` in a FIXED 480px
  `Product Column` frame with `Header 1` set to FILL: the control shrinks, the header grows, the
  wrapper stays 480. Both modes now measure **≤1px** across all six columns.

  The lesson generalises: *a fixed width that happens to equal the sum of a fixed and a
  variable-driven sibling is a coincidence, not a constraint.* It holds in Default and silently
  fails in Compact. Wrap the pair instead.

Second pass, same day — line items, dividers and thumbnails:

- **Three distinct line items** at the `Group` master (so all groups inherit): a gift-tagged pouch,
  a long-named clay mask that wraps, and a gift sample at `x 2`. Nine identical rows hid the
  wrapping the demo exists to show.
- **`Gift Tag` turned on** for lines 1 and 3, matching the reference's "Quà tặng" lines.
  `Group Band · Tag` stays **off** — the reference's band has no tag on this screen; what it has is
  a channel logo, which is the `Channel` avatar, now `Type=Image` with the shop mark cropped from
  the reference.
- **Dividers are dashed.** A 1px frame with a *fill* cannot dash. Move the paint to a stroke —
  `fills = []`, `strokes = [thatSamePaint]`, `strokeTopWeight = 1` with the other three at 0,
  `dashPattern = [4,4]`. Copying the paint object carries its `boundVariables` across, so the
  token binding survives the move from fill to stroke; no re-import needed in kit mode.
- **`Line Item`'s `Name` was capped at one line** (`maxLines: 1`, `ENDING`), so the long product
  name ellipsised where the reference wraps. Now `maxLines: 2`. **`maxLines` can read back stale
  in the same `figma_execute`** — it reported `1` immediately after being set to `2`, then `2` on
  the next call. Verify it in a separate call or you will "fix" it twice.
- **Thumbnails** now crop real products out of both reference screenshots. `Image` fills are set on
  the instance directly (the `Image` main has no children — the component itself carries the fill).

**Header checkbox background (2026-09-21).** The checkbox cell in a header row is an instance of
`Table / Table Item / **Row Control**` — the layer is *named* `Header Control`, but the main
component is the row one, and it fills `Components/Table/Global/colorBgContainer` (white) while
`Header Item` fills `Components/Table/Component/headerBg`. So the header's first cell reads white
against a grey header. `GridTable` already overrode this; `CardTable` had not. Fixed on its three
Web Document variants by copying GridTable's own paint (which carries the `headerBg` binding).

The real fix is upstream: either a header variant of `Row Control`, or `headerBg` when it sits in a
header row. Any new row-major table in this kit has to remember the override until then.

### Report moved to GridTable (2026-09-21)

`Mode=Report` left `CardTable` for `GridTable`. Sizes: `GridTable` 6 → **12** variants,
`CardTable` 12 → **6**. `Report Row` (9) and `Column Group Header` (3) were renamed
`GridTable / *` and reparented to `❖ GridTable`, and the Report example frame moved with them.

**Reparenting a component does not break its instances** — it is the same node, so all 42 Report
Row and 7 Column Group Header instances survived untouched, and the one `CardTable [REPORT]`
instance silently re-resolved to `GridTable / Platform=Web, Mode=Report, Size=Default` and even
renamed itself. Verified: **0 broken instances** across the whole file. Rename and reparent freely;
it is deleting and re-creating that costs you.

What *does* break is property wiring, and there are two halves to it:

- **References don't travel.** The moved variants referenced `Header|visible` and
  `Pagination|visible` on CardTable's set. After the move those keys are meaningless — rewire each
  moved variant to the destination set's keys (`Header` already existed on GridTable; `Pagination`
  had to be added).
- **Definitions *do* travel, and arrive as orphans.** Moving the variants dragged CardTable's
  `Group 2`, `Group 3` and `Action` *definitions* onto GridTable, where nothing references them —
  which is exactly the unused-property state that blocked publishing once before. Audit both sets
  after any variant move: walk every variant for `componentPropertyReferences`, diff against
  `componentPropertyDefinitions`, and `deleteComponentProperty` whatever is unreferenced.

Housekeeping the move also needs, none of it automatic: the `Namings and Labels` group (move the
label pair, rewrite `CardTable /` → `GridTable /`, and fix **both** axis lines — GridTable gains
`Mode →`, CardTable loses it), the two `Components` sections refitted, and the component
descriptions on both sets.

### CardTable still open

Found in the same audit, not yet actioned:

- `Line Item`'s `Thumbnail` is UpBase **`Image`**, not `Avatar` — so the new `Border` boolean does
  not reach it. Real products are in place now, but the white-on-white case is unsolved here.
  Needs a decision on whether `Image` gets its own `Border` upstream.
- `Footer Strip` is an `Alert` still carrying antd's defaults ("Alert title", "Interactively
  monetize…") — **36** text nodes across the page. Off by default, so it ships lorem the first time
  anyone turns it on.

### GridTable still open

Both found in the CardTable audit; they travelled with `Mode=Report`:

- `GTUT 09/2026 (Theo Giá trị)` and `(Theo % cơ cấu)` both truncate to `GTUT 09/2026 (Th…`, so two
  different columns read identically — and the parenthetical *is* the whole distinction. The text
  nodes are already `maxLines: 2`; the header row's fixed height is what stops them, so this is a
  container fix, not a text fix.
- `Report Row`'s `Level` drives only indentation — `Level=1, Emphasis=Normal` is Regular, same as
  Levels 2 and 3. The reference sets every level-1 row bold, so right now a 9-variant axis is doing
  one variant's worth of work.
- ~~`GridTable / Row` has the `Action` header/cell coupling~~ — **gone 2026-09-28**: the `Action`
  boolean was removed when the cells became a slot; the action column is ordinary slot content in
  both the header (`Columns`) and the row (`Cells`). See *Rows, columns and panel items are slots*.

### Rows, columns and panel items are slots (2026-09-28)

Rebuilding Kho hàng (7 columns, 6+ rows, an 11-group sidebar) in UpS Product 2026 hit fixed layer
counts one level above the cell's `Content` slot. Approved and applied:

| Component | New SLOT | Wraps | Removed |
|---|---|---|---|
| `GridTable` (6 `Mode=Default` variants) | `Rows#298:16` | new `Rows` frame around `Row 1`–`Row 4` | `Row 3`, `Row 4` |
| `GridTable` (3 Web `Mode=Default` variants) | `Columns#298:29` | the old `Header Row`, renamed `Columns`; still `visible`-bound to `Header` | — |
| `GridTable / Row` (all 12) | `Cells#298:3` | new `Cells` frame: Web = `Cell 1`–`Cell 4` + `Action Cell` (HORIZONTAL); Mobile = `Cell 2`–`Cell 4` + `Action` (VERTICAL). `Select` and Mobile's `Head` stay outside | `Cell 3`, `Cell 4`, `Action` |
| `Menu / Sidebar / Panel` (both) | `Items#297:0` | the existing `Items` frame | — |

Variants 26 → 26. **`Mode=Report` was left fixed**: its header and rows live inside `Scroll Surface`
(the horizontal-scroll frame), and a slot must be a direct child of the component and cannot nest.
Slotting Report means lifting the header and rows out of `Scroll Surface` — its own decision.

What held, measured:

- **Reparenting inside a main keeps instance overrides.** All 7 canvas `GridTable` instances kept
  identical visible-text fingerprints and sizes, including the stacked-cell desktop's custom slot
  content. Every instance had the removed booleans at `true`, so nothing reappeared.
- `figma_add_slot_property` converts an existing direct-child frame (and renames it to the property
  name). Bind the other variants by setting `componentPropertyReferences.slotContentId` — merge with
  any existing `visible` reference rather than overwriting it.
- **A slot inside a nested instance reads `FRAME` from inside the parent's main component** (the
  Panel inside `Menu / Sidebar`) but `SLOT` in a fresh instance of the parent, where it accepts
  content. Test from an instance, never from the main.
- Functional test: 7 headers + 6 rows × 7 cells, duplicated rows keep live `Cells` slots; `Header`
  off still hides `Columns`. Reflow 1200 → 600: 0px. Default and Compact: header/row column x drift 0.
- **Width is the designer's job now.** Six fixed 200px columns in a 1200 table collapse the FILL
  primary column to nothing — expected; the descriptions say to size the columns to fit.

Adding content in a product file: product files subscribe to UpS only, so they cannot insert UpBase
`Table / Table cell` or `Header Item` directly — **duplicate an existing one inside the slot**. Kit
wrappers (`GridTable / Cell`, `GridTable / Header Cell`) as slot preferred values are deferred until
duplication proves clumsy.

### Which name means what

The two names are **not** intuitive from the page list, and they were swapped once
during the build (corrected 2026-09-17). The rule:

| | Unit of a row | Shape | Product modules |
|---|---|---|---|
| **`GridTable`** | one **record** | dense aligned columns, one row per entity | Tồn kho (danh mục · sản phẩm · tồn kho), Kho hàng, Nhà cung cấp, Báo cáo lãi lỗ |
| **`CardTable`** | one **document** | full-width metadata band + nested line items, so a record reads as a card | Đơn bán hàng, Xử lý trả hàng |

**The P&L report lives on `GridTable`, as `Mode=Report`** (moved 2026-09-21). It was built on
`CardTable` because the P&L sits in the same *product module family* as the order tables — and that
was the wrong axis to split on. **Shape decides, not module.** A report matrix is one row per line
item in aligned columns; that is a grid, however its navigation is grouped.

### Table family notes

The two table pages are **row-major**, which diverges from UpBase's `Table`
(`98b0e8c1…`). UpBase's is **column-major** — `Table → Columns → Column → [Header Item, cell, cell…]`
with no row container anywhere in the family — so it cannot host a row-spanning group band or a
per-row card surface. Both pages therefore assemble `Table / Table cell` instances row-major
instead of nesting `Table`. Worth raising upstream; it does not block the kit.

### UpBase changes made on 2026-09-17 — UpS must accept them

UpBase file edits to `Table / Table cell` (`0e705ed2d5e56fac22096d2713029f213c98c4e5`), **not yet
published**. Until UpBase is published and UpS accepts, the kit sees none of this:

- **Text hierarchy.** `Text 2 Content` was bound to the same `colorText` as `Text Content`, so the
  cell had no hierarchy and every consumer overrode it by hand. It now binds a new
  `Components/Table/Global/colorTextSecondary` (a 1:1 alias of `Colors/Neutral/Text/colorTextSecondary`).
  **Not** `colorTextDescription` — that is black at 45% and measures **3.35:1** on `colorBgContainer`,
  failing WCAG AA for text. The secondary is black at 65% and measures **6.98:1**.
- **Composable text cells.** `Type=Text` gained `Inline Tag` + `Inline Tag Swap` and
  `Trailing Icon` + `Trailing Icon Swap`. Booleans and instance swaps cost **no** extra variants,
  where a new Type would have cost 18. Covers text-with-a-status-tag and text-with-a-copy/info-icon.
  The wrapper now stacks: inline tag → row of [primary text, trailing icon] → secondary text.
- **Six `Type=Text, Size=Small` variants had only one text node**, so `Text 2` had never worked at
  Small. All 18 Text variants now carry both lines.

Scope check before editing: the cell has 144 variants and 300 instances in UpBase, and **every one
of them is inside `Table` itself** — no other UpBase component consumes it. `Table`'s own instances
set `Text 2` off, so existing tables are visually unchanged. A product file that uses cells directly
and leaves `Text 2` at its default will now see a second, secondary-coloured line.

Deliberately **not** done: a `Link` emphasis for label-plus-link in one cell. A Figma boolean cannot
invert, so that needs an `Emphasis` axis doubling the set to 288 variants. Use `Type=Action` for
link-only cells; the one label-plus-link case in the references lives in `CardTable / Group Band`,
which is ours and already handles it.

### Filling a cell slot in the kit (2026-09-20)

`Table / Table cell`'s `Content` is a **SLOT**, and a slot inside an *instance* is fully mutable
from the plugin API — `slot.appendChild()` **and** `child.remove()` both work on the default
content that came from the main component. That is the mechanism for a stacked cell:

```js
const slot = cell.children.find(c => c.type === 'SLOT');
for (const c of [...slot.children]) c.remove();   // drops the default Tag + Text Wrapper
slot.appendChild(myStack);                         // VERTICAL frame, then layoutSizing* = FILL/HUG
```

Order matters: `appendChild` first, `layoutSizing*` second — the setter throws on a node that is
not yet in an auto-layout parent.

Two content gaps this exposed, both worked around rather than fixed:

- **`Typography / Text` has no `Link` type.** Its `Type` axis is Default · Secondary · Success ·
  Warning · Danger · Mark · Disabled. The product's clickable in-cell text ("1 liên kết",
  "1 hàng hóa") is brand orange, not red, so `Danger` is the wrong token. The stacked cells clone
  the `Action 1` TEXT node out of the cell's own `Type=Action` variant (`158:2528` as resident
  here) — it carries `Components/Button/Global/colorPrimary` plus the font bindings. Worth a
  `Link` type upstream; until then this is the only link-coloured text in the system.
- **No UpS `Tag` wrapper yet.** `❖ Tag` holds `Tag / Basic` but the kit has no wrapper, so the
  stacked cells clone the resident `Tag` from `CardTable / Group Band`. **It clones hidden** —
  the band ships it off — so set `visible = true` after cloning or it lands as a 0-height ghost.

### Product thumbnails come from the reference screenshot

`GridTable / Row`'s Cell 1 avatar used UpBase `Avatar`'s stock portrait, which reads wrong in a
product table. All 8 variants that show an avatar (the three `Size=Small` rows have none) now
carry an image fill cropped straight out of the pasted reference `117:31402` on `_Playground`:

```js
const hash = ref.fills[0].imageHash;                      // the screenshot's own image
fills = [{ type:'IMAGE', scaleMode:'CROP', imageHash: hash,
           imageTransform: [[w/1506, 0, x/1506], [0, h/777, y/777]] }];
```

The image is exactly the node's size (1506×777), so screenshot pixel coordinates *are* the
normalised crop. Four usable product crops at `x=101, w=68, h=64`: `y=69` (blue bottles, the
default), `y=182`, `y=283`, `y=485`. No asset upload, no synthetic placeholder — and the change
propagates to every `GridTable` instance, Density scale and mobile included.

The thumbnail is still **32px** because that is `Avatar`'s size; the reference runs ~70px. Left
alone deliberately — see the avatar/row-height question still open upstream.

### UpBase changes made on 2026-09-20 — UpS must accept them

- **`Avatar` gained a `Border` BOOLEAN, default false** (all 24 variants; `398:11741`). A 1px
  hairline drawn `strokeAlign: 'INSIDE'` on an absolutely-positioned `Border` rectangle with
  STRETCH constraints, inserted below `Badge` so the badge stays on top. Inside alignment is the
  point: a 32px avatar stays 32px, so none of the 228 `Table` instances shift. Verified across all
  **791** UpBase instances — 0 with the border on, 0 size change, 0 where the border rect and the
  instance disagree (including the resized Custom ones at 20/28/35/36px).
- **New token `Components/Avatar/Global/colorBorder`** → 1:1 alias of
  `Colors/Neutral/Border/colorBorder` (#D9D9D9 light, #424242 dark). Weight reuses the existing
  `Components/Avatar/Global/lineWidth`.

  **`colorBorderBg` and `groupBorderColor` are traps here.** Both already existed, both resolve to
  `colorBgContainer` — antd's *white* ring that punches overlapping avatars apart in `Avatar Group`.
  On a white surface they render nothing, which is the very bug the new property fixes.

  Contrast: #D9D9D9 on white is **1.41:1**, and `colorBorderSecondary` would be 1.14:1. No neutral
  hairline reaches 3:1 — that needs ~#767676, which reads as a hard outline. Accepted deliberately:
  WCAG 1.4.11 covers graphics required to understand content, and the frame around a photo is not
  one. This makes the edge perceivable; it does not clear a measured threshold. A tinted backplate
  (`colorFillQuaternary`) was the considered alternative — it also handles transparent PNGs, which
  a border does not — and was set aside in favour of the plainer primitive.

Turn it on for `GridTable / Row`'s Cell 1 avatar once UpS accepts: product photography on a white
sweep is exactly the case it exists for.

### Still open upstream

Three weaknesses found while building, all still worked around with instance overrides here:

- **`Table / Table cell` cannot truncate.** Its `Text Wrapper` is FILL but the TEXT nodes inside are
  HUG / `WIDTH_AND_HEIGHT`, so any cell narrower than its content overflows silently. Every cell
  instance in both pages overrides `textAutoResize='HEIGHT'` + `layoutSizingHorizontal='FILL'`.
- **Cells do not equalise height.** Each cell hugs its own content, so their bottom borders come out
  ragged. Both pages set the cell row to FILL vertically so the rules line up.
- **The cell's image slot is a circle.** `Table / Table cell` has an `Avatar` boolean — the right
  slot for a thumbnail — but it renders at `cornerRadius: 999`, so a product image comes out round.
  There is no square-image cell Type upstream (Types are Text · Badge · Tag · Action · Dropdown ·
  Rate · Switch · Progress). `GridTable / Row` binds the avatar's radius to `Border Radius/borderRadius`
  per instance. Worth an upstream `Type=Image`, or a `Shape` boolean on the avatar.

### Building a table row that actually lines up

Learned the hard way on `GridTable / Row`; applies to any row-major table here:

1. **Cells own all the padding — the row has none.** A row with its own `cellPaddingInline` insets
   its content twice and the selection column stops aligning with the header's.
2. **One rule per row.** The row draws the hairline; zero every cell's own border. Otherwise the two
   coincide and read as a double line.
3. **Size-match every nested instance to the row's Size variant.** Importing one cell variant and
   reusing it across all three sizes is silent — the rows differ only by their own padding, which
   looks plausible until you remove it and all three collapse to the same height.
4. **Use `Table / Table Item / Row Control` for the checkbox**, not a bare `Checkbox` in a frame: it
   is the cell the header already uses, so the two align by construction (48 at Default, 32 otherwise).
5. **Header and row must carry the same column widths.** Figma auto-layout has no grow factor, so
   FILL siblings split equally — fix the secondary columns and let the primary one take the slack.
6. **The action column starts at its header, like every other column.** `Action Cell` shipped
   `primaryAxisAlignItems: 'MAX'`, which floated the button to the far right while the `Thao tác`
   label stayed left — the only column in the table that didn't line up with its own header. Now
   `MIN` on all 6 Web variants (Mobile has no `Action Cell`; the button goes full-width there).

`GridTable / Stacked Cell` is **UpS-local by decision, 2026-09-17** — a stacked label/value cell is
generic enough for UpBase, and is deliberately kept in the kit. Raise it upstream before a second
product rebuilds it. It is also what every data cell of `GridTable / Row` becomes at
`Platform=Mobile`, where there is no column header left to name the value.

**Before building anything chart-shaped**, load the `dataviz` skill and run its
`validate_palette.js`. UpBase's `Colors/Chart/Categorical/1…8` **fails** — keep UpS
charts to series 1–5; the measured pairs are in the repo's own
`scripts/figma-chart-sync/README.md` (in the UpBase Design System repo — not this skill's `scripts/`)
§ Colour and in `Charts / Metric Tile`'s description.

Run `scripts/audit-wrappers.js` for the current state rather than trusting this line.
