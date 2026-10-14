# <Kit name> — gap log

> **Template.** Copy this file to the path named in your kit data file's **Gap log** row (for
> example `docs/kit-gaps/<kit-slug>.md` in your design repo), replace `<Kit name>`/`<file key>`,
> and delete this note. Keep it in **your** repo, not inside the installed skill — it is a living
> record, and the skills folder is overwritten on update. UpS's log is the worked example.

Where the <Kit name> (`<file key>`) can't do what a product screen needs. Written by the
`product-screen-builder` skill as screens are rebuilt or redesigned; read by it before planning a
screen, and by `ub-component-creator` before proposing kit changes. This file is the record — Figma
annotations on screens only cite the GAP id.

**Status:** `open` (no fix planned) · `proposed` (a kit proposal exists) · `in kit` (changed in the
kit, not yet published) · `published` (consumers can use it) · `upstream` (needs a UpBase change —
raised with the UpBase owner) · `wontfix` (accepted as is).

**Entry format**

```
### GAP-nnn · short title
- Seen:         screen(s) · node id
- Component:    kit component (and its UpBase source if the limit is upstream)
- Workaround:   what the screen does today
- Proposed fix: the kit/UpBase change that would remove the workaround
- Status:       open | proposed | in kit | published | upstream | wontfix — date
```

Add new entries at the end with the next number. Don't renumber.

---
