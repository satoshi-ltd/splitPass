import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_THEME, STORAGE_DOMAIN } from '../App.constants';
import { detectDeviceLanguage } from '../modules';

const PUBLIC_SETTINGS_KEY = `${STORAGE_DOMAIN}.public-settings`;

const DEFAULT_PUBLIC_SETTINGS = {
  biometricUnlockEnabled: false,
  language: undefined,
  onboarded: false,
  reminders: [1],
  theme: DEFAULT_THEME,
  websiteFaviconsEnabled: true,
};

const normalizePublicSettings = (value = {}) => ({
  ...DEFAULT_PUBLIC_SETTINGS,
  ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}),
  language: value?.language || detectDeviceLanguage(),
  reminders: Array.isArray(value?.reminders) ? value.reminders : DEFAULT_PUBLIC_SETTINGS.reminders,
  theme: value?.theme || DEFAULT_THEME,
  websiteFaviconsEnabled: value?.websiteFaviconsEnabled !== false,
});

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
