---
name: question
description: Answers a question about the system from the Atlas workspace first and from the code second, and reports what `.workspace/` lacks. Writes nothing. Use when the user asks how or why a part of the system works, where something lives, who calls what, runs /atlas:question, or when the atlas router selects this flow.
---

# Question

This skill does not change a file.

Follow "Find the workspace" and "Load" in [flow.md](../../references/flow.md). [harness.md](../../references/harness.md) gives the name of each upstream skill.

## 1. Answer from the bundle

Load the nodes that the question touches. Answer from them, and give the path of each node that you used.

For each node, say whether it is `draft`, and whether it is `planned` or `built`. A `planned` node is the target and not a description of the code.

## 2. Answer from the code

If the nodes do not answer the question, go to the clone of the code repository.

- For how a part works or where code belongs, use the `how` skill of pstack.
- For why a part works that way, use the `why` skill of pstack.

If a `built` node and the code disagree, the code is right. Say that the node is stale.

## 3. Report the gaps

List what the bundle lacks or has wrong: the missing node, the stale node, or the missing link. Tell the user that the `workspace` skill of this plugin can add it.
