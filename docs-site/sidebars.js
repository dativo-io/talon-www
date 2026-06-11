// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Start here',
      items: [
        'quickstart-demo',
        'evidence-integrity-demo',
        'quickstart',
        'first-governed-agent',
        'add-talon-to-existing-app',
      ],
    },
    {
      type: 'category',
      label: 'Auditor handoff',
      items: [
        'sample-auditor-pack',
        'compliance-export-runbook',
        'ropa-declarations',
        'evidence-integrity-spec',
        'governance-control-matrix',
      ],
    },
    {
      type: 'category',
      label: 'Use cases',
      items: [
        'slack-bot-integration',
        'openclaw-integration',
        'multi-tenant-msp',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'what-talon-does-to-your-request',
        'why-not-a-pii-proxy',
        'evidence-store',
        'agent-planning',
        'memory-governance',
        'adoption-scenarios',
        'persona-guides',
        'architecture-mcp-proxy',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'configuration',
        'authentication-and-key-scopes',
        'provider-registry',
        'gateway-dashboard',
        'governance-control-matrix',
        'evidence-integrity-spec',
        'threat-model',
        'conformance',
        'benchmarks',
        'observability',
        'policy-cookbook',
        'pii-semantic-enrichment',
        'release-notes',
      ],
    },
  ],
};

module.exports = sidebars;