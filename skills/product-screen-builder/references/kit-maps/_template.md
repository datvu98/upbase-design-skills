# Kit map: <Kit name> → product screens

> **Template.** Copy to `references/kit-maps/<kit-slug>.md` and fill it as screens get built — it
> starts nearly empty and grows. One kit map serves every product file that consumes that kit.
> `kit-maps/ups-ui-kit.md` is the filled example: copy its shape and its *kinds* of rules, never its keys.
>
> **Scope:** product files consuming <Kit name> (`<kit file key>`). What to reach for per screen
> region, how to import it, and which property keys to set.

## How kit components are shaped

> Wrapper or composition? Where do the real properties live (`inst.children[0]` for a wrapper)?
> Which compositions expose SLOTs? Fill this in after the first screen — UpS's section is a good
> starting point if the kit is built the same way.

## Region → component

> One row per screen region the product uses. Record the agreed configuration, the user's
> preferences (with date), and the gap id when the kit can't match. This table is what
> "established usage beats the reference" reads (`references/rebuild-mode.md`).

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

> Decide with the product owner and record here; `rebuild-mode.md` applies them instead of copying
> the reference. Until decided, the UpS rules apply and the handover says so:
> **alignment** — header and cells together, left; right for decimal numbers (money, rates).
> **widths** — first column fixed from its longest identifier (IDs never truncate), middle columns
> FILL with `minWidth` set to unbreakable content (dates, emails), actions fixed.

- Alignment: <…>
- Widths: <…>

## Components, keys and property keys

> Import by **variant** key. Property keys carry a `#id` suffix — record the exact ones as you use
> them, or read `Object.keys(node.componentProperties)` first.

| Component | Key | Properties |
|---|---|---|
| <…> | <…> | <…> |

## Finding something not listed

Enumerate the kit through the plugin, in the kit file (read-only), before concluding a component is
missing — most "missing" things are a slot fill, a variant, or a component under another name.
