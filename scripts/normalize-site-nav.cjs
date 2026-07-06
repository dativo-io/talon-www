const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');

const canonicalHeader = `<header class="site-nav">
    <div class="wrap nav-inner">
      <a class="brand" href="/" aria-label="Dativo Talon home">
        <img class="brand-logo" src="/public/assets/talon-logo.png" alt="Dativo Talon logo" />
        <span>Dativo Talon</span>
      </a>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="/coding-agent-governance/">Coding agents</a>
        <a href="/ai-governance-eu/">EU governance</a>
        <a href="/ai-sovereignty-posture-report/">Sovereignty</a>
        <a href="/ai-governance-evidence-store/">Evidence</a>
        <a href="/talon/docs/">Docs</a>
        <a href="/comparisons/">Compare</a>
        <a href="https://blog.dativo.io">Blog</a>
        <a class="nav-button" href="https://github.com/dativo-io/talon">GitHub</a>
      </nav>
    </div>
  </header>`;

const headerPattern = /<header class="site-nav">[\s\S]*?<\/header>/;
const expectedLabels = [
  'Coding agents',
  'EU governance',
  'Sovereignty',
  'Evidence',
  'Docs',
  'Compare',
  'Blog',
  'GitHub',
];

function listHtmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Docusaurus owns its own application navigation.
      if (path.relative(root, full).split(path.sep).join('/') === 'talon/docs') continue;
      files.push(...listHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

if (!fs.existsSync(root)) {
  throw new Error(`Output directory does not exist: ${root}`);
}

let normalized = 0;
const pagesWithSiteNav = [];

for (const file of listHtmlFiles(root)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!headerPattern.test(html)) continue;

  pagesWithSiteNav.push(file);
  const updated = html.replace(headerPattern, canonicalHeader);
  fs.writeFileSync(file, updated, 'utf8');
  normalized += 1;
}

if (normalized === 0) {
  throw new Error('No marketing pages with .site-nav were found to normalize.');
}

for (const file of pagesWithSiteNav) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(headerPattern);
  if (!match) throw new Error(`Navigation disappeared from ${file}`);

  const header = match[0];
  let previousIndex = -1;
  for (const label of expectedLabels) {
    const currentIndex = header.indexOf(`>${label}<`);
    if (currentIndex === -1) {
      throw new Error(`Canonical nav label '${label}' missing from ${file}`);
    }
    if (currentIndex <= previousIndex) {
      throw new Error(`Canonical nav order is wrong in ${file}`);
    }
    previousIndex = currentIndex;
  }
}

console.log(`Normalized canonical site navigation on ${normalized} marketing page(s).`);
