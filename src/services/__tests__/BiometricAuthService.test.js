jest.mock('expo-local-authentication');
jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => true),
  setItem: jest.fn(async () => true),
}));
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { STORAGE_DOMAIN } from '../../App.constants';
import { BiometricAuthService } from '../BiometricAuthService';

const KEYCHAIN_SERVICE = `${STORAGE_DOMAIN}.biometric`;

describe('BiometricAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    LocalAuthentication.getEnrolledLevelAsync.mockResolvedValue(LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG);
    SecureStore.canUseBiometricAuthentication.mockResolvedValue(true);
    SecureStore.setItemAsync.mockResolvedValue(true);
    SecureStore.getItemAsync.mockResolvedValue('vault-passphrase');
    SecureStore.deleteItemAsync.mockResolvedValue(true);
  });

  it('reports availability when strong biometrics are enrolled', async () => {
    const availability = await BiometricAuthService.isAvailable();

    expect(availability.available).toBe(true);
    expect(availability.strongBiometrics).toBe(true);
    expect(availability.supportedAuthenticationTypes).toEqual([LocalAuthentication.AuthenticationType.FINGERPRINT]);
  });

  it('reports unavailable when biometrics are not enrolled', async () => {
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(false);

    const availability = await BiometricAuthService.isAvailable();

    expect(availability.available).toBe(false);
    expect(availability.enrolled).toBe(false);
  });

  it('reports unavailable when secure store cannot protect biometrics', async () => {
    SecureStore.canUseBiometricAuthentication.mockResolvedValue(false);

    const availability = await BiometricAuthService.isAvailable();

    expect(availability.available).toBe(false);
    expect(availability.secureStoreSupported).toBe(false);
  });

  it('stores the current master passphrase behind system authentication', async () => {
    await BiometricAuthService.savePassphrase('vault-passphrase');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${STORAGE_DOMAIN}.biometric.passphrase`,
      'vault-passphrase',
      expect.objectContaining({
        authenticationPrompt: 'Authenticate to enable biometric unlock.',
        keychainService: KEYCHAIN_SERVICE,
        requireAuthentication: true,
      }),
    );
  });

  it('reads the saved master passphrase through secure store', async () => {
    const passphrase = await BiometricAuthService.readPassphrase();

    expect(passphrase).toBe('vault-passphrase');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      `${STORAGE_DOMAIN}.biometric.passphrase`,
      expect.objectContaining({
        authenticationPrompt: 'Unlock SplitPass with biometrics.',
        keychainService: KEYCHAIN_SERVICE,
        requireAuthentication: true,
      }),
    );
  });

  it('clears the stored credential when the secure store entry is invalidated', async () => {
    SecureStore.getItemAsync.mockResolvedValue(null);

    await expect(BiometricAuthService.readPassphrase()).rejects.toMatchObject({
      code: 'ERR_BIOMETRIC_INVALIDATED',
    });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(`${STORAGE_DOMAIN}.biometric.passphrase`, {
      keychainService: KEYCHAIN_SERVICE,
    });
  });

  it('removes the saved credential on demand', async () => {
    await BiometricAuthService.clearPassphrase();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(`${STORAGE_DOMAIN}.biometric.passphrase`, {
      keychainService: KEYCHAIN_SERVICE,
    });
  });
});
