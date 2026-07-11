(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-navigation');
  const mobileNav = window.matchMedia('(max-width: 860px)');
  const compactContent = window.matchMedia('(max-width: 680px)');

  const closeNav = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    nav.dataset.open = 'false';
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation');
    nav.dataset.open = 'true';
    document.body.classList.add('nav-open');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeNav() : openNav();
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!mobileNav.matches || nav.dataset.open !== 'true') return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    mobileNav.addEventListener('change', closeNav);
  }

  const applyDisclosureMode = () => {
    const isCompact = compactContent.matches;

    document.querySelectorAll('.responsive-card').forEach((card, index) => {
      card.open = !isCompact || index === 0;
    });

    document.querySelectorAll('.mobile-disclosure').forEach((disclosure) => {
      disclosure.open = !isCompact;
    });
  };

  applyDisclosureMode();
  compactContent.addEventListener('change', applyDisclosureMode);

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
