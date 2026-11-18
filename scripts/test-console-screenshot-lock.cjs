'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {gitBlobId, check, refresh} = require('./console-screenshot-lock.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'console-image-lock-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const dir = path.join(root, 'docs/assets/console');
  fs.mkdirSync(dir, {recursive: true});
  const put = (name, content) => {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  };
  put('overview.webp', 'original screenshot bytes');
  put('showcase.webp', 'original collage bytes');
  put('README.md', 'notes');
  const lock = path.join(root, 'lock.json');
  refresh(root, lock);
  return {root, dir, put, lock};
}

test('content hash agrees with Git blob object ID', () => {
  const bytes = Buffer.from([0, 10, 255, 42]);
  const expected = execFileSync('git', ['hash-object', '--stdin'],
    {input: bytes, encoding: 'utf8'}).trim();
  assert.equal(gitBlobId(bytes), expected);
});

test('unchanged images pass; metadata-only edits pass', t => {
  const f = fixture(t);
  f.put('README.md', 'new notes');
  f.put('baseline.json', '{"schema":2}');
  assert.deepEqual(check(f.root, f.lock), {added: [], removed: [], changed: []});
});

test('new, removed, renamed and changed images are reported, including nested images', t => {
  const f = fixture(t);
  f.put('overview.webp', 'changed screenshot bytes');
  fs.renameSync(path.join(f.dir, 'showcase.webp'), path.join(f.dir, 'renamed.webp'));
  f.put('new/detail.png', 'new image bytes');
  assert.deepEqual(check(f.root, f.lock), {
    added: ['new/detail.png', 'renamed.webp'],
    removed: ['showcase.webp'],
    changed: ['overview.webp'],
  });
  refresh(f.root, f.lock);
  assert.deepEqual(check(f.root, f.lock), {added: [], removed: [], changed: []});
});

test('missing or empty screenshot directory fails closed', t => {
  const f = fixture(t);
  fs.rmSync(f.dir, {recursive: true});
  assert.throws(() => check(f.root, f.lock));
  fs.mkdirSync(f.dir);
  assert.throws(() => check(f.root, f.lock), /No screenshots/);
});

test('invalid lock fails closed', t => {
  const f = fixture(t);
  fs.writeFileSync(f.lock, '{"schema":1,"algorithm":"git-blob-sha1","images":{"overview.webp":"bad"}}');
  assert.throws(() => check(f.root, f.lock), /Invalid console screenshot lock/);
});

test('empty image fails and a check never changes the lock', t => {
  const f = fixture(t);
  const before = fs.readFileSync(f.lock, 'utf8');
  f.put('showcase.webp', '');
  assert.throws(() => check(f.root, f.lock), /Empty canonical screenshot/);
  assert.equal(fs.readFileSync(f.lock, 'utf8'), before);
});
