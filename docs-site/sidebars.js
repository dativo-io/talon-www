const doc = (id, label) => ({type: 'doc', id, label});

const sidebars = {
  docsSidebar: [
    {type: 'doc', id: 'index', label: 'Overview'},
    {
      type: 'category',
      label: 'Start here',
      collapsed: false,
      items: [
        doc('product-demo', 'Product demo — three use cases'),
        'quickstart-demo',
        'add-talon-to-existing-app',
        'first-governed-agent',
        'choosing-integration-path',
        'manual-governed-session',
      ],
    },
    {
      type: 'category',
      label: 'Use cases',
      collapsed: false,
      items: [
        doc('github-copilot-cli-governance', 'GitHub Copilot governance'),
      ],
    },
    {
      type: 'category',
      label: 'Operate AI use cases',
      collapsed: false,
      items: [
        doc('control-plane', 'What the Talon control plane does'),
        'gateway-dashboard',
        'operational-control-plane',
        'observability',
      ],
    },
    {
      type: 'category',
      label: 'Control cost',
      collapsed: false,
      items: [
        doc('cost-governance-by-agent', 'Budgets and hard limits'),
        doc('internal-support-agent', 'Cost controls in a support use case'),
      ],
    },
    {
      type: 'category',
      label: 'Reliability',
      collapsed: false,
      items: [
        doc('configuration', 'Retries, fallback, and timeouts'),
        'incident-response-playbook',
      ],
    },
    {
      type: 'category',
      label: 'Shared policy and intercepted actions',
      collapsed: false,
      items: [
        'what-talon-does-to-your-request',
        'policy-cookbook',
        'why-not-a-pii-proxy',
        doc('architecture-mcp-proxy', 'MCP proxy architecture'),
        'external-scanners',
        'local-scanner-engines',
      ],
    },
    {
      type: 'category',
      label: 'Understand sessions',
      collapsed: false,
      items: [
        'governing-coding-agents',
        'coding-agents-demo',
        'claude-code-integration',
        'codex-cli-integration',
      ],
    },
    {
      type: 'category',
      label: 'Integrate',
      collapsed: true,
      items: [
        'slack-bot-integration',
        'openclaw-integration',
        'openclaw-docker-primer',
        'copaw-integration',
        'copaw-docker-primer',
        'desktop-app-governance',
        'multi-tenant-msp',
        doc('vendor-integration-guide', 'Govern third-party AI vendors'),
        'cicd-pipeline-governance',
        'proxy-quickstart',
      ],
    },
    {
      type: 'category',
      label: 'Evidence and trust',
      collapsed: true,
      items: [
        'evidence-store',
        'evidence-integrity-demo',
        'evidence-integrity-spec',
        'sample-auditor-pack',
        'explanation-catalog',
        'conformance',
      ],
    },
    {
      type: 'category',
      label: 'EU, privacy, and compliance support',
      collapsed: true,
      items: [
        'air-gapped-deployment',
        'governance-control-matrix',
        'policy-packs',
        'turnkey-compliance-reports',
        'verify-turnkey-compliance-reports',
        'compliance-export-runbook',
        'ropa-declarations',
        'presidio-compatibility-matrix',
        'pii-semantic-enrichment',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'quickstart',
        'authentication-and-key-scopes',
        'provider-registry',
        'threat-model',
        'benchmarks',
        'release-notes',
      ],
    },
    {
      type: 'category',
      label: 'Advanced and optional',
      collapsed: true,
      items: [
        'agent-planning',
        'plan-review-operators',
        'plan-review-e2e-testcase',
        'memory-governance',
        'memory-verification',
        doc('persona-guides', 'Guides by role'),
      ],
    },
  ],
};

export default sidebars;
