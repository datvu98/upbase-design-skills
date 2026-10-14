# The UpBase library: names, keys and how to reach it

> **Shared by `ui-kit-builder` and `product-screen-builder`.** These are files that *consume* UpBase
> and reach it by key. Inside the UpBase Design System file itself everything is local and importing
> by key is wrong (`design-system-builder`).

Every kit consumes one published library. This file is the address book: what UpBase calls things,
the keys, and the rules for reaching it from another file. Re-verify the counts with the plugin if something looks off; keys are stable
across renames and edits, names are not.

## Files

| Role | Name | Key |
|---|---|---|
| The library | **UpBase Design System** | `BoGaG48v9BfY7LkMtFs4zh` |
| A kit | each kit's data file in `ui-kit-builder/kits/` | e.g. UpS UI Kit `9c052aEvpV7gYLhwdatf6g` |

The UpBase file was called `Ant Design Components` and then `Upbase Components` before its current
name. **Match on the key, never the name** — any note, script or description still naming the old
one is stale, not a different file.

## What UpBase calls things

UpBase follows antd's names. A name you can't find is usually the same thing under antd's word, so
translate before concluding anything is missing:

| You are looking for | UpBase calls it |
|---|---|
| Busy indicator · Activity indicator · Loading · Spinner | `Spin` |
| Step input · Stepper · Numeric input | `InputNumber` |
| Rating indicator · Star rating | `Rate` |
| Combobox · Multi combobox · Picker | `Select` |
| Illustrated message · Empty state | `Result` / `Empty` (UpS kit: `IllustratedMessage`) |
| Toast · Snackbar | `Message` |
| Back to top · Floating action · FAB | `FloatButton` |
| Segmented control | `Segmented` |
| Notice bar · Banner | `Alert` |
| Accordion · Panel | `Collapse` |
| Image picker · File upload · Attachment | `Upload` |
| A select or unit welded to the left / right of a field (`addonBefore` / `addonAfter`) | **`Pre Tab`** / **`Post Tab`** on `Input / Pre Post Tab` |

Names with no entry (`Tab Bar`, `Action Sheet`, `Swipe Action`, `Search Bar`, `Picker View`) may be
real gaps. Search anyway; UpBase grows.

## What UpBase publishes

| | Count |
|---|---|
| Component sets | 293 |
| Standalone components | 1,841 — of which **1,779 are icons** on `❖ Icon` |
| Total components (variants expanded) | 8,900 |
| Variables | 2,517 across 4 collections |
| Text / effect / grid / paint styles | 20 / 10 / 2 / **0** |

There are **zero paint styles** — colour is variables-only, in every kit exactly as in UpBase.

`_Docs / *` is **not published** and cannot be imported. That is deliberate: the `_` prefix keeps
documentation scaffolding out of every subscribing file's Assets panel. Each kit builds its own.

## Variable collections

| Collection | Key | Modes | Vars |
|---|---|---|---|
| `1. Colors` | `88dd85d5bbf0425f97770485f65499e27023b0bd` | Light · Dark | 258 |
| `2. Dimensions` | `394802cbcf7b731d19ebeec92d92e69acc1747e3` | Default · Compact | 65 |
| `3. Typography` | `81ac6a3e675df9c73ab1a17b594782e32abe17f1` | Default · Compact | 22 |
| `4. Components` | `9d9ac936f2f4d79ada1e4d9750e7f9c5eef8d6ad` | Value | 2,172 |

`4. Components` has a single mode and that costs nothing **as long as every token in it is an
alias** — Figma resolves an alias in the consumer's mode context, so a component token pointing at
`Colors/*` still swaps Light/Dark and one pointing at `2. Dimensions` still swaps Default/Compact.
Verified to hold across the file boundary: a kit-local variable aliasing
`Colors/Neutral/Bg/colorBgContainer` resolved `255,255,255` in Light and `20,20,20` in Dark.

## Text style keys

Import with `figma.importStyleByKeyAsync(key)`, apply with `await node.setTextStyleIdAsync(style.id)`.

