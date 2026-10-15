# Evals

Dry-run test prompts for each skill. Every prompt runs **read-only** and stops at the skill's
proposal step, so a run never changes a Figma file.

| File | Skill | Needs open in Desktop Bridge |
|---|---|---|
| `ui-kit-builder.json` | ui-kit-builder | UpS UI Kit, UpBase Design System, and one unregistered kit |
| `product-screen-builder.json` | product-screen-builder | UpS Product 2026, and one unregistered product file |
| `design-system-builder.json` | design-system-builder | UpBase Design System, UpS UI Kit |

**Run them from a project that has UpS's data** at `upbase/ups/`: copy `examples/ups/` there, plus a
`gap-log.md` (an empty one from `skills/_shared/product-template/` is fine). Without it, every
"registered kit" prompt correctly stops as unregistered.

Run them with the `skill-creator` skill after changing a skill. Tell it the eval file, ask for
**dry runs** (read-only Figma calls, no `figma_navigate`, stop at the proposal), and compare against
the previous version of the skill. Each eval lists the checks (`assertions`) a run should pass.

Add a prompt whenever a real session goes wrong in a way a skill should have prevented. That is how
the set stays useful.
