const popupRoot = document.getElementById('popupRoot');
const scannerUi = globalThis.SplitPassScannerUi.createShell();
const secretItem = globalThis.SplitPassSecretItem;
const vault = globalThis.SplitPassVault;
const { callStorage } = globalThis.SplitPassBrowserApi;
const browserApi = globalThis.browser || globalThis.chrome || {};
const UI_STATE_STORAGE_KEY = 'splitpass.browser.ui.v1';
const POPUP_OPEN_HEARTBEAT_MS = 1000;

popupRoot.appendChild(scannerUi.root);

const camera = scannerUi.elements.camera;
const cameraEmpty = scannerUi.elements.cameraEmpty;
const cameraEmptyCopy = scannerUi.elements.cameraEmptyCopy;
const cameraEmptyTitle = scannerUi.elements.cameraEmptyTitle;
const closeButton = scannerUi.elements.closeButton;
const headerSubtitle = scannerUi.elements.headerSubtitle;
const retryButton = scannerUi.elements.retryButton;
const passcodePanel = scannerUi.elements.passcodePanel;
const passcodeInput = scannerUi.elements.passcodeInput;
const unlockButton = scannerUi.elements.unlockButton;
const message = scannerUi.elements.message;
const caption = scannerUi.elements.caption;
const stage = camera.closest('.splitpass-stage');

const authPanel = document.createElement('section');
authPanel.className = 'splitpass-auth-panel';
authPanel.innerHTML = `
  <label class="splitpass-auth-label">
    <input class="splitpass-auth-input" data-role="master-password" type="password" autocomplete="current-password" />
  </label>
  <label class="splitpass-auth-label splitpass-auth-confirm" data-role="confirm-wrap">
    <input class="splitpass-auth-input" data-role="master-password-confirm" type="password" autocomplete="new-password" />
  </label>
  <button class="splitpass-button splitpass-button-primary splitpass-auth-submit" data-role="auth-submit" type="button"></button>
  <div class="splitpass-auth-reset hidden" data-role="reset-wrap">
    <button class="splitpass-auth-reset-trigger" data-role="reset-trigger" type="button">Forgot password? Reset vault</button>
    <div class="splitpass-auth-reset-confirm hidden" data-role="reset-confirm">
      <p class="splitpass-auth-reset-warning">This will permanently delete the vault and all saved passwords on this device.</p>
      <div class="splitpass-auth-reset-actions">
        <button class="splitpass-button splitpass-button-secondary" data-role="reset-cancel" type="button">Cancel</button>
        <button class="splitpass-button splitpass-button-danger" data-role="reset-do" type="button">Reset vault</button>
      </div>
    </div>
  </div>
`;

const recentPanel = document.createElement('section');
recentPanel.className = 'splitpass-recent-panel';
recentPanel.innerHTML = `
  <div class="splitpass-recent-list" data-role="recent-list"></div>
`;

const lockButton = scannerUi.elements.lockButton;

const footerEl = document.createElement('footer');
footerEl.className = 'splitpass-footer';
footerEl.innerHTML = `
  <span>© ${new Date().getFullYear()} <a class="splitpass-footer-link" href="https://www.satoshi-ltd.com" target="_blank" rel="noopener noreferrer">Satoshi LTD</a></span>
`;

scannerUi.root.appendChild(authPanel);
scannerUi.root.appendChild(recentPanel);
scannerUi.root.appendChild(footerEl);

const authSubmit = authPanel.querySelector('[data-role="auth-submit"]');
const confirmWrap = authPanel.querySelector('[data-role="confirm-wrap"]');
const masterPasswordInput = authPanel.querySelector('[data-role="master-password"]');
const masterPasswordConfirmInput = authPanel.querySelector('[data-role="master-password-confirm"]');
const resetWrap = authPanel.querySelector('[data-role="reset-wrap"]');
const resetTrigger = authPanel.querySelector('[data-role="reset-trigger"]');
const resetConfirm = authPanel.querySelector('[data-role="reset-confirm"]');
const resetCancel = authPanel.querySelector('[data-role="reset-cancel"]');
const resetDo = authPanel.querySelector('[data-role="reset-do"]');
const recentList = recentPanel.querySelector('[data-role="recent-list"]');

