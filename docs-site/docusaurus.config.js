// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Open-source AI governance gateway for European SMBs.',

  url: 'https://dativo.io',
  baseUrl: '/talon/docs/',
  trailingSlash: true,

  organizationName: 'dativo-io',
  projectName: 'talon',

  // Imported GitHub docs may reference files that are not part of the public
  // Docusaurus subset yet. Do not fail production deploys on those links.
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: ({docPath}) => {
            const sourceMap = require('./src/source-map.cjs');
            const sourcePath = sourceMap[docPath];
            if (!sourcePath) return 'https://github.com/dativo-io/talon';
            return `https://github.com/dativo-io/talon/blob/main/${sourcePath}`;
          },
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.8,
          ignorePatterns: [],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'description',
          content:
            'Learn Dativo Talon, an open-source AI governance gateway for European SMBs. Govern LLM traffic, PII, tools, costs, EU routing, and signed audit evidence.',
        },
        {
          name: 'keywords',
          content:
            'AI governance, EU AI governance, LLM gateway, AI agent governance, GDPR AI, EU AI Act, PII redaction, AI audit evidence, AI cost control, MCP proxy, OpenAI gateway, European SMB compliance',
        },
        {property: 'og:type', content: 'website'},
        {property: 'og:site_name', content: 'Dativo Talon'},
        {
          property: 'og:title',
          content: 'Dativo Talon Docs — AI governance gateway for European SMBs',
        },
        {
          property: 'og:description',
          content:
            'Govern LLM and AI-agent traffic with PII controls, tool policy, cost caps, EU routing, and signed evidence exports.',
        },
        {name: 'twitter:card', content: 'summary_large_image'},
      ],
      navbar: {
        title: 'Dativo Talon Docs',
        items: [
          {to: '/', label: 'Overview', position: 'left'},
          {to: '/quickstart-demo/', label: 'Demo', position: 'left'},
          {to: '/choosing-integration-path/', label: 'Integrate', position: 'left'},
          {to: '/governance-control-matrix/', label: 'EU governance', position: 'left'},
          {to: '/sample-auditor-pack/', label: 'Evidence', position: 'left'},
          {href: 'https://dativo.io/', label: 'Website', position: 'right'},
          {href: 'https://github.com/dativo-io/talon', label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Evaluate',
            items: [
              {label: '60-second demo', to: '/quickstart-demo/'},
              {label: 'Choose integration path', to: '/choosing-integration-path/'},
              {label: 'Why not just a PII proxy?', to: '/why-not-a-pii-proxy/'},
              {label: 'Adoption scenarios', to: '/adoption-scenarios/'},
            ],
          },
          {
            title: 'Governance',
            items: [
              {label: 'Governance control matrix', to: '/governance-control-matrix/'},
              {label: 'Sample auditor pack', to: '/sample-auditor-pack/'},
              {label: 'Export evidence for auditors', to: '/compliance-export-runbook/'},
              {label: 'Evidence store', to: '/evidence-store/'},
            ],
          },
          {
            title: 'Operate',
            items: [
              {label: 'Gateway dashboard', to: '/gateway-dashboard/'},
              {label: 'Cost governance', to: '/cost-governance-by-caller/'},
              {label: 'Configuration', to: '/configuration/'},
              {label: 'Authentication and key scopes', to: '/authentication-and-key-scopes/'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'GitHub', href: 'https://github.com/dativo-io/talon'},
              {label: 'Website', href: 'https://dativo.io/'},
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Dativo. Talon is Apache-2.0 self-hostable software.`,
      },
      prism: {
        additionalLanguages: ['bash', 'yaml', 'json', 'go', 'python', 'javascript'],
      },
    }),
};

module.exports = config;
