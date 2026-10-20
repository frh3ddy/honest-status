---
id: TASK-10
title: 'Feedback intake and adopting existing projects: features or later?'
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 20:29'
updated_date: '2026-10-20 21:20'
labels:
  - question
dependencies: []
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Open question from PLAN.md: should feedback intake and adopting existing projects be plugin features, or later extras? Default until answered: later extras, nothing built.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Answered (Fredy, 2026-10-20): adopting existing projects becomes a plugin feature now; feedback intake is a later extra.

Why adoption now: in a Backlog.md project with history, every Done task lacks a feat(TASK-n) commit on main, so the board flags them all and the Stop hook blocks on day one. Feedback intake does not touch the truth rules and Backlog.md already creates tasks.

Changes: PLAN.md gains build step 8 (adoption baseline, git tag honest-status-start) and a "Later extras" section with feedback intake; the question is removed from Open questions. Filed TASK-13 "Adoption baseline for existing projects" (4 acceptance criteria, depends on this task).

How to review: git diff main...task/TASK-10 (PLAN.md and backlog files only); backlog task view TASK-13.
<!-- SECTION:FINAL_SUMMARY:END -->
