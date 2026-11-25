const publication = require('../scripts/docs-publication.json');
const {themes} = require('prism-react-renderer');
const codeTheme = {...themes.vsDark, plain:{...themes.vsDark.plain,backgroundColor:'#101f40',color:'#f4f7fd'}};
const config = {
  title: 'Dativo Talon Docs',
  tagline: 'One company policy for your AI use cases.',
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
    announcementBar: {
      id: 'stable-release-' + publication.release.tag,
      content: 'Documentation for Talon ' + publication.release.tag + ' · <a href="/talon/docs/publication.json">Publication details</a>',
      isCloseable: false,
      backgroundColor: '#e4ebf8',
      textColor: '#081e58',
    },
    metadata: [
      {
        name: 'description',
        content:
          'Talon is an open-source, self-hosted AI control plane. Control model access, data and tool permissions, enforce budgets, handle provider failures, and investigate decisions with signed evidence — on the paths you route through Talon.',
      },
      {
        name: 'keywords',
        content:
          'AI policy enforcement, AI control plane, company AI policy, AI use case governance, AI action authorization, MCP governance, GitHub Copilot governance, coding assistant governance, LLM cost control, self-hosted AI gateway, EU AI routing, signed audit evidence, Dativo Talon',
      },
    ],
    colorMode: {defaultMode:'light', respectPrefersColorScheme:true, disableSwitch:false},
    navbar: {
      title: 'Dativo Talon Docs',
      logo: {
        alt: 'Dativo Talon',
        src: 'img/talon-mark.svg',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Get started'},
        {to: '/quickstart-demo/', label: 'Try Talon', position: 'left'},
        {to: '/add-talon-to-existing-app/', label: 'Connect an app', position: 'left'},
        {href: '/', label: 'Website', position: 'right'},
        {href: 'https://dativo.io/pilot/', label: 'Discuss a pilot', position: 'right', className:'qc-pilot-link'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Get started', items: [
          {label: 'Try without an API key', to: '/quickstart-demo/'},
          {label: 'Connect an existing app', to: '/add-talon-to-existing-app/'},
          {label: 'Test an exact action', to: '/action-gateway-proof/'},
        ]},
        {title: 'Learn and operate', items: [
          {label: 'Use-case playbooks', to: '/use-case-playbooks/'},
          {label: 'Policy cookbook', to: '/policy-cookbook/'},
          {label: 'Operations Console', to: '/operations-console/'},
          {label: 'Production pilot', to: '/production-pilot/'},
        ]},
        {title: 'Dativo', items: [
          {label: 'Website', href: '/'},
          {label: 'Source code', href: 'https://github.com/dativo-io/talon'},
          {label: 'Discuss a pilot', href: 'https://dativo.io/pilot/'},
        ]},
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Dativo. Built with Docusaurus.`,
    },
    prism: {
      theme: codeTheme,
      darkTheme: codeTheme,
      additionalLanguages: ['bash', 'go', 'json', 'yaml'],
    },
  },
};

module.exports = config;
