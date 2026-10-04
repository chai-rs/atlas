# Flow rules

Each atlas flow follows these rules. `<atlas>` is the plugin root, the directory that holds `references/` and `scripts/`.

## Find the workspace

1. If `./.workspace/atlas.md` exists, the workspace repository is the current directory.
2. Otherwise read the Atlas pointer in `AGENTS.md` or `CLAUDE.md` of the current repository. It gives the location of the workspace repository.
3. Otherwise look for `../*/.workspace/atlas.md`.
4. Otherwise ask the user. If the system has no workspace, run the `setup` skill of this plugin.

Run each `okf` command and each `atlas.mjs` command from the root of the workspace repository.

## Find a code repository

Each code repository has a node in `.workspace/repos/`. Its clone is at `../<name>` next to the workspace repository. If the clone is not there, read `.atlas.local.json` in the workspace repository. If neither gives a clone, ask the user for the path and store it in `.atlas.local.json`.

## Load

1. Read `.workspace/atlas.md` and `.workspace/business/glossary.md`.
2. Read `.workspace/index.md`. Follow the index files down to the nodes that the task needs. Do not read the whole bundle.
3. For each node that you use, read `status` and `realization`.

A `draft` node has no human review. A `planned` node describes the target, and the code must match it. A `built` node describes the code, and the code is right when the two differ.

## Write

- Follow [bundle.md](bundle.md) for each node, and [code-level.md](code-level.md) for the nodes of one container.
- Write prose in the `language` of `atlas.md`.
- Set `status: draft`. Do not set `stable`, and do not write `verified`.
- Do not copy a secret or real personal data into a node. Use example data.

## Verify

```bash
okf index .workspace
node <atlas>/scripts/atlas.mjs check
okf validate .workspace
```

Fix each line that a command reports, then run the three commands again.

If `html` is `true` in `atlas.md`, also run the `render` skill of this plugin.

Add one log entry for each change. Start it with `**Creation**`, `**Update**`, or `**Deprecation**`.

```bash
node <atlas>/scripts/atlas.mjs log "**Update**: <what changed>."
```

## Finish

List the nodes that changed and the questions that stay open. Do not commit and do not push.
