# Rebuild mode — a faithful screen from kit instances

> **Scope:** Rebuild mode. The goal is the reference screen, as close as the kit allows, built only
> from kit instances. Improving it is Proposal mode's job — resist fixing what you'd design
> differently, and note it for later instead.

## The rule: content from the reference, form from the component

The reference says **what the screen contains and how it's arranged**. Each kit component says
**what it is made of and how it looks**. When the two disagree about a component's own parts or
styles, **the component wins** — even when that makes the rebuild look less like the screenshot.

Why: the product screenshot is what shipped, not what was designed. A dialog without a title or
all-caps buttons is the implementation drifting from the design system, and a rebuild that copies
the drift teaches the next designer that the drift is correct. The rebuild's job is to show the
screen *as the system would build it*.

| The reference has | The rebuild does |
|---|---|
| A dialog with no title | Keeps the Modal's title and **writes one from context** ("Bật quét xác nhận đóng gói?") — never hides `Head` |
| ALL-CAPS button text ("KHÔNG", "CÓ, KÍCH HOẠT") | Uses the component's own case and style — sentence case ("Không", "Có, kích hoạt") |
| No close × on a dialog | Keeps the component's close button |
| Labels without the form's ":" | Keeps the ":" the Form label ships with |
| Grey-filled inputs, a filled "ⓘ" help icon, different radii or colours | Uses the kit's styles as shipped |
| The required "*" after the label | Uses the component's placement |

Each such difference goes in the handover under *differs from the reference*, with a GAP id when
it's a component limit rather than a convention.

**The rule is about a component's own parts — not about adding structure.** Don't wrap a region
in an extra component to host something (a `Card / Basic` around a GridTable just to get tabs
inside it): the wrapper brings its own head and title, which the screen never had. Use the
component that *is* the region (GridTable is the card) and place companions beside it.

**When the user flags a component's look as wrong on the screen** (e.g. the Tabs' white panel on
the grey page), they decide: apply the override they ask for, say it's an exception, and log the
kit fix as a gap so the component can change instead.

## Established usage beats the reference

When the reference shows a component configured differently from how the other built screens use
it, **follow the other screens**, not the reference — change it only when the user says so. The
first case: Xuất nhập 09's reference has column dividers, every other list uses the plain
GridTable, so 09 uses the plain GridTable (user, 2026-10-02).

Before configuring a component, look at how the screens already in the file configure it (the
screen register in the product data file, and `kit-map-ups.md`, which records the agreed
configuration). If the reference disagrees, use the established one and list the difference in the
handover. If no screen has used the component yet, follow the reference and the kit map. User
preferences recorded in the kit map (e.g. single row actions are icon-only `Default` buttons)
apply the same way.

## What "faithful" still means

Within that rule, match, in this order of importance:

1. **Content** — every label, placeholder, value, count, error message, badge number; the same
   rows in the same order; which option is checked, which toggle is on or disabled. Wording stays
   exactly as in the reference; only its *case and styling* follow the component.
2. **Structure of the screen** — the same regions in the same arrangement; the same fields per
   row; the same columns in the same order.
3. **State** — errors, disabled, active tab/menu item, expanded group, modal open.
4. **Proportions** — column widths, relative spacing. Table column alignment is **not** taken from
   the reference: left for everything, right for decimal numbers, header matching its cells
   (`kit-map-ups.md` › Column alignment).

## Allowed adjustments

Instance-level, and none of them change what a component is made of:

- **Removing the kit's placeholder content** — demo children in a slot (a Card head's default
  "More" action, a table's sample rows), unused repeated items (extra tab items, unused submenu
  entries). That's filling the component in, not reshaping it.
- Alignment inside slots and header cells — for table columns, per the alignment rule (left;
  decimals right).
- Sizing: FILL/HUG/fixed widths on slot children; HUG on wrappers that clip their content.
- Composing kit instances beside a component to cover a count it can't reach — e.g. a 4th `Radio`
  after an Inline Radio Group with 3 — at the component's own spacing. Log it as a gap.

Not allowed: hiding a component's structural parts (title, close button, colon, icons, required
mark) to mimic the screenshot; changing text case or type styles to mimic it; clearing or recolouring
a component's fills; detaching; drawing a missing part by hand; local components.

## What to leave out, and say so

- Third-party widgets the kit doesn't model (Zalo bubble, mascot) — the kit `FloatButton` stands in
  for the product's own chat entry.
- Content cut off at the screenshot edge (a column you can only see a sliver of, a footer below the
  crop). Don't guess its content.
- The reference's typos and data oddities are **content** — keep them (they're what the product
  shows).

## Variants of one screen

Modules come as a family: a list, its create form, then the form in different states. Build the
richest base once, then **clone and diff**:

- Clone the finished sibling screen, rename, place it, then change only what differs.
- New rows inside a slotted frame: create the empty row frame in one call, fill it in the next.
- Error states: `scripts/helpers.js` › `setFieldError` — it restores the placeholder and counter
  that a `Status` variant change would otherwise wipe.
- Re-position the FloatButton on every clone — it keeps the source's y.

## Checklist before handing over

- [ ] Every text in the reference is present, including placeholders, counters and captions
- [ ] States match: checked radio, on/off/disabled toggles, errored fields, active nav items
- [ ] Header and cell widths identical per column; header and cells aligned the same way — left,
      or right for decimal numbers
- [ ] Nothing clipped (counters, captions, last column), nothing overlapping (FloatButton)
- [ ] `walk-integrity.js`: 0 unreadable, top level = kit components only
- [ ] `check-overrides.js`: 0 layout overrides, or each one user-requested and listed
- [ ] Screenshot compared with the reference, region by region
- [ ] Every deviation listed with a GAP id; new gaps appended to the log
- [ ] Screen register updated in the product data file
