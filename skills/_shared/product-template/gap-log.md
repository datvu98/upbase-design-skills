# <Kit name>: gap log

> **What this file is.** Every place the kit can't do what a product screen needs. When
> `product-screen-builder` hits one, it adds an entry here instead of hand-drawing the missing part.
> `ui-kit-builder` reads it before proposing a kit change and marks entries fixed. Figma annotations
> on screens only cite the GAP id; this file is the record. It lives at
> `upbase/<product>/gap-log.md` in your repo.

**Status:** `open` (no fix planned) · `proposed` (a kit proposal exists) · `in kit` (changed in the
kit, not yet published) · `published` (consumers can use it) · `upstream` (needs a UpBase change,
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