const defaultEmptyState = {
  copy: 'If this is your first scan, the browser may ask for permission now.',
  title: 'Starting camera',
};

const state = {
  cameraRequestId: 0,
  cameraStarting: false,
  detectedValue: '',
  detector: null,
  failedUnlockAttempts: 0,
  loopHandle: 0,
  scanning: false,
  stream: null,
  currentDomain: '',
  currentFaviconUrl: '',
  currentUrl: '',
  cameraStartedByUser: false,
  isAuthBusy: false,
  recentEntries: [],
  popupHeartbeatHandle: 0,
  vaultInitialized: false,
  unlocked: false,
};

async function setPopupOpenState(popupOpen) {
  const storageArea = browserApi?.storage?.local;
  if (!storageArea) return;

  await callStorage(storageArea, 'set', {
    [UI_STATE_STORAGE_KEY]: {
      popupOpen: !!popupOpen,
      updatedAt: Date.now(),
    },
  }).catch(() => undefined);
}

function stopPopupHeartbeat() {
  if (!state.popupHeartbeatHandle) return;
  clearInterval(state.popupHeartbeatHandle);
  state.popupHeartbeatHandle = 0;
}

function startPopupHeartbeat() {
  stopPopupHeartbeat();
  state.popupHeartbeatHandle = globalThis.setInterval(() => {
    setPopupOpenState(true);
  }, POPUP_OPEN_HEARTBEAT_MS);
}

function setMainViewVisible(visible) {
  stage.classList.toggle('hidden', !visible);
  caption.classList.toggle('hidden', !visible);
  retryButton.classList.toggle('hidden', !visible || retryButton.classList.contains('splitpass-hidden'));
  passcodePanel.classList.toggle('hidden', !visible || passcodePanel.classList.contains('splitpass-hidden'));
}

function clearMessage() {
  message.textContent = '';
  message.className = 'splitpass-message splitpass-hidden';
}

function setMessage(text, tone = '') {
  message.textContent = text;
  message.className = tone ? `splitpass-message splitpass-message-${tone}` : 'splitpass-message';
}

function setEmptyState(title, copy) {
  cameraEmptyTitle.textContent = title;
  cameraEmptyCopy.textContent = copy;
}

function resetEmptyState() {
  setEmptyState(defaultEmptyState.title, defaultEmptyState.copy);
}

function showCameraEmpty(show) {
  cameraEmpty.classList.toggle('splitpass-hidden', !show);
}

function showRetry(show) {
  retryButton.classList.toggle('splitpass-hidden', !show);
  retryButton.classList.toggle('hidden', !show);
}

function togglePasscodePanel(show) {
  passcodePanel.classList.toggle('splitpass-hidden', !show);
  passcodePanel.classList.toggle('hidden', !show || !state.unlocked);
  if (!show) {
    passcodeInput.value = '';
  }
}

function stopScanLoop() {
  if (state.loopHandle) {
    clearTimeout(state.loopHandle);
    state.loopHandle = 0;
  }
}

function stopStream() {
  if (!state.stream) return;

  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  camera.srcObject = null;
}

function stopCamera() {
  state.cameraRequestId += 1;
  state.cameraStarting = false;
  state.scanning = false;
  stopScanLoop();
  stopStream();
  showCameraEmpty(true);
}

async function ensureDetector() {
  if (state.detector) return state.detector;

  if (!('BarcodeDetector' in globalThis)) {
    throw new Error('QR scanning is not available in this browser.');
  }

  if (typeof globalThis.BarcodeDetector.getSupportedFormats === 'function') {
    const formats = await globalThis.BarcodeDetector.getSupportedFormats();
    if (Array.isArray(formats) && formats.length && !formats.includes('qr_code')) {
      throw new Error('QR scanning is not available in this browser.');
    }
  }

  state.detector = new globalThis.BarcodeDetector({ formats: ['qr_code'] });
  return state.detector;
}

