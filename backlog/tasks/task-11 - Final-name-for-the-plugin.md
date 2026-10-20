---
id: TASK-11
title: Final name for the plugin
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-20 20:29'
updated_date: '2026-10-20 21:34'
labels:
  - question
dependencies: []
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Open question from PLAN.md: final name. Default until answered: keep honest-status (now published as frh3ddy/honest-status and honest-status-demo, so a rename means renaming both repos and the marketplace).
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Answered (Fredy, 2026-10-20): keep honest-status. It says what the plugin does, and it is already the command namespace (/honest-status:merge), policy dir (.honest-status/), baseline tag (honest-status-start), install id (honest-status@honest-status) and both public repos; renaming would mean migrating all of them and reinstalling.

Changes: PLAN.md Open questions now says none, name decided here. No code changes.

How to review: git diff main...task/TASK-11 (PLAN.md and this task file only).
<!-- SECTION:FINAL_SUMMARY:END -->
