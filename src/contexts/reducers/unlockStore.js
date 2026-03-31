import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../../App.constants';
import { detectDeviceLanguage, setLanguage } from '../../modules';
import { PublicSettingsService } from '../../services';
import { resolveAppTheme } from '../../theme';

export const unlockStore = async (passphrase = '', [state, setState]) => {
  const nextData = await state.store.unlock(passphrase);
  const nextSettings = {
    ...nextData.settings,
    language: nextData.settings?.language || detectDeviceLanguage(),
    theme: nextData.settings?.theme || DEFAULT_THEME,
  };

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
