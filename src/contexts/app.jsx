import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';

import { DEFAULT_THEME } from '../App.constants';
import { detectDeviceLanguage, formatDateTime, setLanguage, translate } from '../modules';
import { NotificationsService } from '../services';
import { getAppColors, theme as uiTheme } from '../theme';
import { useStore } from './store';

const AppContext = createContext({
  colors: getAppColors(DEFAULT_THEME),
  formatDate: (date) => formatDateTime(date, detectDeviceLanguage()),
  language: detectDeviceLanguage(),
  theme: DEFAULT_THEME,
  translate,
});

const AppProvider = ({ children }) => {
  const { settings: { language, onboarded, reminders, theme } = {} } = useStore();
  const resolvedLanguage = language || detectDeviceLanguage();
  const resolvedTheme = theme || DEFAULT_THEME;
  const notificationsReadyRef = useRef(false);
  setLanguage(resolvedLanguage);

  useEffect(() => {
    if (!onboarded) {
      notificationsReadyRef.current = false;
      return;
    }
    if (notificationsReadyRef.current) return;

    notificationsReadyRef.current = true;
    NotificationsService.init(reminders);
  }, [onboarded, reminders]);

  const formatDate = useMemo(
    () =>
      (date, options = {}) =>
        formatDateTime(date, resolvedLanguage, options),
    [resolvedLanguage],
  );

  const value = useMemo(
    () => ({
      colors: getAppColors(resolvedTheme),
      formatDate,
      language: resolvedLanguage,
      theme: resolvedTheme,
      translate,
      uiTheme,
    }),
    [formatDate, resolvedLanguage, resolvedTheme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useApp = () => useContext(AppContext);

export { AppProvider, useApp };
