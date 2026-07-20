(() => {
  const form = document.querySelector('[data-pilot-form]');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add(`is-${type}`);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submit.disabled = true;
    setStatus('Sending privately to Dativo…');

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'The request could not be sent.');
      }

      form.reset();
      setStatus('Received. Dativo will reply to the work email you provided.', 'success');
      window.plausible?.('Pilot Submit', {props: {problem: payload.problem || 'unknown'}});
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'The request could not be sent. Please try again.',
        'error',
      );
    } finally {
      submit.disabled = false;
    }
  });
})();
