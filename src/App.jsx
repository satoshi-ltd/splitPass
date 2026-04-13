import { Doto_500Medium, Doto_700Bold, Doto_900Black } from '@expo-google-fonts/doto';
import { useFonts } from 'expo-font';
import {
  disableAppSwitcherProtectionAsync,
  enableAppSwitcherProtectionAsync,
  isAvailableAsync,
  preventScreenCaptureAsync,
} from 'expo-screen-capture';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navigator } from './App.Navigator';
import { DEFAULT_THEME } from './App.constants';
import { AppProvider, StoreProvider } from './contexts';
import { Notification } from './design-system';
import { resolveAppTheme } from './theme';

StyleSheet.build(resolveAppTheme(DEFAULT_THEME));

const logScreenCaptureError = (error) => {
  if (process.env.NODE_ENV === 'production') return;
  // eslint-disable-next-line no-console
  console.warn('[SplitPass] Screen capture protection is unavailable in this build.', error?.message || error);
};

export const App = () => {
  const [ready] = useFonts({
    'font-default': Doto_500Medium,
    'font-semibold': Doto_700Bold,
    'font-bold': Doto_900Black,
    'font-default-secondary': require('../assets/fonts/CanelaText-Regular.otf'),
    'font-bold-secondary': require('../assets/fonts/CanelaText-Bold.otf'),
  });

  useEffect(() => {
    let mounted = true;

    const activateProtection = async () => {
      try {
        const available = await isAvailableAsync();
        if (!mounted || !available) {
          if (!available) logScreenCaptureError('Native module missing. Rebuild the development app.');
          return;
        }

        if (Platform.OS === 'android') {
          await preventScreenCaptureAsync();
          return;
        }

        if (Platform.OS === 'ios') {
          await enableAppSwitcherProtectionAsync();
        }
      } catch (error) {
        logScreenCaptureError(error);
      }
    };

    activateProtection();

    return () => {
      mounted = false;

      if (Platform.OS === 'ios') {
        disableAppSwitcherProtectionAsync().catch(logScreenCaptureError);
      }
    };
  }, []);

  return ready ? (
    <SafeAreaProvider>
      <StoreProvider>
        <AppProvider>
          <Navigator />
          <Notification />
        </AppProvider>
      </StoreProvider>
    </SafeAreaProvider>
  ) : null;
};
