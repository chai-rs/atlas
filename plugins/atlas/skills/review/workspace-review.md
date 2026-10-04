# Workspace review

Adapted from the `ponytail-review` skill of ponytail. See [NOTICE.md](../../NOTICE.md).

Review the bundle for nodes and text that it does not need. One line for each finding: the location, what to cut, and what replaces it. The best outcome is a smaller bundle.

`<atlas>` is the plugin root, two directories above this file.

## Before you read

Run the three commands from the root of the workspace repository. Report each line that they print.

```bash
node <atlas>/scripts/atlas.mjs check
okf validate .workspace
node <atlas>/scripts/atlas.mjs orphans
```

## Format

`<node path>: <tag>: <what>. <replacement>.` Add `L<line>` after the path when the finding is one passage.

| Tag | Meaning | Replacement |
| --- | --- | --- |
| `delete` | Text that only repeats what the code states, for example a list of every file or every field with no purpose given. | Nothing, or a link to the code in `sources`. |
| `dup` | The same fact in two nodes. | Keep it in the node that owns it, and link from the other. |
| `stale` | A `built` node whose code changed after the SHA in its `sources`. | Write the node again from the code. |
| `orphan` | A node that the `orphans` command lists. | Link it from the node that uses it, or delete it. |
| `yagni` | A `planned` node with no ticket, a diagram that repeats a table, or a section with no content. | Delete it until someone needs it. |

To find a stale node, take the path and the SHA from each `sources` permalink, then run this command in the clone. A different SHA means that the node is stale.

```bash
git -C <clone> log -1 --format=%h -- <path>
```

## Examples

Wrong: "This node might have more detail than necessary. Consider whether every table needs a description."

Right: `c4/containers/api/code/structure.md:L12-60: delete: 48 lines list each file. Keep the two-level tree and the entry points.`

Right: `business/capabilities/lend-tools.md:L9-15: dup: repeats the steps of the journey. Link to business/journeys/borrow-a-tool.md.`

Right: `c4/containers/api/code/data.md: stale: sources name 0a1b2c3, the migrations changed in 9f8e7d6. Write the node again.`

Right: `business/journeys/renew-a-loan.md: yagni: planned, no ticket, no operation links to it. Delete it.`

## Score

End with `net: -<N> lines possible.` If there is nothing to cut, write `Lean already.` and stop.

## Limits

This review looks for excess and stale content only. Whether a node is correct is a question for the person who sets `status: stable`. A `status: draft` node is not a finding. The review does not apply the fixes.
