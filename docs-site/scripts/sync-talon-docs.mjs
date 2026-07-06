import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sourceMap from '../src/source-map.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const docsDir = path.join(siteRoot, 'docs');
const explicitTalonRepoPath = process.env.TALON_REPO_PATH
  ? path.resolve(process.env.TALON_REPO_PATH)
  : null;
const talonRoot = explicitTalonRepoPath
  ?? path.resolve(siteRoot, '..', '..', 'talon');
const rawBase = 'https://raw.githubusercontent.com/dativo-io/talon/main';
const githubBlobBase = 'https://github.com/dativo-io/talon/blob/main';
const githubTreeBase = 'https://github.com/dativo-io/talon/tree/main';

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
  const localPath = path.join(talonRoot, sourcePath);
  if (await exists(localPath)) {
    return fs.readFile(localPath, 'utf8');
  }

  if (explicitTalonRepoPath) {
    throw new Error(`Mapped Talon source not found in local checkout: ${sourcePath} (${localPath})`);
  }

  const url = `${rawBase}/${sourcePath}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
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

async function normalizeLinks(markdown, sourcePath) {
  let normalized = markdown
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

function escapeMdxJsxOutsideCode(markdown) {
  const lines = markdown.split('\n');
  let inFence = false;

  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;

      // MDX treats any raw '<' as possible JSX, including prose like '<15ms'
      // and placeholders like '<tenant_key>'. Imported GitHub markdown should
      // render these literally, so escape bare '<' outside fenced code blocks.
      return line.replace(/</g, '&lt;');
    })
    .join('\n');
}

function addFrontMatter(markdown, docPath) {
  if (hasFrontMatter(markdown)) return markdown;
  const title = titleFromMarkdown(markdown, docPath);
  const slug = docPath.replace(/\.md$/, '');
  return `---\ntitle: ${JSON.stringify(title)}\nslug: /${slug}/\n---\n\n${markdown}`;
}

await fs.mkdir(docsDir, {recursive: true});

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