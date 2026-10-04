---
name: bug
description: Fixes a defect against the Atlas workspace. Loads the nodes that describe the expected behaviour, diagnoses with Matt Pocock's diagnosing-bugs skill, hands the fix to pstack, reviews it, and updates `.workspace/` only if the behaviour that a node describes changed. Use when the user reports something broken, failing, or slow, runs /atlas:bug, or when the atlas router selects this flow.
---

# Bug

Follow [flow.md](../../references/flow.md) for how to find the workspace, load nodes, write nodes, and verify. [harness.md](../../references/harness.md) gives the name of each upstream skill.

## 1. Preflight

Find the workspace. Find the upstream skills that `bug` and `review` need. If one is missing, stop and print its install command.

## 2. Load

Load the journey, the operation, and the domain model of the area that fails. These nodes state the expected behaviour.

## 3. Diagnose

Use the `diagnosing-bugs` skill in the clone of the code repository. Give it the expected behaviour from the nodes.

If the code and a node disagree, decide which one is wrong before you fix anything:

- The node is `planned`: the node is the target, and the code has the defect.
- The node is `built`: the code is right by default. Ask the user whether the node is stale or the code regressed.

## 4. Fix

Hand the diagnosis to the `poteto-mode` skill of pstack. Do not choose its playbook or its subagents for it.

## 5. Review

Run the `review` skill of this plugin on the change.

## 6. Record

Change the bundle only if the fix changed behaviour that a node describes, or if step 3 found a stale node. Then update that node, set `generated.at`, and run the Verify step of flow.md.

If no node changed, write nothing to the bundle. Run the Finish step of flow.md.
