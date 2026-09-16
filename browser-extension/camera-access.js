(function splitPassCameraAccessPage() {
  const access = globalThis.SplitPassCameraAccess;
  const status = document.querySelector('[data-role="status"]');
  const retry = document.querySelector('[data-role="retry"]');

  function setStatus(text, tone = '') {
    status.textContent = text;
    status.className = tone ? `splitpass-message splitpass-message-${tone}` : 'splitpass-message';
  }

  async function requestCamera() {
    retry.classList.add('hidden');
    setStatus('Asking the browser for camera access.');

    const result = await access.requestCameraOnce();
    if (result.ok) {
      setStatus('Camera access granted. Close this tab and open split/Pass again.', 'success');
      return;
    }

    setStatus(
      result.blocked
        ? 'Camera access is blocked. Click the camera icon in the address bar, allow it, then try again.'
        : result.message || 'No camera is available in this browser.',
      'error'
    );
    retry.classList.remove('hidden');
  }

  retry.addEventListener('click', requestCamera);
  requestCamera();
})();
