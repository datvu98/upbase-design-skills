# Changelog

Changes to the skills themselves. Changes to the Figma files are on each file's `_Changelog` page.

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
