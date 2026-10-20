---
id: TASK-7
title: Public showcase project
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-20 20:23'
labels: []
dependencies:
  - TASK-5
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 7. A second, public project using the plugin as the showcase.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Demo repo at ~/honest-status-demo (local, not pushed). Demo TASK-1 (wc CLI) is In Review; an approver-agent policy merge of it was refused as expected (wc.ts isn't a test file). Waiting on Fredy's human merge of demo TASK-1; then demo TASK-2 (test-only) gets a policy merge, then publish frh3ddy/honest-status-demo after Fredy confirms.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Published https://github.com/frh3ddy/honest-status-demo (public, MIT): a word-count CLI (wc.ts, node:test) tracked with Backlog.md and honest-status. It has the five statuses, a test-only policy (.honest-status/test-only: test/**/*.test.ts), and .claude/settings.json offering the plugin from frh3ddy/honest-status.

History on its main: chore: project skeleton; feat(TASK-1) [Approved-by: human], merged by Fredy with checks npm test after an approver-agent policy merge of it was refused (wc.ts is not a test file); feat(TASK-2) [Approved-by: policy:test-only], tests only, merged by the approver agent with checks green; feat(TASK-3) [Approved-by: human], README records that refusal with its exact message. Verified from a fresh clone after TASK-2: 5/5 tests pass, board Truth rules: OK. This repo: README links the demo.

How to review: open https://github.com/frh3ddy/honest-status-demo; in a clone run git log --format="%s  [%(trailers:key=Approved-by,valueonly,separator=)]" main and npm test; git diff main...task/TASK-7 here.
<!-- SECTION:FINAL_SUMMARY:END -->