function updateCaption() {
  caption.textContent = '';
}

function setScanTriggerState(active) {
  stage.classList.toggle('splitpass-stage-actionable', active);
  caption.classList.toggle('splitpass-caption-actionable', active);
}

function renderRecentPanel() {
  recentPanel.classList.toggle('hidden', !state.unlocked || !state.recentEntries.length);
  if (!state.unlocked) return;
  if (!state.recentEntries.length) return;

  const siteLabel = secretItem.resolveSiteLabel(state.currentDomain);

  secretItem.renderList({
    root: recentList,
    classPrefix: 'splitpass',
    entries: state.recentEntries,
    faviconUrl: state.currentFaviconUrl,
    name: siteLabel,
    onPrimary: async (entry) => {
      if (!entry?.secret) return;

      const totp = globalThis.SplitPassTotp;
      if (totp?.isTotpUri(entry.secret)) {
        let code;
        try {
          code = await totp.generateTOTP(entry.secret);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'Unable to generate 2FA code.', 'error');
          return;
        }
        const filled = await fillActiveTotpCode(code);
        if (filled) {
          await vault.saveRecentSecret(entry.domain || state.currentDomain, entry.secret, 'popup_fill', entry.username || '');
          window.close();
          return;
        }
        const copied = await copySecretToClipboard(code);
        if (!copied) return;
        await vault.saveRecentSecret(entry.domain || state.currentDomain, entry.secret, 'popup_copy', entry.username || '');
        globalThis.alert('No 2FA field was found. The code is now in your clipboard.');
        window.close();
        return;
      }

      const filled = await fillActiveTabPassword(entry.secret, entry.username || '');
      if (filled) {
        await vault.saveRecentSecret(entry.domain || state.currentDomain, entry.secret, 'popup_fill', entry.username || '');
        window.close();
        return;
      }

      const copied = await copySecretToClipboard(entry.secret);
      if (!copied) return;
      await vault.saveRecentSecret(entry.domain || state.currentDomain, entry.secret, 'popup_copy', entry.username || '');
      globalThis.alert('No password field was found. The secret is now in your clipboard.');
      window.close();
    },
    onDelete: async (entry) => {
      if (!entry?.secret) return;
      await vault.removeRecentSecret(entry.domain || state.currentDomain, entry.secret, entry.username || '');
      await refreshRecentSecret();
    },
  });

  globalThis.SplitPassTotp?.syncTotpBadges(recentList);
}

function renderAuthPanel() {
  const isSetup = !state.vaultInitialized;
  authPanel.classList.toggle('hidden', state.unlocked);
  confirmWrap.classList.toggle('hidden', !isSetup);
  authSubmit.disabled = state.isAuthBusy;
  masterPasswordInput.disabled = state.isAuthBusy;
  masterPasswordConfirmInput.disabled = state.isAuthBusy;
  headerSubtitle.textContent = isSetup ? 'Create vault' : 'Unlock vault';
  masterPasswordInput.placeholder = isSetup ? 'Create password' : 'Enter password';
  masterPasswordConfirmInput.placeholder = 'Repeat password';
  authSubmit.textContent = isSetup ? 'Create vault' : 'Unlock';
  resetWrap.classList.toggle('hidden', isSetup);
  resetConfirm.classList.add('hidden');
  lockButton.classList.toggle('hidden', !state.unlocked);
}

function renderScannerState() {
  if (state.unlocked) {
    headerSubtitle.textContent = 'Scanner';
    setMainViewVisible(true);
    updateCaption();
    const shouldWaitForUserAction = state.recentEntries.length > 0 && !state.cameraStartedByUser && !state.scanning;
    setScanTriggerState(shouldWaitForUserAction);

    if (shouldWaitForUserAction) {
      stopCamera();
      togglePasscodePanel(false);
      showRetry(false);
      setEmptyState('Click to scan', 'Scan another QR if you need a new password.');
      showCameraEmpty(true);
      return;
    }

    setScanTriggerState(false);
    resetEmptyState();
    if (!state.scanning && !state.detectedValue) {
      startCamera({ userInitiated: state.cameraStartedByUser });
    }
    return;
  }

  setMainViewVisible(false);
  setScanTriggerState(false);
  stopCamera();
  togglePasscodePanel(false);
  showRetry(false);
}

