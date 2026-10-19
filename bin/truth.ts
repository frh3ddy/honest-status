#!/usr/bin/env node
// bin/truth.ts: the board for a Backlog.md project, and the check that keeps its status honest.
//
//   node bin/truth.ts [dir]          print the board; exit 1 if a rule is broken
//   node bin/truth.ts [dir] --json   the same data as JSON, for tools (always exits 0)
//   node bin/truth.ts --hook         Claude Code Stop hook
//   node bin/truth.ts --merge <id>   the human's approval: squash-merge the task's branch, set Done
//
// Options, all optional. As a plugin, they come from its userConfig (`human`, `main`), which
// Claude Code passes to hooks as CLAUDE_PLUGIN_OPTION_HUMAN and CLAUDE_PLUGIN_OPTION_MAIN.
//   --human <name>   who "waiting on the human" means, like @fredy. Unset: any assignee counts.
//   --main <branch>  the branch whose commits prove Done (default: main)
//   --checks <cmd>   --merge only: run on the merged result, like "npm test" (default: none)
//   --branch <name>  --merge only: the task's branch (default: the one branch named with its id)
//
// Only node: built-ins and erasable TypeScript, so Node ≥ 22.18 runs it directly.
// Field names come from docs/backlog-json.md.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SCHEMA_VERSION = 1;
const STATUSES = ['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'];

interface ListTask {
  id: string;
  title: string;
  status: string;
  archived: boolean;
  assignees: string[];
  labels: string[];
  ordinal: number | null;
  isReady: boolean;
}

interface Problem {
  task: string;
  message: string;
}

interface Entry {
  id: string;
  title: string;
  why: 'review' | 'blocked' | 'question';
}

interface Report {
  root: string;
  generatedAt: string;
  human: string | null;
  mainBranch: string;
  waiting: Entry[];
  inProgress: string[];
  next: { id: string; title: string } | null;
  built: string[];
  errors: Problem[];
  warnings: Problem[];
}

interface Options {
  human: string | null;
  mainBranch: string;
}

