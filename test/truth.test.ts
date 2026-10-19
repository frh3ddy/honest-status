// Runs bin/truth.ts against a throwaway git repo with a real Backlog.md project.
// Needs the backlog CLI on PATH. Run: node --test test/truth.test.ts

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';

const TRUTH = join(import.meta.dirname, '..', 'bin', 'truth.ts');
const dir = mkdtempSync(join(tmpdir(), 'truth-test-'));
after(() => rmSync(dir, { recursive: true, force: true }));

const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cmd: string, args: string[]): string => execFileSync(cmd, args, { cwd: dir, env, encoding: 'utf8' });
const backlog = (...args: string[]): string => sh('backlog', args);
const truth = (args: string[], input = ''): { out: string; code: number } => {
  try {
    return { out: execFileSync('node', [TRUTH, ...args], { cwd: dir, env, input, encoding: 'utf8' }), code: 0 };
  } catch (e) {
    const err = e as { stdout: string; status: number };
    return { out: err.stdout, code: err.status };
  }
};

sh('git', ['init', '-q', '-b', 'main']);
backlog('init', 'demo', '--defaults', '--integration-mode', 'none');
sh('sed', ['-i.bak', 's/^statuses: .*/statuses: ["To Do", "In Progress", "Blocked", "In Review", "Done"]/', 'backlog/config.yml']);
sh('git', ['commit', '-q', '--allow-empty', '-m', 'feat(TASK-1): merged one']);

const task = (...args: string[]) => backlog('task', 'create', ...args, '--plain');
task('merged and done', '-s', 'Done'); // TASK-1
task('done, never merged', '-s', 'Done'); // TASK-2
task('review, no summary', '-s', 'In Review', '-a', '@fredy'); // TASK-3
task('review, summary without how-to', '-s', 'In Review', '-a', '@fredy', '--final-summary', 'did it'); // TASK-4
task('review, good, wrong person', '-s', 'In Review', '-a', '@claude', '--final-summary', 'did it\n\nHow to review: run it'); // TASK-5
task('blocked, unassigned', '-s', 'Blocked'); // TASK-6
task('question, unassigned', '-l', 'question'); // TASK-7
task('ready to start'); // TASK-8

test('flags each broken rule, and only those', () => {
  const r = JSON.parse(truth(['--json', '--human', '@fredy']).out);
  const flagged = r.errors.map((e: { task: string; message: string }) => `${e.task}: ${e.message.split(',')[0]}`);
  assert.deepEqual(flagged.sort(), [
    'TASK-2: is Done',
    'TASK-3: is In Review without a final summary: add one with --final-summary',
    'TASK-4: is In Review',
    'TASK-5: is In Review',
    'TASK-6: is Blocked',
    'TASK-7: is labeled question',
  ]);
  assert.deepEqual(r.built, ['TASK-1']);
  assert.deepEqual(r.next, { id: 'TASK-8', title: 'ready to start' });
  assert.equal(r.waiting.length, 5);
});

test('flags missing statuses', () => {
  sh('cp', ['backlog/config.yml', 'backlog/config.full']);
  sh('sed', ['-i.bak', 's/^statuses: .*/statuses: ["To Do", "In Progress", "Done"]/', 'backlog/config.yml']);
  try {
    const r = JSON.parse(truth(['--json']).out);
    assert.match(r.errors[0].message, /no "Blocked", "In Review" status/);
  } finally {
    sh('mv', ['backlog/config.full', 'backlog/config.yml']);
  }
});

test('without --human, any assignee counts', () => {
  const r = JSON.parse(truth(['--json']).out);
  assert.ok(!r.errors.some((e: { task: string }) => e.task === 'TASK-5'));
});

test('board exits 1 on errors', () => {
  const r = truth(['--human', 'fredy']);
  assert.equal(r.code, 1);
  assert.match(r.out, /Truth rules: 6 errors/);
});

test('hook blocks once, then only warns', () => {
  const first = JSON.parse(truth(['--hook'], JSON.stringify({ cwd: dir, stop_hook_active: false })).out);
  assert.equal(first.decision, 'block');
  assert.match(first.reason, /TASK-2 is Done/);
  const second = JSON.parse(truth(['--hook'], JSON.stringify({ cwd: dir, stop_hook_active: true })).out);
  assert.equal(second.decision, undefined);
  assert.match(second.systemMessage, /TASK-2 is Done/);
});

