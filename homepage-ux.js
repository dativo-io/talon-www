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
    const originalAnimation = demoMedia.querySelector('.hero-demo-animation');
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
    const sourceUrl = demoMedia.dataset.demoSrc;
    const supportsFramePlayback = typeof window.ImageDecoder === 'function';
    let observer;
    let loading = false;
    let dialogElements;
    let bytesPromise;

    if (!document.querySelector('style[data-demo-playback-styles]')) {
      const playbackStyles = document.createElement('style');
      playbackStyles.dataset.demoPlaybackStyles = '';
      playbackStyles.textContent = `
        .demo-animation-target { cursor: pointer; }
        .demo-animation-target:focus-visible { outline: 2px solid #93c5fd; outline-offset: -3px; }
        .demo-pause-badge { position: absolute; z-index: 4; right: 14px; bottom: 14px; padding: 8px 12px; border: 1px solid rgba(191,219,254,.45); border-radius: 999px; background: rgba(2,6,23,.9); color: #dbeafe; font-size: 12px; font-weight: 750; line-height: 1; pointer-events: none; box-shadow: 0 8px 24px rgba(2,6,23,.42); }
        .demo-pause-badge[hidden] { display: none !important; }
        .hero-demo-dialog-stage canvas { display: block; width: auto; max-width: 100%; max-height: 100%; height: auto; }
        .hero-demo-dialog-stage.is-actual-size canvas { width: 979px; max-width: none; max-height: none; }
        @media (max-width: 720px) {
          .hero-demo-dialog-stage canvas { width: 100%; max-width: 100%; max-height: none; }
          .hero-demo-dialog-stage.is-actual-size canvas { width: 979px; max-width: none; }
        }
      `;
      document.head.append(playbackStyles);
    }

    if (!document.querySelector('link[href="/homepage-demo-dialog.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/homepage-demo-dialog.css';
      document.head.append(stylesheet);
    }

    const fetchDemoBytes = () => {
      if (!bytesPromise) {
        bytesPromise = fetch(sourceUrl, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
        })
          .then((response) => {
            if (!response.ok) throw new Error(`Demo recording returned HTTP ${response.status}`);
            return response.arrayBuffer();
          })
          .catch((error) => {
            bytesPromise = null;
            throw error;
          });
      }
      return bytesPromise;
    };

    const replaceImageWithCanvas = (image) => {
      if (!image || !supportsFramePlayback) return image;

      const canvas = document.createElement('canvas');
      canvas.className = image.className;
      canvas.width = Number(image.getAttribute('width')) || 979;
      canvas.height = Number(image.getAttribute('height')) || 694;
      canvas.dataset.demoDescription = image.alt || 'Animated Talon product demo';
      image.replaceWith(canvas);
      return canvas;
    };

    const createFallbackImagePlayer = ({image, onReady, onError}) => {
      let loaded = false;

      const restart = () => {
        loaded = false;
        const separator = sourceUrl.includes('?') ? '&' : '?';
        image.onload = () => {
          loaded = true;
          onReady?.();
        };
        image.onerror = () => onError?.(new Error('The GIF could not be loaded'));
        image.src = `${sourceUrl}${separator}replay=${Date.now()}`;
      };

      image.removeAttribute('tabindex');
      image.removeAttribute('role');
      image.removeAttribute('aria-pressed');
      image.title = 'Animated demo playback; pause requires a browser with ImageDecoder support';

      return {
        restart,
        pause: () => {},
        reset: () => {
          loaded = false;
          image.removeAttribute('src');
        },
        isLoaded: () => loaded,
      };
    };

    const createCanvasPlayer = ({canvas, container, onReady, onError}) => {
      const context = canvas.getContext('2d');
      const badge = document.createElement('span');
      badge.className = 'demo-pause-badge';
      badge.textContent = 'Paused · click to resume';
      badge.hidden = true;
      container.append(badge);

      let decoder;
      let frameCount = 1;
      let frameIndex = 0;
      let timer;
      let generation = 0;
      let loaded = false;
      let playing = false;

      canvas.classList.add('demo-animation-target');
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'button');

      const updateAccessibleState = () => {
        const paused = loaded && !playing;
        badge.hidden = !paused;
        canvas.setAttribute('aria-pressed', String(paused));
        canvas.setAttribute(
          'aria-label',
          paused ? 'Resume animated product demo' : 'Pause animated product demo',
        );
        canvas.title = paused ? 'Click to resume the demo' : 'Click to pause the demo';
      };

      const invalidatePlayback = () => {
        generation += 1;
        if (timer) window.clearTimeout(timer);
        timer = undefined;
        return generation;
      };

      const ensureDecoder = async () => {
        if (decoder) return;
        const bytes = await fetchDemoBytes();
        decoder = new window.ImageDecoder({
          data: bytes.slice(0),
          type: 'image/gif',
          preferAnimation: true,
        });
        await decoder.tracks.ready;
        const selectedTrack = decoder.tracks.selectedTrack;
        if (!selectedTrack) throw new Error('The GIF has no decodable image track');
        frameCount = Math.max(1, selectedTrack.frameCount || 1);
      };

      const renderFrame = async (index, runGeneration) => {
        const result = await decoder.decode({frameIndex: index});
        const frame = result.image;

        if (runGeneration !== generation) {
          frame.close();
          return null;
        }

        const width = frame.displayWidth || frame.codedWidth || 979;
        const height = frame.displayHeight || frame.codedHeight || 694;
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(frame, 0, 0, width, height);
        const delay = Math.min(10000, Math.max(20, (frame.duration || 100000) / 1000));
        frame.close();
        return delay;
      };

      const advance = async (runGeneration) => {
        if (!playing || runGeneration !== generation) return;

        try {
          const currentIndex = frameIndex;
          const delay = await renderFrame(currentIndex, runGeneration);
          if (delay === null || !playing || runGeneration !== generation) return;
          frameIndex = (currentIndex + 1) % frameCount;
          timer = window.setTimeout(() => advance(runGeneration), delay);
        } catch (error) {
          if (runGeneration !== generation) return;
          playing = false;
          loaded = false;
          updateAccessibleState();
          onError?.(error);
        }
      };

      const restart = async () => {
        const runGeneration = invalidatePlayback();
        playing = false;
        loaded = false;
        frameIndex = 0;
        updateAccessibleState();

        try {
          await ensureDecoder();
          if (runGeneration !== generation) return;

          const delay = await renderFrame(0, runGeneration);
          if (delay === null || runGeneration !== generation) return;

          loaded = true;
          playing = true;
          frameIndex = frameCount > 1 ? 1 : 0;
          updateAccessibleState();
          onReady?.();
          timer = window.setTimeout(() => advance(runGeneration), delay);
        } catch (error) {
          if (runGeneration !== generation) return;
          loaded = false;
          playing = false;
          updateAccessibleState();
          onError?.(error);
        }
      };

      const pause = () => {
        if (!loaded || !playing) return;
        invalidatePlayback();
        playing = false;
        updateAccessibleState();
      };

      const resume = () => {
        if (!loaded || playing) return;
        const runGeneration = invalidatePlayback();
        playing = true;
        updateAccessibleState();
        timer = window.setTimeout(() => advance(runGeneration), 0);
      };

      const toggle = () => {
        if (playing) pause();
        else resume();
      };

      const reset = () => {
        invalidatePlayback();
        loaded = false;
        playing = false;
        frameIndex = 0;
        badge.hidden = true;
        canvas.setAttribute('aria-pressed', 'false');
        canvas.setAttribute('aria-label', 'Pause animated product demo');
        canvas.title = 'Click to pause the demo';
      };

      canvas.addEventListener('click', toggle);
      canvas.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
      });

      updateAccessibleState();
      return {restart, pause, reset, isLoaded: () => loaded};
    };

    const createPlayer = ({element, container, onReady, onError}) => {
      if (element instanceof HTMLCanvasElement) {
        return createCanvasPlayer({canvas: element, container, onReady, onError});
      }
      return createFallbackImagePlayer({image: element, onReady, onError});
    };

    const animation = replaceImageWithCanvas(originalAnimation);
    const inlinePlayer = createPlayer({
      element: animation,
      container: demoMedia,
      onReady: () => {
        loading = false;
        demoMedia.classList.add('is-playing');
        demoMedia.removeAttribute('aria-busy');
      },
      onError: () => {
        loading = false;
        demoMedia.classList.remove('is-playing');
        demoMedia.removeAttribute('aria-busy');
        if (playButton) playButton.textContent = 'Retry demo';
      },
    });

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
      const playbackElement = supportsFramePlayback
        ? '<canvas width="979" height="694" data-demo-description="Animated Talon product demo showing customer support, coding assistant, and document summary use cases under shared cost, reliability, policy, session, and evidence controls."></canvas>'
        : '<img width="979" height="694" alt="Animated Talon product demo showing customer support, coding assistant, and document summary use cases under shared cost, reliability, policy, session, and evidence controls." decoding="async" />';
      dialog.innerHTML = `
        <div class="hero-demo-dialog-shell">
          <header class="hero-demo-dialog-header">
            <div>
              <span class="hero-demo-dialog-kicker">Live product recording</span>
              <h2 id="hero-demo-dialog-title">Watch three AI use cases through Talon</h2>
            </div>
            <button class="hero-demo-dialog-close" type="button" aria-label="Close demo">×</button>
          </header>
          <div class="hero-demo-dialog-stage">
            <div class="hero-demo-dialog-status" role="status">Loading the full product demo…</div>
            ${playbackElement}
          </div>
          <footer class="hero-demo-dialog-controls">
            <div class="hero-demo-dialog-buttons">
              <button type="button" data-demo-replay>↻ Replay</button>
              <button type="button" data-demo-size aria-pressed="false">Read terminal text</button>
              <a href="/talon/docs/product-demo/">Run it yourself →</a>
            </div>
            <p class="hero-demo-dialog-hint">Click the recording to pause or resume it. “Read terminal text” opens it at native size for touch panning; landscape gives the clearest view.</p>
          </footer>
        </div>`;

      const stage = dialog.querySelector('.hero-demo-dialog-stage');
      const dialogAnimation = stage.querySelector('canvas, img');
      const status = dialog.querySelector('.hero-demo-dialog-status');
      const closeButton = dialog.querySelector('.hero-demo-dialog-close');
      const replayButton = dialog.querySelector('[data-demo-replay]');
      const sizeButton = dialog.querySelector('[data-demo-size]');
      const dialogPlayer = createPlayer({
        element: dialogAnimation,
        container: stage,
        onReady: () => {
          status.hidden = true;
        },
        onError: () => {
          status.hidden = false;
          status.textContent = 'The recording could not be loaded. Use “Run it yourself” for the same live product demo.';
        },
      });

      const loadRecording = () => {
        status.hidden = false;
        status.textContent = 'Loading the full product demo…';
        dialogPlayer.restart();
      };

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
        dialogPlayer.pause();
        document.documentElement.classList.remove('demo-dialog-open');
        playButton?.focus({preventScroll: true});
      });

      document.body.append(dialog);
      dialogElements = {dialog, stage, status, dialogPlayer, loadRecording};
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

      document.documentElement.classList.add('demo-dialog-open');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      loadRecording();
    };

    const applyCompactHeroMode = () => {
      const isCompact = compactDemo.matches;

      if (heroGitHubLink) heroGitHubLink.hidden = isCompact;
      if (trustRow) trustRow.hidden = isCompact;
      if (questionStrip) questionStrip.hidden = isCompact;
      if (captionSummary) {
        captionSummary.textContent = isCompact
          ? 'Readable preview · tap Watch full demo for all three use cases'
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
          isCompact ? 'Open the full three-use-case Talon product demo' : 'Play the Talon product demo',
        );
      }

      if (animation) {
        animation.hidden = isCompact;
        if (isCompact) {
          inlinePlayer.reset();
          observer?.disconnect();
          loading = false;
          demoMedia.classList.remove('is-playing');
          demoMedia.removeAttribute('aria-busy');
        }
      }

      if (!isCompact && dialogElements?.dialog.open) closeDialog();
    };

    const playInlineDemo = () => {
      if (
        !animation
        || loading
        || demoMedia.classList.contains('is-playing')
      ) return;

      loading = true;
      observer?.disconnect();
      demoMedia.setAttribute('aria-busy', 'true');
      if (playButton) playButton.textContent = 'Loading demo…';
      inlinePlayer.restart();
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
