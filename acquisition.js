(() => {
  if (window.location.pathname !== '/') return;

  const heroActions = document.querySelector('.hero-copy .hero-actions');
  if (heroActions) {
    heroActions.innerHTML = '<a class="button primary" href="/pilot/">Pilot one AI use case</a><a class="button secondary" href="/talon/docs/product-demo/">Run the product demo</a><a class="hero-github-link" href="https://github.com/dativo-io/talon">View GitHub →</a>';
  }

  const operate = document.querySelector('#operate');
  if (!operate || document.querySelector('#fit')) return;

  const section = document.createElement('section');
  section.className = 'section qualification-section';
  section.id = 'fit';
  section.innerHTML = `
    <div class="wrap">
      <div class="section-heading wide-heading">
        <p class="eyebrow">Is Talon for your team?</p>
        <h2>Use Talon when one AI use case has become an operating responsibility.</h2>
        <p>The strongest starting point is a real support bot, coding workflow, internal copilot or product feature with a failure your team can reproduce and judge.</p>
      </div>
      <div class="fit-grid">
        <article class="fit-card fit-card-positive">
          <span class="fit-label">Good fit now</span>
          <h3>You already operate an AI use case.</h3>
          <ul>
            <li>Provider spend or budgets need an enforceable boundary.</li>
            <li>Retries and fallback must remain inside policy.</li>
            <li>PII, tools, models or destinations need shared controls.</li>
            <li>Operators need to explain one complete session after an incident.</li>
          </ul>
          <a class="button primary" href="/pilot/">Pilot one real use case</a>
        </article>
        <article class="fit-card">
          <span class="fit-label">Probably too early</span>
          <h3>You are still exploring whether to build an AI feature.</h3>
          <ul>
            <li>No production or internal use case exists yet.</li>
            <li>The immediate need is agent orchestration or prompt design.</li>
            <li>Traffic can bypass the gateway and still needs to be controlled.</li>
            <li>The requirement is a compliance certificate rather than runtime proof.</li>
          </ul>
          <a href="/talon/docs/product-demo/">Run the product demo first →</a>
        </article>
      </div>
    </div>`;

  operate.insertAdjacentElement('beforebegin', section);
})();
