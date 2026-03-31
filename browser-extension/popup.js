const popupRoot = document.getElementById('popupRoot');
const scannerUi = globalThis.SplitPassScannerUi.createShell();

popupRoot.appendChild(scannerUi.root);

const camera = scannerUi.elements.camera;
const cameraEmpty = scannerUi.elements.cameraEmpty;
const cameraEmptyCopy = scannerUi.elements.cameraEmptyCopy;
const cameraEmptyTitle = scannerUi.elements.cameraEmptyTitle;
const closeButton = scannerUi.elements.closeButton;
const retryButton = scannerUi.elements.retryButton;
const passcodePanel = scannerUi.elements.passcodePanel;
const passcodeInput = scannerUi.elements.passcodeInput;
const unlockButton = scannerUi.elements.unlockButton;
const message = scannerUi.elements.message;

const defaultEmptyState = {
  copy: 'If this is your first scan, the browser may ask for permission now.',
  title: 'Starting camera',
};

const state = {
  detectedValue: '',
  detector: null,
  loopHandle: 0,
  scanning: false,
  stream: null,
};

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
}

function togglePasscodePanel(show) {
  passcodePanel.classList.toggle('splitpass-hidden', !show);
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

function setReadOnlyClipboardState() {
  stopCamera();
  togglePasscodePanel(false);
  showRetry(false);
  setEmptyState('Copied', 'The secret is already in your clipboard.');
  showCameraEmpty(true);
  clearMessage();
}

async function copySecretToClipboard(secret) {
  try {
    await navigator.clipboard.writeText(String(secret || ''));
    setReadOnlyClipboardState();
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'Unable to copy the secret.', 'error');
  }
}

function handleUnsupportedResult(result) {
  if (result.code === 'unsupported_type') {
    setMessage('Only password QR values are supported right now.', 'warning');
    return;
  }

  setMessage('This QR is not a valid SplitPass password value.', 'error');
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
  await copySecretToClipboard(result.secret);
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
    showRetry(true);
    setMessage(error instanceof Error ? error.message : 'Unable to scan the QR.', 'error');
    return;
  }

  state.loopHandle = window.setTimeout(scanFrame, 180);
}

async function startCamera() {
  togglePasscodePanel(false);
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

    stopStream();

    state.stream = stream;
    camera.srcObject = stream;
    await camera.play();
    state.scanning = true;
    showCameraEmpty(false);
    scanFrame();
  } catch (error) {
    stopCamera();
    showRetry(true);
    setMessage(error instanceof Error ? error.message : 'Unable to start the camera.', 'error');
  }
}

function handleRetry() {
  startCamera();
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

closeButton.addEventListener('click', () => window.close());
retryButton.addEventListener('click', handleRetry);
passcodeInput.addEventListener('input', handlePasscodeInput);
passcodeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleUnlock();
  }
});
unlockButton.addEventListener('click', handleUnlock);
window.addEventListener('beforeunload', stopCamera);

startCamera();
