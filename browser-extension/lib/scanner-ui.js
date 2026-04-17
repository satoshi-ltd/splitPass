(function attachSplitPassScannerUi(globalScope) {
  function createShell() {
    const root = document.createElement('div');
    root.className = 'splitpass-scanner-shell';
    root.innerHTML = `
      <div class="splitpass-panel-header">
        <div class="splitpass-panel-branding">
          <p class="splitpass-title">split/Pass</p>
          <p class="splitpass-subtitle">Scanner</p>
        </div>
        <div class="splitpass-panel-actions">
          <button aria-label="Lock vault" class="splitpass-lock hidden" title="Lock vault" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="6" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button aria-label="Close scanner" class="splitpass-close" type="button">X</button>
        </div>
      </div>
      <div class="splitpass-stage">
        <video autoplay class="splitpass-video" muted playsinline></video>
        <div class="splitpass-stage-inner">
          <div class="splitpass-frame">
            <span class="splitpass-frame-corner splitpass-frame-corner-top-left"></span>
            <span class="splitpass-frame-corner splitpass-frame-corner-top-right"></span>
            <span class="splitpass-frame-corner splitpass-frame-corner-bottom-left"></span>
            <span class="splitpass-frame-corner splitpass-frame-corner-bottom-right"></span>
          </div>
          <div class="splitpass-empty">
            <p class="splitpass-empty-title">Starting camera</p>
            <p class="splitpass-empty-copy">If this is your first scan, the browser may ask for permission now.</p>
          </div>
        </div>
      </div>
      <p class="splitpass-caption">Scan the QR shown in SplitPass.</p>
      <div class="splitpass-passcode splitpass-hidden">
        <label class="splitpass-passcode-label">
          <span>Passcode</span>
          <input class="splitpass-passcode-input" inputmode="numeric" maxlength="6" placeholder="6 digits" type="password" autocomplete="off" />
        </label>
        <button class="splitpass-button splitpass-button-primary splitpass-unlock" type="button">Unlock</button>
      </div>
      <button class="splitpass-button splitpass-button-secondary splitpass-retry splitpass-hidden" type="button">Retry camera</button>
      <p class="splitpass-message splitpass-hidden"></p>
    `;

    return {
      root,
      elements: {
        camera: root.querySelector('.splitpass-video'),
        cameraEmpty: root.querySelector('.splitpass-empty'),
        cameraEmptyCopy: root.querySelector('.splitpass-empty-copy'),
        cameraEmptyTitle: root.querySelector('.splitpass-empty-title'),
        caption: root.querySelector('.splitpass-caption'),
        closeButton: root.querySelector('.splitpass-close'),
        headerSubtitle: root.querySelector('.splitpass-subtitle'),
        lockButton: root.querySelector('.splitpass-lock'),
        message: root.querySelector('.splitpass-message'),
        passcodeInput: root.querySelector('.splitpass-passcode-input'),
        passcodePanel: root.querySelector('.splitpass-passcode'),
        retryButton: root.querySelector('.splitpass-retry'),
        unlockButton: root.querySelector('.splitpass-unlock'),
      },
    };
  }

  globalScope.SplitPassScannerUi = {
    createShell,
  };
})(globalThis);
