# UpBase design skills

Three Claude Code skills for building on the **UpBase Design System** in Figma, one per file in the
chain:

| Skill | Builds | In |
|---|---|---|
| **`design-system-builder`** | components, tokens and styles every product shares | the **UpBase Design System** file |
| **`ui-kit-builder`** | your product's components: wrappers over UpBase atoms, and product compositions | your **UI kit** file |
| **`product-screen-builder`** | screens assembled only from kit instances: faithful rebuilds, anatomy callouts, proposal redesigns | your **product design** file |

```
UpBase Design System ──publish──▶ <your> UI kit ──publish──▶ <your> product files
design-system-builder               ui-kit-builder              product-screen-builder
```

Day to day you'll mostly use `ui-kit-builder` and `product-screen-builder`. A change to the UpBase
file reaches every product, so talk it through with the UpBase owner first, then use
`design-system-builder`.

UpS (UpS UI Kit + UpS Product 2026) is the first team on this chain. Its data files
(`ups-ui-kit.md`, `ups-product-2026.md`) are UpS's live data. They also serve as the **worked
example** of a filled-in template: copy their shape, never their values. A skill only reads a team's
data file when that team's Figma file is the target.

You invoke the skills by describing the task ("wrap Select into our kit", "rebuild this screen from
the screenshot"), or by name: `/ui-kit-builder`, `/product-screen-builder`, `/design-system-builder`.

Every skill runs the same loop: **check → propose (stop for approval) → build → verify → log →
hand over.**

## Install and update

```bash
npx github:datvu98/upbase-design-skills             # ~/.claude/skills (all projects)
npx github:datvu98/upbase-design-skills --project   # ./.claude/skills (this repo only)
npx github:datvu98/upbase-design-skills --dry-run   # show what would change
```

Updating means running the same command again. Files shipped by the repo are overwritten. Files you
added are kept: your kit's data file, your product's data file. The installer lists them so you can
see they survived. **Don't edit shipped files.** Your edits are lost on the next update. Put
anything kit-specific in your own data files, and send general fixes upstream (see *Contributing*).

Restart Claude Code after installing. Setup (Figma MCP, Desktop Bridge, token, permissions) is in
**[SETUP.md](SETUP.md)**.

## Registering your kit

A skill recognises a Figma file **only through a data file whose `File key` row holds that file's
key**. On an unknown key it stops and offers to help you create one. It never borrows UpS's data:
UpS's node ids and conventions would land in your file.

**1. Kit → `ui-kit-builder`**

1. Copy `skills/ui-kit-builder/kits/_template.md` to `skills/ui-kit-builder/kits/<your-kit>.md`.
2. Fill the header table. The **File key** is the 22 characters after `figma.com/design/` in the
   kit's URL. **Platform reach** (Web / Mobile / both) and **Owner** are required.
3. Answer **Decisions to make once**: wrapper naming, page shapes, template page, docs header.
   UpS's answers are listed beside each for reference. These are the choices that look like
   mistakes later if nobody wrote them down.
4. Fill the page list and page triage. The status table and notes grow as you build.
5. Create a gap log from `ui-kit-builder/kits/_gap-log-template.md` **in your own design repo**, not
   inside the skills folder, and put its path in the **Gap log** row.
6. Create an empty page called `_Changelog` in the kit file.

**2. Product file → `product-screen-builder`**

1. Copy `skills/product-screen-builder/references/products/_template.md` to
   `.../products/<your-product>.md` and fill it. **Kit probe key** = the key of any published kit
   component, for example your Button.
2. Copy `.../kit-maps/_template.md` to `.../kit-maps/<your-kit>.md`. It starts nearly empty and
   fills in as screens get built.
3. Create an empty `Changelog` page in the product file.

You can also ask Claude to do it: *"register our kit `<url>` with ui-kit-builder"*. It will
walk you through the template and ask for the decisions instead of guessing them.

**Where the data files live.** Locally, they survive updates. Each teammate needs the same files,
though. Recommended: commit them to this repo via a pull request (ask the owner for access). Then
everyone gets them with `npx`, and the file key → data file lookup works the same on every machine.

## How a build goes

Every skill follows the same loop. Expect Claude to stop at step 2.

1. **Read-only first.** It pins the file, runs a preflight, enumerates your kit, and searches UpBase.
2. **Proposal, then stop.** It posts a written proposal in chat and waits for approval. For a
   component, the proposal covers shape, name, anatomy and **variant count before → after**. For a
   screen, it covers region-by-region mapping and gaps. Minimising variants is a design goal here:
   anything that isn't colour or text alignment should be a boolean, swap, slot or text property.
3. **Build in small calls.** `figma_execute` stops at 30s, and a timeout is not a rollback. The
   skills chunk the work and guard against duplicates.
4. **Verify.** Screenshots, a density sweep (Default/Compact), reflow probes, token coverage, and
   wrapper drift checks. Numbers go in the handover.
5. **Log.** An entry on the file's `_Changelog` page, plus a named version. Pass your own name as
   `author`.
6. **You publish.** Then the next hop accepts the update.

Something the kit genuinely lacks is a **gap**, not something to hand-draw on a screen. It goes in
your gap log. Something UpBase lacks, or an atom that needs to look different (padding, colour,
indent), is a **UpBase change**: raise it with the UpBase owner. Don't override it inside your kit.
Overrides on nested UpBase instances don't survive in product files
(`ui-kit-builder/references/patterns.md` › *Fix atoms upstream*).

## Following UpBase changes

- **The UpBase `_Changelog` page** is the source of truth. Items marked **⚠ Breaking —** say what
  you must do when you accept that publish.
- **`_shared/references/upbase-known-issues.md`** lists measured UpBase defects every kit inherits: status
  colours that fail contrast, the invisible focus ring, the chart palette, density-blind Card
  padding, and more. It also has a table of behaviour changes that move instances on accept. Read it
  before reporting something as your bug.
- After accepting a UpBase update in your kit, run `ui-kit-builder/scripts/audit-wrappers.js`. It catches axis
  drift that is invisible on the canvas.
- **This repo's `CHANGELOG.md`** covers changes to the skills themselves. Check it after each update.

## Who owns what

| Thing | Owner | How to reach |
|---|---|---|
| UpBase Design System file, its tokens and components | UpBase (Dat Vu) | <channel — to be agreed> |
| These skills | Dat Vu | pull request / issue on this repo |
| Your kit, product files, gap log, data files | your team | — |

> Governance between teams is not final yet: who reviews UpBase requests, publish cadence, and how
> breaking changes are announced beyond the Changelog page. This section will be updated.

## Contributing

- **Lessons that hold for any kit** go to `ui-kit-builder/references/patterns.md`,
  `_shared/references/figma-api-gotchas.md` or `_shared/references/upbase-known-issues.md` by pull request, so every team gets them. Kit-specific
  lessons stay in your own data file.
- After changing a skill, run its dry-run prompts in `evals/` (see `evals/README.md`).
- Bump `version` in `package.json` and add a `CHANGELOG.md` entry with every change to shipped files.

## Repo layout

```
bin/install.js                 the npx installer
evals/                         dry-run test prompts per skill (not installed)
skills/
  design-system-builder/       the UpBase Design System file
    SKILL.md
    references/                workflow (phase detail), foundations, page-template
    scripts/                   helpers, audit-system
  ui-kit-builder/              a product's UI kit
    SKILL.md
    kits/                      _template.md, _gap-log-template.md, ups-ui-kit.md, <your-kit>.md
    references/                patterns, wrapper-pattern, page-template
    scripts/                   make-wrapper, resolve-remote, audit-wrappers
  product-screen-builder/      a product design file
    SKILL.md
    references/
      products/                _template.md, ups-product-2026.md, <your-product>.md
      kit-maps/                _template.md, ups-ui-kit.md, <your-kit>.md
      rebuild-mode.md  proposal-mode.md  build-mechanics.md
    scripts/                   preflight-product, helpers, harvest-tokens, walk-integrity, check-overrides
  _shared/                     not a skill: read by all three
    references/                conventions, upbase-library, figma-api-gotchas, verification, tokens,
                               upbase-known-issues
    scripts/                   preflight, check-reflow, audit-coverage, audit-platform, audit-reuse,
                               changelog/changelog.js
```
