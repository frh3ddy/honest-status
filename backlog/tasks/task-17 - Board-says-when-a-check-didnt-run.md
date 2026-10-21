---
id: TASK-17
title: Board says when a check didn't run
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-21 04:30'
updated_date: '2026-10-21 05:02'
labels: []
dependencies: []
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Some rules were this repo's conventions presented as checks. Drop the multi-In Progress warning, warn when human is unset, require text after How to review:.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No warning for more than one task In Progress
- [x] #2 With human unset, the board warns that assignments aren't checked
- [x] #3 A final summary whose How to review: part is empty fails
- [x] #4 README says How to review is a prompt for evidence, not proof
- [x] #5 plugin.json is 0.4.1
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Three rules stop overclaiming (bin/truth.ts buildReport). Removed the warning for more than one task In Progress: the checker can't tie tasks to sessions, so it was noise for parallel agents; the skill still advises one at a time. With the human option unset and something waiting on the human, the board warns that any assignee counts and assignments aren't really checked (board only; the hook reports errors, so it doesn't nag). The How to review check now needs "How to review:" followed by text, so an empty heading fails. README says the human-unset behaviour and that How to review is a prompt for evidence, not proof. Structured review evidence: not built, wait for users to ask. Version 0.4.1. Tests 16/16 (fixture TASK-4 now has an empty How to review:, the no-human test checks the warning appears and disappears with --human).

How to review: git diff main...task/TASK-17; node --test test/truth.test.ts; node bin/truth.ts (no --human) now warns about the human option while TASK-17 waits on you; node bin/truth.ts --human @fredy is clean.
<!-- SECTION:FINAL_SUMMARY:END -->
