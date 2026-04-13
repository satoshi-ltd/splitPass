import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { DEFAULT_THEME } from '../App.constants';
import { detectDeviceLanguage, setLanguage } from '../modules';
import { PublicSettingsService, StorageService } from '../services';
import { normalizeThemePreference, resolveAppTheme } from '../theme';
import { consolidate } from './modules';
import {
  createSecret,
  createSecrets,
  readSecret,
  updateSecret,
  deleteSecret,
  updateSettings,
  importBackup,
  resetAppData,
  setupSecurity,
  unlockStore,
  lockStore,
} from './reducers';
import { DEFAULTS, FILENAME } from './store.constants';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });
      const publicSettings = await PublicSettingsService.load();
      const preview = store.previewData;
      const storedSettings = preview?.settings || publicSettings || DEFAULTS.settings;
      const resolvedLanguage = storedSettings.language || detectDeviceLanguage();
      const resolvedThemePreference = normalizeThemePreference(storedSettings.theme || DEFAULT_THEME);

      await setLanguage(resolvedLanguage);
      StyleSheet.build(resolveAppTheme(resolvedThemePreference));

      setState({
        ...DEFAULTS,
        store,
        secrets: preview?.secrets || DEFAULTS.secrets,
        settings: { ...DEFAULTS.settings, ...storedSettings, language: resolvedLanguage, theme: resolvedThemePreference },
        security: store.security,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...consolidate(state),
        // -- secret
        createSecret: (...props) => createSecret(...props, [state, setState]),
        createSecrets: (...props) => createSecrets(...props, [state, setState]),
        readSecret: (...props) => readSecret(...props, [state, setState]),
        updateSecret: (...props) => updateSecret(...props, [state, setState]),
        deleteSecret: (...props) => deleteSecret(...props, [state, setState]),
        //
        updateSettings: (...props) => updateSettings(...props, [state, setState]),
        importBackup: (...props) => importBackup(...props, [state, setState]),
        resetAppData: (...props) => resetAppData(...props, [state, setState]),
        setupSecurity: (...props) => setupSecurity(...props, [state, setState]),
        unlockStore: (...props) => unlockStore(...props, [state, setState]),
        lockStore: (...props) => lockStore(...props, [state, setState]),
      }}
    >
      {state.store ? children : undefined}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStore = () => useContext(StoreContext);

export { StoreProvider, useStore };
