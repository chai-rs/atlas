---
name: atlas
description: Routes a development task to the Atlas flow that fits it, with the `.workspace/` bundle as shared context. Use when the user runs /atlas:atlas, or asks Atlas to take a task such as describing a system, building a feature, fixing a bug, reviewing code or the workspace, or answering a question about the system.
---

# Atlas

Atlas runs development work against `.workspace/`, the bundle that holds the business context and the C4 model of the system. This skill only selects a flow. The flow does the work.

## 1. Find the workspace

Follow "Find the workspace" in [flow.md](../../references/flow.md). If the system has no workspace, run the `setup` skill of this plugin, then continue.

## 2. Select the flow

| The user wants to | Skill of this plugin |
| --- | --- |
| Describe a new system, or describe the code of a system that exists | `workspace` |
| Add or change behaviour, or change the structure of the code | `feature` |
| Fix a defect or a regression | `bug` |
| Review a code change, or review the bundle | `review` |
| Learn how or why a part of the system works | `question` |
| See the bundle as an HTML page | `render` |

If the task fits two rows, ask the user which one they mean. If it fits no row, say so. Do not select a flow by guess.

## 3. Run the flow

Call the selected skill and give it the task in the words of the user.
