# Atlas

Atlas is a plugin for Claude Code and Codex. It keeps the business context and the C4 model of a system in a `.workspace/` folder, as an Open Knowledge Format (OKF) v0.2 bundle of Markdown files. It runs development work against that bundle through three upstream packages: Matt Pocock's skills define the problem, pstack builds the solution, and ponytail reviews it.

## Skills

| Skill | What it does |
| --- | --- |
| `atlas:atlas` | Selects the flow that fits a task. |
| `atlas:setup` | Checks the upstream skills and tools, creates `.workspace/`, and registers the code repositories of the system. |
| `atlas:workspace` | Interviews you and reads the registered code, then writes the business context, the journeys, and the C4 model. |
| `atlas:feature` | Writes the planned design, breaks it into tickets, hands the implementation to pstack, reviews it, and records what was built. |
| `atlas:bug` | Diagnoses a defect against the expected behaviour in the bundle, hands the fix to pstack, and reviews it. |
| `atlas:review` | Reviews a code change for over-engineering and for conformance to the bundle, or reviews the bundle itself. |
| `atlas:question` | Answers a question from the bundle first and from the code second. Writes nothing. |
| `atlas:render` | Builds an HTML view of the bundle with `okf viz`. |

A flow never commits and never pushes.

## Requirements

- Node.js, for `plugins/atlas/scripts/atlas.mjs`.
- The `okf` command on `PATH`.
- Matt Pocock's skills, pstack, and ponytail.

`plugins/atlas/references/harness.md` lists each upstream skill, the flow that needs it, and its install command for each harness.

## Install

In Claude Code:

```
/plugin marketplace add chai-rs/atlas
/plugin install atlas@atlas
```

In Codex:

```
codex plugin marketplace add chai-rs/atlas
codex plugin add atlas@atlas
```

## Files

| Path | Purpose |
| --- | --- |
| `plugins/atlas/references/nodes.json` | The node table: each node type, its path, its extra keys, and its diagram. |
| `plugins/atlas/references/bundle.md` | The frontmatter, body, link, and diagram rules of a node. |
| `plugins/atlas/references/code-level.md` | The nodes that describe one container. |
| `plugins/atlas/references/flow.md` | The rules that each flow follows. |
| `plugins/atlas/scripts/atlas.mjs` | `init`, `check`, `log`, `orphans`, and `calls-in`. |
| `plugins/atlas/NOTICE.md` | The licence of the ponytail text that the workspace review adapts. |
| `test/fixtures/sample/` | A sample workspace that `check` and `okf validate` accept. |

## Test

```bash
node --test test/atlas.test.mjs
```