function run(cmd: string, args: string[], cwd: string): string | null {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

// Backlog.md finds its own project root from any folder inside it; null means "not a project".
function backlogJson(cwd: string, args: string[], kind: string): Record<string, unknown> {
  const out = run('backlog', [...args, '--json'], cwd);
  if (out === null) throw new Error(`\`backlog ${args.join(' ')} --json\` failed`);
  const data = JSON.parse(out) as Record<string, unknown>;
  if (data.schemaVersion !== SCHEMA_VERSION || data.kind !== kind) {
    throw new Error(
      `backlog returned schemaVersion ${String(data.schemaVersion)}, kind ${String(data.kind)}; ` +
        `this checker knows schemaVersion ${SCHEMA_VERSION}. Re-check docs/backlog-json.md.`,
    );
  }
  return data;
}

function findRoot(start: string): string | null {
  if (run('backlog', ['task', 'list', '--json', '--max-count', '1'], start) === null) return null;
  return run('git', ['rev-parse', '--show-toplevel'], start)?.trim() ?? resolve(start);
}

const norm = (name: string): string => name.trim().replace(/^@/, '').toLowerCase();
const idNumber = (id: string): number => Number(/\d+$/.exec(id)?.[0] ?? 0);

function buildReport(root: string, opts: Options): Report {
  const errors: Problem[] = [];
  const warnings: Problem[] = [];

  const tasks = (backlogJson(root, ['task', 'list'], 'task-list').tasks as ListTask[])
    .filter((t) => !t.archived)
    .sort((a, b) => (a.ordinal ?? Infinity) - (b.ordinal ?? Infinity) || idNumber(a.id) - idNumber(b.id));

  // The rules need these statuses; Backlog.md's defaults have no Blocked or In Review.
  const configured = (run('backlog', ['config', 'get', 'statuses'], root) ?? '').split(',').map((x) => x.trim());
  const missing = STATUSES.filter((x) => !configured.includes(x));
  if (missing.length > 0) {
    errors.push({
      task: '-',
      message: `Backlog.md has no ${missing.map((x) => `"${x}"`).join(', ')} status; set statuses: [${STATUSES.map((x) => `"${x}"`).join(', ')}] in the Backlog.md config file`,
    });
  }

  const hasMain = run('git', ['rev-parse', '--verify', '--quiet', `${opts.mainBranch}^{commit}`], root) !== null;
  const mainSubjects = hasMain
    ? (run('git', ['log', opts.mainBranch, '--format=%s'], root) ?? '').toLowerCase().split('\n')
    : null;
  if (!mainSubjects) {
    warnings.push({ task: '-', message: `no "${opts.mainBranch}" branch, so Done can't be checked against merges` });
  }
  const merged = (id: string): boolean => mainSubjects?.some((s) => s.includes(`(${id.toLowerCase()})`)) ?? false;

  const human = opts.human ? norm(opts.human) : null;
  const assignedToHuman = (t: ListTask): boolean =>
    human ? t.assignees.some((a) => norm(a) === human) : t.assignees.length > 0;
  const who = opts.human ?? 'the human';

  const isQuestion = (t: ListTask): boolean => t.labels.some((l) => l.toLowerCase() === 'question');
  const waiting: Entry[] = [];
  for (const t of tasks) {

    if (t.status === 'Done') {
      if (mainSubjects && !merged(t.id)) {
        errors.push({
          task: t.id,
          message: `is Done, but no commit with "(${t.id})" is on ${opts.mainBranch}; only a merge makes a task Done. Move it back: \`backlog task edit ${t.id} -s "In Review"\`.`,
        });
      }
      continue;
    }
    if (merged(t.id)) {
      warnings.push({ task: t.id, message: `${opts.mainBranch} has a commit with "(${t.id})": if it was merged, set it Done` });
    }

    if (t.status === 'In Review') {
      // The list has no finalSummary; only `task view` does.
      const view = backlogJson(root, ['task', 'view', t.id], 'task-view').task as { finalSummary: string | null };
      const summary = view.finalSummary?.trim() ?? '';
      if (summary === '') {
        errors.push({ task: t.id, message: 'is In Review without a final summary: add one with --final-summary' });
      } else if (!/how to review/i.test(summary)) {
        errors.push({ task: t.id, message: 'is In Review, but its final summary has no "How to review:" part' });
      }
    }

    const why = t.status === 'In Review' ? 'review' : t.status === 'Blocked' ? 'blocked' : isQuestion(t) ? 'question' : null;
    if (why) {
      waiting.push({ id: t.id, title: t.title, why });
      if (!assignedToHuman(t)) {
        const what = why === 'question' ? 'is labeled question' : `is ${t.status}`;
        errors.push({ task: t.id, message: `${what}, so it must be assigned to ${who}` });
      }
    }
  }

  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  if (inProgress.length > 1) {
    warnings.push({
      task: inProgress.map((t) => t.id).join(', '),
      message: `${inProgress.length} tasks are In Progress; one per session is the rhythm`,
    });
  }
  const next = tasks.find((t) => t.status === 'To Do' && t.isReady && !isQuestion(t)) ?? null;

  return {
    root,
    generatedAt: new Date().toISOString(),
    human: opts.human,
    mainBranch: opts.mainBranch,
    waiting,
    inProgress: inProgress.map((t) => t.id),
    next: next ? { id: next.id, title: next.title } : null,
    built: tasks.filter((t) => t.status === 'Done' && merged(t.id)).map((t) => t.id),
    errors,
    warnings,
  };
}

function printBoard(r: Report): void {
  const out: string[] = [];
  out.push(`Waiting on you (${r.waiting.length})`);
  if (r.waiting.length === 0) out.push('  nothing');
  for (const w of r.waiting) out.push(`  ${w.why.padEnd(8)}  ${w.id} · ${w.title}`);
  out.push('', 'In progress', ...(r.inProgress.length ? r.inProgress.map((id) => `  ${id}`) : ['  nothing']));
  out.push('', 'Next', r.next ? `  ${r.next.id} · ${r.next.title}` : '  nothing ready');
  out.push('', `Built (${r.built.length})`, ...(r.built.length ? r.built.map((id) => `  ${id}`) : ['  nothing yet']));
  out.push('');
  out.push(
    r.errors.length + r.warnings.length === 0
      ? 'Truth rules: OK'
      : `Truth rules: ${r.errors.length} errors, ${r.warnings.length} warnings`,
  );
  for (const e of r.errors) out.push(`  ✗ ${e.task} ${e.message}`);
  for (const w of r.warnings) out.push(`  ! ${w.task} ${w.message}`);
  console.log(out.join('\n'));
}

// The human typed /honest-status:merge: squash the task's branch into main, check the merged
// result, set Done and commit with the task id and `Approved-by: human`. On any failure, main is
// put back as it was. Returns the exit code.
function merge(root: string, id: string, opts: Options, branchArg: string | null, checks: string | null): number {
  const fail = (message: string): number => {
    console.error(`Not merged: ${message}`);
    return 1;
  };
  const git = (...args: string[]): string | null => run('git', args, root);
  id = id.toUpperCase();

  if ((git('status', '--porcelain', '--untracked-files=no') ?? 'x').trim() !== '') {
    return fail('the working tree has uncommitted changes; commit or stash them first');
  }
  if (git('rev-parse', '--verify', '--quiet', `${opts.mainBranch}^{commit}`) === null) {
    return fail(`there is no "${opts.mainBranch}" branch`);
  }
  const subjects = (git('log', opts.mainBranch, '--format=%s') ?? '').toLowerCase();
  if (subjects.includes(`(${id.toLowerCase()})`)) return fail(`${opts.mainBranch} already has a commit with "(${id})"`);

  let branch = branchArg;
  if (!branch) {
    const named = new RegExp(`(^|[^a-z0-9])${id.toLowerCase()}($|[^0-9])`);
    const found = (git('branch', '--list', '--format=%(refname:short)') ?? '')
      .split('\n')
      .filter((b) => b && b !== opts.mainBranch && named.test(b.toLowerCase()));
    if (found.length !== 1) {
      return fail(
        found.length === 0
          ? `no branch has ${id} in its name; pass the branch: --merge ${id} --branch <name>`
          : `several branches name ${id} (${found.join(', ')}); pass one with --branch`,
      );
    }
    branch = found[0] ?? '';
  }
  if (git('rev-parse', '--verify', '--quiet', `${branch}^{commit}`) === null) return fail(`no branch "${branch}"`);

  const start = git('rev-parse', '--abbrev-ref', 'HEAD')?.trim() ?? opts.mainBranch;
  if (git('checkout', '--quiet', opts.mainBranch) === null) return fail(`couldn't check out ${opts.mainBranch}`);
  const undo = (message: string): number => {
    git('reset', '--quiet', '--hard'); // safe: the tree was clean before we started
    if (start !== opts.mainBranch) git('checkout', '--quiet', start);
    return fail(`${message}. ${opts.mainBranch} is unchanged.`);
  };

  if (git('merge', '--squash', '--quiet', branch) === null) return undo(`${branch} doesn't merge cleanly into ${opts.mainBranch}`);

  // Judge the task as it stands on the merged result, with the same rules as the board.
  let task: { title: string; status: string; path: string };
  let problems: Problem[];
  try {
    task = backlogJson(root, ['task', 'view', id], 'task-view').task as typeof task;
    problems = buildReport(root, opts).errors.filter((e) => e.task === id || e.task === '-');
  } catch (e) {
    return undo((e as Error).message);
  }
  if (task.status !== 'In Review') return undo(`${id} is ${task.status}; only In Review tasks can be merged`);
  if (problems.length > 0) return undo(problems.map((p) => `${p.task} ${p.message}`).join('; '));

  if (checks) {
    console.log(`Running checks: ${checks}`);
    // ponytail: one shell command string; a list of commands if projects need several
    if (spawnSync('sh', ['-c', checks], { cwd: root, stdio: 'inherit' }).status !== 0) return undo('the checks failed');
  } else {
    console.log('No checks configured (the plugin\'s `checks` option); merging without running any.');
  }

  if (run('backlog', ['task', 'edit', id, '-s', 'Done', '--plain'], root) === null) return undo(`couldn't set ${id} to Done`);
  git('add', '--', task.path);
  if (git('commit', '--quiet', '-m', `feat(${id}): ${task.title}`, '--trailer', 'Approved-by: human') === null) {
    return undo("git commit failed (a commit hook may have refused it)");
  }
  console.log(`Merged ${branch} into ${opts.mainBranch} as "feat(${id}): ${task.title}" and set ${id} Done.`);
  console.log(`The branch ${branch} is kept; delete it with: git branch -D ${branch}`);
  return 0;
}

function readHookInput(): { cwd: string | null; stopHookActive: boolean } {
  try {
    const data: unknown = JSON.parse(readFileSync(0, 'utf8') || '{}');
    if (data !== null && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      return { cwd: typeof o.cwd === 'string' ? o.cwd : null, stopHookActive: o.stop_hook_active === true };
    }
  } catch {
    // No input, or not JSON: check the project anyway.
  }
  return { cwd: null, stopHookActive: false };
}

// Stop hook: when a rule is broken, keep Claude working with the list of problems.
// Exit 0 with a JSON decision on stdout, so stray stderr output never changes the outcome.
function runHook(opts: Options): void {
  const input = readHookInput();
  const root = findRoot(input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
  if (!root) return; // not a Backlog.md project (or no backlog CLI): nothing to check

  let report: Report;
  try {
    report = buildReport(root, opts);
  } catch (e) {
    console.log(JSON.stringify({ systemMessage: `honest-status couldn't check the board: ${(e as Error).message}` }));
    return;
  }
  if (report.errors.length === 0) return;

  const list = report.errors.map((e) => `- ${e.task} ${e.message}`).join('\n');
  if (input.stopHookActive) {
    // Already sent back once this turn; don't loop. Tell the human instead.
    console.log(JSON.stringify({ systemMessage: `Task status still breaks the truth rules:\n${list}` }));
    return;
  }
  console.log(
    JSON.stringify({
      decision: 'block',
      reason: [
        'Task status breaks the truth rules. Fix these before you finish:',
        list,
        'Change tasks with `backlog task edit`, not by editing their files; the truth-rules skill has the rules.',
        `Run \`node ${process.argv[1]}\` to see the whole board.`,
      ].join('\n'),
    }),
  );
}

function option(args: string[], flag: string, env: string): string | null {
  const i = args.indexOf(flag);
  const value = i >= 0 ? args[i + 1] : process.env[env];
  // A literal "${user_config.x}" means Claude Code didn't fill the option in (it doesn't under --plugin-dir).
  return value && !value.startsWith('--') && !value.startsWith('${') ? value : null;
}

function main(): void {
  const args = process.argv.slice(2);
  const opts: Options = {
    human: option(args, '--human', 'CLAUDE_PLUGIN_OPTION_HUMAN'),
    mainBranch: option(args, '--main', 'CLAUDE_PLUGIN_OPTION_MAIN') ?? 'main',
  };
  if (args.includes('--hook')) {
    runHook(opts);
    return;
  }
  const valued = ['--human', '--main', '--merge', '--branch', '--checks'];
  const start = args.find((a, i) => !a.startsWith('--') && !valued.includes(args[i - 1] ?? '')) ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const root = findRoot(start);
  if (!root) {
    console.error(`No Backlog.md project at ${resolve(start)} (or the backlog CLI isn't installed).`);
    process.exitCode = 1;
    return;
  }
  const mergeId = option(args, '--merge', '');
  if (args.includes('--merge')) {
    process.exitCode = mergeId
      ? merge(root, mergeId, opts, option(args, '--branch', ''), option(args, '--checks', 'CLAUDE_PLUGIN_OPTION_CHECKS'))
      : 1;
    if (!mergeId) console.error('Usage: node bin/truth.ts --merge <task-id> [--branch <name>] [--checks <cmd>]');
    return;
  }
  const report = buildReport(root, opts);
  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  printBoard(report);
  if (report.errors.length > 0) process.exitCode = 1;
}

main();
