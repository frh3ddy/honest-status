---
name: truth-rules
description: How to move Backlog.md tasks honestly in a project that uses honest-status. Use whenever you start, block, finish, hand off or report on a Backlog.md task, change a task's status or assignee, or are about to say work is "done".
---

# Truth rules

Status lives in Backlog.md and git proves Done. You move work forward and ask for review; only a
human merge makes a task Done. A Stop hook checks these rules and sends you back once if they are
broken.

## Moving a task

| When | Do |
| --- | --- |
| You start | `backlog task edit <id> -s "In Progress"`. One task In Progress at a time. |
| You can't continue without the human | `-s Blocked`, assign it to the human, and say exactly what you need in a comment. |
| You have a question that doesn't stop the work | Make a task labeled `question`, assigned to the human, and keep going on a stated default. |
| The work is ready | Write the final summary, move it to `In Review`, assign it to the human. |
| You change only the board, outside a task (file tasks, add notes, tick a criterion) | Commit it on a `board/<name>` branch, never on main, and ask the human to type `/honest-status:merge board/<name>`. |
| Never | Set a task to `Done`. |

The human is the plugin's `human` option (`${user_config.human}`). If that is empty, use the
person the project's instructions name. If nothing names them, ask the user who to assign; don't
guess from git config or other usernames.

## In Review needs evidence

`--final-summary` must say what changed and include a `How to review:` part: the commands to run
or the screens to look at. Example:

```sh
backlog task edit TASK-7 -s "In Review" -a @fredy --final-summary "Added X. Chose Y over Z because …

How to review: node --test; open /settings and toggle dark mode."
```

## Done means merged

A task is Done only when the main branch has a commit with its ID in the subject, like
`feat(TASK-7): …`, made by the human's merge. If you see a Done task with no such commit, move it
back to In Review and tell the human. Don't report work as done in prose either: say it is In
Review and waiting for their merge.

Merging is the human's step, and it goes through one command they type:
`/honest-status:merge <task-id>`. If the user asks you to merge a task, or to mark it done, tell
them to type that command. Don't merge into the main branch yourself (no `git merge`, no
`git commit` on main, no running `truth.ts --merge`), even when asked in words: the typed command
is what records their approval.

One exception: the test-only policy. If the project has a `.honest-status/test-only` file on its
main branch and you are asked to act as the approver for an In Review task that only adds or edits
tests, you may run:

```sh
node "${CLAUDE_SKILL_DIR}/../../bin/truth.ts" --merge <task-id> --policy test-only --main '${user_config.main}' --checks '${user_config.checks}'
```

The script decides, not you: it refuses anything but test files the policy lists, deleted or
skipped tests, snapshots and test config, and merges only when the checks pass. If it says
"Not merged", leave the task In Review for the human. Never edit the policy file to get a merge
through.

## Tests

Never delete, skip (`.skip`, `.only`, `xit`, `@skip`…) or loosen a failing or flaky test to get
green. File a `question` task assigned to the human with the evidence: the test name, the failure
output, and how often it fails.

## Check the board

`node "${CLAUDE_SKILL_DIR}/../../bin/truth.ts"` prints what's waiting on the human, in progress, next
and built, and lists any broken rule. Run it before you finish.
