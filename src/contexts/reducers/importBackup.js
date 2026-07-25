import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../../App.constants';
import { detectDeviceLanguage, setLanguage } from '../../modules';
import { BiometricAuthService, NotificationsService, PublicSettingsService } from '../../services';
import { normalizeThemePreference, resolveAppTheme } from '../../theme';
import { DEFAULTS } from '../store.constants';

export const importBackup = async ({ format = 'legacy', payload = {} } = {}, options = {}, [state, setState]) => {
  const { store } = state;
  const previousPassphrase = store.sessionPassphrase;
  const passphrase = options?.passphrase || previousPassphrase;
  const decrypted = format === 'encrypted' ? await store.decryptBackup(payload, passphrase) : payload;
  const nextPassphrase = format === 'encrypted' ? passphrase : previousPassphrase || passphrase;
  const passphraseChanged = !!previousPassphrase && nextPassphrase !== previousPassphrase;
  const nextSecrets = Array.isArray(decrypted?.secrets) ? decrypted.secrets : DEFAULTS.secrets;
  const incomingSettings = decrypted?.settings || {};
  const nextSettings = {
    ...DEFAULTS.settings,
    ...(incomingSettings || {}),
    language: incomingSettings?.language || state.settings?.language || detectDeviceLanguage(),
    theme: normalizeThemePreference(incomingSettings?.theme || state.settings?.theme || DEFAULT_THEME),
  };

  if (passphraseChanged && nextSettings.biometricUnlockEnabled) {
    try {
      await BiometricAuthService.savePassphrase(nextPassphrase);
    } catch {
      await BiometricAuthService.clearPassphrase();
      nextSettings.biometricUnlockEnabled = false;
    }
  }

  await store.replaceAll(
    {
      secrets: nextSecrets,
      settings: nextSettings,
    },
    nextPassphrase,
  );

  StyleSheet.build(resolveAppTheme(nextSettings.theme));
  await setLanguage(nextSettings.language);
  await NotificationsService.reminders(nextSettings.reminders);
  await PublicSettingsService.save(nextSettings);

  setState({
    ...state,
    secrets: nextSecrets,
    settings: nextSettings,
    security: store.security,
  });

  return true;
};
