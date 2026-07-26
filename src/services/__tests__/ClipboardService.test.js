import * as Clipboard from 'expo-clipboard';

import { ClipboardService } from '../ClipboardService';

jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn(),
  setStringAsync: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  Clipboard.setStringAsync.mockResolvedValue(undefined);
  Clipboard.getStringAsync.mockResolvedValue('');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ClipboardService', () => {
  describe('copyWithAutoClear', () => {
    it('writes the value to the clipboard', async () => {
      await ClipboardService.copyWithAutoClear('hunter2');
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('hunter2');
    });

    it('returns true on success', async () => {
      const result = await ClipboardService.copyWithAutoClear('abc');
      expect(result).toBe(true);
    });

    it('schedules an auto-clear after the default 10s TTL', async () => {
      Clipboard.getStringAsync.mockResolvedValue('secret');
      await ClipboardService.copyWithAutoClear('secret');

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(Clipboard.setStringAsync).toHaveBeenLastCalledWith('');
    });

    it('does not clear when a different value is on the clipboard', async () => {
      Clipboard.getStringAsync.mockResolvedValue('something-else');
      await ClipboardService.copyWithAutoClear('secret');

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      const calls = Clipboard.setStringAsync.mock.calls;
      const clearedEmpty = calls.some((call) => call[0] === '');
      expect(clearedEmpty).toBe(false);
    });

    it('respects a custom ttlMs', async () => {
      Clipboard.getStringAsync.mockResolvedValue('val');
      await ClipboardService.copyWithAutoClear('val', { ttlMs: 5000 });

      jest.advanceTimersByTime(4999);
      await Promise.resolve();
      expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await Promise.resolve();
      expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(2);
    });

    it('skips scheduling when ttlMs is 0', async () => {
      await ClipboardService.copyWithAutoClear('val', { ttlMs: 0 });
      jest.advanceTimersByTime(30000);
      await Promise.resolve();
      expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearPendingClipboard', () => {
    it('clears the clipboard immediately', async () => {
      await ClipboardService.clearPendingClipboard();
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('');
    });

    it('cancels the pending auto-clear timer', async () => {
      Clipboard.getStringAsync.mockResolvedValue('secret');
      await ClipboardService.copyWithAutoClear('secret');
      await ClipboardService.clearPendingClipboard();

      const callsBefore = Clipboard.setStringAsync.mock.calls.length;
      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(Clipboard.setStringAsync.mock.calls.length).toBe(callsBefore);
    });
  });

  describe('reconcilePendingClipboard', () => {
    it('clears once the TTL deadline passed while the timer was suspended', async () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
      Clipboard.getStringAsync.mockResolvedValue('secret');
      await ClipboardService.copyWithAutoClear('secret');

      nowSpy.mockReturnValue(1_011_000);
      const cleared = await ClipboardService.reconcilePendingClipboard();

      expect(cleared).toBe(true);
      expect(Clipboard.setStringAsync).toHaveBeenLastCalledWith('');
      nowSpy.mockRestore();
    });

    it('does nothing before the deadline', async () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
      await ClipboardService.copyWithAutoClear('secret');

      nowSpy.mockReturnValue(1_005_000);
      const cleared = await ClipboardService.reconcilePendingClipboard();

      expect(cleared).toBe(false);
      nowSpy.mockRestore();
    });

    it('does not wipe a value the user copied elsewhere after the deadline', async () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
      Clipboard.getStringAsync.mockResolvedValue('user-copied-something-else');
      await ClipboardService.copyWithAutoClear('secret');

      nowSpy.mockReturnValue(1_011_000);
      await ClipboardService.reconcilePendingClipboard();

      const clearedEmpty = Clipboard.setStringAsync.mock.calls.some((call) => call[0] === '');
      expect(clearedEmpty).toBe(false);
      nowSpy.mockRestore();
    });
  });
});
