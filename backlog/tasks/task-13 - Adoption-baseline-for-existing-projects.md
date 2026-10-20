---
id: TASK-13
title: Adoption baseline for existing projects
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 21:19'
updated_date: '2026-10-20 21:23'
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
- [x] #1 With tag honest-status-start, Done tasks present at the tag are not flagged and count as built
- [x] #2 A task set Done after the tag without a merge commit is still flagged
- [x] #3 Without the tag, behavior is unchanged
- [x] #4 README explains how to adopt: tag, then install
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the adoption baseline. If the git tag honest-status-start exists, doneAtBaseline() in bin/truth.ts reads the task files at that tag (any tasks/*.md, frontmatter id and status) and treats tasks that were Done there as proven: not flagged, listed as built. Merge commits still prove everything else; a task set Done after the tag without a merge is still flagged. No tag: unchanged. The "main has a (TASK-n) commit, set it Done" warning still uses merge commits only. README: how to adopt (commit the board, git tag honest-status-start main).

Limits: one git show per task file at the tag (fine for adoption-sized boards); frontmatter is parsed with two regexes, not a YAML parser.

How to review: git diff main...task/TASK-13; node --test test/truth.test.ts (14/14; new test tags a fixture, checks TASK-1/2 built and a post-tag Done TASK-8 flagged, then deletes the tag and checks TASK-2 is flagged again).
<!-- SECTION:FINAL_SUMMARY:END -->
