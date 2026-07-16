#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const [talonRootArg, outDirArg] = process.argv.slice(2);

if (!talonRootArg || !outDirArg) {
  console.error('usage: node scripts/publish-talon-hero.cjs <talon-root> <site-output-dir>');
  process.exit(2);
}

const talonRoot = path.resolve(talonRootArg);
const outDir = path.resolve(outDirArg);
const sourceAsset = path.join(talonRoot, 'docs', 'assets', 'talon_hero.gif');
const outputIndex = path.join(outDir, 'index.html');
const outputAssets = path.join(outDir, 'public', 'assets');

async function assertReadable(filePath, label) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size === 0) throw new Error('empty or not a file');
  } catch (error) {
    throw new Error(`${label} is unavailable at ${filePath}: ${error.message}`);
  }
}

async function main() {
  await assertReadable(sourceAsset, 'Talon hero asset');
  await assertReadable(outputIndex, 'built homepage');

  const talonCommit = execFileSync(
    'git',
    ['-C', talonRoot, 'rev-parse', '--short=12', 'HEAD'],
    {encoding: 'utf8'},
  ).trim();

  if (!/^[0-9a-f]{7,12}$/i.test(talonCommit)) {
    throw new Error(`could not derive a safe Talon commit fingerprint: ${talonCommit}`);
  }

  const assetName = `talon_hero-${talonCommit}.gif`;
  const publishedAsset = path.join(outputAssets, assetName);
  const publicAssetUrl = `/public/assets/${assetName}`;

  await fs.mkdir(outputAssets, {recursive: true});
  await fs.copyFile(sourceAsset, publishedAsset);
  await assertReadable(publishedAsset, 'published Talon hero asset');

  const html = await fs.readFile(outputIndex, 'utf8');
  const sourcePattern = /data-demo-src="[^"]*talon_hero\.gif(?:\?[^"]*)?"/g;
  const matches = html.match(sourcePattern) ?? [];

  if (matches.length !== 1) {
    throw new Error(`expected exactly one Talon hero data-demo-src in ${outputIndex}, found ${matches.length}`);
  }

  const rewritten = html.replace(sourcePattern, `data-demo-src="${publicAssetUrl}"`);
  if (rewritten.includes('data-demo-src="https://raw.githubusercontent.com/dativo-io/talon/')) {
    throw new Error('homepage still hotlinks the Talon hero after publication');
  }

  await fs.writeFile(outputIndex, rewritten, 'utf8');
  console.log(`Published Talon hero from ${talonCommit} as ${publicAssetUrl}`);
}

main().catch((error) => {
  console.error(`Failed to publish Talon hero: ${error.message}`);
  process.exit(1);
});
