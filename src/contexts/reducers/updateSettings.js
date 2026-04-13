import StyleSheet from 'react-native-extended-stylesheet';

import { PublicSettingsService } from '../../services';
import { normalizeThemePreference, resolveAppTheme } from '../../theme';

export const updateSettings = async (value, [state, setState]) => {
  const nextTheme =
    value && Object.prototype.hasOwnProperty.call(value, 'theme')
      ? normalizeThemePreference(value.theme)
      : state.settings?.theme;
  const nextSettings = { ...state.settings, ...value, theme: nextTheme };
  await state.store.get('settings').save(nextSettings);
  await PublicSettingsService.save(nextSettings);
  if (value?.theme) StyleSheet.build(resolveAppTheme(nextSettings.theme));

  setState({ ...state, settings: nextSettings, security: state.store.security });
};
