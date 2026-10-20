---
id: TASK-15
title: Merge command accepts board branches
status: To Do
assignee: []
created_date: '2026-10-20 21:32'
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
- [ ] #1 --merge board/<name> squashes a task-files-only branch as chore(board): ... with Approved-by: human
- [ ] #2 Refused, main unchanged: a file outside the tasks folder, a deleted task file, a task newly set Done
- [ ] #3 Editing an already-Done task (ticking a criterion) is allowed
- [ ] #4 merge skill and truth-rules skill say agents put board-only changes on a board/<name> branch for this command
- [ ] #5 plugin.json version bumped
<!-- AC:END -->
