import StyleSheet from 'react-native-extended-stylesheet';

import { detectDeviceLanguage, setLanguage } from '../../modules';
import { BiometricAuthService, NotificationsService, PublicSettingsService } from '../../services';
import { resolveAppTheme } from '../../theme';
import { DEFAULTS } from '../store.constants';

export const resetAppData = async ([state, setState]) => {
  const nextSettings = {
    ...DEFAULTS.settings,
    language: detectDeviceLanguage(),
  };

  await BiometricAuthService.clearPassphrase();
  await PublicSettingsService.clear();
  await state.store.destroy();
  StyleSheet.build(resolveAppTheme(nextSettings.theme));
  await setLanguage(nextSettings.language);
  await NotificationsService.reminders(nextSettings.reminders);

  setState({
    ...DEFAULTS,
    store: state.store,
    secrets: DEFAULTS.secrets,
    settings: nextSettings,
    security: state.store.security,
  });
};
