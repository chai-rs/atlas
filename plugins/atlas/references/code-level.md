# Code level

The code level describes one container. Its nodes are in `c4/containers/<container>/`. [nodes.json](nodes.json) gives the path and the diagram of each type.

## Nodes by kind of container

| `kind` | Nodes |
| --- | --- |
| `service` | `components.md`, `code/structure.md`, `code/domain.md`, `code/data.md`, `code/calls-out.md`, `code/calls-in.md`, one `code/api/<operation>.md` for each operation |
| `worker` | The same as a service. An operation is one message handler or one scheduled job. |
| `frontend` | `components.md`, `code/structure.md`, `code/calls-out.md` |
| `datastore` | `code/data.md`, `code/calls-in.md` |
| `library` | `components.md`, `code/structure.md`, `code/domain.md` |

Leave out a node that does not apply. Do not write an empty node.

## Body of each node

| Type | Body |
| --- | --- |
| `component-view` | The modules of the container, the responsibility of each, and a `flowchart` of how they depend on each other. |
| `structure` | The directory tree to two levels, the purpose of each directory, the entry points, and the build and test commands. |
| `domain-model` | The aggregates, entities, value objects, domain events, and invariants. One `classDiagram`. Add a `stateDiagram-v2` for an entity that has a lifecycle. |
| `data-model` | One `erDiagram`, and a table that gives the purpose of each table or collection. |
| `outbound-calls` | "We call who": exactly one table with the columns To, Protocol, and Purpose. |
| `inbound-calls` | "Who calls us": the computed table, then a table of the callers from outside the system. |
| `operation` | The sections under "Operation" below. |

Describe the domain model as the code has it. If the code has no aggregates, do not invent them.

## Sources

A node with `realization: built` names the code that it describes. Use a permalink that contains the commit SHA of the clone.

```yaml
sources:
  - resource: https://github.com/example/library-api/blob/0a1b2c3/src/loans/service.ts
    title: Loan service
```

Get the SHA with `git -C <clone> rev-parse HEAD`.

## Calls

In `calls-out.md`, the To cell is a link when the target is a container of this system, for example `[Database](../../database/container.md)`. The To cell is plain text when the target is an external system.

In `calls-in.md`, write the block below, then run the script. The script fills the rows from each `calls-out.md` of the system. Do not edit the rows by hand.

```markdown
<!-- atlas:calls-in -->
| From | Protocol | Purpose |
| --- | --- | --- |
<!-- /atlas:calls-in -->
```

```bash
node <atlas>/scripts/atlas.mjs calls-in
```

Under the block, write a second table for the callers from outside the system, for example a webhook of an external platform. Ask the user for these callers. The code does not show them.

After the script runs, make the relationship table and the diagram of `c4/containers.md` agree with the `calls-out.md` nodes.

## Operation

One file describes one operation: one endpoint, one message handler, or one scheduled job.

1. **Journeys.** Links to the journey nodes that use the operation. Do not copy the text of a journey.
2. **Business validation.** Each rule, in glossary terms. Add a `flowchart` only when the rules branch.
3. **Request schema.** The fields, their types, and which are required.
4. **Response schema.** The fields of each response, with each error.
5. **Reference output.** One example request and its response. Use example data.
6. **Sequence.** One `sequenceDiagram` of the calls between the components and to other containers.

For a `built` operation, take the schemas from the OpenAPI file, the proto file, or the code, and name that file in `sources`. Ask the user for the journeys and the business validation that the code does not show.
