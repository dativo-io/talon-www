#!/usr/bin/env node
'use strict';

// The website explicitly adopts an approved set of Talon screenshots. Compare
// actual bytes, not Talon's baseline metadata, timestamps or overall revision.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const sourceDir = 'docs/assets/console';
const defaultLock = path.join(root, 'console-screenshots.lock.json');
const imagePattern = /\.(webp|png|jpe?g|avif|gif|svg)$/i;

function gitBlobId(bytes) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0'))
    .update(bytes)
    .digest('hex');
}

function inventory(talonRoot) {
  const directory = path.join(talonRoot, sourceDir);
  const entries = [];
  function walk(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const name = prefix + entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error('Unexpected symlink in canonical screenshot directory: ' + name);
      }
      if (entry.isDirectory()) walk(full, name + '/');
      else if (entry.isFile() && imagePattern.test(name)) {
        const bytes = fs.readFileSync(full);
        if (!bytes.length) throw new Error('Empty canonical screenshot: ' + name);
        entries.push([name, gitBlobId(bytes)]);
      }
    }
  }
  walk(directory);
  if (!entries.length) throw new Error('No screenshots in ' + directory);
  entries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return Object.fromEntries(entries);
}

function validateLock(lock) {
  if (!lock || lock.schema !== 1 || lock.algorithm !== 'git-blob-sha1' ||
      !lock.images || Array.isArray(lock.images) || typeof lock.images !== 'object' ||
      !Object.keys(lock.images).length ||
      Object.entries(lock.images).some(([name, hash]) =>
        !imagePattern.test(name) || !/^[0-9a-f]{40}$/.test(hash))) {
    throw new Error('Invalid console screenshot lock');
  }
  return lock.images;
}

function diff(approved, current) {
  const keys = (obj) => Object.keys(obj);
  const has = (obj, key) => Object.hasOwn(obj, key);
  return {
    added: keys(current).filter(name => !has(approved, name)).sort(),
    removed: keys(approved).filter(name => !has(current, name)).sort(),
    changed: keys(current).filter(name => has(approved, name) &&
      current[name] !== approved[name]).sort(),
  };
}

function check(talonRoot, lockPath = defaultLock) {
  const approved = validateLock(JSON.parse(fs.readFileSync(lockPath, 'utf8')));
  return diff(approved, inventory(talonRoot));
}

function refresh(talonRoot, lockPath = defaultLock) {
  const images = inventory(talonRoot);
  fs.writeFileSync(lockPath, JSON.stringify({
    schema: 1, algorithm: 'git-blob-sha1', images,
  }, null, 2) + '\n');
  return Object.keys(images).length;
}

function main() {
  const [command, talonRoot] = process.argv.slice(2);
  if (!['check', 'refresh'].includes(command) || !talonRoot ||
      process.argv.length !== 4) {
    console.error('Usage: node scripts/console-screenshot-lock.cjs <check|refresh> <talon-checkout>');
    return 2;
  }
  try {
    if (command === 'refresh') {
      console.log('Recorded ' + refresh(talonRoot) + ' canonical screenshots.');
      console.log('Review the image changes and commit console-screenshots.lock.json in your website PR.');
      return 0;
    }
    const changes = check(talonRoot);
    if (Object.values(changes).some(names => names.length)) {
      console.error('Talon screenshot set differs from the reviewed website lock:');
      for (const [kind, names] of Object.entries(changes)) {
        for (const name of names) console.error('  ' + kind + ': ' + name);
      }
      console.error('Review the images from the selected release, then run:');
      console.error('  node scripts/console-screenshot-lock.cjs refresh <talon-checkout>');
      console.error('Commit console-screenshots.lock.json and adjust website references if needed.');
      return 1;
    }
    console.log('Console screenshots match the reviewed website lock.');
    return 0;
  } catch (error) {
    console.error('Console screenshot lock: ' + error.message);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();
module.exports = {gitBlobId, inventory, diff, check, refresh};
