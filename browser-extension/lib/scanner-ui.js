(function attachSplitPassScannerUi(globalScope) {
  function createShell() {
    const root = document.createElement('div');
    root.className = 'splitpass-scanner-shell';
    root.innerHTML = `
      <div class="splitpass-panel-header">
        <div class="splitpass-panel-header-top">
          <p class="splitpass-title">split/Pass</p>
          <button aria-label="Close scanner" class="splitpass-close" type="button">X</button>
        </div>
        <p class="splitpass-subtitle">Scanner</p>
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
