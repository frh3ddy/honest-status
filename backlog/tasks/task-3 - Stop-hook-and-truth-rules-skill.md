---
id: TASK-3
title: Stop hook and truth-rules skill
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 23:18'
labels: []
dependencies:
  - TASK-2
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 3. hooks/hooks.json Stop hook -> bin/truth.ts --hook (blocks once per turn, no loop); skills/truth-rules/SKILL.md; load with claude --plugin-dir .
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 hooks/hooks.json runs bin/truth.ts --hook on Stop
- [x] #2 skills/truth-rules/SKILL.md covers moving tasks, In Review evidence, Done means merged, flaky tests
- [x] #3 claude --plugin-dir . loads the plugin and the hook blocks once, then warns
- [x] #4 claude plugin validate . passes
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Plugin is loadable: .claude-plugin/plugin.json, hooks/hooks.json (Stop -> node ${CLAUDE_PLUGIN_ROOT}/bin/truth.ts --hook), skills/truth-rules/SKILL.md. `claude plugin validate .` passes; its one warning is that CLAUDE.md at the root is not plugin context, which is intended.

Options moved to plugin userConfig (`human`, `main`): Claude Code passes them to hooks as CLAUDE_PLUGIN_OPTION_HUMAN / _MAIN, so the HONEST_STATUS_* env vars are gone. --human / --main flags stay for the CLI.

Tested live: headless `claude -p --plugin-dir` (Haiku) in a scratch repo with an unmerged Done task. The hook blocked once and Claude came back; on the second stop it only warned, with no loop. The first run showed Claude editing the task file by hand, so the block message now gives the exact `backlog task edit` command and points to the skill; on the rerun Claude used it. The rerun also showed the scratch repo had Backlog.md default statuses (no Blocked/In Review), so the checker now errors when the config lacks the plugin statuses (`backlog config get statuses`). 6 tests pass. README "Works today" section added.

Open: a "Stop hook error occurred" notice showed in the first live run; the stream does not say which Stop hook caused it (you have other plugins with Stop hooks), and the hook message reached Claude correctly.

How to review: `node --test test/truth.test.ts`; `claude plugin validate .`; in a scratch Backlog.md repo, set a task Done with no merge and run `claude --plugin-dir /Users/fredy/honest-status`, say hi, and watch the hook send it back once.

Follow-up after your live test: the skill now says to ask who to assign when the human option is empty and nothing names them, instead of guessing from git config (the test session assigned @frh3ddy).
<!-- SECTION:FINAL_SUMMARY:END -->
