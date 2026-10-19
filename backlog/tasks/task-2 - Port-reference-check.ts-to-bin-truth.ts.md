---
id: TASK-2
title: Port reference/check.ts to bin/truth.ts
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 18:40'
labels: []
dependencies:
  - TASK-1
references:
  - reference/check.ts
  - docs/backlog-json.md
ordinal: 500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 2. Read backlog task list --json, git log main and tags. Flag Done without a merge, In Review without a summary, Blocked/question tasks not assigned to the human. Board, --json, --hook.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 bin/truth.ts reads backlog task list/view --json and git log main; node: built-ins only
- [x] #2 Flags Done without a merge commit, In Review without a final summary + How to review, Blocked/In Review/question tasks not assigned to the human
- [x] #3 Board, --json and --hook (blocks once, then warns) modes
- [x] #4 test/truth.test.ts covers each rule against a real Backlog.md project
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
bin/truth.ts ported from reference/check.ts: same hook JSON decision, stop_hook_active loop guard, node: built-ins only. Reads `backlog task list --json`, plus `task view --json` for each In Review task (only it has finalSummary), and `git log main`.

Rules (errors): Done with no "(TASK-N)" commit on main; In Review with no final summary or no "How to review"; In Review, Blocked or question-labeled tasks not assigned to the human. Warnings: merged but not Done; more than one In Progress; no main branch.

Options, zero by default: --human / HONEST_STATUS_HUMAN (unset: any assignee counts), --main / HONEST_STATUS_MAIN (default main). Unknown Backlog.md JSON schemaVersion is an error, not a guess. Outside a Backlog.md project, or without the backlog CLI, the hook stays silent.

Choices to check: the Approved-by trailer is not required yet (PLAN says the ID is enough; TASK-6 can add it). Question-labeled To Do tasks are never "next". Branched from task/TASK-1, since it needs backlog/ and docs/backlog-json.md.

How to review: `node --test test/truth.test.ts` (5 tests, needs backlog on PATH); `node bin/truth.ts --human @fredy` on this repo; `echo "{\"cwd\":\"$PWD\"}" | node bin/truth.ts --hook` after setting a task Done by hand should print a block decision (then reset it).
<!-- SECTION:FINAL_SUMMARY:END -->
