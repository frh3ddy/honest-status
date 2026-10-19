# honest-status

A Claude Code plugin that keeps project status honest on top of
[Backlog.md](https://github.com/MrLesk/Backlog.md). Your agent can move work forward and ask for
review, but only your merge makes a task Done, and git proves it.

**Status: early.** Built in the open; this repo tracks its own tasks with Backlog.md.

## Works today

- A board of what's waiting on you, in progress, next and built, read from Backlog.md and git:
  `node bin/truth.ts` (`--json` for tools).
- A Stop hook that sends Claude back once when task status breaks the rules, then lets it stop
  with a warning so it can't loop.
- A `truth-rules` skill: how Claude moves tasks.

Try it locally: `claude --plugin-dir /path/to/honest-status` from a repo that uses Backlog.md with
the statuses `To Do, In Progress, Blocked, In Review, Done`.

Options (plugin settings, both optional): `human`, who tasks waiting on you are assigned to (unset:
any assignee counts), and `main`, the branch whose commits prove Done (unset: `main`).

## Planned

- `/honest-status:merge <task-id>`: the human approval that merges and marks a task Done.
- An optional, written test-only merge policy for an approver agent. Empty by default.

## Requirements

Claude Code, Backlog.md, git, Node 22.18+ (runs the checker's TypeScript directly).

## Guardrails, not security

Claude has git access and could forge a commit trailer if it tried. The goal is to make the
honest path the easy one and make drift visible, not to stop a determined agent.

## License

To be decided before the first release.
