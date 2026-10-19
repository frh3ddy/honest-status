# First session prompt

Paste this into Claude Code from the repo root. Delete this file once the session is done.

```
This repo is honest-status: a Claude Code plugin that adds truth rules
on top of Backlog.md. Read PLAN.md and reference/check.ts (the checker
from another project of mine).

First session only:
1. Initialize Backlog.md with statuses
   [To Do, In Progress, Blocked, In Review, Done].
2. Create one task per step of the build order in PLAN.md.
3. Run `backlog task list --json` and record the real field names in
   docs/backlog-json.md.
Don't write the checker yet.
```
