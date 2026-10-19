---
id: TASK-4
title: merge skill
status: Done
assignee:
  - '@fredy'
created_date: '2026-10-19 18:24'
updated_date: '2026-10-19 23:28'
labels: []
dependencies:
  - TASK-3
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build step 4. /honest-status:merge <task-id>: task In Review, checks pass, squash-merge with task ID and Approved-by: human, set Done. disable-model-invocation: true; verify it runs when the user types it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 skills/merge/SKILL.md with disable-model-invocation: true runs bin/truth.ts --merge
- [x] #2 Merge refuses unless the task is In Review with no rule broken and the checks pass, and leaves main unchanged on failure
- [x] #3 Merge commit is feat(<id>): <title> with Approved-by: human, and sets the task Done
- [x] #4 Verified live that it runs when the user types it, and that Claude does not run it on its own
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Merge is `node bin/truth.ts --merge <id> [--branch b] [--checks cmd]`, wrapped by skills/merge/SKILL.md (disable-model-invocation: true). Steps: requires a clean tree, then checks out main and runs `git merge --squash` on the one branch whose name has the task ID. On the merged result it requires In Review and no rule broken (same rules as the board), runs the checks, sets Done and commits `feat(ID): title` with the trailer `Approved-by: human`. Any failure runs `git reset --hard` (safe: the tree was clean), so main is unchanged. New `checks` plugin option. 3 new tests (9 total).

Live tests (headless, Haiku + Sonnet, scratch repos):
- Typed `/honest-status:merge TASK-1`: both models ran it, no refusal. The first try failed because under --plugin-dir Claude Code leaves `${user_config.*}` in skill text unsubstituted and the shell could not parse it. Now the placeholders are single-quoted and the script ignores unfilled values. Retest: both merged correctly.
- Asked in words to "merge TASK-1 and mark it done": Claude did not invoke the merge skill, but tried a manual `git merge` (stopped only by permissions). truth-rules now says merging goes only through the typed command; retest: Claude told the user to type /honest-status:merge instead.

Limits: the model can still run `truth.ts --merge` or git itself if it ignores the skill (guardrails, not security). Whether ${user_config.*} gets filled in for an installed plugin is untested until TASK-5. The merge does not delete the branch or push.

How to review: `node --test test/truth.test.ts`; then in a scratch Backlog.md repo with an In Review task on branch task/TASK-1, run `claude --plugin-dir /Users/fredy/honest-status` and type `/honest-status:merge TASK-1`; also try "please merge TASK-1" in words and check it points you to the command. Or merge this very task with `/honest-status:merge TASK-4` from a session loaded with `--plugin-dir .`, which is the real dogfood.
<!-- SECTION:FINAL_SUMMARY:END -->
