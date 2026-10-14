# Setup

Everything the skills need before the first build. About 15 minutes the first time. If something in
here is already done, skip it.

## 1. Claude Code

Any surface works (CLI, desktop, VS Code / JetBrains). The skills run Figma plugin code, so the
machine also needs **Figma Desktop**.

## 2. Install the skills

```bash
npx github:datvu98/upbase-design-skills            # → ~/.claude/skills, for all your projects
npx github:datvu98/upbase-design-skills --project  # → ./.claude/skills, this repo only
```

Pick **one** location. The installer warns if it finds the same skill in both, because both copies
load and Claude may pick either. Manual alternative: clone the repo and copy `skills/*` into one of
those folders.

The repo is private, so `npx` uses your own git credentials. If it can't clone, check
`git ls-remote https://github.com/datvu98/upbase-design-skills` works, or run `gh auth login`
then `gh auth setup-git`.

## 3. figma-console MCP + Desktop Bridge

All writes go through the **figma-console** MCP server, which talks to Figma Desktop through its
**Desktop Bridge** plugin.

Add the server (user scope, so every project sees it):

```bash
claude mcp add figma-console --scope user \
  --env FIGMA_ACCESS_TOKEN=<your token, step 4> \
  -- npx -y figma-console-mcp@latest
```

Then in Figma Desktop, open the file you'll work in and run **Plugins → Development → Figma Desktop
Bridge**. Follow the figma-console-mcp README for the one-time plugin import if it isn't listed.

Check it from Claude Code: ask it to run `figma_list_open_files`. Your file should be listed.

**Keep the Bridge window open while Claude works.** Figma suspends plugins when the tab loses
focus. The symptom is "Cannot connect to Figma Desktop". Reopen the plugin. Nothing is lost.

## 4. Figma access token

Only the REST-backed tools need it: version history, reading files that aren't open, and library
listings. Plugin-side work doesn't need it.

Create one in Figma → Settings → Security → Personal access tokens, with **read** scopes for file
content and library assets. Tokens are issued with short lifetimes. **An expired token doesn't
error.** Cross-file search returns `success: true, results: []`, which reads as "this component
doesn't exist". The skills avoid REST search for that reason. If anything REST-based returns
nothing, check the token first:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" https://api.figma.com/v1/me
```

`200` is fine. `401` or `403` means replace it, then restart Claude Code or run `/mcp` to reconnect.

## 5. Figma files and permissions

| File | You need | Why |
|---|---|---|
| **UpBase Design System** `BoGaG48v9BfY7LkMtFs4zh` | **enabled as a library** in your kit file | wrappers nest UpBase components and bind its variables |
| UpBase Design System | **open in Desktop Bridge** while building | `ui-kit-builder` searches UpBase through the plugin before building anything (Step 2) |
| your kit file | edit | the skill writes here |
| your product file(s) | edit, with your kit enabled as a library | `product-screen-builder` writes here |

> **Check with the UpBase owner** which access level your team gets on the UpBase file. A view-only
> seat may not be able to run the Bridge plugin in it. In that case the plugin-side search in Kit
> mode Step 2 has to run on someone else's machine, or the UpBase owner shares a component list.

Publishing is always done by a person in Figma. The skills never publish.

## 6. Optional

| Tool | Used for |
|---|---|
| Claude's **Figma connector** (claude.ai) | reading reference screenshots while the Bridge isn't open in that file |
| **Mobbin** MCP | Proposal mode in `product-screen-builder` (pattern research) |
| **dataviz** skill | anything chart-shaped. Run its palette validator first, see `upbase-known-issues.md` › chart palette |

## 7. Register your kit

The skills stop on a file key they don't know. Do this once, before your first build. Steps are in
README › *Registering your kit*.
