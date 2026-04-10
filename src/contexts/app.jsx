import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';

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
  const {
    lockStore,
    security: { configured, unlocked } = {},
    settings: { autoLockImmediatelyEnabled = false, autoLockSeconds = 30, language, onboarded, reminders, theme } = {},
  } = useStore();
  const resolvedLanguage = language || detectDeviceLanguage();
  const resolvedTheme = theme || DEFAULT_THEME;
  const autoLockTimerRef = useRef();
  const autoLockStateRef = useRef({
    configured,
    immediate: autoLockImmediatelyEnabled,
    lockStore,
    seconds: autoLockSeconds,
    unlocked,
  });
  const notificationsReadyRef = useRef(false);
  setLanguage(resolvedLanguage);

  useEffect(() => {
    autoLockStateRef.current = {
      configured,
      immediate: autoLockImmediatelyEnabled,
      lockStore,
      seconds: autoLockSeconds,
      unlocked,
    };
  }, [autoLockImmediatelyEnabled, autoLockSeconds, configured, lockStore, unlocked]);

  useEffect(() => {
    if (!onboarded) {
      notificationsReadyRef.current = false;
      return;
    }
    if (notificationsReadyRef.current) return;

    notificationsReadyRef.current = true;
    NotificationsService.init(reminders);
  }, [onboarded, reminders]);

  useEffect(() => {
    const clearAutoLock = () => {
      if (!autoLockTimerRef.current) return;

      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = undefined;
    };
    const scheduleAutoLock = () => {
      clearAutoLock();

      const { configured: ready, seconds, unlocked: open } = autoLockStateRef.current;

      if (!ready || !open || !Number.isFinite(Number(seconds)) || Number(seconds) <= 0) return;

      autoLockTimerRef.current = setTimeout(() => {
        const { configured: latestReady, lockStore: latestLock, unlocked: latestOpen } = autoLockStateRef.current;

        autoLockTimerRef.current = undefined;

        if (!latestReady || !latestOpen) return;

        const pendingLock = latestLock();
        if (pendingLock?.catch) pendingLock.catch(() => undefined);
      }, Number(seconds) * 1000);
    };

    const lockImmediately = () => {
      clearAutoLock();

      const { configured: ready, lockStore: latestLock, unlocked: open } = autoLockStateRef.current;
      if (!ready || !open) return;

      const pendingLock = latestLock();
      if (pendingLock?.catch) pendingLock.catch(() => undefined);
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        clearAutoLock();
        return;
      }

      if (nextState === 'background') {
        if (autoLockStateRef.current.immediate) lockImmediately();
        else scheduleAutoLock();
      }
    });

    return () => {
      clearAutoLock();
      subscription.remove();
    };
  }, []);

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
