---
id: TASK-9
title: 'Test unfilled ${user_config} options'
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 23:44'
updated_date: '2026-10-19 23:57'
labels: []
dependencies: []
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
option() in bin/truth.ts treats a value starting with ${ as unset, because Claude Code leaves ${user_config.x} unsubstituted under --plugin-dir. No test covers it. Add one to test/truth.test.ts: --merge with --main '${user_config.main}' --checks '${user_config.checks}' merges into main and runs no checks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A test passes literal ${user_config.main} and ${user_config.checks} and asserts the merge uses main and runs no checks
- [x] #2 The test fails if the ${ guard in option() is removed
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added one test to test/truth.test.ts: --merge with the literal --main '${user_config.main}' --checks '${user_config.checks}' (what Claude Code passes under --plugin-dir) merges into main and prints "No checks configured". No code change; the guard in option() already handled it.

Verified the test bites: with the ${ guard removed from option(), it fails (12 pass, 1 fail); with the guard restored, 13/13 pass.

How to review: git diff main...task/TASK-9; node --test test/truth.test.ts. To see it fail, delete `&& !value.startsWith('${')` in option() and rerun.
<!-- SECTION:FINAL_SUMMARY:END -->
