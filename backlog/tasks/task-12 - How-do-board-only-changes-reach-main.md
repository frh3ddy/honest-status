---
id: TASK-12
title: How do board-only changes reach main?
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 20:30'
updated_date: '2026-10-20 21:32'
labels:
  - question
dependencies: []
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filing tasks or editing open questions changes only backlog/ files, but agents never commit to main and --merge only merges an In Review task and sets it Done. So board-only commits (like board/plan-questions for TASK-10, TASK-11) need a manual fast-forward by Fredy. Options: a --merge mode for backlog-only branches that sets nothing Done; let agents commit backlog-only changes to main; or keep the manual fast-forward. Default until answered: manual fast-forward.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Answered (Fredy, 2026-10-20): the merge command takes board branches. /honest-status:merge board/<name> keeps the human approval (you type it) but replaces the manual fast-forward. The script will refuse unless the branch only touches task files, deletes none, and makes no task Done; it squashes as chore(board): ... with Approved-by: human.

Rejected: agents committing board changes to main (breaks the plain never-commit-to-main rule) and keeping the manual fast-forward (three times already this week).

Changes: PLAN.md build step 9; filed TASK-15 "Merge command accepts board branches" (5 acceptance criteria incl. skill docs and a version bump; depends on this task).

How to review: git diff main...task/TASK-12 (PLAN.md and task files only); backlog task view TASK-15.
<!-- SECTION:FINAL_SUMMARY:END -->
