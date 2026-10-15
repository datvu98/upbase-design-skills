# Changelog

Changes to the skills themselves. Changes to the Figma files are on each file's `_Changelog` page.

## 0.3.0 — 2026-10-15

**Added**
- **`GUIDE.md`** (Vietnamese): the overall picture, eight workflows end to end, and an entry for every
  file and script. Each entry covers why it exists, what it solves, when it's read or run, and what it
  produces. Script entries show output from real read-only runs on UpS UI Kit, UpS Product 2026 and
  UpBase.
- `bin/check-guide.js`: fails if a file under `skills/` has no entry in `GUIDE.md`.

**Fixed** (found by the real runs)
- `audit-coverage.js` now audits standalone components as well as component sets. A kit page used to
  report "0/0" while checking none of its components. It also no longer switches the page the user
  is looking at.
- `audit-reuse.js`: `PAGE_MATCH` now narrows part B (too-weak components) too. Before, B always
  scanned the whole file and reported other pages' findings.
- `preflight-product.js`: the kit-probe import is raced at 8 s, so a hung import no longer times the
  call out. On a hang it falls back to proving the kit is resident. The leftover check now searches
  every page, not just the one open.
- `audit-platform.js`: `Native: not in scope — …` is treated as a deliberate opt-out rather than an
  invalid declaration (documented in `conventions.md`).
- `kits/_template.md` gave the wrong copy path. `foundations.md` still carried the old file name.

## 0.2.0 — 2026-10-14

The single `ub-component-creator` skill is split by file, so each skill's name says where it writes.

**Changed**
- `ub-component-creator` → **`design-system-builder`** (the UpBase Design System file) and
  **`ui-kit-builder`** (a product's UI kit). Shared references and scripts moved to
  **`skills/_shared/`**. The installer migrates an existing install: your kit data file moves to
  `ui-kit-builder/kits/` and the old folder is removed.
- `ui-kit-builder/SKILL.md` was rewritten as a short step-by-step route (Step 0–8) that opens
  references only at the step that needs them. It stops for approval at Step 4.
- Kit data files live in `ui-kit-builder/kits/`. UpS's are renamed `ups-ui-kit.md` (kit) and
  `kit-maps/ups-ui-kit.md` (screens), with a header saying they're UpS's live data and the example.
- `_shared/references/subscription.md` → `upbase-library.md`, which now also holds the antd
  vocabulary table.
- `preflight.js` modes are `design-system` and `kit` (`source` still accepted).

**Added**
- `_shared/references/conventions.md`: platforms, variant count, State vocabulary, contrast, token
  choice, raw values, description format and responsive verbs, shared by every skill.
- The installer records a manifest of the files it installed, so files later dropped from the repo
  get removed on update. Files you added are never removed.

- `product-screen-builder/SKILL.md` was rewritten on the same Step 0–7 route. Anatomy mode moved to
  `references/anatomy-mode.md`.
- `design-system-builder/SKILL.md` is the route through `references/workflow.md`. The parts it
  shared with the kit skill now point to `_shared/references/conventions.md`.
- `ui-kit-builder/kits/ups-ui-kit.md`: page list refreshed from the file (73 pages, mostly UpBase
  names now).
- `ui-kit-builder` Step 2 also reads the kit's gap log and the product's recent changelog.

**Tested**
- `evals/`: dry-run prompts for each skill (read-only, they stop at the proposal). `ui-kit-builder`
  was run against 0.1.0's `ub-component-creator` on 5 prompts: 100% vs 95% of checks passed, with
  ~25% fewer tokens. The only difference is routing: the new skill sends UpBase-file work to
  `design-system-builder`.

## 0.1.0 — 2026-10-14

First release as a standalone repo, for teams other than UpS to build their own kits on UpBase.

**Added**
- `npx` installer (`bin/install.js`): installs into `~/.claude/skills` or `./.claude/skills`, updates
  in place, and keeps files you added.
- Kit registration by data file: `references/kit/_template.md`, `products/_template.md`,
  `kit-maps/_template.md`, `references/kit/gap-log-template.md`. An unregistered file key now stops
  the skill instead of falling back to UpS.
- `references/kit/patterns.md`: lessons that hold in any kit (sizing, exposure chains, variant count,
  slots, overrides, moving components, reaching UpBase from a kit, composing tables).
- `references/upbase-known-issues.md`: measured UpBase defects every kit inherits, plus behaviour
  changes that move instances on accept.
- Kit mode: a proposal gate before building (variant count before → after, approval by the kit's
  owner).
- Source mode: the breaking-change rule. Changelog items get the `⚠ Breaking —` prefix, and every
  registered kit is listed as affected.
- `figma-api-gotchas.md`: hug-to-a-cap text inside instances, `resize()` flipping auto-layout to
  FIXED, aspect-locked token sizing, GRID for equal-height rows, overflow-probe false positives,
  and the screenshot cache.

**Changed**
- `changelog.js` moved into `ub-component-creator/scripts/changelog/`. `author` is now required, and
  the Tag fallback imports UpBase `Tag / Status` in files outside UpS.
- `make-wrapper.js`, `audit-wrappers.js`, `resolve-remote.js` and `preflight-product.js` no longer
  assume UpS. `kitResolve` is an alias of `upsResolve`, and `preflightProduct` requires `kitProbeKey`.
- `product-screen-builder`: the kit map moved to `references/kit-maps/ups.md`.
