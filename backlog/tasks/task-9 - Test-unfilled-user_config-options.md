---
id: TASK-9
title: 'Test unfilled ${user_config} options'
status: To Do
assignee: []
created_date: '2026-10-19 23:44'
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
- [ ] #1 A test passes literal ${user_config.main} and ${user_config.checks} and asserts the merge uses main and runs no checks
- [ ] #2 The test fails if the ${ guard in option() is removed
<!-- AC:END -->
