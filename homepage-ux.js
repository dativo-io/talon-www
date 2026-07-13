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
    const heroGitHubLink = document.querySelector('.hero-github-link');
    const trustRow = document.querySelector('.trust-row');
    const questionStrip = document.querySelector('.strip');
    const caption = document.querySelector('.hero-demo-caption');
    const captionSummary = caption?.querySelector('span');
    const captionLink = caption?.querySelector('a');
    const posterLines = [...demoMedia.querySelectorAll('.hero-demo-line')];
    const desktopCaption = captionSummary?.textContent || '';
    let observer;
    let loading = false;

    const applyCompactHeroMode = () => {
      const isCompact = compactDemo.matches;

      if (heroGitHubLink) heroGitHubLink.hidden = isCompact;
      if (trustRow) trustRow.hidden = isCompact;
      if (questionStrip) questionStrip.hidden = isCompact;
      if (captionSummary) {
        captionSummary.textContent = isCompact
          ? 'One agent · one policy · verified'
          : desktopCaption;
      }
      if (captionLink) captionLink.hidden = isCompact;

      posterLines.forEach((line, index) => {
        line.hidden = isCompact && ![0, 3, 4].includes(index);
      });

      demoMedia.style.aspectRatio = isCompact ? '4 / 3' : '';

      if (playButton) playButton.hidden = isCompact;
      if (animation) {
        animation.hidden = isCompact;
        if (isCompact) {
          observer?.disconnect();
          loading = false;
          animation.removeAttribute('src');
          demoMedia.classList.remove('is-playing');
          demoMedia.removeAttribute('aria-busy');
        }
      }
    };

    const playDemo = () => {
      if (
        compactDemo.matches ||
        !animation ||
        loading ||
        demoMedia.classList.contains('is-playing')
      ) return;

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
    compactDemo.addEventListener('change', () => {
      applyCompactHeroMode();
      scheduleDesktopPlayback();
    });
    reducedMotion.addEventListener('change', scheduleDesktopPlayback);

    applyCompactHeroMode();
    scheduleDesktopPlayback();
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
