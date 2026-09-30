(function attachSplitPassCameraAccess(globalScope) {
  const PAGE_PATH = 'camera-access.html';

  // Escalation is driven by what actually happened, not by navigator.permissions: Brave's
  // fingerprinting defences report `prompt` for an extension origin even after a grant.
  const FAILURE_COPY = {
    first: { title: 'Camera not started', copy: 'The permission dialog was closed. Tap to try again.' },
    repeated: { title: 'Camera blocked', copy: 'Allow the camera for split/Pass, then try again.' },
  };

  function describeFailure(denials = 1) {
    const repeated = Number(denials) >= 2;
    return { ...(repeated ? FAILURE_COPY.repeated : FAILURE_COPY.first), showHelp: repeated };
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
    describeFailure,
    requestCameraOnce,
  };
})(globalThis);
