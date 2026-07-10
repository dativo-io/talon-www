import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sourceMap from '../src/source-map.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const docsDir = path.join(siteRoot, 'docs');
const sourcesOnly = process.argv.includes('--sources-only');

const explicitTalonRepoPath = process.env.TALON_REPO_PATH
  ? path.resolve(process.env.TALON_REPO_PATH)
  : null;
const siblingTalonRepoPath = path.resolve(siteRoot, '..', '..', 'talon');
const talonRoot = explicitTalonRepoPath ?? siblingTalonRepoPath;

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function docIdFromPath(docPath) {
  return docPath.replace(/\.md$/, '');
}

const errors = [];
const mappedEntries = Object.entries(sourceMap);
const duplicateSources = new Map();

for (const [docPath, sourcePath] of mappedEntries) {
  const outputs = duplicateSources.get(sourcePath) ?? [];
  outputs.push(docPath);
  duplicateSources.set(sourcePath, outputs);
}

for (const [sourcePath, outputs] of duplicateSources) {
  if (outputs.length > 1) {
    errors.push(`source ${sourcePath} is mapped to multiple public docs: ${outputs.join(', ')}`);
  }
}

if (await exists(talonRoot)) {
  const missingSources = [];
  for (const [, sourcePath] of mappedEntries) {
    const sourceFile = path.join(talonRoot, ...sourcePath.split('/'));
    if (!(await exists(sourceFile))) missingSources.push(sourcePath);
  }

  if (missingSources.length > 0) {
    errors.push(
      `mapped Talon sources missing from ${talonRoot}:\n    ${missingSources.join('\n    ')}`,
    );
  }
} else if (sourcesOnly) {
  errors.push(
    `cannot validate mapped Talon sources because no checkout exists at ${talonRoot}; set TALON_REPO_PATH`,
  );
} else {
  console.log(`No local Talon checkout at ${talonRoot}; upstream source existence check skipped.`);
}

if (!sourcesOnly) {
  const knownDocIds = new Set(['index']);
  for (const [docPath] of mappedEntries) knownDocIds.add(docIdFromPath(docPath));

  if (await exists(docsDir)) {
    for (const entry of await fs.readdir(docsDir, {withFileTypes: true})) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        knownDocIds.add(docIdFromPath(entry.name));
      }
    }
  }

  const sidebarsSource = await fs.readFile(path.join(siteRoot, 'sidebars.js'), 'utf8');
  const sidebarDocIds = new Set();
  const reservedTokens = new Set(['doc', 'category']);
  const quotedDocToken = /['"]([a-z0-9][a-z0-9-]*)['"]/g;

  for (const match of sidebarsSource.matchAll(quotedDocToken)) {
    const token = match[1];
    if (!reservedTokens.has(token)) sidebarDocIds.add(token);
  }

  const unresolvedSidebarIds = [...sidebarDocIds]
    .filter((docId) => !knownDocIds.has(docId))
    .sort();
  if (unresolvedSidebarIds.length > 0) {
    errors.push(`sidebar doc IDs do not resolve: ${unresolvedSidebarIds.join(', ')}`);
  }

  const missingSyncedOutputs = [];
  for (const [docPath] of mappedEntries) {
    if (!(await exists(path.join(docsDir, docPath)))) missingSyncedOutputs.push(docPath);
  }
  if (missingSyncedOutputs.length > 0) {
    errors.push(`synced docs missing after sync: ${missingSyncedOutputs.join(', ')}`);
  }

  const requiredFirstClassDocs = [
    'control-plane',
    'cost-governance-by-caller',
    'configuration',
    'policy-cookbook',
    'governing-coding-agents',
  ];
  const absentFirstClassDocs = requiredFirstClassDocs.filter(
    (docId) => !sidebarDocIds.has(docId),
  );
  if (absentFirstClassDocs.length > 0) {
    errors.push(
      `control-plane IA lost required first-class docs: ${absentFirstClassDocs.join(', ')}`,
    );
  }
}

if (errors.length > 0) {
  console.error('Docs publication contract validation failed:');
  for (const error of errors) console.error(`\n- ${error}`);
  process.exit(1);
}

if (sourcesOnly) {
  console.log(`Validated ${mappedEntries.length} mapped Talon source files before docs build.`);
} else {
  console.log(`Validated docs publication contract for ${mappedEntries.length} synced docs.`);
}
