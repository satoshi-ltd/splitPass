import * as Clipboard from 'expo-clipboard';

const DEFAULT_TTL_MS = 10000;

let clearTimer;
let clearDeadline = 0;
let lastCopiedValue = '';

const wipeIfCurrent = async (value = '') => {
  try {
    const currentValue = await Clipboard.getStringAsync();

    if (currentValue === value) await Clipboard.setStringAsync('');
  } catch {
    return;
  }
};

const resetPending = () => {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = undefined;
  clearDeadline = 0;
  lastCopiedValue = '';
};

const scheduleClear = (value = '', ttlMs = DEFAULT_TTL_MS) => {
  if (clearTimer) clearTimeout(clearTimer);
  clearDeadline = Date.now() + ttlMs;

  clearTimer = setTimeout(async () => {
    const pending = value;
    resetPending();
    await wipeIfCurrent(pending);
  }, ttlMs);
};

const copyWithAutoClear = async (value = '', options = {}) => {
  const ttlMs = options?.ttlMs === 0 ? 0 : Number(options?.ttlMs) > 0 ? Number(options.ttlMs) : DEFAULT_TTL_MS;
  const nextValue = `${value}`;

  lastCopiedValue = nextValue;
  await Clipboard.setStringAsync(nextValue);
  if (ttlMs > 0) scheduleClear(nextValue, ttlMs);

  return true;
};

const clearPendingClipboard = async () => {
  resetPending();
  await Clipboard.setStringAsync('');
};

const reconcilePendingClipboard = async () => {
  if (!clearDeadline || Date.now() < clearDeadline) return false;

  const pending = lastCopiedValue;
  resetPending();
  await wipeIfCurrent(pending);

  return true;
};

const ClipboardService = {
  clearPendingClipboard,
  copyWithAutoClear,
  reconcilePendingClipboard,
};

export { ClipboardService };
