# Hướng dẫn: bộ skill UpBase cho Claude Code

Tài liệu dành cho người sẽ dùng và bảo trì bộ skill này. Đọc phần 1 và 2 là đủ để bắt đầu. Phần 3 là
danh mục từng file: mỗi file tồn tại để làm gì, giải quyết vấn đề gì, đọc hoặc chạy lúc nào, và kết
quả trông như thế nào.

Cài đặt và cấu hình: [README.md](README.md) · [SETUP.md](SETUP.md). Lịch sử thay đổi:
[CHANGELOG.md](CHANGELOG.md).

**Mục lục**
1. [Bức tranh tổng](#1-bức-tranh-tổng)
2. [Các luồng công việc](#2-các-luồng-công-việc)
3. [Danh mục file](#3-danh-mục-file)
4. [Script nào an toàn để chạy](#4-script-nào-an-toàn-để-chạy)
5. [Bảo trì bộ skill](#5-bảo-trì-bộ-skill)
6. [Câu hỏi thường gặp](#6-câu-hỏi-thường-gặp)

---

## 1. Bức tranh tổng

### Vấn đề bộ skill giải quyết

Claude có thể đọc và ghi vào file Figma thông qua plugin, nhưng Figma API có rất nhiều cái bẫy **im
lặng**: lệnh chạy thành công, báo cáo nói "ổn", còn canvas thì sai. Hệ thống UpBase lại có những quy
ước riêng (tầng token, 20 text style, cách đặt tên, cách wrap component) mà nếu không biết thì rất dễ
làm sai và tốn công sửa. Bộ skill gói những quy ước và bài học đó lại, để Claude làm đúng ngay từ đầu,
dừng lại hỏi đúng lúc, và tự kiểm tra kết quả.

### Ba skill, ba loại file

```
UpBase Design System ──publish──▶ UI kit của sản phẩm ──publish──▶ file thiết kế sản phẩm
design-system-builder               ui-kit-builder                   product-screen-builder
```

| Skill | Ghi vào | Dùng khi |
|---|---|---|
| `design-system-builder` | file **UpBase Design System** (`BoGaG48v9BfY7LkMtFs4zh`) | thêm hoặc sửa component, token, style **mà mọi sản phẩm đều dùng** |
| `ui-kit-builder` | **UI kit** của một sản phẩm (ví dụ UpS UI Kit) | wrap một component UpBase vào kit, hoặc ghép một component riêng của sản phẩm |
| `product-screen-builder` | **file thiết kế sản phẩm** (ví dụ UpS Product 2026) | dựng lại màn hình từ ảnh, vẽ anatomy, làm phiên bản đề xuất (redesign) |

Mỗi skill nhận ra file mình được phép ghi qua **file key** (22 ký tự sau `figma.com/design/` trong
link). Gặp file không thuộc về mình, skill sẽ chỉ sang skill đúng. Gặp file chưa đăng ký, skill dừng
và đề nghị đăng ký. Skill không bao giờ đoán.

`skills/_shared/` không phải một skill. Đây là thư mục chứa tài liệu và script mà cả ba skill cùng
dùng.

### Một vòng lặp chung

Cả ba skill đi theo cùng một vòng:

```
Kiểm tra (chỉ đọc) → Đề xuất → DỪNG chờ duyệt → Build → Verify → Ghi changelog → Bàn giao
```

- **Kiểm tra**: xác định đúng file, chạy preflight, tìm xem thứ cần làm đã có chưa.
- **Đề xuất**: viết trong chat, có tính số variant trước → sau. Claude **không build gì** cho tới khi
  bạn duyệt.
- **Verify**: chụp ảnh, chuyển density Default/Compact, kiểm tra tràn layout, kiểm tra token.
- **Changelog**: ghi một entry lên trang `_Changelog` / `Changelog` của chính file đó, kèm một
  version có tên.
- **Bàn giao**: nêu rõ cái gì đã verify (có số liệu), cái gì cố ý để raw, cái gì cần bạn quyết.
  **Publish luôn là việc của người**, skill không publish.

### Dữ liệu sản phẩm: bộ nhớ nằm trong repo của team

Bộ skill **không chứa dữ liệu của sản phẩm nào**. Mỗi team giữ dữ liệu sản phẩm trong **repo thiết kế
của mình**, tức là repo mà team mở Claude để làm việc, ở thư mục `upbase/<sản phẩm>/`:

```
<repo của team>/
  upbase/
    uplms/
      kit-build.md      sổ tay dựng kit: file key, platform, người duyệt, các quyết định, đã dựng gì, vì sao
      kit-usage.md      hướng dẫn dùng kit trên màn hình: vùng màn hình → component nào, set property gì
      product-file.md   file thiết kế sản phẩm: page, các màn đã dựng, phần shell chung, token, icon
      gap-log.md        những gì kit chưa làm được cho màn hình
```

**Vì sao để trong repo của team chứ không để trong skill:** các file này là **bộ nhớ sau mỗi lần
build**, và skill tự cập nhật chúng ở cuối mỗi phiên. Để trong repo thì cả team dùng chung một bản qua
git, có lịch sử để quay lại khi cần, và việc cập nhật bộ skill không bao giờ đụng tới dữ liệu.

**Skill nào đọc và ghi file nào:**

| File | `ui-kit-builder` | `product-screen-builder` | `design-system-builder` |
|---|---|---|---|
| `kit-build.md` | đọc ở Step 0, ghi *Status* và *Notes* ở cuối phiên | — | đếm các thư mục `upbase/*/` để biết kit nào bị ảnh hưởng khi có thay đổi breaking |
| `kit-usage.md` | ghi khi thêm hoặc đổi component (key, property, cách dùng) | đọc ở Step 0 và 3; ghi khi người dùng chốt một quy tắc mới | — |
| `product-file.md` | — | đọc ở Step 0; cập nhật *Screen register* ở cuối phiên | — |
| `gap-log.md` | đọc trước khi đề xuất; đánh dấu đã sửa | ghi gap mới khi kit chưa làm được | — |

`gap-log.md` và `kit-usage.md` là **chỗ hai skill bàn giao cho nhau**. Dựng màn hình mà gặp chỗ kit
thiếu thì ghi gap, người dựng kit sửa rồi đánh dấu. Người dựng kit thêm component thì ghi cách dùng, và
người dựng màn hình đọc để dùng đúng.

**Skill tìm thư mục như thế nào:** theo **file key**. `ui-kit-builder` tìm key của kit trong
`upbase/*/kit-build.md`, còn `product-screen-builder` tìm key của product file trong
`upbase/*/product-file*.md`. Không tìm thấy thì skill **dừng** và đề nghị đăng ký, không đoán. Vì vậy
**phải mở Claude trong repo của team.** Mở ở thư mục khác thì skill sẽ báo "chưa đăng ký".

**Giữ bộ nhớ gọn và đúng:**
- Chỉ ghi trạng thái hiện tại và các quyết định. Lịch sử theo ngày nằm ở trang Changelog trong Figma.
- Không chép những gì đọc được từ Figma (ví dụ danh sách page). Bản chép sẽ cũ dần; skill đọc lại
  từ file khi cần.
- Bài học đúng với **mọi** kit thì chuyển lên `ui-kit-builder/references/patterns.md` qua pull
  request, để mọi team cùng có.

**Ví dụ:** `skills/_shared/product-template/EXAMPLE.md` là bản rút gọn đã điền giá trị của UpS. Bản đầy
đủ của UpS nằm ở `examples/ups/` trong repo skill.

---

## 2. Các luồng công việc

Mỗi luồng ghi: bạn nói gì → skill đọc file nào, ở bước nào → dừng ở đâu → bạn nhận được gì.

### Luồng A: Wrap một component UpBase vào kit

> *"Thêm Select vào kit của mình"* (kèm link kit)

1. `ui-kit-builder/SKILL.md` được nạp. Step 0 tìm `upbase/<sản phẩm>/kit-build.md` theo file key
   của kit.
2. Step 1 chạy `_shared/scripts/preflight.js` ở mode `kit`: đúng file chưa, UpBase có truy cập được
   không, có sót lại gì từ lần chạy trước không.
3. Step 2 liệt kê component **trong kit trước**, rồi mới tìm trong UpBase qua plugin. Gặp tên khác thì
   tra `_shared/references/upbase-library.md` (ví dụ Combobox → `Select`). Đọc `gap-log.md`.
4. Step 3 xác định đây là **wrapper**.
5. **Step 4 dừng lại với một đề xuất**: tên, page, số variant, property, platform.
6. Sau khi bạn duyệt: Step 5 đọc `references/wrapper-pattern.md`, `references/patterns.md` và
   `_shared/references/figma-api-gotchas.md`, rồi chạy `scripts/make-wrapper.js`.
7. Step 6 chạy `scripts/audit-wrappers.js` và các audit trong `_shared/scripts/`, sweep density.
8. Step 7 viết description theo `_shared/references/conventions.md` và dựng page theo
   `references/page-template.md`.
9. Step 8 ghi changelog bằng `_shared/scripts/changelog/changelog.js`, cập nhật *Status* trong
   `kit-build.md`, thêm cách dùng component vào `kit-usage.md`, cập nhật `gap-log.md`, rồi báo cáo.

**Bạn nhận được:** một component mới trong kit, đã verify, có description đầy đủ, page đã dựng, có
entry changelog *Pending publish*. Việc còn lại của bạn là publish kit.

### Luồng B: Ghép một component riêng của sản phẩm

> *"Cần một bulk action bar cho các màn danh sách"*

Giống luồng A, chỉ khác ở Step 3: shape là **composition**, nghĩa là ghép các wrapper sẵn có của kit.
Đề xuất sẽ có bảng số variant trước → sau (ví dụ 48 → 1), vì những gì không phải màu hay căn lề đều
được chuyển thành boolean, slot hoặc text. Nếu thứ cần làm là một control chung mà mọi sản phẩm đều
cần, skill sẽ đề nghị đưa lên UpBase thay vì làm trong kit.

### Luồng C: Dựng lại một màn hình

> *"Dựng lại màn hình này từ ảnh"* (kèm link product file)

1. `product-screen-builder/SKILL.md`. Step 0 tìm `upbase/<sản phẩm>/product-file.md` theo file key,
   đọc thêm `kit-usage.md` bên cạnh, rồi chọn mode **Rebuild** và đọc `references/rebuild-mode.md`.
2. Step 1 chạy `scripts/preflight-product.js`.
3. Step 2 chụp ảnh tham chiếu và ghi lại đúng từng chữ, từng trạng thái.
4. Step 3 ánh xạ từng vùng của màn hình sang component trong kit theo `kit-usage.md`. Thứ kit không
   làm được là một **gap**; kiểm tra `gap-log.md` trước, vì gap có thể đã có cách xử lý.
5. **Step 4 dừng lại với một đề xuất**: frame đích, clone từ màn nào, anatomy, gap, câu hỏi.
6. Step 5 build theo 4 giai đoạn (đọc `references/build-mechanics.md`), dùng `scripts/helpers.js` và
   token lấy bằng `scripts/harvest-tokens.js`.
7. Step 6 chạy `scripts/walk-integrity.js` và `scripts/check-overrides.js`, đo khoảng cách các cạnh,
   rồi so ảnh với tham chiếu.
8. Step 7 ghi gap mới vào `gap-log.md`, cập nhật *Screen register* trong `product-file.md`, ghi
   changelog, báo cáo.

**Bạn nhận được:** một màn hình chỉ gồm instance của kit, kèm danh sách mọi chỗ khác so với ảnh và lý
do.

### Luồng D: Làm phiên bản đề xuất (redesign)

> *"Màn này trông cũ, làm bản tốt hơn"*

Giống luồng C nhưng ở mode **Proposal** (`references/proposal-mode.md`): phê bình màn hiện tại, tìm
tham khảo trên Mobbin, đề xuất chỉ dùng những gì kit đã có, rồi build vào section Proposal, đặt cạnh
bản dựng lại. Kết quả quan trọng nhất là danh sách *"chỗ kit giới hạn thiết kế"*, được đưa vào `gap-log.md`.

### Luồng E: Vẽ anatomy

> *"Chỉ ra component nào trên màn này"*

Mode **Anatomy** (`references/anatomy-mode.md`): dán nhãn tên component trên một **bản copy** của ảnh
tham chiếu. Không dựng lại gì và không ghi changelog.

### Luồng F: Sửa hoặc thêm vào UpBase

> *"Badge bị cắt mất 99+, sửa giúp"* (sau khi đã trao đổi với người phụ trách UpBase)

1. `design-system-builder/SKILL.md`. Step 0 xác nhận đây là file UpBase.
2. Step 1 chạy preflight ở mode `design-system`.
3. Step 2 tìm kỹ trước khi làm (`references/workflow.md` Phase 0a–0c). Nếu đã có mà yếu hơn yêu cầu
   thì **sửa bản gốc**, không tạo bản thứ hai.
4. **Step 3 dừng lại với một đề xuất**, có ghi rõ thay đổi có phải là **breaking** không.
5. Build (`scripts/helpers.js`), verify, viết description, dựng page theo `references/page-template.md`.
6. Step 6 ghi changelog. Thay đổi breaking có tiền tố **`⚠ Breaking —`** và nói rõ các kit cần làm gì.
   Cập nhật `_shared/references/upbase-known-issues.md` nếu có.

**Bạn nhận được:** thay đổi trong UpBase, kèm một entry changelog mà các team kit đọc để biết cần làm
gì khi nhận bản publish.

### Luồng G: Nhận bản publish mới của UpBase vào kit

1. Đọc trang `_Changelog` của UpBase, đặc biệt các mục **⚠ Breaking**.
2. Accept update trong Figma (việc của người).
3. Chạy `ui-kit-builder/scripts/audit-wrappers.js`. Script này phát hiện **axis drift**: UpBase thêm
   hoặc bớt một axis mà nhìn canvas không thấy được.
4. Xem bảng *Behaviour changes* trong `_shared/references/upbase-known-issues.md`.

### Luồng H: Đăng ký sản phẩm của team mới (ví dụ uplms)

Làm **một lần**, trước lần build đầu tiên, ở thư mục gốc của repo thiết kế của team:

1. **Tạo thư mục dữ liệu:**
   ```bash
   npx github:datvu98/upbase-design-skills init uplms
   ```
   Lệnh này tạo `upbase/uplms/` gồm 4 file template. Thư mục đã tồn tại thì lệnh từ chối, không ghi đè.
2. **Điền phần đầu**, tự điền hoặc nhờ Claude: mở Claude trong repo và nói *"đăng ký kit `<link kit>`
   và product file `<link product>` cho uplms"*.
   - `kit-build.md`: **File key** của kit (đây là thứ đăng ký kit), platform, người duyệt, và bảng
     *Decisions to make once* (cách đặt tên wrapper, page shape, template page, docs header).
   - `product-file.md`: **File key** của product file, **Kit probe key** (key của một component bất kỳ
     đã publish trong kit, ví dụ Button), trang Changelog.
   - Claude đọc được các dữ kiện từ Figma, nhưng **các quyết định thì Claude hỏi**, không tự đoán.
3. **Tạo trang trống** `_Changelog` trong file kit và `Changelog` trong product file.
4. **Commit `upbase/uplms/`** để cả team dùng chung.

`kit-usage.md` và `gap-log.md` để trống lúc đầu và đầy dần khi team làm việc. Muốn xem bản đã điền
thì đọc `skills/_shared/product-template/EXAMPLE.md`.

**Đã cài bản ≤ 0.3 và từng đặt file dữ liệu bên trong thư mục skill?** Khi cập nhật lên 0.4, trình
cài chuyển các file đó ra `_rescued-data/` trong thư mục skill (không xoá) và in ra danh sách. Chuyển
chúng vào `upbase/<sản phẩm>/` theo tên mới: file kit → `kit-build.md`, kit map → `kit-usage.md`,
product file → `product-file.md`. Sau đó commit.

---

## 3. Danh mục file

Ký hiệu cho script: 🟢 chỉ đọc · 🟡 ghi tạm rồi xoá · 🔴 ghi thật vào file Figma.
Mọi script đều là đoạn code để **dán vào `figma_execute`** (plugin không có hệ thống module), rồi gọi
hàm hoặc chỉnh khối `CONFIG` ở đầu file.

### 3.1 `skills/_shared/`: dùng chung cho cả ba skill

#### `references/conventions.md`
- **Vì sao tồn tại:** các quy ước component phải theo ở bất kỳ đâu (UpBase hay kit). Trước đây chúng
  nằm trong phần UpBase và skill kit phải "mượn" sang, rất dễ lệch.
- **Giải quyết:** component sai platform (tách iOS/Android), thừa variant, thiếu state `Focused`, màu
  không đạt contrast, chọn token theo giao diện thay vì ý nghĩa, raw value không giải thích, description
  không đúng chuẩn nên script không đọc được.
- **Đọc khi:** viết đề xuất (Step 3/4) và viết description.
- **Kết quả:** một bộ luật cụ thể: 2 platform, cách tính variant, bộ state cố định, ngưỡng 4.5:1 / 3:1,
  bảng chọn token, format description, 8 verb responsive và các breakpoint hợp lệ.

#### `references/figma-api-gotchas.md`
- **Vì sao tồn tại:** Figma plugin API có rất nhiều lỗi **im lặng**. Mỗi mục trong file từng gây ra
  một lần làm lại.
- **Giải quyết:** timeout mà công việc vẫn chạy tiếp (chạy lại thì bị nhân đôi), slot không clone
  được, `maxWidth` bị bỏ qua trong instance, `resize()` làm auto-layout chuyển sang FIXED, vòng lặp làm
  treo plugin, focus ring vô hình…
- **Đọc khi:** trước lần ghi đầu tiên, và khi một lệnh plugin chạy bất thường.
- **Kết quả:** với mỗi bẫy: triệu chứng, nguyên nhân đã đo được, và cách làm đúng (thường kèm code).

#### `references/tokens.md`
- **Vì sao tồn tại:** script coverage chỉ đo được *có bind token hay không*, không đo được *bind
  **đúng** token chưa*. Một token sai mà đã bind vẫn được 100%.
- **Giải quyết:** các cặp token dễ nhầm, nhất là những cặp hiện đang render giống hệt nhau (ví dụ
  `colorBgContainer` và `colorBgElevated`).
- **Đọc khi:** bind một token chưa từng dùng.
- **Kết quả:** với mỗi token: nghĩa theo antd, giá trị thực trong UpBase, và chỗ UpBase lệch khỏi antd.

#### `references/upbase-known-issues.md`
- **Vì sao tồn tại:** các lỗi đã đo được trong UpBase mà mọi kit đều thừa hưởng.
- **Giải quyết:** báo nhầm lỗi của UpBase thành lỗi của kit, hoặc "sửa" bằng override trong kit (cách
  này mất tác dụng ở product file).
- **Đọc khi:** thấy một thứ trong UpBase trông sai, sau khi nhận bản publish mới, và khi sửa UpBase.
- **Kết quả:** danh sách lỗi có ngày đo và cách xử lý (contrast, hiệu ứng, token, component), bảng
  các thay đổi hành vi theo ngày, và danh sách đã sửa.

#### `references/upbase-library.md`
- **Vì sao tồn tại:** kit và product file truy cập UpBase **bằng key**, không dùng tên được. File này
  là sổ địa chỉ.
- **Giải quyết:** không tìm thấy component vì gọi khác tên (antd gọi stepper là `InputNumber`), import
  sai cách, tưởng rằng 0 collection local là lỗi.
- **Đọc khi:** tìm component (Step 2) và resolve token, style (Step 5) trong kit hoặc product file.
- **Kết quả:** bảng đối chiếu tên gọi, số lượng những gì UpBase publish, key của 4 collection, 20 text
  style, 10 effect style, 2 grid style, cùng các quy tắc resolve.

#### `references/verification.md`
- **Vì sao tồn tại:** component trông đúng trong ảnh chụp thường vẫn hỏng ở density Compact, khi bị
  thu hẹp, hoặc khi chứa nội dung thật.
- **Giải quyết:** báo "xong" khi chưa thực sự kiểm tra.
- **Đọc khi:** bước Verify của `design-system-builder` và `ui-kit-builder`.
- **Kết quả:** quy trình 6 bước (chụp ảnh, sweep density, sweep breakpoint, stress nội dung, coverage,
  đọc lại) và template bàn giao.

#### `scripts/preflight.js` 🟢
- **Vì sao tồn tại:** ba lỗi im lặng mà không audit nào bắt được, vì audit chạy *sau* khi đã làm.
- **Giải quyết:** (1) ghi nhầm vào file khác đang mở, (2) dùng sai cách resolve (local hay remote) cho
  loại file, (3) build lại thứ mà một lệnh timeout trước đó đã tạo ra.
- **Chạy khi:** lệnh `figma_execute` đầu tiên của mọi lần build, ở `design-system-builder` và
  `ui-kit-builder`.
- **Cách gọi:** `await preflight({ mode: 'kit' | 'design-system', fileKey, building: '<tên>' })`
- **Đạt khi:** `blocked: false`. Nếu `blocked: true` thì không tạo gì cả.
- **Output mẫu:** chạy trên UpS UI Kit, 241 ms:
  ```json
  { "mode": "kit", "blocked": false,
    "checks": [
      { "name": "file identity", "ok": true, "detail": "9c052aEvpV7gYLhwdatf6g (\"UpS UI Kit\")" },
      { "name": "mode coherence", "ok": true, "detail": "0 local collections — empty/foreign is correct in a kit; …" },
      { "name": "library reachable", "ok": true, "detail": "4 UpBase collection(s) available for import" } ],
    "warnings": ["2 node(s) already match \"Segmented\". If a prior call timed out, these are its output — …"],
    "existing": [ { "page": "_Table of Content", "name": "Link / ❖ Segmented", "type": "FRAME" },
                  { "page": "❖ Segmented", "name": "Segmented", "type": "COMPONENT" } ],
    "summary": "ready (1 warning)" }
  ```
  Đọc `existing[].page` trước khi xử lý cảnh báo. Ở ví dụ trên, cả hai node đều có chủ đích (một
  link trong mục lục và component thật), không phải phần sót lại. Trong file UpBase, lần chạy mất
  khoảng 18 giây vì phải quét 107 page, nên luôn chạy preflight trong một lệnh riêng.

#### `scripts/audit-coverage.js` 🟢
- **Vì sao tồn tại:** đo xem các giá trị trong component đã được bind token hoặc style chưa.
- **Giải quyết:** giá trị raw không đổi theo Compact hoặc Dark mode, mà nhìn ảnh chụp Default thì
  không thấy.
- **Chạy khi:** bước Verify. Chỉnh `PAGE_MATCH` để chọn page.
- **Đạt khi:** fill, text style, effect và stroke width đều 100%. Mọi giá trị trong `remainingRaw` đều
  có trong mục `Raw values` của description.
- **Output mẫu:** chạy trên ❖ Form của UpS UI Kit:
  ```json
  { "page": "❖ Form",
    "sets": [ { "name": "Form / Vertical", "variants": 1, "described": true },
              { "name": "Form Actions", "variants": 1, "described": true }, "… 3 more" ],
    "coverage": { "fills": "2/2 (100%)", "textStyles": "0/0", "effectStyles": "1/1 (100%)",
                  "strokeWidth": "0/1 (0%)", "padding": "4/4 (100%)", "gaps": "4/4 (100%)", "radius": "0/0" },
    "mustBeEmpty": { "rawColours": [], "rawShadows": [], "unstyledText": [] },
    "remainingRaw": { "gap": {}, "padding": {}, "radius": {} } }
  ```
  `0/0` nghĩa là không có gì để đo, vì phần bên trong instance thuộc component gốc. `strokeWidth 0/1`
  ở đây là một lỗi thật: một stroke chưa bind `lineWidth`.

#### `scripts/audit-platform.js` 🟢
- **Vì sao tồn tại:** kiểm tra phần khai báo responsive (`Web:` / `Native:`) trong description.
- **Giải quyết:** dùng verb ngoài danh sách cho phép, breakpoint không phải giá trị antd, khai báo
  không có example frame chứng minh.
- **Chạy khi:** bước Verify.
- **Đạt khi:** không có lỗi vocabulary hay breakpoint, và mỗi khai báo đều có frame chứng minh.
- **Output mẫu:** chạy trên cả UpS UI Kit (74 page), 100 ms:
  ```json
  { "setsScanned": 27, "declared": 9,
    "invalidVocab": [ "Product Card → Web: \"316 default width; content fills…\" uses no known verb", "… 3 more" ],
    "reflowWritten": [],
    "breakpointWithoutFrame": [ "Logo → declares <768 collapse but no example frame below 768px (page has none)" ],
    "frameWidthNotBound": [],
    "platformMismatch": [ "Product Card: Native line but no Mobile in Platforms" ],
    "declarations": [ { "set": "GridTable", "web": "<768 stack", "native": "Compact stack" }, "… 8 more" ] }
  ```
  Kết quả sạch là mọi mảng phát hiện đều rỗng. `declarations` chỉ để tham khảo. Muốn ghi rằng
  component cố ý không hỗ trợ một platform thì viết `Native: not in scope — <lý do>`, script sẽ bỏ qua
  dòng đó.

#### `scripts/audit-reuse.js` 🟢
- **Vì sao tồn tại:** tìm những thứ vẽ tay mà thư viện đã có sẵn, và những component quá yếu khiến
  người ta phải vẽ tay.
- **Giải quyết:** thư viện sinh ra bản trùng. Script tách hai trường hợp, vì nguyên nhân thường là
  component gốc yếu chứ không phải người dùng lười.
- **Chạy khi:** trước khi vẽ (checkpoint tái sử dụng), và bước Verify.
- **Đạt khi:** `handBuilt` rỗng. Mục `tooWeak` nào xuất hiện thì phải sửa component gốc trước.
- **Output mẫu:** chạy trên UpS UI Kit, khoảng 2,4 giây. Lần chạy này diễn ra *trước* khi phần B được
  giới hạn theo `PAGE_MATCH`, nên phần B đang quét cả file:
  ```json
  { "scanned": { "pages": 1, "componentSets": 27 },
    "A_handBuilt": { "count": 0, "items": [] },
    "B_tooWeak": { "count": 10, "items": [
      { "set": "Status", "issue": "no description", "detail": "ships undocumented; asset search matches descriptions" },
      { "set": "GridTable / Stacked Cell", "issue": "binds another component's tokens", "detail": "Components/Alert/Global/fontSize" },
      { "set": "InputNumber", "issue": "count with no min-width", "detail": "Type=Spinner — one digit collapses, 99+ needs the floor" },
      "… 7 more" ] },
    "textStyleDefects": [] }
  ```
  Lỗi `Components/Alert/Global/fontSize` là lỗi đã biết của style `Text Base/Strong` (xem
  `upbase-known-issues.md`), không phải lỗi bạn gây ra. `count with no min-width` trên `InputNumber`
  là báo sai: số trong spinner là giá trị, không phải badge đếm.

#### `scripts/check-reflow.js` 🟡
- **Vì sao tồn tại:** kiểm tra component có chịu được container hẹp hơn và nội dung dài hơn không.
- **Giải quyết:** frame bên trong có chiều rộng tối thiểu cứng, `maxWidth` tính bằng px rộng hơn
  container thật. Cả hai trông đúng ở chiều rộng lúc vẽ.
- **Chạy khi:** bước Verify. **Có ghi:** tạo một instance tạm, thay đổi kích thước, sửa text, đo, rồi
  xoá đi (kể cả khi lỗi).
- **Đạt khi:** mọi `overflowPx` bằng 0.
- **Output:** danh sách các lần thử (chiều rộng, nội dung) kèm `overflowPx` và node gây tràn. Chưa có
  output mẫu vì script có ghi.

#### `scripts/changelog/changelog.js` 🔴
- **Vì sao tồn tại:** mỗi file Figma có một trang lịch sử dễ đọc, và team khác biết UpBase vừa thay đổi
  gì.
- **Giải quyết:** thay đổi không ai ghi lại, các bước publish bị lãng quên, thay đổi breaking không
  được báo.
- **Chạy khi:** bước cuối của mọi phiên có sửa file (trừ anatomy).
- **Cách gọi:** `await addChangelogEntry({ date, title, author, status, sections, related, saveVersion: true })`.
  `author` là bắt buộc. `setChangelogStatus(date, title, 'published')` để đổi tag sau khi publish.
- **Kết quả:** một card entry trên trang `_Changelog` / `Changelog` (ngày, tác giả, tag *Pending
  publish* / *Published*, các mục Added · Changed · Fixed · Deprecated · Removed có link tới node), kèm
  một version có tên trong lịch sử phiên bản của file. Chạy lại với cùng ngày và tiêu đề thì entry được
  thay thế, không bị nhân đôi.

#### `product-template/kit-build.md`
- **Vì sao tồn tại:** khuôn cho sổ tay dựng kit của một sản phẩm.
- **Giải quyết:** skill phải đoán quyết định của team (platform, cách đặt tên, page shape); mỗi phiên
  phải dò lại từ đầu xem kit đã có gì.
- **Dùng khi:** đăng ký sản phẩm (luồng H). `init` copy file này sang `upbase/<sản phẩm>/kit-build.md`.
- **Kết quả:** một file có **File key** của kit (thứ đăng ký kit), bảng *Decisions to make once* kèm
  đáp án của UpS để tham khảo, *Page triage*, *Local scaffolding*, *Status* và *Notes*.

#### `product-template/kit-usage.md`
- **Vì sao tồn tại:** khuôn cho hướng dẫn dùng kit trên màn hình.
- **Giải quyết:** chọn sai component, dùng sai property key, mỗi màn cấu hình component một kiểu.
- **Dùng khi:** đăng ký sản phẩm. Ban đầu gần như trống, đầy dần khi dựng màn và khi kit có component
  mới.
- **Kết quả:** bảng vùng màn hình → component, quy tắc table (căn cột, độ rộng; chưa chốt thì dùng
  quy tắc của UpS), bảng key và property key.

#### `product-template/product-file.md`
- **Vì sao tồn tại:** khuôn cho dữ liệu của một file thiết kế sản phẩm.
- **Giải quyết:** mỗi phiên phải dò lại page, section, màn đã dựng, token dùng được, icon key.
- **Dùng khi:** đăng ký sản phẩm. Sản phẩm có nhiều file thiết kế thì mỗi file một bản
  (`product-file-<tên>.md`).
- **Kết quả:** **File key** của product file (thứ đăng ký nó), *Kit probe key*, page và section,
  *Screen register*, phần shell chung, token đã harvest, và icon.

#### `product-template/gap-log.md`
- **Vì sao tồn tại:** khuôn cho nhật ký những gì kit chưa làm được.
- **Giải quyết:** màn hình vẽ tay thứ kit thiếu, rồi không ai biết để sửa kit.
- **Dùng khi:** đăng ký sản phẩm.
- **Kết quả:** định dạng entry `GAP-nnn` với các trạng thái open → proposed → in kit → published (hoặc
  upstream, wontfix).

#### `product-template/EXAMPLE.md`
- **Vì sao tồn tại:** cho người điền template thấy một bản đã điền xong.
- **Giải quyết:** không biết điền một ô thế nào; lỡ copy nguyên giá trị của UpS.
- **Dùng khi:** đang điền template. `init` **không** copy file này.
- **Kết quả:** bản rút gọn của cả 4 file với giá trị thật của UpS, kèm lời nhắc không copy giá trị.

### 3.2 `skills/ui-kit-builder/`

#### `SKILL.md`
- **Vì sao tồn tại:** điểm vào của skill dựng kit. Claude luôn nạp file này khi skill được gọi.
- **Giải quyết:** dựng kit sai cách (vẽ lại component thay vì wrap, dùng dữ liệu UpS cho kit khác,
  override atom trong kit).
- **Kết quả:** lộ trình Step 0–8 với điểm dừng ở Step 4, bảng phân biệt các skill, và bảng "mở file nào
  ở bước nào".

#### `references/patterns.md`
- **Vì sao tồn tại:** các bài học đúng với **mọi** kit, rút ra từ quá trình dựng UpS.
- **Giải quyết:** sizing wrapper sai, chuỗi exposure khó hiểu, slot, override bị mất ở product file,
  di chuyển component làm mất property, import bị treo, dựng table không thẳng cột.
- **Đọc khi:** Step 2 (tìm trong kit trước) và Step 5 (build).
- **Kết quả:** các quy tắc ngắn, mỗi quy tắc có lý do đã đo và cách làm.

#### `references/wrapper-pattern.md`
- **Vì sao tồn tại:** công thức của wrapper, tức là một component local chứa một instance remote từ
  UpBase.
- **Giải quyết:** panel property trống (quên `isExposedInstance`), nhãn property mang tên UpBase,
  wrapper HUG chặn con FILL, wrapper không tìm thấy được bằng search.
- **Đọc khi:** Step 5, với wrapper.
- **Kết quả:** hai quyết định (expose hay curated set, đặt tên layer), bốn quy tắc, một ví dụ sai và
  đúng, và checklist.

#### `references/page-template.md`
- **Vì sao tồn tại:** layout page của **kit**, khác với page của UpBase.
- **Giải quyết:** áp nhầm template của UpBase vào kit (thừa doc frame, Playground, cặp Light/Dark,
  nhãn Space Mono).
- **Đọc khi:** Step 7.
- **Kết quả:** cấu trúc page (header, các section Components, Density scale, Example Screens), hình
  học, và checklist.

#### `scripts/make-wrapper.js` 🔴
- **Vì sao tồn tại:** tạo wrapper đúng công thức trong một lần chạy.
- **Giải quyết:** bốn lỗi wrapper ở trên. Script cũng từ chối tạo trùng tên và từ chối chạy trong file
  UpBase.
- **Chạy khi:** Step 5, sau khi đề xuất đã được duyệt. Chỉnh `CONFIG` (key nguồn, tên, page,
  description). Có `dryRun: true` để xem trước mà không tạo gì.
- **Kết quả:** một component wrapper trên page chỉ định, cùng báo cáo `steps` / `warnings` / `created`,
  đã được đọc lại sau khi tạo. Chưa có output mẫu vì script có ghi.

#### `scripts/resolve-remote.js` 🟢 / 🔴
- **Vì sao tồn tại:** trong kit, tra variable và style local luôn trả về rỗng. Script này resolve token
  và style của UpBase **theo key**.
- **Giải quyết:** dùng nhầm helper của UpBase trong kit (không resolve được gì mà không báo lỗi).
- **Chạy khi:** đầu mỗi lệnh build trong kit (`const R = await kitResolve()`).
- **Kết quả:** đối tượng `R` có `v()`, `paintVar()`, `bindNum()`, `applyTextStyle()`.
- **Ghi gì:** phần resolve chỉ đọc (và import variable hoặc style vào file dưới dạng tham chiếu).
  Riêng `R.icon()` tạo một instance icon.
- **Lưu ý:** script này liệt kê toàn bộ khoảng 2.500 variable nên có thể treo trong kit. Khi đó dùng
  cách **harvest** trong `patterns.md`.

#### `scripts/audit-wrappers.js` 🟢
- **Vì sao tồn tại:** kiểm tra sức khoẻ mọi wrapper và độ lệch so với nguồn UpBase.
- **Giải quyết:** wrapper không expose, sizing sai, thiếu description hoặc block `Source`, và **axis
  drift** sau khi UpBase thay đổi (không thấy được trên canvas).
- **Chạy khi:** Step 6, và sau mỗi lần nhận bản publish của UpBase. `ONLY_PAGE` để chọn một page.
- **Đạt khi:** không có issue, trừ những flag mà `kit-build.md` ghi là chấp nhận.
- **Output mẫu:** chạy với `ONLY_PAGE = '❖ Segmented'`, 11 ms:
  ```json
  { "file": "UpS UI Kit",
    "summary": { "wrappers": 1, "compositions": 0, "clean": 0, "withIssues": 1, "drifted": 0 },
    "ok": false,
    "results": [ { "name": "Segmented", "kind": "wrapper",
      "issues": [ "Nested layer still named \"Segmented\" — … Rename it to the product-facing word." ],
      "source": { "set": "Segmented", "key": "c24a7c6e…", "liveAxes": ["Size", "Block", "Vertical", "Shape"] },
      "nested": { "layerName": "Segmented", "isExposedInstance": true, "forwardedProps": 4 } } ] }
  ```
  `ok: false` ở đây chỉ do quy ước đặt tên của UpS (wrapper giữ đúng tên UpBase). Đây là flag đã được
  chấp nhận và ghi trong `kit-build.md`. Các phần quan trọng đều đạt: `drifted: 0`,
  `isExposedInstance: true`, key nguồn đúng.

### 3.3 `skills/product-screen-builder/`

#### `SKILL.md`
- **Vì sao tồn tại:** điểm vào của skill dựng màn hình.
- **Giải quyết:** vẽ tay thứ kit thiếu, chép lỗi của ảnh chụp vào thiết kế, build khi chưa được duyệt.
- **Kết quả:** chọn product và mode, lộ trình Step 0–7, điểm dừng ở Step 4, và bảng file theo bước.

#### `references/rebuild-mode.md`
- **Vì sao tồn tại:** luật của mode dựng lại trung thành với ảnh.
- **Giải quyết:** "sửa" ảnh theo ý mình, ẩn phần cấu trúc của component cho giống ảnh, cấu hình
  component khác với các màn đã có.
- **Đọc khi:** mode Rebuild.
- **Kết quả:** nguyên tắc "nội dung lấy từ ảnh, hình thức theo component", "cách dùng đã thống nhất
  thắng ảnh", thứ tự ưu tiên khi dựng, và checklist.

#### `references/proposal-mode.md`
- **Vì sao tồn tại:** luật của mode đề xuất redesign.
- **Giải quyết:** đề xuất cần component mới (vượt ngoài kit), mất ngữ cảnh của màn gốc.
- **Đọc khi:** mode Proposal.
- **Kết quả:** quy trình (thảo luận → phê bình → Mobbin → đề xuất → build), checklist phê bình, template
  đề xuất, và ví dụ Kho hàng 01.

#### `references/anatomy-mode.md`
- **Vì sao tồn tại:** cách vẽ nhãn component lên ảnh.
- **Giải quyết:** dán nhãn chung chung, vẽ đè lên ảnh gốc.
- **Đọc khi:** mode Anatomy.
- **Kết quả:** quy tắc vị trí, nội dung nhãn (tên component chính xác, ký hiệu slot), cách vẽ, và nội
  dung bàn giao.

#### `references/build-mechanics.md`
- **Vì sao tồn tại:** các bẫy plugin khi **dùng** component để dựng màn (khác với khi tạo component).
- **Giải quyết:** handle cũ trong slot làm crash, ghi dở khi timeout, sai property key, đo nhầm node,
  khoảng cách cạnh bị lệch sau khi tái cấu trúc.
- **Đọc khi:** trước lần ghi đầu tiên (Step 5).
- **Kết quả:** các bẫy theo nhóm (lệnh, slot, property, text, đo, layout, token, icon, ảnh, dọn dẹp).

#### `scripts/preflight-product.js` 🟢
- **Vì sao tồn tại:** preflight cho product file.
- **Giải quyết:** ghi nhầm file, kit không truy cập được (màn hình dựng ra bị thủng lỗ), build trùng
  sau khi timeout.
- **Chạy khi:** lệnh đầu tiên của mọi lần build màn hình. Lấy `kitProbeKey` từ `product-file.md`.
  Script import một component của kit vào cache, không đặt gì lên canvas.
- **Đạt khi:** `blocked: false`.
- **Output mẫu:** chạy trên UpS Product 2026, 186 ms:
  ```json
  { "blocked": false,
    "checks": [
      { "name": "file identity", "ok": true, "detail": "9FAdrUvuA7q0VExwsAxNu6 (\"UpS Product 2026\")" },
      { "name": "file role", "ok": true, "detail": "0 local collections (0 is normal for a product file)" },
      { "name": "kit reachable", "ok": true, "detail": "imported \"Button / Basic\" in 175ms" } ],
    "warnings": ["1 frame(s) already named \"Kho hàng 01…\""],
    "existing": [ { "id": "40:65276", "name": "Kho hàng 01 — Danh sách kho", "page": "↳ Specifications", "parent": "Kho hàng" } ],
    "summary": "ready (1 warning)" }
  ```
  Import component từ kit đôi khi bị treo. Script đặt giới hạn 8 giây; quá thời gian đó nó tìm
  instance kit có sẵn trên page và ghi một cảnh báo, thay vì làm treo cả lệnh.

#### `scripts/walk-integrity.js` 🟢
- **Vì sao tồn tại:** kiểm tra màn hình vừa dựng có "lành" không, và có đúng toàn là component kit không.
- **Giải quyết:** node có handle hỏng (bẫy stale handle), atom UpBase đặt thẳng lên màn, frame clip
  làm mất counter hoặc caption.
- **Chạy khi:** Step 6.
- **Đạt khi:** `broken` bằng 0, và `topLevel` chỉ gồm component của kit.
- **Output mẫu:** trên Kho hàng 01, 2.097 node trong 96 ms:
  ```json
  { "screen": "Kho hàng 01 — Danh sách kho", "size": "1440×993", "nodes": 2097, "broken": 0,
    "topLevel": { "PageHeader": 1, "Menu / Sidebar": 1, "Alert": 1, "Button / Basic": 1,
                  "FilterBar": 1, "GridTable": 1, "FloatButton": 1 },
    "clippingFrames": ["Body", "Main", "Page Actions"],
    "verdict": "pass" }
  ```
  `verdict` chỉ dựa trên `broken`. Vẫn phải tự đọc `topLevel` (có atom UpBase nào lọt vào không) và
  `clippingFrames`.

#### `scripts/check-overrides.js` 🟢
- **Vì sao tồn tại:** property bị override sẽ không bao giờ đồng bộ từ thư viện nữa.
- **Giải quyết:** một override lạc (ví dụ căn giữa) chặn mọi bản sửa từ thượng nguồn, rồi bị clone
  sang các màn khác.
- **Chạy khi:** Step 6.
- **Đạt khi:** `diverged` rỗng, hoặc mỗi mục là ngoại lệ người dùng yêu cầu (truyền qua `allow`).
- **Output mẫu:** trên Kho hàng 01, 131 ms:
  ```json
  { "screen": "Kho hàng 01 — Danh sách kho", "instancesChecked": 241, "overrides": 0,
    "byField": {}, "diverged": [], "verdict": "pass" }
  ```
  Khi không đạt, mỗi mục trong `diverged` có dạng `{ id, name, component, field, instance, main }`.
  Script chỉ kiểm tra 9 thuộc tính layout. Kích thước, fill và text được cố ý bỏ qua.

#### `scripts/harvest-tokens.js` 🟢
- **Vì sao tồn tại:** product file không import được variable, nhưng instance của kit mang sẵn variable
  của UpBase.
- **Giải quyết:** phải dùng số raw cho khoảng cách và màu nền của frame tự tạo.
- **Chạy khi:** Step 5, hoặc khi một id trong bảng *Harvested tokens* không resolve được nữa.
- **Kết quả:** danh sách variable (tên, giá trị, id) tìm thấy dưới một node, để ghi vào `product-file.md` › *Harvested tokens*.
- **Output mẫu:** `harvestTokens(Kho hàng 01, /padding|margin|colorBg/)`, 331 ms:
  ```json
  { "scanned": 204, "matched": 34,
    "tokens": {
      "Colors/Neutral/Bg/colorBgLayout": "VariableID:0696e842…/28318:1148",
      "Space/Padding/padding":           "VariableID:23e55bd0…/28331:731",
      "Components/Button/Global/marginXS": "VariableID:fa1b55ea…/28331:1252",
      "…": "… 31 more" } }
  ```
  Frame của màn hình chỉ nên bind token `Space/*` và `Colors/*`, không bind `Components/*` của
  component khác. Dùng pattern `/^(Space|Colors)\//` để lọc.

#### `scripts/helpers.js` 🔴
- **Vì sao tồn tại:** các hàm dựng màn, mỗi hàm gói sẵn cách tránh một bẫy trong `build-mechanics.md`.
- **Giải quyết:** lỗi `setProperties` bị nuốt, frame clip mặc định, set sizing trước khi append,
  font chưa load, giới hạn số dòng text.
- **Chạy khi:** Step 5, dán vào đầu lệnh build.
- **Kết quả:** `makeSetter()` trả về mảng `errs` (mảng rỗng là bằng chứng đã chạy đúng), `makeFrame`,
  `fill`, `bindSpace`, `addFormField`, `setFieldError`, `capLines`.

### 3.4 `skills/design-system-builder/`

#### `SKILL.md`
- **Vì sao tồn tại:** điểm vào của skill sửa UpBase.
- **Giải quyết:** tạo component trùng, đổi hành vi mà không báo các team kit.
- **Kết quả:** lộ trình Step 0–6, điểm dừng ở Step 3, checklist breaking, và bảng file theo bước.

#### `references/workflow.md`
- **Vì sao tồn tại:** chi tiết từng phase phía sau `SKILL.md`.
- **Giải quyết:** bỏ qua bước kiểm tra "đã có chưa", biến khác biệt platform thành component mới,
  hardcode giá trị đã có token.
- **Đọc khi:** Step 2–5, mở đúng phase đang làm.
- **Kết quả:** Phase 0a–6 (kiểm tra tồn tại, phạm vi, platform, liệt kê hệ thống, đo màu, build,
  property, verify, document).

#### `references/foundations.md`
- **Vì sao tồn tại:** bản kiểm kê của UpBase.
- **Giải quyết:** đoán sai tên style, tạo token đã có, không biết component nào nên tái sử dụng.
- **Đọc khi:** Step 2.
- **Kết quả:** collection và mode, text, effect, grid style, danh sách component, các component đáng
  tái sử dụng, và các lỗ hổng đã biết.

#### `references/page-template.md`
- **Vì sao tồn tại:** layout page của **UpBase** (khác với page của kit).
- **Giải quyết:** page thiếu phần chứng minh (cặp Light/Dark bắt được màu hardcode).
- **Đọc khi:** Step 5.
- **Kết quả:** doc frame, Playground Light/Dark, ba section, các lưu ý về plugin, và checklist.

#### `scripts/audit-system.js` 🟢
- **Vì sao tồn tại:** liệt kê những gì file UpBase thực sự có trước khi build.
- **Giải quyết:** đoán tên style và collection. Ngoài ra, kết quả bằng 0 là dấu hiệu đang ghi nhầm file.
- **Chạy khi:** Step 2.
- **Đạt khi:** có đủ 4 collection, 20 text style, 10 effect style. Kết quả bằng 0 nghĩa là đang ở sai
  file.
- **Output mẫu:** trên UpBase (trích):
  ```json
  { "counts": { "collections": 4, "variables": 2583, "textStyles": 20, "effectStyles": 10,
                "paintStyles": 0, "gridStyles": 2 },
    "collections": [ { "name": "1. Colors", "modes": ["Light", "Dark"], "variables": 259 },
                     { "name": "2. Dimensions", "modes": ["Default", "Compact"], "variables": 66 }, "… 2 more" ],
    "textStyles": [ { "name": "Text Base/Normal", "size": 14, "weight": "Regular" }, "… 19 more" ],
    "breakpoints": { "screenXS": 480, "screenSM": 576, "screenMD": 768, "screenLG": 992, "screenXL": 1200, "screenXXL": 1600 },
    "numericByValue": { "12": ["Size/Base/sizeSM", "Space/Margin/marginSM", "Space/Padding/paddingSM"], "…": "…" } }
  ```
  Script không có kết quả đạt hay không đạt, nó là một bản kiểm kê. Dùng `numericByValue` để hỏi
  "token nào bằng 12?". Output đầy đủ khoảng 15 KB.

#### `scripts/helpers.js` 🔴
- **Vì sao tồn tại:** các hàm dựng component trong UpBase, nơi mọi thứ resolve local.
- **Giải quyết:** bind màu có alpha bị ra màu đen đặc, tự tính lại contrast, tự gõ khối Properties.
- **Chạy khi:** Step 4, dán vào đầu lệnh. Gọi `await initUB()` trước.
- **Kết quả:** `paintVar`, `bindNum`, `icon`, `applyTextStyle`, `contrast`, `propsBlock`, cùng các map
  `V` / `S` / `MODES`.

### 3.5 Gốc repo

| File | Vì sao tồn tại | Kết quả |
|---|---|---|
| `README.md` | giới thiệu, cài đặt, đăng ký kit, quy trình | người mới cài được và biết bắt đầu từ đâu |
| `SETUP.md` | cấu hình MCP, Desktop Bridge, token, quyền | máy sẵn sàng để chạy skill |
| `GUIDE.md` | file này | hiểu từng file và từng luồng |
| `CHANGELOG.md` | lịch sử thay đổi **của skill** (thay đổi trong Figma nằm ở trang Changelog của từng file) | biết bản cập nhật vừa đổi gì |
| `package.json` · `bin/install.js` | trình cài `npx` | **cài/cập nhật** skill vào `~/.claude/skills` hoặc `.claude/skills`: ghi đè file của repo, xoá file repo đã bỏ, chuyển dữ liệu cũ (≤ 0.3) ra `_rescued-data/`. **`init <sản phẩm>`** tạo `upbase/<sản phẩm>/` từ template |
| `examples/ups/` | dữ liệu đầy đủ của UpS (`kit-build.md`, `kit-usage.md`, `product-file.md`) theo cấu trúc mới, **không được cài** | ví dụ thật cho người điền template. Với UpS: copy sang `upbase/ups/` trong repo UpBase Design System khi chuyển sang bản 0.4 |
| `bin/check-guide.js` | kiểm tra GUIDE.md có đủ mục cho mọi file trong `skills/` | báo file nào chưa có trong hướng dẫn |
| `evals/*.json` · `evals/README.md` | các prompt test dry-run cho từng skill | chạy lại sau mỗi lần sửa skill để biết có làm skill kém đi không |

---

## 4. Script nào an toàn để chạy

| | Script |
|---|---|
| 🟢 **Chỉ đọc**: chạy lúc nào cũng được | `preflight` · `audit-coverage` · `audit-platform` · `audit-reuse` · `audit-wrappers` · `audit-system` · `preflight-product` · `walk-integrity` · `check-overrides` · `harvest-tokens` · phần resolve của `resolve-remote` (có thể treo) |
| 🟡 **Ghi tạm rồi xoá** | `check-reflow` |
| 🔴 **Ghi thật** | `make-wrapper` · `changelog` · cả hai `helpers.js` và `R.icon()` của `resolve-remote` (khi gọi các hàm tạo frame hoặc instance) |

Ba quy tắc cho mọi lần chạy:
- Luôn truyền `fileKey`.
- Một lệnh dừng ở 30 giây, nhưng **timeout không có nghĩa là đã huỷ**: plugin thường vẫn chạy xong.
  Đọc lại trạng thái trước khi chạy lại.
- Không viết vòng lặp không có giới hạn. Plugin bị treo thì chỉ người dùng mở lại Desktop Bridge mới
  gỡ được.

---

## 5. Bảo trì bộ skill

**Dữ liệu sản phẩm** (`upbase/<sản phẩm>/` trong repo của team)
- Team sở hữu và commit. Skill cập nhật ở cuối mỗi phiên; xem diff trước khi commit như với code.
- Hai người cùng sửa một file thì xử lý conflict như với code bình thường. Các file được chia theo vai
  trò nên conflict hiếm khi xảy ra.

**Bộ skill** (repo `upbase-design-skills`)
- **Không sửa file trong thư mục skill đã cài.** Lần cập nhật sau sẽ ghi đè.
- **Bài học đúng với mọi kit** → `ui-kit-builder/references/patterns.md`. **Bẫy của Figma API** →
  `_shared/references/figma-api-gotchas.md`. **Lỗi của UpBase** →
  `_shared/references/upbase-known-issues.md`. Gửi bằng pull request.
- **Thêm hoặc đổi tên file trong `skills/`** → thêm mục vào phần 3 của file này, rồi chạy
  `node bin/check-guide.js`.
- **Sau khi sửa một skill** → chạy các prompt trong `evals/` (từ một project có `upbase/ups/`, xem
  `evals/README.md`), tăng `version` trong `package.json`, ghi `CHANGELOG.md`.

## 6. Câu hỏi thường gặp

**Skill báo "chưa đăng ký" dù đã đăng ký.**
Kiểm tra ba điều: (1) Claude có đang mở trong repo của team không (phải thấy thư mục `upbase/` ở gốc);
(2) **File key** trong `kit-build.md` / `product-file.md` có đúng 22 ký tự lấy từ link không; (3) file
đã được commit và kéo về máy chưa.

**Cập nhật bộ skill có làm mất dữ liệu không?**
Không. Dữ liệu nằm trong repo của team, còn trình cài chỉ ghi vào thư mục skill. Riêng người từng để
dữ liệu trong thư mục skill (bản ≤ 0.3): trình cài chuyển file ra `_rescued-data/`, không xoá.

**Có cần đăng ký UpBase Design System không?**
Không. `design-system-builder` nhận ra file UpBase qua key cố định (`BoGaG48v9BfY7LkMtFs4zh`).

**Một sản phẩm có nhiều file thiết kế thì sao?**
Mỗi file một bản `product-file-<tên>.md` trong cùng thư mục, dùng chung `kit-usage.md` và
`gap-log.md`.

**Claude đề xuất xong rồi dừng, không làm tiếp?**
Đó là thiết kế có chủ đích: mọi skill dừng ở bước đề xuất chờ duyệt. Trả lời "ok" hoặc nêu chỗ cần
sửa. Có thể miễn bước đề xuất cho một đợt dựng màn ("build luôn, không cần proposal"), nhưng chỉ có
hiệu lực cho đợt đó.

**Desktop Bridge báo "Cannot connect" hoặc mọi lệnh đều timeout.**
Figma tạm dừng plugin khi tab mất focus, hoặc một lệnh trước bị kẹt. Đóng rồi mở lại Desktop Bridge
trong đúng file đó. Không có gì bị mất.

**Muốn sửa một component của UpBase cho sản phẩm của mình.**
Không override trong kit, vì override không sống được ở product file. Trao đổi với người phụ trách
UpBase. Nếu đồng ý thì dùng `design-system-builder` (luồng F).
