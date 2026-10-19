---
id: TASK-6
title: Test-only policy merge
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 23:55'
labels: []
dependencies:
  - TASK-4
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 6. Approver agent merges only when a script confirms: allowlisted test files only, no deletions/.skip/.only/snapshot updates, checks green, commit carries task ID and Approved-by: policy:test-only. Default policy empty.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added the test-only policy merge. A project opts in with .honest-status/test-only on main: one test glob per line (absent or empty = nothing merges without a human). `node bin/truth.ts --merge <id> --policy test-only` runs the human merge's checks plus: checks must be configured and pass; every changed file must be added or edited (no deletes or renames), match a policy glob, and not be a snapshot or test config (*config*, *setup*); added lines may not contain .skip/.only/xit/fit/@skip; removed lines may not contain it(/test(/describe(. The task's own Backlog file is exempt. The policy is read from main, never from the branch. Commit trailer: Approved-by: policy:test-only. The board re-verifies every such commit on main against the policy at its parent and flags failures. truth-rules skill gains the one exception to "never merge yourself"; README documents it.

Limits: the skip/removal scan is line-based (ponytail comment in testOnlyProblems), and "checks green" cannot be re-verified after the fact. Uses path.matchesGlob, which is experimental in Node 22 and may print an ExperimentalWarning to stderr there; only tested on Node 25.

How to review: git diff main...task/TASK-6; node --test test/truth.test.ts (12/12, three new policy tests: refusals, a successful policy merge, a forged policy commit flagged by the board).
<!-- SECTION:FINAL_SUMMARY:END -->
