import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sourceMap from '../src/source-map.cjs';
import publication from '../../scripts/docs-publication.cjs';
import escaping from './escape-mdx-prose.cjs';
const {escapeMdxJsxOutsideCode}=escaping;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const docsDir = path.join(siteRoot, 'docs');
if (!process.env.TALON_REPO_PATH) throw Error('Use scripts/build-site-with-docs.sh or set TALON_REPO_PATH to a clean approved release checkout');
const talonRoot = path.resolve(process.env.TALON_REPO_PATH);
publication.checkCheckout(talonRoot);
const talonRef = publication.manifest.release.commit;
const githubBlobBase = `https://github.com/dativo-io/talon/blob/${talonRef}`;
const githubTreeBase = `https://github.com/dativo-io/talon/tree/${talonRef}`;

const sourceToPublicDoc = new Map(
  Object.entries(sourceMap).map(([docPath, sourcePath]) => [
    path.posix.normalize(sourcePath),
    docPath,
  ]),
);

// A few source files contain legacy relative paths that are meaningful in the
// Talon repository but do not resolve from the file's current directory.
const sourceAliases = new Map([
  ['docs/proxy-quickstart.md', 'docs/tutorials/proxy-quickstart.md'],
  ['docs/guides/proxy-quickstart.md', 'docs/tutorials/proxy-quickstart.md'],
  ['docs/reference/proxy-quickstart.md', 'docs/tutorials/proxy-quickstart.md'],
  ['docs/copaw-integration.md', 'docs/guides/copaw-integration.md'],
  [
    'docs/copaw-talon-primer/docker-copaw-talon-primer.md',
    'docs/guides/copaw-talon-primer/docker-copaw-talon-primer.md',
  ],
]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSource(sourcePath) {
  const source=await fs.readFile(path.join(talonRoot,sourcePath),'utf8');
  const erratum=publication.manifest.errata.find(e=>e.path===sourcePath);
  return erratum?publication.applyErratum(source,erratum):source;
}

function titleFromMarkdown(markdown, fallback) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim().replace(/`/g, '');
  return fallback
    .replace(/\.md$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hasFrontMatter(markdown) {
  return markdown.startsWith('---\n');
}

function splitTarget(target) {
  const hashIndex = target.indexOf('#');
  if (hashIndex === -1) return {linkPath: target, suffix: ''};
  return {
    linkPath: target.slice(0, hashIndex),
    suffix: target.slice(hashIndex),
  };
}

function shouldSkipLink(target) {
  return (
    target.startsWith('#')
    || target.startsWith('/')
    || target.startsWith('http://')
    || target.startsWith('https://')
    || target.startsWith('mailto:')
    || target.startsWith('tel:')
    || target.startsWith('data:')
  );
}

async function resolveRelativeTarget(target, sourcePath) {
  if (shouldSkipLink(target)) return target;

  const {linkPath, suffix} = splitTarget(target);
  if (!linkPath) return target;

  let resolvedSourcePath = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), linkPath),
  );
  resolvedSourcePath = sourceAliases.get(resolvedSourcePath) ?? resolvedSourcePath;

  const publicDoc = sourceToPublicDoc.get(resolvedSourcePath);
  if (publicDoc) {
    return `./${publicDoc}${suffix}`;
  }

  const localPath = path.join(talonRoot, ...resolvedSourcePath.split('/'));
  if (await exists(localPath)) {
    const stat = await fs.stat(localPath);
    const githubBase = stat.isDirectory() ? githubTreeBase : githubBlobBase;
    return `${githubBase}/${resolvedSourcePath}${suffix}`;
  }

  return target;
}

async function rewriteRelativeMarkdownLinks(markdown, sourcePath) {
  const pattern = /(?<!!)\]\(([^)\n]+)\)/g;
  let result = '';
  let lastIndex = 0;

  for (const match of markdown.matchAll(pattern)) {
    const rawInner = match[1].trim();
    const targetWithOptionalTitle = rawInner.match(/^(\S+)(\s+["'][\s\S]*["'])?$/);
    if (!targetWithOptionalTitle) continue;

    const target = targetWithOptionalTitle[1];
    const titleSuffix = targetWithOptionalTitle[2] ?? '';
    const rewrittenTarget = await resolveRelativeTarget(target, sourcePath);

    result += markdown.slice(lastIndex, match.index);
    result += `](${rewrittenTarget}${titleSuffix})`;
    lastIndex = match.index + match[0].length;
  }

  result += markdown.slice(lastIndex);
  return result;
}

// Generate all documentation image copies from the selected Talon source.
// The website repository does not keep its own binary baselines.
async function readConsoleImage(filename) {
  const assetPath = 'docs/assets/console/' + filename;
  const localPath = path.join(talonRoot, assetPath);
  const bytes = await fs.readFile(localPath);
  if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'RIFF' ||
      bytes.toString('ascii', 8, 12) !== 'WEBP' || bytes.readUInt32LE(4) + 8 !== bytes.length) {
    throw new Error('Invalid WebP console screenshot: ' + assetPath);
  }
  return bytes;
}

async function publishConsoleImage(filename, destination) {
  const bytes = await readConsoleImage(filename);
  await fs.mkdir(path.dirname(destination), {recursive: true});
  await fs.writeFile(destination, bytes);
}

async function syncConsoleImages(markdown, sourcePath) {
  if (sourcePath !== 'docs/guides/operations-console.md') return markdown;

  const pattern = /(!\[[^\]\n]*\]\()\.\.\/assets\/console\/([a-z0-9-]+\.webp)(\))/g;
  const outputDir = path.join(siteRoot, 'static', 'img', 'console');
  // The locally owned docs landing page uses this same canonical collage.
  await publishConsoleImage('showcase.webp', path.join(siteRoot, 'static', 'img', 'console-showcase.webp'));
  let result = '';
  let lastIndex = 0;

  for (const match of markdown.matchAll(pattern)) {
    const filename = match[2];
    await publishConsoleImage(filename, path.join(outputDir, filename));
    result += markdown.slice(lastIndex, match.index) + match[1] + '/img/console/' + filename + match[3];
    lastIndex = match.index + match[0].length;
  }
  result += markdown.slice(lastIndex);

  return result.replace(
    /\]\(\.\.\/assets\/console\/([a-z0-9-]+\.webp|README\.md)\)/g,
    (_, filename) => '](' + githubBlobBase + '/docs/assets/console/' + filename + ')',
  );
}

async function normalizeLinks(markdown, sourcePath) {
  let normalized = (await syncConsoleImages(markdown, sourcePath))
    // Historical internal-only document removed from the public Talon tree.
    .replace(
      /\[comment-playbook\]\(docs\/community\/comment-playbook\.md\)/g,
      '`comment-playbook`',
    )
    // This historical CHANGELOG anchor predates the current configuration heading.
    .replace(
      /\/talon\/docs\/configuration\/#gateway-egress-rules-destination--classification-allowdeny/g,
      '/talon/docs/configuration/',
    )
    // The incident playbook meant the dedicated operational-control page, not a local anchor.
    .replace(/\(#operational-control-plane\)/g, '(./operational-control-plane.md)')
    // Auditor-pack generated files should stay on GitHub rather than becoming docs routes.
    .replace(/\(manifest\.json\)/g, `(${githubBlobBase}/examples/auditor-pack/manifest.json)`)
    .replace(/\(evidence\.signed\.json\)/g, `(${githubBlobBase}/examples/auditor-pack/evidence.signed.json)`)
    .replace(/\(compliance-report\.html\)/g, `(${githubBlobBase}/examples/auditor-pack/compliance-report.html)`)
    .replace(/\(compliance-report\.json\)/g, `(${githubBlobBase}/examples/auditor-pack/compliance-report.json)`)
    .replace(/\(ropa\.html\)/g, `(${githubBlobBase}/examples/auditor-pack/ropa.html)`)
    .replace(/\(ropa\.json\)/g, `(${githubBlobBase}/examples/auditor-pack/ropa.json)`)
    .replace(/\(annex-iv\.html\)/g, `(${githubBlobBase}/examples/auditor-pack/annex-iv.html)`)
    .replace(/\(annex-iv\.json\)/g, `(${githubBlobBase}/examples/auditor-pack/annex-iv.json)`);

  normalized = await rewriteRelativeMarkdownLinks(normalized, sourcePath);
  return normalized;
}

function addFrontMatter(markdown, docPath) {
  if (hasFrontMatter(markdown)) return markdown;
  const title = titleFromMarkdown(markdown, docPath);
  const slug = docPath.replace(/\.md$/, '');
  return `---\ntitle: ${JSON.stringify(title)}\nslug: /${slug}/\n---\n\n${markdown}`;
}

await fs.mkdir(docsDir, {recursive: true});
// Retired generated document: do not retain the removed dashboard on incremental local builds.
await fs.rm(path.join(docsDir, 'gateway-dashboard.md'), {force: true});

for (const [docPath, sourcePath] of Object.entries(sourceMap)) {
  const source = await readSource(sourcePath);
  const normalizedLinks = await normalizeLinks(source, sourcePath);
  const normalized = addFrontMatter(
    escapeMdxJsxOutsideCode(normalizedLinks),
    docPath,
  );
  await fs.writeFile(path.join(docsDir, docPath), normalized, 'utf8');
  console.log(`synced ${sourcePath} -> docs/${docPath}`);
}