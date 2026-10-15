# Example: the four files, filled in for UpS (shortened)

> **What this file is.** A short, filled-in version of each template in this folder, using UpS's
> real values. When a template field is unclear, look here. **Don't copy the values**: keys, node
> ids and decisions are UpS's own. The full UpS files are in the skills repo under `examples/ups/`.
> This file is not copied by `init`; it stays here as a reference.

## `kit-build.md`

| | |
|---|---|
| **File key** | `9c052aEvpV7gYLhwdatf6g` |
| **File name** | UpS UI Kit |
| **Consumes** | UpBase Design System, `BoGaG48v9BfY7LkMtFs4zh` |
| **Published as a library** | Yes. UpS Product 2026 subscribes to it |
| **Product files subscribe to** | this kit only (decided 2026-09-09) |
| **Platform reach** | Web and Mobile |
| **Owner** | Dat Vu |
| **Changelog page** | `_Changelog` (`0:1`) |

**Decisions to make once**: wrappers keep UpBase's exact name (`Button / Basic`), and the nested
layer does too. A wrapped-atom page has 2 nodes; a composition page uses the full kit template. The
template page is `❖ Form` (`5:20`). The docs header is `_Docs / Page Header` (`31:48804`).

**Status** (two rows of many):

| Page | Holds | Kind |
|---|---|---|
| `❖ Form` | `Form / Vertical` · `Form / Horizontal` · `Form / Inline` · `Form Actions` | wrappers + 1 composition |
| `❖ GridTable` | `GridTable` (Platform × Mode × Size, 12) · `GridTable / Row` (12) | compositions |

**Notes** (one of many): *`Chart` wrapper: FIXED wrapper + FILL nested instance. Mirroring the
source's sizing gave a chart that couldn't stretch past 648px.*

## `kit-usage.md`

| Screen region | Use | Notes |
|---|---|---|
| Record list | `GridTable` + `GridTable / Row` | Already a card: place it directly in Main. Never wrap it in `Card / Basic`; no table title |
| Pagination | `GridTable` `Footer` on → nested `Pagination`, `Variant=More` | Inside the table card (agreed 2026-10-13) |
| Single row action | `Button / Basic` Default · Icon Only · Small | Not a Primary text button per row (agreed 2026-10-02) |

**Table rules**: header and cells left-aligned together; decimal numbers right. The first column is
fixed from its longest identifier; the middle columns FILL with a content `minWidth`.

| Component | Key | Properties |
|---|---|---|
| `Alert` | `d1f39662…` | `Type` Error/Info/Success/Warning · `Title text#508:49` · `Close Icon#508:43` |

## `product-file.md`

| | |
|---|---|
| **File key** | `9FAdrUvuA7q0VExwsAxNu6` |
| **Consumes** | UpS UI Kit `9c052aEvpV7gYLhwdatf6g`, never UpBase directly except icon swaps |
| **Kit probe key** | `ad019f1790ab546845e50debf54d2bc5a710a6bf` (UpS `Button / Basic`) |
| **Changelog page** | `Changelog` (`214:220882`) |

| Page / section | Holds |
|---|---|
| `↳ Specifications` | references, faithful rebuilds and anatomy: the skill's working page |
| `↳ Specifications` › `Product images` | reference screenshots, read-only |
| `↳ Playground` | Proposal-mode output |

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65230` | `40:65276` Kho hàng 01 — Danh sách kho | List; GridTable 8 cols, pager inside the card |

**Shell**: clone Xuất nhập 02 (`40:66010`) for a list or Kho hàng 02 (`40:65672`) for a form. 1440
wide, `Main` padding `paddingLG`, panels bordered + `boxShadowTertiary`.

## `gap-log.md`

```
### GAP-002 · GridTable rows, columns and row cells were fixed layers
- Seen:         Kho hàng 01 (7 columns × 6+ rows)
- Component:    UpS `GridTable`, `GridTable / Row`
- Workaround:   —
- Proposed fix: `Rows`, `Columns` and `Cells` SLOTs (Mode=Default)
- Status:       published — 2026-09-28
```