async function copySecretToClipboard(secret) {
  const text = String(secret || '');

  // Modern Clipboard API — requires document focus (may fail in extension popups).
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through to execCommand fallback
  }

  // Fallback: execCommand('copy') via a temporary off-screen textarea.
  // Works even when the popup document has lost focus during QR processing.
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!ok) throw new Error('execCommand copy returned false');
    return true;
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'Unable to copy the secret.', 'error');
    return false;
  }
}

async function sendMessageToTab(tabId, payload) {
  const tabsApi = browserApi?.tabs;
  if (!tabsApi?.sendMessage || typeof tabId !== 'number') return null;

  try {
    const maybePromise = tabsApi.sendMessage(tabId, payload);
    if (maybePromise && typeof maybePromise.then === 'function') {
      return await maybePromise;
    }
  } catch (error) {
    if (!String(error?.message || '').includes('No matching signature')) {
      throw error;
    }
  }

  return await new Promise((resolve, reject) => {
    tabsApi.sendMessage(tabId, payload, (response) => {
      const runtimeError = browserApi?.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve(response);
    });
  });
}

async function fillActiveTotpCode(code) {
  const tabsApi = browserApi?.tabs;
  if (!tabsApi?.query) return false;

  let tabs = [];

  try {
    const maybePromise = tabsApi.query({ active: true, currentWindow: true });
    tabs = maybePromise && typeof maybePromise.then === 'function'
      ? await maybePromise
      : await new Promise((resolve, reject) => {
          tabsApi.query({ active: true, currentWindow: true }, (result) => {
            const runtimeError = browserApi?.runtime?.lastError;
            if (runtimeError) {
              reject(new Error(runtimeError.message));
              return;
            }
            resolve(result || []);
          });
        });
  } catch {
    tabs = [];
  }

  const activeTab = Array.isArray(tabs) ? tabs[0] : null;
  if (typeof activeTab?.id !== 'number') return false;

  try {
    const response = await sendMessageToTab(activeTab.id, {
      type: 'splitpass.fillTotp',
      code,
    });
    return !!response?.filled;
  } catch {
    return false;
  }
}

async function fillActiveTabPassword(secret, username = '') {
  const tabsApi = browserApi?.tabs;
  if (!tabsApi?.query) return false;

  let tabs = [];

  try {
    const maybePromise = tabsApi.query({ active: true, currentWindow: true });
    tabs = maybePromise && typeof maybePromise.then === 'function'
      ? await maybePromise
      : await new Promise((resolve, reject) => {
          tabsApi.query({ active: true, currentWindow: true }, (result) => {
            const runtimeError = browserApi?.runtime?.lastError;
            if (runtimeError) {
              reject(new Error(runtimeError.message));
              return;
            }
            resolve(result || []);
          });
        });
  } catch {
    tabs = [];
  }

  const activeTab = Array.isArray(tabs) ? tabs[0] : null;
  if (typeof activeTab?.id !== 'number') return false;

  try {
    const response = await sendMessageToTab(activeTab.id, {
      type: 'splitpass.fillPassword',
      secret,
      username,
    });

    return !!response?.filled;
  } catch {
    return false;
  }
}

