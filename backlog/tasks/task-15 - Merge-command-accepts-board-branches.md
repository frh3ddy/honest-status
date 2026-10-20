---
id: TASK-15
title: Merge command accepts board branches
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 21:32'
updated_date: '2026-10-20 21:44'
labels: []
dependencies:
  - TASK-12
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decided in TASK-12. /honest-status:merge board/<name> (and truth.ts --merge board/<name>): the human still approves by typing it. The script refuses unless every changed file is a task file under the Backlog tasks folder, no task file is deleted, and no task becomes Done (status not Done on main, Done on the branch; new task files can't be Done). Ticking criteria or adding notes on an already-Done task is fine. Squash-merges as chore(board): <subject> with Approved-by: human; on any failure main is left as it was.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 --merge board/<name> squashes a task-files-only branch as chore(board): ... with Approved-by: human
- [x] #2 Refused, main unchanged: a file outside the tasks folder, a deleted task file, a task newly set Done
- [x] #3 Editing an already-Done task (ticking a criterion) is allowed
- [x] #4 merge skill and truth-rules skill say agents put board-only changes on a board/<name> branch for this command
- [x] #5 plugin.json version bumped
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added board-branch merges. `truth.ts --merge board/<name>` (so `/honest-status:merge board/<name>`) runs mergeBoard(): clean tree, main and branch exist, squash onto main, then judges the staged result: every changed file must be a task file (any tasks/*.md), none deleted, no task newly Done (Done in the index but not at HEAD; new files count), and no board rule broken for the tasks it touches. Then commits `chore(board): <name>` with the branch commit subjects as body and `Approved-by: human`. Any failure resets main and returns to the start branch, like the task merge. Editing an already-Done task (notes, ticked criteria) is allowed.

Refactor: the frontmatter parsing from the adoption baseline is now taskAt(), shared by both.

Docs: merge skill description, argument hint and a paragraph; truth-rules table row (board-only changes go on board/<name>, the human types the command); README bullet. plugin.json 0.3.0. Validate passes, 16/16 tests.

How to review: git diff main...task/TASK-15; node --test test/truth.test.ts (two new tests: refusals for a non-task file, a deleted task, a task made Done, an unassigned question, a missing branch, each leaving main unchanged; and a successful board merge that edits a Done task and adds a question). After merging and pushing: claude plugin marketplace update honest-status && claude plugin update honest-status@honest-status --scope local (0.2.0 -> 0.3.0).
<!-- SECTION:FINAL_SUMMARY:END -->
