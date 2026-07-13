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
    const desktopPlayLabel = playButton?.textContent || '▶ Play demo';
    let observer;
    let loading = false;
    let dialogElements;

    if (!document.querySelector('link[href="/homepage-demo-dialog.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/homepage-demo-dialog.css';
      document.head.append(stylesheet);
    }

    const closeDialog = () => {
      const dialog = dialogElements?.dialog;
      if (!dialog) return;

      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        document.documentElement.classList.remove('demo-dialog-open');
      }
    };

    const ensureDemoDialog = () => {
      if (dialogElements) return dialogElements;

      const dialog = document.createElement('dialog');
      dialog.className = 'hero-demo-dialog';
      dialog.setAttribute('aria-labelledby', 'hero-demo-dialog-title');
      dialog.innerHTML = `
        <div class="hero-demo-dialog-shell">
          <header class="hero-demo-dialog-header">
            <div>
              <span class="hero-demo-dialog-kicker">Full terminal recording</span>
              <h2 id="hero-demo-dialog-title">Watch one governed Talon session</h2>
            </div>
            <button class="hero-demo-dialog-close" type="button" aria-label="Close demo">×</button>
          </header>
          <div class="hero-demo-dialog-stage" tabindex="0">
            <div class="hero-demo-dialog-status" role="status">Loading the full terminal demo…</div>
            <img width="979" height="694" alt="Animated Talon terminal demo showing agent authentication, tool filtering, PII and egress controls, session-budget denial, and signed evidence verification." decoding="async" />
          </div>
          <footer class="hero-demo-dialog-controls">
            <div class="hero-demo-dialog-buttons">
              <button type="button" data-demo-replay>↻ Replay</button>
              <button type="button" data-demo-size aria-pressed="false">Read terminal text</button>
              <a href="/talon/docs/manual-governed-session/">Reproduce manually →</a>
            </div>
            <p class="hero-demo-dialog-hint">Fit shows the complete run. “Read terminal text” opens the recording at native size for touch panning; landscape gives the clearest view.</p>
          </footer>
        </div>`;

      const stage = dialog.querySelector('.hero-demo-dialog-stage');
      const dialogImage = dialog.querySelector('img');
      const status = dialog.querySelector('.hero-demo-dialog-status');
      const closeButton = dialog.querySelector('.hero-demo-dialog-close');
      const replayButton = dialog.querySelector('[data-demo-replay]');
      const sizeButton = dialog.querySelector('[data-demo-size]');

      const loadRecording = () => {
        if (!dialogImage || !status) return;

        status.hidden = false;
        status.textContent = 'Loading the full terminal demo…';
        dialogImage.removeAttribute('src');
        const separator = demoMedia.dataset.demoSrc.includes('?') ? '&' : '?';
        requestAnimationFrame(() => {
          dialogImage.src = `${demoMedia.dataset.demoSrc}${separator}replay=${Date.now()}`;
        });
      };

      dialogImage?.addEventListener('load', () => {
        status.hidden = true;
      });

      dialogImage?.addEventListener('error', () => {
        status.hidden = false;
        status.textContent = 'The recording could not be loaded. Use “Reproduce manually” for the same governed session.';
      });

      closeButton?.addEventListener('click', closeDialog);
      replayButton?.addEventListener('click', loadRecording);
      sizeButton?.addEventListener('click', () => {
        const actualSize = stage.classList.toggle('is-actual-size');
        sizeButton.setAttribute('aria-pressed', String(actualSize));
        sizeButton.textContent = actualSize ? 'Fit to screen' : 'Read terminal text';
        stage.scrollTo({top: 0, left: 0, behavior: 'instant'});
      });

      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog();
      });

      dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('demo-dialog-open');
        playButton?.focus({preventScroll: true});
      });

      document.body.append(dialog);
      dialogElements = {dialog, stage, dialogImage, status, loadRecording};
      return dialogElements;
    };

    const openMobileDemo = () => {
      const {dialog, stage, loadRecording} = ensureDemoDialog();
      stage.classList.remove('is-actual-size');
      const sizeButton = dialog.querySelector('[data-demo-size]');
      if (sizeButton) {
        sizeButton.setAttribute('aria-pressed', 'false');
        sizeButton.textContent = 'Read terminal text';
      }

      loadRecording();
      document.documentElement.classList.add('demo-dialog-open');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    };

    const applyCompactHeroMode = () => {
      const isCompact = compactDemo.matches;

      if (heroGitHubLink) heroGitHubLink.hidden = isCompact;
      if (trustRow) trustRow.hidden = isCompact;
      if (questionStrip) questionStrip.hidden = isCompact;
      if (captionSummary) {
        captionSummary.textContent = isCompact
          ? 'Readable preview · tap Watch full demo for the complete run'
          : desktopCaption;
      }
      if (captionLink) captionLink.hidden = isCompact;

      posterLines.forEach((line, index) => {
        line.hidden = isCompact && ![0, 3, 4].includes(index);
      });

      demoMedia.style.aspectRatio = isCompact ? '4 / 3' : '';

      if (playButton) {
        playButton.hidden = false;
        playButton.textContent = isCompact ? '▶ Watch full demo' : desktopPlayLabel;
        playButton.setAttribute(
          'aria-label',
          isCompact ? 'Open the full governed-session terminal demo' : 'Play the governed-session demo',
        );
      }

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

      if (!isCompact && dialogElements?.dialog.open) closeDialog();
    };

    const playInlineDemo = () => {
      if (
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

    const playDemo = () => {
      if (compactDemo.matches) {
        openMobileDemo();
      } else {
        playInlineDemo();
      }
    };

    const scheduleDesktopPlayback = () => {
      observer?.disconnect();
      if (compactDemo.matches || reducedMotion.matches || loading || demoMedia.classList.contains('is-playing')) return;

      if (!('IntersectionObserver' in window)) {
        playInlineDemo();
        return;
      }

      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          playInlineDemo();
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
