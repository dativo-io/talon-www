const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Turn company AI policy into enforceable, use-case-specific controls.',
  favicon: 'img/favicon.svg',

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
          'Dativo Talon is the open-source control layer for company AI use cases: turn company policy into use-case-specific effective rules, enforce them at supported model, data and action boundaries, and keep verifiable evidence.',
      },
      {
        name: 'keywords',
        content:
          'AI policy enforcement, AI control plane, company AI policy, AI use case governance, AI action authorization, MCP governance, GitHub Copilot governance, coding assistant governance, LLM cost control, self-hosted AI gateway, EU AI routing, signed audit evidence, Dativo Talon',
      },
    ],
    navbar: {
      title: 'Dativo Talon Docs',
      logo: {
        alt: 'Dativo Talon',
        src: 'img/talon-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          to: '/product-demo/',
          label: 'Product demo',
          position: 'left',
        },
        {
          to: '/policy-cookbook/',
          label: 'Policy',
          position: 'left',
        },
        {
          href: '/ai-action-control/',
          label: 'Actions',
          position: 'left',
        },
        {
          to: '/configuration/#provider-fallback-chains-error-driven-failover',
          label: 'Reliability',
          position: 'left',
        },
        {
          to: '/governing-coding-agents/',
          label: 'Sessions',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Use cases',
          position: 'left',
          items: [
            {
              to: '/github-copilot-cli-governance/',
              label: 'GitHub Copilot governance',
            },
          ],
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
          title: 'Get started',
          items: [
            {label: 'Product demo — three use cases', to: '/product-demo/'},
            {label: 'GitHub Copilot governance', to: '/github-copilot-cli-governance/'},
            {label: '60-second no-key demo', to: '/quickstart-demo/'},
            {label: 'Add Talon to an existing app', to: '/add-talon-to-existing-app/'},
            {label: 'Choose an integration path', to: '/choosing-integration-path/'},
          ],
        },
        {
          title: 'Apply policy',
          items: [
            {label: 'What the control layer does', to: '/control-plane/'},
            {label: 'Reproduce a governed session', to: '/manual-governed-session/'},
            {label: 'Gateway dashboard', to: '/gateway-dashboard/'},
          ],
        },
        {
          title: 'Control',
          items: [
            {label: 'Company policy', to: '/policy-cookbook/'},
            {label: 'Action control', href: '/ai-action-control/'},
            {label: 'Cost and budgets', to: '/cost-governance-by-agent/'},
            {label: 'Policy-preserving fallback', to: '/configuration/#provider-fallback-chains-error-driven-failover'},
            {label: 'Request lifecycle', to: '/what-talon-does-to-your-request/'},
          ],
        },
        {
          title: 'Understand',
          items: [
            {label: 'Coding-agent sessions', to: '/governing-coding-agents/'},
            {label: 'Incident response', to: '/incident-response-playbook/'},
            {label: 'Observability', to: '/observability/'},
          ],
        },
        {
          title: 'Trust and evidence',
          items: [
            {label: 'Evidence store', to: '/evidence-store/'},
            {label: 'Verify evidence integrity', to: '/evidence-integrity-demo/'},
            {label: 'EU and privacy controls', to: '/governance-control-matrix/'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/dativo-io/talon'},
            {label: 'Website', href: '/'},
            {label: 'Pilot one AI use case', href: 'https://github.com/dativo-io/talon/issues/new?title=Pilot%3A%20%3Cyour%20AI%20use%20case%3E&body=Current%20stack%3A%0AFirst%20company%20rule%20or%20action%20boundary%20I%20need%20to%20enforce%3A'},
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
