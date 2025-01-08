import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { StorageService } from '../services';
import { DarkTheme, LightTheme } from '../theme';
import { consolidate } from './modules';
import {
  createSecret,
  readSecret,
  updateSecret,
  deleteSecret,
  updateSettings,
  updateSubscription,
  importBackup,
} from './reducers';
import { DEFAULTS, FILENAME } from './store.constants';
import { DEFAULT_THEME } from '../App.constants';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      const { theme } = await store.get('settings').value;
      StyleSheet.build(theme === DEFAULT_THEME ? LightTheme : DarkTheme);

      setState({
        store,
        secrets: await store.get('secrets')?.value,
        settings: await store.get('settings')?.value,
        subscription: await store.get('subscription')?.value,
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
        readSecret: (...props) => readSecret(...props, [state, setState]),
        updateSecret: (...props) => updateSecret(...props, [state, setState]),
        deleteSecret: (...props) => deleteSecret(...props, [state, setState]),
        //
        updateSettings: (...props) => updateSettings(...props, [state, setState]),
        updateSubscription: (...props) => updateSubscription(...props, [state, setState]),
        importBackup: (...props) => importBackup(...props, [state, setState]),
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
