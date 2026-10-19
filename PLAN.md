# honest-status: plan

A Claude Code plugin that keeps project status honest on top of Backlog.md. An agent can move work
forward and ask for review, but only a human merge, or a narrow written test-only policy, makes a
task Done. Status lives in the repo, and git proves Done.

## Why

Agents report "done" in prose, and boards trust a status field anyone can set. Backlog.md already
keeps tasks as Markdown in git, with human review checkpoints. This plugin adds enforcement: a Stop
hook sends the agent back when status drifts, and Done requires merge evidence on `main`.

## Rules, mapped onto Backlog.md

- **Statuses:** To Do → In Progress → (Blocked) → In Review → Done, set in the Backlog config file
  (statuses can't be changed with `backlog config set`).
- **Done means merged:** a task is Done only when `main` has a commit containing its ID, like
  `feat(TASK-12): …`. The agent never sets Done.
- **Waiting on the human means assigned to them:** Blocked tasks, In Review tasks, and tasks labeled
  `question`.
- **In Review needs evidence:** a final summary and how to review it.
- **Stages (optional):** Backlog milestones; a git tag approves a milestone.
- **Flaky tests:** never deleted or skipped by the agent; filed as a `question` task with evidence.

## Merge policy

Human merge is the rule. `/honest-status:merge <task-id>` checks the task is In Review and the checks
pass, squash-merges with the task ID and the trailer `Approved-by: human`, then sets Done.

An approver agent may merge on its own only when a script confirms all of this:

- Every changed file matches the test allowlist. Test config files don't count.
- Only additions or edits: no deleted tests, no new `.skip` or `.only`, no snapshot updates.
- Checks are green on the merged result.
- The merge commit carries the task ID and `Approved-by: policy:test-only`, so the checker can
  re-verify every policy merge later.

The default policy is empty: nothing merges without a human.

## Layout

```
honest-status/
├── .claude-plugin/plugin.json
├── hooks/hooks.json         # Stop hook → bin/truth.ts --hook
├── bin/truth.ts             # board + rules
├── skills/
│   ├── truth-rules/SKILL.md # how the agent moves tasks
│   └── merge/SKILL.md       # user-only: disable-model-invocation: true
└── README.md
```

- **`bin/truth.ts`:** reads `backlog task list --json`, `git log main` and tags. Flags Done without
  a merge, In Review without a summary, and Blocked or question tasks not assigned to the human.
  Prints waiting on you, in progress, next, built. `--json` for tools, `--hook` for the Stop hook.
- **Stop hook:** blocks once per turn with the list of problems, then lets Claude stop with a
  warning so it can't loop.
- **`truth-rules` skill:** the agent's side of the rules above.
- **`merge` skill:** the only path to Done; Claude can't trigger it on its own.
- **Optional backstop:** Backlog.md's `onStatusChange` setting runs the checker on every status
  change, including a card dragged in the web UI.

## Build order

1. Backlog.md in this repo: statuses, one task per step below, and the real JSON field names
   recorded in `docs/backlog-json.md`.
2. Port `reference/check.ts` to read Backlog.md's JSON and git: `bin/truth.ts`.
3. Stop hook and `truth-rules` skill; load locally with `claude --plugin-dir .`.
4. `merge` skill. Test that it runs when typed: there are reports of Claude refusing skills with
   `disable-model-invocation: true` even when the user typed the command.
5. `claude plugin validate`, a `.claude-plugin/marketplace.json`, publish.
6. The test-only policy merge.
7. A second, public project as the showcase.

## Constraints

- `bin/truth.ts`: `node:` built-ins only, erasable TypeScript, Node 22.18+.
- Zero config by default.
- Guardrails, not security, stated in the README.

## Open questions

- Should feedback intake and adopting existing projects be plugin features, or later extras?
- Final name.
