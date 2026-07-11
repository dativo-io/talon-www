(() => {
  const compactContent = window.matchMedia('(max-width: 680px)');
  const technicalDisclosures = document.querySelectorAll('.responsive-technical');

  const applyDisclosureMode = () => {
    const isCompact = compactContent.matches;

    document.querySelectorAll('.responsive-card').forEach((card, index) => {
      card.open = !isCompact || index === 0;
    });

    technicalDisclosures.forEach((disclosure) => {
      disclosure.open = !isCompact;
    });
  };

  applyDisclosureMode();
  compactContent.addEventListener('change', applyDisclosureMode);

  const reliabilityDisclosure = technicalDisclosures[0];
  const legacyReliabilityTarget = document.querySelector('#reliability');
  if (reliabilityDisclosure) {
    if (legacyReliabilityTarget && legacyReliabilityTarget !== reliabilityDisclosure) {
      legacyReliabilityTarget.removeAttribute('id');
    }
    reliabilityDisclosure.id = 'reliability';

    if (window.location.hash === '#reliability') {
      reliabilityDisclosure.open = true;
      requestAnimationFrame(() => reliabilityDisclosure.scrollIntoView({block: 'start'}));
    }
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();