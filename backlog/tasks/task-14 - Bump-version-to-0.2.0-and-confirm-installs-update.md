---
id: TASK-14
title: Bump version to 0.2.0 and confirm installs update
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 21:24'
updated_date: '2026-10-20 21:29'
labels: []
dependencies: []
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
plugin.json is still 0.1.0, as installed. Since then main gained the adoption baseline (TASK-13). Bump .claude-plugin/plugin.json to 0.2.0, then confirm an installed copy picks it up (claude plugin update or reinstall, in a throwaway CLAUDE_CONFIG_DIR) and record whether an unchanged version blocks updates.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 plugin.json version is 0.2.0 and claude plugin validate passes
- [ ] #2 An installed 0.1.0 copy updates to 0.2.0, verified in a throwaway config
- [x] #3 README or the task summary says how users get updates, and whether the version must change
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Bumped .claude-plugin/plugin.json to 0.2.0 (validate passes, 14/14 tests).

Finding, from a throwaway CLAUDE_CONFIG_DIR with the GitHub marketplace: installed copies are cached per version (plugins/cache/honest-status/honest-status/<version>/). With the marketplace clone rolled back to cd35970 (0.1.0, no adoption baseline), installing, then `marketplace update` (clone moved to 310d387) and `plugin update` printed "already at the latest version (0.1.0)" and the copy kept the old code. After setting 0.2.0 in that throwaway clone, `plugin update` printed "updated from 0.1.0 to 0.2.0" and the new copy has doneAtBaseline. So the version must change for users to get anything. Your own install (local scope) is 0.1.0 from cd35970, without the adoption baseline.

Docs: README says how to update (marketplace update, plugin update, restart) and that only a version change updates; CLAUDE.md now says to bump the version in any task that changes what users get.

AC 2 is left unchecked: the 0.2.0 update was verified with a local commit in the throwaway clone, not with 0.2.0 on GitHub, which only exists after this merge.

How to review: git diff main...task/TASK-14. After merging and pushing: claude plugin marketplace update honest-status && claude plugin update honest-status@honest-status should say 0.1.0 -> 0.2.0 for your install; then check AC 2.
<!-- SECTION:FINAL_SUMMARY:END -->
