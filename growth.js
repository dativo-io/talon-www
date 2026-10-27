(() => {
  const page = window.location.pathname;

  const normalizeHref = (href) => {
    try {
      const url = new URL(href, window.location.origin);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return href || '';
    }
  };

  const classifyIntent = (link) => {
    const href = link.getAttribute('href') || '';
    const normalized = normalizeHref(href).toLowerCase();
    const external = href.toLowerCase();

    if (link.dataset.growthIntent) return link.dataset.growthIntent;
    if (external.includes('github.com/dativo-io/talon/issues/new') && external.includes('pilot')) return 'pilot';
    if (normalized.includes('/quickstart-demo/')) return 'quickstart';
    if (normalized.includes('/product-demo/')) return 'product-demo';
    if (normalized.includes('/add-talon-to-existing-app/') || normalized.includes('/proxy-quickstart/')) return 'integration';
    if (normalized.includes('/ai-cost-control/') || normalized.includes('/cost-governance-by-agent/')) return 'cost';
    if (normalized.includes('/ai-action-control/') || normalized.includes('/action-gateway-proof/') || normalized.includes('/action-gateway/')) return 'action-control';
    if (
      normalized.includes('/coding-agent-governance/')
      || normalized.includes('/governing-coding-agents/')
      || normalized.includes('/codex-cli-integration/')
      || normalized.includes('/claude-code-integration/')
      || normalized.includes('/github-copilot-cli-governance/')
    ) return 'coding-agents';
    if (
      normalized.includes('/compliance-export-runbook/')
      || normalized.includes('/evidence-integrity-demo/')
      || normalized.includes('/sample-auditor-pack/')
      || normalized.includes('/evidence-store/')
      || normalized.includes('/ai-governance-evidence-store/')
    ) return 'evidence';
    if (external.includes('github.com/dativo-io/talon')) return 'github';
    if (normalized.includes('/talon/docs/') || normalized.includes('/docs/talon/')) return 'docs';
    return null;
  };

  const placementFor = (link) => {
    if (link.dataset.growthPlacement) return link.dataset.growthPlacement;
    if (link.closest('.growth-paths')) return 'homepage-paths';
    if (link.closest('.site-nav, .navbar')) return 'navigation';
    if (link.closest('.hero-actions, .hero')) return 'hero';
    if (link.closest('.cta-card, .cta-section')) return 'cta-section';
    if (link.closest('.footer, footer')) return 'footer';
    if (link.closest('article')) return 'docs-body';
    return 'body';
  };

  document.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    const intent = classifyIntent(link);
    if (!intent || !window.umami || typeof window.umami.track !== 'function') return;

    window.umami.track('Funnel CTA', {
      page,
      intent,
      placement: placementFor(link),
      href: (link.getAttribute('href') || '').slice(0, 240),
      text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
      primary: String(link.matches('.button.primary, .nav-button, [data-growth-primary="true"]')),
    });
  });

  if (page !== '/') return;
  if (document.querySelector('.growth-paths')) return;

  const anchor = document.querySelector('.strip') || document.querySelector('.hero');
  if (!anchor) return;

  const section = document.createElement('section');
  section.className = 'growth-paths';
  section.setAttribute('aria-labelledby', 'growth-paths-title');
  section.innerHTML = `
    <div class="wrap growth-paths-inner">
      <div class="growth-paths-heading">
        <p class="eyebrow">Choose the shortest path</p>
        <h2 id="growth-paths-title">Start with the action or incident you need to control.</h2>
        <p>Keep your agent and orchestrator. Route one supported action or provider path through Talon, test what gets blocked, and verify why. Expand only when that proof matters in production.</p>
      </div>
      <div class="growth-path-grid">
        <a class="growth-path-card" href="/ai-action-control/" data-growth-intent="action-control" data-growth-placement="homepage-paths">
          <span class="growth-path-kicker">Consequential actions</span>
          <strong>An agent can publish, refund or update data</strong>
          <span>Inspect the action boundary. Deny disallowed MCP calls today; test exact HTTP action authorization on Talon main, with clear limits for other execution paths.</span>
          <em>Action-control proof →</em>
        </a>
        <a class="growth-path-card" href="/talon/docs/add-talon-to-existing-app/" data-growth-intent="integration" data-growth-placement="homepage-paths">
          <span class="growth-path-kicker">Existing production app</span>
          <strong>OpenAI or Anthropic calls need shared limits</strong>
          <span>Keep your SDK and orchestration. Add an agent key, govern provider/model/data access, and preserve fallback, budget and session visibility.</span>
          <em>Integration guide →</em>
        </a>
        <a class="growth-path-card" href="/talon/docs/compliance-export-runbook/" data-growth-intent="evidence" data-growth-placement="homepage-paths">
          <span class="growth-path-kicker">Investigate and prove</span>
          <strong>Why was that agent action allowed or denied?</strong>
          <span>Trace decisions on paths Talon intercepted, inspect the reason and export independently verifiable evidence without promising visibility into bypassed actions.</span>
          <em>Evidence handoff →</em>
        </a>
      </div>
      <div class="growth-path-footer">
        <span>Best fit: teams operating real AI workflows with consequential actions, shared policy needs or audit questions.</span>
        <div class="growth-path-actions">
          <a class="button primary" href="/talon/docs/action-gateway-proof/" data-growth-intent="action-control" data-growth-placement="homepage-paths" data-growth-primary="true">Run the action-control proof</a>
          <a class="button secondary" href="/talon/docs/quickstart-demo/" data-growth-intent="quickstart" data-growth-placement="homepage-paths">60-second demo · no API key</a>
        </div>
      </div>
    </div>`;

  anchor.insertAdjacentElement('afterend', section);
})();
