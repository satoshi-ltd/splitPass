import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../../App.constants';
import { detectDeviceLanguage, setLanguage } from '../../modules';
import { BiometricAuthService, PublicSettingsService } from '../../services';
import { normalizeThemePreference, resolveAppTheme } from '../../theme';

export const setupSecurity = async (passphrase = '', [state, setState]) => {
  const nextSettings = {
    ...state.settings,
    language: state.settings?.language || detectDeviceLanguage(),
    theme: normalizeThemePreference(state.settings?.theme || DEFAULT_THEME),
  };
  await BiometricAuthService.clearPassphrase();
  const nextData = await state.store.initializeSecurity(passphrase, {
    secrets: state.secrets,
    settings: nextSettings,
  });

  await setLanguage(nextSettings.language);
  await PublicSettingsService.save(nextData.settings);
  StyleSheet.build(resolveAppTheme(nextSettings.theme));

  setState({
    ...state,
    secrets: nextData.secrets,
    settings: nextData.settings,
    security: state.store.security,
  });

  return true;
};
