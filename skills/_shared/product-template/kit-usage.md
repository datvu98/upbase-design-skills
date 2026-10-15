# Kit usage: <Kit name> on product screens

> **What this file is.** How to use this kit's components on product screens: which component
> covers which screen region, which property keys to set, and the configurations the team agreed
> on. `product-screen-builder` reads it before mapping a screen and adds to it when the user agrees a
> new rule. `ui-kit-builder` adds an entry when it creates or changes a component, so screen builders
> can use it right away. It lives at `upbase/<product>/kit-usage.md` in your repo.
>
> **Filling it in.** It starts nearly empty and grows as screens get built. Record rules and keys,
> not history. The full UpS version is in the skills repo (`examples/ups/kit-usage.md`).

| | |
|---|---|
| **Kit** | <Kit name>, file key `<kit file key>` (same as `kit-build.md`) |

## How kit components are shaped

> Fill this in after the first screen. Is a component a wrapper or a composition? Where do its real
> properties live? For a wrapper they're on `inst.children[0]`. Which compositions expose SLOTs?

## Region → component

> One row per screen region the product uses. Record the agreed configuration, the user's
> preference with its date, and the gap id when the kit can't match. This table is what
> "established usage beats the reference" reads (`product-screen-builder/references/rebuild-mode.md`).

| Screen region | Use | Notes |
|---|---|---|
| App top bar | <…> | |
| Left navigation | <…> | |
| Page title | <…> | |
| Record list | <…> | |
| Filters above a list | <…> | |
| Empty state | <…> | |
| Form field | <…> | |
| Confirmation dialog | <…> | |

## Table rules

> Decide these with the product owner. `rebuild-mode.md` applies them instead of copying the
> reference. Until they're decided, the UpS rules apply and the handover says so:
> **alignment**: header and cells together, left; decimal numbers (money, rates) right.
> **widths**: first column fixed from its longest identifier (IDs never truncate); middle columns
> FILL with `minWidth` set to unbreakable content (dates, emails); actions fixed.

- Alignment: <…>
- Widths: <…>

## Components, keys and property keys

> Import by **variant** key. Property keys carry a `#id` suffix. Record the exact ones as you use
> them, or read `Object.keys(node.componentProperties)` first.

| Component | Key | Properties |
|---|---|---|
| <…> | <…> | <…> |

## Finding something not listed

Enumerate the kit through the plugin, in the kit file, read-only, before concluding a component is
missing. Most "missing" things are a slot fill, a variant, or a component under another name.
