(function splitPassHydratorContent() {
  const runtime = (globalThis.browser && globalThis.browser.runtime) || chrome.runtime;
  const launcherButtons = new Map();
  const INLINE_LAUNCHER_SIZE = 24;
  const INLINE_LAUNCHER_OUTSIDE_SHIFT = 2;

  const state = {
    fontsPromise: null,
    layoutHandle: 0,
    shadowHost: null,
    shadowRoot: null,
    launcherLayer: null,
    panelLayer: null,
    panel: {
      closeButton: null,
      detectedValue: '',
      detector: null,
      loopHandle: 0,
      message: null,
      passcodeInput: null,
      passcodePanel: null,
      retryButton: null,
      root: null,
      scanning: false,
      stageEmpty: null,
      stream: null,
      targetInput: null,
      unlockButton: null,
      video: null,
    },
  };

  function getRuntimeUrl(path) {
    return runtime.getURL(path);
  }

  function createStylesheetLink(path) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = getRuntimeUrl(path);
    return stylesheet;
  }

  async function ensureUiFonts() {
    if (state.fontsPromise) return state.fontsPromise;

    if (!('FontFace' in globalThis) || !document.fonts) {
      state.fontsPromise = Promise.resolve();
      return state.fontsPromise;
    }

    const fonts = [
      { path: 'assets/fonts/Doto_500Medium.ttf', weight: '500' },
      { path: 'assets/fonts/Doto_700Bold.ttf', weight: '700' },
      { path: 'assets/fonts/Doto_900Black.ttf', weight: '900' },
    ];

    state.fontsPromise = Promise.all(
      fonts.map(async ({ path, weight }) => {
        const fontFace = new FontFace('Doto', `url("${getRuntimeUrl(path)}") format("truetype")`, {
          style: 'normal',
          weight,
        });

        await fontFace.load();
        document.fonts.add(fontFace);
      })
    ).catch(() => undefined);

    return state.fontsPromise;
  }

  async function ensureUiRoot() {
    if (state.shadowRoot) return;

    await ensureUiFonts();

    const host = document.createElement('splitpass-hydrator-root');
    host.dataset.splitpassOwned = 'true';

    const shadowRoot = host.attachShadow({ mode: 'open' });
    const launcherLayer = document.createElement('div');
    const panelLayer = document.createElement('div');

    shadowRoot.append(createStylesheetLink('content.css'), createStylesheetLink('scanner-ui.css'), launcherLayer, panelLayer);
    (document.body || document.documentElement).appendChild(host);

    state.shadowHost = host;
    state.shadowRoot = shadowRoot;
    state.launcherLayer = launcherLayer;
    state.panelLayer = panelLayer;
  }

  function isOwnedElement(element) {
    return element instanceof Element && !!element.closest('[data-splitpass-owned="true"]');
  }

  function eventInsideUi(event) {
    return !!state.shadowHost && typeof event.composedPath === 'function' && event.composedPath().includes(state.shadowHost);
  }

  function isPasswordInput(element) {
    return (
      element instanceof HTMLInputElement &&
      !isOwnedElement(element) &&
      !element.disabled &&
      !element.readOnly &&
      String(element.type || '').toLowerCase() === 'password'
    );
  }

  function isVisible(element) {
    if (!(element instanceof Element)) return false;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0 && element.getClientRects().length > 0;
  }

  function handleFocusIn(event) {
    if (isOwnedElement(event.target) || eventInsideUi(event)) return;
    scheduleLauncherLayout();
  }

  function setFormFieldValue(element, value) {
    if (element instanceof HTMLInputElement) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      descriptor?.set?.call(element, value);
      return;
    }

    if (element instanceof HTMLTextAreaElement) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      descriptor?.set?.call(element, value);
      return;
    }

    element.textContent = value;
  }

  function dispatchValueEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function fillTarget(element, value) {
    element.focus();
    setFormFieldValue(element, value);
    dispatchValueEvents(element);
  }

  async function createLauncherButton(input) {
    await ensureUiRoot();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'splitpass-inline-button splitpass-hidden';
    button.dataset.splitpassOwned = 'true';
    button.setAttribute('aria-label', 'Open SplitPass scanner');

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
      openInlineScanner(input).catch(() => undefined);
    });

    state.launcherLayer.appendChild(button);
    launcherButtons.set(input, button);
    return button;
  }

  function removeLauncherButton(input) {
    const button = launcherButtons.get(input);
    if (!button) return;

    button.remove();
    launcherButtons.delete(input);
  }

  function positionLauncherButton(input, button) {
    if (!isPasswordInput(input) || !input.isConnected || !isVisible(input)) {
      button.classList.add('splitpass-hidden');
      return;
    }

    const rect = input.getBoundingClientRect();

    if (rect.width < 48 || rect.height < 28 || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
      button.classList.add('splitpass-hidden');
      return;
    }

    const size = INLINE_LAUNCHER_SIZE;
    const top = Math.max(8, Math.min(rect.top + Math.max(0, (rect.height - size) / 2), window.innerHeight - size - 8));
    const left = Math.max(8, Math.min(rect.right - size + INLINE_LAUNCHER_OUTSIDE_SHIFT, window.innerWidth - size - 4));

    button.style.setProperty('--splitpass-inline-top', `${Math.round(top)}px`);
    button.style.setProperty('--splitpass-inline-left', `${Math.round(left)}px`);
    button.classList.remove('splitpass-hidden');
  }

  async function updateLauncherButtons() {
    state.layoutHandle = 0;

    const inputs = Array.from(document.querySelectorAll('input[type="password"]')).filter((input) => !isOwnedElement(input));
    const activeInputs = new Set(inputs);

    for (const input of inputs) {
      const button = launcherButtons.get(input) || (await createLauncherButton(input));
      positionLauncherButton(input, button);
    }

    for (const [input] of launcherButtons) {
      if (!activeInputs.has(input) || !input.isConnected) {
        removeLauncherButton(input);
      }
    }

    if (isInlineScannerOpen()) {
      positionInlineScanner();
    }
  }

  function scheduleLauncherLayout() {
    if (state.layoutHandle) return;
    state.layoutHandle = window.requestAnimationFrame(() => {
      updateLauncherButtons().catch(() => undefined);
    });
  }

  async function ensureInlineScanner() {
    if (state.panel.root) return;

    await ensureUiRoot();

    const root = document.createElement('section');
    root.className = 'splitpass-panel splitpass-surface splitpass-hidden';
    root.dataset.splitpassOwned = 'true';
    const scannerUi = globalThis.SplitPassScannerUi.createShell();
    root.appendChild(scannerUi.root);

    state.panelLayer.appendChild(root);

    state.panel.root = root;
    state.panel.closeButton = scannerUi.elements.closeButton;
    state.panel.message = scannerUi.elements.message;
    state.panel.passcodeInput = scannerUi.elements.passcodeInput;
    state.panel.passcodePanel = scannerUi.elements.passcodePanel;
    state.panel.retryButton = scannerUi.elements.retryButton;
    state.panel.stageEmpty = scannerUi.elements.cameraEmpty;
    state.panel.unlockButton = scannerUi.elements.unlockButton;
    state.panel.video = scannerUi.elements.camera;

    state.panel.closeButton.addEventListener('click', closeInlineScanner);
    state.panel.retryButton.addEventListener('click', startInlineCamera);
    state.panel.unlockButton.addEventListener('click', unlockInlineSecret);

    state.panel.passcodeInput.addEventListener('input', () => {
      const numericValue = state.panel.passcodeInput.value.replace(/\D/g, '').slice(0, 6);
      if (numericValue !== state.panel.passcodeInput.value) {
        state.panel.passcodeInput.value = numericValue;
      }
    });

    state.panel.passcodeInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        unlockInlineSecret();
      }
    });
  }

  function isInlineScannerOpen() {
    return !!state.panel.root && !state.panel.root.classList.contains('splitpass-hidden');
  }

  function clearInlineMessage() {
    state.panel.message.textContent = '';
    state.panel.message.className = 'splitpass-message splitpass-hidden';
  }

  function setInlineMessage(text, tone = '') {
    state.panel.message.textContent = text;
    state.panel.message.className = tone ? `splitpass-message splitpass-message-${tone}` : 'splitpass-message';
  }

  function showInlineEmpty(show) {
    state.panel.stageEmpty.classList.toggle('splitpass-hidden', !show);
  }

  function showInlineRetry(show) {
    state.panel.retryButton.classList.toggle('splitpass-hidden', !show);
  }

  function toggleInlinePasscode(show) {
    state.panel.passcodePanel.classList.toggle('splitpass-hidden', !show);
    if (!show) {
      state.panel.passcodeInput.value = '';
    }
    if (isInlineScannerOpen()) {
      window.requestAnimationFrame(positionInlineScanner);
    }
  }

  function stopInlineLoop() {
    if (state.panel.loopHandle) {
      clearTimeout(state.panel.loopHandle);
      state.panel.loopHandle = 0;
    }
  }

  function stopInlineStream() {
    if (!state.panel.stream) return;

    state.panel.stream.getTracks().forEach((track) => track.stop());
    state.panel.stream = null;
    state.panel.video.srcObject = null;
  }

  function stopInlineCamera() {
    state.panel.scanning = false;
    stopInlineLoop();
    stopInlineStream();
    showInlineEmpty(true);
  }

  async function ensureInlineDetector() {
    if (state.panel.detector) return state.panel.detector;

    if (!('BarcodeDetector' in globalThis)) {
      throw new Error('QR scanning is not available in this browser.');
    }

    if (typeof globalThis.BarcodeDetector.getSupportedFormats === 'function') {
      const formats = await globalThis.BarcodeDetector.getSupportedFormats();
      if (Array.isArray(formats) && formats.length && !formats.includes('qr_code')) {
        throw new Error('QR scanning is not available in this browser.');
      }
    }

    state.panel.detector = new globalThis.BarcodeDetector({ formats: ['qr_code'] });
    return state.panel.detector;
  }

  function positionInlineScanner() {
    if (!isInlineScannerOpen() || !state.panel.targetInput || !state.panel.targetInput.isConnected) return;

    const input = state.panel.targetInput;
    const rect = input.getBoundingClientRect();

    if (!isVisible(input) || rect.width < 20 || rect.height < 20) {
      closeInlineScanner();
      return;
    }

    const panelWidth = Math.min(304, window.innerWidth - 24);
    const gutter = 10;

    state.panel.root.style.setProperty('--splitpass-shell-width', `${Math.round(panelWidth)}px`);
    state.panel.root.style.setProperty('--splitpass-panel-max-height', `${Math.max(260, window.innerHeight - 24)}px`);

    const rootHeight = state.panel.root.offsetHeight || 420;
    const centeredLeft = rect.left + rect.width - panelWidth;
    const left = Math.max(12, Math.min(centeredLeft, window.innerWidth - panelWidth - 12));
    const fitsBelow = rect.bottom + gutter + rootHeight <= window.innerHeight - 12;
    const top = fitsBelow ? rect.bottom + gutter : Math.max(12, rect.top - rootHeight - gutter);

    state.panel.root.style.setProperty('--splitpass-panel-left', `${Math.round(left)}px`);
    state.panel.root.style.setProperty('--splitpass-panel-top', `${Math.round(top)}px`);
  }

  async function openInlineScanner(input) {
    await ensureInlineScanner();
    state.panel.targetInput = input;
    state.panel.detectedValue = '';
    clearInlineMessage();
    toggleInlinePasscode(false);
    showInlineRetry(false);
    state.panel.root.classList.remove('splitpass-hidden');
    positionInlineScanner();
    startInlineCamera();
  }

  function closeInlineScanner() {
    if (!state.panel.root) return;

    stopInlineCamera();
    toggleInlinePasscode(false);
    clearInlineMessage();
    state.panel.detectedValue = '';
    state.panel.targetInput = null;
    state.panel.root.classList.add('splitpass-hidden');
  }

  async function hydrateInlineSecret(secret) {
    const target =
      state.panel.targetInput instanceof HTMLInputElement &&
      isPasswordInput(state.panel.targetInput) &&
      state.panel.targetInput.isConnected &&
      isVisible(state.panel.targetInput)
        ? state.panel.targetInput
        : null;

    if (!target) {
      setInlineMessage('The original password field is no longer available.', 'error');
      return;
    }

    fillTarget(target, secret);
    setInlineMessage('Secret filled.', 'success');
    window.setTimeout(closeInlineScanner, 450);
  }

  function handleInlineUnsupportedResult(result) {
    if (result.code === 'unsupported_type') {
      setInlineMessage('Only password QR values are supported right now.', 'warning');
      return;
    }

    setInlineMessage('This QR is not a valid SplitPass password value.', 'error');
  }

  async function processInlineRawValue(rawValue, passcode = '') {
    const result = globalThis.SplitPassDecoder.decode(rawValue, passcode);

    if (!result.ok) {
      if (result.code === 'requires_passcode') {
        state.panel.detectedValue = rawValue;
        stopInlineCamera();
        toggleInlinePasscode(true);
        setInlineMessage('Enter the 6-digit passcode.', 'warning');
        state.panel.passcodeInput.focus();
        return;
      }

      if (result.code === 'invalid_passcode') {
        setInlineMessage('Invalid passcode.', 'error');
        return;
      }

      handleInlineUnsupportedResult(result);
      return;
    }

    toggleInlinePasscode(false);
    await hydrateInlineSecret(result.secret);
  }

  async function scanInlineFrame() {
    if (!state.panel.scanning || !state.panel.stream) return;

    try {
      if (state.panel.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const detector = await ensureInlineDetector();
        const barcodes = await detector.detect(state.panel.video);

        if (barcodes.length > 0) {
          const rawValue = String(barcodes[0].rawValue || '').trim();

          if (rawValue) {
            stopInlineCamera();
            await processInlineRawValue(rawValue);
            return;
          }
        }
      }
    } catch (error) {
      stopInlineCamera();
      showInlineRetry(true);
      setInlineMessage(error instanceof Error ? error.message : 'Unable to scan the QR.', 'error');
      return;
    }

    state.panel.loopHandle = window.setTimeout(scanInlineFrame, 180);
  }

  async function startInlineCamera() {
    if (!state.panel.root) return;

    state.panel.detectedValue = '';
    toggleInlinePasscode(false);
    showInlineRetry(false);
    clearInlineMessage();

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('This page cannot open the camera. Use the SplitPass extension button instead.');
      }

      await ensureInlineDetector();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
        },
      });

      stopInlineStream();

      state.panel.stream = stream;
      state.panel.video.srcObject = stream;
      await state.panel.video.play();
      state.panel.scanning = true;
      showInlineEmpty(false);
      positionInlineScanner();
      scanInlineFrame();
    } catch (error) {
      stopInlineCamera();
      showInlineRetry(true);
      setInlineMessage(error instanceof Error ? error.message : 'Unable to start the camera.', 'error');
    }
  }

  async function unlockInlineSecret() {
    const passcode = state.panel.passcodeInput.value.replace(/\D/g, '');
    state.panel.passcodeInput.value = passcode;

    if (passcode.length !== 6) {
      setInlineMessage('The passcode must contain 6 digits.', 'error');
      return;
    }

    if (!state.panel.detectedValue) {
      setInlineMessage('No secure QR is waiting for passcode.', 'error');
      return;
    }

    await processInlineRawValue(state.panel.detectedValue, passcode);
  }

  function handlePointerDown(event) {
    if (!isInlineScannerOpen()) return;

    if (isOwnedElement(event.target) || eventInsideUi(event)) return;

    if (state.panel.targetInput && state.panel.targetInput.contains(event.target)) return;

    closeInlineScanner();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && isInlineScannerOpen()) {
      closeInlineScanner();
    }
  }

  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('scroll', scheduleLauncherLayout, true);
  window.addEventListener('resize', scheduleLauncherLayout);
  window.addEventListener('beforeunload', closeInlineScanner);

  const observer = new MutationObserver(scheduleLauncherLayout);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'disabled', 'readonly', 'style', 'type'],
    childList: true,
    subtree: true,
  });

  scheduleLauncherLayout();
})();
