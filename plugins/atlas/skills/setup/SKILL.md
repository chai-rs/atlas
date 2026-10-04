---
name: setup
description: Prepares a repository to hold an Atlas workspace. Checks the upstream skills and tools, creates the `.workspace/` OKF bundle, and registers the code repositories of the system. Use when the user wants to start Atlas, runs /atlas:setup, adds a code repository to the workspace, or when another atlas skill reports that `.workspace/atlas.md` is missing.
---

# Setup

Run this skill from the root of the repository that holds the workspace. `<atlas>` is the plugin root, two directories above this file.

You can run this skill again. Each step keeps what exists.

## 1. Check the upstream skills and tools

Read [harness.md](../../references/harness.md). Report each row as present or missing.

Stop if a row that `setup` needs is missing. Print the install command for the current harness.

## 2. Create the bundle

If `.workspace/atlas.md` exists, go to step 3.

Ask the user for three values:

1. The name of the system.
2. The language of the prose, as a language code such as `en` or `th`.
3. Whether Atlas builds an HTML view of the bundle.

Then run the command. Add `--html` only if the user wants the HTML view.

```bash
node <atlas>/scripts/atlas.mjs init --system "<name>" --language <code>
```

If the output shows `kept AGENTS.md`, add the text of [pointer.md](../../references/pointer.md) to that file by hand.

If the directory is not a git repository, tell the user. Do not run `git init`.

## 3. Register the code repositories

Ask which repositories hold the code of the system. A new system has none. Go to step 4 in that case.

For each repository:

1. Write `.workspace/repos/<name>.md` as a `repository` node. Follow [bundle.md](../../references/bundle.md).
2. Find the clone at `../<name>`. If it is not there, ask the user for the path. Store the path in `.atlas.local.json` as `{ "repos": { "<name>": "<path>" } }`.
3. In the clone, run the upstream `setup-matt-pocock-skills` skill.
4. In the clone, edit `docs/agents/domain.md`. The glossary is `.workspace/business/glossary.md` in the workspace repository. The decisions are in `.workspace/decisions/` in the workspace repository.
5. In the clone, add the text of [pointer.md](../../references/pointer.md) to `AGENTS.md` and to `CLAUDE.md`. Change its first sentence so that it gives the location of the workspace repository.

## 4. Verify

```bash
okf index .workspace
node <atlas>/scripts/atlas.mjs check
okf validate .workspace
```

Fix each line that a command reports, then run the three commands again.

For each repository that you registered, add a log entry:

```bash
node <atlas>/scripts/atlas.mjs log "**Update**: Registered the repository <name>."
```

## 5. Report

List the files that the skill created, the files that it kept, and each upstream that is missing. Do not commit.
