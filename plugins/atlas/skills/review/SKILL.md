---
name: review
description: Reviews a code change against the Atlas workspace, or reviews the workspace itself. For code, runs ponytail-review for over-engineering and then checks that the change conforms to the C4 model and the planned design. For the workspace, finds nodes to delete, merge, or refresh. Lists findings and changes nothing. Use when the user asks for a review, runs /atlas:review, or when the `feature` or `bug` flow reaches its review step.
---

# Review

This skill lists findings. It does not change code, and it does not change a node.

Follow "Find the workspace" and "Load" in [flow.md](../../references/flow.md). [harness.md](../../references/harness.md) gives the name of each upstream skill.

Select the mode from the request. A diff, a branch, or a pull request means a code review. The words "workspace", "bundle", "docs", or "nodes" mean a workspace review. If the request fits both, ask.

## Code review

1. Run the `ponytail-review` skill of ponytail on the diff. Give its output without changes. If the skill is missing, stop and print its install command.
2. Load the nodes of each container that the diff touches: `container.md`, `components.md`, the code-level nodes, and the journeys that the operations link to.
3. Compare the diff with those nodes. Write one line for each finding, in the form `<file>:L<line>: <tag>: <what>. <node path>.`

| Tag | Meaning |
| --- | --- |
| `conform` | The code does not match a `planned` node. The code must change. |
| `drift` | The diff changes what a `built` node describes. The node must change. Say what the node must say. |
| `unmodeled` | The diff adds a call between containers, an operation, or a table that no node describes. |

4. End with `conformance: <N> findings.` If there are none, write `Conforms to the workspace.`

Correctness, security, and performance are out of scope. Send them to a normal review.

## Workspace review

Follow [workspace-review.md](workspace-review.md).
