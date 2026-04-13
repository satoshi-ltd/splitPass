import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../../App.constants';
import { detectDeviceLanguage, setLanguage } from '../../modules';
import { NotificationsService, PublicSettingsService } from '../../services';
import { normalizeThemePreference, resolveAppTheme } from '../../theme';
import { DEFAULTS } from '../store.constants';

export const importBackup = async ({ format = 'legacy', payload = {} } = {}, options = {}, [state, setState]) =>
  // eslint-disable-next-line no-undef, no-async-promise-executor
  new Promise(async (resolve, reject) => {
    try {
      const { store } = state;
      const passphrase = options?.passphrase || store.sessionPassphrase;
      const decrypted = format === 'encrypted' ? await store.decryptBackup(payload, passphrase) : payload;
      const nextSecrets = Array.isArray(decrypted?.secrets) ? decrypted.secrets : DEFAULTS.secrets;
      const incomingSettings = decrypted?.settings || {};
      const nextSettings = {
        ...DEFAULTS.settings,
        ...(incomingSettings || {}),
        language: incomingSettings?.language || state.settings?.language || detectDeviceLanguage(),
        theme: normalizeThemePreference(incomingSettings?.theme || state.settings?.theme || DEFAULT_THEME),
      };

      await store.replaceAll(
        {
          secrets: nextSecrets,
          settings: nextSettings,
        },
        store.sessionPassphrase || passphrase,
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
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
