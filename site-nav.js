(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-navigation');
  if (!navToggle || !nav) return;

  const mobileNav = window.matchMedia('(max-width: 860px)');
  const dropdowns = [...nav.querySelectorAll('.nav-dropdown')];

  const closeDropdowns = () => {
    dropdowns.forEach((dropdown) => dropdown.removeAttribute('open'));
  };

  const closeNav = ({restoreFocus = false} = {}) => {
    const wasOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    nav.dataset.open = 'false';
    document.body.classList.remove('nav-open');
    closeDropdowns();
    if (restoreFocus && wasOpen) navToggle.focus();
  };

  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation');
    nav.dataset.open = 'true';
    document.body.classList.add('nav-open');
  };

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeNav() : openNav();
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeNav()));

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('toggle', () => {
      if (!dropdown.open) return;
      dropdowns.forEach((other) => {
        if (other !== dropdown) other.removeAttribute('open');
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav({restoreFocus: mobileNav.matches});
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeDropdowns();
    if (!mobileNav.matches || nav.dataset.open !== 'true') return;
    if (nav.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
  });

  mobileNav.addEventListener('change', () => closeNav());
})();
