# Upstream skills and tools

Atlas calls skills that other packages own. Find each skill in your list of available skills before you use it. A plugin install adds a prefix to the skill name. A standalone install does not.

If a skill or tool that the current flow needs is missing, stop. Print the install command for the current harness. Do not continue with a substitute.

## Skills

| Upstream | Skill | Name from a plugin | Standalone name | Needed by |
| --- | --- | --- | --- | --- |
| Matt Pocock skills | grilling | `mattpocock-skills:grilling` | `grilling` | `workspace`, `feature` |
| Matt Pocock skills | domain-modeling | `mattpocock-skills:domain-modeling` | `domain-modeling` | `workspace`, `feature` |
| Matt Pocock skills | setup-matt-pocock-skills | `mattpocock-skills:setup-matt-pocock-skills` | `setup-matt-pocock-skills` | `setup`, when it registers a repository |
| Matt Pocock skills | to-spec | `mattpocock-skills:to-spec` | `to-spec` | `feature` |
| Matt Pocock skills | to-tickets | `mattpocock-skills:to-tickets` | `to-tickets` | `feature` |
| Matt Pocock skills | diagnosing-bugs | `mattpocock-skills:diagnosing-bugs` | `diagnosing-bugs` | `bug` |
| pstack | poteto-mode | `pstack:poteto-mode` | none | `feature`, `bug` |
| pstack | how | `pstack:how` | none | `workspace` when it reads code, `question` |
| pstack | why | `pstack:why` | none | `question` |
| ponytail | ponytail-review | `ponytail:ponytail-review` | none | `review` of code |

## Tools

| Tool | Check | Needed by |
| --- | --- | --- |
| Node.js | `node --version` | each flow that writes to the bundle |
| okf | `okf` prints its usage | each flow that writes to the bundle, `render` |
| git | `git --version` | `review`, and each flow that writes `sources` |

## Install commands

| Upstream | Claude Code | Codex |
| --- | --- | --- |
| Matt Pocock skills | `npx skills@latest add mattpocock/skills` | `npx skills@latest add mattpocock/skills` |
| pstack | `/plugin marketplace add michael-denyer/pstack-claude`, then `/plugin install pstack@pstack-claude` | `codex plugin marketplace add michael-denyer/pstack-claude`, then `codex plugin add pstack@pstack-claude` |
| ponytail | `/plugin marketplace add DietrichGebert/ponytail`, then `/plugin install ponytail@ponytail` | `codex plugin marketplace add DietrichGebert/ponytail`, then `codex plugin add ponytail@ponytail`, then trust its hooks in `/hooks` |
| okf | Build it from its source repository with `go build -o okf ./cmd/okf`, then put the binary on `PATH`. | The same. |

## Differences between the harnesses

| Topic | Claude Code | Codex |
| --- | --- | --- |
| Call a skill | Use the Skill tool with the name from the table. | Skills load natively. Open the skill and follow its instructions. |
| Subagents | Available. | Available only when `multi_agent` is on. |

Atlas flows work on one container at a time and do not need subagents.
