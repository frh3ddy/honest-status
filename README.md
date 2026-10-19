# honest-status

A Claude Code plugin that keeps project status honest on top of
[Backlog.md](https://github.com/MrLesk/Backlog.md). Your agent can move work forward and ask for
review, but only your merge makes a task Done, and git proves it.

**Status: early.** Built in the open; this repo tracks its own tasks with Backlog.md.

## Planned

- A board of what's waiting on you, in progress, next and built, read from Backlog.md and git.
- A Stop hook that sends Claude back when task status drifts from the rules.
- `/honest-status:merge <task-id>`: the human approval that merges and marks a task Done.
- An optional, written test-only merge policy for an approver agent. Empty by default.

## Requirements

Claude Code, Backlog.md, git, Node 22.18+ (runs the checker's TypeScript directly).

## Guardrails, not security

Claude has git access and could forge a commit trailer if it tried. The goal is to make the
honest path the easy one and make drift visible, not to stop a determined agent.

## License

To be decided before the first release.
