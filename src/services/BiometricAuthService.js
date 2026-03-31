/* global __DEV__ */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { STORAGE_DOMAIN } from '../App.constants';

const BIOMETRIC_KEY = `${STORAGE_DOMAIN}.biometric.passphrase`;
const BIOMETRIC_SERVICE = `${STORAGE_DOMAIN}.biometric`;
const BIOMETRIC_DEV_KEY = `${STORAGE_DOMAIN}.biometric.dev-passphrase`;
const AUTH_PROMPT_ENABLE = 'Authenticate to enable biometric unlock.';
const AUTH_PROMPT_UNLOCK = 'Unlock SplitPass with biometrics.';
const isDevMode = typeof __DEV__ !== 'undefined' && __DEV__;

const createError = (message, code) => {
  const error = new Error(message);
  error.code = code;

  return error;
};

const normalizeBiometricError = (error) => {
  if (error?.code) return error;

  const message = `${error?.message || ''}`.toLowerCase();

  if (message.includes('cancel')) return createError('Biometric authentication was cancelled.', 'ERR_BIOMETRIC_CANCELED');
  if (message.includes('not available')) return createError('Biometric authentication is not available.', 'ERR_BIOMETRIC_NOT_AVAILABLE');
  if (message.includes('not enrolled')) return createError('No biometric credentials are enrolled on this device.', 'ERR_BIOMETRIC_NOT_ENROLLED');

  return createError(error?.message || 'Biometric authentication failed.', 'ERR_BIOMETRIC_FAILED');
};

const getAvailability = async () => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      enrolled: false,
      hasHardware: false,
      supportedAuthenticationTypes: [],
    };
  }

  const [hasHardware, enrolled, supportedAuthenticationTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  const getEnrolledLevelAsync = LocalAuthentication.getEnrolledLevelAsync;
  const securityLevel = getEnrolledLevelAsync ? await getEnrolledLevelAsync() : LocalAuthentication.SecurityLevel?.NONE || 0;
  const strongLevel = LocalAuthentication.SecurityLevel?.BIOMETRIC_STRONG;
  const strongBiometrics = strongLevel ? securityLevel >= strongLevel : supportedAuthenticationTypes.length > 0;
  const secureStoreSupported = SecureStore.canUseBiometricAuthentication
    ? await SecureStore.canUseBiometricAuthentication()
    : strongBiometrics;
  const available = hasHardware && enrolled && supportedAuthenticationTypes.length > 0 && strongBiometrics && secureStoreSupported;

  if (available || !isDevMode) {
    return {
      available,
      enrolled,
      hasHardware,
      securityLevel,
      secureStoreSupported,
      strongBiometrics,
      supportedAuthenticationTypes,
    };
  }

  return {
    available: true,
    enrolled,
    hasHardware,
    mocked: true,
    securityLevel,
    secureStoreSupported,
    strongBiometrics,
    supportedAuthenticationTypes,
  };
};

const secureStoreOptions = (authenticationPrompt) => ({
  authenticationPrompt,
  keychainService: BIOMETRIC_SERVICE,
  requireAuthentication: true,
});

const ensureAvailability = async () => {
  const availability = await getAvailability();

  if (availability.available) return availability;

  if (!availability.hasHardware) throw createError('Biometric authentication is not available.', 'ERR_BIOMETRIC_NOT_AVAILABLE');
  if (!availability.enrolled) throw createError('No biometric credentials are enrolled on this device.', 'ERR_BIOMETRIC_NOT_ENROLLED');
  if (!availability.strongBiometrics || !availability.secureStoreSupported)
    throw createError('Strong biometric authentication is required.', 'ERR_BIOMETRIC_WEAK');

  throw createError('Biometric authentication is not available.', 'ERR_BIOMETRIC_NOT_AVAILABLE');
};

const savePassphrase = async (passphrase = '') => {
  if (!passphrase) throw createError('Master passphrase required.', 'ERR_BIOMETRIC_PASSPHRASE_REQUIRED');

  const availability = await ensureAvailability();

  if (availability.mocked) {
    await AsyncStorage.setItem(BIOMETRIC_DEV_KEY, passphrase);

    return true;
  }

  await SecureStore.setItemAsync(BIOMETRIC_KEY, passphrase, secureStoreOptions(AUTH_PROMPT_ENABLE));

  return true;
};

const readPassphrase = async () => {
  const availability = await ensureAvailability();

  try {
    if (availability.mocked) {
      const passphrase = await AsyncStorage.getItem(BIOMETRIC_DEV_KEY);

      if (passphrase) return passphrase;

      throw createError('Biometric credentials are no longer available.', 'ERR_BIOMETRIC_INVALIDATED');
    }

    const passphrase = await SecureStore.getItemAsync(BIOMETRIC_KEY, secureStoreOptions(AUTH_PROMPT_UNLOCK));

    if (passphrase) return passphrase;

    await SecureStore.deleteItemAsync(BIOMETRIC_KEY, { keychainService: BIOMETRIC_SERVICE });
    throw createError('Biometric credentials are no longer available.', 'ERR_BIOMETRIC_INVALIDATED');
  } catch (error) {
    throw normalizeBiometricError(error);
  }
};

const clearPassphrase = async () => {
  await AsyncStorage.removeItem(BIOMETRIC_DEV_KEY);

  if (Platform.OS === 'web') return false;

  await SecureStore.deleteItemAsync(BIOMETRIC_KEY, { keychainService: BIOMETRIC_SERVICE });

  return true;
};

const BiometricAuthService = {
  clearPassphrase,
  isAvailable: getAvailability,
  readPassphrase,
  savePassphrase,
};

export { BiometricAuthService };
