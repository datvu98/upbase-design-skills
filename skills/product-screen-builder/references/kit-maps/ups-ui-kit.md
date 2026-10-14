# Kit map: UpS UI Kit → product screens

> **Scope:** product files consuming UpS UI Kit (`9c052aEvpV7gYLhwdatf6g`). UpS's own live data, and
> the filled-in example of `kit-maps/_template.md` — another kit gets its own file. What to reach for per
> screen region, how to import it, and which property keys to set. Verified in UpS Product 2026,
> 2026-09-28 → 09-30.

## Contents

- [How kit components are shaped](#how-kit-components-are-shaped)
- [Region → component](#region--component)
- [Components, keys and property keys](#components-keys-and-property-keys)
- [Finding something not listed](#finding-something-not-listed)

## How kit components are shaped

Most UpS components are **wrappers**: a local component whose only child is an exposed instance of
the UpBase original. On an instance in a product file that means:

- The wrapper's own `componentProperties` are usually empty. The real properties are on
  `inst.children[0]` (the nested instance). Set variants and text there.
- Property keys carry a `#id` suffix — use the exact keys below, or read
  `Object.keys(node.componentProperties)` first.
- Size the wrapper **and** the nested instance: `inst.layoutSizingHorizontal = 'FILL'` alone leaves
  the nested one at its fixed width (Alert stays 640, Form fields stay 360).

**Import by key, and import a variant key for sets** (`importComponentByKeyAsync`). A set key
imports nothing useful and large sets can hang. Keys below are the ones that imported cleanly.

Compositions (PageHeader, FilterBar, GridTable, CardTable, TableToolbar, Form wrappers, Card) expose
**SLOTs** for variable content. A slot inside an instance is fully editable: `remove()` its default
children, `appendChild()` anything, duplicate a child to add one. Composing inside a slot is normal
use, **not a kit gap**.

## Region → component

| Screen region | Use | Notes |
|---|---|---|
| App top bar (logo, breadcrumb, utilities, avatar) | `PageHeader` | One per screen. It is the app shell, not a page title |
| Left navigation | `Menu / Sidebar` `Mode=Rail + Panel` | Panel `Items` is a SLOT of Submenus |
| Page title | `Text` `Size=LG, Style=Strong` + `Text` Secondary count | No larger title size exists (GAP-016) |
| Banner / system message | `Alert` | Set nested FILL |
| Primary page action | `Button / Basic` `Type=Primary` | |
| Filters above a list | `FilterBar` (slots `Filter`, `Action`) | For a lone search, an `Input` is enough |
| Search field | `Input / Input Item / Outlined` + `Icon Left` = search | |
| Status views (All / Active / …) | `Tabs / Basic` | HUG it; hide unused items; empty its `Tabs Content` slot. Keep its white fill (GAP-026) |
| Record list (one row per entity) | `GridTable` + `GridTable / Row` | Warehouses, products, suppliers. Rows/Columns/Cells are SLOTs (Mode=Default). **GridTable is already a card — place it directly in Main; never wrap a listing table in `Card / Basic` and never give it a title** |
| Status tabs (and sub-filters) in the same card as the list | a **`Table Card`** layout frame: VERTICAL, **gap `paddingSM` (12) between `Table Header` and the GridTable** (user, 2026-10-12, applied to all 15 cards), clip, fill and radius copied from the GridTable's own bound values (`colorBgContainer`, `borderRadiusLG`), **1px `colorBorderSecondary` stroke INSIDE (not in layout) + `boxShadowTertiary`** (user, 2026-10-13 — was no stroke, 2026-10-01) → `Table Header` frame (side padding `padding`, gap `marginXS`) holding `Tabs / Basic` (fill cleared, **FILL — wrapper and nested `Tabs / Basic` both**, so the tab underline spans the card; user 2026-10-12) [+ sub-filter row] → the GridTable with its stroke cleared and radius 0 | Matches production (tabs and table share one card). Not `Card / Basic` Tabs=True (forces a head + title) and not a GridTable toolbar change. Reference: Xuất nhập 01–04 |
| Empty state / operation result | **`IllustratedMessage`** (page `❖ IllustratedMessage`) — `Size` XS (inline) · **S (table / card / panel)** · M (modal) · L (screen) | Nested `Illustration` `Type` = Empty · Success · Info · Warning · Error · 403 · 404 · 500. `Show Title` / `Show Actions` booleans, `Actions` SLOT. In a table: Size=S in a frame inside the `Rows` slot. A one-line message (e.g. "Chưa có dữ liệu") → `Show Title` off and put it in `Message` — the message has no hide boolean, it's the component's fixed line |
| Filters (FilterBar) | **Column grid** (user, 2026-10-12, "option C"; applied to all 16 multi-field FilterBars on `↳ Specifications`): cols = floor((slot + 12) / (260 + 12)), col = (slot − 12·(cols−1)) / cols — **4 × 275 at a 1136 slot**. A **select spans 1 col (275)**, a **range** (`FilterBar / Filter Field` Date or Text) **spans 2 (562)**, a full-row item (Segmented `Order Type` frame) spans all. Fill rows in order and backfill a gap with the next item that fits (CSS `grid-auto-flow: dense`) — reorder the slot children to match, since Figma has no dense packing. A short last row stays left-aligned. **Hide the `Action` slot when it's empty** — it reserves 126 + gap otherwise. Dev spec: `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; grid-auto-flow: dense` + `.range { grid-column: span 2 }`. Responsive behaviour (1440 / 1280 / 1024): section `Responsive rules` | 562 is about the narrowest a range can go: the date range ("20/09/2026 00:00 ⇄ 26/09/2026 23:59" + calendar icon) just fits its 362 value area. Set the Date Filter's `DatePicker` and its `DatePicker Input` FILL, or the range hugs at 294. Cloned Selects keep an inner FIXED 320 — set the inner Select FILL. Rejected: kit widths 620/320 (stacks to 3 rows) and per-screen content widths (only fits one filter set) |
| Document list (record owns line items) | `CardTable` | Orders, returns |
| Cell content | the cell's `Content` SLOT | Text / Text 2, inline Tag, any kit instance |
| Status pill | `Tag` `Type=Status` → `Tag / Status` `Status=Success/Default/…`, `Type=Filled` | `Badge` is count-only — not for status |
| Small label tag (e.g. "Mặc định") | the cell's own inline `Tag` (`Tag / Colorful`) | Sits above the cell text (GAP-020) |
| Row actions (menu trigger) | **`Dropdown` `Type=Icon`** (key `d31e56d18a86a68323285a9fdc8428c479518cbb`, 32×32, ellipsis by default) — the kit's `Dropdown` is a set since 2026-10-02: `Type=Default` (old key `a526bb71…`) · `Type=Icon` | Replaces "Chọn ⌄" buttons (Xuất nhập 02–04). Its nested UpBase `Dropdown Icon Button` (`State`, `Icon Name#28884:0`) is not exposed — GAP-038. For "Sửa + ⋯" pairs, put them in a HORIZONTAL frame in the slot |
| Toggle | `Switch / Basic` | `Active`, `State=Disabled` |
| Pagination / list footer | `GridTable` `Footer` on → its nested `Pagination` at `Variant=More` | **Inside the table card** (since 2026-10-13). Hide the Footer's own `Count` (More has its count). Set wrapper + inner `Pagination` FILL, `Pagination Wrapper` FILL + MAX, then the select text, `Text#1233:72` count and page items. A standalone `Pagination` is only for a table that isn't a GridTable (modals, cards) |
| Section container | `Card / Basic` | Title + `Content` SLOT; empty the head `Actions` slot (default "More") |
| Form field, label above | `Form / Vertical` | Text, Textarea, Select, InputNumber, Switch, Radio Group… |
| Form field, label beside | `Form / Inline` | Keeps its ":" even if the reference has none (GAP-008) |
| Radio option | `Radio` | For a 4th option next to an Inline Radio Group (GAP-007) |
| Confirmation dialog | `Modal / Basic` (or `Popconfirm` anchored to a control) | + overlay rectangle |
| Floating help / chat | `FloatButton` | ABSOLUTE; keep it off controls |
| Table with column dividers in the reference | **The standard GridTable, as every other screen uses it** — header and body cells `Bordered=False`, cell stroke weights 0 (the row draws the divider), action column 88. Don't reproduce the reference's dividers (user, 2026-10-02) | `Bordered=True` exists (variant on UpBase `Header Item` / `Table cell`) but only on the user's say-so. Switching back leaves a 1px bottom-stroke override on each cell that stops short of the `Action Cell` frame — zero all four stroke sides |
| Single row action (download, print, edit…) | **`Button / Basic` `Type=Default`, `Content=Icon Only`, `Size=Small`** + `Icon Start Name` (user preference, 2026-10-02) | Not a Primary text button per row — even when the reference shows one ("Tải file", Xuất nhập 09). The label is lost; say so in the handover |
| Text link / inline action ("Thu gọn", "Chọn tất cả…") | `Link` (`d925dfcae78e9e80651d0faa3db83b8e42e4e193`, `Text#1917:0`, `Underlined`) | In a table cell: hide `Text Wrapper`, append the Link to the cell's `Content` slot |
| Back link above content | `Button / Basic` `Type=Link` + `Icon Start` = chevron-left (`55c7f5c8881330a668e888cddfbac0da15fb3a1d`) | |
| Selectable product picker | Grid of layout frames: `Checkbox` (`36bd4f3bf1f2d32ffc5227dfd95455d788add00f`, `Label#506:2595` off, `Status` Active/Inactive/Indeterminate) + `Image` (`28d84e6138be6fa1f277a58e19c4e8636efea3ea`, `Size` Default/56/80 — 56 renders 38, GAP-042) + `Text` stack | Borderless — no selectable card in the kit (GAP-040) |
| Modal with a form | `Modal / Basic` `Type=Slot` → empty the `Content Wrapper` slot (`Space` placeholder) → a VERTICAL `Form` frame (padding-left 120 for `Form / Horizontal`) staged before its fields | `Form / Horizontal` types: Button, Text, Password, Phone, Textarea, Select, DatePicker, InputNumber, Switch, Currency, Slider, Rate, Drag and Drop, Radio Buttons, Radio Group, Checkbox Group, TimePicker. No caption — add a `Text` Secondary after the field. Labels wider than 120 overlap the control (GAP-041). Textarea counter max = `Input / Input Show Count` `Max Length#5011:3` |

## Components, keys and property keys

Nested keys are on `inst.children[0]` unless marked *(wrapper)*.

### Shell

| Component | Key | Properties |
|---|---|---|
| `PageHeader` | `7e47ab0427904e2402119b68d0e4bcda88026c8e` | *(wrapper-less composition)* booleans `Brand#166:72` `Breadcrumb#166:73` `Locale#166:74` `Announce#166:75` `Announce Badge#166:76` `Help#166:77` `Store#166:78` `Tenant#166:79`. Breadcrumb: find `Breadcrumb / Breadcrumb Link` instances — `Title#506:2625`, `Icon#506:2617`; last one is `State=Current`; hidden middle links + `Breadcrumb Separator` instances can be made visible |
| `Menu / Sidebar` Rail + Panel | `b2daa9aa6abd35c9fb0f267fe7fcc583b379a0c3` | Expanded: `89ccc47e3bf5f54a8b1de2cf0351f8a1dd21a19d`. Rail items (`Menu / Menu Item / Inline / Navigation Item`): `State` Active/Default, `Icon Name#506:2726` (swap id), `Icon#506:2715`. Panel `Items` SLOT → `Menu / Menu / Submenu` (`Active` True/False = expanded); title `Menu / Menu Item / Inline / Submenu Title` `Text#507:74`; `List` frame holds 12 Navigation Items (`Text#507:95`, `State`), 3 visible by default — toggle `visible` |
| `Alert` | `d1f396625b58a1b747a9b7ecebbe2ebb0a44c918` | `Type` Error/Info/Success/Warning · `Banner` · `Description` · `Title text#508:49` · `Description Text#510:0` · `Close Icon#508:43` · `Icon#508:52` |
| `FloatButton` | `0f3dd1d996733c08d6ecc84fa7e2414e35dcb40a` | `Type` Default/Primary · `Shape` Square/Circle · `Badge` None/Dot/Small · `Icon Name#1722:11` · `Icon#1722:16` · `Tooltip#1722:26` · `Description#1722:6` |

### Actions and inputs

| Component | Key | Properties |
|---|---|---|
| `Button / Basic` | `ad019f1790ab546845e50debf54d2bc5a710a6bf` | `Type` Primary/Default/Dashed/Text/Link · `Size` Default/Large/Small · `State` · `Content` Basic/Icon Only · `Ghost` · `Danger` · `Shape` · `Button Text#506:865` · `Icon Start#513:53` · `Icon Start Name#506:0` · `Icon End#13010:0` · `Icon End Name#13010:961` |
| `Input / Input Item / Outlined` | `b7906c1e7e210293b5a8a1ce16295e4c91333f4b` | `Status` Default/Error/Warning/Success · `State` Default (= placeholder look)/Hover/Focused/Typing/Filled/Disabled · `Size` · `Text#515:158` · `Show Count#5011:4` · `Icon Left#515:8` · `Icon Left Name#515:108` · `Icon Right#515:33` · `Prefix#515:58` · `Suffix#515:83`. Counter = TEXT nodes `0` `/` `40` — set the `40` node's characters to the max |
| `Select` | `1b6c0e9b61f47768f07fcca83890fa1e38eb22c1` | nested `Select` → find `Select / Select Input / Outlined`: `Text#533:121` · `Status` |
| `Switch / Basic` | `4a02e545827349ea21d042cf43b78cf3aae7232c` | `Active` True/False · `State` Default/Pressed/Loading/Disabled · `Size` — on `children[0]`; the wrapper has none |
| `Radio` | `7efce10fa659e84b89b2558d46344d1c09c444b6` | `Checked` True/False · `State` · `Text#506:3163` · `Label#506:3156` |
| `InputNumber / Basic` | `20c11df22632a8f78d3a7a51d1ae7f0215d15664` | `Number#533:23` — fixed 90px stepper (GAP-012) |
| `Tooltip` | `236c211d3977d36484d4b77729d19b44096de9a7` | popup only; the trigger icon lives in the label/text |

### Forms

| Component | Key | Properties |
|---|---|---|
| `Form / Vertical` | `baa47c2b2b2051d19228cb5727dbd5e468c71e4a` | item: `Type` (Button, DatePicker, InputNumber, Password, Phone, Select, Switch, Text, Textarea, Currency, Slider, Rate, Drag and Drop, Radio Buttons, Radio Group, Checkbox Group, TimePicker) · `Label#515:279` · `Caption#515:251`. Children: `[0]` `Form / Form Label Vertical` (`Text#516:4`, `Tooltip` True/False, `Mark` None/Optional/Required) · `[1]` the control · `Input / Input Caption` (`Text#533:0`, `Status` Default/Error/Warning). Textarea control: `Input / Textarea` (`Text#533:4`, `Show Count#5012:0`) |
| `Form / Inline` | `e23ade8018c34fc814a5ce4c364bcf88174cbb85` | item: `Type`, `Show Label#516:50`. Label `Form / Form / Form Label Horizontal`: `Text#516:0`, `Tooltip#515:4`, `Required#515:0`; a `Wrapper` frame holds ":" — part of the component, leave it visible. `Radio Group` = 3 `Radio` children (fixed). `Switch` = `Switch Wrapper` › `Switch / Basic` |
| `Form / Horizontal` | `368198e6f4905d43c4ceb2fc7f1d75061d26a5ad` | label ABSOLUTE at x=−120: the container needs ≥120px left padding |

**Error state recipe** (Form / Vertical): control `Status=Error` → re-apply its placeholder text
and counter (a variant change resets overrides) → item `Caption#515:251 = true` → caption
`Status=Error` → caption `Text#533:0` = message. `scripts/helpers.js` › `setFieldError` does it.

### Containers and overlays

| Component | Key | Properties |
|---|---|---|
| `Card / Basic` | `714dbffdd72343e0970370be294599430670ea96` | `Title#533:265` · `Size` · `Borderless` · `Tabs` · `Show Extra#28971:0` · `Content` SLOT · head `Actions` SLOT (default "More" button — remove it) · `Extra` SLOT right after the title (default placeholder Tag — replace with a fresh kit `Tag` Type=Status; set Status/Type on `children[0]`, text on its TEXT node). Status beside a title goes here, not in Actions. Title hugs, capped 480 / Small 140 |
| `Modal / Basic` | `79f6ed76dd478c28a29a4163989f0a3ad9509e40` | `Type` Text/Slot · `Title#2914:3` · `Text#2914:0` · `Third Button#3113:9` · `Show Footer Extra#28898:3` (default off) · `Footer Extra#28898:0` SLOT. Layers: `Head`, `Content Wrapper`, `Footer` → `Footer Extra` (SLOT, FILL, left — secondary links such as "Tải file mẫu tại đây" go here, not in the form) + `Actions` (Button ×3, 3rd hidden), `_Button Close`. Footer Extra added in UpBase 2026-10-02 — reaches products only after UpBase → kit → product publishes. 520 wide; wrapper resizes, nested FILL. Keep `Head` and close visible — if the reference has no title, write one from context; button labels in sentence case |
| `Popconfirm` | `a67e7b4a32555ec4c0564347f34c4606011a7585` | lighter confirm anchored to a control |
| `Tabs / Basic` | `f30b3f420842debd77183aa4ed253a6b106ecb51` | nested `Tabs` frame: 6 `Tabs / Tab Item / Basic` (`Text#512:79`, `State` Active/Default/Hover/Disabled, `Icon#512:59`); `Tabs Content` SLOT |
| `Divider Horizontal` | `4286955cf35e38d5d5a8e3c4b7b0696d4a1b5287` | `Variant`, `Orientation`, `Text Type`, `Label Content` |

### Tables

| Component | Key | Properties |
|---|---|---|
| `GridTable` Web · Default · Default | `61980c174181b538ed02c29e597e278541f60b95` | `Toolbar#120:428` · `Header#120:435` · `Footer#120:442` · `Pagination#166:20` (both modes since 2026-10-13; the pager is the exposed UpS `Pagination` wrapper, so its Variant can go to More) · `Columns` SLOT (header cells; Web) · `Rows` SLOT. Middle `5b98649b7beceb557ea777d28213baf7371a8c3a`, Small `b470daa8e7d2604ef843164d527a5f1cb5557c1d`, Mobile Default `1ee2bbfbb1e62d825db453a2bf294a360a689ed0`. Mode=Report is **not** slotted (GAP-003) |
| `GridTable / Row` Web · List · Default | `2741790d7cffebbd4164191e2e8db43e9b825fad` | `Select#120:350` · `Selected#120:376` · `Cells` SLOT. Web cells: Cell 1–4 + Action Cell; Mobile: head (Select + Cell 1) fixed, stacked cells + Action in the slot |
| `GridTable / Stacked Cell` Default | `ebdaa5d0be935103d123837308055664ad3f508a` | label/value pairs |
| Header cell (UpBase `Table / Table Item / Header Item`, inside `Columns`) | — | `Text#508:12` · `Filter#508:4` · `Search#508:0`. Alignment: set `Header` and `Header › Wrapper` `primaryAxisAlignItems`, and the TEXT `textAlignHorizontal` (it FILLs) |
| Body cell (UpBase `Table / Table cell`, inside `Cells`) | — | `Type` Text/Badge/Tag/Action/Dropdown/Rate/Switch/Progress — **chrome only; all types share one `Content` SLOT**. `Avatar#7091:0` · `Quantity#28666:0`. Content: hidden `Tag` frame (`Inline Tag` = `Tag / Colorful`: `Preset` Blue…Volcano, `Type` Solid/Filled/Outlined, `Text#9013:92`) + `Text Wrapper` (`Text`, `Text 2`: `Text#1233:72`, `Type`, `Size`, `Icon#28651:581`, `Icon Swap#28651:687` default = info icon). Cell 1 of the kit row holds `Text`, `SKU`, `Variant` instead |

Column widths (user rule, 2026-10-02) — the same setting on the header cell and on that cell in
every row, or the columns drift:

| Column | Sizing |
|---|---|
| Checkbox | HUG (48) |
| **First (identity: code / name + ID / SKU)** | FIXED = longest identifier's natural single-line width + 32 padding, **floor 240**. Identifiers never truncate (that's why the width comes from the data, not a constant); free-text names may wrap/truncate at 2 lines. Over 300 → ask the user |
| Middle columns | **FILL** — share the rest equally and shrink with the table. Add `minWidth` (works on slot cells) = longest **unbreakable** content + 32: date-time + its label (151), email (142), label + icon + Switch rows (188). Free text that wraps at word boundaries gets no minimum |
| Actions | FIXED 88 (32px `Dropdown` Type=Icon + padding + "Thao tác" header) |

Measure natural widths by cloning the TEXT to the page, setting `WIDTH_AND_HEIGHT`, reading
`width`, and removing the clone — the in-cell node reports the cell's width. Check the screenshot
for split dates/emails afterwards: an equal split alone breaks them (seen on Xuất nhập 03 at 132px).

Vertical alignment in rows (user, 2026-10-08) — **top**. `Table / Table cell` ships
`counterAxisAlignItems = MIN` on all 144 variants, so the image sits level with the first text line.
Never override it to CENTER, and give hand-made cell frames (`Action Cell`, `Ghi chú`) MIN too. A
CENTER override had crept into Xuất nhập 07/09/10 and Kiểm kho 07/08; all reset to MIN.

Column alignment (user rule, 2026-10-02) — **the header and its cells always align the same way**,
and this beats the reference (a centred column in the screenshot is still built left):

| Column content | Header + cells |
|---|---|
| Everything — text, codes, dates, statuses, integers/counts, "--", action buttons | **Left** |
| **Decimal numbers** — money, prices, weights, rates, anything with a decimal or thousands-formatted amount | **Right** |

Set it on both sides: header `Header` + `Header › Wrapper` `primaryAxisAlignItems` and TEXT
`textAlignHorizontal`; body cell `Content` alignment and its TEXT `textAlignHorizontal`. Then
screenshot and check the header label's left (or right) edge lines up with the cell text below it.

### Empty states and results

| Component | Key | Properties |
|---|---|---|
| `IllustratedMessage` Size=XS / S / M / L | `3c49fbb73e8a7dc82e26487dd3a05fea1a3e2a94` / `9d822b6a2cdf6d96d9a7ffad5926a991fec764f7` / `09f3ddcba17ddcd87cd9aaf4875dfc26ceead122` / `89eb4d05688fcf1f327e6f7ae954de3971aad2ae` | *(composition, props on the instance)* `Size` · `Show Title#338:0` · `Show Actions#338:3` · `Actions#338:6` SLOT (one Button by default). Children: `Illustration` (exposed: `Type`, plus its own `Size` — leave it, it follows the parent) · `Text` › `Title`, `Message` (TEXT nodes — set `characters`) · `Actions`. Widths 240 / 360 / 480 / 720. The L key is the old `Result` key — instances of `Result` resolve to `Size=L, Type=Empty` once the product accepts the library update |

### Tags, text, pagination

| Component | Key | Properties |
|---|---|---|
| `Tag` Type=Status | `ae673c2b030ccb5a4eb1d9910d4ee37cc723a465` | nested `Tag / Status`: `Status` Default/Error/Processing/Success/Warning · `Type` Outlined/Filled/Solid · `Icon#513:0`. **No text property** — set the TEXT node's characters |
| `Tag` Type=Basic / Colorful | `7bd4a622bfcf6b97aca9614e6f29b70e316ac265` / `9208d76b1702edbe8c86137ac6d5e2f936a50500` | |
| `Badge / Basic` | `f30c45cbd779fdcf22f50a28472a3ea7c4ebd676` | `Count#28335:7` · `Type` Default/Small/Dot — counts only |
| `Text` | `a33b73b9114e675bc8c4138c9e40a762d24e2094` | `Type` Default/Secondary/Success/Warning/Danger/Mark/Disabled · `Style` Default/Underline/Delete/Italic/Strong · `Size` Base/LG/SM · `Text#1233:72` · `Icon#28651:581` · `Icon Swap#28651:687` |
| `Pagination` | `f069630f458028668c2705aca4823cb8ef088595` | nested `Variant` Basic/Jumper/Mini/Mini Jumper/More/Simple/Prev and next. `More` children: `Text` (count), `Pagination Wrapper` (Arrow / Number (`Number#507:144`, `Active` Yes/No) / More items), `Select / Select Input / Outlined` (page size) |

### Learned on Kiểm kho (2026-10-07)

| Component | Key | Notes |
|---|---|---|
| `Select` Type=Multiple | (same `Select` key) | On the nested `Select / Select Input / Outlined`: `Type=Multiple` → tags only render in `State=Filled` / `Hover (Filled)` (3 `Select / Multiple Selection Item`, `Text#507:160`; hide the extras). `Focused` shows the placeholder only (GAP-047) |
| `Form / Vertical` Radio Group | (same key) | 3 `Radio` in `Content Wrapper` — hide the 3rd for a 2-option group (unused repeated item). Disabled = `State=Disabled` per Radio |
| `Checkbox` | `36bd4f3bf1f2d32ffc5227dfd95455d788add00f` | nested: `Label#506:2595`, `Text#506:2606`, `Status`, `State` (Disabled) |
| `Message` | `b78f4a099bd9fc271f48ae69773244d32bb89fa5` | nested: `Type` Error/Loading/Normal/Success/Warning, `Text#9086:6`. ABSOLUTE top-right for a toast. No close (GAP-046) |
| `Link` | `d925dfcae78e9e80651d0faa3db83b8e42e4e193` | props are on the **nested** instance (`children[0]`): `Text#1917:0`, `Underlined` — not on the wrapper |
| `Divider Horizontal` | `4286955c…` | Horizontal only — no vertical separator for inline links (GAP-045) |
| `Pagination` inside a slot | `f069630f458028668c2705aca4823cb8ef088595` | **Create fresh, don't clone** one from another screen into a slot frame — the clone's text sublayers went stale ("does not exist"). Then `Variant=More`, inner FILL, `Pagination Wrapper` FILL + MAX, count via `Text` `Text#1233:72` |
| Date range placeholder | — | `DatePicker / DatePicker Input / Outlined` `State=Default` shows "Start date / End date" TEXT nodes with no property — override `characters` ("dd/mm/yyyy") |
| `Modal / Basic` Footer Extra | — | Live in UpS Product 2026 as of 2026-10-07: `Show Footer Extra#28898:3` on → the slot holds a `Button / Basic`; set it `Type=Link` |

| `GridTable / Row` created fresh | `2741790d7cffebbd4164191e2e8db43e9b825fad` | Appending a new row straight into an empty `Rows` slot works (Chuyển kho 04). Defaults: `Select#120:350` on (turn off), Cell 1 `Quantity#28666:0` on (turn off), Cell 1 demo text "Túi Đựng Mỹ Phẩm UpB…", `Action Cell` holds a Text button "Cập nhật" — reconfigure it (`Type=Text`, `Danger`, `Icon Only`, trash-2 `63:25138`). Size the cells like the header (Cell 1 FIXED, middle FILL, Action 88) |
| `InputNumber / Basic` | `20c11df22632a8f78d3a7a51d1ae7f0215d15664` | `Size`, `State` (Default…Filled, Disabled), `Number#533:23`. No `Status` — error = Filled + a `Text` Danger SM below (GAP-048) |

### Learned on Đặt hàng (2026-10-07)

| Topic | Notes |
|---|---|
| Fresh `GridTable / Row` width | Arrives FIXED 1200 — set `layoutSizingHorizontal = 'FILL'` in the Rows slot or its divider stops short on wide tables |
| Wide table (horizontal scroll) | Table + every header/row cell FIXED, table wider than its container, container `clipsContent`. A scrolled view = table `layoutPositioning ABSOLUTE` at negative x, container FIXED height (GAP-050) |
| Header help icon | `Header Item` has none — text only (GAP-049) |
| Tab item icon | `Tabs / Tab Item / Basic`: `Icon#…` boolean + an INSTANCE_SWAP key (read it from `componentProperties`); triangle-alert is resident as `36:23131` |
| TableToolbar Global Actions | Booleans don't remove slot buttons (GAP-031) — remove the children and add a fresh `Button / Basic` (props on `children[0]`) |
| DatePicker after a `State` change / in a new field | Hugs again — set the control **and** `DatePicker / DatePicker Input / Outlined` FILL every time |
| Fresh `Form / Vertical` | Label ships `Tooltip=True` — set `Tooltip: 'False'` |
| square-plus icon | UpBase key `d1722d1cc6942fde123723f8e54225e71c460e20`, resident as `20:4630` ("Thêm nhanh hàng hoá") |

### Learned on Xuất nhập 11–13 (2026-10-12, user audit)

| Topic | Rule |
|---|---|
| Bulk-action buttons ("Đẩy đơn hàng loạt", "Hoàn thành hàng loạt", …) | **`Button / Basic` `Type=Default`**, never Primary, even when the reference shows a filled orange button. The page's one Primary is its create action |
| A type switch inside a filter card (Đơn bán / Đơn hoàn) | **`Segmented`** (`2ff626227aac1f2e14f52a8fc1ddd2dd0a5b0bbf`, items `Text#506:3229`, `State` Active/Default; hide unused items), not `Tabs / Basic`. Tabs are for the status views above a table. In the FilterBar's wrapping `Filter` slot, put it in a frame fixed to the slot width (1136) so it takes its own line |
| Table Header padding depends on what sits at its edges | Status Tabs carry their own vertical room (46 tall, text centred), so a **tabs-first** header has padding-top 0 and a **tabs-last** header padding-bottom 0. A **control** (button, text, select) at an edge needs `padding` (16) on that edge. Re-check both edges whenever you reorder or remove a Table Header child: the frame's padding was tuned for its original first and last child |

Row actions with 2–3 visible text actions (Kiểm kho 01–02, user 2026-10-07): `Link`s in the action cell's HORIZONTAL frame, gap `marginXS`, column FIXED to content (links + gaps + 32). A single action stays an icon-only Default Small button.

### Also published (not yet used on screens)

`FilterBar` `f56b30ec024a91b83bbafbba2ab60585d7287b8b` (slots `Filter`, `Action`) · `FilterBar /
Filter Field` Text `d234773c3b1ebd923446475c33be6b0c923cdd1c` / Date
`e65c5ce6f2231a3b623153cc7d47cb8d548f059a` · `TableToolbar` (order-table toolbar: selection, bulk
actions, sort, export) Single Row Plain `b97363c841299aa10aa00fc12f102e3e97dc308c` · `Dropdown`
`a526bb712aece680c5c8137e0d4f4a0137a6f167` · `Dropdown Menu`
`3b1a2c403c12a1dae98893a95452ad369e989daa` · `Segmented` `2ff626227aac1f2e14f52a8fc1ddd2dd0a5b0bbf` ·
`Logo` Logotype Default `82256157a790ef1998df0cb7c7deef039cb8ec98` · `Breadcrumb`
`2268759597ec739481377ca6a983c0c7de04de67` · `Avatar` `a5f78c0b2c4edd2a2b8053894198a769372e489b` ·
`Card / KPI` `766074e4a3fc29781b49f3a4c8f714b6bedbf24e`.

## Finding something not listed

**Component names don't always match page names.** The `❖ IllustratedMessage` page publishes
`Result`; UpBase's `Tabs` is the kit's `TabGroup` page. Before concluding the kit lacks something,
list the components **on the page whose name matches the need**, not just the published names.

The kit publishes ~90 components. To see the live list and keys, use the REST endpoints with the
token in `~/.claude.json` (`mcpServers.figma-console.env.FIGMA_ACCESS_TOKEN`; print only status
codes, never the token):

```
GET https://api.figma.com/v1/files/9c052aEvpV7gYLhwdatf6g/components      → meta.components
GET https://api.figma.com/v1/files/9c052aEvpV7gYLhwdatf6g/component_sets  → meta.component_sets
```

An expired token returns an empty list, not an error — if the list is empty, check
`/v1/me` first. Alternatively enumerate through the plugin in the kit file (read-only):
`findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })` per page, skipping `_` pages.

Then probe an unfamiliar component on a throwaway frame in the product file — create an instance,
read `children[0].componentProperties`, the variant options off
`(await n.getMainComponentAsync()).parent.componentPropertyDefinitions`, and a 3-level layer tree —
and **remove the probe frame in a `finally`**. Add what you learn to this file.
