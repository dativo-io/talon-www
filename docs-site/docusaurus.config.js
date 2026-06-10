// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dativo Talon Docs',
  tagline: 'Govern AI traffic before it leaves. Prove what happened with signed evidence.',
  favicon: 'img/favicon.ico',

  url: 'https://dativo.io',
  baseUrl: '/talon/docs/',
  trailingSlash: true,

  organizationName: 'dativo-io',
  projectName: 'talon',

  onBrokenLinks: 'throw',
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
          priority: 0.7,
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
            'Dativo Talon documentation for LLM gateway governance, PII controls, tool policy, cost caps, EU data sovereignty, and signed evidence exports.',
        },
      ],
      image: 'img/og-image.png',
      navbar: {
        title: 'Dativo Talon Docs',
        logo: {
          alt: 'Dativo Talon logo',
          src: 'img/talon-logo.png',
        },
        items: [
          {to: '/', label: 'Docs', position: 'left'},
          {to: '/quickstart/', label: 'Quickstart', position: 'left'},
          {to: '/evidence-store/', label: 'Evidence', position: 'left'},
          {href: 'https://dativo.io/', label: 'Website', position: 'right'},
          {href: 'https://github.com/dativo-io/talon', label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Start',
            items: [
              {label: '60-second demo', to: '/quickstart-demo/'},
              {label: 'First governed agent', to: '/first-governed-agent/'},
              {label: 'Add Talon to an app', to: '/add-talon-to-existing-app/'},
            ],
          },
          {
            title: 'Understand',
            items: [
              {label: 'What Talon does to a request', to: '/what-talon-does-to-your-request/'},
              {label: 'Evidence store', to: '/evidence-store/'},
              {label: 'Why not just a PII proxy?', to: '/why-not-a-pii-proxy/'},
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
