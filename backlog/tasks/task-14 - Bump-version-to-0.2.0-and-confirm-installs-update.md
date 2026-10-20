---
id: TASK-14
title: Bump version to 0.2.0 and confirm installs update
status: To Do
assignee: []
created_date: '2026-10-20 21:24'
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
- [ ] #1 plugin.json version is 0.2.0 and claude plugin validate passes
- [ ] #2 An installed 0.1.0 copy updates to 0.2.0, verified in a throwaway config
- [ ] #3 README or the task summary says how users get updates, and whether the version must change
<!-- AC:END -->
