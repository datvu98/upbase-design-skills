# Kit build notes: <Kit name>

> **What this file is.** The `ui-kit-builder` skill's memory for this kit: the kit's identity, the
> decisions it has made, what has been built and why. The skill reads it at Step 0 of every session
> and updates *Status* and *Notes* at the end. It lives in **your** repo at
> `upbase/<product>/kit-build.md`, so the whole team shares it through git.
>
> **Filling it in.** Fill the header table and *Decisions to make once* when you register the kit,
> before the first build. The **File key** row is what registers the kit: the skill finds this file
> by searching for that key. Delete these guidance blockquotes when done. Want to see one filled in?
> Read `_shared/product-template/EXAMPLE.md`, or the full UpS version in the skills repo
> (`examples/ups/kit-build.md`).
>
> **Keeping it useful.** Keep the current state and the decisions. Dated history ("on the 21st we
> did X") goes on the kit's Figma `_Changelog` page instead. Don't copy what Figma can tell you,
> such as the page list, because a copy goes stale; the skill re-reads it from the file. A lesson
> that would hold for *any* kit belongs in `ui-kit-builder/references/patterns.md` (send it as a
> pull request to the skills repo).

| | |
|---|---|
| **File key** | `<22 characters after figma.com/design/ in the kit's URL>` |
| **File name** | <exact Figma file name> (match on the key, never the name) |
| **Consumes** | UpBase Design System, `BoGaG48v9BfY7LkMtFs4zh` |
| **Published as a library** | <Yes / not yet>. <which product files subscribe to it> |
| **Product files subscribe to** | <this kit only / this kit + UpBase> |
| **Platform reach** | <Web · Mobile · both>. Decides whether descriptions carry `Web:`, `Native:` or both |
| **Owner** | <who approves proposals for this kit> |
| **Changelog page** | `_Changelog` (`<node id>`). Create it empty before the first logged change |

> **Ask for Platform reach; never guess it.** It changes every description, and whether a
> `Platform` axis is allowed at all. iOS and Android are one target: `Mobile`.

## Decisions to make once

> These are the choices that look like mistakes later if nobody wrote them down. Decide each for
> this kit, with a date. The skill follows what's written here over its own defaults. UpS's answer
> is shown for reference, not as a default.

| Decision | This kit | [UpS] |
|---|---|---|
| Wrapper name: UpBase's exact name, or product vocabulary? | <…> | UpBase's exact name, incl. `/ Basic` suffixes; `audit-wrappers` flags it and that is accepted |
| Nested layer name inside a wrapper | <…> | same as the wrapper |
| Page shape for a page that wraps one atom | <…> | 2 nodes: `_Docs / Page Header` + `Components` section |
| Page shape for a composition page | <…> | the full kit template (`ui-kit-builder/references/page-template.md`) |
| Template page to copy | <page · node id> | `❖ Form` (`5:20`) |
| Docs header component (UpBase's `_Docs / *` can't be imported) | <node id> | `_Docs / Page Header` `31:48804` |
| Build plan / table of contents page | <page · node id, or none> | `_Table of Content` (`1:2`) |

## Page triage

> For each component page: does it **wrap** a UpBase component, or is it a **composition** of ≥2
> components? Wrapping is the default. A generic control UpBase lacks is not built here; raise it
> with the UpBase owner. Re-run the skill's Step 2 search before trusting a row, because UpBase
> grows and a row can flip from *compose* to *wrap*.

**Wraps a UpBase component of the same name:** <…>

**Wraps a UpBase component under a different name:**

| Kit page | UpBase source |
|---|---|
| <…> | <…> |

**Product-specific, composed from ≥2 components:** <…>

## Local scaffolding

> Components the kit owns only for its own documentation (page header, labels). Record node id and
> key. An unpublished local component is instanced by node id, not imported by key.

- <…>

## Status

> What has been built, one row per page. The skill updates it at the end of every session. It is
> **not** the kit's full inventory, so the skill still enumerates the file before composing.

| Page | Holds | Kind |
|---|---|---|
| <…> | <…> | wrapper / composition |

## Notes

> Per-component decisions that would otherwise be rediscovered: why a wrapper is sized the way it
> is, audit flags accepted on purpose, UpBase changes the kit is waiting to accept, open issues.
> Newest first. Keep each to what is still true.
