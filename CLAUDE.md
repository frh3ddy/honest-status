# Working on honest-status

This repo builds a Claude Code plugin that adds truth rules on top of Backlog.md. Read `PLAN.md`
before starting. `bin/truth.ts` keeps the patterns it was ported from (hook JSON decision, loop
guard, zero dependencies); keep them when you change it.

## Every session

1. Check the board: `backlog board` (or `backlog task list --plain`).
2. One task per session, on its own branch `task/<task-id>`. Never commit to `main`.
3. Move the task to In Progress when you start.
4. At the end: write the task's final summary and how to review it, move it to In Review, assign
   it to @fredy, commit.

## Rules this repo dogfoods

- Never set a task to Done. Fredy merges to `main` with `feat(<task-id>): <title>` and the trailer
  `Approved-by: human`; Done follows the merge.
- Anything that needs Fredy is assigned to him: Blocked tasks, In Review tasks, and tasks labeled
  `question`.
- Never delete or skip a failing or flaky test. File a `question` task with the evidence instead.

## Code constraints

- `bin/truth.ts` uses only `node:` built-ins and erasable TypeScript (no enums, namespaces or
  parameter properties), so Node 22.18+ runs it directly with no build step.
- Zero config by default. Anything project-specific becomes an option, never a hardcoded name.
- The README stays honest: guardrails, not security.
- Bump `version` in `.claude-plugin/plugin.json` in any task that changes what users get:
  installed copies don't update while the version stays the same.

## Commands

- `backlog board`, `backlog task list --json`
- `node bin/truth.ts --human @fredy` (board), `node --test test/truth.test.ts` (needs `backlog` on PATH)
- `claude --plugin-dir .` (to load the plugin locally, build step 3)
