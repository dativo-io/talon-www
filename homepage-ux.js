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

  const demoMedia = document.querySelector('.hero-demo-media[data-demo-src]');
  if (demoMedia) {
    const animation = demoMedia.querySelector('.hero-demo-animation');
    const playButton = demoMedia.querySelector('.hero-demo-play');
    const compactDemo = window.matchMedia('(max-width: 720px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let loading = false;

    const playDemo = () => {
      if (!animation || loading || demoMedia.classList.contains('is-playing')) return;

      loading = true;
      observer?.disconnect();
      demoMedia.setAttribute('aria-busy', 'true');
      if (playButton) playButton.textContent = 'Loading demo…';

      animation.addEventListener('load', () => {
        demoMedia.classList.add('is-playing');
        demoMedia.removeAttribute('aria-busy');
      }, {once: true});

      animation.addEventListener('error', () => {
        loading = false;
        animation.removeAttribute('src');
        demoMedia.removeAttribute('aria-busy');
        if (playButton) playButton.textContent = 'Retry demo';
      }, {once: true});

      animation.src = demoMedia.dataset.demoSrc;
    };

    const scheduleDesktopPlayback = () => {
      observer?.disconnect();
      if (compactDemo.matches || reducedMotion.matches || loading || demoMedia.classList.contains('is-playing')) return;

      if (!('IntersectionObserver' in window)) {
        playDemo();
        return;
      }

      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          playDemo();
        }
      }, {rootMargin: '160px'});
      observer.observe(demoMedia);
    };

    playButton?.addEventListener('click', playDemo);
    compactDemo.addEventListener('change', scheduleDesktopPlayback);
    reducedMotion.addEventListener('change', scheduleDesktopPlayback);
    scheduleDesktopPlayback();
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
