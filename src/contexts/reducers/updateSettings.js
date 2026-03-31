import StyleSheet from 'react-native-extended-stylesheet';

import { PublicSettingsService } from '../../services';
import { resolveAppTheme } from '../../theme';

export const updateSettings = async (value, [state, setState]) => {
  const nextSettings = { ...state.settings, ...value };
  await state.store.get('settings').save(nextSettings);
  await PublicSettingsService.save(nextSettings);
  if (value?.theme) StyleSheet.build(resolveAppTheme(nextSettings.theme));

  setState({ ...state, settings: nextSettings, security: state.store.security });
};
