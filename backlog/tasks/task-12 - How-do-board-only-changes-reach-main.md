---
id: TASK-12
title: How do board-only changes reach main?
status: To Do
assignee:
  - '@fredy'
created_date: '2026-10-20 20:30'
labels:
  - question
dependencies: []
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Filing tasks or editing open questions changes only backlog/ files, but agents never commit to main and --merge only merges an In Review task and sets it Done. So board-only commits (like board/plan-questions for TASK-10, TASK-11) need a manual fast-forward by Fredy. Options: a --merge mode for backlog-only branches that sets nothing Done; let agents commit backlog-only changes to main; or keep the manual fast-forward. Default until answered: manual fast-forward.
<!-- SECTION:DESCRIPTION:END -->
