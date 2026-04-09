import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../../App.constants';
import { detectDeviceLanguage, setLanguage } from '../../modules';
import { BiometricAuthService, PublicSettingsService } from '../../services';
import { resolveAppTheme } from '../../theme';

export const unlockStore = async (passphrase = '', [state, setState]) => {
  const nextData = await state.store.unlock(passphrase);
  let nextSettings = {
    ...nextData.settings,
    language: nextData.settings?.language || detectDeviceLanguage(),
    theme: nextData.settings?.theme || DEFAULT_THEME,
  };

  if (state.store.lastUnlockMigrated && nextSettings.biometricUnlockEnabled) {
    nextSettings = { ...nextSettings, biometricUnlockEnabled: false };
    await BiometricAuthService.clearPassphrase();
    await state.store.get('settings').save(nextSettings);
  }

  await setLanguage(nextSettings.language);
  await PublicSettingsService.save(nextSettings);
  StyleSheet.build(resolveAppTheme(nextSettings.theme));

  setState({
    ...state,
    secrets: nextData.secrets,
    settings: nextSettings,
    security: state.store.security,
  });

  return nextData;
};
