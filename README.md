# honest-status

A Claude Code plugin that keeps project status honest on top of
[Backlog.md](https://github.com/MrLesk/Backlog.md). Your agent can move work forward and ask for
review, but only your merge makes a task Done, and git proves it.

**Status: early.** Built in the open; this repo tracks its own tasks with Backlog.md.

See it in use: [honest-status-demo](https://github.com/frh3ddy/honest-status-demo), a tiny CLI
whose git log shows one task merged by a human and one merged by an approver agent under the
test-only policy.

## Works today

- A board of what's waiting on you, in progress, next and built, read from Backlog.md and git:
  `node bin/truth.ts` (`--json` for tools).
- A Stop hook that sends Claude back once when task status breaks the rules, then lets it stop
  with a warning so it can't loop.
- A `truth-rules` skill: how Claude moves tasks.
- `/honest-status:merge <task-id>`: your approval. Squash-merges the task's branch into main with
  `feat(<task-id>): <title>` and `Approved-by: human`, after checking the task is In Review with a
  summary and the checks pass, then sets it Done. If anything fails, main is left as it was. Claude
  can't run it on its own; you type it.
- An optional test-only merge policy for an approver agent, off by default. List test globs, one
  per line, in `.honest-status/test-only` on main (like `test/**/*.test.ts`). Then
  `node bin/truth.ts --merge <task-id> --policy test-only` merges a task only if every changed file
  is an added or edited test the policy lists (no deletions, renames, snapshots, test config, new
  `.skip` or `.only`) and the checks pass. It commits with `Approved-by: policy:test-only`, and the
  board re-checks every such commit. The skip and deletion checks read the diff line by line, so
  they can be fooled.

Install, from a repo that uses Backlog.md with the statuses
`To Do, In Progress, Blocked, In Review, Done`:

```
/plugin install honest-status --marketplace frh3ddy/honest-status
```

Or try a local checkout: `claude --plugin-dir /path/to/honest-status`.

To update, refresh the marketplace, then the plugin, and restart Claude Code:

```sh
claude plugin marketplace update honest-status
claude plugin update honest-status@honest-status
```

An installed copy only updates when the version in `.claude-plugin/plugin.json` changes.

Adopting a project that already has Done tasks? They have no merge commits, so the board would
flag every one. Commit the board as it is and tag it first; tasks Done at the tag count as built:

```sh
git tag honest-status-start main
```

Tasks set Done after the tag still need a merge.

Options (plugin settings, all optional): `human`, who tasks waiting on you are assigned to (unset:
any assignee counts); `main`, the branch whose commits prove Done (unset: `main`); and `checks`, a
command the merge runs on the merged result, like `npm test` (unset: no checks).

## Requirements

Claude Code, Backlog.md, git, Node 22.18+ (runs the checker's TypeScript directly).

## Guardrails, not security

Claude has git access and could forge a commit trailer if it tried. The goal is to make the
honest path the easy one and make drift visible, not to stop a determined agent.

## License

MIT. See [LICENSE](LICENSE).
