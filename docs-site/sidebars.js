// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Evaluate Talon',
      collapsed: false,
      items: [
        'quickstart-demo',
        'quickstart',
        'choosing-integration-path',
        'adoption-scenarios',
        'persona-guides',
        'why-not-a-pii-proxy',
      ],
    },
    {
      type: 'category',
      label: 'Integrate with apps and agents',
      collapsed: false,
      items: [
        'add-talon-to-existing-app',
        'first-governed-agent',
        'slack-bot-integration',
        'openclaw-integration',
        'desktop-app-governance',
        'multi-tenant-msp',
        'vendor-integration-guide',
        'architecture-mcp-proxy',
      ],
    },
    {
      type: 'category',
      label: 'EU governance and auditor evidence',
      collapsed: false,
      items: [
        'governance-control-matrix',
        'sample-auditor-pack',
        'compliance-export-runbook',
        'ropa-declarations',
        'evidence-store',
        'evidence-integrity-demo',
        'evidence-integrity-spec',
      ],
    },
    {
      type: 'category',
      label: 'Operate in production',
      collapsed: false,
      items: [
        'gateway-dashboard',
        'observability',
        'authentication-and-key-scopes',
        'configuration',
        'provider-registry',
        'policy-cookbook',
        'cost-governance-by-caller',
        'agent-planning',
        'memory-governance',
        'pii-semantic-enrichment',
        'incident-response-playbook',
      ],
    },
    {
      type: 'category',
      label: 'Compliance and technical reference',
      items: [
        'threat-model',
        'conformance',
        'benchmarks',
        'cicd-pipeline-governance',
        'internal-support-agent',
        'memory-verification',
        'release-notes',
      ],
    },
  ],
};

module.exports = sidebars;
