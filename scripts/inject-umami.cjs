#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const websiteId = process.argv[4];
const domains = process.argv[5] || '';
const marker = 'data-talon-analytics="umami"';

if (!outDir || !scriptSrc || !websiteId) {
  console.error('Usage: inject-umami.cjs <out-dir> <umami-script-src> <website-id> [domains]');
  process.exit(2);
}

const domainsAttribute = domains ? ` data-domains="${domains}"` : '';
const snippet = `  <!-- Site analytics; one shared growth.js event listener -->
  <script defer src="${scriptSrc}" data-website-id="${websiteId}"${domainsAttribute} data-exclude-search="true" data-exclude-hash="true" data-do-not-track="true" ${marker}></script>
`;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const html = fs.readFileSync(fullPath, 'utf8');
    if (html.includes(marker)) continue;
    if (!/<\/head>/i.test(html)) continue;

    if (html.includes(`data-website-id="${websiteId}"`) || html.includes(`src="${scriptSrc}"`)) {
      console.error(`Refusing to inject a duplicate or unmanaged Umami tracker into ${path.relative(outDir, fullPath)}`);
      process.exit(1);
    }

    fs.writeFileSync(fullPath, html.replace(/<\/head>/i, `${snippet}</head>`));
  }
}

walk(outDir);
