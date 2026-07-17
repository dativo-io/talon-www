const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');

const canonicalHeader = `<header class="site-nav">
    <div class="wrap nav-inner">
      <a class="brand" href="/" aria-label="Dativo Talon home">
        <img class="brand-logo" src="/public/assets/talon-mark-white.svg" alt="Dativo Talon mark" />
        <span>Dativo Talon</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links" id="primary-navigation" aria-label="Primary navigation">
        <a href="/">Operate</a>
        <a href="/ai-cost-control/">Cost</a>
        <a href="/#reliability">Reliability</a>
        <a href="/llm-governance-gateway/">Policy</a>
        <a href="/coding-agent-governance/">Sessions</a>
        <a href="/talon/docs/">Docs</a>
        <a href="/comparisons/">Compare</a>
        <a class="nav-button" href="https://github.com/dativo-io/talon">GitHub</a>
      </nav>
    </div>
  </header>`;

const headerPattern = /<header class="site-nav">[\s\S]*?<\/header>/;
const iconPattern = /\s*<link\s+rel="icon"[^>]*>\s*/gi;
const faviconTag = '<link rel="icon" type="image/svg+xml" href="/public/assets/talon-icon.svg" />';
const navStylesheet = '<link rel="stylesheet" href="/site-nav.css" />';
const navScript = '<script defer src="/site-nav.js"></script>';
const expectedLabels = [
  'Operate',
  'Cost',
  'Reliability',
  'Policy',
  'Sessions',
  'Docs',
  'Compare',
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

function ensureHeadAsset(html, marker, tag) {
  if (html.includes(marker)) return html;
  if (!html.includes('</head>')) throw new Error('Marketing page is missing </head>');
  return html.replace('</head>', `  ${tag}\n</head>`);
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
  let updated = html.replace(headerPattern, canonicalHeader);
  updated = updated.replace(iconPattern, '\n');
  updated = ensureHeadAsset(updated, 'href="/public/assets/talon-icon.svg"', faviconTag);
  updated = ensureHeadAsset(updated, 'href="/site-nav.css"', navStylesheet);
  updated = ensureHeadAsset(updated, 'src="/site-nav.js"', navScript);
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

  if (!header.includes('class="nav-toggle"') || !header.includes('id="primary-navigation"')) {
    throw new Error(`Responsive navigation controls missing from ${file}`);
  }
  if (!header.includes('/public/assets/talon-mark-white.svg')) {
    throw new Error(`Canonical Talon mark missing from ${file}`);
  }
  if (!html.includes('href="/public/assets/talon-icon.svg"')) {
    throw new Error(`Canonical Talon favicon missing from ${file}`);
  }
  if (!html.includes('href="/site-nav.css"') || !html.includes('src="/site-nav.js"')) {
    throw new Error(`Responsive navigation assets missing from ${file}`);
  }
}

console.log(`Normalized canonical site navigation on ${normalized} marketing page(s).`);
