# Product: UpS Product 2026

> **Scope:** this product file only. Constants and state for building screens in it. A new product
> file gets its own copy of this file.

| | |
|---|---|
| **File key** | `9FAdrUvuA7q0VExwsAxNu6` |
| **URL** | https://www.figma.com/design/9FAdrUvuA7q0VExwsAxNu6/UpS-Product-2026 |
| **Consumes** | UpS UI Kit `9c052aEvpV7gYLhwdatf6g` only (governance decision 2026-09-09) — never UpBase directly, except icon swaps |
| **Kit map** | `references/kit-map-ups.md` |
| **Gap log** | `docs/kit-gaps/ups.md` (repo root) |
| **Local variables / styles** | none — and they can't be imported (the kit publishes no variables). Harvest bound ones, below |

## Pages and sections

The file was restructured on 2026-10-01 — **node ids changed**. Look sections up by name on their
page and re-read ids before trusting anything below.

| Page (id) | Holds |
|---|---|
| `🏠 Kho hàng` (`1:2`) | empty — the module's cover |
| `↳ Specifications` (`40:65227`) | references, faithful rebuilds and anatomy — **this skill's working page** |
| `↳ Playground` (`40:65228`) | `Test / Proposal` (`41:87518`) — Proposal mode output |
| `📦 Đơn hàng` (`40:55288`) | next module group (empty) |
| `_Playground` (`5:175`) | the user's scratch area — don't write here |

Sections on `↳ Specifications`:

| Section | id | Holds |
|---|---|---|
| `Product images` | `40:65229` | The **reference screenshots** — one row per module, a TEXT title above each row. Read-only for this skill |
| `Kho hàng` | `40:65275` | Faithful rebuilds of the Kho hàng module |
| `Xuất nhập` | `40:66009` | Faithful rebuilds of the Xuất nhập module (widened to 17268 for screen 10 + its header spec, 2026-10-08) |
| `Example` | `40:66896` | The user's own anatomy example (callout style reference) |
| `Anatomy / Kho hàng 01` | `40:66919` | Anatomy of screen 01 |
| `Kiểm kho` | `118:21832` | Faithful rebuilds of the Kiểm kho module (moved by the user to y 9746) |
| `Chuyển kho` | `119:49734` | Faithful rebuilds of the Chuyển kho module (y 12952) |
| `Đặt hàng` | `121:67077` | Faithful rebuilds of the Đặt hàng module (y 16158) |
| ~~`Layout / Content max width`~~ | — | **Moved** by the user to its own page `_Global rules` as `_Layout / Content max width` (seen 2026-10-12). Worked example of the content-column cap: note + Xuất nhập 04 (list) and 10 (form), each at 1440 and 1920 |

**One section per module** now holds its rebuilds. A new module gets a new section named after it,
placed so it doesn't overlap the others; screens inside it in a row, 1440 wide with 80 gaps.
Proposal-mode screens go in a section on `↳ Playground`.

## Screen register

Reference images are RECTANGLEs named `image N` in `Product images`. Order = left to right in the row.

