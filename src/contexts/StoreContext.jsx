import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

import { OnboardingService, VaultService } from '../services';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState({
    ready: false,
  });

  useLayoutEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    setState({
      ready: true,
      qrs: await VaultService.get(),
      onboarded: await OnboardingService.get(),
    });
  };

  const addQr = async (qr, name, timestamp) => {
    await VaultService.add(qr, name, timestamp);
    fetch();
  };

  const removeQr = async (qr) => {
    VaultService.remove(qr);
    fetch();
  };

  const setOnboarded = (value) => {
    OnboardingService.set(value);
    fetch();
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        addQr,
        removeQr,
        setOnboarded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStore = () => useContext(StoreContext);

export { StoreProvider, useStore };
