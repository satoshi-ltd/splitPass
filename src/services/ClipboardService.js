import * as Clipboard from 'expo-clipboard';

let clearTimer;
let lastCopiedValue = '';

const scheduleClear = (value = '', ttlMs = 30000) => {
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
  const ttlMs = Number(options?.ttlMs) > 0 ? Number(options.ttlMs) : 30000;
  const nextValue = `${value}`;

  lastCopiedValue = nextValue;
  await Clipboard.setStringAsync(nextValue);
  scheduleClear(nextValue, ttlMs);

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