### Kho hàng — section `40:65275`

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65230` (image 1) | `40:65276` Kho hàng 01 — Danh sách kho | List; GridTable 8 cols × 6 rows (2026-10-07: + "Thao tác" — `Action Cell` frame per row with `Button / Basic` Default · Small · text "Cập nhật", top-aligned, FIXED 104, on the user's request); Pagination More below the table. Proposal: `41:87519` on `↳ Playground` |
| 02 | `40:65231` (image 2) | `40:65672` Kho hàng 02 — Thêm kho | Create form: 2 Cards; base for 03–07 |
| 03 | `40:65232` (image 3) | `40:65732` · Kho dịch vụ | + supplier/warehouse selects; Tên kho error; no Cấu hình card |
| 04 | `40:65233` (image 4) | `40:65778` · Kho đối tác | same + Cấu hình card |
| 05 | `40:65234` (image 5) | `40:65841` · Kho Smart | as 03 |
| 06 | `40:65235` (image 6) | `40:65887` · Xác nhận quét đóng gói | Modal (title + close kept) over 45% overlay |
| 07 | `40:65236` (image 7) | `40:65949` · Lỗi xác thực | 7 field errors |

### Xuất nhập — section `40:66009`

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65237` (image 8) | `40:66321` Xuất nhập 01 — Nhập kho · Chờ duyệt | Empty table with `IllustratedMessage` S · Empty; fixed 1024 viewport |
| 02 | `40:65238` (image 9) | `40:66010` Xuất nhập 02 — Nhập kho · Chờ nhập | **Base for 01/03/04.** Page Tabs · FilterBar (column grid 562/275, empty Action slot hidden) · TableToolbar Card · Status Tabs · GridTable 8 cols (no Card, no title) |
| 03 | `40:65239` (image 10) | `40:66373` · Đã nhập | + Sub Filters row (Segmented, "Đã chọn: 0", disabled bulk button) above the table, checkbox column |
| 04 | `40:65240` (image 11) | `40:66637` · Chênh lệch sau nhập | + Pagination More under the table |
| 05 | `40:65241` (image 12) | `40:66268` Xuất nhập 05 — Tạo phiếu nhập kho | Form: 2 Cards (2-column fields; scan row + product GridTable), white action bar |
| 06 | `40:65242` (image 13) | `63:21975` Xuất nhập 06 — Tạo phiếu nhập kho · Thêm nhanh sản phẩm | 05 + overlay + `Modal / Basic` Slot 1030: info row, search, "Đã chọn", Link, 3×2 kit `Product Card` Selected=False (GAP-040 resolved 2026-10-07), Pagination More |
| 07 | `40:65243` (image 14) | `63:22028` · Có sản phẩm | 05 with 6 product rows: cell Image + name (2 lines) / SKU / variant · ĐVT · Tồn kho · `InputNumber` · Text Danger trash button. Sản phẩm 337 (SKU 251 + image), others FILL, all left-aligned (alignment rule, 2026-10-02 — was centred) |
| 08 | `40:65244` (image 15) | `63:22081` Xuất nhập 08 — Nhập kho · Tải phiếu nhập kho | 01 + overlay + `Modal / Basic` Slot 750: 7 `Form / Vertical` fields (2026-10-02, user redesign — was `Form / Horizontal`, which overlapped "Hình thức nhập kho", GAP-041): rows Kho · Hình thức nhập kho / Ghi chú (Textarea 0/255) / Loại sản phẩm · Loại trạng thái / Nhãn hàng / Tải tập tin lên (Drag and Drop + field Caption "File nhập có dung lượng…"). Pair rows HORIZONTAL, gap `padding`; Form gap `paddingLG`, no 120 gutter. Footer Hủy · Đồng ý (disabled); modal re-centred (y 172, 680 tall). **Pending:** "Tải file mẫu tại đây" (`Button / Basic` `Type=Link`) goes in the footer's `Footer Extra` slot (left) once the UpBase Modal update is published → accepted in the kit → kit published → accepted here; the "Tải excel mẫu" field is already removed |
| 09 | `40:65245` (image 16) | `63:22135` Xuất nhập 09 — Lịch sử xuất phiếu nhập | Shell from 05 · `Button` Link back · GridTable 5 cols × 13 rows, standard (no column dividers — `Bordered=False`, 240 / FILL ×3 / 88), every column left-aligned, header and cells (alignment rule), "Thu gọn" = `Link`, `Tải file` = `Button / Basic` Default · Icon Only · Small + download (2026-10-02: both changed from the reference on the user's instruction). Main bottom padding 76 keeps the FloatButton below the table |
| 10 | `144:80237` (image 41, 1720×1548, added 2026-10-08) | `145:80241` Xuất nhập 10 — Chi tiết phiếu nhập kho · Đã nhập | Read-only detail of a received slip. Clone of Kiểm kho 08, Form Actions and "Tải file" removed. Breadcrumb Quản lý kho / Xuất nhập kho / GRN12382026-00000235. Card 1: `Show Extra` on, kit `Tag` Status=Success "Đã nhập" in the `Extra` slot right after the title (GAP-044 resolved); fresh `Form / Vertical` ×8, every control `State=Disabled` on its inner input — Left Kho · Hình thức nhập kho · Loại trạng thái · Thời gian nhận hàng dự kiến (DatePicker text node overridden "08/10/2026 00:00"); Right Mã phiếu nhập kho (Text) · Loại sản phẩm · Nhãn hàng · Ghi chú (Textarea 0/255). Card 2: search "Tên/SKU" · Tabs Tất cả (3) · Khớp (3) · Lệch (0) · GridTable 9 cols 240 / FILL / FILL / Ngày sản xuất · Hạn sử dụng min 112 / Số lượng cần nhập min 182 (`InputNumber` `Type=Spinner`, inner `State=Disabled`, value text node "30" — no Number property) / FILL ×3; Số lượng thực tế is plain `Text` "30", Chênh lệch `Text` Strong, Ghi chú empty. 3 rows, thumbnails cropped from the reference into the `Image` fill. Search and tabs stay enabled (user, 2026-10-08). **Spec:** `160:38969` Xuất nhập 10 · Card header states, right of the screen — 5 `Card / Basic` heads, one per status tab: Chờ duyệt Default · Chờ nhập Processing · Đã nhập Success · Chênh lệch sau nhập Error · Đã đóng PO Default |
| 11 | `194:122986` (image 42) | `196:124046` Xuất nhập 11 — Đẩy sang KiotViet · Đơn bán · Chưa đẩy đơn | **Base for 12/13** (built 2026-10-12). Clone of 03: TableToolbar + Segmented removed, page tab Đẩy sang KiotViet active, fresh `Tabs / Basic` "Order Type Tabs" (Đơn bán · Đơn hoàn, fill cleared, 1136 so it wraps onto its own line) first in the FilterBar `Filter` slot; date 06/10/2026 00:00 → 12/10/2026 23:59. Table Header: bulk row first (`Button` Primary Disabled "Đẩy đơn hàng loạt" + `Text` Default "Đã chọn: 0"), then Status Tabs Chưa đẩy đơn (3) · Đẩy đơn lỗi (0) · Đẩy đơn thành công (0). Cols checkbox / Thông tin mã 240 / Số lượng (Stacked Cell, established — the reference has inline "label: **value**") / Thông tin kho / Trạng thái / Thời gian min 151 / Thao tác 88 Dropdown Icon. 3 rows; Pagination More "Hiển thị 1 - 3 của 3" (cloned from 04) |
| 12 | `196:122992` (image 43) | `196:126677` · Đẩy đơn lỗi | 11 with tabs (2)/(1)/(0), 1 row: Trạng thái `Text` Danger "Đẩy đơn lỗi", Thời gian đẩy đơn 12/10/2026 09:40, then `Alert` Error Banner "Kho không phải là kho đối tác" in the Rows slot (GAP-051). Pagination "1 - 1 của 1". Fixed 1024 viewport |
| 13 | `196:122995` (image 44) | `196:128792` · Đẩy đơn thành công | 11 with tabs (1)/(2)/(0), no bulk button ("Đã chọn: 0" kept), `Select` FILL "Đẩy trạng thái đơn sang đã chuyển" under the tabs, no checkbox column, `IllustratedMessage` S "Chưa có phiếu xuất kho" (as 01), no pagination. Fixed 1024 viewport |

**A Đặt hàng image 43** (`194:122989`, a duplicate of Đặt hàng 06 with dates 13/09 → 12/10) appeared and was deleted by the user on 2026-10-12 — not built.

### Kiểm kho — section `118:21832` (built 2026-10-07)

Placed at y 10400, below `Xuất nhập` and clear of the user's note text at y 10271. Screens numbered by
canvas x: image 24 sits left of image 23, so 07 = image 24 and 08 = image 23.

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65246` (image 17) | `118:21833` Kiểm kho 01 — Danh sách · Chờ kiểm kho | Clone of Xuất nhập 02, no page tabs/TableToolbar; `Page Actions` (Kho hàng 01) "Thêm yêu cầu kiểm kho"; FilterBar column grid: Mã kiểm kho (Text Filter, 562) · Chọn nhãn quản lý · Nhập tags / Thời gian tạo (Date, 562, "dd/mm/yyyy" placeholders). Table Card: Tabs (14/5/101) + GridTable 7 cols 240/FILL×4/Thời gian min 145/Thao tác 178 = 3 `Link`s (Bắt đầu · Cập nhật · Xóa, user 2026-10-07). 9 rows (10th cut off). Main bottom padding 76 |
| 02 | `40:65247` (image 18) | `118:27004` · Đang kiểm kho | 01 + 6 rows, links Kiểm kho · Nhập excel · Kết thúc (col 229), Pagination More below the card "1 - 6 của 6" |
| 03 | `40:65248` (image 19) | `118:30056` · Đã hoàn tất | 01 + "Sản phẩm đã kiểm", 9 rows, Thao tác 88 = icon-only Default Small `eye` button |
| 04 | `40:65249` (image 20) | `118:34409` Kiểm kho 04 — Tạo phiếu kiểm kho | Clone of Xuất nhập 05, card 2 removed. Fixed 1024 viewport. Card "Thông tin phiếu": Left Kho thực hiện (Select) · Loại kiểm kho · Cách thức kiểm kho (Radio Group, 3rd radio hidden); Right Nhãn hàng · Tag (Select Multiple, Filled, 1 item — GAP-047). Form Actions Hủy bỏ · Tạo phiếu |
| 05 | `40:65250` (image 21) | `118:36284` Kiểm kho 05 — Chi tiết phiếu · Chờ kiểm kho | **Base for 06–09.** Kho hàng expanded, nothing active. Card 1 + Mã kiểm kho (Input Disabled), radios Disabled, `Tag / Status` Default "Chờ kiểm kho" in the card's `Extra` slot (`Show Extra` on; moved from head Actions 2026-10-08, GAP-044 resolved; 08 = Processing "Đang kiểm kho"). Card 2 "Sản phẩm kiểm kho": Toolbar (search 404 · Tải file + cloud-upload · Thêm nhanh sản phẩm), table Sản phẩm 337 / Đơn vị tính / Tồn thực tế / Thao tác 88, `IllustratedMessage` S Empty + Primary action, footer count. Quay lại · Bắt đầu kiểm kho (Disabled) |
| 06 | `40:65251` (image 22) | `118:38310` · Thêm nhanh sản phẩm | 05 (collapsed sidebar) + Xuất nhập 06's overlay + modal: + Filters row (Loại sản phẩm · Loại trạng thái), "Đã chọn: 24", 6 `Product Card` Selected=True, pager 1 page, footer Hủy · Chọn tất cả theo điều kiện lọc (24) · OK (Third Button) |
| 07 | `40:65253` (image 24) | `118:41363` · Theo lô · Có sản phẩm | 05 with Xuất nhập 07's product card. Card 1 **inferred** from list row SCN-1291-20260911-2466 (Kho loại 1, Nhãn hàng mặc định, Theo lô) + disabled Checkbox "Thêm các hạn sử dụng đã bị hết tồn"; Tag left empty. Table 6 cols, lots as stacked `Text` + `Divider` (GAP-043). Pagination More inside the card (fresh instance — a cloned one went stale in the slot). `Message` Success toast top-right |
| 08 | `40:65252` (image 23) | `118:44417` · Đang kiểm kho | 07 restructured: card 1 from 05, `Tag / Status` Processing "Đang kiểm kho"; Toolbar search + Tải file; Tabs Tất cả (24) · Chưa kiểm (24) · Khớp (0) · Lệch (0); cols Sản phẩm 337 / ĐVT / Tồn thực tế / Số lượng thực tế (InputNumber, min 122) / Lệch / Ghi chú 320 (Form / Vertical Textarea, label off, 0/255). 4 rows (the cut-off first row left out). Quay lại · Lưu lại · Kết thúc kiểm kho |
| 09 | `40:65254` (image 25) | `118:47161` · Nhập file sản phẩm | 05 with this reference's values + Xuất nhập 08's overlay + modal (750): only "Tải tập tin lên" Drag and Drop + caption; **Footer Extra** on with `Button` Link "Tải file mẫu tại đây" (the Modal update has reached this file); Thoát · Đồng ý (Disabled) |

### Chuyển kho — section `119:49734` (built 2026-10-07)

Placed at y 12952 (806 below `Kiểm kho`, which the user moved to y 9746).

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65255` (image 26) | `119:49735` Chuyển kho 01 — Danh sách · Chờ duyệt | Clone of Xuất nhập 01 (1024 viewport), page tabs + TableToolbar removed; Page Actions Nhập file (Default) · Tạo phiếu chuyển kho; FilterBar Thời gian tạo phiếu (filled range) · Kho chuyển / Mã phiếu chuyển kho · Kho nhận / Chọn nhãn quản lý (wide, alone); 5 status tabs; 7 header cols; `IllustratedMessage` "Chưa có phiếu chuyển kho" |
| 02 | `40:65256` (image 27) | `119:51293` · Tải phiếu chuyển kho | 01 + Xuất nhập 08's overlay + modal relabelled: Kho chuyển · Kho nhận / Nội dung chuyển kho / Loại sản phẩm · Trạng thái hàng hoá / Nhãn hàng / Tải tập tin lên (200 bản ghi); Footer Extra Link "Tải file mẫu tại đây"; Hủy · Đồng ý (Disabled) |
| 03 | `40:65257` (image 28) | `119:52964` Chuyển kho 03 — Tạo phiếu chuyển kho | Clone of Xuất nhập 05. Breadcrumb 2 levels (middle link + separator hidden). Kho hàng expanded, Chuyển kho active. 6 new `Form / Vertical` fields (5 required); Textarea 0/255. Scan row kept, Thêm nhanh sản phẩm Disabled; table Sản phẩm 337 / Tồn kho sẵn sàng / Số lượng chuyển kho / Ghi chú / Thao tác 88; `IllustratedMessage` S, no action. Hủy bỏ · Lưu lại (Default, Disabled) · Duyệt phiếu (Primary, Disabled) — user 2026-10-07: one primary per bar |
| 04 | `40:65258` (image 29) | `119:54894` · Có sản phẩm | 03 + Agency-0003 / Kho Đà Nẵng, actions enabled. Fresh `GridTable / Row` in the Rows slot (Select off, Quantity off): Cell 1 image + name / SKU / variant + extra `Text` Secondary "Cái" (Unit) · 0 · `InputNumber` "--" · Textarea label off 0/255 · Text Danger trash. Fresh Pagination More inside the card, table Footer off |
| 05 | `40:65259` (image 30) | `119:56463` · Lỗi số lượng | 04 with "(LẦN 2) SPK trùng SKU…" / Hộp; InputNumber Filled "0" + `Text` Danger SM caption (GAP-048) |

### Đặt hàng — section `121:67077` (built 2026-10-07)

Placed at y 16158 (806 below `Chuyển kho`).

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65260` (image 31) | `121:67078` Đặt hàng 01 — Danh sách · Chờ duyệt | **Base for 02/06.** Clone of Xuất nhập 02. Page Tabs Đặt hàng · Đẩy sang Vietfull; FilterBar Thời gian tạo (placeholders "dd/MM/yyyy HH:mm") · Kho / Mã phiếu "Nhập mã phiếu đặt hàng" · Hình thức / Chọn nhãn quản lý (wide, alone). TableToolbar Global Actions = fresh `Button` Default "Nhập file" + Primary "Thêm phiếu đặt hàng" (Export/History/Divider removed — booleans don't reach the slot, GAP-031). 5 status tabs, 5th with triangle-alert. 8 cols: Mã phiếu 240 / Số lượng / Kho (Kho: + Nhãn hàng: pairs — merged column) / Hình thức / Thời gian (tạo only) / Trạng thái nhập kho (empty) / Tài khoản thao tác / Thao tác 88 `Dropdown` Icon. 4 rows; Pagination More below; Main bottom padding 76 |
| 02 | `40:65261` (image 32) | `121:72145` · Thêm PO theo file | 01 at 1024 + Chuyển kho 02's overlay + modal (750, y 172): Kho · Hình thức nhập kho / Trạng thái hàng hóa · Nhãn hàng / Nhà cung cấp · Thời gian nhận hàng dự kiến (DatePicker FILL) — Selects `State=Filled` with values; Ghi chú Textarea 0/255; Tải tập tin lên (2MB / 200 bản ghi). Footer Extra Link "Tải file mẫu tại đây" (reference: a "Tải excel mẫu" field); Hủy · Đồng ý (Disabled) |
| 03 | `40:65262` (image 33) | `121:75138` Đặt hàng 03 — Tạo phiếu đặt hàng | **Base for 04/05.** Clone of Chuyển kho 03. Main → `Content Row` (HORIZONTAL, gap `padding`): `Left Column` (2 cards) + `Card / Basic` "Thông tin thanh toán" FIXED 312 (Summary frame, gap `paddingSM`: 4 Label/Value `Text` rows · Divider · total row). Card 1: Left Kho · Hình thức nhập kho · Ghi chú; Right Trạng thái hàng hóa · Nhãn hàng · Nhà cung cấp · fresh DatePicker field. Card 2: search `Input` 404 "Tên/SKU" + Primary "Thêm nhanh hàng hoá" (square-plus `20:4630`), SPACE_BETWEEN; table 4 cols (Đơn giá min 186, right-aligned), Footer off, `IllustratedMessage` "Chưa có hàng hóa". Huỷ bỏ · Lưu lại · Duyệt phiếu (enabled) |
| 04 | `40:65263` (image 34) | `123:77326` · Có sản phẩm | 03 with a 7-col table FIXED 1407 (337/120/200/200/200/230/120) clipped by the card `Body` — horizontal scroll at 0 (GAP-050). Fresh `GridTable / Row` ×5 (Select off, rows FILL): Cell 1 image + name (1 line, truncated) / SKU / variant · ĐVT · Đơn giá `Input` Filled "0" suffix đ · `InputNumber` "--" · Tiền chiết khấu "0" đ · Thành tiền placeholder "Nhập thành tiền" đ · Thuế suất 8/8/8/0/10. Money/rate headers right-aligned |
| 05 | `40:65264` (image 35) | `123:81203` · Lỗi số lượng | 04 + `Text` Danger SM "Vui lòng nhập số lượng hàng hóa" under each Số lượng (GAP-048). Table ABSOLUTE at x −565 in the clipping `Body` (FIXED 639) to match the reference's scroll position. Rows 6–7 of the reference left out (product names never visible) |
| 06 | `40:65265` (image 36) | `121:69707` Đặt hàng 06 — Đẩy sang Vietfull | 01 at 1024, Đẩy sang Vietfull tab active, TableToolbar + Pagination removed. Date filled 29/08/2026 00:00 → 27/09/2026 23:59. Tabs Đẩy đơn thành công (0) · Đẩy đơn lỗi (0). Header Control (checkbox, resident UpBase `Table / Table Item / Header Control`, as Xuất nhập 03) + Thông tin mã 240 / Số lượng / Thông tin kho / Thời gian / Thao tác 88; `IllustratedMessage` S "Chưa có phiếu nhập kho" |

Column widths (rule in `kit-map-ups.md`, applied 2026-10-02; GridTable 1168 wide): first column
FIXED 240 (longest GRN code 159 + 32 → floor) · middle columns FILL · Thời gian min 151 · Tài khoản
min 142 · Thao tác FIXED 88. Result: 240/137×4/151/142/88; with the checkbox column
48/240/125×4/151/142/88. Kho hàng 01: 240/127×4/Cấu hình min 188/127/Thao tác 104 (text button 72 + 32). Xuất nhập 05 products:
240/263×3/88.

### Nhà cung cấp — section `126:84175` (built 2026-10-07)

Placed at y 19364 (806 below `Đặt hàng`). All three at a fixed 1024 viewport, Body FILL.

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| 01 | `40:65266` (image 37) | `126:84176` Nhà cung cấp 01 — Danh sách | Clone of Kho hàng 01. Kho hàng expanded, Nhà cung cấp active. Page Actions "Thêm nhà cung cấp"; search "Tìm tên nhà cung cấp". GridTable 6 cols (Header 4/6 + Cell 4/6 removed): Tên nhà cung cấp 240 (Code line hidden) / Số điện thoại / Địa chỉ / Số phiếu nhập / Cấu hình mặc định (`Switch / Basic` — props on `children[0]`) / Thao tác 104 `Button / Basic` Default Small "Cập nhật" (Kho hàng 01 convention, not the reference's text link). 2 rows; Pagination "Hiển thị 1 - 2 của 2" |
| 02 | `40:65267` (image 38) | `126:84585` Nhà cung cấp 02 — Thêm nhà cung cấp | Clone of Kho hàng 02, `Cấu hình` card removed. Card "Thông tin nhà cung cấp": Tên nhà cung cấp* 0/160 · Mã nhà cung cấp* 0/35 / Số điện thoại* (no counter) · Địa chỉ (Type → Textarea, optional, 0/225). Breadcrumb 3 levels. Hủy · Lưu lại |
| 03 | `40:65268` (image 39) | `126:86753` Nhà cung cấp 03 — Danh sách · Thêm thành công | 01 + duplicated "test" row (3 rows), "Hiển thị 1 - 3 của 3", fresh `Message` Success "Thêm nhà cung cấp thành công" ABSOLUTE top-right (y 12, 24 from right) — no close (GAP-046) |

All modules in `Product images` are now rebuilt. Ids read 2026-10-01 after the restructure.

## The shell every screen shares

Clone a finished list (e.g. Xuất nhập 02 `40:66010`) or form (Kho hàng 02 `40:65672`) rather than rebuilding it. What's configured on it:

| Part | Configuration |
|---|---|
| Screen frame | 1440 wide, VERTICAL auto-layout, `clipsContent`, fill bound to `colorBgLayout`. List screens in Proposal use a fixed 1024 viewport height with `Body` FILL |
| `PageHeader` | `Breadcrumb` links: first = `Quản lý kho`, middle hidden links can be shown for deeper pages, last (`State=Current`) = page name. Separator is `/` (UpBase; product uses `>` — GAP-005) |
| `Body` | HORIZONTAL: `Menu / Sidebar` (Rail + Panel, FILL height) + `Main` (VERTICAL, **padding `paddingLG` 24** on all sides — raised from 16 on 2026-10-14, all screens; screens whose bottom is a raw 76 keep it, as that is FloatButton clearance, not page padding). Gap: see the `Alert` → `Content` row. **Page panels are bordered + elevated** (user, 2026-10-13 — reverses the 2026-10-01 flat style): 1px `colorBorderSecondary` + effect style `boxShadowTertiary` (`S:40ff9640ffba8b9b5cd95457084734ecbd8518b0,19268:1`) on FilterBar, TableToolbar, `Card / Basic`, Form Actions, page-level GridTable and every `Table Card` frame (stroke INSIDE, `strokesIncludedInLayout = false`). TableToolbar, Form Actions and the Card shadow come from the kit; FilterBar, Card stroke and page-level GridTable carry overrides set to the main's values (can't be un-overridden without wiping slot content). The GridTable inside a Table Card stays strokeless; the Alert keeps its border |
| `Alert` → `Content` gap | **`Main` = `Alert` + `Content`, gap `paddingLG` 24** (user, 2026-10-14 — the connection alert is unrelated to the page, so it sits further from the content than the blocks are from each other; tried `paddingXL` 32 first, reduced to 24 the same day). `Content` is a VERTICAL frame, FILL width, no fill, gap `padding` 16, holding every page block (Đặt hàng 03–05's `Content Row` included). Applied to all 43 screens on `↳ Specifications`. `paddingXL` id `VariableID:30367572db1e6d3369e645d6d0770383d4fb7320/28331:735` (harvested via `Components/Menu/Global/paddingXL`) |
| `Content` (new screens) | Inside `Main`: one VERTICAL frame holding every page block, FILL width, `maxWidth` = `Size/Layout/contentMaxWidth` 1440, gap `padding`; `Main` counter-axis CENTER. Below a 1712 viewport nothing changes; above it the column centres. Only the `Layout / Content max width` examples carry it so far — existing screens are 1440 and unaffected. Raw 1440 until UpBase publishes the token and this file accepts it, then bind (harvest it off those frames) |
| Sidebar rail | 5 items: house · chart-column · clipboard-list (**Active** — the Kho hàng module) · grid-2x2-plus · settings (footer) |
| Sidebar panel | 11 Submenus in the `Items` slot: Sản phẩm, Khuyến mãi, Đơn hàng, Tồn kho, **Kho hàng**, Tài chính, Khách hàng, Quảng cáo, Tiếp thị liên kết, Tích điểm, Website. On list pages Kho hàng is `Active=True` with children Kho hàng (Active) · Xuất nhập · Kiểm kho · Chuyển kho · Đặt hàng · Nhà cung cấp; on form pages all groups are collapsed |
| `Alert` | `Type=Error`, `Description=False`, closable, text `Gian hàng lluull bị mất kết nối. Vui lòng đến Kênh bán để kết nối lại.` — nested instance set FILL or it stays 640 |
| `FloatButton` | ABSOLUTE, `Type=Primary`, `Shape=Circle`, `Badge=Small`, icon message-circle-more; 24 from the right, 16 above whatever sits at the bottom-right (footer actions, pagination) so it covers nothing |

## Harvested tokens

The product file can't import variables, but kit instances carry UpBase variables and
`getVariableByIdAsync` resolves them. These ids were harvested 2026-09-28 — re-harvest with
`scripts/harvest-tokens.js` if one fails to resolve.

| Token | Value | Variable id |
|---|---|---|
| `Colors/Neutral/Bg/colorBgLayout` | page background | `VariableID:0696e84269829fa8f0bcc12d89c12be3206b6a79/28318:1148` |
| `Colors/Neutral/Bg/colorBgContainer` | white | `VariableID:f7dba0e0eaed43561a550d8d0add1c2754eaf040/28318:1146` |
| `Space/Padding/padding` | 16 | `VariableID:23e55bd04887c148a9b21d5d2c964e36098946d7/28331:731` |
| `Space/Padding/paddingXL` | 32 | `VariableID:30367572db1e6d3369e645d6d0770383d4fb7320/28331:735` |
| `Space/Padding/paddingLG` | 24 | `VariableID:83b8885d301391906322ff84fa7a00f9bed12eae/28331:732` |
| `Space/Padding/paddingSM` | 12 | `VariableID:4be5ec13941455bf5b9f165f1624368444b8a32c/28331:734` |
| `Space/Margin/marginXS` | 8 | `VariableID:5e0fcee84e18f070cf475c56d0e3405913f47687/28331:728` |
| `Space/Margin/marginXXS` | 4 | `VariableID:cc29edeb44c0abe6dc32357c01d0536efa351308/28331:730` |

Not reachable: `colorBgMask` (the modal overlay is raw black at layer opacity 0.45 — GAP-022).

## UpBase icons used (imported by key)

The kit publishes no icons. These are swapped into kit components' own instance-swap properties:

| Icon | Key | Used for |
|---|---|---|
| chart-column | `088d2ae27359b596d203009ff846ac31d953a0c6` | rail |
| clipboard-list | `d437ec879bab4efe9604776a00303c86ebb35ddc` | rail (active) |
| grid-2x2-plus | `6b16fa4e8f7a3b1930a8851c9e05db0d6d5c4e7c` | rail |
| settings | `2533711c9fd41466412371cc9fd5ae0dd55223fa` | rail footer |
| message-circle-more | `34188ead557fad78c84a95110e586c1273438fb9` | FloatButton |
| ellipsis | `dd58c157d482268c94a01ddc1ce5713f8402eeee` | row "more" button |
| pencil | `d08599876f01fd3b89e793e8316094f2e64b3665` | (available) |
| eye | `8b40e6f105f61e6e910edf9e93c77bc3e38d08d7` | "Chi tiết" row action (Kiểm kho 03) |
| cloud-upload | `7ecea763b4c76616515e900a2f9521d8f3520a37` | "Tải file" button |
| trash-2 | `118023cd41512c0e3f176cfa07a6ee9985202536` | (resident via Xuất nhập 07) |
| upload | `473d77b2b090dcff38d5948a26b6087b57c14ba9` | (available) |

Icons already resident in the file (search, info, house, mail, x, chevrons…) can be found by node
id from any instance: `(await inst.getMainComponentAsync()).id` — use those before importing.
