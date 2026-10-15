# Kit: <Kit name>

> **Scope: ui-kit-builder, this kit only.** Constants for <Kit name>. Read it **before**
> `SKILL.md`, which carries the procedure this fills in.
>
> **This is a template.** Copy it to `kits/<kit-slug>.md`, fill every `<…>`, delete the
> guidance blockquotes. The **File key** row is what registers the kit — until it holds the real
> key, the skill treats the kit as unregistered and stops. `kits/ups-ui-kit.md` is a
> fully filled example — copy its shape, never its values.

| | |
|---|---|
| **File key** | `<22-character key from the Figma URL: figma.com/design/<KEY>/…>` |
| **File name** | <exact Figma file name> — match on the key, never the name |
| **Consumes** | UpBase Design System, `BoGaG48v9BfY7LkMtFs4zh` |
| **Published as a library** | <Yes / not yet> — <which product files subscribe to it> |
| **Product files subscribe to** | <this kit only / this kit + UpBase> — <who decided, date> |
| **Platform reach** | <Web · Mobile · both> — decides whether descriptions carry `Web:`, `Native:` or both |
| **Naming** | <rule — e.g. "wrappers keep UpBase's exact set name" (UpS) or "product vocabulary"> |
| **Owner** | <team / person who approves proposals for this kit> |
| **Changelog page** | `<page name>` (`<node id>`) — create it before the first logged change |
| **Gap log** | `<path, e.g. docs/kit-gaps/<kit-slug>.md in your design repo>` — copy `kits/_gap-log-template.md` |

> **Fill the Platform reach row by asking, never by guessing.** It changes what every description
> says and whether a `Platform` axis is even allowed. iOS and Android are one target: `Mobile`.

## Decisions to make once

> These are the choices UpS made that look like mistakes if nobody wrote them down. Decide each one
> for this kit, record the answer and the date, and the skill will follow it. UpS's answer is in
> brackets as a reference point, not a default.

| Decision | This kit | [UpS] |
|---|---|---|
| Wrapper name — UpBase's exact name, or product vocabulary? | <…> | UpBase's exact name, incl. `/ Basic` suffixes; `audit-wrappers` flags it and that is accepted |
| Nested layer name inside a wrapper | <…> | same as the wrapper |
| Page shape for a page that wraps one atom | <…> | 2 nodes: `_Docs / Page Header` + `Components` section |
| Page shape for a composition page | <…> | full kit template (`references/page-template.md`) |
| Template page (the one to copy) | <page · node id> | `❖ Form` (`5:20`) |
| Docs header component | <node id — `_Docs / *` from UpBase can't be imported> | `_Docs / Page Header` `31:48804` |
| Build plan / table of contents page | <page · node id, or none> | `_Table of Content` (`1:2`) |

## Page list

> Paste the page names in order. `❖` marks a component page in UpBase's convention; keep it if you
> use it, so the triage below can refer to pages by name.

```
<page names>
```

## Page triage

> For each component page: does it **wrap** a UpBase component (same name or another name), or is
> it a **composition** of ≥2 UpBase components? Wrapping is the default. A generic control that
> UpBase lacks is not built here — it goes to the UpBase owner as a request (Step 3 gate in
> `SKILL.md`). Re-run the Step 2 plugin search before trusting a row: UpBase grows,
> and a row can flip from *compose* to *wrap*.

**Wraps a UpBase component of the same name:** <…>

**Wraps a UpBase component under a different name:**

| Kit page | UpBase source |
|---|---|
| <…> | <…> |

**Product-specific — composed from ≥2 UpBase components:** <…>

## Local scaffolding

> Components the kit owns only for its own documentation (page header, labels). UpBase's
> `_Docs / *` are unpublished by design, so a kit needs its own. Record node id and key, and note
> that an unpublished local component must be instanced by node id, not imported by key.

- <…>

## Status

> What this skill has built, one row per page. Keep it current — it is the next session's memory.
> It is **not** the kit's inventory; enumerate the file before composing (see `ups-ui-kit.md` › *The
> Status table is not the kit's inventory*).

| Page | Holds | Kind |
|---|---|---|
| <…> | <…> | wrapper / composition |

## Notes

> Dated, per-component findings: why a wrapper is sized the way it is, accepted audit flags,
> UpBase changes the kit is waiting to accept, open issues. Newest first. Lessons that would apply
> to *any* kit belong in `references/patterns.md` instead — tell the skills repo owner so they reach
> every kit.
