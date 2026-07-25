jest.mock('react-native-extended-stylesheet', () => ({ build: jest.fn() }));
jest.mock('../../../App.constants', () => ({ DEFAULT_THEME: 'light' }));
jest.mock('../../../modules', () => ({
  detectDeviceLanguage: () => 'en',
  setLanguage: jest.fn(async () => {}),
}));
jest.mock('../../../services', () => ({
  BiometricAuthService: { savePassphrase: jest.fn(async () => true), clearPassphrase: jest.fn(async () => true) },
  NotificationsService: { reminders: jest.fn(async () => {}) },
  PublicSettingsService: { save: jest.fn(async () => {}) },
}));
jest.mock('../../../theme', () => ({
  normalizeThemePreference: (theme) => theme || 'light',
  resolveAppTheme: () => ({}),
}));

import { BiometricAuthService } from '../../../services';
import { importBackup } from '../importBackup';

const createStore = ({ sessionPassphrase, settings = {} } = {}) => {
  const decryptedData = {
    secrets: [{ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' }],
    settings,
  };

  return {
    sessionPassphrase,
    security: { configured: true, legacy: false, unlocked: true },
    decryptBackup: jest.fn(async () => decryptedData),
    replaceAll: jest.fn(async () => decryptedData),
  };
};

describe('importBackup reducer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('re-encrypts the vault with the passphrase that decrypted an encrypted backup', async () => {
    const store = createStore({ sessionPassphrase: 'old-master-2026' });
    const state = { store, settings: { language: 'en', theme: 'light' } };

    await importBackup({ format: 'encrypted', payload: { v: 3 } }, { passphrase: 'new-master-2026' }, [
      state,
      jest.fn(),
    ]);

    expect(store.decryptBackup).toHaveBeenCalledWith({ v: 3 }, 'new-master-2026');
    expect(store.replaceAll).toHaveBeenCalledWith(expect.any(Object), 'new-master-2026');
  });

  it('keeps the current session passphrase for legacy plaintext imports', async () => {
    const store = createStore({ sessionPassphrase: 'old-master-2026' });
    const state = { store, settings: { language: 'en', theme: 'light' } };

    await importBackup({ format: 'legacy', payload: { secrets: [], settings: {} } }, {}, [state, jest.fn()]);

    expect(store.decryptBackup).not.toHaveBeenCalled();
    expect(store.replaceAll).toHaveBeenCalledWith(expect.any(Object), 'old-master-2026');
  });

  it('migrates the biometric passphrase when a passphrase change enables biometrics', async () => {
    const store = createStore({ sessionPassphrase: 'old-master-2026', settings: { biometricUnlockEnabled: true } });
    const state = { store, settings: { language: 'en', theme: 'light' } };

    await importBackup({ format: 'encrypted', payload: { v: 3 } }, { passphrase: 'new-master-2026' }, [
      state,
      jest.fn(),
    ]);

    expect(BiometricAuthService.savePassphrase).toHaveBeenCalledWith('new-master-2026');
    expect(store.replaceAll).toHaveBeenCalledWith(
      expect.objectContaining({ settings: expect.objectContaining({ biometricUnlockEnabled: true }) }),
      'new-master-2026',
    );
  });

  it('disables biometrics when re-saving the migrated passphrase fails', async () => {
    BiometricAuthService.savePassphrase.mockRejectedValueOnce(new Error('cancelled'));
    const store = createStore({ sessionPassphrase: 'old-master-2026', settings: { biometricUnlockEnabled: true } });
    const state = { store, settings: { language: 'en', theme: 'light' } };

    await importBackup({ format: 'encrypted', payload: { v: 3 } }, { passphrase: 'new-master-2026' }, [
      state,
      jest.fn(),
    ]);

    expect(BiometricAuthService.clearPassphrase).toHaveBeenCalled();
    expect(store.replaceAll).toHaveBeenCalledWith(
      expect.objectContaining({ settings: expect.objectContaining({ biometricUnlockEnabled: false }) }),
      'new-master-2026',
    );
  });

  it('does not touch biometrics when the passphrase does not change', async () => {
    const store = createStore({ sessionPassphrase: 'same-master-2026', settings: { biometricUnlockEnabled: true } });
    const state = { store, settings: { language: 'en', theme: 'light' } };

    await importBackup({ format: 'encrypted', payload: { v: 3 } }, { passphrase: 'same-master-2026' }, [
      state,
      jest.fn(),
    ]);

    expect(BiometricAuthService.savePassphrase).not.toHaveBeenCalled();
    expect(BiometricAuthService.clearPassphrase).not.toHaveBeenCalled();
  });
});
