const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Control cost, reliability, policy, and sessions across company AI use cases.',
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
          'Dativo Talon is the open-source control plane for company AI use cases: control LLM spend, reliability, shared policy, sessions, intercepted actions, EU routing, and signed evidence.',
      },
      {
        name: 'keywords',
        content:
          'AI control plane, AI agent operations, LLM cost control, AI budget enforcement, LLM retries, provider fallback, AI session debugging, AI agent session visibility, AI tool call governance, self-hosted AI gateway, EU AI routing, signed audit evidence, Dativo Talon',
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
          to: '/product-demo/',
          label: 'Product demo',
          position: 'left',
        },
        {
          to: '/cost-governance-by-agent/',
          label: 'Cost',
          position: 'left',
        },
        {
          to: '/configuration/#provider-fallback-chains-error-driven-failover',
          label: 'Reliability',
          position: 'left',
        },
        {
          to: '/policy-cookbook/',
          label: 'Policy',
          position: 'left',
        },
        {
          to: '/governing-coding-agents/',
          label: 'Sessions',
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
          title: 'Get started',
          items: [
            {label: 'Product demo — three use cases', to: '/product-demo/'},
            {label: '60-second no-key demo', to: '/quickstart-demo/'},
            {label: 'Add Talon to an existing app', to: '/add-talon-to-existing-app/'},
            {label: 'Choose an integration path', to: '/choosing-integration-path/'},
          ],
        },
        {
          title: 'Operate',
          items: [
            {label: 'What the control plane does', to: '/control-plane/'},
            {label: 'Reproduce a governed session', to: '/manual-governed-session/'},
            {label: 'Gateway dashboard', to: '/gateway-dashboard/'},
          ],
        },
        {
          title: 'Control',
          items: [
            {label: 'Cost and budgets', to: '/cost-governance-by-agent/'},
            {label: 'Retries and fallback', to: '/configuration/#provider-fallback-chains-error-driven-failover'},
            {label: 'Shared policy', to: '/policy-cookbook/'},
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
            {label: 'Pilot one AI use case', href: 'https://github.com/dativo-io/talon/issues/new?title=Pilot%3A%20%3Cyour%20AI%20use%20case%3E&body=Current%20stack%3A%0AFirst%20control%20I%20need%20%28cost%20%2F%20reliability%20%2F%20policy%20%2F%20sessions%29%3A'},
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