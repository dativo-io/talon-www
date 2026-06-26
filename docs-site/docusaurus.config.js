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
  onBrokenMarkdownLinks: 'warn',

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
        src: 'img/logo.svg',
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
          to: '/turnkey-compliance-reports/',
          label: 'Compliance',
          position: 'left',
        },
        {
          to: '/add-talon-to-existing-app/',
          label: 'Integrate',
          position: 'left',
        },
        {
          to: '/governance-control-matrix/',
          label: 'EU governance',
          position: 'left',
        },
        {
          to: '/sample-auditor-pack/',
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
            {label: 'Choose integration path', to: '/choosing-integration-path/'},
            {label: 'Why not just a PII proxy?', to: '/why-not-a-pii-proxy/'},
          ],
        },
        {
          title: 'Governance',
          items: [
            {label: 'Turnkey compliance reports', to: '/turnkey-compliance-reports/'},
            {label: 'EU policy packs', to: '/policy-packs/'},
            {label: 'Control matrix', to: '/governance-control-matrix/'},
            {label: 'Auditor pack', to: '/sample-auditor-pack/'},
            {label: 'Evidence integrity', to: '/evidence-integrity-spec/'},
          ],
        },
        {
          title: 'Operate',
          items: [
            {label: 'Configuration', to: '/configuration/'},
            {label: 'Provider registry', to: '/provider-registry/'},
            {label: 'Gateway dashboard', to: '/gateway-dashboard/'},
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
