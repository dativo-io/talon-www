(() => {
  // One shared listener on marketing and Docusaurus pages; no inline duplicate.
  if (window.__talonGrowthLoaded) return;
  window.__talonGrowthLoaded = true;
  const eventVersion = '2';
  const page = () => window.location.pathname;
  const optedOut = () => window.navigator?.doNotTrack === '1' || window.doNotTrack === '1';
  const track = (name,props) => {
    if (!optedOut() && window.umami && typeof window.umami.track === 'function')
      window.umami.track(name,{...props,event_version:eventVersion});
  };
  const allowed = new Set(['pilot-booking','pilot-offer','github','quickstart','product-demo','evidence','checklist','docs','integration','integration-n8n','n8n-guide','n8n-examples','case-support','case-procurement','case-people','case-coding','case-hub','cost','governance','enterprise','product-overview','console-docs','console-screenshot','connect-app','action-control','seo-mcp','seo-audit','seo-comparison','coding-agents','founder-profile','pilot-contact','docs-markdown']);
  const intentFor = (link,url) => {
    const explicit=link.dataset?.growthIntent;
    if (allowed.has(explicit)) return explicit;
    const p=url.pathname.toLowerCase();
    if(url.hostname==='calendar.app.google') return 'pilot-booking';
    if(url.hostname==='github.com' && /^\/dativo-io\/talon(?:\/|$)/.test(p)) return 'github';
    if(url.origin!==window.location.origin) return null;
    if(p==='/pilot/'||p==='/pilot') return 'pilot-offer';
    if(p==='/solutions/n8n/') return 'integration-n8n';
    if(p.includes('/n8n-refund-approvals/')) return 'n8n-guide';
    if(p.includes('/quickstart-demo/')) return 'quickstart';
    if(p.includes('/product-demo/')) return 'product-demo';
    if(p.includes('/sample-auditor-pack/')||p.includes('/evidence-store/')||p.includes('/ai-governance-evidence-store/')||p.includes('/evidence-integrity-demo/')||p.includes('/compliance-export-runbook/')) return 'evidence';
    if(p.includes('/eu-ai-governance-runtime-checklist/')) return 'checklist';
    if(p==='/public/assets/console-showcase.webp') return 'console-screenshot';
    if(p.includes('/add-talon-to-existing-app/')||p.includes('/choosing-integration-path/')||p.includes('/proxy-quickstart/')) return 'integration';
    if(p.includes('/use-cases/customer-support/')) return 'case-support';
    if(p.includes('/use-cases/vendor-contract-review/')) return 'case-procurement';
    if(p.includes('/use-cases/people-analytics/')) return 'case-people';
    if(p.includes('/use-cases/coding-agents/')) return 'case-coding';
    if(p.includes('/use-cases/')) return 'case-hub';
    if(p.includes('/ai-action-control/')||p.includes('/action-gateway-proof/')||p.includes('/action-gateway/')) return 'action-control';
    if(p.includes('/ai-cost-control/')||p.includes('/cost-governance-by-agent/')) return 'cost';
    if(p.includes('/talon/docs/')||p.includes('/docs/talon/')) return 'docs';
    return null;
  };
  const placementFor = link => {
    const value=link.dataset?.growthPlacement;
    if(value && /^[a-z0-9-]{1,40}$/.test(value)) return value;
    if(link.closest('.site-nav, .navbar')) return 'navigation';
    if(link.closest('.case-hero, .hero-actions, .hero')) return 'hero';
    if(link.closest('.case-cta, .cta-card, .cta-section')) return 'cta-section';
    if(link.closest('footer')) return 'footer';
    if(link.closest('article')) return 'docs-body';
    return 'body';
  };
  const names = {'pilot-booking':'Pilot Booking Click','pilot-offer':'Pilot Offer Click','github':'GitHub Click','quickstart':'Quickstart Demo Click','product-demo':'Product Demo Click','evidence':'Evidence Click','checklist':'Checklist Click','docs':'Docs Click','n8n-guide':'Integration Example Click','n8n-examples':'Integration Example Click','console-screenshot':'Console Screenshot Click','docs-markdown':'Docs Markdown View'};
  document.addEventListener('click', event => {
    if(event.target?.closest?.('button[data-doc-copy="true"]')&&/^\/talon\/docs\/(?:[a-z0-9.-]+\/)?$/.test(page())){track('Docs Markdown Copy',{page:page(),signal:'click-only'});return;}
    const link=event.target?.closest?.('a[href]');
    if(link){
      let url; try{url=new URL(link.getAttribute('href')||'',window.location.origin);}catch{return;}
      if(!['http:','https:'].includes(url.protocol)) return;
      let intent=intentFor(link,url);
      if(!intent) return;
      const destination=url.origin===window.location.origin?url.pathname:'external:'+url.hostname;
      const props={page:page(),intent,placement:placementFor(link),destination,primary:String(link.matches('.button.primary, .nav-button, [data-growth-primary="true"]'))};
      if(intent==='pilot-booking'){
        if(url.hostname!=='calendar.app.google') return;
        track('Pilot Booking Click',{page:page(),placement:props.placement,channel:'google_calendar'});
      }else if(page()==='/solutions/n8n/'&&['case-support','case-procurement'].includes(intent)){
        track('Integration Example Click',props);
      }else track(names[intent]||'Funnel CTA',props);
      return;
    }
    if(event.target?.closest?.('.hero-demo-play')) {track('Demo Play',{page:page()});return;}
    // Observe the click on an actual installation/quickstart code block only.
    // No clipboard content, code text, success or installation claim is transmitted.
    const copy=event.target?.closest?.('button[class*="copyButton"],button[title="Copy code to clipboard"]');
    if(copy && /^\/talon\/docs\/(?:quickstart|quickstart-demo|proxy-quickstart)\/$/.test(page())){
      const code=copy.closest('[class*="codeBlockContainer"]')?.querySelector('code')?.textContent || '';
      if(/(?:quickstart\.sh|scripts\/install\.sh|make install|docker compose|docker pull|go install github\.com\/dativo-io\/talon)/.test(code))
        track('Copy Install Command',{page:page(),placement:'docs-code',signal:'click-only'});
    }
  });

  window.addEventListener('talon:docs-search',event=>{
    if(/^\/talon\/docs\/(?:[a-z0-9.-]+\/)?$/.test(page())&&['open','result','no-results'].includes(event.detail))track('Docs Search',{page:page(),action:event.detail});
  });

  // Only predefined campaign values are sent; automatic query/hash collection is off.
  const campaignValues={
    utm_source:new Set(['linkedin','github','newsletter','google','bing','community','dativo']),
    utm_medium:new Set(['organic_social','referral','email','organic','community','outreach']),
    utm_campaign:new Set(['n8n_acquisition','ai_governance','oss','product_launch','talon','website_redesign']),
    utm_content:new Set(['founder_post','company_post','dm','profile','article','template','readme','release'])
  };
  let campaignSent=false;
  function trackCampaign(){
    if(campaignSent||!window.umami||typeof window.umami.track!=='function'||optedOut())return;
    let url;try{url=new URL(window.location.href);}catch{return;}
    const safe={};for(const [key,values] of Object.entries(campaignValues)){const v=url.searchParams.get(key);if(values.has(v))safe[key]=v;}
    if(safe.utm_source&&safe.utm_medium&&safe.utm_campaign){campaignSent=true;track('Acquisition Campaign',{page:page(),...safe});}
  }
  trackCampaign();
  if(typeof window.addEventListener==='function')window.addEventListener('load',trackCampaign,{once:true});
  // This homepage already contains focused use-case journeys.
  if (page() !== '/' || document.querySelector('[data-case-first-home]')) return;
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
          <span>Inspect the action boundary. Verify governed MCP and exact HTTP action authorization on the supported release, with clear limits for other execution paths.</span>
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
