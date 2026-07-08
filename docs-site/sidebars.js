const sidebars = {
  docsSidebar: [
    { type: 'doc', id: 'index', label: 'Overview' },
    {
      type: 'category',
      label: 'Evaluate Talon',
      collapsed: false,
      items: [
        'quickstart-demo',
        'manual-governed-session',
        'evidence-integrity-demo',
        'choosing-integration-path',
        'why-not-a-pii-proxy',
      ],
    },
    {
      type: 'category',
      label: 'Govern coding agents',
      collapsed: true,
      items: ['governing-coding-agents','coding-agents-demo','claude-code-integration','codex-cli-integration','openclaw-integration'],
    },
    {
      type: 'category',
      label: 'Integrate with apps and agents',
      collapsed: true,
      items: ['add-talon-to-existing-app','first-governed-agent','slack-bot-integration','copaw-integration','desktop-app-governance','multi-tenant-msp','vendor-integration-guide','architecture-mcp-proxy'],
    },
    {
      type: 'category',
      label: 'EU governance and evidence',
      collapsed: true,
      items: ['air-gapped-deployment','governance-control-matrix','turnkey-compliance-reports','policy-packs','sample-auditor-pack','verify-turnkey-compliance-reports','compliance-export-runbook','ropa-declarations','evidence-store','explanation-catalog','evidence-integrity-spec'],
    },
    {
      type: 'category',
      label: 'PII detection and scanner engines',
      collapsed: true,
      items: ['external-scanners','local-scanner-engines','presidio-compatibility-matrix','pii-semantic-enrichment'],
    },
    {
      type: 'category',
      label: 'Operate in production',
      collapsed: true,
      items: ['gateway-dashboard','operational-control-plane','observability','authentication-and-key-scopes','configuration','provider-registry','policy-cookbook','cost-governance-by-caller','agent-planning','plan-review-operators','plan-review-e2e-testcase','memory-governance','incident-response-playbook'],
    },
    {
      type: 'category',
      label: 'More guides and reference',
      collapsed: true,
      items: ['quickstart','proxy-quickstart','adoption-scenarios','persona-guides','threat-model','conformance','benchmarks','cicd-pipeline-governance','internal-support-agent','memory-verification','release-notes'],
    },
  ],
};

export default sidebars;