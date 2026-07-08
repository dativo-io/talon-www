const fs = require('node:fs');
const path = require('node:path');

const docsDir = path.resolve(__dirname, '..', 'docs');

const fixes = [
  {
    file: 'proxy-quickstart.md',
    from: './proxy-quickstart.md#scope',
    to: '#behavior-notes',
  },
  {
    file: 'release-notes.md',
    from: '/talon/docs/configuration/#gateway-egress-rules-destination--classification-allowdeny',
    to: '/talon/docs/configuration/',
  },
];

for (const fix of fixes) {
  const filePath = path.join(docsDir, fix.file);
  const source = fs.readFileSync(filePath, 'utf8');

  if (!source.includes(fix.from)) {
    console.log(`stale generated link already absent in ${fix.file}`);
    continue;
  }

  fs.writeFileSync(filePath, source.replaceAll(fix.from, fix.to));
  console.log(`fixed stale generated link in ${fix.file}`);
}