async function notifyActiveTabVaultReady() {
  const tabsApi = browserApi?.tabs;
  if (!tabsApi?.query) return;

  let tabs = [];

  try {
    const maybePromise = tabsApi.query({ active: true, currentWindow: true });
    tabs = maybePromise && typeof maybePromise.then === 'function'
      ? await maybePromise
      : await new Promise((resolve, reject) => {
          tabsApi.query({ active: true, currentWindow: true }, (result) => {
            const runtimeError = browserApi?.runtime?.lastError;
            if (runtimeError) {
              reject(new Error(runtimeError.message));
              return;
            }
            resolve(result || []);
          });
        });
  } catch {
    tabs = [];
  }

  const activeTab = Array.isArray(tabs) ? tabs[0] : null;
  if (typeof activeTab?.id !== 'number') return;

  await sendMessageToTab(activeTab.id, {
    type: 'splitpass.refreshSitePanel',
  }).catch(() => undefined);
}

async function refreshRecentSecret() {
  if (!state.unlocked || !state.currentDomain) {
    state.recentEntries = [];
    renderRecentPanel();
    renderScannerState();
    return;
  }

  try {
    await vault.purgeExpiredSecrets();
    state.recentEntries = await vault.getRecentSecretsForDomain(state.currentDomain);
  } catch (error) {
    if (error?.code === 'ERR_VAULT_LOCKED') {
      state.unlocked = false;
      state.recentEntries = [];
    } else {
      setMessage(error instanceof Error ? error.message : 'Unable to load recent passwords.', 'error');
    }
  }

  renderRecentPanel();
  renderScannerState();
}

async function syncVaultState() {
  state.vaultInitialized = await vault.hasVault();
  state.unlocked = await vault.isUnlocked();
  if (!state.unlocked) {
    state.cameraStartedByUser = false;
    state.recentEntries = [];
  }

  renderAuthPanel();
  await refreshRecentSecret();
  renderScannerState();
}

async function setActiveDomain() {
  const tabsApi = browserApi.tabs;
  if (!tabsApi?.query) return;

  let tabs = [];

  try {
    const maybePromise = tabsApi.query({ active: true, currentWindow: true });
    tabs = maybePromise && typeof maybePromise.then === 'function'
      ? await maybePromise
      : await new Promise((resolve, reject) => {
          tabsApi.query({ active: true, currentWindow: true }, (result) => {
            const runtimeError = browserApi?.runtime?.lastError;
            if (runtimeError) {
              reject(new Error(runtimeError.message));
              return;
            }
            resolve(result || []);
          });
        });
  } catch {
    tabs = [];
  }

  const activeTab = Array.isArray(tabs) ? tabs[0] : null;
  state.currentUrl = String(activeTab?.url || '');
  state.currentDomain = vault.normalizeDomain(state.currentUrl);
  state.currentFaviconUrl = String(activeTab?.favIconUrl || '');
}

function handleUnsupportedResult(result) {
  if (result.code === 'unsupported_type') {
    setMessage('Only password QR values are supported right now.', 'warning');
    return;
  }

  setMessage('This QR is not a valid SplitPass password value.', 'error');
}

async function persistRecentSecret(secret, username = '') {
  if (!state.unlocked || !state.currentDomain) return;

  try {
    await vault.saveRecentSecret(state.currentDomain, secret, 'popup_scan', username);
    state.recentEntries = await vault.getRecentSecretsForDomain(state.currentDomain);
  } catch (error) {
    if (error?.code === 'ERR_VAULT_LOCKED') {
      state.unlocked = false;
      renderAuthPanel();
      renderScannerState();
      setMessage('The vault locked before the password could be saved.', 'warning');
      return;
    }

    setMessage(error instanceof Error ? error.message : 'The password was copied but not saved.', 'warning');
  }

  renderRecentPanel();
}

function setCopiedState() {
  state.cameraStartedByUser = !!state.recentEntries.length;
  stopCamera();
  togglePasscodePanel(false);
  setScanTriggerState(true);
  showRetry(false);
  setEmptyState('Saved', 'Click to scan again.');
  showCameraEmpty(true);
  clearMessage();
}

