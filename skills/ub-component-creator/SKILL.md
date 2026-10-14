---
name: ub-component-creator
description: Build and change Figma components across the UpBase design system — both the source library (UpBase Design System, `BoGaG48v9BfY7LkMtFs4zh`) and the product UI Kits that consume it (UpS UI Kit, `9c052aEvpV7gYLhwdatf6g`, and future kits). Use this whenever the user wants to create, add, design, build, wrap or extend a component, pattern or variant set in any of those files, including when they only name the thing ("build a Chat component", "add a stepper", "build the UpS filter bar", "wrap Button into the kit", "we need a file uploader") without mentioning tokens, styles or process. Also use it for **pulling a component out of the source library into a kit** and the **local-component-owning-a-remote-instance wrapper pattern**; for deciding whether a platform difference is a token, a variant axis or a separate component; for **responsive and breakpoint behaviour** ("what does this do on a narrow screen", "does this stack at 768"); for **which platforms a component reaches** (web / mobile — iOS and Android are one target); for auditing whether a component is properly bound to tokens and styles; and for why a component "looks off" at compact density. The rules **invert** between authoring the source and composing a kit, so this skill resolves the mode from the target file key before anything else. Prefer it over improvising Figma plugin code, because this system has specific token tiers, 20 text styles, 10 effect styles and naming conventions that are easy to miss and expensive to retrofit.
---

# UpBase components

One system, two roles. Which role you are in changes the rules — not by degree, but by inversion:
the source library forbids duplicating an existing component, and a kit's whole job is to wrap one.
Applying the wrong role's rules produces confident, wrong work, so the mode gate below runs first
and is not optional.

```
UpBase Design System ──publish──▶ product UI Kits ──publish──▶ product design files
BoGaG48v9BfY7LkMtFs4zh           UpS UI Kit, 9c052aEvpV7gYLhwdatf6g, …
```

**This file is deliberately incomplete.** It carries the gate and the shared spine only — no build
recipes, no token guidance, no resolution snippets. Those live in the mode files, and you cannot do
the work without reading one.

## Step 0 — Resolve the mode

The mode comes from a **fact, not a judgement**: the file key of the write target.

```
figma_list_open_files            → which files have the Desktop Bridge plugin open
figma_navigate <url>, lock:true  → pin the target
```

| Target file key | Mode | Then read |
|---|---|---|
| `BoGaG48v9BfY7LkMtFs4zh` | **Source** — authoring the library | `references/source/mode.md` |
| anything else (e.g. `9c052aEvpV7gYLhwdatf6g`) | **Kit** — composing a consumer | `references/kit/mode.md` |

If the user hasn't said which file, ask — don't infer it from the component's name. "Build a filter
bar" is a kit task; "fix Badge's min-width" is a source task; "add a stepper" could be either.

**The mode file opens with its own reading list.** Go there and load what it names before building.
That list is the single source of truth for what to read; this file does not repeat it.

Then pass `fileKey` explicitly on **every** `figma_execute`. The pin protects the default target;
`fileKey` protects the individual call. Two files are usually connected at once and the active
target moves on its own — a write landing in the wrong file is silent.

## Step 1 — Preflight, before the first node

```
scripts/preflight.js  →  await preflight({ mode, fileKey, building })
```

Run it as the first `figma_execute` of any build, in either mode. It asserts the three things that
fail silently and that no audit catches afterwards, because the audits run after the work:

| It checks | Because |
|---|---|
| You are in the file you think you are | The active target drifts; a write into another open file is silent |
| The file behaves like the mode claims | Zero local collections is a **red alert** in Source and **correct** in a kit. The wrong preamble resolves nothing and says so quietly |
| Nothing already matches what you're about to build | `figma_execute` caps at 30s and **a timeout is not a rollback** — the plugin usually finishes, so a retry duplicates the work |

If it returns `blocked`, create nothing and don't work around it — re-pin, or re-read the mode file.

## Tools

| Call | Use for |
|---|---|
| `figma_list_open_files` | Step 0 — what's connected, and which is active |
| `figma_navigate` url, `lock:true` | Pin the write target |
| `figma_execute` + `fileKey` | Everything. Always pass `fileKey`, even when pinned. **Caps at 30s**, and a timeout is not a rollback — chunk the work and guard against duplicates. See `references/figma-api-gotchas.md` |
| `figma_capture_screenshot` | Visual check — reads live plugin state, unlike REST export |
| ~~`figma_search_components`~~ with `libraryFileKey` | **Avoid.** Matches descriptions as well as names, and returns `success: true, results: []` when the REST token expires. Enumerate through the plugin instead — it fails loudly |

