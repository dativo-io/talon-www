import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sourceMap from '../src/source-map.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const docsDir = path.join(siteRoot, 'docs');
const talonRoot = process.env.TALON_REPO_PATH
  ? path.resolve(process.env.TALON_REPO_PATH)
  : path.resolve(siteRoot, '..', '..', 'talon');
const rawBase = 'https://raw.githubusercontent.com/dativo-io/talon/main';
const githubBase = 'https://github.com/dativo-io/talon/blob/main';

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

function normalizeLinks(markdown) {
  return markdown
    // Cross-repo docs links from examples/ and root-level docs.
    .replace(/\.\.\/\.\.\/docs\/reference\//g, './')
    .replace(/\.\.\/\.\.\/docs\/guides\//g, './')
    .replace(/\.\.\/\.\.\/docs\/explanation\//g, './')
    .replace(/\.\.\/\.\.\/docs\/tutorials\//g, './')
    .replace(/\.\.\/\.\.\/docs\/VENDOR_INTEGRATION_GUIDE\.md/g, './vendor-integration-guide.md')
    .replace(/\.\.\/\.\.\/docs\/ADOPTION_SCENARIOS\.md/g, './adoption-scenarios.md')
    .replace(/\.\.\/\.\.\/docs\/ARCHITECTURE_MCP_PROXY\.md/g, './architecture-mcp-proxy.md')
    .replace(/\.\.\/\.\.\/examples\/auditor-pack\/README\.md/g, './sample-auditor-pack.md')
    .replace(/\.\.\/\.\.\/examples\/auditor-pack\//g, `${githubBase}/examples/auditor-pack/`)
    .replace(/\.\.\/\.\.\/examples\/gateway\/talon\.config\.gateway\.yaml/g, `${githubBase}/examples/gateway/talon.config.gateway.yaml`)
    .replace(/\.\.\/\.\.\/examples\/policies\/README\.md/g, `${githubBase}/examples/policies/README.md`)
    .replace(/\.\.\/\.\.\/LIMITATIONS\.md/g, `${githubBase}/LIMITATIONS.md`)
    .replace(/\.\.\/\.\.\/ROADMAP\.md/g, `${githubBase}/ROADMAP.md`)
    .replace(/\.\.\/\.\.\/scripts\//g, `${githubBase}/scripts/`)
    // Neighboring docs directories.
    .replace(/\.\.\/reference\//g, './')
    .replace(/\.\.\/guides\//g, './')
    .replace(/\.\.\/explanation\//g, './')
    .replace(/\.\.\/tutorials\//g, './')
    .replace(/guides\//g, './')
    .replace(/reference\//g, './')
    .replace(/explanation\//g, './')
    .replace(/tutorials\//g, './')
    // Root-level docs copied into flat Docusaurus docs IDs.
    .replace(/\.\.\/QUICKSTART\.md/g, './quickstart.md')
    .replace(/\.\.\/MEMORY_GOVERNANCE\.md/g, './memory-governance.md')
    .replace(/\.\.\/AGENT_PLANNING\.md/g, './agent-planning.md')
    .replace(/\.\.\/ARCHITECTURE_MCP_PROXY\.md/g, './architecture-mcp-proxy.md')
    .replace(/\.\.\/ADOPTION_SCENARIOS\.md/g, './adoption-scenarios.md')
    .replace(/\.\.\/PERSONA_GUIDES\.md/g, './persona-guides.md')
    .replace(/\.\.\/VENDOR_INTEGRATION_GUIDE\.md/g, './vendor-integration-guide.md')
    .replace(/QUICKSTART\.md/g, './quickstart.md')
    .replace(/MEMORY_GOVERNANCE\.md/g, './memory-governance.md')
    .replace(/AGENT_PLANNING\.md/g, './agent-planning.md')
    .replace(/ARCHITECTURE_MCP_PROXY\.md/g, './architecture-mcp-proxy.md')
    .replace(/ADOPTION_SCENARIOS\.md/g, './adoption-scenarios.md')
    .replace(/PERSONA_GUIDES\.md/g, './persona-guides.md')
    .replace(/VENDOR_INTEGRATION_GUIDE\.md/g, './vendor-integration-guide.md')
    // Example files that should stay on GitHub rather than becoming broken local docs links.
    .replace(/\(manifest\.json\)/g, `(${githubBase}/examples/auditor-pack/manifest.json)`)
    .replace(/\(evidence\.signed\.json\)/g, `(${githubBase}/examples/auditor-pack/evidence.signed.json)`)
    .replace(/\(compliance-report\.html\)/g, `(${githubBase}/examples/auditor-pack/compliance-report.html)`)
    .replace(/\(compliance-report\.json\)/g, `(${githubBase}/examples/auditor-pack/compliance-report.json)`)
    .replace(/\(ropa\.html\)/g, `(${githubBase}/examples/auditor-pack/ropa.html)`)
    .replace(/\(ropa\.json\)/g, `(${githubBase}/examples/auditor-pack/ropa.json)`)
    .replace(/\(annex-iv\.html\)/g, `(${githubBase}/examples/auditor-pack/annex-iv.html)`)
    .replace(/\(annex-iv\.json\)/g, `(${githubBase}/examples/auditor-pack/annex-iv.json)`);
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
  const normalized = addFrontMatter(escapeMdxJsxOutsideCode(normalizeLinks(source)), docPath);
  await fs.writeFile(path.join(docsDir, docPath), normalized, 'utf8');
  console.log(`synced ${sourcePath} -> docs/${docPath}`);
}
