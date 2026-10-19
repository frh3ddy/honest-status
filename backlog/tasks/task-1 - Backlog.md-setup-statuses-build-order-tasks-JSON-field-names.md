---
id: TASK-1
title: 'Backlog.md setup: statuses, build-order tasks, JSON field names'
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 18:38'
labels: []
dependencies: []
references:
  - PLAN.md
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 1 of PLAN.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 backlog/config.yml statuses are To Do, In Progress, Blocked, In Review, Done
- [x] #2 One task per build-order step
- [x] #3 docs/backlog-json.md records the real field names from backlog task list --json
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Backlog.md 1.54.0 initialized (backlog/config.yml): statuses To Do, In Progress, Blocked, In Review, Done; label 'question'. TASK-1..TASK-7 map to PLAN.md build steps 1-7, chained with dependencies. docs/backlog-json.md records the real JSON fields. Key finding: 'task list --json' has no finalSummary or dependencies; those need 'task view <id> --json'. Removed docs/first-session.md as it asked.

How to review: run 'backlog board' and 'backlog task list --plain'; check statuses in backlog/config.yml; spot-check docs/backlog-json.md against 'backlog task view TASK-1 --json'.
<!-- SECTION:FINAL_SUMMARY:END -->