## How to tell what a file applies to

**Every reference opens with a `> **Scope:**` line** stating Source, Kit, or both. It is the
authority: if you arrive at a file whose scope doesn't match the mode you resolved at Step 0, you
took a wrong turn — go back rather than reading on. The folders carry the same fact
(`references/source/`, `references/kit/`, root = both), so the two agree by construction.

## Verification applies in both modes

Never skip it, and never reason about density instead of testing it. The procedure is
`references/verification.md`; these are the scripts it calls for.

| Script | Checks | Mode |
|---|---|---|
| `scripts/check-reflow.js` | Content escaping its own bounds — every `overflowPx` must be 0 | both |
| `scripts/audit-coverage.js` | Token/style coverage — exclude instances | both |
| `scripts/audit-platform.js` | Responsive declarations: vocabulary, breakpoint values, proof | both |
| `scripts/audit-reuse.js` | Hand-built elements the library already ships; components too weak to reuse | both |
| `scripts/source/audit-system.js` | Enumerate styles, collections, modes | **Source only** |
| `scripts/kit/audit-wrappers.js` | Exposure, sizing, description, axis drift | **Kit only** |

The two mode-specific ones mislead in the wrong mode: `audit-system.js` reports zeros in a kit,
which is correct there and a red alert in the source.

## Handing over

Separate three things, in both modes: **what's verified** (with evidence — coverage numbers,
contrast ratios, modes tested), **what's deliberately raw or omitted** (and why, so it doesn't read
as an oversight), and **judgement calls you couldn't make** (optical nudges, whether a colour reads
right).

Publishing is always the user's action; you cannot publish. Say plainly which hops are outstanding,
because a kit adds one:

```
source edited → publish source → kit accepts → publish kit → product files accept
```

A kit wrapper does not see a source fix until the kit accepts that update, so it can be silently one
version behind while looking correct.

**Log it before you report done.** Every change to UpBase or a kit gets an entry on that file's
`_Changelog` page: paste `scripts/changelog/changelog.js` (repo root) into `figma_execute` with the
file's `fileKey` and call `addChangelogEntry({ …, status: 'pending', saveVersion: true })`. That
saves a matching named version too. One entry per session per file. If the change continues into
another file, log it there as well and cross-link the two under `related`. When the user says
they've published, flip it with `setChangelogStatus(…, 'published')`. The rules are in the
script's header.

## The map

Folder = scope. Root applies everywhere; `source/` and `kit/` apply to one mode and invert in the
other. **A new kit is one file** — `references/kit/<name>.md` — plus a row in the Step 0 table.

```
SKILL.md                             the gate and the shared spine (this file)

references/
  figma-api-gotchas.md               silent-failure API traps — read before writing plugin code
  verification.md                    mode sweep, stress cases, audit procedure
  tokens.md                          every token: antd's meaning + UpBase's actual value + deviations

  source/                            ── authoring UpBase · everything resolves LOCALLY
    mode.md                          seven phases, reuse gates, build and binding rules
    foundations.md                   collections & modes, styles, component inventory, known gaps
    page-template.md                 doc frame, Playground, Light/Dark pair, Space Mono labels

  kit/                               ── composing a consumer · everything resolves REMOTELY
    mode.md                          seven steps, and the four rules that invert from Source
    wrapper-pattern.md               local component owning a remote instance, exposure semantics
    subscription.md                  file keys, 4 collection keys, all 32 style keys
    page-template.md                 none of the source's chrome — header + three sections
    ups.md                           UpS UI Kit: key, page list, naming, platform reach

scripts/
  preflight.js                       Step 1 — run before the first node, either mode
  check-reflow.js   audit-coverage.js   audit-platform.js   audit-reuse.js

  source/
    helpers.js                       Source preamble — paintVar, bindNum, icon, contrast, propsBlock
    audit-system.js                  enumerate styles, collections, modes

  kit/
    resolve-remote.js                Kit preamble — import by key
    make-wrapper.js                  generate a wrapper
    audit-wrappers.js                exposure, sizing, description, axis drift
```

`helpers.js` and `resolve-remote.js` are **not interchangeable**. Picking the wrong one silently
resolves nothing — which is what `preflight.js` check 2 exists to catch.

**Platform reach has no lookup table.** Nothing in this repo records which platforms a component
ships to. Ask the user; don't go searching.
