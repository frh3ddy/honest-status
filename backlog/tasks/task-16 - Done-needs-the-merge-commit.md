---
id: TASK-16
title: Done needs the merge commit
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-21 03:22'
updated_date: '2026-10-21 04:21'
labels: []
dependencies: []
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A task counted as built if any main commit subject contained (task-id): a wip commit, a revert, or an untrailered feat commit all proved Done. Require the merge command's own commit.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Done needs a main commit with subject feat(<id>): and Approved-by human or policy:test-only
- [x] #2 wip(<id>) and untrailered feat(<id>) commits don't prove Done (test)
- [x] #3 README no longer says git proves Done; guardrails section says the board trusts the trailer
- [x] #4 plugin.json is 0.4.0
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Done now needs the merge command's own commit: a main commit whose subject starts with feat(<id>): and whose Approved-by trailer is human or policy:test-only (new mergeCommits() in bin/truth.ts, used by the board, the hook, the policy re-check and merge's already-merged check). Before, any subject containing (<id>) counted, so a wip(<id>) commit from a plain git merge or an untrailered feat commit proved Done. The fixture now has both on main for TASK-2 and the board still flags it. Not done: a later revert isn't noticed (ponytail comment). Trailers stay forgeable; README now says the board trusts the trailer instead of 'git proves it'. Version 0.4.0. Tests 16/16; this repo's board and the demo's board are both clean.

How to review: git diff main...task/TASK-16; node --test test/truth.test.ts; node bin/truth.ts --human @fredy; in ../honest-status-demo run node ../honest-status/bin/truth.ts.
<!-- SECTION:FINAL_SUMMARY:END -->
