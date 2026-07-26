import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_THEME, STORAGE_DOMAIN } from '../App.constants';
import { detectDeviceLanguage } from '../modules';
import { normalizeThemePreference } from '../theme';

const PUBLIC_SETTINGS_KEY = `${STORAGE_DOMAIN}.public-settings`;

const DEFAULT_PUBLIC_SETTINGS = {
  autoLockImmediatelyEnabled: true,
  autoLockSeconds: 300,
  biometricUnlockEnabled: false,
  clipboardAutoClearEnabled: true,
  externalSharingEnabled: false,
  language: undefined,
  onboarded: false,
  reminders: [1],
  theme: DEFAULT_THEME,
  websiteFaviconsEnabled: false,
};

const normalizePublicSettings = (value = {}) => {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return {
    autoLockImmediatelyEnabled: source.autoLockImmediatelyEnabled !== false,
    autoLockSeconds:
      Number.isFinite(Number(source.autoLockSeconds)) && Number(source.autoLockSeconds) > 0
        ? Number(source.autoLockSeconds)
        : DEFAULT_PUBLIC_SETTINGS.autoLockSeconds,
    biometricUnlockEnabled: source.biometricUnlockEnabled === true,
    clipboardAutoClearEnabled: source.clipboardAutoClearEnabled !== false,
    externalSharingEnabled: source.externalSharingEnabled === true,
    language: source.language || detectDeviceLanguage(),
    onboarded: source.onboarded === true,
    reminders: Array.isArray(source.reminders) ? source.reminders : DEFAULT_PUBLIC_SETTINGS.reminders,
    theme: normalizeThemePreference(source.theme || DEFAULT_THEME),
    websiteFaviconsEnabled: source.websiteFaviconsEnabled === true,
  };
};

const load = async () => {
  try {
    const rawValue = await AsyncStorage.getItem(PUBLIC_SETTINGS_KEY);

    if (!rawValue) return normalizePublicSettings();

    return normalizePublicSettings(JSON.parse(rawValue));
  } catch {
    return normalizePublicSettings();
  }
};

const save = async (value = {}) => {
  const nextSettings = normalizePublicSettings(value);

  await AsyncStorage.setItem(PUBLIC_SETTINGS_KEY, JSON.stringify(nextSettings));

  return nextSettings;
};

const clear = async () => {
  await AsyncStorage.removeItem(PUBLIC_SETTINGS_KEY);
};

const PublicSettingsService = {
  clear,
  load,
  save,
};

export { PublicSettingsService };
