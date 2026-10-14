# Product: <Product file name>

> **Template.** Copy to `references/products/<product-slug>.md`, fill every `<…>`, delete the
> guidance blockquotes. The **File key** row is what registers the product — until it holds the
> real key, the skill stops. `products/ups-product-2026.md` is the filled example.
>
> **Scope:** this product file only. Constants and state for building screens in it.

| | |
|---|---|
| **File key** | `<22-character key from figma.com/design/<KEY>/…>` |
| **URL** | <https://www.figma.com/design/…> |
| **Consumes** | <Kit name> `<kit file key>` — <only the kit, or also UpBase?> |
| **Kit map** | `references/kit-maps/<kit-slug>.md` |
| **Kit probe key** | `<key of any published kit component, e.g. its Button>` — pass to `preflightProduct` |
| **Gap log** | `<path in your design repo, e.g. docs/kit-gaps/<kit-slug>.md>` |
| **Changelog page** | `Changelog` (`<node id>`) — create it empty before the first logged session |
| **Owner** | <who approves screen proposals> |
| **Local variables / styles** | <none — harvest bound ones, below> |

## Pages and sections

> Which page this skill works on, where references live (read-only), where faithful rebuilds go,
> where Proposal-mode output goes, and the user's scratch areas to stay out of. Look sections up
> by name — ids change when the file is reorganised.

| Page (id) | Holds |
|---|---|
| <…> | <…> |

## Screen register

> One row per screen: reference node → rebuild node → notes. Update it at the end of every
> session; it is how the next session knows what exists.

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| <…> | <…> | <…> | <…> |

## The shell every screen shares

> Once the first screen is built: frame width, page padding, header, navigation, banners, floating
> buttons — and which finished screen to clone for a list and for a form.

## Harvested tokens

> Product files usually can't import variables. Run `scripts/harvest-tokens.js` on a built screen
> and record the variable ids here (token · value · id). Re-harvest if one fails to resolve.

| Token | Value | Variable id |
|---|---|---|
| <…> | <…> | <…> |

## UpBase icons used (imported by key)

| Icon | Key | Used for |
|---|---|---|
| <…> | <…> | <…> |