async function processTotpResult(result) {
  const totp = globalThis.SplitPassTotp;
  if (!totp) {
    setMessage('TOTP module not available.', 'error');
    return;
  }

  let code;
  try {
    code = await totp.generateTOTP(result.totpUri);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'Unable to generate 2FA code.', 'error');
    return;
  }

  const username = result.username || totp.getTotpLabel(result.totpUri);

  const filled = await fillActiveTotpCode(code);
  if (filled) {
    await persistRecentSecret(result.totpUri, username);
    window.close();
    return;
  }

  const copied = await copySecretToClipboard(code);
  if (!copied) return;

  await persistRecentSecret(result.totpUri, username);
  setCopiedState();
}

async function processRawValue(rawValue, passcode = '') {
  const result = globalThis.SplitPassDecoder.decode(rawValue, passcode);

  if (!result.ok) {
    if (result.code === 'requires_passcode') {
      state.detectedValue = rawValue;
      stopCamera();
      togglePasscodePanel(true);
      setMessage('Enter the 6-digit passcode.', 'warning');
      passcodeInput.focus();
      return;
    }

    if (result.code === 'invalid_passcode') {
      setMessage('Invalid passcode.', 'error');
      return;
    }

    handleUnsupportedResult(result);
    return;
  }

  togglePasscodePanel(false);

  if (result.totpUri) {
    await processTotpResult(result);
    return;
  }

  const username = result.username || '';
  const filled = await fillActiveTabPassword(result.secret, username);
  if (filled) {
    await persistRecentSecret(result.secret, username);
    window.close();
    return;
  }

  const copied = await copySecretToClipboard(result.secret);
  if (!copied) return;

  await persistRecentSecret(result.secret, username);
  setCopiedState();
}

async function scanFrame() {
  if (!state.scanning || !state.stream) return;

  try {
    if (camera.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const detector = await ensureDetector();
      const barcodes = await detector.detect(camera);

      if (barcodes.length > 0) {
        const rawValue = String(barcodes[0].rawValue || '').trim();

        if (rawValue) {
          stopCamera();
          await processRawValue(rawValue);
          return;
        }
      }
    }
  } catch (error) {
    stopCamera();
    setScanTriggerState(true);
    showRetry(false);
    setEmptyState('Scanner paused', 'Tap to try again.');
    setMessage(error instanceof Error ? error.message : 'Unable to scan the QR.', 'error');
    return;
  }

  state.loopHandle = window.setTimeout(scanFrame, 180);
}

async function startCamera({ userInitiated = false } = {}) {
  if (!state.unlocked || state.cameraStarting || state.scanning) return;

  const requestId = state.cameraRequestId + 1;
  state.cameraRequestId = requestId;
  state.cameraStarting = true;
  state.cameraStartedByUser = !!userInitiated || state.cameraStartedByUser || !state.recentEntries.length;
  togglePasscodePanel(false);
  setScanTriggerState(false);
  showRetry(false);
  clearMessage();
  resetEmptyState();
  state.detectedValue = '';

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera access is not available in this browser.');
    }

    await ensureDetector();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
      },
    });

    if (requestId !== state.cameraRequestId) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    stopStream();

    state.stream = stream;
    camera.srcObject = stream;
    await camera.play();
    if (requestId !== state.cameraRequestId) {
      stopCamera();
      return;
    }
    state.cameraStarting = false;
    state.scanning = true;
    showCameraEmpty(false);
    scanFrame();
  } catch (error) {
    state.cameraStarting = false;
    stopCamera();
    setScanTriggerState(true);
    showRetry(false);
    setEmptyState('Scanner paused', 'Tap to try again.');
    setMessage(error instanceof Error ? error.message : 'Unable to start the camera.', 'error');
  }
}

function handleRetry() {
  if (state.unlocked) {
    startCamera({ userInitiated: true });
  }
}

function handleScanAction() {
  if (!state.unlocked) return;
  if (!stage.classList.contains('splitpass-stage-actionable')) return;
  startCamera({ userInitiated: true });
}

function handlePasscodeInput() {
  const numericValue = passcodeInput.value.replace(/\D/g, '').slice(0, 6);
  if (numericValue !== passcodeInput.value) {
    passcodeInput.value = numericValue;
  }
}

