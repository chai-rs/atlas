---
name: render
description: Builds an HTML view of the Atlas workspace with `okf viz`. Use when the user wants to see or browse `.workspace/` as a page or a graph, runs /atlas:render, or when another atlas flow finishes and `html` is `true` in `.workspace/atlas.md`.
---

# Render

Follow "Find the workspace" in [flow.md](../../references/flow.md). Run the commands from the root of the workspace repository.

1. Read `system` from `.workspace/atlas.md`.
2. Run the commands.

```bash
okf index .workspace
okf viz -o viz.html --name "<system>" .workspace
```

3. Give the user the path of `viz.html`.

`viz.html` is one file. It loads its graph, Markdown, and Mermaid libraries from a CDN, so the browser needs network access. `.gitignore` lists the file. Do not commit it.

If `okf` is missing, print its install command from [harness.md](../../references/harness.md).
