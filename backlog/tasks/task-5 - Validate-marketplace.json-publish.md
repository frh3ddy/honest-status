---
id: TASK-5
title: 'Validate, marketplace.json'
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 23:45'
labels: []
dependencies:
  - TASK-4
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 5. claude plugin validate, .claude-plugin/marketplace.json, publish.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Publishing split out to TASK-8.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added .claude-plugin/marketplace.json (marketplace honest-status, plugin source ./, description), MIT LICENSE, "license": "MIT" in plugin.json, README install line and license section. claude plugin validate . passes; the only warning is CLAUDE.md at the root, which is dev guidance and intentionally not plugin context. node --test test/truth.test.ts: 9/9 pass.

How to review: git diff main...task/TASK-5; run claude plugin validate . and node --test test/truth.test.ts. Publishing is TASK-8.
<!-- SECTION:FINAL_SUMMARY:END -->
