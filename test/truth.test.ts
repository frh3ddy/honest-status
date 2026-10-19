// Runs bin/truth.ts against a throwaway git repo with a real Backlog.md project.
// Needs the backlog CLI on PATH. Run: node --test test/truth.test.ts

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
