import { useFonts } from 'expo-font';
import { Doto_500Medium, Doto_700Bold, Doto_900Black } from '@expo-google-fonts/doto';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navigator } from './App.Navigator';
import { AppProvider, StoreProvider } from './contexts';
import { Notification } from './design-system';
import { resolveAppTheme } from './theme';

StyleSheet.build(resolveAppTheme('light'));

export const App = () => {
  const [ready] = useFonts({
    'font-default': Doto_500Medium,
    'font-semibold': Doto_700Bold,
    'font-bold': Doto_900Black,
    'font-default-secondary': require('../assets/fonts/CanelaText-Regular.otf'),
    'font-bold-secondary': require('../assets/fonts/CanelaText-Bold.otf'),
  });

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