async function handleUnlock() {
  const passcode = passcodeInput.value.replace(/\D/g, '');
  passcodeInput.value = passcode;

  if (passcode.length !== 6) {
    setMessage('The passcode must contain 6 digits.', 'error');
    return;
  }

  if (!state.detectedValue) {
    setMessage('No secure QR is waiting for passcode.', 'error');
    return;
  }

  await processRawValue(state.detectedValue, passcode);
}

async function performVaultReset(msg = 'Vault reset. Create a new password.') {
  await vault.resetVault();
  state.failedUnlockAttempts = 0;
  state.vaultInitialized = false;
  state.unlocked = false;
  state.recentEntries = [];
  masterPasswordInput.value = '';
  masterPasswordConfirmInput.value = '';
  renderAuthPanel();
  renderScannerState();
  renderRecentPanel();
  setMessage(msg, 'warning');
}

async function handleAuthSubmit() {
  const masterPassword = String(masterPasswordInput.value || '');
  const confirmation = String(masterPasswordConfirmInput.value || '');
  const isSetup = !state.vaultInitialized;

  if (masterPassword.length < vault.MIN_MASTER_PASSWORD_LENGTH) {
    setMessage(`The master password must contain at least ${vault.MIN_MASTER_PASSWORD_LENGTH} characters.`, 'error');
    return;
  }

  if (isSetup && masterPassword !== confirmation) {
    setMessage('The confirmation password does not match.', 'error');
    return;
  }

  state.isAuthBusy = true;
  renderAuthPanel();
  clearMessage();

  try {
    if (isSetup) {
      await vault.initializeVault(masterPassword);
    } else {
      await vault.unlockVault(masterPassword);
    }

    state.failedUnlockAttempts = 0;
    masterPasswordInput.value = '';
    masterPasswordConfirmInput.value = '';
    await syncVaultState();
    await notifyActiveTabVaultReady();
    clearMessage();
  } catch (error) {
    if (!isSetup && error?.code === 'ERR_VAULT_UNLOCK_FAILED') {
      state.failedUnlockAttempts += 1;
      setMessage('Wrong password. Your vault stays safe — try again.', 'error');
      return;
    }

    setMessage(error instanceof Error ? error.message : 'Unable to unlock the vault.', 'error');
  } finally {
    state.isAuthBusy = false;
    renderAuthPanel();
  }
}

resetTrigger.addEventListener('click', () => {
  resetConfirm.classList.toggle('hidden');
});
resetCancel.addEventListener('click', () => {
  resetConfirm.classList.add('hidden');
});
resetDo.addEventListener('click', async () => {
  await performVaultReset('Vault reset. Create a new password.');
});

retryButton.addEventListener('click', handleRetry);
closeButton.addEventListener('click', () => window.close());
lockButton.addEventListener('click', async () => {
  stopCamera();
  await vault.lockVault();
  state.unlocked = false;
  state.cameraStartedByUser = false;
  state.recentEntries = [];
  renderAuthPanel();
  renderRecentPanel();
  renderScannerState();
  masterPasswordInput.focus();
});
passcodeInput.addEventListener('input', handlePasscodeInput);
passcodeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleUnlock();
  }
});
unlockButton.addEventListener('click', handleUnlock);
authSubmit.addEventListener('click', handleAuthSubmit);
stage.addEventListener('click', handleScanAction);
caption.addEventListener('click', handleScanAction);
masterPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAuthSubmit();
  }
});
masterPasswordConfirmInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAuthSubmit();
  }
});
window.addEventListener('beforeunload', stopCamera);
window.addEventListener('beforeunload', () => {
  stopPopupHeartbeat();
  setPopupOpenState(false);
});
window.addEventListener('pagehide', () => {
  stopPopupHeartbeat();
  setPopupOpenState(false);
});

(async function bootstrapPopup() {
  await setPopupOpenState(true);
  startPopupHeartbeat();
  renderAuthPanel();
  renderRecentPanel();
  await setActiveDomain();
  await syncVaultState();
})();
