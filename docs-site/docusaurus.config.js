const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Open-source AI governance gateway for European SMBs.',
  favicon: 'img/favicon.ico',

  url: 'https://dativo.io',
  baseUrl: '/talon/docs/',
  trailingSlash: true,
  organizationName: 'dativo-io',
  projectName: 'talon',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: ({docPath}) => {
            const sourceMap = require('./src/source-map.cjs');
            const sourcePath = sourceMap[docPath];
            if (!sourcePath) return 'https://github.com/dativo-io/talon';
            return `https://github.com/dativo-io/talon/edit/main/${sourcePath}`;
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/talon-social-card.png',
    metadata: [
      {
        name: 'description',
        content:
          'Dativo Talon documentation for European SMBs: govern LLM traffic, AI agents, PII, tools, costs, EU routing, and signed audit evidence.',
      },
      {
        name: 'keywords',
        content:
          'AI governance, EU AI governance, LLM gateway, AI agent governance, GDPR AI, EU data sovereignty, audit evidence, Dativo Talon, European SMB AI',
      },
    ],
    navbar: {
      title: 'Dativo Talon Docs',
      logo: {
        alt: 'Dativo Talon',
        src: 'https:' + '//dativo.io/public/assets/talon-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          to: '/quickstart-demo/',
          label: 'Demo',
          position: 'left',
        },
        {
          to: '/governing-coding-agents/',
          label: 'Coding agents',
          position: 'left',
        },
        {
          to: '/choosing-integration-path/',
          label: 'Integrate',
          position: 'left',
        },
        {
          to: '/governance-control-matrix/',
          label: 'EU governance',
          position: 'left',
        },
        {
          to: '/evidence-store/',
          label: 'Evidence',
          position: 'left',
        },
        {
          href: '/',
          label: 'Website',
          position: 'right',
        },
        {
          href: 'https://github.com/dativo-io/talon',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Evaluate',
          items: [
            {label: '60-second demo', to: '/quickstart-demo/'},
            {label: 'Reproduce the governed session', to: '/manual-governed-session/'},
            {label: 'Attack evidence integrity', to: '/evidence-integrity-demo/'},
            {label: 'Choose integration path', to: '/choosing-integration-path/'},
          ],
        },
        {
          title: 'Governance',
          items: [
            {label: 'EU control matrix', to: '/governance-control-matrix/'},
            {label: 'Turnkey compliance reports', to: '/turnkey-compliance-reports/'},
            {label: 'Auditor pack', to: '/sample-auditor-pack/'},
            {label: 'Evidence integrity', to: '/evidence-integrity-spec/'},
          ],
        },
        {
          title: 'Adopt',
          items: [
            {label: 'Add Talon to an existing app', to: '/add-talon-to-existing-app/'},
            {label: 'Govern coding agents', to: '/governing-coding-agents/'},
            {label: 'Pilot one workload', href: 'https://github.com/dativo-io/talon/issues/new?title=Pilot%3A%20%3Cyour%20stack%3E&body=Current%20stack%3A%0AFirst%20control%20I%20need%20%28PII%20%2F%20spend%20%2F%20tools%20%2F%20data%20residency%29%3A'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/dativo-io/talon'},
            {label: 'Website', href: '/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dativo. Built with Docusaurus.`,
    },
    prism: {
      additionalLanguages: ['bash', 'go', 'json', 'yaml'],
    },
  },
};

module.exports = config;