| Style | Key |
|---|---|
| `Text Base/Normal` | `d226bd288d31ed1dcc34b811f1a7295df71d6641` |
| `Text Base/Strong` | `f5332cf25bb3d59abb78905f8666991223382287` |
| `Text Base/Underline` | `921a11c8c5fd124437105a9a45fd72dc80800c78` |
| `Text Base/Delete` | `e3554468234028ac284aee08fe6523f0d06e612f` |
| `Text Base/Italic` | `f26f51d5f4033bf83ff310989ca190c21ea3c15e` |
| `Text SM/Normal` | `1bf86738999bebe0f2556e6a677649939d6d17d4` |
| `Text SM/Strong` | `e7db5851d52b6cd8f2cb78ed050723b18e0cab75` |
| `Text SM/Underline` | `13b9d27bfb560f4617d79600448a2c03e8a2f616` |
| `Text SM/Delete` | `d882735df40312cd460df755b3661d2cf0128db6` |
| `Text SM/Italic` | `e4ed4a6057c27f9bf2bf9f2696b9d08b03dc3c62` |
| `Text LG/Normal` | `e3c6a733172287b902ee6fac996bcbdb562e399e` |
| `Text LG/Strong` | `cb0043472770df8690975185cab204c1c542ed04` |
| `Text LG/Underline` | `e5228270750fa2c72c033b439641824cac36ae3e` |
| `Text LG/Delete` | `2036da35de16a5f457086f6a1efad3558791784d` |
| `Text LG/Italic` | `11aec083998d5a78291c0834f861ec5195268401` |
| `Heading/1` | `ddbb7109eca5fca3b262028aea2014a060942f72` |
| `Heading/2` | `770f6cdcc81af236107198d058afa50b0183184e` |
| `Heading/3` | `d569c7fe147c02d38210f6563123a979b35babac` |
| `Heading/4` | `244d76fc458a3409cc5b7fffb7115740fb4b96e9` |
| `Heading/5` | `b40b02cdb40caef06e5a16d11c2de6ff1caff385` |

The names are not what you'd predict — it is `Heading/4`, not "Heading 4". A plausible pattern match
misses them, which is why the keys are here.

## Effect style keys

| Style | Key |
|---|---|
| `boxShadow` | `4d828b4ab56531d1e5e19f20dbfbc1696459cdd7` |
| **`boxShadowSecondary`** | `89b0ee10cabc32021023d222738abed47d4b41ff` |
| `boxShadowTertiary` | `40ff9640ffba8b9b5cd95457084734ecbd8518b0` |
| `Component/Button/dangerShadow` | `f08562a17739c355195334b93fe08cb84b2aea79` |
| `Component/Button/defaultShadow` | `238b6c82504308b69e5743ad1592a4b9cc5df7f6` |
| `Component/Button/primaryShadow` | `2bb20243d5618d7c562e241b4bf946a3a0819b21` |
| `Component/Input/activeShadow` | `96eaa2f34131f08c935a0f6d2af9fc78d32b054b` |
| `Component/Input/errorActiveShadow` | `00e66dccde00495518fd4684fe71182faee095ef` |
| `Component/Input/warningActiveShadow` | `573660c40a45bf3696b9a7d34d7fde888913bb02` |
| `Component/Switch/handleShadow` | `e8f1d3da08bdad12f369b5ff7260d78232727487` |

Every floating surface in UpBase uses **`boxShadowSecondary`**. Match that.

## Grid style keys

| Style | Key |
|---|---|
| `1440px - 12 col` | `f3b15c5b82a30104bbd450d74bc9f082974cca07` |
| `1440px - 24 col` | `1e763d67f0b4c16445ec79b00948a4cdf48b9c3e` |

## The resolution rules

**Local lookup is dead here.** In a kit these return **empty, even after importing** — imported assets
are remote, and remote assets are not local:

```js
await figma.variables.getLocalVariableCollectionsAsync()   // []
await figma.getLocalTextStylesAsync()                      // 0
await figma.getLocalEffectStylesAsync()                    // 0
```

That is the healthy state of this file, not a symptom. Do not react to it by creating local tokens.

**Variables** — through the team library, by name within a collection:

```js
const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
const colors = cols.find(c => c.name === '1. Colors');
const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(colors.key);
const hit = vars.find(v => v.name === 'Colors/Neutral/Bg/colorBgContainer');
const imported = await figma.variables.importVariableByKeyAsync(hit.key);   // remote: true
```

**Styles** — by key, from the tables above:

```js
const ts = await figma.importStyleByKeyAsync('d226bd288d31ed1dcc34b811f1a7295df71d6641');
await node.setTextStyleIdAsync(ts.id);
```

**Components** — by key, from a plugin-side search of the UpBase file:

```js
const set = await figma.importComponentSetByKeyAsync(key);   // for a COMPONENT_SET
const cmp = await figma.importComponentByKeyAsync(key);      // for a standalone COMPONENT
```

`importComponentByKeyAsync` throws on a set key and vice versa. `ui-kit-builder/scripts/make-wrapper.js` tries both.

`ui-kit-builder/scripts/resolve-remote.js` wraps all of this with caching — use it rather than re-deriving the
sequence each time.

## What a kit cannot do

**Re-publish UpBase's styles.** A file can only publish its own styles, so a product file that needs
to apply `Text Base/Normal` to its own free text must have UpBase enabled too. This does **not**
affect components built here — an imported style travels inside the instance and renders correctly
in any subscribing file.

Variables are different: a kit-local variable that *aliases* a UpBase variable **can** be published
by the kit and stays theme-transparent. That is the supported route if a kit ever needs to own a token
surface of its own. Do it only for tokens the kit genuinely owns — a local alias that merely mirrors a
UpBase token adds a hop and a drift risk for nothing.
