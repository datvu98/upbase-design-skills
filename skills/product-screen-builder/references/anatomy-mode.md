# Anatomy mode — name the components on a screenshot

> **Scope:** Anatomy mode. The output is callout labels with leader lines on a **copy** of the
> reference image, naming the kit component behind each region. Nothing is rebuilt.

## Where it goes

- A new section named `Anatomy / <Module> <nn>`, placed where it doesn't overlap existing sections
  (the product data file's *Pages and sections* says which page).
- Draw on a **copy** of the reference image, never on the original.
- Copy the style of an existing anatomy/example section in the product file. UpS has one, `Example`
  on `↳ Specifications`. Look it up by name, since ids change when the file is reorganised. A product
  with none yet: copy UpS's style and say so.

## What a label says

- The kit component's **exact** name (`Menu / Sidebar / Rail`, `GridTable / Stacked Cell`), from the
  kit map or an enumeration of the kit. Never a generic word ("table", "sidebar").
- Slot compositions as `Table Cell (Content slot): Text + Tooltip + Switch`. Composing inside a slot
  is normal use, not a gap.
- A region the kit can't express is labelled as a gap with its id from the gap log, or with a new
  one.

## How it's drawn

- Labels 24px bold, one colour. 1px leader lines end in an arrow at the target. Build them with
  `setVectorNetworkAsync`, because the sync setter throws.
- Keep lines straight and parallel to an edge. Stagger labels so no line crosses another label.

## Hand over

List what you labelled, what you deliberately didn't (and why), and any mapping that's a judgement
call. Anatomy-only sessions change no product screens, so they aren't logged on the Changelog page.
