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

**New here? Read [GUIDE.md](GUIDE.md)** (Vietnamese): what every file and script is for, the problem
it solves, when it's used and what its output looks like, plus the common workflows end to end.

Day to day you'll mostly use `ui-kit-builder` and `product-screen-builder`. A change to the UpBase
file reaches every product, so talk it through with the UpBase owner first, then use
`design-system-builder`.

The skills hold **no product data**. Each team keeps its own in **its design repo**, under
`upbase/<product>/`: four files the skills read and update as you work (kit decisions and status,
how to use the kit on screens, the product file's screens and tokens, and the gap log). The team
commits them, so everyone shares the same memory. UpS was the first team on this chain; its full
data is in `examples/ups/` as a worked example. The second is **uplms**.

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

Updating means running the same command again. The installer overwrites the skills and removes files
the repo has dropped. It never touches your product data, which lives in your own repo. **Don't edit
the installed skill files**, because the next update overwrites them. Send general fixes upstream
(see *Contributing*).

Restart Claude Code after installing. Setup (Figma MCP, Desktop Bridge, token, permissions) is in
**[SETUP.md](SETUP.md)**.

## Registering a product

Do this once, at the root of your team's design repo, before the first build:

```bash
npx github:datvu98/upbase-design-skills init uplms
```

This creates `upbase/uplms/` with four templates:

| File | What it is | Fill now |
|---|---|---|
| `kit-build.md` | the kit's identity, decisions, status | **File key** of the kit (this is what registers it), platform reach, owner, and the *Decisions to make once* table |
| `kit-usage.md` | how to use each kit component on screens | nothing, it grows as you build |
| `product-file.md` | the design file's pages, screens, shell, tokens | **File key** of the product file, **Kit probe key** (any published kit component's key, e.g. your Button), changelog page |
| `gap-log.md` | what the kit can't do yet | nothing |

Then create an empty `_Changelog` page in the kit and a `Changelog` page in the product file, and
**commit `upbase/uplms/`**.

You can also ask Claude to fill it in: open Claude in the repo and say *"register our kit `<url>` and
product file `<url>` for uplms"*. It reads the facts from Figma and **asks you** for the decisions
instead of guessing them. `skills/_shared/product-template/EXAMPLE.md` shows UpS's answers for
reference.

The skills find a product **by the Figma file key**, in `upbase/*/` of the repo Claude is running in.
Run Claude somewhere else and they'll say the file isn't registered. That's deliberate: they stop
rather than guess.

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
| Your kit, product files, and `upbase/<product>/` | your team | — |

> Governance between teams is not final yet: who reviews UpBase requests, publish cadence, and how
> breaking changes are announced beyond the Changelog page. This section will be updated.

## Contributing

- **Lessons that hold for any kit** go to `ui-kit-builder/references/patterns.md`,
  `_shared/references/figma-api-gotchas.md` or `_shared/references/upbase-known-issues.md` by pull request, so every team gets them. Kit-specific
  lessons stay in your own `upbase/<product>/kit-build.md`.
- Added or renamed a file under `skills/`? Add its entry to `GUIDE.md` section 3 and run
  `node bin/check-guide.js`.
- After changing a skill, run its dry-run prompts in `evals/` (see `evals/README.md`).
- Bump `version` in `package.json` and add a `CHANGELOG.md` entry with every change to shipped files.

## Repo layout

```
bin/install.js                 the npx installer
bin/check-guide.js             fails if a file under skills/ has no entry in GUIDE.md
GUIDE.md                       what every file is for (Vietnamese)
evals/                         dry-run test prompts per skill (not installed)
skills/
  design-system-builder/       the UpBase Design System file
    SKILL.md
    references/                workflow (phase detail), foundations, page-template
    scripts/                   helpers, audit-system
  ui-kit-builder/              a product's UI kit
    SKILL.md
    references/                patterns, wrapper-pattern, page-template
    scripts/                   make-wrapper, resolve-remote, audit-wrappers
  product-screen-builder/      a product design file
    SKILL.md
    references/                rebuild-mode, proposal-mode, anatomy-mode, build-mechanics
    scripts/                   preflight-product, helpers, harvest-tokens, walk-integrity, check-overrides
  _shared/                     not a skill: read by all three
    references/                conventions, upbase-library, figma-api-gotchas, verification, tokens,
                               upbase-known-issues
    scripts/                   preflight, check-reflow, audit-coverage, audit-platform, audit-reuse,
                               changelog/changelog.js
    product-template/          kit-build, kit-usage, product-file, gap-log, EXAMPLE: copied by `init`
examples/ups/                  UpS's full data in the upbase/<product>/ layout (not installed)

<your design repo>/upbase/<product>/    your team's data: kit-build, kit-usage, product-file, gap-log
```
