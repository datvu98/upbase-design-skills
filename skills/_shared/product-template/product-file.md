# Product file: <Product file name>

> **What this file is.** `product-screen-builder`'s memory for one product design file: where
> things go, which screens exist, the shell every screen shares, and the tokens and icons it can
> reach. Read at Step 0 of every session and updated at the end. It lives at
> `upbase/<product>/product-file.md` in your repo. A product with several design files gets one
> copy per file: `product-file-<name>.md`.
>
> **Filling it in.** Fill the header table when you register. The **File key** row is what
> registers the file. Everything below grows as screens are built. The full UpS version is in the
> skills repo (`examples/ups/product-file.md`).

| | |
|---|---|
| **File key** | `<22 characters after figma.com/design/ in the product file's URL>` |
| **URL** | <https://www.figma.com/design/…> |
| **Consumes** | <Kit name> `<kit file key>`. <only the kit, or also UpBase?> |
| **Kit probe key** | `<key of any published kit component, e.g. its Button>`. Passed to `preflightProduct` |
| **Changelog page** | `Changelog` (`<node id>`). Create it empty before the first logged session |
| **Owner** | <who approves screen proposals> |

The kit usage, gap log and kit build notes are the other files in this folder.

## Pages and sections

> Which page the skill works on, where reference screenshots live (read-only), where faithful
> rebuilds go, where Proposal-mode output goes, and which scratch areas to stay out of. Sections are
> looked up by name, because ids change when the file is reorganised. Don't list every page; the
> skill re-reads the page list from the file.

| Page / section | Holds |
|---|---|
| <…> | <…> |

## Screen register

> One row per screen: reference node → rebuild node → notes. The skill updates it at the end of
> every session; it is how the next session knows what exists.

| # | Reference | Rebuild | Notes |
|---|---|---|---|
| <…> | <…> | <…> | <…> |

## The shell every screen shares

> Fill this in once the first screen is built: frame width, page padding, header, navigation,
> banners, floating buttons, and which finished screen to clone for a list and for a form.

## Harvested tokens

> Product files usually can't import variables. Run `product-screen-builder/scripts/harvest-tokens.js`
> on a built screen with `/^(Space|Colors)\//` and record the ids here. Re-harvest if one stops
> resolving.

| Token | Value | Variable id |
|---|---|---|
| <…> | <…> | <…> |

## UpBase icons used (imported by key)

| Icon | Key | Used for |
|---|---|---|
| <…> | <…> | <…> |
