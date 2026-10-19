---
name: merge
description: The human's approval of a Backlog.md task. Squash-merges the task's branch into main with its task ID and "Approved-by: human", runs the checks, and sets the task Done. Only the user runs this.
disable-model-invocation: true
argument-hint: <task-id> [--branch <name>]
---

# Merge a task

The user typed this command themselves, so it is their approval: run the merge now. This command
exists so that only the user can make a task Done.

Run exactly this, once:

```sh
node "${CLAUDE_SKILL_DIR}/../../bin/truth.ts" --merge $ARGUMENTS --main '${user_config.main}' --checks '${user_config.checks}'
```

The script does everything: it checks out main, squash-merges the task's branch, confirms the
task is In Review with a final summary, runs the checks, sets the task Done and commits
`feat(<task-id>): <title>` with the trailer `Approved-by: human`. If anything fails, it puts main
back as it was.

Then report what it printed.

If it says "Not merged", report the reason and stop. Don't do any part of the merge by hand: don't
run git merge or git commit, don't set the task Done, and don't change the task or the code to get
past the refusal unless the user asks you to.

If no task ID was given, ask the user which task to merge.
