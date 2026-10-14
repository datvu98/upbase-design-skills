# Proposal mode — an improved screen with today's kit

> **Scope:** Proposal mode. The goal is a version of the screen that would ship with better
> hierarchy and judgement, built **only from what the kit already offers**, next to the faithful
> rebuild so the two can be compared. It's the innovation track: it shows what the product could
> look like, and every place it runs into the kit is a finding.

## The rules (set by the user, 2026-09-30)

1. **Use only what the kit offers.** No new components, no kit changes. If an idea needs one, log
   it as a gap with the proposed fix and design the best version without it.
2. **Keep the reference's context** — the same data, fields, purpose and flow — **but follow the
   components' own structure and conventions.** The component wins on form; the reference wins on
   meaning. Examples: ALL-CAPS button labels become the component's normal sentence case; a dialog
   with no title gets a title written from context; a status shown as a toggle may become the
   status component, with the toggle moved to an action.
3. **Build in the product page's `Proposal` section**, never over the faithful rebuild.

## Workflow

1. **Discuss first, with no tool calls.** When the user says "discuss" or "plan", critique and
   propose in words; don't search or build until they say so.
2. **Critique** the faithful screen with the checklist below. Be specific (which element, what's
   wrong, why it matters to the person using it).
3. **Research on Mobbin** — narrow searches, one pattern each (e.g. "inventory locations list with
   status badge and add location button", "create location form with sections",
   "settings toggles with descriptions", "confirm dialog enabling a feature"). `platform: web`,
   limit 6–8, `output_destination: design_tool`, `output_tool: Figma`. Look at the images; take 2–3
   references per pattern and say concretely what to take from each. Always link `mobbin_url`.
4. **Proposal in chat, then stop** — the template below. Changes to content get a
   *current → proposed → why* table. Real decisions become questions with a recommendation.
5. **Build** after approval, on a clone of the faithful screen (it carries the shell), staged as in
   `build-mechanics.md`.
6. **Verify and hand over** as in SKILL.md, plus a *where the kit limited the design* list — that
   list is the most valuable output of this mode. Append each item to the gap log.

## Critique checklist

Hierarchy and structure
- Is there a page title? Does the page open with what it is, or with a banner/system message?
- Is the primary action where the eye expects it (title row, top-right) or floating alone?
- Are related things grouped (sections with titles), unrelated things separated? Or is everything
  one flat grid at one spacing?
- Does each container earn its place (a card holding one search field doesn't)?

Lists
- Does each row answer *what is it, where, what state* at a glance? Is configuration leaking into
  the list (switch columns) when it belongs on the edit page?
- Status: a readable pill, not a toggle that invites accidental changes.
- Empty values shown as "—"; columns left-aligned, decimal numbers right-aligned, header matching
  its cells; long text truncated with a line cap instead of
  stretching rows; consistent row heights.
- Row actions present and consistent (edit + overflow menu).
- Filters as views (tabs) + search in one row next to the table.

Forms
- Sections that follow the user's mental model (type → identity → contact → address → operations).
- Field widths that fit the content (a 5-character prefix doesn't need 500px); max 2–3 columns.
- Mark the minority: if most fields are required, mark the optional ones (`Mark=Optional`).
- Counters, helper text and tooltips only where they help; a switch's meaning written as a
  description rather than hidden behind "?".
- Conditional fields placed next to what reveals them, with a reason the user can see.
- Actions reachable (sticky or near the content); secondary action visually secondary.
- Validation: inline messages plus a summary when there are many.

Dialogs
- A title that states the decision ("Bật quét xác nhận đóng gói?"), a body that states the
  consequence (key term in bold), buttons in sentence case, primary on the right; or a lighter
  `Popconfirm` anchored to the control that triggered it.

## Proposal template

```
## Proposal: <screen>
**Where** — Proposal section, frame name, size; the faithful rebuild stays untouched.
**Layout, top → bottom** — numbered regions, each: kit component (settings) · content.
**What changes in content** — table: current → proposed → why.
**Tokens / structure** — spacing tokens; nothing detached; slot usage.
**Kit limits I'll hit** — each with the workaround (these become gaps).
**Decisions for you** — 1–3 real questions, each with a recommendation.
```

## What worked on Kho hàng 01 (reference implementation, `34:13172`)

- Title row: `Text` LG Strong "Danh sách kho" + `Text` LG Secondary count, primary `Button` right
  (moved up from its own row). Alert moved **below** the title.
- One controls row: `Tabs / Basic` (HUG, 3 items, its own white fill kept) left, 320px search
  `Input` right — replaced a FilterBar card that held one field. The fill was cleared at first and
  restored: clearing a component's fill is restyling it, which the rules rule out.
- Table: dropped the settings column (1 of 16 switches was on); the one fact that mattered (default
  warehouse) became the cell's inline `Tag` "Mặc định"; status became `Tag / Status` Success /
  Default Filled; row actions "Sửa" + icon-only ellipsis in a HORIZONTAL frame; "—" for empty;
  numbers right-aligned; name 1 line, address 2 lines with ellipsis; "Mã kho: " with a
  `marginXXS` gap.
- Fixed 1024 viewport height so the FloatButton sits in empty space.
- Kit limits found: no title size above LG (GAP-016), GridTable toolbar can't host tabs/search
  (GAP-017), TableToolbar is order-specific (GAP-018), inline tag sits above the text (GAP-020),
  Badge is count-only (use Tag Status), no icons in the kit (GAP-021).
