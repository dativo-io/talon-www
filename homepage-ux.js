(() => {
  const compactContent = window.matchMedia('(max-width: 680px)');

  const applyDisclosureMode = () => {
    const isCompact = compactContent.matches;

    document.querySelectorAll('.responsive-card').forEach((card, index) => {
      card.open = !isCompact || index === 0;
    });

    document.querySelectorAll('.responsive-technical').forEach((disclosure) => {
      disclosure.open = !isCompact;
    });
  };

  applyDisclosureMode();
  compactContent.addEventListener('change', applyDisclosureMode);

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();