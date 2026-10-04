---
name: workspace
description: Builds the Atlas workspace of a system. Interviews the user and reads the code of the registered repositories, then writes the business context, the journeys, and the C4 model into `.workspace/` as OKF nodes with Mermaid diagrams. Use when the user wants to describe a new or existing system, create or extend its business context or C4 model, runs /atlas:workspace, or mentions `.workspace`.
---

# Workspace

Follow [flow.md](../../references/flow.md) for how to find the workspace, load nodes, write nodes, and verify. [harness.md](../../references/harness.md) gives the name of each upstream skill.

## 1. Preflight

- Find the workspace. If the system has none, run the `setup` skill of this plugin first.
- Find the `grilling` skill and the `domain-modeling` skill. If one is missing, stop and print its install command.

## 2. Load

Read [bundle.md](../../references/bundle.md) and [nodes.json](../../references/nodes.json). Load `.workspace/index.md` and the nodes that exist.

## 3. Select the source

- If `.workspace/repos/` has no repository node, the system has no code. The interview is the only source. Each journey and each C4 node that you write has `realization: planned`.
- If a repository node exists, the code is a source too. Do the interview for the business side, then follow [code.md](code.md) for the C4 model.

## 4. Interview

Use the `grilling` skill. Ask about these topics in this order. Do not ask what the bundle or the code already answers.

1. Vision: the people the system serves, their problem, the outcome, and what is out of scope.
2. The people and the external systems that touch the system.
3. Capabilities: each thing the business can do with the system.
4. Journeys: for each capability, the trigger, the people and systems, the steps, and each business rule that branches.
5. Containers: each part that deploys on its own, its `kind`, and its responsibility.
6. Relationships: which container or external system calls which, and for what purpose.

Apply the `domain-modeling` skill during the interview, with two changes. The glossary is `.workspace/business/glossary.md`. A decision goes to `.workspace/decisions/NNNN-<slug>.md`. Both carry Atlas frontmatter.

## 5. Write

Write each node when its topic is settled. Use this order: the glossary, the vision, the capabilities, the journeys, `c4/context.md`, `c4/containers.md`, then one `container.md` for each container.

- Write `business/context-map.md` only if the system has more than one bounded context.
- If the user did not answer a point, leave it out and list it in the report. Do not invent it.

## 6. Verify and finish

Run the Verify step of flow.md, then the Finish step. Tell the user that each node is `draft` until a person reviews it.
