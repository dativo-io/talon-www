const sidebars = {
  docsSidebar: [
    { type: 'doc', id: 'index', label: 'Overview' },
    {
      type: 'category',
      label: 'Evaluate Talon',
      collapsed: false,
      items: ['quickstart-demo','turnkey-compliance-reports','quickstart','choosing-integration-path','adoption-scenarios','persona-guides','why-not-a-pii-proxy'],
    },
    {
      type: 'category',
      label: 'Govern coding agents',
      collapsed: false,
      items: ['governing-coding-agents','coding-agents-demo','claude-code-integration','codex-cli-integration','openclaw-integration'],
    },
    {
      type: 'category',
      label: 'Integrate with apps and agents',
      collapsed: false,
      items: ['add-talon-to-existing-app','first-governed-agent','slack-bot-integration','desktop-app-governance','multi-tenant-msp','vendor-integration-guide','architecture-mcp-proxy'],
    },
    {
      type: 'category',
      label: 'EU governance and auditor evidence',
      collapsed: false,
      items: ['air-gapped-deployment','governance-control-matrix','turnkey-compliance-reports','policy-packs','sample-auditor-pack','verify-turnkey-compliance-reports','compliance-export-runbook','ropa-declarations','evidence-store','evidence-integrity-demo','evidence-integrity-spec'],
    },
    {
      type: 'category',
      label: 'PII detection and scanner engines',
      collapsed: false,
      items: ['external-scanners','local-scanner-engines','presidio-compatibility-matrix','pii-semantic-enrichment'],
    },
    {
      type: 'category',
      label: 'Operate in production',
      collapsed: false,
      items: ['gateway-dashboard','operational-control-plane','observability','authentication-and-key-scopes','configuration','provider-registry','policy-cookbook','cost-governance-by-caller','agent-planning','plan-review-operators','plan-review-e2e-testcase','memory-governance','incident-response-playbook'],
    },
    {
      type: 'category',
      label: 'Compliance and technical reference',
      collapsed: false,
      items: ['threat-model','conformance','benchmarks','cicd-pipeline-governance','internal-support-agent','memory-verification','release-notes'],
    },
  ],
};

export default sidebars;