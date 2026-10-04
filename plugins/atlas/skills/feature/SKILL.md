---
name: feature
description: Builds a feature against the Atlas workspace. Defines the problem, writes the planned journey and API design into `.workspace/`, breaks the work into tickets, hands the implementation to pstack, reviews it, then records what was built. Use when the user wants to add or change behaviour, refactor, runs /atlas:feature, or when the atlas router selects this flow.
---

# Feature

Follow [flow.md](../../references/flow.md) for how to find the workspace, load nodes, write nodes, and verify. [harness.md](../../references/harness.md) gives the name of each upstream skill.

## 1. Preflight

Find the workspace. Find the upstream skills that `feature` and `review` need. If one is missing, stop and print its install command.

## 2. Load

Load the journeys, the containers, and the operations that the task touches.

## 3. Define the problem

1. Use the `grilling` skill until the behaviour is settled. Apply the `domain-modeling` skill with two changes: the glossary is `.workspace/business/glossary.md`, and a decision goes to `.workspace/decisions/NNNN-<slug>.md`.
2. Use the `to-spec` skill. It publishes the spec to the issue tracker of the code repository. Do not write the spec into `.workspace/`.

## 4. Write the design

Write the target into the bundle before any code changes.

- A new journey or a new operation gets a node with `realization: planned`. [code-level.md](../../references/code-level.md) gives the sections of an operation.
- To change a node that is `built`, edit it so that it describes the target, and set `realization: planned`.
- A new container gets a `container.md`, and `c4/containers.md` gets the new relationships.

Run the Verify step of flow.md.

## 5. Break the work into tickets

Use the `to-tickets` skill. Each ticket names the nodes that it implements, by path.

## 6. Implement

If the container has no code repository, ask the user where to create it. Register it with step 3 of the `setup` skill of this plugin.

Hand the tickets and the paths of the planned nodes to the `poteto-mode` skill of pstack. Work in the clone of the code repository. Do not choose its playbook or its subagents for it.

## 7. Review

Run the `review` skill of this plugin on the change. Send each `conform` finding back to step 6.

## 8. Record what was built

For each planned node that the code now matches:

1. Set `realization: built`, and add `sources`.
2. Write again the code-level nodes of each container that the change touched, one container at a time.
3. Run `node <atlas>/scripts/atlas.mjs calls-in`.

Apply each `drift` and `unmodeled` finding of the review that the user accepts. Run the Verify step of flow.md, then the Finish step.
