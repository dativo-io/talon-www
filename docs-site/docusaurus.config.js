const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Connect one AI use case, enforce shared policy and verify decisions.',
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
            if (!sourcePath) return `https://github.com/dativo-io/talon-www/edit/main/docs-site/docs/${docPath}`;
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
        {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Docs'},
        {to: '/use-case-playbooks/', label: 'Use cases', position: 'left'},
        {to: '/quickstart-demo/', label: 'Get started', position: 'left'},
        {to: '/evaluation-checklist/', label: 'Evaluate', position: 'left'},
        {href: '/', label: 'Website', position: 'right'},
        {href: 'https://github.com/dativo-io/talon', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Start', items: [
          {label: 'Quickstart', to: '/quickstart-demo/'},
          {label: 'Use-case playbooks', to: '/use-case-playbooks/'},
          {label: 'Product demo', to: '/product-demo/'},
          {label: 'Evaluation checklist', to: '/evaluation-checklist/'},
        ]},
        {title: 'Build and operate', items: [
          {label: 'Integration paths', to: '/choosing-integration-path/'},
          {label: 'Policy cookbook', to: '/policy-cookbook/'},
          {label: 'MCP governance', to: '/mcp-governance-extension/'},
          {label: 'Signed evidence', to: '/evidence-store/'},
        ]},
        {title: 'Dativo', items: [
          {label: 'Website', href: '/'},
          {label: 'Open source', href: 'https://github.com/dativo-io/talon'},
          {label: 'Discuss a pilot', href: 'https://www.linkedin.com/in/sergeyenin/'},
        ]},
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dativo. Built with Docusaurus.`,
    },
    prism: {
      additionalLanguages: ['bash', 'go', 'json', 'yaml'],
    },
  },
};

module.exports = config;
