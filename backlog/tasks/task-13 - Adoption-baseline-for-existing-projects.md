---
id: TASK-13
title: Adoption baseline for existing projects
status: To Do
assignee: []
created_date: '2026-10-20 21:19'
labels: []
dependencies:
  - TASK-10
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decided in TASK-10. In a Backlog.md project with history, every Done task lacks a feat(TASK-n) merge commit, so the board flags them all and the Stop hook blocks on day one. Add a baseline: Done tasks whose files are already on main at the git tag honest-status-start count as built without a merge commit. No tag: behavior unchanged.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 With tag honest-status-start, Done tasks present at the tag are not flagged and count as built
- [ ] #2 A task set Done after the tag without a merge commit is still flagged
- [ ] #3 Without the tag, behavior is unchanged
- [ ] #4 README explains how to adopt: tag, then install
<!-- AC:END -->
