#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const marker = 'data-talon-analytics="plausible"';

if (!outDir || !scriptSrc) {
  console.error('Usage: inject-plausible.cjs <out-dir> <plausible-script-src>');
  process.exit(2);
}

const snippet = `  <!-- Privacy-friendly analytics by Plausible -->
  <script async src="${scriptSrc}" ${marker}></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init();

    document.addEventListener('click', function(event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link) return;

      var href = link.getAttribute('href') || '';
      var eventName = null;

      if (href.indexOf('/quickstart-demo/') !== -1) eventName = 'Quickstart Demo Click';
      else if (href.indexOf('/sample-auditor-pack/') !== -1 || href.indexOf('/ai-governance-evidence-store/') !== -1) eventName = 'Evidence Click';
      else if (href.indexOf('/resources/eu-ai-governance-runtime-checklist/') !== -1) eventName = 'Checklist Click';
      else if (href.indexOf('github.com/dativo-io/talon') !== -1) eventName = 'GitHub Click';
      else if (href.indexOf('/talon/docs/') !== -1 || href.indexOf('/docs/talon/') !== -1) eventName = 'Docs Click';

      if (eventName) window.plausible(eventName);
    });
  </script>
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

    fs.writeFileSync(fullPath, html.replace(/<\/head>/i, `${snippet}</head>`));
  }
}

walk(outDir);
