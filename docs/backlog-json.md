# Backlog.md JSON: real field names

Recorded from Backlog.md **1.54.0** (`backlog --version`) on 2026-10-19, against this repo's own
tasks. Re-check after upgrading Backlog.md: the envelope carries `schemaVersion`, so `bin/truth.ts`
should refuse a version it doesn't know rather than guess.

JSON goes to stdout; warnings (like `remoteOperations is enabled but no git remotes`) go to stderr.

## `backlog task list --json`

```json
{ "schemaVersion": 1, "kind": "task-list", "tasks": [ … ] }
```

With `--max-count`/`--skip`, the envelope also has `total` and `nextSkip` (per `--help`).

Each task:

| Field | Example | Notes |
| --- | --- | --- |
| `id` | `"TASK-1"` | Uppercase prefix + number. Prefix comes from `task_prefix` in config. |
| `title` | `"merge skill"` | |
| `status` | `"In Progress"` | One of `statuses` in `backlog/config.yml`, exact case. |
| `archived` | `false` | |
| `type` | `null` | |
| `priority` | `null` | |
| `project` | `null` | |
| `assignees` | `["@fredy"]` | Array; keeps the `@`. |
| `reporter` | `null` | |
| `labels` | `["question"]` | Array of strings. |
| `milestone` | `null` | Milestone ID or null. |
| `parentTaskId` | `null` | |
| `acceptanceCriteriaCompleted` | `0` | Count only. |
| `acceptanceCriteriaCount` | `3` | Count only. |
| `references` | `["PLAN.md"]` | |
| `modifiedFiles` | `[]` | |
| `ordinal` | `1000` | |
| `createdAt` | `"2026-10-19T18:24:00Z"` | ISO 8601. |
| `updatedAt` | `null` | Null until the first edit. |
| `dueDate` | `null` | |
| `isReady` | `true` | False while a dependency isn't Done. |

**Not in the list:** `description`, `dependencies`, `finalSummary`, acceptance criteria text,
notes, comments. Checking "In Review needs a final summary" needs `task view` per In Review task.

## `backlog task view <id> --json`

```json
{ "schemaVersion": 1, "kind": "task-view", "task": { … } }
```

`task` has every list field above, plus:

| Field | Example | Notes |
| --- | --- | --- |
| `path` | `"backlog/tasks/task-1 - ….md"` | Relative to repo root. |
| `description` | `"Build step 1 of PLAN.md."` | |
| `dependencies` | `["TASK-1"]` | Task IDs. |
| `readiness` | `{"isReady":true,"isBlocked":false,"blockingDependencies":[],"missingDependencies":[]}` | |
| `documentation` | `[]` | |
| `subtasks` | `[]` | |
| `acceptanceCriteria` | `[{"index":1,"text":"…","checked":false}]` | |
| `definitionOfDone` | `[]` | Same shape as `acceptanceCriteria`. |
| `implementationPlan` | `null` | String or null. |
| `implementationNotes` | `null` | String or null. |
| `comments` | `[]` | |
| `finalSummary` | `"…"` | String or null. **The In Review evidence field.** |
| `dependencyGraph` | `{"root","nodes","edges"}` | Nodes: `id, title, status, state, completed, dependencyDepth, dependentDepth`. |

## For `bin/truth.ts`

- There is no separate "how to review" field: the final summary must carry it. The checker
  requires the words "How to review" in the final summary of every In Review task.
- Statuses are free strings from config. The checker compares against the plugin's own names
  (`"Done"`, `"In Review"`, `"Blocked"`, `"In Progress"`, `"To Do"`), exact case.
- Assignee match accepts both `@fredy` and `fredy`, case-insensitive. The human's name is the
  `--human` option (as a plugin: the `human` userConfig option); unset, any assignee counts.
