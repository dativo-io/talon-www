#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const scriptSrc = process.argv[3];
const websiteId = process.argv[4];
const marker = 'data-talon-analytics="umami"';

if (!outDir || !scriptSrc || !websiteId) {
  console.error('Usage: inject-umami.cjs <out-dir> <umami-script-src> <website-id>');
  process.exit(2);
}

const snippet = `  <!-- Privacy-friendly analytics by Umami -->
  <script defer src="${scriptSrc}" data-website-id="${websiteId}" ${marker}></script>
  <script>
    document.addEventListener('click', function(event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link || !window.umami || typeof window.umami.track !== 'function') return;

      var href = link.getAttribute('href') || '';
      var eventName = null;

      if (href.indexOf('/product-demo/') !== -1) eventName = 'Product Demo Click';
      else if (href.indexOf('/quickstart-demo/') !== -1) eventName = 'Quickstart Demo Click';
      else if (href.indexOf('/sample-auditor-pack/') !== -1 || href.indexOf('/ai-governance-evidence-store/') !== -1) eventName = 'Evidence Click';
      else if (href.indexOf('/resources/eu-ai-governance-runtime-checklist/') !== -1) eventName = 'Checklist Click';
      else if (href.indexOf('github.com/dativo-io/talon') !== -1) eventName = 'GitHub Click';
      else if (href.indexOf('/talon/docs/') !== -1 || href.indexOf('/docs/talon/') !== -1) eventName = 'Docs Click';

      if (eventName) {
        window.umami.track(eventName, {
          href: href,
          page: window.location.pathname,
          text: (link.textContent || '').trim().slice(0, 120)
        });
      }
    });

    document.addEventListener('click', function(event) {
      var button = event.target && event.target.closest ? event.target.closest('[data-demo-src] button') : null;
      if (!button || !window.umami || typeof window.umami.track !== 'function') return;
      window.umami.track('Demo Play', { page: window.location.pathname });
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
