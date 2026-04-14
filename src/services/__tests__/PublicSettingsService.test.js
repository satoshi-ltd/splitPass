jest.mock('../../modules', () => ({ detectDeviceLanguage: () => 'en' }));
jest.mock('../../theme', () => ({
  normalizeThemePreference: (value = 'light') => {
    const v = `${value || 'light'}`.toLowerCase();
    return ['light', 'dark', 'system'].includes(v) ? v : 'light';
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PublicSettingsService } from '../PublicSettingsService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.setItem.mockResolvedValue(undefined);
  AsyncStorage.removeItem.mockResolvedValue(undefined);
});

describe('PublicSettingsService', () => {
  describe('load', () => {
    it('returns default settings when storage is empty', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const settings = await PublicSettingsService.load();
      expect(settings).toMatchObject({
        autoLockImmediatelyEnabled: false,
        autoLockSeconds: 300,
        biometricUnlockEnabled: false,
        clipboardAutoClearEnabled: true,
        externalSharingEnabled: false,
        onboarded: false,
        reminders: [1],
        websiteFaviconsEnabled: false,
      });
    });

    it('merges stored values over defaults', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ onboarded: true, autoLockSeconds: 600 }),
      );
      const settings = await PublicSettingsService.load();
      expect(settings.onboarded).toBe(true);
      expect(settings.autoLockSeconds).toBe(600);
    });

    it('falls back to defaults when JSON is malformed', async () => {
      AsyncStorage.getItem.mockResolvedValue('not-json{{{');
      const settings = await PublicSettingsService.load();
      expect(settings.autoLockSeconds).toBe(300);
    });

    it('falls back to defaults when AsyncStorage rejects', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('storage error'));
      const settings = await PublicSettingsService.load();
      expect(settings.clipboardAutoClearEnabled).toBe(true);
    });

    it('normalises autoLockSeconds — ignores non-positive values', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ autoLockSeconds: -10 }));
      const settings = await PublicSettingsService.load();
      expect(settings.autoLockSeconds).toBe(300);
    });

    it('forces clipboardAutoClearEnabled to false only when explicitly set', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ clipboardAutoClearEnabled: false }));
      const settings = await PublicSettingsService.load();
      expect(settings.clipboardAutoClearEnabled).toBe(false);
    });

    it('forces externalSharingEnabled to false unless exactly true', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ externalSharingEnabled: 'yes' }));
      const settings = await PublicSettingsService.load();
      expect(settings.externalSharingEnabled).toBe(false);
    });
  });

  describe('save', () => {
    it('persists normalised settings and returns them', async () => {
      const result = await PublicSettingsService.save({ onboarded: true, autoLockSeconds: 60 });
      expect(result.onboarded).toBe(true);
      expect(result.autoLockSeconds).toBe(60);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('writes JSON to the correct storage key', async () => {
      await PublicSettingsService.save({ onboarded: true });
      const [key, value] = AsyncStorage.setItem.mock.calls[0];
      expect(key).toContain('public-settings');
      expect(() => JSON.parse(value)).not.toThrow();
    });

    it('normalises invalid inputs before saving', async () => {
      const result = await PublicSettingsService.save({ autoLockSeconds: -99, externalSharingEnabled: 'maybe' });
      expect(result.autoLockSeconds).toBe(300);
      expect(result.externalSharingEnabled).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes the settings key from AsyncStorage', async () => {
      await PublicSettingsService.clear();
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      const [key] = AsyncStorage.removeItem.mock.calls[0];
      expect(key).toContain('public-settings');
    });
  });
});
