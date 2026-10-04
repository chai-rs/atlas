# Describe the code of a system that exists

Use this procedure when `.workspace/repos/` has a repository node. Each node that you write from code has `realization: built` and `sources`.

`<atlas>` is the plugin root, two directories above this file. [code-level.md](../../references/code-level.md) gives the nodes of one container and the body of each.

## 1. Find the containers

For each repository node, find its clone as flow.md describes. Use the `how` skill of pstack to learn which parts of the repository deploy on their own. Each such part is one container. One repository can hold more than one container.

Write a `container.md` for each container, with its `kind` and a link to its repository node. Add a link to the container in the repository node.

## 2. Describe one container at a time

Finish one container before you start the next.

1. Get the commit SHA of the clone with `git -C <clone> rev-parse HEAD`.
2. Use the `how` skill of pstack on the container.
3. Write the nodes that code-level.md lists for the `kind` of the container.
4. Write one operation node for each endpoint, message handler, or scheduled job. Take the schemas from the OpenAPI file, the proto file, or the code.
5. Run the Verify step of flow.md.

## 3. Ask for what the code does not show

Use the `grilling` skill for these points:

- The journeys that each operation belongs to. Link each operation to its journey nodes, and each journey to its operations.
- The business validation of each operation, in glossary terms.
- The callers from outside the system, for the second table of each `calls-in.md`.

Use the `domain-modeling` skill to confirm the terms of each `domain.md` against the glossary.

## 4. Connect the containers

```bash
node <atlas>/scripts/atlas.mjs calls-in
```

Then write `c4/containers.md` and `c4/context.md` from the `calls-out.md` nodes and the external callers. Set `realization: built` on both.

## 5. Verify

Run the Verify step of flow.md. In the report, list each node that has a section from the interview and not from code.
