import * as Clipboard from 'expo-clipboard';

const DEFAULT_TTL_MS = 10000;

let clearTimer;
let lastCopiedValue = '';

const scheduleClear = (value = '', ttlMs = DEFAULT_TTL_MS) => {
  if (clearTimer) clearTimeout(clearTimer);

  clearTimer = setTimeout(async () => {
    try {
      const currentValue = await Clipboard.getStringAsync();

      if (currentValue === value) await Clipboard.setStringAsync('');
    } catch {
      return;
    } finally {
      if (lastCopiedValue === value) lastCopiedValue = '';
      clearTimer = undefined;
    }
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
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = undefined;
  lastCopiedValue = '';
  await Clipboard.setStringAsync('');
};

const ClipboardService = {
  clearPendingClipboard,
  copyWithAutoClear,
};

export { ClipboardService };