test('hook is silent outside a Backlog.md project', () => {
  const empty = mkdtempSync(join(tmpdir(), 'truth-empty-'));
  try {
    assert.equal(truth(['--hook'], JSON.stringify({ cwd: empty })).out, '');
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

// --merge, in its own repo where main tracks the backlog files.
const mdir = mkdtempSync(join(tmpdir(), 'truth-merge-'));
after(() => rmSync(mdir, { recursive: true, force: true }));
const msh = (cmd: string, args: string[]): string => execFileSync(cmd, args, { cwd: mdir, env, encoding: 'utf8' });
const merge = (...args: string[]): { out: string; code: number } => {
  try {
    return { out: execFileSync('node', [TRUTH, '--merge', ...args], { cwd: mdir, env, encoding: 'utf8', stdio: 'pipe' }), code: 0 };
  } catch (e) {
    const err = e as { stdout: string; stderr: string; status: number };
    return { out: err.stdout + err.stderr, code: err.status };
  }
};

msh('git', ['init', '-q', '-b', 'main']);
msh('backlog', ['init', 'demo', '--defaults', '--integration-mode', 'none']);
msh('sed', ['-i.bak', 's/^statuses: .*/statuses: ["To Do", "In Progress", "Blocked", "In Review", "Done"]/', 'backlog/config.yml']);
msh('backlog', ['task', 'create', 'ready one', '--plain']); // TASK-1
msh('backlog', ['task', 'create', 'not ready', '--plain']); // TASK-2
msh('backlog', ['task', 'create', 'adds a test', '--plain']); // TASK-3
msh('backlog', ['task', 'create', 'test plus code', '--plain']); // TASK-4
msh('backlog', ['task', 'create', 'skips a test', '--plain']); // TASK-5
const write = (files: Record<string, string>): void => {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(mdir, file)), { recursive: true });
    writeFileSync(join(mdir, file), text);
  }
};
write({ '.honest-status/test-only': '# test files an approver agent may merge\ntest/**/*.test.ts\n' });
msh('git', ['add', '-A']);
msh('git', ['commit', '-q', '-m', 'init']);
const work = (id: string, status: string, files: Record<string, string> = { [`${id}.txt`]: id }): void => {
  msh('git', ['checkout', '-q', '-b', `task/${id}`, 'main']);
  write(files);
  msh('backlog', ['task', 'edit', id, '-s', status, '-a', '@fredy', '--final-summary', 'did it\n\nHow to review: cat the file', '--plain']);
  msh('git', ['add', '-A']);
  msh('git', ['commit', '-q', '-m', `wip(${id})`]);
  msh('git', ['checkout', '-q', 'main']);
};
work('TASK-1', 'In Review');
work('TASK-2', 'In Progress');
work('TASK-3', 'In Review', { 'test/a.test.ts': "test('a', () => {});\n" });
work('TASK-4', 'In Review', { 'test/b.test.ts': "test('b', () => {});\n", 'src.txt': 'code\n' });
work('TASK-5', 'In Review', { 'test/c.test.ts': "test.skip('c', () => {});\n" });
const mainHead = (): string => msh('git', ['rev-parse', 'main']).trim();

test('merge refuses a task that is not In Review, and leaves main alone', () => {
  const before = mainHead();
  const r = merge('TASK-2');
  assert.equal(r.code, 1);
  assert.match(r.out, /TASK-2 is In Progress; only In Review tasks can be merged/);
  assert.equal(mainHead(), before);
  assert.equal(msh('git', ['status', '--porcelain', '--untracked-files=no']), '');
});

test('merge refuses when the checks fail, and leaves main alone', () => {
  const before = mainHead();
  const r = merge('TASK-1', '--checks', 'exit 3');
  assert.equal(r.code, 1);
  assert.match(r.out, /the checks failed/);
  assert.equal(mainHead(), before);
  assert.equal(msh('git', ['status', '--porcelain', '--untracked-files=no']), '');
});

test('merge squashes with the task id and Approved-by: human, and sets Done', () => {
  const r = merge('task-1', '--checks', 'test -f TASK-1.txt');
  assert.equal(r.code, 0, r.out);
  assert.equal(msh('git', ['log', '-1', '--format=%s']).trim(), 'feat(TASK-1): ready one');
  assert.equal(msh('git', ['log', '-1', '--format=%(trailers:key=Approved-by,valueonly)']).trim(), 'human');
  assert.equal(msh('git', ['status', '--porcelain', '--untracked-files=no']), '');
  const board = JSON.parse(execFileSync('node', [TRUTH, '--json'], { cwd: mdir, encoding: 'utf8' }));
  assert.deepEqual(board.built, ['TASK-1']);
  assert.deepEqual(board.errors, []);
  assert.match(merge('TASK-1').out, /already has a commit with "\(TASK-1\)"/);
});

test('policy merge refuses anything but tests, and leaves main alone', () => {
  const before = mainHead();
  assert.match(merge('TASK-4', '--policy', 'test-only', '--checks', 'true').out, /src\.txt isn't a test file under the policy/);
  assert.match(merge('TASK-5', '--policy', 'test-only', '--checks', 'true').out, /adds a skip or only: test\.skip/);
  assert.match(merge('TASK-3', '--policy', 'test-only').out, /needs the checks to pass/);
  assert.match(merge('TASK-3', '--policy', 'tests').out, /Usage:/);
  assert.equal(mainHead(), before);
  assert.equal(msh('git', ['status', '--porcelain', '--untracked-files=no']), '');
});

test('policy merge of test-only changes says Approved-by: policy:test-only', () => {
  const r = merge('TASK-3', '--policy', 'test-only', '--checks', 'test -f test/a.test.ts');
  assert.equal(r.code, 0, r.out);
  assert.equal(msh('git', ['log', '-1', '--format=%(trailers:key=Approved-by,valueonly)']).trim(), 'policy:test-only');
  const board = JSON.parse(execFileSync('node', [TRUTH, '--json'], { cwd: mdir, encoding: 'utf8' }));
  assert.deepEqual(board.built, ['TASK-1', 'TASK-3']);
  assert.deepEqual(board.errors, []);
});

test('board re-verifies policy merges already on main', () => {
  write({ 'src.txt': 'forged\n' });
  msh('git', ['add', 'src.txt']);
  msh('git', ['commit', '-q', '-m', 'feat(TASK-9): forged', '--trailer', 'Approved-by: policy:test-only']);
  const board = JSON.parse(execFileSync('node', [TRUTH, '--json'], { cwd: mdir, encoding: 'utf8' }));
  assert.equal(board.errors.length, 1);
  assert.match(board.errors[0].message, /merged by the test-only policy .* src\.txt isn't a test file/);
});
