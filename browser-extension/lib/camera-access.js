(function attachSplitPassCameraAccess(globalScope) {
  const PAGE_PATH = 'camera-access.html';
  const KNOWN_STATES = new Set(['granted', 'prompt', 'denied']);
  const POPUP_COPY = {
    prompt: {
      title: 'Camera access needed',
      copy: 'The browser cannot ask from this popup. Allow it once in a new tab.',
    },
    denied: {
      title: 'Camera blocked',
      copy: 'Camera access was blocked for split/Pass. Unblock it from the new tab.',
    },
  };

  async function queryCameraPermission(permissions = globalScope.navigator?.permissions) {
    if (typeof permissions?.query !== 'function') return 'unknown';

    try {
      const status = await permissions.query({ name: 'camera' });
      return KNOWN_STATES.has(status?.state) ? status.state : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  function needsAccessPage(permission) {
    return permission === 'prompt' || permission === 'denied';
  }

  async function requestCameraOnce(mediaDevices = globalScope.navigator?.mediaDevices) {
    if (typeof mediaDevices?.getUserMedia !== 'function') {
      return { ok: false, blocked: false, message: 'No camera is available in this browser.' };
    }

    try {
      const stream = await mediaDevices.getUserMedia({ audio: false, video: true });
      stream.getTracks().forEach((track) => track.stop());
      return { ok: true, blocked: false, message: '' };
    } catch (error) {
      return { ok: false, blocked: error?.name === 'NotAllowedError', message: String(error?.message || '') };
    }
  }

  globalScope.SplitPassCameraAccess = {
    PAGE_PATH,
    POPUP_COPY,
    needsAccessPage,
    queryCameraPermission,
    requestCameraOnce,
  };
})(globalThis);
